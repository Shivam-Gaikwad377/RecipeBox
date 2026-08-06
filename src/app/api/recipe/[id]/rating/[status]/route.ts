import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/dbConfig";
import ApiResponse from "@/types/ApiResponse";
import { isValidObjectId } from "mongoose";
import { Rating } from "@/models/rating.model";

type RouteParams = {
  id: string;
  status: string;
};
export async function GET( request: NextRequest, { params }: { params: RouteParams } ) {

    try{
        const { id, status: userId } = await params;
        if(!isValidObjectId(id)){
            return NextResponse.json({ message: "Invalid recipe id" }, { status: 400 });
        }
        if(!isValidObjectId(userId)){
            return NextResponse.json({ message: "Invalid user id" }, { status: 400 });
        }

        await connectToDatabase();
        const rating  = await Rating.findOne({ recipe: id, user: userId });
        if(!rating){
            return NextResponse.json<ApiResponse>(
                { success: true, message: "Rating status fetched successfully", data: { hasRated: false } },
                { status: 200 }
            );
        }
        return NextResponse.json<ApiResponse>(
            { success: true, message: "Rating status fetched successfully", data: { hasRated: true, ratingValue: rating.value } },
            { status: 200 }
        );
        

    } catch (error) {
        console.error("Error fetching rating status:", error);
        return NextResponse.json<ApiResponse>(
            { success: false, message: "Internal Server Error" },
            { status: 500 }
        );



    }
}