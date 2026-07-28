import { connectToDatabase } from "@/lib/dbConfig";
import {User} from "@/models/user.model";
import ApiResponse from "@/types/ApiResponse";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import { NextResponse } from "next/server";

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    await connectToDatabase();
    const user = await User.findById(session.user._id);
    if (!user) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }
    if (!user.pendingEmail) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: "No pending email change request found",
        },
        { status: 400 }
      );
    }
    const { verificationToken } = await request.json();
    const isCodeValid = user.verificationToken === verificationToken;
    const isCodeExpired = !!user.ExpiresAt && user.ExpiresAt <= new Date();

    if (!isCodeValid || isCodeExpired) {
      // Log the real reason server-side; keep client message generic
      // so you're not handing out an OTP-guessing oracle.
      console.warn("Verification failed:", {
        reason: !isCodeValid ? "invalid_code" : "expired_code",
      });
      return NextResponse.json<ApiResponse>(
        { success: false, message: "Invalid or expired verification code" },
        { status: 400 }
      );
    }

    user.verificationToken = undefined;
    user.set("ExpiresAt", undefined); // Clear the expiration time
    user.email = user.pendingEmail;
    user.pendingEmail = undefined;
    user.isEmailVerified = true;
    await user.save();
    return NextResponse.json<ApiResponse>(
      {
        success: true,
        message: "Email verified successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error verifying email:", error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        message: "An error occurred while verifying email",
      },
      { status: 500 }
    );
  }
}
