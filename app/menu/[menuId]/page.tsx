import { cache } from 'react';
import { notFound } from 'next/navigation';
import MenuDisplayWithCart from '../../components/MenuDisplayWithCart';
import { getSupabaseAdminClient } from '../../../lib/supabaseServer';

type MenuRecord = {
  id: number;
  business_id: number | null;
  business_name: string | null;
  theme: string | null;
  menu_data: any;
};

type PublicMenuPayload = {
  menuData: any;
  businessName: string;
  businessId: number;
  businessPlan: 'free' | 'menu' | 'ventas';
  theme: string;
};

const determineBusinessPlan = (menuData: any): 'free' | 'menu' | 'ventas' => {
  const planFromMenu = menuData?.businessPlan || menuData?.plan;
  if (planFromMenu === 'free' || planFromMenu === 'menu' || planFromMenu === 'ventas') {
    return planFromMenu;
  }

  if (menuData?.enableCart || menuData?.enableOrders || menuData?.enablePayments) {
    return 'ventas';
  }

  return 'menu';
};

const getMenuById = cache(async (menuId: string): Promise<PublicMenuPayload | null> => {
  if (!menuId) return null;

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from('menus')
    .select('id, business_id, business_name, theme, menu_data')
    .eq('id', menuId)
    .maybeSingle<MenuRecord>();

  if (error || !data) {
    console.error('Error cargando menú público:', error?.message || 'no encontrado');
    return null;
  }

  const parsedMenu = typeof data.menu_data === 'string' ? JSON.parse(data.menu_data) : data.menu_data;

  return {
    menuData: parsedMenu || {},
    businessName: data.business_name || 'Mi Restaurante',
    businessId: data.business_id || data.id,
    businessPlan: determineBusinessPlan(parsedMenu),
    theme: data.theme || 'orange',
  };
});

export const revalidate = 30;

export default async function MenuPage({ params }: { params: Promise<{ menuId: string }> }) {
  const { menuId } = await params;
  const payload = await getMenuById(menuId);

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