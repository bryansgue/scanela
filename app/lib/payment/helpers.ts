/**
 * Utilidades para gestionar métodos de pago
 * Soporta: Tarjeta de Crédito (Stripe), PayPal, Mercado Pago
 */

import { supabase } from "@/lib/supabase/client";

export type PaymentType = "credit_card" | "paypal" | "mercado_pago";

export interface PaymentMethodInput {
  type: PaymentType;
  displayName: string;
  lastFour?: string;
  expiryDate?: string;
  email?: string;
  stripePaymentMethodId?: string;
  paypalToken?: string;
  mercadoPagoToken?: string;
  isDefault?: boolean;
}

/**
 * Agregar un nuevo método de pago
 */
export async function addPaymentMethod(method: PaymentMethodInput) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Usuario no autenticado");

    // Si es el primer método de pago, hacerlo predeterminado
    const { count } = await supabase
      .from("payment_methods")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    const isFirstMethod = count === 0;

    const { data, error } = await supabase
      .from("payment_methods")
      .insert([
        {
          user_id: user.id,
          type: method.type,
          display_name: method.displayName,
          last_four: method.lastFour,
          expiry_date: method.expiryDate,
          email: method.email,
          stripe_payment_method_id: method.stripePaymentMethodId,
          paypal_token: method.paypalToken,
          mercado_pago_token: method.mercadoPagoToken,
          is_default: method.isDefault || isFirstMethod,
        },
      ])
      .select();

    if (error) throw error;

    return { success: true, data: data[0] };
  } catch (error) {
    console.error("Error adding payment method:", error);
    throw error;
  }
}

/**
 * Obtener métodos de pago del usuario
 */
export async function getPaymentMethods() {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Usuario no autenticado");

    const { data, error } = await supabase
      .from("payment_methods")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Error getting payment methods:", error);
    throw error;
  }
}

/**
 * Obtener método de pago predeterminado
 */
export async function getDefaultPaymentMethod() {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Usuario no autenticado");

    const { data, error } = await supabase
      .from("payment_methods")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_default", true)
      .eq("is_active", true)
      .single();

    if (error && error.code !== "PGRST116") throw error; // PGRST116 = no rows

    return data || null;
  } catch (error) {
    console.error("Error getting default payment method:", error);
    throw error;
  }
}

/**
 * Establecer método como predeterminado
 */
export async function setDefaultPaymentMethod(methodId: string) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Usuario no autenticado");

    // Desactivar otro método predeterminado
    await supabase
      .from("payment_methods")
      .update({ is_default: false })
      .eq("user_id", user.id)
      .neq("id", methodId);

    // Activar nuevo método
    const { data, error } = await supabase
      .from("payment_methods")
      .update({ is_default: true })
      .eq("id", methodId)
      .eq("user_id", user.id)
      .select();

    if (error) throw error;

    return { success: true, data: data[0] };
  } catch (error) {
    console.error("Error setting default payment method:", error);
    throw error;
  }
}

/**
 * Eliminar método de pago (soft delete)
 */
export async function deletePaymentMethod(methodId: string) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Usuario no autenticado");

    const { error } = await supabase
      .from("payment_methods")
      .update({ is_active: false })
      .eq("id", methodId)
      .eq("user_id", user.id);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error("Error deleting payment method:", error);
    throw error;
  }
}

/**
 * Actualizar método de pago
 */
export async function updatePaymentMethod(
  methodId: string,
  updates: Partial<PaymentMethodInput>
) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Usuario no autenticado");

    const updateData: Record<string, any> = {};

    if (updates.displayName) updateData.display_name = updates.displayName;
    if (updates.lastFour) updateData.last_four = updates.lastFour;
    if (updates.expiryDate) updateData.expiry_date = updates.expiryDate;
    if (updates.email) updateData.email = updates.email;

    const { data, error } = await supabase
      .from("payment_methods")
      .update(updateData)
      .eq("id", methodId)
      .eq("user_id", user.id)
      .select();

    if (error) throw error;

    return { success: true, data: data[0] };
  } catch (error) {
    console.error("Error updating payment method:", error);
    throw error;
  }
}

/**
 * Obtener información de configuración para proveedores de pago
 */
export function getPaymentProviderConfig(type: PaymentType) {
  const configs = {
    credit_card: {
      name: "Tarjeta de Crédito",
      provider: "Stripe",
      icon: "💳",
      description: "Visa, Mastercard, American Express",
      redirectUrl: process.env.NEXT_PUBLIC_STRIPE_REDIRECT_URL,
    },
    paypal: {
      name: "PayPal",
      provider: "PayPal",
      icon: "🅿️",
      description: "Paga con tu cuenta PayPal",
      redirectUrl: process.env.NEXT_PUBLIC_PAYPAL_REDIRECT_URL,
    },
    mercado_pago: {
      name: "Mercado Pago",
      provider: "Mercado Pago",
      icon: "🟡",
      description: "Usa tu billetera de Mercado Pago",
      redirectUrl: process.env.NEXT_PUBLIC_MERCADO_PAGO_REDIRECT_URL,
    },
  };

  return configs[type];
}

/**
 * Validar si una tarjeta está a punto de expirar
 */
export function isCardExpiringSoon(expiryDate: string): boolean {
  if (!expiryDate) return false;

  const [month, year] = expiryDate.split("/");
  const expiry = new Date(parseInt(`20${year}`), parseInt(month) - 1);
  const today = new Date();

  // Retorna true si expira en menos de 30 días
  const daysUntilExpiry =
    (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);

  return daysUntilExpiry < 30 && daysUntilExpiry > 0;
}

/**
 * Validar si una tarjeta está expirada
 */
export function isCardExpired(expiryDate: string): boolean {
  if (!expiryDate) return false;

  const [month, year] = expiryDate.split("/");
  const expiry = new Date(parseInt(`20${year}`), parseInt(month));
  const today = new Date();

  return expiry < today;
}
