"use client";

import Link from "next/link";
import PublicHeader from "./components/PublicHeader";
import Hero from "./components/Hero";
import HowItWorks from "./components/HowItWorks";
import ScanelaPricingSection from "./components/ScanelaPricingSection";
import MenuExamplesSection from "./components/MenuExamplesSection";
import PaymentGatewaysSection from "./components/PaymentGatewaysSection";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-gray-800 overflow-hidden">
      <PublicHeader />
      <Hero />
      <HowItWorks />
      <MenuExamplesSection />
      <PaymentGatewaysSection />
      <ScanelaPricingSection />
      <CTASection />
      <Footer />
    </div>
  );
}

function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-center text-white">
      <div className="max-w-4xl mx-auto px-6">
        <h2 className="text-5xl font-extrabold mb-4">
          🚀 Cientos de restaurantes usan Scanela
        </h2>
        <p className="text-xl opacity-90 mb-8">
          Crea menús digitales profesionales en minutos. Comparte con tus clientes mediante QR y aumenta tus ventas.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/register"
            className="inline-block px-10 py-4 bg-white text-blue-600 rounded-xl font-bold text-lg shadow-xl transition transform hover:scale-105 hover:shadow-2xl"
          >
            ✨ Crear menú gratis
          </Link>
          <Link
            href="#pricing"
            className="inline-block px-10 py-4 bg-white bg-opacity-20 text-white rounded-xl font-bold text-lg border border-white hover:bg-opacity-30 transition"
          >
            Ver planes
          </Link>
        </div>

        <p className="mt-8 text-sm opacity-75">
          No se requiere tarjeta de crédito • Acceso instantáneo • Cancela cuando quieras
        </p>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="py-16 bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* BRAND */}
          <div>
            <h3 className="text-2xl font-bold text-white mb-4">Scanela ✨</h3>
            <p className="text-sm opacity-70">
              La plataforma número 1 para menús digitales en LATAM
            </p>
          </div>

          {/* PRODUCT */}
          <div>
            <h4 className="font-bold text-white mb-4">Producto</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="opacity-70 hover:opacity-100 transition">Inicio</Link></li>
              <li><Link href="#pricing" className="opacity-70 hover:opacity-100 transition">Precios</Link></li>
              <li><Link href="/register" className="opacity-70 hover:opacity-100 transition">Crear menú</Link></li>
            </ul>
          </div>

          {/* COMPANY */}
          <div>
            <h4 className="font-bold text-white mb-4">Empresa</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="opacity-70 hover:opacity-100 transition">Sobre nosotros</a></li>
              <li><a href="#" className="opacity-70 hover:opacity-100 transition">Blog</a></li>
              <li><a href="#" className="opacity-70 hover:opacity-100 transition">Contacto</a></li>
            </ul>
          </div>

          {/* LEGAL */}
          <div>
            <h4 className="font-bold text-white mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="opacity-70 hover:opacity-100 transition">Privacidad</a></li>
              <li><a href="#" className="opacity-70 hover:opacity-100 transition">Términos</a></li>
              <li><a href="#" className="opacity-70 hover:opacity-100 transition">Cookies</a></li>
            </ul>
          </div>
        </div>

        {/* BOTTOM */}
        <div className="border-t border-gray-700 pt-8 text-center text-sm opacity-70">
          <p>© {new Date().getFullYear()} Scanela. Todos los derechos reservados.</p>
          <p className="mt-2">Hecho con ❤️ para restaurantes en LATAM</p>
        </div>
      </div>
    </footer>
  );
}

