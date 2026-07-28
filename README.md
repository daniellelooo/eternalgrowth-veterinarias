# Veterinarias

Módulo B — Plataforma para veterinarias construida con Next.js, Tailwind CSS, shadcn/ui y Supabase.

## Requisitos

- Node.js v25
- pnpm

## Setup

```bash
pnpm install
cp .env.example .env.local
# completar las variables en .env.local
pnpm dev
```

## Scripts

- `pnpm dev` — servidor de desarrollo
- `pnpm build` — build de producción
- `pnpm start` — iniciar build de producción
- `pnpm lint` — lint con ESLint
- `pnpm typecheck` — chequeo de tipos con TypeScript
- `pnpm test` — tests con Vitest

## Variables de entorno

Ver `.env.example` para la lista completa de variables requeridas (Supabase, n8n, credenciales de admin).
