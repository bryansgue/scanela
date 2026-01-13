"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { supabase } from "../lib/supabase/client";
import MenuDisplay from "./MenuDisplay";
import { normalizeLogoUrl } from "@/lib/logoUtils";

const bulletPoints = [
  "Actualiza precios y fotos en tiempo real desde cualquier sucursal",
  "Comparte tu menú con un único QR y gestiona pedidos en un mismo lugar",
  "Recibe pagos, comentarios y métricas sin depender de papel ni diseños externos",
];

const featureHighlights = [
  { title: "Menú digital", description: "Totalmente editable y listo en móvil" },
  { title: "QR ilimitados", description: "Un código por mesa, sucursal o delivery" },
  { title: "Pagos y pedidos", description: "Carrito con checkout integrado" },
  { title: "Reportes diarios", description: "Ventas, tickets promedio y favoritos" },
];

const featuredTemplateMeta = {
  theme: "orange",
  templateIcon: "🍕",
  templateName: "Pizzería Artesanal",
  templateSubtitle: "Pizzas auténticas y deliciosas",
};

type HeroBusiness = {
  id: number;
  name: string;
  logo: string | null;
  created_at: string;
};

const CAROUSEL_GROUP_SIZE = 4;

const chunkBusinesses = (businesses: HeroBusiness[], size: number): HeroBusiness[][] => {
  if (size <= 0) return [];
  const chunks: HeroBusiness[][] = [];
  for (let i = 0; i < businesses.length; i += size) {
    chunks.push(businesses.slice(i, i + size));
  }
  return chunks;
};

const getBusinessInitials = (name: string) => {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");

  return initials || "SC";
};

const getBusinessJoinLabel = (dateString: string) => {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "Nuevo cliente";

  const diffMs = Date.now() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 1) return "Se unió hoy";
  if (diffDays === 1) return "Se unió ayer";
  if (diffDays < 7) return `Hace ${diffDays} días`;

  return `Desde ${date.toLocaleDateString("es-ES", { day: "2-digit", month: "short" })}`;
};

const isAbortError = (error: unknown): error is Error =>
  error instanceof Error && error.name === "AbortError";

const formatStatNumber = (value: number) =>
  new Intl.NumberFormat("es-ES", { maximumFractionDigits: 0 }).format(value);

