//route to find the status is a user is following another
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../auth/[...nextauth]/options";
import { connectToDatabase } from "@/lib/dbConfig";
import { Follow } from "@/models/following.model";
import ApiResponse from "@/types/ApiResponse";

type RouteContext = {
  params: Promise<{ id: string }>;
};
export async function GET(request: Request, { params }: RouteContext) {
    try{
        const session = await getServerSession(authOptions);
        const { id } = await params;
        await connectToDatabase();
        if(!session?.user?._id){
            return NextResponse.json<ApiResponse>(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }
        const isFollowing = await Follow.exists({ follower: session.user._id, following: id });
        return NextResponse.json<ApiResponse>(
            { success: true, message: "Follow status fetched successfully", data: { isFollowing: !!isFollowing } },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error fetching follow status:", error);
        return NextResponse.json<ApiResponse>(
            { success: false, message: "Internal Server Error" },
            { status: 500 }
        );
        
    }
}