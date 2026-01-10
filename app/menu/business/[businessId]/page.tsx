import { cache } from 'react';
import { notFound } from 'next/navigation';
import MenuDisplayWithCart from '../../../components/MenuDisplayWithCart';
import { getSupabaseAdminClient } from '../../../../lib/supabaseServer';

type MenuRecord = {
  id: number;
  business_id: number | null;
  business_name: string | null;
  theme: string | null;
  menu_data: unknown;
};

type MenuData = {
  businessPlan?: 'menu' | 'ventas';
  plan?: 'menu' | 'ventas' | string;
  enableCart?: boolean;
  enableOrders?: boolean;
  enablePayments?: boolean;
  [key: string]: unknown;
};

type PublicMenuPayload = {
  menuData: MenuData;
  businessName: string;
  businessId: number;
  businessPlan: 'menu' | 'ventas';
  theme: string;
};

const determineBusinessPlan = (menuData: MenuData): 'menu' | 'ventas' => {
  const planFromMenu = menuData?.businessPlan || menuData?.plan;
  if (planFromMenu === 'menu' || planFromMenu === 'ventas') {
    return planFromMenu;
  }

  if (menuData?.enableCart || menuData?.enableOrders || menuData?.enablePayments) {
    return 'ventas';
  }

  return 'ventas';
};

const getMenuByBusinessId = cache(async (businessId: string): Promise<PublicMenuPayload | null> => {
  if (!businessId) return null;

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from('menus')
    .select('id, business_id, business_name, theme, menu_data')
    .eq('business_id', businessId)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle<MenuRecord>();

  if (error || !data) {
    console.error('Error cargando menú por negocio:', error?.message || 'no encontrado');
    return null;
  }

  const parsedMenu: MenuData = typeof data.menu_data === 'string'
    ? JSON.parse(data.menu_data || '{}')
    : (data.menu_data as MenuData) || {};

  return {
    menuData: parsedMenu || {},
    businessName: data.business_name || 'Mi Restaurante',
    businessId: data.business_id || Number(businessId),
    businessPlan: determineBusinessPlan(parsedMenu),
    theme: data.theme || 'orange',
  };
});

export const revalidate = 30;

export default async function BusinessMenuPage({ params }: { params: Promise<{ businessId: string }> }) {
  const { businessId } = await params;
  const payload = await getMenuByBusinessId(businessId);

  if (!payload) {
    notFound();
  }

  return (
    <MenuDisplayWithCart
      menu={payload.menuData}
      businessName={payload.businessName}
      businessId={payload.businessId}
      businessPlan={payload.businessPlan}
      theme={payload.theme}
      showFrame={false}
    />
  );
}
