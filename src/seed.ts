import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "./models/user.model"; // adjust path to your actual model location
import { Follow } from "./models/following.model"; // adjust path to your actual model location

const MONGODB_URI = process.env.MONGO_URL;
if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is not set in .env");
}

// your real dev account — preserved on every run, never regenerated
const MAIN_USER_ID = new mongoose.Types.ObjectId("6a63716c6c4eb95ee3136801");

const FAKE_USER_COUNT = 15;
const FOLLOWS_PER_USER = 5; // random follows generated among the fake users
const MAIN_USER_FOLLOWERS_COUNT = 6; // fake users who follow your account
const MAIN_USER_FOLLOWING_COUNT = 6; // fake users your account follows
const SALT_ROUNDS = 10;

// small fixed pools instead of a fake-data library — plenty of entropy for
// 15 seed users once combined with the loop index, no extra dependency
const FIRST_NAMES = [
  "Aarav", "Vivaan", "Aditya", "Ishaan", "Kabir",
  "Ananya", "Diya", "Myra", "Saanvi", "Anaya",
  "Rohan", "Kunal", "Neha", "Priya", "Sara",
];
const LAST_NAMES = [
  "Sharma", "Verma", "Patel", "Gupta", "Reddy",
  "Nair", "Iyer", "Singh", "Rao", "Mehta",
];
const BIOS = [
  "Home cook experimenting with weeknight dinners.",
  "Baking enthusiast, mostly sourdough these days.",
  "Trying to eat more vegetables in 2026.",
  "Collecting family recipes before they're lost.",
  "Weekend meal-prepper, weekday chaos.",
];

function randomItem<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Fisher-Yates — sort(() => Math.random() - 0.5) is a common shortcut here
// but it's a biased shuffle; this is the correct O(n) way to get an
// unbiased random ordering, which is what we need to pick non-overlapping
// follower/following sets for the main account below.
function shuffle<T>(arr: readonly T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// index suffix guarantees username/email uniqueness even when the random
// first+last combo repeats across two of the fifteen users
function buildUser(index: number, passwordHash: string) {
  const first = randomItem(FIRST_NAMES);
  const last = randomItem(LAST_NAMES);
  const username = `${first}.${last}.${index}`.toLowerCase();
  return {
    name: `${first} ${last}`,
    username,
    email: `${username}@example.com`,
    passwordHash,
    bio: randomItem(BIOS),
    isEmailVerified: true, // skip the verification flow for seed users
  };
}

async function seed() {
  await mongoose.connect(MONGODB_URI!);
  console.log("connected to db");

  // wipe fake users and all follows, but never touch the main account —
  // Follow docs are cheap to regenerate from scratch each run, User accounts aren't
  await Promise.all([
    User.deleteMany({ _id: { $ne: MAIN_USER_ID } }),
    Follow.deleteMany({}),
  ]);

  // fail loudly if the ID is wrong or you're pointed at the wrong database,
  // instead of silently seeding a graph with no connection to your account
  const mainUserExists = await User.exists({ _id: MAIN_USER_ID });
  if (!mainUserExists) {
    throw new Error(
      `Main user ${MAIN_USER_ID.toString()} not found — check MAIN_USER_ID or your MONGODB_URI`
    );
  }

  // hash once and reuse — this is throwaway seed data, not real user credentials,
  // so paying the bcrypt cost 15 times for the same password buys nothing
  const passwordHash = await bcrypt.hash("Test@1234", SALT_ROUNDS);

  const userDocs = Array.from({ length: FAKE_USER_COUNT }, (_, i) =>
    buildUser(i, passwordHash)
  );

  const users = await User.insertMany(userDocs);
  console.log(`seeded ${users.length} users`);

  // build follow pairs in memory first, deduped, so insertMany doesn't hit
  // the unique index on the happy path — we test that index separately below
  const seenPairs = new Set<string>();
  const followDocs: { follower: mongoose.Types.ObjectId; following: mongoose.Types.ObjectId }[] = [];

  for (const user of users) {
    let created = 0;
    let attempts = 0;
    // capped attempts so a small FAKE_USER_COUNT can't spin forever hunting for unique targets
    while (created < FOLLOWS_PER_USER && attempts < FOLLOWS_PER_USER * 4) {
      attempts++;
      const target = users[Math.floor(Math.random() * users.length)];

      if (target._id.equals(user._id)) continue; // no self-follow

      const key = `${user._id}_${target._id}`;
      if (seenPairs.has(key)) continue;

      seenPairs.add(key);
      followDocs.push({ follower: user._id, following: target._id });
      created++;
    }
  }

  // give the main account real followers and a real following list to test
  // against — non-overlapping slices of a shuffled pool so no one shows up
  // in both lists (a user can still end up in neither, that's fine)
  const requiredForMain = MAIN_USER_FOLLOWERS_COUNT + MAIN_USER_FOLLOWING_COUNT;
  if (users.length < requiredForMain) {
    throw new Error(
      `need at least ${requiredForMain} fake users to satisfy main-user follow counts, only have ${users.length}`
    );
  }

  const pool = shuffle(users);
  const followersOfMain = pool.slice(0, MAIN_USER_FOLLOWERS_COUNT);
  const followingOfMain = pool.slice(
    MAIN_USER_FOLLOWERS_COUNT,
    MAIN_USER_FOLLOWERS_COUNT + MAIN_USER_FOLLOWING_COUNT
  );

  for (const u of followersOfMain) {
    followDocs.push({ follower: u._id, following: MAIN_USER_ID });
  }
  for (const u of followingOfMain) {
    followDocs.push({ follower: MAIN_USER_ID, following: u._id });
  }

  await Follow.insertMany(followDocs);
  console.log(`seeded ${followDocs.length} follow relationships`);
  console.log(
    `  main account: ${followersOfMain.length} followers, ${followingOfMain.length} following`
  );

  // verify the unique index is actually doing its job — a seed script that
  // inserts follows without ever exercising the constraint hasn't tested it
  try {
    await Follow.create({
      follower: followDocs[0].follower,
      following: followDocs[0].following,
    });
    console.error("FAIL: duplicate follow was NOT rejected — check the unique index");
  } catch (err: any) {
    if (err?.code === 11000) {
      console.log("OK: unique index correctly rejected a duplicate follow pair");
    } else {
      throw err;
    }
  }

  await mongoose.disconnect();
  console.log("done");
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});