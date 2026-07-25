import { NextResponse } from "next/server";
import { User } from "@/models/user.model";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import ApiResponse from "@/types/ApiResponse";

export async function GET(req: Request, { params }: { params: { username: string } }) {
  try {
    // 1. Authenticate user
    const session = await getServerSession(authOptions);
    if (!session?.user?._id) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }
    const username = (await params).username;

    // 2. Fetch user profile by username
    const user = await User.findOne({ username }).select("-passwordHash -verficationToken -ExpiresAt"); // Exclude sensitive fields
    if (!user) {
        return NextResponse.json<ApiResponse>(
            { success: false, message: "User not found" },
            { status: 404 }
        );
    }

    // 3. Return user profile
    return NextResponse.json<ApiResponse>(
      { success: true, message: "User profile fetched successfully", data: user },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
