/**
 * Seeds one Comment per user onto a single recipe.
 *
 * Idempotent by design: uses bulkWrite + upsert on (recipe, author), so
 * re-running this script skips users who already commented instead of
 * creating duplicates. Note: your Comment schema's {recipe, author} index
 * is NOT unique at the DB level — this script's idempotency comes from the
 * upsert filter, not a schema constraint. If you need that guarantee
 * enforced outside this script too, add `commentSchema.index({ recipe: 1,
 * author: 1 }, { unique: true })` to comment.model.ts.
 *
 * Run: MONGO_URL="<your-uri>" npx tsx scripts/seed-recipe-comments.ts
 */

import mongoose, { isValidObjectId, type AnyBulkWriteOperation } from "mongoose";
import { Comment, type CommentDocument } from "@/models/comment.model"; // adjust path to your project
import dotenv from "dotenv";
dotenv.config(); // Load environment variables from .env.local
const RECIPE_ID = "6a74c44fb68d0aacbfe98117";

// Pasted directly from your source data — mapped to plain id strings below
// rather than retyped, to avoid transcription errors across 51 ObjectIds.
const USERS: { _id: string }[] = [
  { "_id": "6a74b1f477b4521425cc601e" }, { "_id": "6a74b1f477b4521425cc601d" },
  { "_id": "6a74b1f477b4521425cc6024" }, { "_id": "6a74b1f477b4521425cc6026" },
  { "_id": "6a74b1f477b4521425cc6031" }, { "_id": "6a74b1f477b4521425cc603a" },
  { "_id": "6a74b1f477b4521425cc6047" }, { "_id": "6a74b1f477b4521425cc6022" },
  { "_id": "6a74b1f477b4521425cc601c" }, { "_id": "6a74b1f477b4521425cc604b" },
  { "_id": "6a74b1f477b4521425cc6020" }, { "_id": "6a74b1f477b4521425cc6035" },
  { "_id": "6a74b1f477b4521425cc604a" }, { "_id": "6a74b1f477b4521425cc6027" },
  { "_id": "6a74b1f477b4521425cc6045" }, { "_id": "6a74b1f477b4521425cc6023" },
  { "_id": "6a74b1f477b4521425cc6033" }, { "_id": "6a74b1f477b4521425cc603f" },
  { "_id": "6a74b1f477b4521425cc6042" }, { "_id": "6a74b1f477b4521425cc6030" },
  { "_id": "6a74b1f477b4521425cc6037" }, { "_id": "6a74b1f477b4521425cc6039" },
  { "_id": "6a74b1f477b4521425cc603e" }, { "_id": "6a74b1f477b4521425cc6040" },
  { "_id": "6a74b1f477b4521425cc6025" }, { "_id": "6a74b1f477b4521425cc602d" },
  { "_id": "6a74b1f477b4521425cc602e" }, { "_id": "6a74b1f477b4521425cc6041" },
  { "_id": "6a74b1f477b4521425cc6044" }, { "_id": "6a74b1f477b4521425cc6049" },
  { "_id": "6a74b1f477b4521425cc601a" }, { "_id": "6a74b1f477b4521425cc602c" },
  { "_id": "6a74b1f477b4521425cc602f" }, { "_id": "6a74b1f477b4521425cc603b" },
  { "_id": "6a74b1f477b4521425cc6028" }, { "_id": "6a74b1f477b4521425cc602b" },
  { "_id": "6a74b1f477b4521425cc6034" }, { "_id": "6a74b1f477b4521425cc6036" },
  { "_id": "6a74b1f477b4521425cc601b" }, { "_id": "6a74b1f477b4521425cc603d" },
  { "_id": "6a74b1f477b4521425cc6043" }, { "_id": "6a74b1f477b4521425cc6029" },
  { "_id": "6a74b1f477b4521425cc602a" }, { "_id": "6a74b1f477b4521425cc6046" },
  { "_id": "6a74b1f477b4521425cc601f" }, { "_id": "6a74b1f477b4521425cc6032" },
  { "_id": "6a74b1f477b4521425cc603c" }, { "_id": "6a74b1f477b4521425cc6021" },
  { "_id": "6a74b1f477b4521425cc6038" }, { "_id": "6a74b1f477b4521425cc6048" },
  { "_id": "6a74b826d3880b84f2050f0c" },
];

// Varied bodies so 51 comments don't read as one bot repeating itself.
const COMMENT_BODIES = [
  "Made this last night, turned out great!",
  "Tried it with a bit less salt and it was perfect for us.",
  "This is now in my regular rotation, thanks for sharing.",
  "Added extra garlic and it worked really well.",
  "Simple and reliable, exactly what I was looking for.",
  "Followed it exactly, no notes, will make again.",
  "Swapped in what I had on hand and it still came out well.",
  "Family loved this one, definitely making it again.",
  "Good base recipe, easy to tweak to taste.",
  "Solid recipe, saved it to my cookbook.",
];

async function main() {
  const uri = process.env.MONGO_URL;
  if (!uri) throw new Error("MONGO_URL is not set");

  if (!isValidObjectId(RECIPE_ID)) {
    throw new Error(`Invalid recipe id: ${RECIPE_ID}`);
  }
  const recipeObjectId = new mongoose.Types.ObjectId(RECIPE_ID);

  const validUserIds = USERS.map((u) => u._id).filter((id) => {
    const valid = isValidObjectId(id);
    if (!valid) console.warn(`Skipping invalid user id: ${id}`);
    return valid;
  });
  if (validUserIds.length === 0) throw new Error("No valid user ids to seed");

  await mongoose.connect(uri);

  // bulkWrite + upsert on (recipe, author) is what makes reruns safe: an
  // existing pair is matched and left untouched ($setOnInsert only fires
  // on insert), so you never get 2x/3x comments from running this twice.
  // ordered: false lets each op resolve independently instead of the whole
  // batch aborting on the first failure.
  const operations: AnyBulkWriteOperation<CommentDocument>[] = validUserIds.map(
    (userId, i) => ({
      updateOne: {
        filter: {
          recipe: recipeObjectId,
          author: new mongoose.Types.ObjectId(userId),
        },
        update: {
          $setOnInsert: {
            recipe: recipeObjectId,
            author: new mongoose.Types.ObjectId(userId),
            body: COMMENT_BODIES[i % COMMENT_BODIES.length],
          },
        },
        upsert: true,
      },
    })
  );

  const result = await Comment.bulkWrite(operations, { ordered: false });

  console.log(
    `Seed complete — inserted: ${result.upsertedCount}, already existed: ${
      validUserIds.length - result.upsertedCount
    }`
  );
}

main()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });