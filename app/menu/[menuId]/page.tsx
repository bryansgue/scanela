'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import MenuDisplay from '../../components/MenuDisplay';
import MenuDisplayWithCart from '../../components/MenuDisplayWithCart';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default function MenuPage() {
  const params = useParams();
  const menuId = params.menuId as string;

  const [menuData, setMenuData] = useState<any>(null);
  const [businessName, setBusinessName] = useState<string>('Mi Restaurante');
  const [businessId, setBusinessId] = useState<number>(0);
  const [businessPlan, setBusinessPlan] = useState<'menu' | 'ventas'>('ventas');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState('orange');

  useEffect(() => {
    if (!menuId) {
      console.log('menuId no disponible');
      setLoading(false);
      return;
    }

    const loadMenu = async () => {
      try {
        console.log('Cargando menú con ID:', menuId);
        
        // Primero obtener el usuario y su plan
        const {
          data: { user },
        } = await supabase.auth.getUser();

        let userPlan: 'menu' | 'ventas' = 'ventas'; // Por defecto ventas
        
        if (user?.user_metadata?.plan) {
          userPlan = user.user_metadata.plan === 'menu' ? 'menu' : 'ventas';
          console.log('📊 Plan del usuario desde Auth:', userPlan);
        } else {
          console.log('⚠️ Sin plan en Auth, usando por defecto: ventas');
        }
        
        const { data, error: fetchError } = await supabase
          .from('menus')
          .select('*')
          .eq('id', menuId)
          .single();

        if (fetchError) {
          console.error('Error de Supabase:', fetchError);
          throw new Error(`Supabase error: ${fetchError.message}`);
        }

        if (!data) {
          throw new Error('No data returned from database');
        }

        console.log('Datos COMPLETOS de Supabase:', JSON.stringify(data, null, 2));
        console.log('Claves del objeto:', Object.keys(data));
        
        let parsedMenu = data.menu_data;
        if (typeof parsedMenu === 'string') {
          parsedMenu = JSON.parse(parsedMenu);
        }

        console.log('menuData:', parsedMenu);
        console.log('type de menuData:', typeof parsedMenu);
        
        setMenuData(parsedMenu || {});
        setBusinessId(data.id ? parseInt(data.id.toString()) : 0);
        setBusinessName(data.business_name || 'Mi Restaurante');
        setTheme(data.theme || 'orange');
        
        console.log('📊 Datos de menú cargados:');
        console.log('  - ID:', data.id);
        console.log('  - Nombre:', data.business_name);
        console.log('  - Tema:', data.theme);
        console.log('  - Plan del usuario:', userPlan);
        
        // Usar el plan del usuario
        setBusinessPlan(userPlan);
        
        setLoading(false);
      } catch (err: any) {
        console.error('Error loading menu:', err);
        setError(`Error: ${err.message} | menuId: ${menuId}`);
        setLoading(false);
      }
    };

    loadMenu();
  }, [menuId]);

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-gray-600 font-medium">Cargando menú...</p>
          <p className="text-gray-500 text-xs mt-2">menuId: {menuId}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center bg-white p-8 rounded-lg shadow max-w-sm">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-gray-600 font-medium mb-2">{error}</p>
          <p className="text-gray-500 text-sm mb-4">menuId: {menuId}</p>
          <p className="text-gray-500 text-xs">Contacta al restaurante para obtener un código válido.</p>
        </div>
      </div>
    );
  }

  if (!menuData) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center bg-white p-8 rounded-lg shadow">
          <div className="text-4xl mb-4">📋</div>
          <p className="text-gray-600 font-medium">No hay menú para mostrar</p>
          <p className="text-gray-500 text-sm mt-2">menuId: {menuId}</p>
          <p className="text-gray-500 text-xs mt-4">menuData es null o vacío</p>
          <pre className="mt-4 p-2 bg-gray-100 rounded text-xs overflow-auto">
            {JSON.stringify({ menuData, businessName, theme }, null, 2)}
          </pre>
        </div>
      </div>
    );
  }

  console.log('Renderizando menú con datos:', { menuData, businessName, theme, businessPlan });
  console.log('Categorías:', menuData.categories);
  console.log('Número de categorías:', menuData.categories?.length);

  return (
    <MenuDisplayWithCart 
      menu={menuData} 
      businessName={businessName}
      businessId={businessId}
      businessPlan={businessPlan}
      theme={theme}
      showFrame={false}
    />
  );
}