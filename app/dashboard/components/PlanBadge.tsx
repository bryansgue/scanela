'use client';

import { useUserPlan } from '@/context/UserPlanContext';
import { useEffect, useState } from 'react';
import { getUserProfile } from '@/lib/supabase/auth';

interface Profile {
  fullName: string;
}

export default function PlanBadge({ businessCount }: { businessCount: number }) {
  const { plan } = useUserPlan();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      const p = await getUserProfile();
      if (p) setProfile({ fullName: p.fullName });
    };
    loadProfile();
  }, []);

  if (!plan || !profile) {
    return null;
  }

  const planInfo =
    plan === 'free'
      ? { name: 'Scanela Free', icon: '🆓', color: 'bg-gray-100 text-gray-700' }
      : plan === 'menu'
        ? { name: 'Scanela Menú', icon: '📋', color: 'bg-blue-100 text-blue-700' }
        : plan === 'ventas'
          ? { name: 'Scanela Ventas', icon: '💳', color: 'bg-green-100 text-green-700' }
          : { name: 'Plan', icon: '📊', color: 'bg-gray-100 text-gray-700' };

  const maxBusinesses = plan === 'free' ? 1 : plan === 'menu' ? 3 : plan === 'ventas' ? 5 : 1;

  return (
    <div className={`${planInfo.color} px-4 py-2 rounded-full font-semibold flex items-center gap-2 whitespace-nowrap`}>
      <span className="text-lg">{planInfo.icon}</span>
      <span>{planInfo.name}</span>
    </div>
  );
}
