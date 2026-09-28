# TextToolbox

Free online text tools. Next.js (App Router) + TypeScript + Tailwind CSS v4. All processing runs client-side; there is no backend, database, login or AI.

## Run locally
    npm install
    cp .env.example .env.local   # then edit values
    npm run dev                  # http://localhost:3000
    npm test                     # unit tests for every tool's logic
    npm run build && npm start   # production build

## Environment variables (.env.local locally, Vercel > Settings > Environment Variables in production)
- NEXT_PUBLIC_SITE_URL: your live domain, no trailing slash. Drives canonical URLs, sitemap, robots, Open Graph.
- NEXT_PUBLIC_GA_ID: GA4 measurement ID (G-XXXX). Empty = no analytics loaded.
- NEXT_PUBLIC_GSC_VERIFICATION: Search Console HTML-tag token (the content value only).
- NEXT_PUBLIC_ADSENSE_CLIENT: ca-pub-... ID. Empty = no ad script, no ad boxes.
- NEXT_PUBLIC_ADSENSE_SLOT_BANNER / _BELOW_TOOL / _CONTENT / _SIDEBAR: ad unit IDs. A position renders only when the client ID and its slot ID are set.
- NEXT_PUBLIC_CONTACT_EMAIL: shown on /contact. Empty = placeholder message.

## Deploy to Vercel
Push to GitHub, import the repo at vercel.com/new (framework auto-detected), add the env vars above, deploy, then attach your domain, set NEXT_PUBLIC_SITE_URL to it and redeploy.

## Adding a tool
Add the function to lib/process.ts, its slug to lib/runners.ts, and an entry (unique title, description, content, FAQs) to lib/tools.ts. The page, sitemap entry and tests pick it up automatically.

## File upload (TXT, CSV, DOCX, PDF)
Every tool page can load a file into the existing textarea. Parsing is client-side only (`lib/extract.ts`). `mammoth` (DOCX) and `pdfjs-dist` (PDF) are dynamically imported on first use, so they add nothing to the normal paste workflow. The PDF.js worker is copied to `public/pdf.worker.min.mjs` by `npm install` (postinstall) so it is served from your own domain. Limits: 10 MB per file, 5 million characters of extracted text. No OCR: scanned PDFs show a friendly message.
