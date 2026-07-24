import ApiResponse from "@/types/ApiResponse";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { connectToDatabase } from "@/lib/dbConfig";
import { User } from "@/models/user.model";
import { NextResponse } from "next/server";
import { signUpSchema } from "@/schemas/signup.schema";

export async function POST(request: Request) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const parseResult = signUpSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: parseResult.error.issues.map((e ) => e.message).join(", "),
        },
        { status: 400 }
      );
    }

    // Normalize once, use everywhere  otherwise "User@x.com" and "user@x.com" are different documents to MongoDb.
    const email = parseResult.data.email.toLowerCase().trim();
    const username = parseResult.data.username.trim();
    const { name, password, bio } = parseResult.data;

    // Single query instead of two: get whoever currently holds either field.
    const conflictingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (conflictingUser) {
      const emailMatches = conflictingUser.email === email;
      const usernameMatches = conflictingUser.username === username;

      // A verified user owns this email or username  hard block.
      if (conflictingUser.isEmailVerified) {
        return NextResponse.json<ApiResponse>(
          {
            success: false,
            message: emailMatches
              ? "This email is already registered. Please log in instead."
              : "This username is already taken.",
          },
          { status: 409 }
        );
      }

      // Unverified user owns the USERNAME but under a different email
      if (usernameMatches && !emailMatches) {
        return NextResponse.json<ApiResponse>(
          { success: false, message: "This username is already taken." },
          { status: 409 }
        );
      }

      // Otherwise: same unverified user re-registering with the same
      // email — legitimate resend flow, fall through and update below.
    }

    const verificationToken = crypto.randomInt(100000, 1000000).toString();
    const expirationTime = new Date(Date.now() + 10 * 60 * 1000);
    const hashedPassword = await bcrypt.hash(password, 10);

    const existingUnverifiedByEmail =
      conflictingUser?.email === email ? conflictingUser : null;

    if (existingUnverifiedByEmail) {
      existingUnverifiedByEmail.name = name;
      existingUnverifiedByEmail.username = username;
      existingUnverifiedByEmail.passwordHash = hashedPassword;
      existingUnverifiedByEmail.verificationToken = verificationToken;
      existingUnverifiedByEmail.ExpiresAt = expirationTime;
      existingUnverifiedByEmail.bio = bio ?? "";
      await existingUnverifiedByEmail.save();
    } else {
      await User.create({
        name,
        email,
        username,
        passwordHash: hashedPassword,
        verificationToken,
        ExpiresAt: expirationTime,
        isEmailVerified: false,
        bio: bio ?? "",
      });
    }

    const emailResponse = await sendVerificationEmail(email, name, verificationToken);

    if (!emailResponse.success) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: emailResponse.message },
        { status: 500 }
      );
    }

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        message:
          "User registered successfully. Please check your email for the verification code.",
      },
      { status: 201 }
    );
  } catch (error: any) {
    //safety net
    if (error?.code === 11000) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: "Email or username already in use." },
        { status: 409 }
      );
    }

    console.error("Error during signup:", error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        message: "An error occurred during signup. Please try again later.",
      },
      { status: 500 }
    );
  }
}