/**
 * scripts/seed-cookbooks.ts
 *
 * Seeds 3 Cookbooks for a single user from a fixed set of Recipe ids.
 * Idempotent: deletes any cookbooks previously seeded for this user
 * (matched by author + title) before inserting, so re-running it
 * won't pile up duplicates.
 *
 * Run with: npx tsx scripts/seed-cookbooks.ts
 */

import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import { Cookbook } from "@/models/cookbook.model"; // TODO: adjust to your actual model path

const MONGODB_URI = process.env.MONGO_URL;

const AUTHOR_ID = "6a74b826d3880b84f2050f0c";

// 39 ids parsed from the pasted array. The original JSON was truncated
// (trailing comma, no closing bracket) — this is everything that was
// actually complete. Re-run with the full list if there were more.
const RECIPE_IDS = [
  "6a74c44fb68d0aacbfe98117",
  "6a74c44fb68d0aacbfe9814e",
  "6a74c450b68d0aacbfe98161",
  "6a74c450b68d0aacbfe98171",
  "6a74c450b68d0aacbfe98176",
  "6a74c450b68d0aacbfe98195",
  "6a74c450b68d0aacbfe981a3",
  "6a74c450b68d0aacbfe981a9",
  "6a74c450b68d0aacbfe981bc",
  "6a74c450b68d0aacbfe981cb",
  "6a74c450b68d0aacbfe981d9",
  "6a74c44fb68d0aacbfe9811a",
  "6a74c44fb68d0aacbfe9811c",
  "6a74c44fb68d0aacbfe9812e",
  "6a74c44fb68d0aacbfe98136",
  "6a74c44fb68d0aacbfe98139",
  "6a74c44fb68d0aacbfe9813e",
  "6a74c44fb68d0aacbfe9813f",
  "6a74c44fb68d0aacbfe98152",
  "6a74c450b68d0aacbfe98154",
  "6a74c450b68d0aacbfe9816a",
  "6a74c450b68d0aacbfe9816b",
  "6a74c450b68d0aacbfe98172",
  "6a74c450b68d0aacbfe98173",
  "6a74c450b68d0aacbfe9817e",
  "6a74c450b68d0aacbfe9819b",
  "6a74c450b68d0aacbfe981af",
  "6a74c450b68d0aacbfe981c9",
  "6a74c450b68d0aacbfe981d5",
  "6a74c44fb68d0aacbfe9811f",
  "6a74c44fb68d0aacbfe98127",
  "6a74c44fb68d0aacbfe98140",
  "6a74c44fb68d0aacbfe98143",
  "6a74c44fb68d0aacbfe9814c",
  "6a74c450b68d0aacbfe98160",
  "6a74c450b68d0aacbfe98162",
  "6a74c450b68d0aacbfe98165",
  "6a74c450b68d0aacbfe98166",
  "6a74c450b68d0aacbfe98167",
];

// recipeCount values must sum to <= RECIPE_IDS.length; ids are sliced
// sequentially and NOT reused across cookbooks.
const COOKBOOKS = [
  {
    title: "Weeknight Dinners",
    description: "Fast, low-effort meals for busy weekdays.",
    coverImageURL: "https://picsum.photos/seed/weeknight-dinners/800/600",
    coverImageFileId: "seed-weeknight-dinners",
    recipeCount: 15,
  },
  {
    title: "Weekend Baking",
    description: "Breads, cakes, and slow bakes worth the extra time.",
    coverImageURL: "https://picsum.photos/seed/weekend-baking/800/600",
    coverImageFileId: "seed-weekend-baking",
    recipeCount: 12,
  },
  {
    title: "Meal Prep Staples",
    description: "Batch-cookable recipes that hold up in the fridge.",
    coverImageURL: "https://picsum.photos/seed/meal-prep-staples/800/600",
    coverImageFileId: "seed-meal-prep-staples",
    recipeCount: 12,
  },
] as const;

async function seed() {
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not set");
  }
  if (!mongoose.isValidObjectId(AUTHOR_ID)) {
    throw new Error(`AUTHOR_ID is not a valid ObjectId: ${AUTHOR_ID}`);
  }

  const invalidIds = RECIPE_IDS.filter((id) => !mongoose.isValidObjectId(id));
  if (invalidIds.length > 0) {
    throw new Error(`Invalid recipe ObjectId(s): ${invalidIds.join(", ")}`);
  }

  const totalNeeded = COOKBOOKS.reduce((sum, cb) => sum + cb.recipeCount, 0);
  if (totalNeeded > RECIPE_IDS.length) {
    throw new Error(
      `Cookbooks need ${totalNeeded} recipes but only ${RECIPE_IDS.length} ids were provided.`
    );
  }

  await mongoose.connect(MONGODB_URI);

  try {
    const authorId = new mongoose.Types.ObjectId(AUTHOR_ID);
    const titles = COOKBOOKS.map((cb) => cb.title);

    // Idempotent: clear any prior run of this exact seed for this user
    // before inserting, instead of appending duplicates on every run.
    const { deletedCount } = await Cookbook.deleteMany({
      author: authorId,
      title: { $in: titles },
    });
    if (deletedCount) {
      console.log(`Removed ${deletedCount} previously seeded cookbook(s).`);
    }

    let cursor = 0;
    const docs = COOKBOOKS.map((cb) => {
      const recipeIds = RECIPE_IDS.slice(cursor, cursor + cb.recipeCount).map(
        (id) => new mongoose.Types.ObjectId(id)
      );
      cursor += cb.recipeCount;

      return {
        author: authorId,
        title: cb.title,
        description: cb.description,
        recipes: recipeIds,
        coverImage: {
          coverImageURL: cb.coverImageURL,
          coverImageFileId: cb.coverImageFileId,
        },
      };
    });

    const inserted = await Cookbook.insertMany(docs);
    inserted.forEach((doc) =>
      console.log(`Created "${doc.title}" (${doc.recipes.length} recipes) — ${doc._id}`)
    );
  } finally {
    await mongoose.disconnect();
  }
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });