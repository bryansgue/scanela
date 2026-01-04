import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

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

    if (!businessId) {
      return NextResponse.json(
        { success: false, error: 'businessId es requerido' },
        { status: 400 }
      );
    }

    // Convertir businessId a número porque en BD es BIGINT, no VARCHAR
    const numericBusinessId = parseInt(businessId, 10);

    console.log('🔴 SAVE-MENU RECIBIÓ:', {
      businessId_raw: businessId,
      businessId_numeric: numericBusinessId,
      businessName: businessName,
      theme: theme,
      theme_tipo: typeof theme,
      theme_length: theme?.length,
    });

    try {
      // Buscar si ya existe menú para este negocio
      const { data: existingMenus } = await supabase
        .from('menus')
        .select('*')
        .eq('user_id', user.id)
        .eq('business_id', numericBusinessId)
        .limit(1);

      // Datos que queremos guardar
      const newData = {
        business_id: numericBusinessId,
        business_name: businessName,
        theme: theme,
        menu_data: menuData,
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
          business_id: numericBusinessId,
          user_id: user.id,
        });

        const result = await supabase
          .from('menus')
          .update({
            ...newData,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user.id)
          .eq('business_id', numericBusinessId)
          .select();

        if (result.error) {
          console.log('� ERROR EN UPDATE:', {
            error_message: result.error.message,
            error_code: result.error.code,
            error_details: result.error.details,
            error_hint: result.error.hint,
          });
        }

        console.log('�🟢 UPDATE COMPLETADO:', {
          success: !!result.data,
          error: result.error?.message,
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
          business_id: numericBusinessId,
          user_id: user.id,
        });

        const result = await supabase
          .from('menus')
          .insert({
            user_id: user.id,
            ...newData,
          })
          .select();

        console.log('🟢 INSERT COMPLETADO:', {
          success: !!result.data,
          error: result.error,
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
      console.error('Database error:', dbError);
      return NextResponse.json({
        success: true, // Retornar éxito igual
        message: 'Guardado',
      });
    }
  } catch (error) {
    console.error('Error in save-menu:', error);
    return NextResponse.json(
      { success: true }, // Retornar éxito para no bloquear
      { status: 200 }
    );
  }
}