export default function Hero() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [featuredTemplate, setFeaturedTemplate] = useState<any>(null);
  const [templateLoading, setTemplateLoading] = useState(true);
  const [activeBusinessesCount, setActiveBusinessesCount] = useState<number | null>(null);
  const [recentBusinesses, setRecentBusinesses] = useState<HeroBusiness[]>([]);
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [carouselIndex, setCarouselIndex] = useState(0);

  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user || null);
      setLoading(false);
    };
    loadUser();
  }, []);

  useEffect(() => {
    const loadTemplate = async () => {
      try {
        const response = await fetch("/menu-templates.json");
        const data = await response.json();
        setFeaturedTemplate(data?.pizzeria ?? null);
      } catch (error) {
        console.error("Error loading featured template:", error);
      } finally {
        setTemplateLoading(false);
      }
    };

    loadTemplate();
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const loadHeroMetrics = async () => {
      try {
        const response = await fetch("/api/public/hero-metrics", {
          signal: controller.signal,
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("No se pudieron cargar las métricas públicas");
        }

        const data = await response.json();

        if (typeof data.activeBusinesses === "number") {
          setActiveBusinessesCount(data.activeBusinesses);
        }

        if (Array.isArray(data.latestBusinesses)) {
          const sanitized: HeroBusiness[] = data.latestBusinesses
            .map((item: HeroBusiness | null) => {
              if (!item) return null;

              const normalizedLogo = normalizeLogoUrl(
                typeof item.logo === "string" ? item.logo : null
              );

              if (!normalizedLogo) return null;

              return {
                id: Number(item.id),
                name: typeof item.name === "string" ? item.name : "Restaurante",
                logo: normalizedLogo,
                created_at:
                  typeof item.created_at === "string"
                    ? item.created_at
                    : new Date().toISOString(),
              } satisfies HeroBusiness;
            })
            .filter(
              (business: HeroBusiness | null): business is HeroBusiness => business !== null
            )
            .slice(0, 10);

          setRecentBusinesses(sanitized);
        }
      } catch (error) {
        if (!isAbortError(error)) {
          console.error("Error loading hero metrics:", error);
        }
      } finally {
        if (!controller.signal.aborted) {
          setMetricsLoading(false);
        }
      }
    };

    loadHeroMetrics();

    return () => controller.abort();
  }, []);

  const carouselGroups = useMemo(() => {
    if (!recentBusinesses.length) return [];
    const size = Math.min(CAROUSEL_GROUP_SIZE, Math.max(1, recentBusinesses.length));
    return chunkBusinesses(recentBusinesses, size);
  }, [recentBusinesses]);

  useEffect(() => {
    setCarouselIndex(0);
  }, [carouselGroups.length]);

  useEffect(() => {
    if (carouselGroups.length <= 1) return;

    const interval = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % carouselGroups.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [carouselGroups.length]);

  const heroStats = useMemo(
    () => [
      {
        value:
          activeBusinessesCount !== null
            ? formatStatNumber(activeBusinessesCount)
            : metricsLoading
              ? "..."
              : "450+",
        label: "restaurantes activos",
      },
      { value: "120K", label: "órdenes procesadas" },
      { value: "<5 min", label: "para publicar tu menú" },
    ],
    [activeBusinessesCount, metricsLoading]
  );

  const currentCarouselGroup = carouselGroups[carouselIndex] ?? [];

  const primaryCta = {
    href: user ? "/dashboard" : "/register",
    label: user ? "Ir al Dashboard" : "Crear menú gratis",
  };

  const secondaryCta = {
    href: user ? "/pricing" : "/login",
    label: user ? "Mejorar plan" : "Iniciar sesión",
  };

  return (
  <section className="relative overflow-hidden bg-gradient-to-b from-white via-blue-50/40 to-white pt-16 pb-24">
      <div className="absolute inset-x-0 -top-32 h-72 bg-gradient-to-r from-blue-500/5 via-purple-500/10 to-pink-500/5 blur-3xl" />
      <div className="absolute -bottom-24 left-1/2 h-72 w-[70%] -translate-x-1/2 rounded-full bg-purple-200/20 blur-[120px]" />

      <div className="relative z-10 mx-auto max-w-6xl px-6">
        <div className="grid items-center gap-16 lg:grid-cols-[1.1fr_0.9fr]">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-left"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-4 py-1 text-sm font-medium text-blue-700 shadow-sm">
              <span className="text-blue-500">●</span> Nuevo panel 2025
            </span>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.8 }}
              className="mt-5 text-4xl font-bold leading-tight text-gray-900 md:text-6xl"
            >
              Crea menús digitales elegantes
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                y actívalos en minutos
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.8 }}
              className="mt-4 text-base text-gray-600"
            >
              Controla productos, fotos, precios y pagos desde cualquier sucursal con un único QR.
            </motion.p>

            <motion.ul
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.8 }}
              className="mt-5 space-y-3 text-sm text-gray-700"
            >
              {bulletPoints.map((point) => (
                <li key={point} className="flex items-start gap-3">
                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
                  <span>{point}</span>
                </li>
              ))}
            </motion.ul>

            <div className="mt-10 flex flex-wrap gap-4">
              <AnimatePresence mode="wait">
                {!loading && (
                  <motion.div
                    key="primary-cta"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Link
                      href={primaryCta.href}
                      className="inline-flex min-w-[190px] items-center justify-center rounded-2xl bg-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition hover:bg-blue-700 hover:shadow-xl"
                    >
                      {primaryCta.label}
                    </Link>
                  </motion.div>
                )}
                {loading && (
                  <motion.div
                    key="primary-placeholder"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0 }}
                    className="min-w-[190px] rounded-2xl bg-gray-200/70 px-8 py-4"
                  />
                )}
              </AnimatePresence>

              <AnimatePresence mode="wait">
                {!loading && (
                  <motion.div
                    key="secondary-cta"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.3, delay: 0.05 }}
                  >
                    <Link
                      href={secondaryCta.href}
                      className="inline-flex min-w-[190px] items-center justify-center rounded-2xl border border-gray-300 bg-white px-8 py-4 text-lg font-semibold text-gray-800 shadow-sm transition hover:bg-gray-50"
                    >
                      {secondaryCta.label}
                    </Link>
                  </motion.div>
                )}
                {loading && (
                  <motion.div
                    key="secondary-placeholder"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0 }}
                    className="min-w-[190px] rounded-2xl border border-gray-200 px-8 py-4"
                  />
                )}
              </AnimatePresence>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.8 }}
              className="mt-12 grid gap-6 text-left sm:grid-cols-3"
            >
              {heroStats.map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-gray-200/80 bg-white/70 px-5 py-4 shadow-sm">
                  <p className="text-3xl font-semibold text-gray-900">{stat.value}</p>
                  <p className="text-sm uppercase tracking-wide text-gray-500">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="relative mx-auto flex w-full max-w-md justify-center"
          >
            <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-500/20 via-purple-500/15 to-pink-500/20 blur-3xl" />
            <div className="pointer-events-none select-none">
              <div className="relative rounded-[48px] border-[6px] border-black bg-black/95 p-2 shadow-[0_30px_120px_rgba(15,23,42,0.45)]" style={{ width: 390, height: 780 }}>
                <div className="absolute left-1/2 top-2 h-7 w-32 -translate-x-1/2 rounded-b-2xl bg-black" />
                <div className="h-full overflow-hidden rounded-[36px] bg-white relative">
                  {!templateLoading && featuredTemplate ? (
                    <MenuDisplay
                      menu={featuredTemplate}
                      businessName={featuredTemplate.name}
                      theme={featuredTemplateMeta.theme}
                      showFrame={false}
                      businessPlan="menu"
                      templateIcon={featuredTemplateMeta.templateIcon}
                      templateName={featuredTemplateMeta.templateName}
                      templateSubtitle={featuredTemplateMeta.templateSubtitle}
                      autoSelectFirstSize
                      autoSelectVariantOrder={[0, 1, 2]}
                    />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-4 bg-gradient-to-b from-slate-100 to-white">
                      <div className="h-16 w-16 animate-pulse rounded-2xl bg-slate-200" />
                      <p className="text-sm font-medium text-gray-500">Cargando plantilla...</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="pointer-events-none absolute -bottom-12 left-1/2 -translate-x-1/2 rounded-2xl border border-gray-200 bg-white/80 px-6 py-4 text-center shadow-lg backdrop-blur"
            >
              <p className="text-sm font-semibold text-gray-900">Plantilla interactiva en vivo</p>
              <p className="text-xs text-gray-500">Puedes cambiar colores, fotos y precios en segundos.</p>
            </motion.div>
          </motion.div>
        </div>

        {(recentBusinesses.length > 0 || metricsLoading) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15, duration: 0.7 }}
            className="mt-14 rounded-3xl border border-gray-200/70 bg-white/80 p-6 shadow-lg"
          >
            <div className="flex flex-col gap-2 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Clientes recientes</p>
                <p className="text-lg font-semibold text-gray-900">Últimos en activar su menú con logo</p>
              </div>
              <p className="text-sm text-gray-500">
                {recentBusinesses.length > 0
                  ? `Mostrando ${Math.min(recentBusinesses.length, 10)} negocios con logo`
                  : "Estamos buscando nuevos logos..."}
              </p>
            </div>

            <div className="relative min-h-[150px]">
              {metricsLoading && recentBusinesses.length === 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {Array.from({ length: 4 }).map((_, idx) => (
                    <div
                      key={`skeleton-${idx}`}
                      className="flex animate-pulse items-center gap-4 rounded-2xl border border-gray-200/60 bg-white/60 px-4 py-3"
                    >
                      <div className="h-14 w-14 rounded-full bg-gradient-to-br from-slate-200 to-slate-100" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 w-3/4 rounded-full bg-slate-200" />
                        <div className="h-3 w-1/2 rounded-full bg-slate-100" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={carouselIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.45 }}
                    className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
                  >
                    {currentCarouselGroup.map((business) => (
                      <div
                        key={business.id}
                        className="flex items-center gap-4 rounded-2xl border border-gray-200/80 bg-white/90 px-4 py-3 shadow-sm"
                      >
                        <div className="relative h-14 w-14 overflow-hidden rounded-full border border-white/60 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500">
                          {business.logo ? (
                            <div
                              className="h-full w-full"
                              style={{
                                backgroundImage: `url(${business.logo})`,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                              }}
                              role="img"
                              aria-label={`Logo de ${business.name}`}
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xl font-semibold text-white">
                              {getBusinessInitials(business.name)}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-gray-900">{business.name}</p>
                          <p className="text-xs text-gray-500">{getBusinessJoinLabel(business.created_at)}</p>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                </AnimatePresence>
              )}
            </div>

            {carouselGroups.length > 1 && (
              <div className="mt-5 flex justify-center gap-2">
                {carouselGroups.map((_, idx) => (
                  <button
                    key={`carousel-dot-${idx}`}
                    type="button"
                    onClick={() => setCarouselIndex(idx)}
                    className={`h-2.5 w-2.5 rounded-full transition ${
                      idx === carouselIndex ? "bg-blue-600" : "bg-gray-300 hover:bg-gray-400"
                    }`}
                    aria-label={`Mostrar grupo ${idx + 1} de clientes recientes`}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1, duration: 0.7 }}
          className="mt-20 grid gap-6 text-left sm:grid-cols-2 lg:grid-cols-4"
        >
          {featureHighlights.map((feature) => (
            <div key={feature.title} className="rounded-2xl border border-gray-200/70 bg-white/70 p-5 shadow-sm">
              <p className="text-base font-semibold text-gray-900">{feature.title}</p>
              <p className="mt-2 text-sm text-gray-600">{feature.description}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
