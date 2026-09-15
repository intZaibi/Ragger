import "dotenv/config";
import { NextResponse } from "next/server";
import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";
import OpenAI from "openai";
import { auth, clerkClient } from "@clerk/nextjs/server";

const DEFAULT_CREDITS = 3;

/**
 * Handles POST requests to /api/chat
 * Expects a JSON body with a "userQuery" and "collectionName" property.
 * Checks the user's remaining credits before processing and decrements on success.
 */
export async function POST(req) {
  // 1. Authenticate the user
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Extract the user's query from the request body
  const { userQuery, collectionName } = await req.json();

  if (!userQuery) {
    return NextResponse.json(
      { error: "User query is required" },
      { status: 400 }
    );
  }

  try {
    // 3. Check the user's credits via Clerk privateMetadata
    const clerk = await clerkClient();
    const user = await clerk.users.getUser(userId);
    const currentCredits = user.privateMetadata?.credits ?? DEFAULT_CREDITS;

    if (currentCredits <= 0) {
      return NextResponse.json(
        {
          error: "You have used all your free messages. Upgrade to continue.",
          creditsRemaining: 0,
        },
        { status: 402 }
      );
    }

    // 4. Initialize OpenAI embeddings for retrieving the user's query.
    // The model must match the one used during indexing for accurate vector search.
    const embeddings = new OpenAIEmbeddings({
      apiKey: process.env.OPENAI_API_KEY,
      model: "text-embedding-3-large", // Must match the indexing route
    });

    // 5. Connect to the existing Qdrant vector store
    const vectorStore = await QdrantVectorStore.fromExistingCollection(
      embeddings,
      {
        url: process.env.QDRANT_URL,
        apiKey: process.env.QDRANT_API_KEY,
        collectionName: collectionName,
      }
    );

    // 6. Create a retriever to search for the top 3 most relevant documents
    const retriever = vectorStore.asRetriever({ k: 3 });

    // 7. Retrieve the relevant chunks (documents) from Qdrant
    const relevantChunks = await retriever.invoke(userQuery);
    console.log("Relevant Chunks", relevantChunks);

    // 8. Construct a clear system prompt with the retrieved context
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

    // 9. Generate a response using the OpenAI chat model
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userQuery },
      ],
      response_format: { type: "json_object" },
    });
    console.log(JSON.stringify(response));

    // 10. Decrement the user's credits after a successful response
    const newCredits = currentCredits - 1;
    await clerk.users.updateUserMetadata(userId, {
      privateMetadata: {
        credits: newCredits,
      },
    });

    // 11. Return the AI's response, sources, and remaining credits
    return NextResponse.json({
      response: response.choices[0].message.content,
      sources: relevantChunks,
      creditsRemaining: newCredits,
    });
  } catch (error) {
    console.error("Error during chat processing:", error);
    return NextResponse.json(
      { error: "Failed to process chat query." },
      { status: 500 }
    );
  }
}
