'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { ArrowRight, Loader2, AlertCircle } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Menu {
  id: string;
  business_name: string;
  business_id: number;
}

export default function MenuSelectorPage() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const { data, error: err } = await supabase
          .from('menus')
          .select('id, business_name, business_id')
          .limit(10);

        if (err) {
          setError(`Error al cargar menús: ${err.message}`);
          return;
        }

        setMenus(data || []);
      } catch (err) {
        setError(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchMenus();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">🛒 Carrito de Compras</h1>
          <p className="text-gray-600 mb-8">
            Selecciona un menú para ver el carrito en acción
          </p>

          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
              <span className="ml-3 text-gray-600">Cargando menús...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {!loading && menus.length === 0 && !error && (
            <p className="text-gray-500 text-center py-8">No hay menús disponibles</p>
          )}

          {!loading && menus.length > 0 && (
            <div className="space-y-3">
              {menus.map((menu) => (
                <Link
                  key={menu.id}
                  href={`/menu/${menu.id}`}
                  className="block p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-800 group-hover:text-indigo-600 transition-colors">
                        {menu.business_name}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        📍 Menu ID: <code className="bg-gray-100 px-2 py-1 rounded">{menu.id}</code>
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-indigo-600 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <span className="font-semibold">💡 Qué verás:</span>
              </p>
              <ul className="text-sm text-blue-700 mt-2 space-y-1 ml-4">
                <li>✅ Menú de productos en la izquierda (70%)</li>
                <li>✅ Carrito de compras en la derecha (30%)</li>
                <li>✅ Botón verde: "🧪 Agregar producto de prueba"</li>
                <li>✅ Funcionalidad: Agregar, eliminar, cambiar cantidad</li>
                <li>✅ Checkout: "Proceder al pago" para ir a formulario</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
