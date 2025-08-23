import "dotenv/config";
import { NextResponse } from "next/server";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { TaskType, GoogleGenerativeAI } from "@google/generative-ai";

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
        // 1. Find the relevant document in Qdrant
        const embeddings = new GoogleGenerativeAIEmbeddings({
            apiKey: process.env.GOOGLE_API_KEY,
            model: "text-embedding-004",
            taskType: TaskType.RETRIEVAL_QUERY,
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

        // 3. Call Gemini using the native Google Generative AI SDK
        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash", 
            generationConfig: {
                responseMimeType: "application/json",
            }
        });

        // FIX: The generateContent method expects the prompt as a direct string,
        // not a complex object with 'contents' or 'roles'.
        const generationResult = await model.generateContent(SYSTEM_PROMPT);
        const response = await generationResult.response;
        const summaryText = response.text();

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
