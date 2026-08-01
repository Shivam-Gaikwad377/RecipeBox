import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/dbConfig";
import {User} from "@/models/user.model";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import { getImageKitClient } from "@/lib/imagekit";
import ApiResponse from "@/types/ApiResponse";


export async function PATCH(req: NextRequest) {
  try {
    // Instantiate ImageKit inside the handler (prevents build-time missing key error)
    const imagekitClient = getImageKitClient();

    // 1. Authenticate user
    const session = await getServerSession(authOptions);
    if (!session?.user?._id) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }
    const userId = session.user._id;


    // 2. Get the file from the request
    const uploadData = await req.formData();
    const file = uploadData.get("avatar");
    if (typeof file === "string" || !file) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: "No file provided" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

   

    // 4. Convert File to Buffer
    const buffer = Buffer.from(await (file as File).arrayBuffer());

    // 5. Upload to ImageKit
    const result = await imagekitClient.upload({
      file: buffer,
      fileName: (file as File).name || "avatar",
      folder: "/avatars",
      useUniqueFileName: true,
    });

     if ((existingUser?.avatar?.avatarFileId) && result.fileId !== existingUser.avatar.avatarFileId) {
      try {
        await imagekitClient.deleteFile(existingUser.avatar.avatarFileId);
      } catch (deleteError) {
        // Log the error but don't halt execution if the file is already gone
        console.error(
          "Failed to delete old avatar from ImageKit:",
          deleteError
        );
      }
    }

    // 6. Save URL to MongoDB
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        avatar: {
          avatarUrl: result.url,
          avatarFileId: result.fileId,
        },
      },
      { new: true }
    );



    return NextResponse.json<ApiResponse>(
      {
        success: true,
        message: "Avatar updated successfully",
        data: { avatar: updatedUser!.avatar },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating avatar:", error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        message:
          error.message || "An error occurred while updating the avatar",
      },
      { status: 500 }
    );
  }
}