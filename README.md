# Marginalia

A small notebook for your documents, notes, and web pages. Add sources, ask questions, and inspect the passages behind each answer.

## Run locally

Use Node.js 22 or newer.

1. Run `npm ci`.
2. Copy `.env.example` to `.env.local` and fill in your keys.
3. Start Qdrant with `docker compose up -d`, or use Qdrant Cloud.
4. Run `npm run dev` and open http://localhost:3000.

Clerk handles sign-in through a modal. Configure your localhost and production origins in your Clerk application. Never expose server keys as NEXT_PUBLIC variables.

## Environment

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Clerk publishable key.
- `CLERK_SECRET_KEY`: Clerk secret key.
- `OPENAI_API_KEY`: embeddings and answer generation.
- `QDRANT_URL`: http://localhost:6333 locally, or your Qdrant Cloud URL.
- `QDRANT_API_KEY`: required for Qdrant Cloud, optional locally.
- `OPENAI_CHAT_MODEL`: optional, defaults to gpt-4o.

Embeddings consistently use text-embedding-3-large (3072 dimensions). Do not change the embedding model without reindexing your data.

## What is included

- Responsive, light/dark interface styled with Tailwind utilities.
- Real notebook creation, listing, search, opening, and deletion.
- PDF, TXT, CSV, pasted text, and single public HTTPS-page ingestion.
- Sources restored from Qdrant when reopening a notebook.
- Source deletion that removes the indexed data.
- Source-specific summaries, generated on request.
- Answers with expandable supporting excerpts, copy, and Markdown export.
- Conversation recovery in the current browser tab using sessionStorage.
- Three trial questions per user, tracked in Clerk private metadata.
- Authentication and full-user-ID ownership checks on notebook APIs.

The landing-page conversation is clearly labeled as an illustration. Real notebooks start empty. The interface is inspired by [Aceternity’s spotlight](https://ui.aceternity.com/components/spotlight-new) and card treatments, implemented with Tailwind and the existing Framer Motion dependency.

## Keep it simple

There is no billing, public API-key system, embedded chatbot, or shared workspace. Each question is answered independently; previous messages are not supplied as model context. Uploaded source text is processed on the server, sent to OpenAI, and saved in Qdrant. Browser conversation history is not cloud-synced.

Files are limited to 10 MB and extracted text to 200,000 characters. Scanned PDFs need OCR first. Web imports read one HTML/text page and do not execute JavaScript. They only support public HTTPS hosts with IPv4 addresses. Summaries use up to 100 passages / 40,000 characters and disclose when an excerpt is used.

Trial credits are intended for a small demo, not billing enforcement: Clerk metadata updates are not transactional across concurrent requests. The project owner can replenish a user's `privateMetadata.credits` in Clerk. There is no inactive upgrade button.

## Existing data

Older Ragger collections used only the first 10 characters of a Clerk user ID and did not store reliable ownership. They are left untouched and excluded from the new library. Re-import their original sources into new notebooks after signing in; do not automatically assign legacy collections based on the truncated prefix.

## Checks

- `npm run lint`
- `npm test`
- `npm run build`

Tests cover collection ownership, notebook name validation, and public-URL restrictions. Live AI tests require configured Clerk, OpenAI, and Qdrant services.

## Small future additions

1. Rename a notebook without changing its underlying collection.
2. Cloud conversation history, if cross-device access becomes useful.
3. OCR for scanned PDFs, only if those are a common input.

Avoid adding billing, teams, or a complex dashboard until the core notebook workflow needs them.
