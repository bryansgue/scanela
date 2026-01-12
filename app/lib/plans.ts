export type PlanId = "free" | "menu" | "ventas";
export type BillingInterval = "monthly" | "annual";

const DB_PLAN_MAP: Record<PlanId, string> = {
  free: "basico",
  menu: "basico",
  ventas: "pro",
};

const REVERSE_DB_PLAN_MAP: Record<string, PlanId> = {
  free: "free",
  basico: "free",
  pro: "ventas",
  menu: "menu",
  ventas: "ventas",
};

export function planToDb(plan: PlanId): string {
  return DB_PLAN_MAP[plan] ?? "free";
}

export function planFromDb(plan?: string | null): PlanId {
  if (!plan) return "free";
  return REVERSE_DB_PLAN_MAP[plan] ?? "free";
}

export function planFromMetadata(metadata?: unknown): PlanId | null {
  if (!metadata || typeof metadata !== "object") return null;
  const code = (metadata as { code?: unknown }).code;
  if (code === "free" || code === "menu" || code === "ventas") {
    return code;
  }
  return null;
}

export function planMetadata(plan: PlanId) {
  return { code: plan } as const;
}

export function normalizeInterval(value?: string | null): BillingInterval {
  if (!value) return "monthly";
  const normalized = value.toLowerCase();
  if (normalized === "year" || normalized === "annual" || normalized === "yearly") {
    return "annual";
  }
  return "monthly";
}
