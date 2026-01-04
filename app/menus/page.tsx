'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default function MenuListPage() {
  const router = useRouter();
  const [menus, setMenus] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const loadMenus = async () => {
      try {
        // Verificar si hay sesión
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setError('Debes estar autenticado');
          setLoading(false);
          return;
        }

        setUser(session.user);

        // Cargar menús del usuario
        const { data, error: fetchError } = await supabase
          .from('menus')
          .select('id, business_name, theme')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;

        console.log('Menús cargados:', data);
        setMenus(data || []);
        setLoading(false);
      } catch (err: any) {
        console.error('Error:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    loadMenus();
  }, []);

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-gray-600 font-medium">Cargando menús...</p>
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
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Tus Menús</h1>
        <p className="text-gray-600 mb-8">Haz click en un menú para verlo en móvil</p>

        {menus.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <div className="text-4xl mb-4">📋</div>
            <p className="text-gray-600 font-medium">No tienes menús creados aún</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {menus.map((menu) => (
              <button
                key={menu.id}
                onClick={() => router.push(`/menu/${menu.id}`)}
                className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition-all text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">
                      {menu.business_name}
                    </h2>
                    <p className="text-sm text-gray-600">
                      ID: <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{menu.id}</span>
                    </p>
                  </div>
                  <div className={`w-12 h-12 rounded-lg ${
                    menu.theme === 'orange' ? 'bg-orange-500' :
                    menu.theme === 'blue' ? 'bg-blue-500' :
                    menu.theme === 'green' ? 'bg-green-500' :
                    menu.theme === 'red' ? 'bg-red-500' :
                    'bg-gray-500'
                  }`} />
                </div>
              </button>
            ))}
          </div>
        )}

        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            💡 <strong>Tip:</strong> También puedes acceder directamente con: <code className="bg-white px-2 py-1 rounded text-xs">/menu/ID</code>
          </p>
        </div>
      </div>
    </div>
  );
}
