import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
import { Comment } from "./models/comment.model";

// Replace with your MongoDB connection string
const MONGODB_URI = process.env.MONGO_URL || "mongodb://localhost:27017/your-database-name";

const userIds = [
  "6a74b1f477b4521425cc601a", "6a74b1f477b4521425cc601b", "6a74b1f477b4521425cc601c",
  "6a74b1f477b4521425cc601d", "6a74b1f477b4521425cc601e", "6a74b1f477b4521425cc601f",
  "6a74b1f477b4521425cc6020", "6a74b1f477b4521425cc6021", "6a74b1f477b4521425cc6022",
  "6a74b1f477b4521425cc6023", "6a74b1f477b4521425cc6024", "6a74b1f477b4521425cc6025",
  "6a74b1f477b4521425cc6026", "6a74b1f477b4521425cc6027", "6a74b1f477b4521425cc6028",
  "6a74b1f477b4521425cc6029", "6a74b1f477b4521425cc602a", "6a74b1f477b4521425cc602b",
  "6a74b1f477b4521425cc602c", "6a74b1f477b4521425cc602d", "6a74b1f477b4521425cc602e",
  "6a74b1f477b4521425cc602f", "6a74b1f477b4521425cc6030", "6a74b1f477b4521425cc6031",
  "6a74b1f477b4521425cc6032", "6a74b1f477b4521425cc6033", "6a74b1f477b4521425cc6034",
  "6a74b1f477b4521425cc6035", "6a74b1f477b4521425cc6036", "6a74b1f477b4521425cc6037",
  "6a74b1f477b4521425cc6038", "6a74b1f477b4521425cc6039", "6a74b1f477b4521425cc603a",
  "6a74b1f477b4521425cc603b", "6a74b1f477b4521425cc603c", "6a74b1f477b4521425cc603d",
  "6a74b1f477b4521425cc603e", "6a74b1f477b4521425cc603f", "6a74b1f477b4521425cc6040",
  "6a74b1f477b4521425cc6041", "6a74b1f477b4521425cc6042", "6a74b1f477b4521425cc6043",
  "6a74b1f477b4521425cc6044", "6a74b1f477b4521425cc6045", "6a74b1f477b4521425cc6046",
  "6a74b1f477b4521425cc6047", "6a74b1f477b4521425cc6048", "6a74b1f477b4521425cc6049",
  "6a74b1f477b4521425cc604a", "6a74b1f477b4521425cc604b", "6a74b826d3880b84f2050f0c"
];

const recipeId = "6a74c44fb68d0aacbfe98109";

const commentBodies = [
  "Tried this recipe tonight and it turned out absolutely delicious! Will definitely make again.",
  "Super easy to follow steps. Great for a quick weeknight dinner.",
  "Added a bit extra garlic and red pepper flakes for heat. Perfection!",
  "My whole family loved this, even the kids asked for seconds.",
  "The flavor profile on this dish is spot on. Thanks for sharing!",
  "Substituted olive oil for butter and it still came out amazing.",
  "Crispy, flavorful, and incredibly easy to prepare.",
  "Bookmarking this recipe right away. A new staple in our home!",
  "Instructions were super clear. Took me less than 30 minutes total.",
  "Great texture and aroma. Served it alongside a fresh green salad.",
  "Turned out great! Next time I might reduce the salt slightly.",
  "So refreshing to find a recipe that actually turns out like the photos.",
  "Made this for a dinner party and everyone asked for the recipe!",
  "Simple ingredients, massive flavor. 10/10!",
  "Followed the recipe exactly as written and it turned out fantastic.",
  "A perfect comfort meal. The seasoning blend is brilliant.",
  "Quick, healthy, and satisfying. Perfect for meal prep!",
  "Loved the texture! Will try swapping in fresh herbs next time.",
  "Surpassed my expectations! Super rich and tasty.",
  "Chef kiss! This was way easier than I thought it would be.",
  "Great recipe! I cooked it a couple minutes longer for extra caramelization.",
  "Really enjoyed this dish. Will be adding it to my regular rotation.",
  "Tastes like restaurant quality! Surprised myself with how well it came out.",
  "Pairs wonderfully with a cold glass of white wine.",
  "So glad I found this. Super easy cleanup afterwards too!",
  "An incredible balance of flavors. Smelled amazing while cooking.",
  "Loved it! Doubled the batch so we could have leftovers tomorrow.",
  "Simple, fast, and nutritious. What more could you ask for?",
  "Wonderful combination of ingredients. Turned out so rich and savory.",
  "Definite crowd-pleaser! Made it for game night and it was a hit.",
  "Clear steps and excellent results. 5 stars from me!",
  "Added some fresh parmesan on top at the end—highly recommend!",
  "Light yet super satisfying. Will definitely be cooking this again.",
  "The presentation on this dish looks impressive for how easy it is.",
  "Came together effortlessly. Fantastic flavor balance!",
  "My go-to comfort food recipe from now on.",
  "Substituted a few veggies with what I had in the fridge, worked great!",
  "Incredibly flavorful and moist. Cooked perfectly in time.",
  "Hands down one of the best recipes I've tried on this platform.",
  "Smells heavenly! My kitchen smells like a 5-star restaurant right now.",
  "Easy prep, quick cleanup, and unbelievable flavor.",
  "So happy with how this turned out on my first attempt!",
  "Rich, savory, and perfectly balanced. Great job on this recipe!",
  "Ideal recipe for busy weeknights when you want something fresh.",
  "My partner loved it! Thanks for publishing this.",
  "Crispy on the outside, perfectly cooked on the inside.",
  "Will definitely be sharing this link with my friends!",
  "A delightful dish. The sauce ties everything together brilliantly.",
  "Super straightforward recipe with incredible results.",
  "Loved every bite! Making this again this weekend.",
  "Absolutely top tier recipe. Can't wait to explore more of your dishes!"
];


async function seedComments() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB.");

    const seedData = userIds.map((userId, index) => ({
      recipe: new mongoose.Types.ObjectId(recipeId),
      author: new mongoose.Types.ObjectId(userId),
      body: commentBodies[index % commentBodies.length]
    }));

    const result = await Comment.insertMany(seedData);
    console.log(`Successfully seeded ${result.length} comments!`);

  } catch (error) {
    console.error("Error seeding comments:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

seedComments();