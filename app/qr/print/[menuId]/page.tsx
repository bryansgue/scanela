import { cache } from 'react';
import type { Metadata } from 'next';
import PrintableA6QRCard from '../components/PrintableA6QRCard';
import QRDownloadOnly from '../components/QRDownloadOnly';
import QRStatusMessage from '../components/QRStatusMessage';
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

  // Intenta obtener el nombre del negocio desde la tabla businesses
  let finalBusinessName = parsedMenu.businessName || data.business_name || 'Mi Restaurante';
  
  if (data.business_id) {
    const { data: businessData } = await supabase
      .from('businesses')
      .select('name')
      .eq('id', data.business_id)
      .maybeSingle();
    
    if (businessData?.name) {
      finalBusinessName = businessData.name;
    }
  }

  return {
    id: data.id,
    businessId: data.business_id,
    businessName: finalBusinessName,
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-bold text-gray-900">Generador de Códigos QR</h1>
          <p className="text-lg text-gray-600">Descarga tu código QR en diferentes formatos</p>
          <p className="text-md font-semibold text-blue-600">Para: <span className="text-gray-900">{menu.businessName}</span></p>
        </div>

        {/* Grid de opciones */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Opción 1: Tarjeta vertical compacta */}
          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="space-y-4">
              <div className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                Recomendado
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Tarjeta Vertical Compacta</h2>
              <p className="text-gray-600">Diseño limpio con ancho reducido. Perfecto para espacios pequeños en mesas o barras.</p>
              
              <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-blue-600">✓</span>
                  <span>Tamaño: 100 × 120 mm (vertical estrecho)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-blue-600">✓</span>
                  <span>Ancho reducido para menos espacio en la mesa</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-blue-600">✓</span>
                  <span>Tipografía sans-serif moderna y clara</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-blue-600">✓</span>
                  <span>QR grande y fácilmente escaneable</span>
                </div>
              </div>
            </div>
            
            <PrintableA6QRCard
              menuId={menu.id}
              businessName={menu.businessName}
              shareUrl={shareUrl}
            />
          </div>

          {/* Opción 2: Descargar Solo QR */}
          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="space-y-4">
              <div className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                Rápido
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Código QR Solo</h2>
              <p className="text-gray-600">Descarga solo el código QR como imagen PNG de alta calidad.</p>
              
              <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Formato PNG de 512 × 512 píxeles</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Alta calidad sin comprimir</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Ideal para redes sociales</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Descarga rápida y sencilla</span>
                </div>
              </div>
            </div>
            
            <QRDownloadOnly
              menuId={menu.id}
              businessName={menu.businessName}
              shareUrl={shareUrl}
            />
          </div>
        </div>

        {/* Footer con instrucciones */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-sm text-blue-900">
          <h3 className="font-semibold mb-3">💡 Consejos de impresión:</h3>
          <ul className="space-y-2 list-disc list-inside">
            <li>Imprime la tarjeta vertical compacta en 100 × 120 mm o recorta desde una hoja A4</li>
            <li>Selecciona "Sin márgenes" o "Ajustar a página" en tu impresora</li>
            <li>Prueba el QR antes de imprimir muchas copias</li>
            <li>Para mejor escaneo, asegúrate de que el QR tenga suficiente contraste</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
