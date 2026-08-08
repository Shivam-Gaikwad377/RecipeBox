import { NextResponse, NextRequest } from "next/server";
import { Recipe } from "@/models/recipe.model";
import ApiResponse from "@/types/ApiResponse";
import { connectToDatabase } from "@/lib/dbConfig";
export async function GET(req: Request){
    try{
        await connectToDatabase();
        const recipes = await Recipe.find({}).select({_id: 1, title:0, description: 0, coverImage: 0, ingredients: 0, instructions: 0, tags: 0, nutritionalInfo: 0, prepTime:0, cookTime: 0, servings: 0, difficulty: 0, createdAt: 0, updatedAt: 0, __v: 0, author: 0, ratingAverage: 0, ratingCount: 0});
        return NextResponse.json({ success: true, data: recipes });
    }catch(error){
        console.error("Error fetching recipes:", error);
        return NextResponse.json({ success: false, message: "Failed to fetch recipes" }, { status: 500 });
    }
}