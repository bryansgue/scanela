import { supabase } from "./client";
import { Post } from "../../types/Post";
import { NetworkKey } from "../../types/NetworkKey";

export async function createPost({
  userId,
  profileId,
  title,
  description,
  uploadMethod,
  mediaUrl,
  networks,
  scheduledFor,
}: {
  userId: string;
  profileId: string;
  title: string;
  description: string;
  uploadMethod: "media" | "url" | "text";
  mediaUrl?: string;
  networks: string[];
  scheduledFor?: string;
}): Promise<Post> {
  // Crear objeto de inserción con solo columnas que sabemos que existen
  const insertData: any = {
    user_id: userId,
    profile_id: profileId,
    title,
    description,
    upload_method: uploadMethod,
    networks,
  };

  // Agregar campos opcionales
  if (mediaUrl !== undefined) insertData.media_url = mediaUrl;
  if (scheduledFor !== undefined) insertData.scheduled_for = scheduledFor;

  const { data, error } = await supabase
    .from("posts")
    .insert(insertData)
    .select()
    .single();

  if (error) throw error;
  return data as Post;
}

export async function getPostsByProfile(
  profileId: string,
  limit: number = 50
): Promise<Post[]> {
  const { data, error } = await supabase
    .from("posts")
    .select("id, user_id, profile_id, title, description, upload_method, media_url, media_path, networks, scheduled_for, is_scheduled, is_published, published_at, created_at, updated_at", { count: "exact" })
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data || []) as Post[];
}

export async function getPostsByUser(userId: string, limit: number = 100): Promise<Post[]> {
  const { data, error } = await supabase
    .from("posts")
    .select("id, user_id, profile_id, title, description, upload_method, media_url, media_path, networks, scheduled_for, is_scheduled, is_published, published_at, created_at, updated_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data || []) as Post[];
}

export async function deletePost(postId: string): Promise<void> {
  const { error } = await supabase
    .from("posts")
    .delete()
    .eq("id", postId);

  if (error) throw error;
}

export async function updatePost(
  postId: string,
  updates: Partial<Omit<Post, "id" | "user_id" | "created_at">>
): Promise<Post> {
  const { data, error } = await supabase
    .from("posts")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", postId)
    .select()
    .single();

  if (error) throw error;
  return data as Post;
}

export async function getScheduledPosts(): Promise<Post[]> {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .not("scheduled_for", "is", null)
    .lte("scheduled_for", new Date().toISOString())
    .order("scheduled_for", { ascending: true });

  if (error) throw error;
  return (data || []) as Post[];
}

export async function uploadPostMedia(
  file: File,
  userId: string,
  profileId: string
): Promise<string> {
  const timestamp = Date.now();
  const filename = `${userId}/${profileId}/${timestamp}-${file.name}`;

  const { data, error } = await supabase.storage
    .from("post-media")
    .upload(filename, file);

  if (error) throw error;

  const { data: publicUrl } = supabase.storage
    .from("post-media")
    .getPublicUrl(filename);

  return publicUrl.publicUrl;
}
