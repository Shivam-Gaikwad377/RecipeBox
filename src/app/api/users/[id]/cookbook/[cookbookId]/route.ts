import { NextRequest, NextResponse } from "next/server";
import ApiResponse from "@/types/ApiResponse";
import { connectToDatabase } from "@/lib/dbConfig";
import { CookbookDocument, Cookbook } from "@/models/cookbook.model";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { isValidObjectId } from "mongoose";
export async function GET(req: NextRequest, { params }: { params: { id: string; cookBookId: string } }) {
    try {
        const session = await getServerSession(authOptions);
        const userId = session?.user?._id;
        await connectToDatabase();

        const { id, cookBookId } = await params;
        if(!isValidObjectId(id) || !isValidObjectId(cookBookId)) {
            return NextResponse.json<ApiResponse>(
                { success: false, message: "Invalid user ID or cookbook ID" },
                { status: 400 }
            );
        }
        if(userId?.toString() !== id) {
            return NextResponse.json<ApiResponse>(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }
        const cookBook = await Cookbook.findOne({ _id: cookBookId, author: userId });
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