import "./globals.css";
import { Providers } from "./providers";
import { buildMetadata, faqSchema, organizationSchema, productSchema } from "../lib/seoConfig";

export const metadata = buildMetadata();

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-gray-50 text-gray-900">
        <StructuredDataScripts />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

function StructuredDataScripts() {
  const schemas = [organizationSchema, productSchema, faqSchema];

  return (
    <>
      {schemas.map((schema, index) => (
        <script
          key={`schema-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}
