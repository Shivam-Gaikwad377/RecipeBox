import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/dbConfig";
import { Cookbook } from "@/models/cookbook.model";
import ApiResponse from "@/types/ApiResponse";
import { User } from "@/models/user.model";
import { Recipe } from "@/models/recipe.model";
import { isValidObjectId } from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { cookbookSchema } from "@/schemas/cookbook.schema";
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
    
    const session = await getServerSession(authOptions);
    const userId = (await params).id;
    if(!isValidObjectId(userId)){
        return NextResponse.json<ApiResponse>(
            { success: false, message: "Invalid user ID" },
            { status: 400 }
        );
    }
    if (!session) {
        return NextResponse.json<ApiResponse>(
            { success: false, message: "Unauthorized" },
            { status: 401 }
        );
    }
    if(session.user._id !== userId){
        return NextResponse.json<ApiResponse>(
            { success: false, message: "Forbidden" },
            { status: 403 }
        );
    }

    try {
        await connectToDatabase();
        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json<ApiResponse>(
                { success: false, message: "User not found" },
                { status: 404 }
            );
        }


        const requestBody = await request.json();
        const parsedData = cookbookSchema.safeParse({...requestBody, author: userId});
        if (!parsedData.success) {
            return NextResponse.json<ApiResponse>(
                { success: false, message: "Invalid request data", data: parsedData.error.format() },
                { status: 400 }
            );
        }

        const newCookbook = new Cookbook({
            ...parsedData.data,
            author: userId
        });

        const savedCookbook = await newCookbook.save();
        return NextResponse.json<ApiResponse>(
            { success: true, message: "Cookbook created successfully", data: savedCookbook },
            { status: 201 }
        );
    }

    catch (error) {
        console.error("Error creating cookbook:", error);
        return NextResponse.json<ApiResponse>(
            { success: false, message: "Internal Server Error" },
            { status: 500 }
        );
    }

}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    const userId = (await params).id;
    if(!isValidObjectId(userId)){
        return NextResponse.json<ApiResponse>(
            { success: false, message: "Invalid user ID" },
            { status: 400 }
        );
    }

    try {
        await connectToDatabase();
        const userId = (await params).id;
        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json<ApiResponse>(
                { success: false, message: "User not found" },
                { status: 404 }
            );
        }

        const cookbooks = await Cookbook.find({ author: userId }).populate("recipes");
        return NextResponse.json<ApiResponse>(
            { success: true, message: "Cookbooks fetched successfully", data: cookbooks },
            { status: 200 }
        );
    }
    catch (error) {
        console.error("Error fetching cookbooks:", error);
        return NextResponse.json<ApiResponse>(
            { success: false, message: "Internal Server Error" },
            { status: 500 }
        );
    }
}
