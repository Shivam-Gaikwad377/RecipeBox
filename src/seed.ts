import mongoose, { Schema, model } from "mongoose";
import { faker } from "@faker-js/faker";
import dotenv from "dotenv";
import { User } from "@/models/user.model"; // Adjust the import path as necessary
import { Recipe } from "@/models/recipe.model"; // Adjust the import path as necessary
dotenv.config();
// 1. Define Mongoose Schemas
const ingredientSchema = new Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  unit: String,
});

const instructionSchema = new Schema({
  order: { type: Number, required: true },
  text: { type: String, required: true },
});



// 2. User IDs List
const userIds = [
  "6a74b1f477b4521425cc601c", "6a74b1f477b4521425cc601d", "6a74b1f477b4521425cc601e",
  "6a74b1f477b4521425cc601f", "6a74b1f477b4521425cc6020", "6a74b1f477b4521425cc6021",
  "6a74b1f477b4521425cc6022", "6a74b1f477b4521425cc6023", "6a74b1f477b4521425cc6024",
  "6a74b1f477b4521425cc6025", "6a74b1f477b4521425cc6026", "6a74b1f477b4521425cc6027",
  "6a74b1f477b4521425cc6028", "6a74b1f477b4521425cc6029", "6a74b1f477b4521425cc602a",
  "6a74b1f477b4521425cc602b", "6a74b1f477b4521425cc602c", "6a74b1f477b4521425cc602d",
  "6a74b1f477b4521425cc602e", "6a74b1f477b4521425cc602f", "6a74b1f477b4521425cc6030",
  "6a74b1f477b4521425cc6031", "6a74b1f477b4521425cc6032", "6a74b1f477b4521425cc6033",
  "6a74b1f477b4521425cc6034", "6a74b1f477b4521425cc6035", "6a74b1f477b4521425cc6036",
  "6a74b1f477b4521425cc6037", "6a74b1f477b4521425cc6038", "6a74b1f477b4521425cc6039",
  "6a74b1f477b4521425cc603a", "6a74b1f477b4521425cc603b", "6a74b1f477b4521425cc603c",
  "6a74b1f477b4521425cc603d", "6a74b1f477b4521425cc603e", "6a74b1f477b4521425cc603f",
  "6a74b1f477b4521425cc6040", "6a74b1f477b4521425cc6041", "6a74b1f477b4521425cc6042",
  "6a74b1f477b4521425cc6043", "6a74b1f477b4521425cc6044", "6a74b1f477b4521425cc6045",
  "6a74b1f477b4521425cc6046", "6a74b1f477b4521425cc6047", "6a74b1f477b4521425cc6048",
  "6a74b1f477b4521425cc6049", "6a74b1f477b4521425cc604a", "6a74b1f477b4521425cc604b",
  "6a74b826d3880b84f2050f0c"
];

// 3. Generator Helper
const generateRecipeForUser = (userId: string) => ({
  author: userId,
  title: faker.food.dish(),
  description: faker.food.description(),
  ingredients: Array.from({ length: faker.number.int({ min: 3, max: 7 }) }, () => ({
    name: faker.food.ingredient(),
    quantity: faker.number.int({ min: 1, max: 500 }),
    unit: faker.helpers.arrayElement(["g", "kg", "ml", "cup", "tbsp", "tsp"]),
  })),
  instructions: Array.from({ length: faker.number.int({ min: 3, max: 6 }) }, (_, i) => ({
    order: i + 1,
    text: faker.lorem.sentence(),
  })),
  nutritionalInfo: {
    calories: faker.number.int({ min: 150, max: 800 }),
    protein: faker.number.int({ min: 5, max: 50 }),
    carbs: faker.number.int({ min: 10, max: 100 }),
    fat: faker.number.int({ min: 2, max: 40 }),
  },
  cookTime: faker.number.int({ min: 10, max: 90 }),
  prepTime: faker.number.int({ min: 5, max: 30 }),
  servings: faker.number.int({ min: 1, max: 6 }),
  difficulty: faker.helpers.arrayElement(["Easy", "Medium", "Hard"]),
  tags: [faker.food.ethnicCategory(), faker.helpers.arrayElement(["Quick", "Healthy", "Vegan"])],
});

// 4. Seed Function
async function runSeed() {
  const MONGO_URI = process.env.MONGO_URL || "mongodb://localhost:27017/your_db_name"; // Replace with your URI

  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB.");

    const allRecipes = userIds.flatMap((id) => {
      const count = faker.number.int({ min: 4, max: 5 });
      return Array.from({ length: count }, () => generateRecipeForUser(id));
    });

    console.log(`Inserting ${allRecipes.length} recipes into the database...`);
    await Recipe.insertMany(allRecipes);

    console.log("Seeding complete!");
  } catch (error) {
    console.error("Failed to seed database:", error);
  } finally {
    await mongoose.disconnect();
  }
}

runSeed();