/**
 * Cliente para API de publicación
 * Soporta tanto API mock como API real (Upload Post o similar)
 * 
 * Configurar en .env.local:
 * NEXT_PUBLIC_PUBLISH_API_URL=http://localhost:3000/api/publish
 * NEXT_PUBLIC_USE_REAL_API=false (false = mock, true = real)
 */

export interface PublishRequest {
  title: string;
  description: string | null;
  networks: string[];
  userId: string;
  profileId: string;
}

export interface PublishResponse {
  status: 'success' | 'failed';
  post_urls?: Record<string, string>;
  error?: string;
  message?: string;
}

/**
 * Publica contenido usando la API configurada
 * Por defecto usa el endpoint local mock en /api/publish
 */
export async function publishContent(data: PublishRequest): Promise<PublishResponse> {
  try {
    // Obtener configuración desde variables de entorno
    const apiUrl = process.env.NEXT_PUBLIC_PUBLISH_API_URL || '/api/publish';
    const useRealApi = process.env.NEXT_PUBLIC_USE_REAL_API === 'true';

    console.log(`📤 Publicando en: ${apiUrl} (Real API: ${useRealApi})`);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const result: PublishResponse = await response.json();

    if (result.status === 'success') {
      console.log('✅ Publicación exitosa:', result.post_urls);
    } else {
      console.warn('⚠️ Publicación fallida:', result.error);
    }

    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Error publicando:', errorMessage);

    return {
      status: 'failed',
      error: errorMessage,
    };
  }
}

/**
 * Obtiene la URL base de la API (útil para debugging)
 */
export function getPublishApiUrl(): string {
  return process.env.NEXT_PUBLIC_PUBLISH_API_URL || '/api/publish';
}

/**
 * Verifica si se está usando API real
 */
export function isUsingRealApi(): boolean {
  return process.env.NEXT_PUBLIC_USE_REAL_API === 'true';
}
