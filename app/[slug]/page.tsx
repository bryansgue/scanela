import { cache } from 'react';
import { redirect, notFound } from 'next/navigation';
import { getSupabaseAdminClient } from '../../lib/supabaseServer';

const fetchMenuIdBySlug = cache(async (slug: string) => {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from('menus')
    .select('id')
    .eq('custom_slug', slug)
    .maybeSingle();

  if (error || !data) {
    console.error('Slug lookup failed:', error?.message || 'sin resultados');
    return null;
  }

  return data.id;
});

export const revalidate = 60;

export default async function SlugRedirectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug: rawSlug } = await params;
  const slug = rawSlug?.toLowerCase();
  if (!slug) {
    notFound();
  }

  const menuId = await fetchMenuIdBySlug(slug);
  if (!menuId) {
    notFound();
  }

  redirect(`/menu/${menuId}`);
}
