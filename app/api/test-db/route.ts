import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";

export async function GET() {
  try {
    await connectDB();

    return NextResponse.json({
      success: true,
      message: "MongoDB Connected Successfully",
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: "Database Connection Failed",
    });
  }
}