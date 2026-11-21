# MY-PORTFOLIO

Portfolio site for Chinedu David, built with React, Vite, and Tailwind CSS.

## Development

```bash
npm install
npm run dev
```

Use `vercel dev` when testing the API routes locally. The Vite dev server serves the frontend.

## Production build

```bash
npm run build
npm run preview
```

The build prerenders Home, Projects, Contact, and the static 404 page.

## Project structure

```text
api/              Vercel serverless routes and API-only helpers
public/           Static public assets
shared/           Code shared by the frontend and API routes
shared/cv/        CV profile data plus CV document builders
src/              React application source
src/components/   Reusable UI and layout components
src/hooks/        React hooks
src/pages/        Route-level page components
```

## Vercel settings

- Framework preset: `Vite`
- Build command: `npm run build`
- Build output directory: `dist`
- Install command: `npm install`

## Environment variables

Use `.env.example` as the template for local settings. Vercel uses the same variable names.

- `RESEND_API_KEY` enables CV and contact email delivery
- `RESEND_FROM_EMAIL` verified sender address for CV and contact emails
- `SUPPORT_EMAIL` reply-to contact address
- `CONTACT_TO_EMAIL` inbox for project requests. Defaults to `SUPPORT_EMAIL`, then the profile email.
- `RATE_LIMIT_REDIS_REST_URL` and `RATE_LIMIT_REDIS_REST_TOKEN` for persistent API rate limiting. Vercel KV/Upstash `KV_REST_API_*` or `UPSTASH_REDIS_REST_*` names are also supported.

## Portfolio API routes

- `GET /api/cv-download` serves PDF by default. Use `?format=word` for DOCX or `?format=doc` for legacy Word-compatible HTML.
- `POST /api/send-cv`
- `POST /api/contact`
- `GET /api/location`

Country currencies use [Unicode CLDR 48.2 supplemental currency data](https://github.com/unicode-org/cldr-json/blob/48.2.0/cldr-json/cldr-core/supplemental/currencyData.json). The form shows USD if a local exchange rate is unavailable.
