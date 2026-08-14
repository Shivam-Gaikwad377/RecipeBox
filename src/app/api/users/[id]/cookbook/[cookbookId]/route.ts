import { NextRequest, NextResponse } from "next/server";
import ApiResponse from "@/types/ApiResponse";
import { connectToDatabase } from "@/lib/dbConfig";
import { CookbookDocument, Cookbook } from "@/models/cookbook.model";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { isValidObjectId } from "mongoose";
import { RecipeDocument } from "@/models/recipe.model";
import z from "zod";
import { updateCookbookSchema } from "@/schemas/updateCookbook.schema";
export async function GET(req: NextRequest, { params }: { params: { id: string; cookbookId: string } }) {
    try {
        const session = await getServerSession(authOptions);
        const userId = session?.user?._id;
        await connectToDatabase();

        const { id, cookbookId } = (await params);
        if (!isValidObjectId(id) || !isValidObjectId(cookbookId)) {
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
        const cookBook = await Cookbook.findOne({ _id: cookbookId, author: userId }).populate<{ recipes: RecipeDocument[] }>("recipes").exec();
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

export async function DELETE(req: NextRequest, { params }: { params: { id: string; cookbookId: string } }) {
    try {
        const session = await getServerSession(authOptions);
        const userId = session?.user?._id;
        await connectToDatabase();
        const { id, cookbookId } = (await params);
        if (!isValidObjectId(id) || !isValidObjectId(cookbookId)) {
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

        const deletedCookbook = await Cookbook.findOneAndDelete({ _id: cookbookId, author: userId }).exec();

        if (!deletedCookbook) {
            return NextResponse.json<ApiResponse>(
                { success: false, message: "Cookbook not found or you are not the author" },
                { status: 404 }
            );
        }

        return NextResponse.json<ApiResponse>(
            { success: true, message: "Cookbook deleted successfully", data: deletedCookbook },
            { status: 200 }
        );
    }

    catch (error) {
        console.error("Error deleting cookbook:", error);
        return NextResponse.json<ApiResponse>(
            { success: false, message: "Failed to delete cookbook" },
            { status: 500 }
        );
    }

}

export async function PATCH(req: NextRequest, { params }: { params: { id: string; cookbookId: string } }) {
    try {
        const session = await getServerSession(authOptions);
        const userId = session?.user?._id;
        await connectToDatabase();
        const { id, cookbookId } = (await params);
        if (!isValidObjectId(id) || !isValidObjectId(cookbookId)) {
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

        const requestBody = await req.json();
        const parsedData = updateCookbookSchema.safeParse(requestBody);
        if (!parsedData.success) {
            return NextResponse.json<ApiResponse>(
                { success: false, message: "Invalid request data", data: parsedData.error.format() },
                { status: 400 }
            );
        }

        const updatedCookbook = await Cookbook.findOneAndUpdate(
            { _id: cookbookId, author: userId },
            { $set: parsedData.data },
            { new: true }
        ).exec();

        if (!updatedCookbook) {
            return NextResponse.json<ApiResponse>(
                { success: false, message: "Cookbook not found or you are not the author" },
                { status: 404 }
            );
        }

        return NextResponse.json<ApiResponse>(
            { success: true, message: "Cookbook updated successfully", data: updatedCookbook },
            { status: 200 }
        );
    }
    catch (error) {
        console.error("Error updating cookbook:", error);
        return NextResponse.json<ApiResponse>(
            { success: false, message: "Failed to update cookbook" },
            { status: 500 }
        );
    }

}