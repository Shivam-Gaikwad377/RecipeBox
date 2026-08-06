import { User } from "@/models/user.model";
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/dbConfig";
import ApiResponse from "@/types/ApiResponse";

export async function GET(request: Request) {
    try {
        await connectToDatabase();
        const users = await User.find({}, { passwordHash: 0 }).select({_id: 1, name: 0, email: 0, username:0, isEmailVerified: 0, createdAt: 0, updatedAt: 0, __v: 0, avatar: 0, bio: 0, ExpiresAt: 0, verificationToken: 0}); 
        return NextResponse.json<ApiResponse>(
            { success: true, message: "Users fetched successfully", data: users },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error fetching users:", error);
        return NextResponse.json<ApiResponse>(
            { success: false, message: "Internal Server Error" },
            { status: 500 }
        );
    }
}