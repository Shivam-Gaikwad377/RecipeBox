import { NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import { connectToDatabase } from "@/lib/dbConfig";
import { Recipe } from "@/models/recipe.model";
import ApiResponse from "@/types/ApiResponse";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try{
        const recipeId = (await params).id;
        if (!isValidObjectId(recipeId)) {
            return NextResponse.json<ApiResponse>(
                { success: false, message: "Invalid recipe ID" },
                { status: 400 }
            );
        }

        const recipe = await Recipe.findById(recipeId);

        if (!recipe) {
            return NextResponse.json<ApiResponse>(
                { success: false, message: "Recipe not found" },
                { status: 404 }
            );
        }

        return NextResponse.json<ApiResponse>(
            {
                success: true,
                message: "Recipe fetched successfully",
                data: recipe,
            },
            { status: 200 }
        );
    } catch (error: unknown) {
        console.error("Error fetching recipe:", error);
        return NextResponse.json<ApiResponse>(
            { success: false, message: "Failed to fetch recipe" },
            { status: 500 }
        );
    }
}