import { Comment } from "@/models/comment.model";
import { commentSchema } from "@/schemas/comment.schema";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/options";
import { connectToDatabase } from "@/lib/dbConfig";
import { isValidObjectId } from "mongoose";
import ApiResponse from "@/types/ApiResponse";
type RouteContext = {
    params: Promise<{ id: string }>;
};

export async function POST(request: Request, { params }: RouteContext) {

    try {
        const session = await getServerSession(authOptions);
        const userId = session?.user?._id;
        if (!userId) {
            return NextResponse.json<ApiResponse>(
                { success: false, message: "You must be logged in to post a comment" },
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
        const newComment = new Comment({
            recipe: recipeId,
            author: userId,
            body: parsedData.data.body
        });

        const savedComment = await newComment.save();

        return NextResponse.json<ApiResponse>(
            { success: true, message: "Comment posted successfully", data: savedComment },
            { status: 201 }
        );

    } catch (error) {
        console.error("Error posting comment:", error);
        return NextResponse.json<ApiResponse>(
            { success: false, message: "Internal Server Error" },
            { status: 500 }
        );

    }
}

export async function GET(request: Request, { params }: RouteContext) {

    try {
        const recipeId = (await params).id;
        if (!isValidObjectId(recipeId)) {
            return NextResponse.json<ApiResponse>(
                { success: false, message: "Invalid recipe ID" },
                { status: 400 }
            );
        }
        await connectToDatabase();
        const { searchParams } = new URL(request.url);
    const offset = Math.max(
      0,
      parseInt(searchParams.get("offset") ?? "0", 10) || 0
    );
    const limit = Math.min(
      50,
      parseInt(searchParams.get("limit") ?? "10", 10) || 10
    );


    const [Comments, total] = await Promise.all([
      Comment.aggregate([
        { $match: { recipe: recipeId } },
        { $lookup: { from: "users", localField: "author", foreignField: "_id", as: "author" } },
        { $unwind: "$author" },
        { $sort: { createdAt: -1 } },
        { $skip: offset },
        { $limit: limit },
      ]),
      Comment.countDocuments({ recipe: recipeId }),
    ]);
        
        return NextResponse.json<ApiResponse>(
            { success: true, message: "Comments fetched successfully", data: { comments: Comments, total } },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error fetching comments:", error);
        return NextResponse.json<ApiResponse>(
            { success: false, message: "Internal Server Error" },
            { status: 500 }
        );
    }
}
