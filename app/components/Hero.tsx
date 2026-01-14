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
  country_code?: string | null;
};

const HERO_RECENT_BUSINESS_LIMIT = 10;
const DEFAULT_COUNTRY_FLAG = "🇪🇨";

const buildMarqueeBusinesses = (businesses: HeroBusiness[], minimum: number): HeroBusiness[] => {
  if (!businesses.length) return [];

  const base: HeroBusiness[] = [...businesses];

  if (base.length >= minimum) {
    return [...base, ...base];
  }

  while (base.length < minimum) {
    const remaining = minimum - base.length;
    base.push(...businesses.slice(0, remaining));
  }

  return [...base, ...base];
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

const getBusinessFlag = (countryCode?: string | null) => {
  if (!countryCode) return DEFAULT_COUNTRY_FLAG;

  const normalized = countryCode.trim().toUpperCase();

  switch (normalized) {
    case "PE":
      return "🇵🇪";
    case "CO":
      return "🇨🇴";
    case "AR":
      return "🇦🇷";
    case "CL":
      return "🇨🇱";
    case "MX":
      return "🇲🇽";
    default:
      return DEFAULT_COUNTRY_FLAG;
  }
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
                country_code:
                  typeof (item as { country_code?: string })?.country_code === "string"
                    ? (item as { country_code?: string }).country_code
                    : null,
              } satisfies HeroBusiness;
            })
            .filter(
              (business: HeroBusiness | null): business is HeroBusiness => business !== null
            )
            .slice(0, HERO_RECENT_BUSINESS_LIMIT);

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

  const marqueeBusinesses = useMemo(() => {
    if (!recentBusinesses.length) return [];
    return buildMarqueeBusinesses(recentBusinesses, HERO_RECENT_BUSINESS_LIMIT);
  }, [recentBusinesses]);

  const marqueeDuration = useMemo(() => {
    const uniqueCount = marqueeBusinesses.length / 2 || 1;
    return Math.max(18, uniqueCount * 2.8);
  }, [marqueeBusinesses.length]);

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

  const primaryCta = {
    href: user ? "/dashboard" : "/register",
    label: user ? "Ir al Dashboard" : "Crear menú gratis",
  };

  const secondaryCta = {
    href: user ? "/pricing" : "/login",
    label: user ? "Mejorar plan" : "Iniciar sesión",
  };

  return (
    <section className="relative overflow-hidden pt-16 pb-20 sm:pt-20 sm:pb-28">
      <div className="absolute inset-0 bg-gradient-to-b from-[#020617] via-[#03091b] to-[#040c23]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.25),_transparent_60%)]" />
      <div className="absolute inset-x-0 top-10 mx-auto h-64 w-[80%] rounded-full bg-gradient-to-r from-cyan-400 via-sky-500 to-indigo-600 opacity-40 blur-3xl" />
      <div className="absolute -bottom-32 left-1/2 h-72 w-[70%] -translate-x-1/2 rounded-full bg-cyan-500/20 blur-[140px]" />

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-left"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1 text-sm font-medium text-cyan-200 shadow-sm backdrop-blur">
              <span className="text-cyan-300">●</span> Nuevo panel 2025
            </span>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.8 }}
              className="mt-5 text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl lg:text-6xl"
            >
              Crea menús digitales elegantes
              <br />
              <span className="bg-gradient-to-r from-cyan-300 via-sky-400 to-blue-500 bg-clip-text text-transparent">
                y actívalos en minutos
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.8 }}
              className="mt-4 text-base text-slate-200 sm:text-lg"
            >
              Controla productos, fotos, precios y pagos desde cualquier sucursal con un único QR.
            </motion.p>

            <motion.ul
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.8 }}
              className="mt-5 space-y-3 text-sm text-white/80 sm:text-base"
            >
              {bulletPoints.map((point) => (
                <li key={point} className="flex items-start gap-3">
                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500" />
                  <span>{point}</span>
                </li>
              ))}
            </motion.ul>

            <div className="mt-10 flex w-full flex-col gap-4 sm:flex-row sm:flex-wrap">
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
                      className="inline-flex w-full min-w-[190px] items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-8 py-4 text-lg font-semibold text-slate-900 shadow-xl shadow-cyan-500/30 transition hover:shadow-2xl hover:shadow-cyan-500/40 sm:w-auto"
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
                    className="w-full min-w-[190px] rounded-2xl bg-gray-200/70 px-8 py-4 sm:w-auto"
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
                      className="inline-flex w-full min-w-[190px] items-center justify-center rounded-2xl border border-white/20 bg-transparent px-8 py-4 text-lg font-semibold text-white shadow-sm transition hover:bg-white/10 sm:w-auto"
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
                    className="w-full min-w-[190px] rounded-2xl border border-gray-200 px-8 py-4 sm:w-auto"
                  />
                )}
              </AnimatePresence>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.8 }}
              className="mt-10 grid gap-4 text-left sm:grid-cols-3 lg:gap-6"
            >
              {heroStats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-white/15 bg-white/10 px-5 py-4 shadow-sm backdrop-blur"
                >
                  <p className="text-3xl font-semibold text-white">{stat.value}</p>
                  <p className="text-sm uppercase tracking-wide text-slate-300">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="relative mx-auto flex w-full max-w-sm justify-center md:max-w-md"
          >
            <div className="absolute inset-0 -z-10 bg-gradient-to-br from-cyan-400/30 via-sky-500/20 to-blue-800/40 blur-3xl" />
            <div className="pointer-events-none select-none">
              <div
                className="relative rounded-[48px] border-[6px] border-black bg-black/95 p-2 shadow-[0_30px_120px_rgba(15,23,42,0.45)]"
                style={{ width: "min(360px, 90vw)", height: "min(720px, 180vw)" }}
              >
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
              className="pointer-events-none absolute -bottom-12 left-1/2 hidden -translate-x-1/2 rounded-2xl border border-gray-200 bg-white/80 px-6 py-4 text-center shadow-lg backdrop-blur sm:block"
            >
              <p className="text-sm font-semibold text-gray-900">Plantilla interactiva en vivo</p>
              <p className="text-xs text-gray-500">Puedes cambiar colores, fotos y precios en segundos.</p>
            </motion.div>

            <div className="mt-4 w-full rounded-2xl border border-gray-200 bg-white/80 px-4 py-3 text-center text-sm text-gray-900 shadow-sm sm:hidden">
              <p className="font-semibold">Plantilla interactiva en vivo</p>
              <p className="text-xs text-gray-500">Puedes cambiar colores, fotos y precios en segundos.</p>
            </div>
          </motion.div>
        </div>

        {(recentBusinesses.length > 0 || metricsLoading) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15, duration: 0.7 }}
            className="mt-14"
          >
            <div className="relative left-1/2 w-screen -translate-x-1/2 px-3 sm:px-8 lg:px-10">
              <div className="mx-auto max-w-6xl">
                <div className="flex flex-col items-center gap-1.5 pb-2 text-center">
                  <p className="text-lg font-semibold text-white">Negocios recientes</p>
                  <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/70">activaciones en tiempo real</p>
                </div>

                <div className="relative min-h-[90px] sm:min-h-[110px]">
              {metricsLoading && recentBusinesses.length === 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {Array.from({ length: 4 }).map((_, idx) => (
                    <div
                      key={`skeleton-${idx}`}
                      className="flex animate-pulse items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3.5 py-2 text-white/70"
                    >
                      <div className="h-11 w-11 rounded-full bg-gradient-to-br from-cyan-500/30 to-slate-900" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 w-3/4 rounded-full bg-white/20" />
                        <div className="h-3 w-1/2 rounded-full bg-white/10" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentBusinesses.length === 0 ? (
                <div className="flex h-32 flex-col items-center justify-center text-center text-sm text-slate-300">
                  <p>Aún no hay clientes con logos cargados.</p>
                  <p className="text-xs text-slate-500">Vuelve pronto para ver nuevas activaciones.</p>
                </div>
              ) : (
                <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-white/10 px-2.5 py-2 shadow-[0_20px_70px_rgba(2,6,23,0.6)] backdrop-blur">
                  <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#040c23] via-[#040c23]/80 to-transparent" />
                  <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#040c23] via-[#040c23]/80 to-transparent" />

                  <motion.div
                    className="flex w-max min-w-full items-center gap-3 py-1"
                    animate={{ x: ["0%", "-50%"] }}
                    transition={{ duration: marqueeDuration, ease: "linear", repeat: Infinity }}
                  >
                    {marqueeBusinesses.map((business, idx) => (
                      <div
                        key={`marquee-business-${business.id}-${idx}`}
                        className="flex min-w-[180px] flex-1 items-center gap-3 rounded-2xl border border-white/15 bg-white/5 px-3 py-2 text-white shadow-sm"
                      >
                        <div className="relative h-11 w-11 overflow-hidden rounded-full border border-white/40 bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 shadow-lg shadow-cyan-500/20">
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
                          <p className="truncate text-sm font-semibold text-white">{business.name}</p>
                          <div className="flex items-center gap-1 text-[11px] text-cyan-100/80">
                            <span className="text-sm" role="img" aria-label="País del negocio">
                              {getBusinessFlag(business.country_code)}
                            </span>
                            <span>{getBusinessJoinLabel(business.created_at)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                </div>
              )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

      </div>
    </section>
  );
}
