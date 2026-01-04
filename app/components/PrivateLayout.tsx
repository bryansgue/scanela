"use client";

import PrivateHeader from "./PrivateHeader";

export default function DashboardLayout({
  children,
  user,
}: {
  children: React.ReactNode;
  user?: any;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50/50 to-gray-50">
      {/* HEADER GLOBAL */}
      <PrivateHeader user={user} />

      {/* CONTENIDO DEL DASHBOARD */}
      <main className="pt-8 px-6">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
