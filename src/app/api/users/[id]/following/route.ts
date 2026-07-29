// route for getting the following count of a user through params id
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
        

        const { id } = await params;

        await connectToDatabase();
        const followingCount = await Follow.countDocuments({ follower: id });

        return NextResponse.json<ApiResponse>(
            { success: true, message: "Following count fetched successfully", data: { count: followingCount } },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error fetching following count:", error);
        return NextResponse.json<ApiResponse>(
            { success: false, message: "Internal Server Error" },
            { status: 500 }
        );
    }
}
