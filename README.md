# MY-PORTFOLIO

Portfolio site for Chinedu David, built with React, Vite, and Tailwind CSS.

## Development

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
npm run preview
```

## Vercel settings

- Framework preset: `Vite`
- Build command: `npm run build`
- Build output directory: `dist`
- Install command: `npm install`

## Environment variables

Optional variables used by the portfolio API routes:

- `RESEND_API_KEY` for CV email delivery
- `RESEND_FROM_EMAIL` verified sender address for outgoing CV emails
- `RESEND_FROM_NAME` sender display name
- `SUPPORT_EMAIL` reply-to contact address

## Portfolio API routes

- `GET /api/cv-download`
- `POST /api/send-cv`
- `GET /api/location`
