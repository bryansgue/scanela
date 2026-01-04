import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

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

    // Crear cliente con token del usuario
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Upload failed' },
      { status: 500 }
    );
  }
}
