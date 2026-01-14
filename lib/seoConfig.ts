import type { Metadata } from "next";

export interface SeoConfig {
  siteName: string;
  siteUrl: string;
  defaultTitle: string;
  titleTemplate: string;
  description: string;
  keywords: string[];
  ogImage: string;
  logo: string;
  twitterHandle: string;
  locale: string;
  sameAs: string[];
}

export interface PageSeoOverrides {
  title?: string;
  titleTemplate?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  path?: string;
  noIndex?: boolean;
}

export const seoConfig: SeoConfig = {
  siteName: "Scanela",
  siteUrl: "https://scanela.com",
  defaultTitle: "Creador de menú QR interactivo para restaurantes | Scanela",
  titleTemplate: "%s | Scanela",
  description:
    "Scanela es la plataforma líder en LATAM para crear menús digitales con QR interactivo, pedidos online, pagos integrados y analítica en tiempo real para restaurantes.",
  keywords: [
    "menu qr",
    "crear menu qr",
    "menu qr interactivo",
    "carta digital",
    "menu digital restaurante",
    "menu qr gratis",
    "menu qr con pagos",
    "qr para restaurantes",
    "menu digital latinoamerica",
    "plataforma menu qr",
  ],
  ogImage: "/og-default.svg",
  logo: "/og-default.svg",
  twitterHandle: "@scanela",
  locale: "es_EC",
  sameAs: [
    "https://www.facebook.com/scanela",
    "https://www.instagram.com/scanela",
    "https://www.linkedin.com/company/scanela",
    "https://x.com/scanela",
  ],
};

export const faqEntries = [
  {
    question: "¿Qué es un menú QR interactivo y cómo me ayuda Scanela?",
    answer:
      "Un menú QR interactivo permite que tus clientes escaneen un código para ver tu carta digital desde el móvil. Scanela te da un editor completo para actualizar precios, fotos, descripciones y disponibilidad en tiempo real sin imprimir nada.",
  },
  {
    question: "¿Necesito programar para crear un menú digital con Scanela?",
    answer:
      "No necesitas conocimientos técnicos. Solo subes tus productos, eliges una plantilla profesional y Scanela genera automáticamente tu código QR listo para compartir en mesas, redes sociales o delivery.",
  },
  {
    question: "¿Puedo cobrar pedidos directamente desde mi menú QR?",
    answer:
      "Sí, Scanela integra pasarelas como Stripe y Mercado Pago para aceptar tarjetas, billeteras digitales y pagos locales sin salir del menú digital.",
  },
  {
    question: "¿Scanela funciona para cadenas con múltiples sucursales?",
    answer:
      "Está diseñada para restaurantes con una o varias sucursales. Puedes controlar inventario, horarios, variaciones y analítica por local desde un mismo dashboard.",
  },
  {
    question: "¿Cómo ayuda Scanela al posicionamiento de mi restaurante en Google?",
    answer:
      "Además de tu menú QR, obtienes enlaces optimizados y datos estructurados que mejoran tu presencia en buscadores, con la opción de insertar el menú en tu web y compartirlo en redes sociales.",
  },
];

export const buildMetadata = (overrides?: PageSeoOverrides): Metadata => {
  const title = overrides?.title ?? seoConfig.defaultTitle;
  const description = overrides?.description ?? seoConfig.description;
  const keywords = overrides?.keywords ?? seoConfig.keywords;
  const ogImage = overrides?.ogImage ?? `${seoConfig.siteUrl}${seoConfig.ogImage}`;
  const canonicalUrl = overrides?.path
    ? `${seoConfig.siteUrl}${overrides.path}`
    : seoConfig.siteUrl;

  return {
    metadataBase: new URL(seoConfig.siteUrl),
    title: {
      default: title,
      template: overrides?.titleTemplate ?? seoConfig.titleTemplate,
    },
    description,
    keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: seoConfig.siteName,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: seoConfig.locale,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      site: seoConfig.twitterHandle,
      creator: seoConfig.twitterHandle,
      title,
      description,
      images: [ogImage],
    },
    robots: {
      index: overrides?.noIndex ? false : true,
      follow: overrides?.noIndex ? false : true,
    },
  };
};

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: seoConfig.siteName,
  url: seoConfig.siteUrl,
  logo: `${seoConfig.siteUrl}${seoConfig.logo}`,
  sameAs: seoConfig.sameAs,
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    email: "hola@scanela.com",
    availableLanguage: ["es", "en"],
  },
};

export const productSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Scanela",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    description: "Plan gratuito para crear menús QR ilimitados",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    ratingCount: 120,
  },
  description: seoConfig.description,
  url: seoConfig.siteUrl,
  image: `${seoConfig.siteUrl}${seoConfig.ogImage}`,
};

export const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqEntries.map((entry) => ({
    "@type": "Question",
    name: entry.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: entry.answer,
    },
  })),
};
