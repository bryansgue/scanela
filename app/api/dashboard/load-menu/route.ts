import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const normalizeBusinessId = (value: string | number | bigint | null | undefined) => {
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

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'No autorizado', menu: null },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Crear cliente con SERVICE_ROLE_KEY para acceso admin
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    );

    // Obtener usuario del token
    const { data: { user }, error } = await supabase.auth.admin.getUserById(
      // Extraer user_id del JWT payload
      JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()).sub
    );
    
    if (error || !user) {
      return NextResponse.json(
        { success: true, menu: null }, // Retornar éxito con null si no hay usuario
      );
    }

    // Obtener businessId del query string
    const searchParams = request.nextUrl.searchParams;
    const businessIdParam = searchParams.get('businessId');
    const normalized = normalizeBusinessId(businessIdParam);

    if (!normalized) {
      return NextResponse.json(
        { success: false, error: 'businessId es requerido', menu: null },
        { status: 400 }
      );
    }

    // Cargar menú usando SERVICE_ROLE para el negocio específico
    console.log('🔍 BUSCANDO en BD:', {
      user_id: user.id,
      business_id: normalized.displayValue,
      business_id_tipo: typeof normalized.queryValue,
    });

    const { data: menus, error: loadError } = await supabase
      .from('menus')
      .select('id, business_id, business_name, theme, menu_data, created_at, updated_at')
      .eq('user_id', user.id)
      .eq('business_id', normalized.queryValue)
      .order('updated_at', { ascending: false })
      .limit(1);

    if (loadError) {
      console.error('❌ Error consultando menú:', loadError);
      return NextResponse.json(
        { success: false, error: loadError.message, menu: null },
        { status: 500 }
      );
    }

    console.log('📊 RESULTADOS DE BÚSQUEDA:', {
      cantidad_registros: menus?.length || 0,
      todos_los_registros: menus?.map((m: any) => ({
        id: m.id,
        business_id: m.business_id,
        theme: m.theme,
        updated_at: m.updated_at,
      })),
      error: loadError,
    });

    if (menus && menus.length > 0) {
      console.log('✅ USANDO REGISTRO:', {
        id: menus[0].id,
        business_id: menus[0].business_id,
        theme: menus[0].theme,
        theme_tipo: typeof menus[0].theme,
        theme_length: menus[0].theme?.length,
      });
      
      return NextResponse.json({
        success: true,
        menu: menus[0],
      });
    }

    return NextResponse.json({
      success: true,
      menu: null,
    });
  } catch (error) {
    console.error('Error in load-menu:', error);
    return NextResponse.json(
      { success: true, menu: null }, // Retornar éxito igualmente
      { status: 200 }
    );
  }
}
