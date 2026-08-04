import { NextRequest, NextResponse } from "next/server";
import { RatingDocument } from "@/models/rating.model";
import { Rating } from "@/models/rating.model";
import { ratingSchema } from "@/schemas/rating.schema";
import { isValidObjectId } from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/options";
import { connectToDatabase } from "@/lib/dbConfig";
import ApiResponse from "@/types/ApiResponse";
import { recalculateRecipeRating } from "@/helpers/recalculatingRating";
import { Recipe } from "@/models/recipe.model";
type RouteContext = {
    params: Promise<{ id: string }>;
};
export async function POST(req: NextRequest, { params }: RouteContext) {
    try {
        const session = await getServerSession(authOptions);
        const userId = session?.user?._id;
        if (!userId) {
            return NextResponse.json<ApiResponse>({
                success: false,
                message: "Unauthorized",

            }
                , { status: 401 });
        }

        const recipeId = (await params).id;
        if (!isValidObjectId(recipeId)) {
            return NextResponse.json<ApiResponse>(
                { success: false, message: "Invalid recipe id" },
                { status: 400 }
            );
        }

        const recipeExists = await Recipe.exists({ _id: recipeId });
        if (!recipeExists) {
            return NextResponse.json<ApiResponse>(
                { success: false, message: "Recipe not found" },
                { status: 404 }
            );
        }
        const requestBody = await req.json();
        const parsedData = ratingSchema.safeParse({ ...requestBody, recipe: recipeId, user: userId });

        if (!parsedData.success) {
            const errorMessages = parsedData.error.issues.map((err) => err.message).join(", ");
            return NextResponse.json<ApiResponse>({
                success: false,
                message: `Validation failed: ${errorMessages}`,
            }, { status: 400 });
        }

        await connectToDatabase();

        const raiting = await Rating.findOneAndUpdate<RatingDocument>(
            { recipe: recipeId, user: userId },
            { value: parsedData.data.value },
            { returnDocument: 'after', upsert: true }
        );

        const { ratingAverage, ratingCount } = await recalculateRecipeRating(recipeId);

        return NextResponse.json<ApiResponse>({
            success: true,
            message: "Rating submitted successfully",
            data: { ratingAverage, ratingCount },
        }, { status: 200 });
    } catch (error) {
        console.error("Error submitting rating:", error);
        return NextResponse.json<ApiResponse>({
            success: false,
            message: "An error occurred while submitting the rating",
        }, { status: 500 });

    }
}
