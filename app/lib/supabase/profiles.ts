import { supabase } from "./client";
import { Profile } from "../../types/Profile";

export async function getProfilesByUser(userId: string): Promise<Profile[]> {
  // 🚀 OPTIMIZACIÓN: Traer perfiles sin relaciones complejas
  const { data, error } = await supabase
    .from("profiles_social")
    .select("*")
    .eq("user_id", userId)
    .order("created_at");

  if (error) throw error;

  // 🚀 OPTIMIZACIÓN: Contar redes en paralelo (no secuencial)
  const withCounts = await Promise.all(
    (data || []).map(async (p) => {
      const { count } = await supabase
        .from("profile_network_accounts")
        .select("*", { count: "exact", head: true })
        .eq("profile_id", p.id)
        .eq("is_connected", true);

      return {
        ...p,
        connected_count: count || 0,
      };
    })
  );

  return withCounts;
}

export async function createProfile(userId: string, name: string) {
  const { error } = await supabase.from("profiles_social").insert({
    user_id: userId,
    profile_name: name,
  });
  if (error) throw error;
}

export async function deleteProfile(profileId: string) {
  const { error } = await supabase
    .from("profiles_social")
    .delete()
    .eq("id", profileId);

  if (error) throw error;
}


export async function renameProfile(id: string, userId: string, newName: string) {
  const { error } = await supabase
    .from("profiles_social")
    .update({ profile_name: newName })
    .eq("id", id)
    .eq("user_id", userId); // 🔥 obligatorio

  if (error) {
    console.error("❌ Error renombrando perfil:", error);
  }
}

