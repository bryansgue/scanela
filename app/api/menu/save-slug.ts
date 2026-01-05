import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  {
    auth: {
      persistSession: false,
    },
  }
);

// Validar slug: máximo 50 caracteres, solo alfanuméricos y guiones
function validateSlug(slug: string): { valid: boolean; error?: string } {
  if (!slug || slug.length === 0) {
    return { valid: true }; // Slug vacío es válido (sin personalizar)
  }

  if (slug.length > 50) {
    return { valid: false, error: 'El slug no puede exceder 50 caracteres' };
  }

  if (!/^[a-z0-9-]+$/.test(slug)) {
    return {
      valid: false,
      error: 'El slug solo puede contener letras minúsculas, números y guiones',
    };
  }

  if (slug.startsWith('-') || slug.endsWith('-')) {
    return {
      valid: false,
      error: 'El slug no puede comenzar ni terminar con un guión',
    };
  }

  if (slug.includes('--')) {
    return {
      valid: false,
      error: 'El slug no puede contener guiones consecutivos',
    };
  }

  return { valid: true };
}

export async function POST(request: NextRequest) {
  try {
    const { slug, businessId, userId } = await request.json();

    // Validar slug
    const validation = validateSlug(slug);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Si el slug está vacío, eliminar el slug existente
    if (!slug || slug.trim() === '') {
      const { error: deleteError } = await supabase
        .from('menu_slugs')
        .delete()
        .eq('business_id', businessId)
        .eq('user_id', userId);

      if (deleteError) throw deleteError;

      return NextResponse.json({
        success: true,
        message: 'Slug eliminado',
      });
    }

    // Verificar si el slug ya existe para otro negocio del usuario
    const { data: existingSlug, error: checkError } = await supabase
      .from('menu_slugs')
      .select('id, business_id')
      .eq('slug', slug)
      .eq('user_id', userId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    // Si el slug existe pero es del mismo negocio, actualizar
    if (existingSlug && existingSlug.business_id === businessId) {
      const { error: updateError } = await supabase
        .from('menu_slugs')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', existingSlug.id);

      if (updateError) throw updateError;

      return NextResponse.json({
        success: true,
        message: 'Slug actualizado',
        slug,
      });
    }

    // Si existe para otro negocio, es un conflicto
    if (existingSlug && existingSlug.business_id !== businessId) {
      return NextResponse.json(
        { error: 'Este slug ya está en uso por otro negocio' },
        { status: 409 }
      );
    }

    // Crear nuevo slug
    const { data, error: insertError } = await supabase
      .from('menu_slugs')
      .insert({
        slug,
        business_id: businessId,
        user_id: userId,
      })
      .select()
      .single();

    if (insertError) {
      // Verificar si es error de slug duplicado
      if (insertError.code === '23505') {
        return NextResponse.json(
          { error: 'Este slug ya está en uso' },
          { status: 409 }
        );
      }
      throw insertError;
    }

    return NextResponse.json({
      success: true,
      message: 'Slug guardado correctamente',
      slug,
    });
  } catch (error: any) {
    console.error('Error saving slug:', error);
    return NextResponse.json(
      { error: 'Error al guardar el slug' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const businessId = request.nextUrl.searchParams.get('businessId');
    const userId = request.nextUrl.searchParams.get('userId');

    if (!businessId || !userId) {
      return NextResponse.json(
        { error: 'businessId y userId son requeridos' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('menu_slugs')
      .select('slug')
      .eq('business_id', businessId)
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return NextResponse.json({
      slug: data?.slug || null,
    });
  } catch (error: any) {
    console.error('Error fetching slug:', error);
    return NextResponse.json(
      { error: 'Error al obtener el slug' },
      { status: 500 }
    );
  }
}
