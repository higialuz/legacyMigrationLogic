# erp-live — ERP Migration Live Demo

Live interactive demo running on AWS, showcasing three architectural patterns from a real ERP legacy migration.

**Live URL:** https://d1lz772m0ovkmh.cloudfront.net  
**Full showcase (Q1–Q8 + Bonus):** https://elmoluz.com  
**GitHub:** https://github.com/higialuz/legacyMigrationLogic

---

## What this is

A Next.js app deployed on AWS via SST v4, with a Lambda function backend. Three interactive demos answer three of the eight test questions with real API calls — not mocked.

| Tab | Pattern | Question |
|-----|---------|----------|
| 🔀 Strangler Fig Router | Feature-flag routing between legacy IIS and new Lambda | Q7 |
| 🧮 Multi-client Billing Rules | Strategy Pattern — per-client rule registry, zero if/else | Q3 |
| 🔍 Observability | Structured audit trace — live log stream + support dashboard | Q6 |

---

## Stack

- **Frontend:** Next.js 15 · React 19 · MUI v6 · TypeScript
- **Backend:** AWS Lambda (Node.js 22) · Lambda Function URL
- **Infrastructure:** SST v4 · CloudFront · OpenNext
- **Monorepo:** npm workspaces (`packages/web`, `packages/functions`)

---

## Local development

```bash
# Install dependencies
npm install

# Run frontend locally
cd packages/web && npm run dev
```

The frontend calls the live Lambda URL by default (`NEXT_PUBLIC_API_URL` in env).

---

## Deploy

```bash
# Build check first
cd packages/web && npm run build

# Deploy to AWS
cd ../..
npx sst deploy --stage production
```

> Do NOT run `sst deploy` from an agent tool — run it in your own terminal (SST is interactive).

---

## Project structure

```
erp-live/
├── packages/
│   ├── web/                  # Next.js app
│   │   └── src/
│   │       ├── app/          # page.tsx, layout.tsx
│   │       └── components/   # ObservabilityDemo, ThemeRegistry, etc.
│   └── functions/
│       └── src/handler.js    # Lambda: /billing/calculate, /strangler/route, /audit/trace
├── sst.config.ts             # SST infrastructure
├── MAS/                      # MAR agent scaffold + project docs
└── LASTSESSION.md            # Session continuity notes
```
