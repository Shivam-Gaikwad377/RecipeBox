import { NextResponse, NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/dbConfig";
import { Recipe } from "@/models/recipe.model";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/options";
import { getImageKitClient } from "@/lib/imagekit";
import ApiResponse from "@/types/ApiResponse";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
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
        const file = uploadData.get("coverImage");
        if (typeof file === "string" || !file) {
            return NextResponse.json<ApiResponse>(
                { success: false, message: "No file provided" },
                { status: 400 }
            );
        }

        await connectToDatabase();

        const recipeId = (await params).id;

        const recipe = await Recipe.findOne({ _id: recipeId, author: userId });
        if (!recipe) {
            return NextResponse.json<ApiResponse>(
                { success: false, message: "Recipe not found or you are not the author" },
                { status: 404 }
            );
        }

        // 3. Convert File to Buffer
        const buffer = Buffer.from(await (file as File).arrayBuffer());

        // 4. Upload to ImageKit
        const result = await imagekitClient.upload({
            file: buffer,
            fileName: (file as File).name || "coverImage",
            folder: "/recipe-covers",
            useUniqueFileName: true,
        });
        // 5. Save first — DB is the source of truth, ImageKit cleanup happens after
        const oldFileId = recipe.coverImage?.coverImageFileId;

        recipe.coverImage = {
            coverImageURL: result.url,
            coverImageFileId: result.fileId,
        };

        try {
            await recipe.save();
        } catch (saveError) {
            // save failed — the NEW upload is now orphaned, not the old one. Clean it up.
            await imagekitClient.deleteFile(result.fileId).catch(() => { });
            throw saveError; // let the outer catch return the 500
        }

        // only delete the old file once the new one is confirmed persisted
        if (oldFileId && oldFileId !== result.fileId) {
            await imagekitClient.deleteFile(oldFileId).catch((err) =>
                console.error("Failed to delete old cover image:", err)
            );
        }

        return NextResponse.json<ApiResponse>(
            {
                success: true,
                message: "Cover image uploaded and recipe updated successfully",
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