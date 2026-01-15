import { supabase } from "./client";

import { planFromDb, planFromMetadata, planMetadata, planToDb, type PlanId } from "../plans";

export type UserPlan = PlanId;

// ✅ CACHÉ GLOBAL para el plan del usuario
let planCache: { userId: string; plan: UserPlan; timestamp: number } | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos en milisegundos

export async function getUserProfile() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !user.email) return null;

  const identityProviders = Array.isArray((user as any).identities)
    ? (user as any).identities
        .map((identity: any) => identity?.provider)
        .filter(Boolean)
    : [];

  const providerCandidates = [
    ...(identityProviders as string[]),
    user.app_metadata?.provider,
  ].filter(Boolean) as string[];

  const providers = Array.from(
    new Set(providerCandidates.length ? providerCandidates : ['email'])
  );

  return {
    id: user.id,
    email: user.email,
    fullName: user.user_metadata?.full_name || user.email.split("@")[0] || "Usuario",
    avatar: user.user_metadata?.avatar_url,
    provider: user.app_metadata?.provider || providers[0] || "email",
    providers,
    rawUser: user,
  };
}

export async function updateUserProfile(updates: { full_name?: string }) {
  const { data, error } = await supabase.auth.updateUser({
    data: { full_name: updates.full_name },
  });
  return { data, error };
}

export async function changePassword(newPassword: string) {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });
  return { data, error };
}

// Plan management
export const PLAN_LIMITS = {
  basico: {
    name: "Básico",
    profiles: 2,
    networks: 5,
  },
  pro: {
    name: "Pro",
    profiles: 5,
    networks: "ilimitadas",
  },
  business: {
    name: "Business",
    profiles: 10,
    networks: "ilimitadas",
  },
  menu: {
    name: "Scanela Menú",
    businesses: 1,
    products: "ilimitados",
  },
  ventas: {
    name: "Scanela Ventas",
    businesses: 5,
    products: "ilimitados",
  },
};

export async function getUserPlan(): Promise<UserPlan> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.log("❌ No hay usuario autenticado, retornando free");
      planCache = null;
      return "free";
    }

    // ✅ VERIFICAR CACHÉ
    const now = Date.now();
    if (planCache && planCache.userId === user.id && (now - planCache.timestamp) < CACHE_DURATION) {
      console.log("⚡ Plan obtenido del CACHÉ:", planCache.plan);
      return planCache.plan;
    }

    console.log("🔵 Obteniendo plan para usuario:", user.id);

    // 1️⃣ PRIMERO intentar obtener de user_metadata (plan actual Scanela)
    const metadataPlan = user.user_metadata?.plan as UserPlan | undefined;
    if (metadataPlan && ["free", "menu", "ventas"].includes(metadataPlan)) {
      console.log("✅ Plan obtenido de Auth metadata:", metadataPlan);
      
      // GUARDAR EN CACHÉ
      planCache = {
        userId: user.id,
        plan: metadataPlan,
        timestamp: now
      };
      
      return metadataPlan;
    }

    // 2️⃣ Si no está en metadata, obtener de BD
    console.log("🔵 Obteniendo plan de BD para usuario:", user.id);

    const { data, error } = await supabase
      .from("subscriptions")
      .select("plan, plan_metadata")
      .eq("user_id", user.id)
      .single();

    if (error) {
      console.error("❌ Error obteniendo plan:", error);
      return "free";
    }

    const dbPlanValue = data?.plan;
    console.log("📊 Plan en BD:", dbPlanValue);

    const planFromMeta = planFromMetadata(data?.plan_metadata);
    const plan = planFromMeta ?? planFromDb(dbPlanValue);

    console.log("✅ Plan mapeado a:", plan);
    
    // ✅ GUARDAR EN CACHÉ
    planCache = {
      userId: user.id,
      plan,
      timestamp: now
    };
    
    console.log("✅ Plan obtenido de BD y guardado en caché:", plan);
    return plan;
  } catch (error) {
    console.error("❌ Error getting user plan:", error);
    return "free";
  }
}

export function getProfileLimit(plan: UserPlan): number {
  if (plan === "menu" || plan === "ventas") {
    return 1;
  }

  const entry = PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS] as
    | { profiles?: number }
    | undefined;

  return entry?.profiles ?? 1;
}

// Crear suscripción inicial para nuevo usuario
export async function createInitialSubscription(userId: string) {
  try {
    // Verificar si ya existe
    const { data: existing } = await supabase
      .from("subscriptions")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (existing) return; // Ya existe, no crear duplicado

    // Crear nueva suscripción con plan básico
    const now = new Date();
    const trialEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const { error } = await supabase
      .from("subscriptions")
      .insert({
        user_id: userId,
        plan: planToDb("free"),
        plan_source: "manual",
        billing_period: "monthly",
        status: "active",
        current_period_start: now.toISOString(),
        current_period_end: trialEnd.toISOString(),
        plan_metadata: planMetadata("free"),
      });

    if (error) {
      console.error("Error creating initial subscription:", error);
    }
  } catch (error) {
    console.error("Error in createInitialSubscription:", error);
  }
}

// Actualizar el plan del usuario
export async function updateUserPlan(plan: UserPlan) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Usuario no autenticado");

    console.log("🔵 Actualizando plan para usuario:", user.id);
    console.log("📊 Nuevo plan:", plan);

  const dbPlan = planToDb(plan);
  console.log("🗂️ Plan en BD:", dbPlan);

    // 1️⃣ Guardar el plan real en user_metadata de Auth
    const { error: authError } = await supabase.auth.updateUser({
      data: { plan: plan } // Guardar "menu" o "ventas" aquí
    });

    if (authError) {
      console.error("❌ Error actualizando metadata de auth:", authError);
      throw authError;
    }

    console.log("✅ Plan guardado en Auth metadata:", plan);

    // 2️⃣ Actualizar la suscripción existente en BD
    const { data: updated, error: updateError } = await supabase
      .from("subscriptions")
      .update({
        plan: planToDb(plan),
        plan_source: "manual",
        billing_period: "monthly",
        plan_metadata: planMetadata(plan),
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id)
      .select();

    if (updateError) {
      console.error("❌ Error actualizando plan:", updateError);
      throw updateError;
    }

    if (!updated || updated.length === 0) {
      console.log("❌ No existe suscripción para este usuario");
      throw new Error("No existe suscripción. Por favor, contacta a soporte.");
    }

    console.log("✅ Plan actualizado exitosamente a:", plan);
    
    // ✅ INVALIDAR CACHÉ para forzar recarga
    console.log("🧹 Caché invalidado");
    planCache = null;
    
    // Esperar un poco para asegurar que Auth haya propagado el cambio
    await new Promise(resolve => setTimeout(resolve, 300));

    return { success: true };
  } catch (error) {
    console.error("❌ Error en updateUserPlan:", error);
    throw error;
  }
}

// ✅ FUNCIÓN PARA INVALIDAR CACHÉ MANUALMENTE
export function invalidatePlanCache() {
  console.log("🧹 Invalidando caché del plan");
  planCache = null;
}
