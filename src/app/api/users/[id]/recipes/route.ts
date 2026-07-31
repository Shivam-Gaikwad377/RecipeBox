import {NextResponse} from "next/server";
import {Recipe} from "@/models/recipe.model";
import {connectToDatabase} from "@/lib/dbConfig";
import {isValidObjectId} from "mongoose";
import ApiResponse from "@/types/ApiResponse";
import {getServerSession} from "next-auth";
import {authOptions} from "../../../auth/[...nextauth]/options";

type paramsType = { params: Promise<{ id: string }> };

export async function GET(request: Request, {params}: paramsType) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?._id;
    if (!isValidObjectId(userId)) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: "Invalid user ID" },
        { status: 400 }
      );
    }

    const [total, recipes] = await Promise.all([
        Recipe.countDocuments({ author: userId }),
        Recipe.find({ author: userId }).sort({ createdAt: -1 })
    ]);

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        message: "Recipes fetched successfully",
        data: { total, recipes },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Error fetching recipes:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, message: "Failed to fetch recipes" },
      { status: 500 }
    );
  }
}