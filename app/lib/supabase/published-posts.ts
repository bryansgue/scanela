import { supabase } from './client';

export interface PublishedPost {
  id: string;
  user_id: string;
  profile_id: string;
  title: string;
  description: string | null;
  networks: string[];
  post_urls: Record<string, string> | null;
  status: 'success' | 'failed' | 'pending';
  error_message: string | null;
  published_at: string;
  created_at: string;
}

/**
 * Simula publicación exitosa generando URLs realistas por red social
 */
export function simulatePublishUrls(networks: string[]): Record<string, string> {
  const urls: Record<string, string> = {};

  networks.forEach((network) => {
    const randomId = Math.random().toString(36).substring(2, 11);
    
    switch (network.toLowerCase()) {
      case 'instagram':
        urls[network] = `https://instagram.com/p/${randomId}`;
        break;
      case 'tiktok':
        urls[network] = `https://tiktok.com/@scanela/video/${randomId}`;
        break;
      case 'x':
      case 'twitter':
        urls[network] = `https://x.com/scanela/status/${randomId}`;
        break;
      case 'facebook':
        urls[network] = `https://facebook.com/scanela/posts/${randomId}`;
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
        urls[network] = `https://reddit.com/r/scanela/comments/${randomId}`;
        break;
      case 'threads':
        urls[network] = `https://threads.net/@scanela/posts/${randomId}`;
        break;
      case 'bluesky':
        urls[network] = `https://bsky.app/profile/scanela.bsky.social/post/${randomId}`;
        break;
      default:
        urls[network] = `https://${network}.com/post/${randomId}`;
    }
  });

  return urls;
}

/**
 * Guarda una publicación en la tabla published_posts
 */
export async function savePublishedPost(data: {
  user_id: string;
  profile_id: string;
  title: string;
  description: string | null;
  networks: string[];
  post_urls: Record<string, string>;
  status?: 'success' | 'failed' | 'pending';
  error_message?: string | null;
}): Promise<PublishedPost | null> {
  try {
    const { data: result, error } = await supabase
      .from('published_posts')
      .insert({
        user_id: data.user_id,
        profile_id: data.profile_id,
        title: data.title,
        description: data.description,
        networks: data.networks,
        post_urls: data.post_urls,
        status: data.status || 'success',
        error_message: data.error_message || null,
        // No pases published_at, la BD lo asigna automáticamente
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving published post:', error);
      return null;
    }

    console.log('✅ Publicación guardada:', result);
    return result as PublishedPost;
  } catch (err) {
    console.error('Exception in savePublishedPost:', err);
    return null;
  }
}

/**
 * Obtiene todas las publicaciones de un perfil
 */
export async function getProfilePublishedPosts(
  profileId: string
): Promise<PublishedPost[]> {
  try {
    const { data, error } = await supabase
      .from('published_posts')
      .select('*')
      .eq('profile_id', profileId)
      .order('published_at', { ascending: false });

    if (error) {
      console.error('Error fetching published posts:', error);
      return [];
    }

    return (data || []) as PublishedPost[];
  } catch (err) {
    console.error('Exception in getProfilePublishedPosts:', err);
    return [];
  }
}

/**
 * Obtiene todas las publicaciones de un usuario
 */
export async function getUserPublishedPosts(
  userId: string
): Promise<PublishedPost[]> {
  try {
    const { data, error } = await supabase
      .from('published_posts')
      .select('*')
      .eq('user_id', userId)
      .order('published_at', { ascending: false });

    if (error) {
      console.error('Error fetching user published posts:', error);
      return [];
    }

    return (data || []) as PublishedPost[];
  } catch (err) {
    console.error('Exception in getUserPublishedPosts:', err);
    return [];
  }
}

/**
 * Obtiene una publicación específica
 */
export async function getPublishedPostById(
  postId: string
): Promise<PublishedPost | null> {
  try {
    const { data, error } = await supabase
      .from('published_posts')
      .select('*')
      .eq('id', postId)
      .single();

    if (error) {
      console.error('Error fetching published post:', error);
      return null;
    }

    return data as PublishedPost;
  } catch (err) {
    console.error('Exception in getPublishedPostById:', err);
    return null;
  }
}

/**
 * Elimina una publicación
 */
export async function deletePublishedPost(postId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('published_posts')
      .delete()
      .eq('id', postId);

    if (error) {
      console.error('Error deleting published post:', error);
      return false;
    }

    console.log('✅ Publicación eliminada');
    return true;
  } catch (err) {
    console.error('Exception in deletePublishedPost:', err);
    return false;
  }
}
