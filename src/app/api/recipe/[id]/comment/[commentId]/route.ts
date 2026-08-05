import { NextRequest, NextResponse } from "next/server";
import ApiResponse from "@/types/ApiResponse";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../auth/[...nextauth]/options";
import { connectToDatabase } from "@/lib/dbConfig";
import { isValidObjectId } from "mongoose";
import { commentSchema } from "@/schemas/comment.schema";
import { Comment } from "@/models/comment.model";
type RouteContext = {
    params: Promise<{ id: string; commentId: string }>;
};
export async function PUT(request: NextRequest, { params }: RouteContext) {

    try {
        const session = await getServerSession(authOptions);
        const userId = session?.user?._id;
        if (!userId) {
            return NextResponse.json<ApiResponse>(
                { success: false, message: "You must be logged in to update a comment" },
                { status: 401 }
            );
        }

        const { id: recipeId, commentId } = await params;
        if (!isValidObjectId(recipeId) || !isValidObjectId(commentId)) {
            return NextResponse.json<ApiResponse>(
                { success: false, message: "Invalid recipe or comment ID" },
                { status: 400 }
            );
        }

        const requestBody = await request.json();
        const parsedData = commentSchema.safeParse({ ...requestBody, recipe: recipeId, author: userId });

        if (!parsedData.success) {
            const errorMessages = parsedData.error.issues.map(err => err.message).join(", ");
            return NextResponse.json<ApiResponse>(
                { success: false, message: `Validation failed: ${errorMessages}` },
                { status: 400 }
            );
        }

        await connectToDatabase();
        const comment = await Comment.findOneAndUpdate(
            { _id: commentId, recipe: recipeId, author: userId },
            { body: parsedData.data.body },
            { returnDocument: 'after' }
        );
        if (!comment) {
            return NextResponse.json<ApiResponse>(
                { success: false, message: "Comment not found or you are not authorized to update it" },
                { status: 404 }
            );
        }

        return NextResponse.json<ApiResponse>(
            { success: true, message: "Comment updated successfully", data: comment },
            { status: 200 }
        );

    } catch (error) {
        console.error("Error updating comment:", error);
        return NextResponse.json<ApiResponse>(
            { success: false, message: "Internal Server Error" },
            { status: 500 }
        );
    }
}
