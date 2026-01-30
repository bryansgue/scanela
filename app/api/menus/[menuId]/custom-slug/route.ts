import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://scanela.com').replace(/\/$/, '');
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const getSupabaseAdmin = () => {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    throw new Error('Supabase credentials are not configured');
  }
  return createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
};

const decodeUserIdFromToken = (token: string) => {
  try {
    const [, payload] = token.split('.');
    if (!payload) return null;
    const decoded = Buffer.from(payload, 'base64').toString('utf8');
    const parsed = JSON.parse(decoded);
    return parsed?.sub as string | null;
  } catch {
    return null;
  }
};

const sanitizeSlug = (value: string) => {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

export async function PATCH(
  request: NextRequest,
  { params }: { params: { menuId: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const userId = decodeUserIdFromToken(token);
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Sesión inválida' }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    const { data: authData, error: authError } = await supabase.auth.admin.getUserById(userId);
    if (authError || !authData?.user) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
    }

    const { customSlug } = (await request.json()) as { customSlug?: string };
    if (typeof customSlug !== 'string') {
      return NextResponse.json({ success: false, error: 'Slug inválido' }, { status: 400 });
    }

    const normalizedSlug = sanitizeSlug(customSlug);
    if (!normalizedSlug) {
      return NextResponse.json(
        { success: false, error: 'Ingresa una URL válida con letras, números o guiones' },
        { status: 400 }
      );
    }

    if (normalizedSlug.length > 50) {
      return NextResponse.json(
        { success: false, error: 'La URL no puede superar 50 caracteres' },
        { status: 400 }
      );
    }

    const { menuId } = params;
    if (!menuId) {
      return NextResponse.json({ success: false, error: 'Menú no encontrado' }, { status: 400 });
    }

    const { data: menu, error: menuError } = await supabase
      .from('menus')
      .select('id, user_id')
      .eq('id', menuId)
      .maybeSingle();

    if (menuError) {
      console.error('Error buscando menú para slug:', menuError);
      return NextResponse.json({ success: false, error: 'No se pudo validar el menú' }, { status: 500 });
    }

    if (!menu || menu.user_id !== authData.user.id) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 403 });
    }

    const { data: slugOwner, error: slugError } = await supabase
      .from('menus')
      .select('id')
      .eq('custom_slug', normalizedSlug)
      .neq('id', menu.id)
      .maybeSingle();

    if (slugError) {
      console.error('Error verificando slug único:', slugError);
      return NextResponse.json({ success: false, error: 'No se pudo validar la URL' }, { status: 500 });
    }

    if (slugOwner) {
      return NextResponse.json(
        { success: false, error: 'Esta URL ya está en uso. Prueba con otra.' },
        { status: 409 }
      );
    }

    const { data: updateResult, error: updateError } = await supabase
      .from('menus')
      .update({ custom_slug: normalizedSlug, updated_at: new Date().toISOString() })
      .eq('id', menu.id)
      .select('custom_slug')
      .single();

    if (updateError || !updateResult) {
      console.error('Error actualizando slug:', updateError);
      return NextResponse.json({ success: false, error: 'No se pudo guardar la URL' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      customSlug: updateResult.custom_slug,
      shareUrl: `${SITE_URL}/${updateResult.custom_slug}`,
    });
  } catch (error) {
    console.error('Error en PATCH /menus/[menuId]/custom-slug:', error);
    return NextResponse.json(
      { success: false, error: 'Error inesperado al guardar la URL' },
      { status: 500 }
    );
  }
}
