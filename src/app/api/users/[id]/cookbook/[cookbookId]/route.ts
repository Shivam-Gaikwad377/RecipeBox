import { NextRequest, NextResponse } from "next/server";
import ApiResponse from "@/types/ApiResponse";
import { connectToDatabase } from "@/lib/dbConfig";
import { CookbookDocument, Cookbook } from "@/models/cookbook.model";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { isValidObjectId } from "mongoose";
import { RecipeDocument } from "@/models/recipe.model";
import z from "zod";
export async function GET(req: NextRequest, { params }: { params: { id: string; cookBookId: string } }) {
    try {
        const session = await getServerSession(authOptions);
        const userId = session?.user?._id;
        await connectToDatabase();

        const { id, cookBookId } = await params;
        if (!isValidObjectId(id) || !isValidObjectId(cookBookId)) {
            return NextResponse.json<ApiResponse>(
                { success: false, message: "Invalid user ID or cookbook ID" },
                { status: 400 }
            );
        }
        if (userId?.toString() !== id) {
            return NextResponse.json<ApiResponse>(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }
        const cookBook = await Cookbook.findOne({ _id: cookBookId, author: userId }).populate<{ recipes: RecipeDocument[] }>("recipes").exec();
        if (!cookBook) {
            return NextResponse.json<ApiResponse>(
                { success: false, message: "Cookbook not found or you are not the author" },
                { status: 404 }
            );
        }

        return NextResponse.json<ApiResponse>(
            { success: true, message: "Cookbook retrieved successfully", data: cookBook },
            { status: 200 }
        );
    }
    catch (error) {
        console.error("Error retrieving cookbook:", error);
        return NextResponse.json<ApiResponse>(
            { success: false, message: "Failed to retrieve cookbook" },
            { status: 500 }
        );
    }

}

const bodySchema = z.object({
    recipeId: z.string().refine(isValidObjectId, "Invalid recipe id"),
});

export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string; cookbookId: string } }
) {
    const session = await getServerSession(authOptions);
    if (!session?.user?._id) {
        return NextResponse.json<ApiResponse>(
            { success: false, message: "Unauthorized" },

            { status: 401 }
        );
    }
    if (session.user._id !== params.id) {
        return NextResponse.json<ApiResponse>(
            { success: false, message: "Forbidden" },
            { status: 403 }
        );
    }
    if (!isValidObjectId(params.cookbookId)) {
        return NextResponse.json<ApiResponse>(
            { success: false, message: "Invalid cookbook id" },
            { status: 400 }
        );
    }

    const parsed = bodySchema.safeParse(await req.json());
    if (!parsed.success) {
        return NextResponse.json<ApiResponse>(
            { success: false, message: "Invalid request body" },
            { status: 400 }
        );
    }
    const { recipeId } = parsed.data;

    await connectToDatabase();

    const cookbook = await Cookbook.findOneAndUpdate(
        { _id: params.cookbookId, user: session.user._id },
        { $addToSet: { recipes: recipeId } },
        { new: true }
    ).lean();

    if (!cookbook) {
        return NextResponse.json<ApiResponse>(
            { success: false, message: "Cookbook not found" },
            { status: 404 }
        );
    }

    return NextResponse.json<ApiResponse>(
        { success: true, message: "Recipe added to cookbook", data: cookbook },
        { status: 200 }
    );
}