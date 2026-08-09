# DocWise

DocWise turns dense contracts, leases, insurance documents, and financial terms into clear summaries. It highlights important takeaways, calls out risky clauses, supports follow-up questions, and can read a summary aloud.

> AI analysis can make mistakes. DocWise is an explainer, not a substitute for advice from a qualified professional.

## Local setup

Requirements: Node.js 20 or newer and a Gemini API key.

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env` and replace the placeholder `GEMINI_API_KEY`.
3. Start the app with `npm run dev`.
4. Open `http://localhost:3000`.

## Commands

- `npm run dev` — start the Express API and Vite development server
- `npm run lint` — run the TypeScript check
- `npm run build` — create the browser and server production bundles
- `npm start` — run the production bundle
- `npm run clean` — remove generated build files

## Deploying to Vercel

The repository includes a Vite frontend configuration and a catch-all Vercel Function for `/api/*`.

1. Import the repository into Vercel.
2. Add `GEMINI_API_KEY` under **Project Settings → Environment Variables** for Production and Preview.
3. Redeploy after saving the environment variable.
4. Visit `/api/health` on the deployment and confirm `"aiConfigured": true`.

Vercel Functions limit request bodies to 4.5 MB. Small PDFs and images work directly; larger document support requires direct file storage/upload rather than Base64 through the function.

Uploaded content, analyses, and conversations are cached locally in the browser with IndexedDB so History, Insights, and document Q&A survive refreshes. They are not written to an application database. Use **Settings → Clear Document History** to remove the local cache, and configure your deployment and AI provider retention policies appropriately before using sensitive documents.
