import {User} from "@/models/user.model";
import { connectToDatabase } from "@/lib/dbConfig";
import ApiResponse from "@/types/ApiResponse";
import { emailSchema } from "@/schemas/email.schema";
import { sendPasswordResetEmail } from "@/helpers/sendPasswordResetEmail";
import { NextResponse } from "next/server";
import crypto from "crypto";
export async function POST(request: Request) {
  try {
    //connect to database and validate email format
    await connectToDatabase();
    const { identifier } = await request.json();
    const parseResult = emailSchema.safeParse({ email: identifier });
    if (!parseResult.success) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: "Invalid email format" },
        { status: 400 }
      );
    }
    //find user by email
    const user = await User.findOne({ email: identifier });
    if (!user) {
      return NextResponse.json<ApiResponse>(
        {
          success: true,
          message:
            "If the user with this email exist, a password reset email will be sent",
        },
        { status: 201 }
      );
    }
    //generate OTP and expiration time
    const verificationToken = crypto.randomInt(100000, 1000000).toString();
    const expirationTime = new Date(Date.now() + 10 * 60 * 1000);
    user.verificationToken = verificationToken;
    user.ExpiresAt = expirationTime;
    //save OTP and expiration time to user document
    await user.save();
    //send password reset email with OTP
    const emailResponse = await sendPasswordResetEmail(
      user.email,
      user.name,
      verificationToken
    );
    if (!emailResponse.success) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: "Failed to send password reset email",
        },
        { status: 500 }
      );
    }
    //return success response regardless of whether user exists or not to prevent email enumeration

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        message:
          "If the user with this email exist, a password reset email will be sent",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in forgot password process:", error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        message: "An error occurred while processing forgot password request",
      },
      { status: 500 }
    );
  }
}
