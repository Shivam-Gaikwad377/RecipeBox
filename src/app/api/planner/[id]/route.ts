import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { connectToDatabase } from "@/lib/dbConfig";
import { PlannerItem } from "@/models/plannerItem.model";
import { Recipe } from "@/models/recipe.model";
import { updatePlannerItemSchema } from "@/schemas/planner.schema";
import { isValidObjectId } from "mongoose";
import ApiResponse from "@/types/ApiResponse";
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?._id) {
    return NextResponse.json<ApiResponse>({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  if (!isValidObjectId(params.id)) {
    return NextResponse.json<ApiResponse>({ success: false, message: "Invalid planner item id" }, { status: 400 });
  }

  const parsed = updatePlannerItemSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json<ApiResponse>({ success: false, message: "Invalid input" }, { status: 400 });
  }
  const { recipeId } = parsed.data;

  await connectToDatabase();

  const recipeExists = await Recipe.exists({ _id: recipeId });
  if (!recipeExists) {
    return NextResponse.json<ApiResponse>({ success: false, message: "Recipe not found" }, { status: 404 });
  }

  // Filter by _id AND user in one query — ownership enforced server-side,
  // not via a separate findById + manual check, which would leak whether
  // the id exists at all to a non-owner.
  const updated = await PlannerItem.findOneAndUpdate(
    { _id: params.id, user: session.user._id },
    { recipe: recipeId },
    { new: true }
  ).populate("recipe", "title coverImage");

  if (!updated) {
    return NextResponse.json<ApiResponse>({ success: false, message: "Planner item not found" }, { status: 404 });
  }

  return NextResponse.json<ApiResponse>({ success: true, message: "Item updated successfully", data: updated }, { status: 200 });
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?._id) {
    return NextResponse.json<ApiResponse>({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  if (!isValidObjectId(params.id)) {
    return NextResponse.json<ApiResponse>({ success: false, message: "Invalid planner item id" }, { status: 400 });
  }

  await connectToDatabase();

  const item = await PlannerItem.findOne({ _id: params.id, user: session.user._id })
    .populate("recipe", "title coverImage prepTime cookTime") // match to your actual Recipe fields
    .lean();

  if (!item) {
    return NextResponse.json<ApiResponse>({ success: false, message: "Planner item not found" }, { status: 404 });
  }

  return NextResponse.json<ApiResponse>({ success: true, message: "Item retrieved successfully", data: item }, { status: 200 });
}