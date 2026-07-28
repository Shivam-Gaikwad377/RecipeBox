import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import { User } from "@/models/user.model";
import { updateProfileSchema } from "@/schemas/updateProfile.schema";
import ApiResponse from "@/types/ApiResponse";
import { connectToDatabase } from "@/lib/dbConfig";

// Confirm these match your schema's actual field names exactly (case-sensitive)
const SAFE_FIELDS = "-passwordHash -verificationToken -expiresAt";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ username: string }> } // Next 15: params is async
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?._id) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { username } = await params;

    await connectToDatabase();
    const user = await User.findOne({ username }).select(SAFE_FIELDS);

    if (!user) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

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

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?._id) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json(); // was missing await — this was silently breaking validation
    const parsedBody = updateProfileSchema.safeParse(body); // safeParse is sync, no await needed

    if (!parsedBody.success) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: "Invalid input", data: parsedBody.error.flatten() },
        { status: 400 }
      );
    }
    await connectToDatabase();
    const updatedUser = await User.findOneAndUpdate( // was missing await
      { _id: session.user._id },
      {
        $set: {
          name: parsedBody.data.name,
          username: parsedBody.data.username, // Use existing email if not provided
          bio: parsedBody.data.bio,
        },
      },
      { new: true }
    ).select(SAFE_FIELDS);

    if (!updatedUser) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>(
      { success: true, message: "Profile updated successfully", data: updatedUser },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating user profile:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}