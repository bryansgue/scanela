import { cache } from 'react';
import type { Metadata } from 'next';
import PrintableQRCard from '../components/PrintableQRCard';
import QRStatusMessage from '../components/QRStatusMessage';
import { getQRThemePreset } from '../themePresets';
import { getSupabaseAdminClient } from '../../../../lib/supabaseServer';

type MenuRecord = {
  id: number;
  business_id: number | null;
  business_name: string | null;
  theme: string | null;
  menu_data: unknown;
  custom_slug: string | null;
};

type PrintableMenuPayload = {
  id: number;
  businessId: number | null;
  businessName: string;
  subtitle: string;
  theme: string;
  customThemeColor?: string | null;
  businessLogo?: string | null;
  customSlug?: string | null;
};

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://scanela.com').replace(/\/$/, '');

type StoredMenuData = Partial<{
  businessName: string;
  menuSubtitle: string;
  theme: string;
  customThemeColor: string;
  businessLogo: string;
  customSlug: string;
}>;

const parseMenuData = (raw: unknown): StoredMenuData => {
  if (!raw) return {};

  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw) as StoredMenuData;
    } catch (error) {
      console.warn('Menu data JSON parse failed for QR page:', error);
      return {};
    }
  }

  if (typeof raw === 'object') {
    return raw as StoredMenuData;
  }

  return {};
};

const fetchMenu = cache(async (menuId: string): Promise<PrintableMenuPayload | null> => {
  if (!menuId) return null;

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from('menus')
    .select('id, business_id, business_name, theme, menu_data, custom_slug')
    .eq('id', menuId)
    .maybeSingle<MenuRecord>();

  if (error || !data) {
    console.error('No se pudo cargar el menú para QR:', error?.message || 'sin resultados');
    return null;
  }

  const parsedMenu = parseMenuData(data.menu_data);

  return {
    id: data.id,
    businessId: data.business_id,
    businessName: parsedMenu.businessName || data.business_name || 'Mi Restaurante',
    subtitle: parsedMenu.menuSubtitle || 'Escanea este QR y revisa nuestro menú',
    theme: parsedMenu.theme || data.theme || 'orange',
    customThemeColor: parsedMenu.customThemeColor,
    businessLogo: parsedMenu.businessLogo,
    customSlug: data.custom_slug || parsedMenu.customSlug,
  };
});

const buildShareUrl = (menu: PrintableMenuPayload) => {
  if (menu.customSlug) {
    return `${SITE_URL}/${menu.customSlug}`;
  }

  if (menu.businessId) {
    return `${SITE_URL}/menu/business/${menu.businessId}`;
  }

  const path = `/menu/${menu.id}`;
  return `${SITE_URL}${path}`;
};

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ menuId: string }> }): Promise<Metadata> {
  const { menuId } = await params;
  const menu = await fetchMenu(menuId);

  if (!menu) {
    return {
      title: 'QR no disponible | Scanela',
      description: 'No encontramos el menú solicitado.',
    };
  }

  return {
    title: `QR de ${menu.businessName} | Scanela`,
    description: `Escanea para abrir el menú digital de ${menu.businessName}.`,
    openGraph: {
      title: `QR de ${menu.businessName}`,
      description: `Escanea para abrir el menú digital de ${menu.businessName}.`,
      url: buildShareUrl(menu),
    },
  };
}

export default async function PrintableQRPage({ params }: { params: Promise<{ menuId: string }> }) {
  const { menuId } = await params;
  const menu = await fetchMenu(menuId);

  if (!menu) {
    return (
      <QRStatusMessage
        title="Este QR todavía no está listo"
        description="Asegúrate de haber guardado tu menú al menos una vez desde el dashboard. Luego vuelve a intentar generar el QR."
      />
    );
  }

  const shareUrl = buildShareUrl(menu);
  const themePreset = getQRThemePreset(menu.theme, menu.customThemeColor);

  return (
    <PrintableQRCard
      menuId={menu.id}
      businessName={menu.businessName}
      subtitle={menu.subtitle}
      shareUrl={shareUrl}
      themePreset={themePreset}
    />
  );
}
