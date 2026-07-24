import { connectToDatabase } from "@/lib/dbConfig";
import { User } from "@/models/user.model";
import ApiResponse from "@/types/ApiResponse";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email, verificationToken } = await request.json();

    if (!email || !verificationToken) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: "Email and verification code are required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Explicit select in case these fields are select:false in the schema.
    const user = await User.findOne({ email }).select(
      "+verificationToken +ExpiresAt +isEmailVerified"
    );

    if (!user) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    if (user.isEmailVerified) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: "Email already verified" },
        { status: 400 }
      );
    }

    const isCodeValid = user.verificationToken === verificationToken;
    const isCodeExpired = !!user.ExpiresAt && user.ExpiresAt <= new Date();

    if (!isCodeValid || isCodeExpired) {
      // Log the real reason server-side; keep client message generic
      // so you're not handing out an OTP-guessing oracle.
      console.warn("Verification failed:", {
        email,
        reason: !isCodeValid ? "invalid_code" : "expired_code",
      });
      return NextResponse.json<ApiResponse>(
        { success: false, message: "Invalid or expired verification code" },
        { status: 400 }
      );
    }

    user.isEmailVerified = true;
    user.verificationToken = undefined;
    user.set("ExpiresAt", undefined); // Clear the expiration time
    await user.save();

    return NextResponse.json<ApiResponse>(
      { success: true, message: "Email verified successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error verifying email:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, message: "An error occurred while verifying email" },
      { status: 500 }
    );
  }
}