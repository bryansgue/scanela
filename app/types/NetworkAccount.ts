import { NetworkKey } from "./NetworkKey";

export interface NetworkAccount {
  id: string;
  profile_id: string;
  network: NetworkKey;
  is_connected: boolean;
  access_token?: string | null;
  extra_data?: any;
  created_at: string;
}
