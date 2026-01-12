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

## Licencia

Privado
# scanela
# scanela
