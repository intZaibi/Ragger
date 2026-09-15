import "dotenv/config";
import { NextResponse } from "next/server";
import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";
import OpenAI from "openai";

/**
 * Handles POST requests to /api/summary
 * Expects a JSON body with a "sourceText".
 * It searches for the most relevant document in Qdrant based on the sourceText
 * and then generates a summary of that document's content.
 */
export async function POST(req) {
    const { sourceText, collectionName     } = await req.json();

    if (!sourceText || typeof sourceText !== 'string') {
        return NextResponse.json(
            { error: "sourceText is required and must be a string." },
            { status: 400 }
        );
    }

    try {
        // 1. Find the relevant document in Qdrant using OpenAI embeddings
        const embeddings = new OpenAIEmbeddings({
            apiKey: process.env.OPENAI_API_KEY,
            model: "text-embedding-3-large",
        });

        const vectorStore = await QdrantVectorStore.fromExistingCollection(
            embeddings,
            {
                url: process.env.QDRANT_URL,
                apiKey: process.env.QDRANT_API_KEY,
                collectionName: collectionName,
            }
        );

        const queryEmbedding = await embeddings.embedQuery(sourceText);
        const result = await vectorStore.client.search(collectionName, {
            vector: queryEmbedding,
            limit: 1,
            with_payload: true,
        });
        // console.log(result);

        // FIX: The payload field from our setup is 'text', not 'content'.
        if (!result || result.length === 0 || !result[0].payload?.content) {
            return NextResponse.json(
                { error: "Source document not found in Qdrant." },
                { status: 404 }
            );
        }

        const retrievedContent = result[0].payload.content;

        // 2. Build the summary prompt
        const SYSTEM_PROMPT = `
You are a summarization assistant.
Your task is to generate a **clear, concise, and factual summary** of the provided source text.
Do not add opinions, outside knowledge, or speculation.
The summary must capture the key points of the text in a way that is easy to read.

RESPONSE FORMAT:
{
  "summary": "The summary text in full sentences."
}

TEXT TO SUMMARIZE:
${retrievedContent}
`;

        // 3. Call OpenAI to generate the summary
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [{ role: "user", content: SYSTEM_PROMPT }],
            response_format: { type: "json_object" },
        });
        const summaryText = completion.choices[0].message.content;

        // 4. Return the summary
        // The model returns a string, so we need to parse it to send valid JSON.
        const summaryObject = JSON.parse(summaryText);

        return NextResponse.json(summaryObject);

    } catch (error) {
        console.error("Error generating summary:", error);
        return NextResponse.json(
            { error: "Failed to generate summary." },
            { status: 500 }
        );
    }
}
