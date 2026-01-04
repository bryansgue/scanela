import { NetworkKey } from "./NetworkKey";

export interface Post {
  id: string;
  user_id: string;
  profile_id: string;
  title: string;
  description: string;
  upload_method: "media" | "url" | "text";
  media_url?: string | null;
  media_path?: string | null;
  networks: NetworkKey[];
  scheduled_for?: string | null;
  is_scheduled: boolean;
  is_published: boolean;
  published_at?: string | null;
  created_at: string;
  updated_at: string;
}
