import { NextResponse } from "next/server";
import { requireUser, database, apiError } from "@/lib/server";
export async function POST(req) {
  try {
    const { collectionName, sourceId } = await req.json();
    await requireUser(collectionName || "");
    await database().delete(collectionName, { wait: true, filter: sourceId ? { must: [{ key: "metadata.sourceId", match: { value: sourceId } }] } : {} });
    return NextResponse.json({ success: true });
  } catch (error) { return apiError(error); }
}
