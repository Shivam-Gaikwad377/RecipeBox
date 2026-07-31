import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import { connectToDatabase } from "@/lib/dbConfig";
import { Recipe } from "@/models/recipe.model";
import ApiResponse from "@/types/ApiResponse";
import { isValidObjectId } from "mongoose";
import { recipeSchema } from "@/schemas/recipe.schema";
import mongoose from "mongoose";
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?._id;
    if (!isValidObjectId(userId)) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: "Invalid user ID" },
        { status: 400 }
      );
    }
    if (!userId) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: "You must be logged in to create a recipe" },
        { status: 401 }
      );
    }

    const requestBody = await request.json();
    const parseResult = recipeSchema.safeParse(requestBody);

    if (!parseResult.success) {
      const errorMessages = parseResult.error.issues
        .map((err) => err.message)
        .join(", ");
      return NextResponse.json<ApiResponse>(
        { success: false, message: `Validation failed: ${errorMessages}` },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const newRecipe = new Recipe({
      ...parseResult.data,
      author: new mongoose.Types.ObjectId(userId),
    });

    const savedRecipe = await newRecipe.save();

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        message: "Recipe created successfully",
        data: savedRecipe,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Error creating recipe:", error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        message: "An error occurred while creating the recipe",
      },
      { status: 500 }
    );
  }
}

    
