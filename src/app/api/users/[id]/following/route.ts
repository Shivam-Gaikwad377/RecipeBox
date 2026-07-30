import { NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";
import { connectToDatabase } from "@/lib/dbConfig";
import { Follow } from "@/models/following.model";
import ApiResponse from "@/types/ApiResponse";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!isValidObjectId(id)) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: "Invalid user id" },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const followingCount = await Follow.countDocuments({ follower: id });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        message: "Following count fetched successfully",
        data: { count: followingCount },
      },
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
