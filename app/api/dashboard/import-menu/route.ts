import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { userId, menuData } = await req.json();

    if (!userId || !menuData) {
      return NextResponse.json(
        { error: 'userId y menuData son requeridos' },
        { status: 400 }
      );
    }

    // Validar estructura mínima
    if (!menuData.business_name || !menuData.categories || !Array.isArray(menuData.categories)) {
      return NextResponse.json(
        { error: 'menuData debe contener business_name y categories' },
        { status: 400 }
      );
    }

    // Procesar y guardar en BD
    const { data, error } = await supabase
      .from('menus')
      .insert({
        user_id: userId,
        business_name: menuData.business_name,
        theme: menuData.theme || 'orange',
        menu_data: menuData.categories,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error insertando menú:', error);
      return NextResponse.json(
        { error: 'Error al guardar el menú' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Menú importado exitosamente',
        menu_id: data.id,
        business_name: data.business_name,
        categories_count: menuData.categories.length,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error en import-menu:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
