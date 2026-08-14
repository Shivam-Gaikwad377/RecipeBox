import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { connectToDatabase } from "@/lib/dbConfig";
import { Cookbook } from "@/models/cookbook.model";
import ApiResponse from "@/types/ApiResponse";
import { isValidObjectId } from "mongoose";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";


const bodySchema = z.object({
    recipeId: z.string().refine(isValidObjectId, "Invalid recipe id"),
});

export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string; cookbookId: string } }
) {
    const session = await getServerSession(authOptions);
    const { id, cookbookId } = await params;
    if (!session?.user?._id) {
        return NextResponse.json<ApiResponse>(
            { success: false, message: "Unauthorized" },

            { status: 401 }
        );
    }
    if (session.user._id !== id) {
        return NextResponse.json<ApiResponse>(
            { success: false, message: "Forbidden" },
            { status: 403 }
        );
    }
    if (!isValidObjectId(cookbookId)) {
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
        { _id: cookbookId, author: session.user._id },
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