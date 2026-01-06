import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const getStoragePublicPrefix = () => {
  if (!supabaseUrl) return '';
  return `${supabaseUrl.replace(/\/$/, '')}/storage/v1/object/public/menu-images/`;
};

const extractStoragePathFromUrl = (url: string) => {
  const prefix = getStoragePublicPrefix();
  if (!prefix || !url.startsWith(prefix)) return null;
  const relativePath = url.slice(prefix.length);
  return decodeURIComponent(relativePath);
};

const createAdminClient = () => {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Supabase admin credentials missing');
  }
  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

export async function POST(request: NextRequest) {
  try {
    // Obtener token del usuario
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Supabase environment variables missing for upload');
      return NextResponse.json(
        { success: false, error: 'Configuración del servidor incompleta' },
        { status: 500 }
      );
    }

    // Crear cliente con token del usuario
    const supabase = createClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        global: {
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
      }
    );

  const formData = await request.formData();
  const file = formData.get('file') as File;
  const productName = formData.get('productName') as string;
  const businessId = formData.get('businessId') as string;
  const productId = formData.get('productId') as string;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!businessId || !productId) {
      return NextResponse.json(
        { success: false, error: 'businessId and productId are required' },
        { status: 400 }
      );
    }

    const timestamp = Date.now();
    // Sanitizar el nombre del producto: remover acentos y caracteres especiales
    const sanitizedName = productName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remover acentos
      .replace(/[^a-zA-Z0-9]/g, '-') // Reemplazar caracteres especiales por guión
      .replace(/-+/g, '-') // Reemplazar múltiples guiones por uno solo
      .toLowerCase();
    const fileName = `${sanitizedName}-${timestamp}.jpg`;
    // Sanitizar productId para que solo tenga caracteres válidos en Storage
    const sanitizedProductId = String(productId).replace(/[^a-zA-Z0-9-_]/g, '');
    const filePath = `menus/${businessId}/${sanitizedProductId}/${fileName}`;

    const buffer = await file.arrayBuffer();

    const { data, error } = await supabase.storage
      .from('menu-images')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error('Storage error:', error);
      return NextResponse.json(
        { success: false, error: 'Error uploading: ' + error.message },
        { status: 500 }
      );
    }

    const { data: { publicUrl } } = supabase.storage
      .from('menu-images')
      .getPublicUrl(filePath);

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName,
      path: filePath,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Upload failed' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { success: false, error: 'Configuración del servidor incompleta' },
        { status: 500 }
      );
    }

    if (!supabaseServiceRoleKey) {
      return NextResponse.json(
        { success: false, error: 'Service role no configurado' },
        { status: 500 }
      );
    }

    const token = authHeader.substring(7);
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Validar sesión para asegurar que el usuario es válido
    const { data: { user }, error: sessionError } = await supabase.auth.getUser(token);
    if (sessionError || !user) {
      return NextResponse.json(
        { success: false, error: 'Sesión inválida' },
        { status: 401 }
      );
    }

    const { imageUrl, businessId, storagePath } = await request.json();
    let resolvedPath = storagePath || (imageUrl ? extractStoragePathFromUrl(imageUrl) : null);

    if (!resolvedPath) {
      return NextResponse.json(
        { success: false, error: 'URL inválida' },
        { status: 400 }
      );
    }

    if (businessId) {
      const expectedPrefix = `menus/${businessId}/`;
      if (!resolvedPath.startsWith(expectedPrefix)) {
        return NextResponse.json(
          { success: false, error: 'La imagen no pertenece a este negocio' },
          { status: 403 }
        );
      }
    }

    const adminClient = createAdminClient();
    const { error: deleteError } = await adminClient.storage
      .from('menu-images')
      .remove([resolvedPath]);

    if (deleteError) {
      console.error('Error deleting image:', deleteError);
      return NextResponse.json(
        { success: false, error: 'No se pudo eliminar la imagen' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, deleted: true });
  } catch (error) {
    console.error('Delete image error:', error);
    return NextResponse.json(
      { success: false, error: 'Error al eliminar imagen' },
      { status: 500 }
    );
  }
}
