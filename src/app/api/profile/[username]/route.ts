import { NextResponse } from "next/server";
import { User } from "@/models/user.model";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import ApiResponse from "@/types/ApiResponse";
import {updateProfileSchema} from "@/schemas/updateProfile.schema";
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

export async function PATCH(req:Request, { params }: { params: { username: string } }) {
    try{
        const session = await getServerSession(authOptions);
        if (!session?.user?._id) {
            return NextResponse.json<ApiResponse>(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }
        const body = req.json();
        const parsedBody = await updateProfileSchema.safeParse(body);
        if(!parsedBody.success){
            return NextResponse.json<ApiResponse>(
                { success: false, message: "Invalid input", data: parsedBody.error.flatten() },
                { status: 400 }
            );
        }
         const updatedUser = User.findOneAndUpdate(
            { _id: session.user._id },
            parsedBody.data,
            { new: true }
         ).select("-passwordHash -verficationToken -ExpiresAt");
         if(!updatedUser){
            return NextResponse.json<ApiResponse>(
                { success: false, message: "User not found" },
                { status: 404 }
            );
         }

         return NextResponse.json<ApiResponse>(
            { success: true, message: "Profile updated successfully", data: updatedUser },
            { status: 200 }
         )
    }catch(error){
        console.error("Error updating user profile:", error);
        return NextResponse.json<ApiResponse>(
            { success: false, message: "Internal Server Error" },
            { status: 500 }
        );
    }
}
