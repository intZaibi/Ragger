import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { Document } from "@langchain/core/documents";
import { load } from "cheerio";
import { requireUser, database, requireAI, apiError, fail } from "@/lib/server";
import { EMBEDDING_MODEL, MAX_FILE_BYTES, MAX_TEXT_LENGTH } from "@/lib/notebooks.mjs";
import { fetchPublicPage } from "@/lib/public-page.mjs";

export async function POST(req) {
  let sourceId, client, collectionName;
  try {
    await requireUser();
    const form = await req.formData();
    collectionName = form.get("collectionName");
    await requireUser(collectionName || "");
    requireAI();
    const type = form.get("sourceType");
    let text, name;
    if (type === "text") {
      text = form.get("text");
      if (typeof text !== "string") throw fail("Paste some text first.");
      name = String(form.get("name") || text.trim().slice(0, 45) || "Pasted notes").slice(0, 150);
    } else if (type === "file") {
      const file = form.get("file");
      if (!file || typeof file.arrayBuffer !== "function") throw fail("Choose a file.");
      if (file.size > MAX_FILE_BYTES) throw fail("Files must be 10 MB or smaller.");
      name = file.name;
      const extension = name.split(".").pop().toLowerCase();
      if (extension === "pdf") {
        const docs = await new PDFLoader(file).load();
        text = docs.map(d => d.pageContent).join("\n\n");
      } else if (["txt", "csv"].includes(extension)) text = await file.text();
      else throw fail("Choose a PDF, TXT, or CSV file.");
    } else if (type === "url") {
      name = form.get("url");
      if (typeof name !== "string" || name.length > 2000) throw fail("Enter a valid HTTPS URL.");
      let html;
      try { html = await fetchPublicPage(name); } catch (error) { throw fail(error.message); }
      const $ = load(html);
      $("script, style, nav, footer, header, noscript").remove();
      text = $("main, article").first().text() || $("body").text() || $.text();
      text = text.replace(/\s+/g, " ").trim();
    } else throw fail("Choose text, file, or URL.");
    if (!text?.trim()) throw fail("No readable text found. Scanned PDFs need OCR before uploading.");
    if (text.length > MAX_TEXT_LENGTH) throw fail("This source is too long. Please split it into smaller documents (200,000 characters each).");
    client = database();
    // Ensure the collection exists; indexing must never recreate a deleted notebook.
    await client.getCollection(collectionName);
    sourceId = randomUUID();
    const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000, chunkOverlap: 200 });
    const docs = await splitter.splitDocuments([new Document({ pageContent: text.trim(), metadata: { source: name, sourceId, type, createdAt: new Date().toISOString() } })]);
    docs.forEach((doc, index) => { doc.metadata.chunkIndex = index; });
    const embeddings = new OpenAIEmbeddings({ apiKey: process.env.OPENAI_API_KEY, model: EMBEDDING_MODEL });
    for (let i = 0; i < docs.length; i += 50) {
      const batch = docs.slice(i, i + 50);
      const vectors = await embeddings.embedDocuments(batch.map(doc => doc.pageContent));
      await client.upsert(collectionName, { wait: true, points: batch.map((doc, index) => ({ id: randomUUID(), vector: vectors[index], payload: { content: doc.pageContent, metadata: doc.metadata } })) });
    }
    return NextResponse.json({ success: true, source: { id: sourceId, name, type, chunks: docs.length } });
  } catch (error) {
    if (sourceId && client) {
      try { await client.delete(collectionName, { wait: true, filter: { must: [{ key: "metadata.sourceId", match: { value: sourceId } }] } }); }
      catch { console.error("Could not clean up partially indexed source."); }
    }
    return apiError(error);
  }
}
