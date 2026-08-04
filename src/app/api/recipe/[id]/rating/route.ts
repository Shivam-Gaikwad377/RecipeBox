import { NextRequest, NextResponse } from "next/server";
import { RatingDocument } from "@/models/rating.model";
import { Rating } from "@/models/rating.model";
import { ratingSchema } from "@/schemas/rating.schema";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/options";
import { connectToDatabase } from "@/lib/dbConfig";
import ApiResponse from "@/types/ApiResponse";
import { recalculateRecipeRating } from "@/helpers/recalculatingRating";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
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

        const raiting  = await Rating.findOneAndUpdate<RatingDocument>(
            { recipe: recipeId, user: userId },
            { value: parsedData.data.value },
            { new: true, upsert: true }
        );

        const { avgRating, ratingCount } = await recalculateRecipeRating(recipeId);

        return NextResponse.json<ApiResponse>({
            success: true,
            message: "Rating submitted successfully",
            data: { avgRating, ratingCount },
        }, { status: 200 });
    } catch (error) {
        console.error("Error submitting rating:", error);
        return NextResponse.json<ApiResponse>({
            success: false,
            message: "An error occurred while submitting the rating",
        }, { status: 500 });
        
    }
}
