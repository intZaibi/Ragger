import { NextResponse } from "next/server";
import { QdrantClient } from "@qdrant/js-client-rest";
import { auth } from "@clerk/nextjs/server";

// Helper function to create a URL-safe slug
function slugify(text) {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')     // Replace spaces with -
        .replace(/[^\w\-]+/g, '') // Remove all non-word chars
        .replace(/\-\-+/g, '-');  // Replace multiple - with single -
}

/**
 * Handles POST requests to /api/createCollection
 * Creates a new, user-specific collection in Qdrant.
 */
export async function POST(req) {
    try {
        // 1. Authenticate the user using Clerk
        const { userId } = await auth();
        
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 2. Get the book name from the request body
        const { bookName } = await req.json();
        if (!bookName) {
            return NextResponse.json({ error: "bookName is required." }, { status: 400 });
        }

        // 3. Create a unique and safe collection name
        const safeBookName = slugify(bookName);
        const collectionName = `${userId.slice(0, 10)}-${safeBookName}`;

        // 4. Initialize Qdrant client
        const client = new QdrantClient({
            url: process.env.QDRANT_URL,
            apiKey: process.env.QDRANT_API_KEY,
            checkCompatibility: false,
        });

        // 5. Create the new collection in Qdrant
        console.log(`Creating collection: ${collectionName}`);
        await client.createCollection(collectionName, {
            vectors: {
                size: 3072, // Vector size for OpenAI's text-embedding-3-large
                distance: "Cosine",
            },
        });
        console.log(`Collection '${collectionName}' created successfully.`);

        // 6. Return the new collection name to the frontend
        return NextResponse.json({
            message: "Collection created successfully.",
            collectionName: collectionName,
        });

    } catch (error) {
        console.error("Error creating collection:", error);
        const errorMessage = error?.message || error?.data?.status?.error || "Failed to create the collection.";
        
        // Check for specific Qdrant errors, e.g., collection already exists
        if (errorMessage.includes("already exists")) {
            return NextResponse.json(
                { error: "A collection with this name already exists." },
                { status: 409 } // 409 Conflict
            );
        }
        return NextResponse.json(
            { error: errorMessage },
            { status: error?.status || 500 }
        );
    }
}
