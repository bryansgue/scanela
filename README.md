# Scanela - Sistema de Gestión de Menús

Plataforma para que restaurantes creen y gestionen sus menús digitales con soporte para planes, suscripciones y compartir menús en redes sociales.

## Stack Tecnológico

- **Framework**: Next.js 16.3
- **React**: 18
- **TypeScript**: Tipado completo
- **Base de Datos**: Supabase (PostgreSQL)
- **Autenticación**: OAuth + JWT
- **Estilos**: Tailwind CSS

## Características Principales

✅ Gestión de múltiples restaurantes
✅ Editor de menús con drag & drop
✅ Importación de menús desde JSON
✅ Variantes de productos (tamaños, sabores, extras)
✅ Combinaciones (mitad-mitad)
✅ Tema personalizable con 12 colores
✅ Preview en tiempo real
✅ Sistema de planes
✅ Publicación en redes sociales
✅ Historial de cambios

## Instalación

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Estructura del Proyecto

```
app/
├── api/                 # Endpoints API
├── auth/               # Autenticación
├── dashboard/          # Panel de control
├── components/         # Componentes compartidos
├── context/           # Contexto global
├── lib/               # Utilidades
└── types/             # Tipos TypeScript
```

## Variables de Entorno

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_MENU_MONTHLY=
STRIPE_PRICE_MENU_ANNUAL=
STRIPE_PRICE_VENTAS_MONTHLY=
STRIPE_PRICE_VENTAS_ANNUAL=
```

## Scripts útiles

- `npm run inspect:supabase`: imprime datos clave de Supabase (negocios, menús, órdenes y suscripciones) usando tu `.env.local`.
- Revisa `STRIPE_SETUP.md` para pasos detallados de configuración de claves y webhooks.

## SEO configurable

- Edita `lib/seoConfig.ts` para definir el título por defecto, la descripción, las palabras clave, el template para las páginas y la imagen Open Graph (`public/og-default.svg`).
- Cuando necesites un mensaje distinto para una página específica, importa el objeto y sobrescribe los campos en el archivo de página usando `generateMetadata`.
- Cambia `siteUrl` por tu dominio real antes de desplegar para que las etiquetas canonical y Open Graph apunten a la URL correcta.
- Puedes reemplazar `public/og-default.svg` por cualquier imagen 1200x630 px; solo mantén la ruta actualizada en el archivo de configuración.

## Licencia

Privado
# scanela
# scanela
