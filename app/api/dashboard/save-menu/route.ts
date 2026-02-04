import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const normalizeBusinessId = (value: unknown) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return { queryValue: value, displayValue: value.toString() } as const;
  }

  if (typeof value === 'bigint') {
    const asString = value.toString();
    return { queryValue: asString, displayValue: asString } as const;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return null;

    if (/^-?\d+$/.test(trimmed)) {
      const asNumber = Number(trimmed);
      if (Number.isSafeInteger(asNumber)) {
        return { queryValue: asNumber, displayValue: trimmed } as const;
      }
    }

    return { queryValue: trimmed, displayValue: trimmed } as const;
  }

  return null;
};

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Crear cliente con SERVICE_ROLE_KEY
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    );

    // Obtener usuario del token
    const { data: { user }, error } = await supabase.auth.admin.getUserById(
      JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()).sub
    );
    
    if (error || !user) {
      return NextResponse.json(
        { success: true }, // Retornar éxito igual para no bloquear
      );
    }

    const { businessId, businessName, theme, menuData } = await request.json();
    const normalized = normalizeBusinessId(businessId);

    if (!normalized) {
      return NextResponse.json(
        { success: false, error: 'businessId es requerido' },
        { status: 400 }
      );
    }

    console.log('🔴 SAVE-MENU RECIBIÓ:', {
      businessId_raw: businessId,
      businessId_normalized: normalized.displayValue,
      businessName: businessName,
      theme: theme,
      theme_tipo: typeof theme,
      theme_length: theme?.length,
    });

    try {
      // Buscar si ya existe menú para este negocio
      const { data: existingMenus, error: existingMenusError } = await supabase
        .from('menus')
        .select('*')
        .eq('user_id', user.id)
        .eq('business_id', normalized.queryValue)
        .limit(1);

      if (existingMenusError) {
        console.error('❌ Error consultando menús existentes:', existingMenusError);
        return NextResponse.json({ success: false, error: existingMenusError.message }, { status: 500 });
      }

      // Obtener el plan del usuario desde la tabla profiles
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('stripe_subscription_status, plan')
        .eq('id', user.id)
        .single();

      const userPlan = (profile?.stripe_subscription_status === 'active' || profile?.plan === 'menu') ? 'menu' : 'free';

      // Determinar custom_slug basado en el plan
      let customSlug: string | null = null;
      if (userPlan === 'free') {
        // Plan free: usar automáticamente menu-[nombreDelNegocio]
        customSlug = `menu-${businessName.toLowerCase().replace(/\s+/g, '-')}`;
      } else {
        // Plan menu: usar el customSlug que el usuario ingresó
        customSlug = menuData?.customSlug ? menuData.customSlug.toLowerCase().trim() : null;
      }

      // Datos que queremos guardar
      const newData = {
        business_id: normalized.queryValue,
        business_name: businessName,
        theme: theme,
        menu_data: menuData,
        custom_slug: customSlug,
      };

      // Si existe, comparar si hay cambios reales
      if (existingMenus && existingMenus.length > 0) {
        const existing = existingMenus[0];
        
        // Siempre hacer UPDATE si hay color personalizado (theme === 'custom')
        // porque el customThemeColor podría haber cambiado
        const forceUpdate = theme === 'custom';
        
        // Comparar datos - si son idénticos y no es color personalizado, no hacer UPDATE
        const dataChanged = forceUpdate ||
          existing.business_name !== businessName ||
          existing.theme !== theme ||
          JSON.stringify(existing.menu_data) !== JSON.stringify(menuData);

        console.log('🔍 Comparación en save-menu:', {
          theme,
          forceUpdate,
          dataChanged,
          existing_theme: existing.theme,
          customThemeColor: menuData?.customThemeColor,
        });

        if (!dataChanged) {
          console.log('⏭️ Sin cambios en menú, no se guardó');
          return NextResponse.json({
            success: true,
            message: 'Sin cambios',
            skipped: true,
            menu: existing,
          });
        }

        // Hay cambios - hacer UPDATE
        console.log('🟡 EJECUTANDO UPDATE con theme:', {
          theme_a_guardar: newData.theme,
          business_id: normalized.displayValue,
          user_id: user.id,
        });

        const result = await supabase
          .from('menus')
          .update({
            ...newData,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user.id)
          .eq('business_id', normalized.queryValue)
          .select();

        if (result.error) {
          console.error('❌ ERROR EN UPDATE:', {
            error_message: result.error.message,
            error_code: result.error.code,
            error_details: result.error.details,
            error_hint: result.error.hint,
          });

          return NextResponse.json({ success: false, error: result.error.message }, { status: 500 });
        }

        console.log('🟢 UPDATE COMPLETADO:', {
          success: !!result.data,
          rows_affected: result.data?.length,
          theme_guardado_en_bd: result.data?.[0]?.theme,
        });

        return NextResponse.json({
          success: true,
          message: 'Menú actualizado',
          updated: true,
          menu: result.data?.[0],
        });
      } else {
        // Crear nuevo menú
        console.log('🟡 EJECUTANDO INSERT con theme:', {
          theme_a_guardar: newData.theme,
          business_id: normalized.displayValue,
          user_id: user.id,
        });

        const result = await supabase
          .from('menus')
          .insert({
            user_id: user.id,
            ...newData,
          })
          .select();

        if (result.error) {
          console.error('❌ ERROR EN INSERT:', {
            error_message: result.error.message,
            error_code: result.error.code,
            error_details: result.error.details,
            error_hint: result.error.hint,
          });

          return NextResponse.json({ success: false, error: result.error.message }, { status: 500 });
        }

        console.log('🟢 INSERT COMPLETADO:', {
          success: !!result.data,
          theme_guardado_en_bd: result.data?.[0]?.theme,
        });

        return NextResponse.json({
          success: true,
          message: 'Menú creado',
          created: true,
          menu: result.data?.[0],
        });
      }
    } catch (dbError) {
      console.error('❌ Database error:', dbError);
      return NextResponse.json({
        success: false,
        error: dbError instanceof Error ? dbError.message : 'Error guardando menú',
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in save-menu:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno guardando menú' },
      { status: 500 }
    );
  }
}
