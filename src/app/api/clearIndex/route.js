import "dotenv/config";
import { NextResponse } from "next/server";
import { QdrantClient } from "@qdrant/js-client-rest";

/**
 * Handles POST requests to /api/clearIndex
 * This endpoint deletes and then recreates the "ragCollection" in Qdrant,
 * effectively clearing all indexed data.
 */
export async function POST() {
    try {
        // 1. Initialize Qdrant client
        const client = new QdrantClient({
            url: process.env.QDRANT_URL,
            apiKey: process.env.QDRANT_API_KEY,
        });

        const collectionName = "ragCollection";

        // 2. Delete the existing collection
        console.log(`Attempting to delete collection: ${collectionName}`);
        const deleteResult = await client.deleteCollection(collectionName);
        if (!deleteResult) {
            console.warn(`Collection '${collectionName}' might not have existed, but proceeding to create.`);
        } else {
            console.log(`Collection '${collectionName}' deleted successfully.`);
        }

        // 3. Recreate the collection with the correct configuration
        // The vector size for "text-embedding-004" is 768.
        console.log(`Recreating collection: ${collectionName}`);
        await client.createCollection(collectionName, {
            vectors: {
                size: 768, // Vector size for Google's text-embedding-004
                distance: "Cosine",
            },
        });
        console.log(`Collection '${collectionName}' recreated successfully.`);

        // 4. Return a success response
        return NextResponse.json({
            message: "All sources have been cleared successfully.",
        });

    } catch (error) {
        console.error("Error clearing index:", error);
        return NextResponse.json(
            { error: "Failed to clear the index." },
            { status: 500 }
        );
    }
}
