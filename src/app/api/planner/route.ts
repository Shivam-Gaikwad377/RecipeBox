import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectToDatabase } from "@/lib/dbConfig";
import { PlannerItem } from "@/models/plannerItem.model";
import { Recipe } from "@/models/recipe.model";
import { createPlannerItemSchema, plannerQuerySchema, toDayStart } from "@/schemas/planner.schema";
import { authOptions } from "../auth/[...nextauth]/options";
import ApiResponse from "@/types/ApiResponse";
export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?._id) {
        return NextResponse.json<ApiResponse>({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const parsed = createPlannerItemSchema.safeParse(await req.json());
    if (!parsed.success) {
        return NextResponse.json<ApiResponse>({ success: false, message: "Invalid input" }, { status: 400 });
    }
    const { recipeId, date, mealSlot } = parsed.data;

    await connectToDatabase();


    const recipeExists = await Recipe.exists({ _id: recipeId });
    if (!recipeExists) {
        return NextResponse.json<ApiResponse>({ success: false, message: "Recipe not found" }, { status: 404 });
    }

    try {
        const item = await PlannerItem.create({
            user: session.user._id, // never trust a client-supplied user id
            recipe: recipeId,
            date,
            mealSlot,
        });
        return NextResponse.json<ApiResponse>({ success: true, message: "Item created successfully", data: item }, { status: 201 });
    } catch (err: any) {
        if (err?.code === 11000) {
            return NextResponse.json<ApiResponse>(
                { success: false, message: `${mealSlot} is already planned for this date` },
                { status: 409 }
            );
        }
        console.error("PlannerItem POST error:", err);
        return NextResponse.json<ApiResponse>({ success: false, message: "Something went wrong" }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json<ApiResponse>({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const parsed = plannerQuerySchema.safeParse({
        startDate: searchParams.get("startDate"),
        endDate: searchParams.get("endDate"),
    });
    if (!parsed.success) {
        return NextResponse.json<ApiResponse>({ success: false, message: "Invalid input" }, { status: 400 });
    }
    const { startDate, endDate } = parsed.data;

    await connectToDatabase();

    const items = await PlannerItem.find({
        user: session.user._id,
        date: { $gte: toDayStart(startDate), $lte: toDayStart(endDate) },
    })
        .populate("recipe", "title coverImage prepTime cookTime") // adjust field names to your Recipe schema
        .sort({ date: 1 })
        .lean();

    return NextResponse.json<ApiResponse>({ success: true, message: "Items retrieved successfully", data: items }, { status: 200 });
}