# packages/web — Next.js Frontend

Next.js 15 app for the ERP Migration Live Demo. Deployed to AWS via SST v4 + OpenNext + CloudFront.

**Live:** https://d1lz772m0ovkmh.cloudfront.net

---

## Dev

```bash
npm install
npm run dev        # http://localhost:3000
```

Calls live Lambda URL by default via `NEXT_PUBLIC_API_URL`.

## Build

```bash
npm run build      # verifies standalone output + react in node_modules
```

> The build script runs `postbuild.mjs` which copies react/react-dom/scheduler into `.next/standalone/node_modules/` — required for the Lambda bundle. Do not remove it.

## Key files

| File | Purpose |
|------|---------|
| `src/app/page.tsx` | Main page — 3 tabs: Strangler Fig, Billing Rules, Observability |
| `src/app/layout.tsx` | Root layout with ThemeRegistry (MUI SSR emotion cache) |
| `src/components/ThemeRegistry.tsx` | MUI + emotion SSR fix for Next.js App Router |
| `src/components/ObservabilityDemo.tsx` | Live log stream demo (Q6) |
| `next.config.ts` | Do NOT add `outputFileTracingRoot` — breaks standalone output path |
| `open-next.config.ts` | OpenNext config for SST bundling |
