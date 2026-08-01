import { NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import { connectToDatabase } from "@/lib/dbConfig";
import { Recipe } from "@/models/recipe.model";
import ApiResponse from "@/types/ApiResponse";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const recipeId = (await params).id;
        if (!isValidObjectId(recipeId)) {
            return NextResponse.json<ApiResponse>(
                { success: false, message: "Invalid recipe ID" },
                { status: 400 }
            );
        }
        await connectToDatabase();

        const recipe = await Recipe.findOne({ _id: recipeId }).populate("author");

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

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        const userId = session?.user?._id;
        if(!userId) {
            return NextResponse.json<ApiResponse>(
                { success: false, message: "You must be logged in to delete a recipe" },
                { status: 401 }
            );
        }
        const recipeId = (await params).id;
        if (!isValidObjectId(recipeId)) {
            return NextResponse.json<ApiResponse>(
                { success: false, message: "Invalid recipe ID" },
                { status: 400 }
            );
        }

        await connectToDatabase();

        const deletedRecipe = await Recipe.findOneAndDelete({ _id: recipeId, author: userId });

        if (!deletedRecipe) {
            return NextResponse.json<ApiResponse>(
                { success: false, message: "Recipe not found or you are not authorized to delete it" },
                { status: 404 }
            );
        }

        return NextResponse.json<ApiResponse>(
            {
                success: true,
                message: "Recipe deleted successfully",
                data: deletedRecipe,
            },
            { status: 200 }
        );
    } catch (error: unknown) {
        console.error("Error deleting recipe:", error);
        return NextResponse.json<ApiResponse>(
            { success: false, message: "Failed to delete recipe" },
            { status: 500 }
        );
    }
}


