import { User } from "@/models/user.model";
import { NextResponse } from "next/server";
import ApiResponse from "@/types/ApiResponse";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/dbConfig";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";

export function GET(request: Request) {
  try {
    const session = getServerSession(authOptions);
    if (!session) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username");
    if (!username) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: "Username is required" },
        { status: 400 }
      );
    }
    connectToDatabase();
    const user = User.findOne({ username: username });
    if (!user) {
      return NextResponse.json<ApiResponse>(
        { success: true, message: "Username is available" },
        { status: 200 }
      );
    }
    return NextResponse.json<ApiResponse>(
      { success: false, message: "Username is already taken" },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json<ApiResponse>(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
