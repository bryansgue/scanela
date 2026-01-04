"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { getUserPlan } from "../lib/supabase/auth";
import type { UserPlan } from "../lib/supabase/auth";

interface UserPlanContextType {
  plan: UserPlan | null;
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

const UserPlanContext = createContext<UserPlanContextType | undefined>(undefined);

export function UserPlanProvider({ children }: { children: ReactNode }) {
  const [plan, setPlan] = useState<UserPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPlan = async () => {
    try {
      setLoading(true);
      setError(null);
      const userPlan = await getUserPlan();
      setPlan(userPlan);
    } catch (err) {
      console.error("❌ Error loading user plan:", err);
      setError("Error al cargar el plan del usuario");
      // NO establecer fallback a "basico", mantener null para mostrar loading state
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlan();
  }, []);

  const reload = async () => {
    await loadPlan();
  };

  return (
    <UserPlanContext.Provider value={{ plan, loading, error, reload }}>
      {children}
    </UserPlanContext.Provider>
  );
}

export function useUserPlan() {
  const context = useContext(UserPlanContext);
  if (!context) {
    throw new Error("useUserPlan must be used within UserPlanProvider");
  }
  return context;
}
