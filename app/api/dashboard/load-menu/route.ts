import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

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
    const businessId = searchParams.get('businessId');

    if (!businessId) {
      return NextResponse.json(
        { success: false, error: 'businessId es requerido', menu: null },
        { status: 400 }
      );
    }

    // Cargar menú usando SERVICE_ROLE para el negocio específico
    const numericBusinessId = parseInt(businessId);
    console.log('🔍 BUSCANDO en BD:', {
      user_id: user.id,
      business_id: numericBusinessId,
      business_id_tipo: typeof numericBusinessId,
    });

    const { data: menus, error: loadError } = await supabase
      .from('menus')
      .select('id, business_id, business_name, theme, menu_data, created_at, updated_at')
      .eq('user_id', user.id)
      .eq('business_id', numericBusinessId)
      .order('updated_at', { ascending: false })
      .limit(1);

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
