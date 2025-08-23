import "dotenv/config";
import { NextResponse } from "next/server";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { OpenAIEmbeddings } from "@langchain/openai";
import { TaskType } from "@google/generative-ai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { CSVLoader } from "@langchain/community/document_loaders/fs/csv";
import { RecursiveUrlLoader } from "@langchain/community/document_loaders/web/recursive_url";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { Document } from "@langchain/core/documents";

// MODIFIED: This function now accepts a collectionName to be dynamic.
async function insertInBatches(docs, embeddings, collectionName, batchSize = 100) {
    for (let i = 0; i < docs.length; i += batchSize) {
        const batch = docs.slice(i, i + batchSize);

        await QdrantVectorStore.fromDocuments(batch, embeddings, {
            url: CONFIG.QDRANT_URL,
            apiKey: CONFIG.QDRANT_API_KEY,
            collectionName: collectionName, // Use the passed collectionName
        });

        console.log(`✅ Inserted batch ${i / batchSize + 1} into collection "${collectionName}"`);
    }
}

/* ---------------- Config ---------------- */
const CONFIG = {
    QDRANT_URL: process.env.QDRANT_URL,
    QDRANT_API_KEY: process.env.QDRANT_API_KEY,
    EMBEDDING_MODEL: process.env.EMBEDDING_MODEL || "text-embedding-3-large",
    CHUNK_SIZE: 1000,
    CHUNK_OVERLAP: 200,
};

/* ---------------- Helpers ---------------- */
function cleanDocuments(docs, fallbackSource = "") {
    return docs.map((d) => {
        const meta = d.metadata || {};
        const outMeta = {};

        if (meta.source) outMeta.source = meta.source;
        if (meta.url) outMeta.url = meta.url;
        if (meta.title) outMeta.title = meta.title;
        if (!outMeta.source && fallbackSource) outMeta.source = fallbackSource;

        return new Document({
            pageContent: d.pageContent ?? "",
            metadata: outMeta,
        });
    });
}

async function splitDocuments(rawDocs) {
    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: CONFIG.CHUNK_SIZE,
        chunkOverlap: CONFIG.CHUNK_OVERLAP,
    });
    return splitter.splitDocuments(rawDocs);
}

/* ---------------- Loaders ---------------- */
async function loadText(text) {
    return [new Document({ pageContent: text, metadata: { source: "pasted-text" } })];
}

async function loadPDF(file) {
    console.log(`📄 Loading PDF: ${file.name}`);
    const loader = new PDFLoader(file);
    const rawDocs = await loader.load();
    const split = await splitDocuments(rawDocs);
    return cleanDocuments(split, file.name);
}

async function loadCSV(file) {
    console.log(`📄 Loading CSV: ${file.name}`);
    const loader = new CSVLoader(file);
    const rawDocs = await loader.load();
    const split = await splitDocuments(rawDocs);
    return cleanDocuments(split, file.name);
}

async function loadWebsite(url) {
    console.log(`🌐 Crawling website: ${url}`);
    const loader = new RecursiveUrlLoader(url, { maxDepth: 2, excludeDirs: ["#"] });
    const rawDocs = await loader.load();
    const split = await splitDocuments(rawDocs);
    return cleanDocuments(split, url);
}

/* ---------------- API Handler ---------------- */
export async function POST(req) {
    try {
        const formData = await req.formData();
        const sourceType = formData.get("sourceType")?.toLowerCase();
        // MODIFIED: Get collectionName from the form data
        const collectionName = formData.get("collectionName");

        if (!sourceType) {
            return NextResponse.json({ error: "sourceType is required" }, { status: 400 });
        }
        // MODIFIED: Add validation for collectionName
        if (!collectionName) {
            return NextResponse.json({ error: "collectionName is required" }, { status: 400 });
        }


        let docs = [];
        let sourceName = "unknown";
        switch (sourceType) {
            case "text": {
                const text = formData.get("text");
                if (!text) return NextResponse.json({ error: 'Text content is required for sourceType "text"' }, { status: 400 });
                docs = await loadText(text);
                sourceName = text.slice(0, 20);
                break;
            }
            case "file": {
                const file = formData.get("file");
                if (!file) return NextResponse.json({ error: 'A file is required for sourceType "file"' }, { status: 400 });
                sourceName = file.name;
                if (file.type === "application/pdf") {
                    docs = await loadPDF(file);
                } else if (file.type === "text/csv") {
                    docs = await loadCSV(file);
                } else {
                    return NextResponse.json({ error: "Unsupported file type. Please use PDF or CSV." }, { status: 400 });
                }
                break;
            }
            case "url": {
                const url = formData.get("url");
                if (!url) return NextResponse.json({ error: 'A URL is required for sourceType "url"' }, { status: 400 });
                docs = await loadWebsite(url);
                sourceName = url;
                break;
            }
            default:
                return NextResponse.json({ error: "Invalid sourceType. Use 'text', 'file', or 'url'." }, { status: 400 });
        }

        if (!docs.length) {
            return NextResponse.json({ error: "No documents to insert" }, { status: 400 });
        }

        const embeddings = new GoogleGenerativeAIEmbeddings({
            apiKey: process.env.GOOGLE_API_KEY,
            model: "text-embedding-004",
            taskType: TaskType.RETRIEVAL_DOCUMENT,
        });

        // MODIFIED: Pass the dynamic collectionName to the batch insertion function
        await insertInBatches(docs, embeddings, collectionName, 100);

        return NextResponse.json({
            success: true,
            message: `Indexing of ${sourceName} done.`,
            inserted: docs.length,
            collectionName: collectionName, // Return the dynamic collection name
            identity: sourceName,
        });
    } catch (error) {
        console.error("🔥 Error during indexing:", error);
        return NextResponse.json(
            { error: "Failed to index documents.", details: error.message },
            { status: 500 }
        );
    }
}
