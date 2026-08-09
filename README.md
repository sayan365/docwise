# JargonBuster

JargonBuster turns dense contracts, leases, insurance documents, and financial terms into clear summaries. It highlights important takeaways, calls out risky clauses, supports follow-up questions, and can read a summary aloud.

> AI analysis can make mistakes. JargonBuster is an explainer, not a substitute for advice from a qualified professional.

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

Uploaded content, analyses, and conversations are cached locally in the browser with IndexedDB so History, Insights, and document Q&A survive refreshes. They are not written to an application database. Use **Settings → Clear Document History** to remove the local cache, and configure your deployment and AI provider retention policies appropriately before using sensitive documents.
