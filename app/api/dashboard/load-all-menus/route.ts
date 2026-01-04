import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'No autorizado', menus: null },
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
      JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()).sub
    );
    
    if (error || !user) {
      return NextResponse.json(
        { success: true, menus: [] },
        { status: 200 }
      );
    }

    // Cargar TODOS los menús del usuario, ordenados por business_id
    const { data: menus, error: loadError } = await supabase
      .from('menus')
      .select('id, business_id, business_name, theme, menu_data, created_at, updated_at')
      .eq('user_id', user.id)
      .order('business_id', { ascending: true });

    if (loadError) {
      console.error('Error loading menus:', loadError);
      return NextResponse.json(
        { success: true, menus: [] },
        { status: 200 }
      );
    }

    return NextResponse.json({
      success: true,
      menus: menus || [],
    });
  } catch (error) {
    console.error('Error in load-all-menus:', error);
    return NextResponse.json(
      { success: true, menus: [] },
      { status: 200 }
    );
  }
}
