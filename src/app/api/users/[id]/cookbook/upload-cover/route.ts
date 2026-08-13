import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { connectToDatabase } from "@/lib/dbConfig";
import { getImageKitClient } from "@/lib/imagekit";
import ApiResponse from "@/types/ApiResponse";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        // Instantiate ImageKit inside the handler (prevents build-time missing key error)
        const imagekitClient = getImageKitClient();

        // 1. Authenticate user
        const session = await getServerSession(authOptions);
        const userId = session?.user?._id;
        if (!session?.user?._id) {
            return NextResponse.json<ApiResponse>(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        // 2. Get the file from the request
        const uploadData = await req.formData();
        const previousFileId = uploadData.get("previousFileId") as string | null;
        const file = uploadData.get("coverImage");
        if (typeof file === "string" || !file) {
            return NextResponse.json<ApiResponse>(
                { success: false, message: "No file provided" },
                { status: 400 }
            );
        }

        await connectToDatabase();

        // 3. Convert File to Buffer
        const buffer = Buffer.from(await (file as File).arrayBuffer());

        // 4. Upload to ImageKit
        const result = await imagekitClient.upload({
            file: buffer,
            fileName: (file as File).name || "coverImage",
            folder: "/cookbook-covers",
            useUniqueFileName: true,
        });
        if (previousFileId) {
            // don't let a delete failure fail the whole request — log it, sweep later
            await imagekitClient.deleteFile(previousFileId).catch((err) =>
                console.error(`Orphan cleanup failed for ${previousFileId}:`, err)
            );
        }

        return NextResponse.json<ApiResponse>(
            {
                success: true,
                message: "Cover image uploaded successfully",
                data: {
                    coverImage: {
                        url: result.url,
                        fileId: result.fileId,
                    },
                },
            },
            { status: 200 }
        );
    }
    catch (error) {
        console.error("Error uploading cover image:", error);
        return NextResponse.json<ApiResponse>(
            { success: false, message: "Internal Server Error" },
            { status: 500 }
        );
    }
}