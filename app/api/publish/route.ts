import { NextRequest, NextResponse } from 'next/server';

/**
 * API Mock para simular publicación
 * POST /api/publish
 * 
 * Parámetros:
 * - title: string
 * - description: string
 * - networks: string[]
 * - userId: string
 * - profileId: string
 * 
 * Respuesta:
 * {
 *   status: 'success' | 'failed',
 *   post_urls: Record<string, string>
 * }
 */

function simulatePublishUrls(networks: string[]): Record<string, string> {
  const urls: Record<string, string> = {};

  networks.forEach((network) => {
    const randomId = Math.random().toString(36).substring(2, 11);
    
    switch (network.toLowerCase()) {
      case 'instagram':
        urls[network] = `https://instagram.com/p/${randomId}`;
        break;
      case 'tiktok':
        urls[network] = `https://tiktok.com/@syncuenta/video/${randomId}`;
        break;
      case 'x':
      case 'twitter':
        urls[network] = `https://x.com/syncuenta/status/${randomId}`;
        break;
      case 'facebook':
        urls[network] = `https://facebook.com/syncuenta/posts/${randomId}`;
        break;
      case 'linkedin':
        urls[network] = `https://linkedin.com/feed/update/urn:li:activity:${randomId}`;
        break;
      case 'youtube':
        urls[network] = `https://youtube.com/watch?v=${randomId}`;
        break;
      case 'pinterest':
        urls[network] = `https://pinterest.com/pin/${randomId}`;
        break;
      case 'reddit':
        urls[network] = `https://reddit.com/r/syncuenta/comments/${randomId}`;
        break;
      case 'threads':
        urls[network] = `https://threads.net/@syncuenta/posts/${randomId}`;
        break;
      case 'bluesky':
        urls[network] = `https://bsky.app/profile/syncuenta.bsky.social/post/${randomId}`;
        break;
      default:
        urls[network] = `https://${network}.com/post/${randomId}`;
    }
  });

  return urls;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, networks, userId, profileId } = body;

    // Validar parámetros
    if (!title || !networks || !Array.isArray(networks) || networks.length === 0) {
      return NextResponse.json(
        { error: 'Invalid parameters' },
        { status: 400 }
      );
    }

    console.log('📤 Simulando publicación:', { title, networks, userId, profileId });

    // Simular delay de API (1-2 segundos)
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));

    // Simular ocasional fallo (10% de probabilidad)
    const shouldFail = Math.random() < 0.1;
    
    if (shouldFail) {
      console.log('❌ Simulación de error');
      return NextResponse.json(
        {
          status: 'failed',
          error: 'Simulated publishing error',
          post_urls: {},
        },
        { status: 500 }
      );
    }

    // Generar URLs simuladas
    const postUrls = simulatePublishUrls(networks);

    console.log('✅ Publicación simulada exitosa:', postUrls);

    return NextResponse.json(
      {
        status: 'success',
        post_urls: postUrls,
        message: 'Published successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Error en API mock:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { message: 'Use POST to publish' },
    { status: 405 }
  );
}
