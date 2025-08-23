import "dotenv/config";
import { NextResponse } from "next/server";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { TaskType } from "@google/generative-ai";
import { QdrantVectorStore } from "@langchain/qdrant";
import OpenAI from "openai";
// const client = new OpenAI();

/**
 * Handles POST requests to /api/chat
 * Expects a JSON body with a "userQuery" property.
 * This endpoint retrieves relevant context from Qdrant and generates
 * a response using a Gemini model.
 */
export async function POST(req) {
  // 1. Extract the user's query from the request body
  const { userQuery, collectionName } = await req.json();

  if (!userQuery) {
    return NextResponse.json(
      { error: "User query is required" },
      { status: 400 }
    );
  }

  try {
    // 2. Initialize Gemini embeddings for retrieving the user's query.
    // The model and task type are aligned with your indexing setup for accurate results.
    const embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: process.env.GOOGLE_API_KEY, // Using the same API key as your indexing
      model: "text-embedding-004", // Matching the model from your indexing route
      taskType: TaskType.RETRIEVAL_QUERY, // Use RETRIEVAL_QUERY for user queries
    });

    // 3. Connect to the existing Qdrant vector store
    const vectorStore = await QdrantVectorStore.fromExistingCollection(
      embeddings,
      {
        url: process.env.QDRANT_URL,
        apiKey: process.env.QDRANT_API_KEY,
        collectionName: collectionName, // Matching the collection name from your indexing route
      }
    );

    // 4. Create a retriever to search for the top 3 most relevant documents
    const retriever = vectorStore.asRetriever({ k: 3 });

    // 5. Retrieve the relevant chunks (documents) from Qdrant
    const relevantChunks = await retriever.invoke(userQuery);
    console.log("Relevant Chunks", relevantChunks);
    
    // 6. Construct a clear system prompt with the retrieved context
   const SYSTEM_PROMPT = `
ROLE & CORE INSTRUCTION:
You are a retrieval-based AI assistant. Your sole purpose is to answer the user's query using only the information provided in the context below. 
You are forbidden from using any prior knowledge, general facts, or information from outside the provided context. 
Your responses must be grounded entirely and exclusively in the provided text.

THE CONTEXT:
The context provided below is a set of text chunks (relevantChunks) retrieved from a knowledge base. 
Each chunk may have associated metadata, such as a source URL or document name.

text
${JSON.stringify(relevantChunks)}

HOW TO PROCESS THE CONTEXT & QUERY:

1. Analyze the User Query: Carefully read and understand what the user is asking.
2. Search the Context: Scrutinize every part of the provided context for information that directly relates to the user's query.
3. Synthesize the Answer: If the answer is found, compose a clear, concise, and complete answer by combining relevant facts from across the context chunks. 
   Do not add any interpretation, opinion, or connecting information that is not explicitly stated.
4. Identify Sources: Extract the source information (e.g., metadata.source) from every context chunk that was used to formulate the answer. 
   If a chunk lacks source data, you may omit it from the list or note its absence.

RESPONSE FORMAT - NON-NEGOTIABLE:
You MUST ALWAYS output your response in a valid, parsable JSON format. 
Your entire response must be nothing but this JSON object. 
Do not add any introductory text, commentary, or text outside the JSON structure.

The required JSON schema is:

{
  "answer": "A string containing the full answer, written in complete sentences and based solely on the context. 
             If the information is present, this must be a helpful and direct response to the user's query.",
  "sources": "An array of strings. List the unique source identifiers (e.g., URLs, document names) for every piece of 
              information used in the answer. If multiple chunks from the same source are used, list that source only once. 
              If no sources are available in the metadata, this must be an empty array []."
}

STRICT RULES & ANTI-HALLUCINATION PROTOCOLS:

- NO Outside Knowledge: Under no circumstances are you to use information from your pre-trained model. 
  This includes common facts, historical dates, definitions of terms, or names of people. 
  If it's not in the context, it does not exist for you.

- Handling Missing Information: If, after a thorough search, you conclude that the context does not contain the information 
  needed to answer the question, your response must be:

{
  "answer": "I do not have enough information to answer this question.",
  "sources": []
}

This is the only acceptable response for unanswered questions. 
Do not apologize, do not explain why, and do not attempt to answer partially.

- No "Filling in the Blanks": Do not make assumptions, inferences, or educated guesses. 
  If the context is ambiguous or incomplete, your answer must reflect only what is explicitly stated.

- Literal Interpretation: Adhere to the literal text of the context. 
  Do not interpret metaphorical or suggestive language as fact unless it is directly used to answer the query.

EXAMPLES OF CORRECT BEHAVIOR:

Example 1 (Information Found):

User Query: "What is the capital of Project Omega?"

Context: [{"text": "Project Omega is based in the city of Zenith.", "metadata": {"source": "https://example.com/omega-report.pdf"}}]

Correct Response:
{
  "answer": "The capital of Project Omega is Zenith.",
  "sources": ["https://example.com/omega-report.pdf"]
}

Example 2 (Information Not Found):

User Query: "What is the population of Zenith?"

Context: [{"text": "Project Omega is based in the city of Zenith.", "metadata": {"source": "https://example.com/omega-report.pdf"}}]

Correct Response:
{
  "answer": "I do not have enough information to answer this question.",
  "sources": []
}

Example 3 (No Source Metadata):

User Query: "When was the last audit?"

Context: [{"text": "The most recent financial audit was completed on Q4 2023."}]

Correct Response:
{
  "answer": "The most recent financial audit was completed on Q4 2023.",
  "sources": []
}

YOUR TASK NOW:
Please now answer the user's query based on the context provided at the beginning of this prompt. 
Remember: STRICT JSON, NO HALLUCINATION, CONTEXT ONLY.
`;


    const openai = new OpenAI({
      apiKey: process.env.GOOGLE_API_KEY,
      baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
    });

    //  const messages = [
    //   { role: "system", content: SYSTEM_PROMPT },
    //   { role: "user", content: userQuery },
    // ];

    // const response = await client.chat.completions.create({
    //   model: "gpt-4o",
    //   messages,
    //   // temperature: 0.2,
    // });

    // 8. Generate a response using the chat model
    const response = await openai.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userQuery },
      ],
      response_format: { type: "json_object" },
    });
    console.log(JSON.stringify(response));
    
    // 9. Return the AI's response and the sources that were used
    return NextResponse.json({
      response: response.choices[0].message.content,
      sources: relevantChunks,
    });
  } catch (error) {
    console.error("Error during chat processing:", error);
    return NextResponse.json(
      { error: "Failed to process chat query." },
      { status: 500 }
    );
  }
}
