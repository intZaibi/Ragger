import { NextResponse } from "next/server";
import { requireUser, database, apiError, readSources } from "@/lib/server";
import { ownsCollection, notebookName } from "@/lib/notebooks.mjs";
export async function GET(req) {
  try {
    const collectionName = new URL(req.url).searchParams.get("collectionName");
    const userId = await requireUser(collectionName || undefined);
    const client = database();
    if (collectionName) return NextResponse.json({ sources: await readSources(client, collectionName), name: notebookName(collectionName, userId) });
    const { collections } = await client.getCollections();
    const notebooks = await Promise.all(collections.filter(({ name }) => ownsCollection(userId, name)).map(async ({ name }) => {
      const info = await client.getCollection(name);
      return { id: name, name: notebookName(name, userId), chunks: info.points_count || 0 };
    }));
    return NextResponse.json({ notebooks });
  } catch (error) { return apiError(error); }
}
export async function DELETE(req) {
  try {
    const { collectionName } = await req.json();
    await requireUser(collectionName || "");
    await database().deleteCollection(collectionName);
    return NextResponse.json({ success: true });
  } catch (error) { return apiError(error); }
}
