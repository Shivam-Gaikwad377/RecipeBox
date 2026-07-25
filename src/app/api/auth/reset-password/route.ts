import { NextResponse } from "next/server";
import {User} from "@/models/user.model";
import { connectToDatabase } from "@/lib/dbConfig";
import ApiResponse from "@/types/ApiResponse";
import bcrypt from "bcryptjs";
import { resetPasswordSchema } from "@/schemas/resetPassword.schema";


export async function POST(request: Request) {
  try {
    //connect to database and validate request body
    await connectToDatabase();
    const { email, verificationToken, newPassword } = await request.json();
    //find user by email
    const user = await User.findOne({
      email,
    });
    if (!user) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }
    const parseResult = resetPasswordSchema.safeParse({
      email,
      verificationToken,
      newPassword,
    });
    if (!parseResult.success) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: parseResult.error.issues
            .map((err: any ) => err.message)
            .join(", "),
        },
        { status: 400 }
      );
    }
    //check if code is valid and not expired

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
    ///hash new password and update user document
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.passwordHash = hashedNewPassword;
    user.verificationToken = undefined;
    user.set("ExpiresAt", undefined);
    await user.save();
    //return success response
    return NextResponse.json<ApiResponse>(
      {
        success: true,
        message: "Password reset successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error resetting password:", error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        message: "An error occurred while resetting password",
      },
      { status: 500 }
    );
  }
}
