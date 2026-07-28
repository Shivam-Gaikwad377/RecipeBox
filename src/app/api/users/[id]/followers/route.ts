// route for getting the follower count of a user through params id
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/options";
import { connectToDatabase } from "@/lib/dbConfig";
import { Follow } from "@/models/following.model";
import ApiResponse from "@/types/ApiResponse";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> } // Next 15: params is async
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?._id) {
            return NextResponse.json<ApiResponse>(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const { id } = await params;

        await connectToDatabase();
        const followerCount = await Follow.countDocuments({ following: id });

        return NextResponse.json<ApiResponse>(
            { success: true, message: "Follower count fetched successfully", data: { count: followerCount } },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error fetching follower count:", error);
        return NextResponse.json<ApiResponse>(
            { success: false, message: "Internal Server Error" },
            { status: 500 }
        );
    }
}