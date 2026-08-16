// app/api/feed/route.ts
//
// GET /api/feed?cursor=<ISO date>&limit=<n>
// Returns recipes authored by users the current session user follows,
// newest first, cursor-paginated on `createdAt`.
//
// Add to your Recipe schema (not applied here — you own the schema file):
//   RecipeSchema.index({ author: 1, createdAt: -1 });

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import { connectToDatabase } from "@/lib/dbConfig";
import { Follow } from "@/models/following.model";
import { Recipe } from "@/models/recipe.model";

const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 50;

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();

  const { searchParams } = new URL(req.url);
  const rawLimit = Number(searchParams.get("limit"));
  const limit = Math.min(
    Math.max(Number.isFinite(rawLimit) ? rawLimit : DEFAULT_LIMIT, 1),
    MAX_LIMIT
  );
  const cursorParam = searchParams.get("cursor");

  const userId = session.user.id;

  // Who does this user follow? Only need the `following` field.
  const follows = await Follow.find({ follower: userId })
    .select("following")
    .lean();

  const followingIds = follows.map((f) => f.following);

  // No follows yet -> empty feed. Cheap early return, skips the Recipe query
  // entirely instead of running an $in: [] query.
  if (followingIds.length === 0) {
    return NextResponse.json({ recipes: [], nextCursor: null });
  }

  const query: Record<string, unknown> = { author: { $in: followingIds } };

  if (cursorParam) {
    const cursorDate = new Date(cursorParam);
    if (!isNaN(cursorDate.getTime())) {
      query.createdAt = { $lt: cursorDate };
    }
    // Invalid/garbage cursor is silently ignored -> falls back to page 1
    // rather than erroring, since a stale client-side cursor shouldn't 500.
  }

  // Fetch one extra doc to know whether there's a next page without a
  // separate count query.
  const docs = await Recipe.find(query)
    .sort({ createdAt: -1 })
    .limit(limit + 1)
    .populate("author", "name avatar")
    .select("-instructions -nutritionalInfo") // trim payload for feed cards
    .lean();

  const hasMore = docs.length > limit;
  const page = hasMore ? docs.slice(0, limit) : docs;
  const nextCursor = hasMore
    ? (page[page.length - 1] as any).createdAt.toISOString()
    : null;

  return NextResponse.json({ recipes: page, nextCursor });
}