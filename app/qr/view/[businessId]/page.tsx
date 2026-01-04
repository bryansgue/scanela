'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import MenuDisplay from '../../../components/MenuDisplay';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default function QRViewPage() {
  const params = useParams();
  const businessId = params.businessId as string;

  const [menuData, setMenuData] = useState<any>(null);
  const [businessName, setBusinessName] = useState<string>('Mi Restaurante');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState('orange');

  useEffect(() => {
    if (!businessId) {
      console.warn('businessId no disponible aún');
      return;
    }

    const loadMenu = async () => {
      try {
        console.log('Cargando menú para businessId:', businessId);
        const { data, error: fetchError } = await supabase
          .from('menus')
          .select('*')
          .eq('id', businessId)
          .single();

        if (fetchError) {
          console.error('Error de Supabase:', fetchError);
          throw fetchError;
        }

        if (data) {
          console.log('Menú cargado:', data);
          const parsedMenu = typeof data.menuData === 'string' 
            ? JSON.parse(data.menuData) 
            : data.menuData;

          setMenuData(parsedMenu || {});
          setBusinessName(data.business_name || 'Mi Restaurante');
          setTheme(data.theme || 'orange');
        }
      } catch (err: any) {
        console.error('Error loading menu:', err);
        setError('No se encontró el menú. El QR puede ser inválido.');
      } finally {
        setLoading(false);
      }
    };

    loadMenu();
  }, [businessId]);

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-gray-600 font-medium">Cargando menú...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center bg-white p-8 rounded-lg shadow">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-gray-600 font-medium">{error}</p>
          <p className="text-gray-500 text-sm mt-2">Contacta al restaurante para obtener un código QR válido.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-50">
      {menuData && (
        <MenuDisplay 
          menu={menuData} 
          businessName={businessName} 
          theme={theme}
          showFrame={false}
        />
      )}
    </div>
  );
}
