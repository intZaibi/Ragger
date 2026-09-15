import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";

const DEFAULT_CREDITS = 3;

/**
 * GET /api/credits
 * Returns the current user's remaining message credits.
 */
export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const credits = user.privateMetadata?.credits ?? DEFAULT_CREDITS;

    return NextResponse.json({ credits, maxCredits: DEFAULT_CREDITS });
  } catch (error) {
    console.error("Error fetching credits:", error);
    return NextResponse.json(
      { error: "Failed to fetch credits." },
      { status: 500 }
    );
  }
}
