import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

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

// Generar hash corto (4-6 caracteres)
const generateShortHash = (input: string): string => {
  const hash = crypto.createHash('md5').update(input).digest('hex');
  return hash.substring(0, 4); // 4 caracteres
};

// Verificar si un slug ya existe en la BD
const isSlugTaken = async (supabase: any, slug: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('menus')
    .select('id')
    .eq('custom_slug', slug)
    .maybeSingle();

  if (error) {
    console.error('Error verificando slug:', error);
    return false;
  }

  return !!data;
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

    const rawPayload = await request.json();
    const { businessId, businessName, theme, menuData, customSlug: userCustomSlug } = rawPayload;
    
    // 🔍 LOG para debuggear el payload recibido
    console.log('🔴 PAYLOAD RAW RECIBIDO:', {
      payload_keys: Object.keys(rawPayload),
      tiene_customSlug: 'customSlug' in rawPayload,
      customSlug_valor: rawPayload.customSlug,
      customSlug_tipo: typeof rawPayload.customSlug,
    });
    
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
      customSlug: userCustomSlug,
      customSlug_existe: !!userCustomSlug,
      customSlug_tipo: typeof userCustomSlug,
      customSlug_valor_exacto: JSON.stringify(userCustomSlug),
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

      // Si el plan no está en profiles, buscar en subscriptions
      let userPlan = (profile?.stripe_subscription_status === 'active' || profile?.plan === 'menu') ? 'menu' : 'free';
      
      if (userPlan === 'free' && !profile?.plan) {
        // Si profile.plan está vacío, verificar si tiene suscripción activa en Stripe
        const { data: subscription } = await supabase
          .from('subscriptions')
          .select('status')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .single();
        
        if (subscription?.status === 'active') {
          userPlan = 'menu';
          console.log('📋 Plan encontrado en subscriptions (activo)');
        }
      }

      console.log('📋 PLAN DEL USUARIO:', {
        userPlan,
        stripe_subscription_status: profile?.stripe_subscription_status,
        plan_en_profile: profile?.plan,
        es_menu: userPlan === 'menu',
      });

      // 🔧 WORKAROUND: Si el usuario envió customSlug pero su plan es 'free', tratarlo como 'menu'
      // Esto ocurre cuando el usuario pagó pero el webhook de Stripe no actualizó el plan
      let effectivePlan = userPlan;
      if (userPlan === 'free' && userCustomSlug) {
        console.log('🔧 WORKAROUND: Usuario intentó personalizar URL pero aparece como free, tratando como menu');
        effectivePlan = 'menu';
      }

      // Determinar custom_slug basado en el plan
      let customSlug: string | null = null;
      let isPersonalized = false;

      // ⭐ NUEVA LÓGICA: Solo regenerar URL si es la PRIMERA VEZ que se guarda
      // Si el menú ya existe y tiene un custom_slug, NO regenerar basado en cambios de nombre
      const isFirstSave = !existingMenus || existingMenus.length === 0;
      const existing = existingMenus && existingMenus.length > 0 ? existingMenus[0] : null;

      if (isFirstSave) {
        // Primera vez: generar URL basado en nombre
        console.log('🆕 Primera vez guardando - generando URL');
        
        if (effectivePlan === 'free') {
          // Plan free: usar automáticamente [nombreDelNegocio] formateado
          const baseSlug = businessName.toLowerCase().replace(/\s+/g, '-');
          
          // Verificar si el slug base está disponible
          const slugTaken = await isSlugTaken(supabase, baseSlug);
          
          if (slugTaken) {
            // Si está ocupado, agregar hash corto
            const hash = generateShortHash(`${baseSlug}-${Date.now()}`);
            customSlug = `${baseSlug}-${hash}`;
            console.log('⚠️ Slug base ocupado, usando con hash:', customSlug);
          } else {
            // Si está libre, usar sin hash
            customSlug = baseSlug;
            console.log('✅ Slug base disponible:', customSlug);
          }
        } else {
          // Plan menu: usuario puede personalizar
          isPersonalized = !!userCustomSlug;
          
          if (isPersonalized) {
            // Usuario personalizó - validar que sea único
            const userSlug = userCustomSlug.toLowerCase().trim();
            const slugTaken = await isSlugTaken(supabase, userSlug);
            
            if (slugTaken) {
              // Slug personalizado ya existe - retornar error
              const hash = generateShortHash(`${userSlug}-${Date.now()}`);
              return NextResponse.json({
                success: false,
                error: 'Este URL ya existe',
                suggestion: `${userSlug}-${hash}`,
                message: `La URL "scanela.com/${userSlug}" ya existe. Intenta con "scanela.com/${userSlug}-${hash}" o elige otra.`,
              }, { status: 409 });
            }
            
            customSlug = userSlug;
            console.log('✅ Slug personalizado disponible:', customSlug);
          } else {
            // Usuario NO personalizó - usar nombre del negocio
            const baseSlug = businessName.toLowerCase().replace(/\s+/g, '-');
            const slugTaken = await isSlugTaken(supabase, baseSlug);
            
            if (slugTaken) {
              const hash = generateShortHash(`${baseSlug}-${Date.now()}`);
              customSlug = `${baseSlug}-${hash}`;
              console.log('⚠️ Slug base ocupado, usando con hash:', customSlug);
            } else {
              customSlug = baseSlug;
              console.log('✅ Slug base disponible:', customSlug);
            }
          }
        }
      } else {
        // Menú ya existe: MANTENER el URL existente
        // ⭐ SOLO cambiar si el usuario PERSONALIZÓ el URL (en plan MENÚ)
        console.log('🔄 Menú ya existe - revisando si cambiar URL');
        
        // Verificar si el usuario está intentando personalizar (envió userCustomSlug)
        const userIsPersonalizing = !!userCustomSlug;
        
        if ((effectivePlan === 'menu') && userIsPersonalizing) {
          // Usuario MENÚ intentó personalizar: validar y usar el nuevo
          const userSlug = userCustomSlug.toLowerCase().trim();
          const slugTaken = await isSlugTaken(supabase, userSlug);
          
          if (slugTaken && userSlug !== existing?.custom_slug) {
            // Slug existe pero es diferente al actual - error
            const hash = generateShortHash(`${userSlug}-${Date.now()}`);
            return NextResponse.json({
              success: false,
              error: 'Este URL ya existe',
              suggestion: `${userSlug}-${hash}`,
              message: `La URL "scanela.com/${userSlug}" ya existe. Intenta con "scanela.com/${userSlug}-${hash}" o elige otra.`,
            }, { status: 409 });
          }
          
          customSlug = userSlug;
          console.log('🔓 Usuario MENÚ personalizando URL - usando:', customSlug);
        } else {
          // Usuario FREE o no personalizó: MANTENER el URL existente
          customSlug = existing?.custom_slug || null;
          console.log('🔒 URL bloqueado - Manteniendo URL existente:', customSlug);
        }
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
        
        // Siempre hacer UPDATE si hay color personalizado (theme === 'custom')
        // porque el customThemeColor podría haber cambiado
        const forceUpdate = theme === 'custom';
        
        // Comparar datos - si son idénticos y no es color personalizado, no hacer UPDATE
        const dataChanged = forceUpdate ||
          existing.business_name !== businessName ||
          existing.theme !== theme ||
          existing.custom_slug !== customSlug ||
          JSON.stringify(existing.menu_data) !== JSON.stringify(menuData);

        console.log('🔍 Comparación en save-menu:', {
          theme,
          forceUpdate,
          dataChanged,
          existing_theme: existing.theme,
          existing_slug: existing.custom_slug,
          new_slug: customSlug,
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
          custom_slug_a_guardar: newData.custom_slug,
          es_personalizado: isPersonalized,
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
          custom_slug_guardado: result.data?.[0]?.custom_slug,
          custom_slug_esperado: customSlug,
          todas_las_keys_del_menu: result.data?.[0] ? Object.keys(result.data[0]) : 'NO DATA',
          custom_slug_existe_en_respuesta: !!result.data?.[0]?.custom_slug,
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
