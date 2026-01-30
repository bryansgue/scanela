import Link from "next/link";
import PublicHeader from "./components/PublicHeader";
import Hero from "./components/Hero";
import HowItWorks from "./components/HowItWorks";
import ScanelaPricingSection from "./components/ScanelaPricingSection";
import MenuExamplesSection from "./components/MenuExamplesSection";
import PaymentGatewaysSection from "./components/PaymentGatewaysSection";
import { buildMetadata, faqEntries } from "../lib/seoConfig";

export const metadata = buildMetadata({
  title: "Menú QR interactivo y carta digital para restaurantes | Scanela",
  description:
    "Crea tu menú QR interactivo con Scanela: editor visual, pagos integrados, pedidos online y plantillas optimizadas para posicionar tu restaurante en Google.",
  keywords: [
    "mejor menu qr",
    "menu qr interactivo",
    "carta digital con pagos",
    "software menu qr",
    "menu digital para restaurantes",
  ],
  path: "/",
});

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-gray-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.25),_transparent_55%)]" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_center,_rgba(168,85,247,0.2),_transparent_60%)] blur-3xl" />
      <div className="relative z-10">
        <PublicHeader />
        <main className="space-y-0">
          <Hero />
          <HowItWorks />
          <MenuExamplesSection />
          <PaymentGatewaysSection />
          <ScanelaPricingSection />
          <FAQSection />
          <CTASection />
        </main>
        <Footer />
      </div>
    </div>
  );
}

function FAQSection() {
  return (
    <section
      id="faq"
      className="
        relative overflow-hidden
        bg-gradient-to-b
        from-slate-900
        via-slate-950
        to-black
        py-24
      "
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.18),_transparent_60%)]" />

      <div className="relative mx-auto max-w-6xl px-6">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.6em] text-cyan-300">
            FAQ MENÚ QR
          </p>

          <h2 className="mt-4 text-4xl font-extrabold text-white">
            Preguntas frecuentes sobre cartas digitales y códigos QR
          </h2>

          <p className="mt-3 max-w-3xl mx-auto text-base text-slate-300">
            Resolvemos las dudas más habituales al digitalizar tu carta para buscadores y clientes.
          </p>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          {faqEntries.map((item, idx) => (
            <details
              key={item.question}
              className="
                group rounded-3xl
                border border-white/10
                bg-white/5
                p-6
                text-white
                shadow-[0_10px_60px_rgba(2,6,23,0.6)]
                backdrop-blur
              "
            >
              <summary className="flex cursor-pointer items-center justify-between gap-4 text-left text-lg font-semibold">
                <span>
                  <span className="mr-3 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-500/20 text-indigo-300">
                    {(idx + 1).toString().padStart(2, "0")}
                  </span>
                  {item.question}
                </span>

                <span className="rounded-full border border-white/20 p-2 text-sm text-indigo-200 transition group-open:rotate-45">
                  +
                </span>
              </summary>

              <p className="mt-4 text-base leading-relaxed text-slate-200">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}


function CTASection() {
  return (
    <section className="relative overflow-hidden py-24">
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500" />
      <div className="absolute inset-0 bg-black/20" />

      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "url('data:image/svg+xml,%3Csvg width=\"120\" height=\"120\" viewBox=\"0 0 120 120\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cpath d=\"M60 0v120M0 60h120\" stroke=\"white\" stroke-opacity=\"0.08\" stroke-width=\"1\"/%3E%3C/svg%3E')",
        }}
      />

      <div className="relative mx-auto max-w-5xl px-6 text-center text-white">
        <p className="text-xs font-semibold uppercase tracking-[0.5em] text-white/70">
          IMPULSA TU RESTAURANTE
        </p>

        <h2 className="mt-6 text-4xl sm:text-5xl font-black leading-tight">
          🚀 Cientos de restaurantes usan Scanela para vender más con menús QR interactivos
        </h2>

        <p className="mt-4 text-lg text-white/80">
          Lanza tu carta digital, acepta pedidos y cobra sin depender de impresiones ni agencias.
          Entra gratis y escala cuando estés listo.
        </p>

        <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            href="/register"
            className="
              inline-flex items-center justify-center
              rounded-2xl bg-white
              px-10 py-4 text-lg font-semibold
              text-indigo-700
              shadow-xl shadow-indigo-900/40
              transition hover:-translate-y-1 hover:shadow-2xl
            "
          >
            ✨ Crear menú gratis
          </Link>

          <Link
            href="#pricing"
            className="
              inline-flex items-center justify-center
              rounded-2xl border border-white/60
              px-10 py-4 text-lg font-semibold
              text-white transition hover:bg-white/10
            "
          >
            Ver planes
          </Link>
        </div>

        <p className="mt-8 text-sm text-white/70">
          No se requiere tarjeta de crédito • Acceso instantáneo • Cancela cuando quieras
        </p>
      </div>
    </section>
  );
}


function Footer() {
  return (
    <footer className="bg-slate-950/90 py-20 text-slate-200">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          <div>
            <h3 className="text-2xl font-bold text-white">Scanela ✨</h3>
            <p className="mt-4 text-sm text-slate-400">
              La plataforma número 1 para menús digitales en LATAM.
            </p>
            <p className="mt-6 text-xs text-slate-500">Impulsando restaurantes con QR desde 2020.</p>
          </div>

          <FooterColumn
            title="Producto"
            links={[
              { label: "Inicio", href: "/" },
              { label: "Precios", href: "#pricing" },
              { label: "Crear menú", href: "/register" },
            ]}
          />

          <FooterColumn
            title="Empresa"
            links={[
              { label: "Sobre nosotros", href: "#" },
              { label: "Blog", href: "#" },
              { label: "Contacto", href: "#" },
            ]}
          />

          <FooterColumn
            title="Legal"
            links={[
              { label: "Privacidad", href: "#" },
              { label: "Términos", href: "#" },
              { label: "Cookies", href: "#" },
            ]}
          />
        </div>

        <div className="mt-14 border-t border-white/5 pt-8 text-center text-sm text-slate-500">
          <p>© {new Date().getFullYear()} Scanela. Todos los derechos reservados.</p>
          <p className="mt-2">Hecho con ❤️ para restaurantes en LATAM</p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <h4 className="font-semibold text-white">{title}</h4>
      <ul className="mt-4 space-y-2 text-sm text-slate-400">
        {links.map((link) => (
          <li key={link.label}>
            <Link href={link.href} className="transition hover:text-white">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

