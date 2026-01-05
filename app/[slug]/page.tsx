'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default function SlugRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  useEffect(() => {
    if (!slug) return;

    const redirectToMenu = async () => {
      try {
        // Buscar el slug en la tabla menus
        const { data, error } = await supabase
          .from('menus')
          .select('id')
          .eq('custom_slug', slug.toLowerCase())
          .single();

        if (error || !data) {
          // Slug no existe, mostrar 404
          router.push('/not-found');
          return;
        }

        // Slug existe, redirigir al menú con el ID
        router.push(`/menu/${data.id}`);
      } catch (err) {
        console.error('Error en redirect:', err);
        router.push('/not-found');
      }
    };

    redirectToMenu();
  }, [slug, router]);

  return (
    <div className="w-full h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="animate-spin text-4xl mb-4">⏳</div>
        <p className="text-gray-600 font-medium">Cargando menú...</p>
      </div>
    </div>
  );
}
