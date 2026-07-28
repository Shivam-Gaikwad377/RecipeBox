import { NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import { connectToDatabase } from "@/lib/dbConfig";
import { Follow } from "@/models/following.model";
import { User } from "@/models/user.model"; // adjust to your actual path
import ApiResponse from "@/types/ApiResponse";

const DUPLICATE_KEY_ERROR = 11000;

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const followerId = session?.user?.data?._id;

    if (!followerId) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: "You must be logged in to follow users" },
        { status: 401 }
      );
    }

    let followingId: unknown;
    try {
      ({ followingId } = await request.json());
    } catch {
      return NextResponse.json<ApiResponse>(
        { success: false, message: "Invalid request body" },
        { status: 400 }
      );
    }

    if (typeof followingId !== "string" || !isValidObjectId(followingId)) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: "Invalid following ID" },
        { status: 400 }
      );
    }

    if (String(followerId) === String(followingId)) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: "You cannot follow yourself" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const targetExists = await User.exists({ _id: followingId });
    if (!targetExists) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    try {
      await Follow.create({ follower: followerId, following: followingId });
    } catch (err: unknown) {
      const isDuplicate =
        typeof err === "object" &&
        err !== null &&
        (err as { code?: number }).code === DUPLICATE_KEY_ERROR;

      if (isDuplicate) {
        return NextResponse.json<ApiResponse>(
          { success: false, message: "You are already following this user" },
          { status: 409 }
        );
      }
      throw err;
    }

    return NextResponse.json<ApiResponse>(
      { success: true, message: "User followed successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in follow route:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const followerId = session?.user?.data?._id;

    if (!followerId) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: "You must be logged in to unfollow users" },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => null);
    const followingId = body?.followingId;

    if (!followingId || !isValidObjectId(followingId)) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: "Invalid following ID" },
        { status: 400 }
      );
    }

    if (followingId === followerId) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: "You cannot unfollow yourself" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const deleteResult = await Follow.deleteOne({
      follower: followerId,
      following: followingId,
    });

    if (deleteResult.deletedCount === 0) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: "You are not following this user" },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>(
      { success: true, message: "User unfollowed successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in unfollow route:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
