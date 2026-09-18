import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { requireUser, database, apiError, fail } from "@/lib/server";
import { makeCollectionName, VECTOR_SIZE } from "@/lib/notebooks.mjs";
export async function POST(req) {
  try {
    const userId = await requireUser();
    const { bookName } = await req.json();
    let collectionName;
    try { collectionName = makeCollectionName(userId, bookName, randomUUID().slice(0, 8)); }
    catch (error) { throw fail(error.message); }
    const client = database();
    await client.createCollection(collectionName, { vectors: { size: VECTOR_SIZE, distance: "Cosine" } });
    try {
      await client.createPayloadIndex(collectionName, { field_name: "metadata.sourceId", field_schema: "keyword", wait: true });
    } catch (error) {
      await client.deleteCollection(collectionName).catch(() => {});
      throw error;
    }
    return NextResponse.json({ collectionName });
  } catch (error) { return apiError(error); }
}
