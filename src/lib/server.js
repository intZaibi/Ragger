import { auth } from "@clerk/nextjs/server";
import { QdrantClient } from "@qdrant/js-client-rest";
import { NextResponse } from "next/server";
import { ownsCollection } from "./notebooks.mjs";
export function fail(message, status = 400) { return Object.assign(new Error(message), { status }); }
export async function requireUser(collectionName) {
  const { userId } = await auth();
  if (!userId) throw fail("Please sign in to continue.", 401);
  if (collectionName !== undefined && !ownsCollection(userId, collectionName)) throw fail("Notebook not found.", 404);
  return userId;
}
export function database() {
  if (!process.env.QDRANT_URL) throw fail("Set QDRANT_URL to connect your notebook storage.", 503);
  return new QdrantClient({ url: process.env.QDRANT_URL, apiKey: process.env.QDRANT_API_KEY, checkCompatibility: false });
}
export function requireAI() {
  if (!process.env.OPENAI_API_KEY) throw fail("Set OPENAI_API_KEY to enable indexing and answers.", 503);
}
export function apiError(error) {
  if (error instanceof SyntaxError) return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  console.error("Notebook request failed:", error.message);
  return NextResponse.json({ error: error.status ? error.message : "Something went wrong. Please try again." }, { status: error.status || 500 });
}
export async function readSources(client, collectionName) {
  const sources = new Map();
  let offset;
  do {
    const page = await client.scroll(collectionName, { limit: 250, with_payload: true, with_vector: false, ...(offset !== undefined ? { offset } : {}) });
    for (const point of page.points) {
      const meta = point.payload?.metadata || {};
      const id = meta.sourceId || meta.source;
      if (!id) continue;
      const previous = sources.get(id);
      sources.set(id, { id, name: meta.source || "Untitled source", type: meta.type || "text", createdAt: meta.createdAt || null, chunks: (previous?.chunks || 0) + 1 });
    }
    offset = page.next_page_offset;
  } while (offset !== null && offset !== undefined);
  return [...sources.values()];
}
