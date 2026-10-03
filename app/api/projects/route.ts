import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Project from "@/models/Project";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);

    const projectId = searchParams.get("projectId");

    if (projectId) {
      const project = await Project.findById(projectId);

      return NextResponse.json({
        success: true,
        project,
      });
    }

    const userEmail = searchParams.get("userEmail");

    const filter = userEmail ? { userEmail } : {};

    const projects = await Project.find(filter).sort({
      createdAt: -1,
    });

    return NextResponse.json({
      success: true,
      projects,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown Error",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();

    console.log("Request Body:", body);

    const project = await Project.create({
      title: body.title,
      code: body.code,
      language: body.language,
      userEmail: body.userEmail,
    });

    return NextResponse.json({
      success: true,
      project,
    });
  } catch (error: unknown) {
    console.error("SAVE ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown Error",
      },
      { status: 500 }
    );
  }
}
export async function PUT(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();

    const updateData: Record<string, string> = {};
    if (body.title) updateData.title = body.title;
    if (body.code !== undefined) updateData.code = body.code;
    if (body.language) updateData.language = body.language;

    const project = await Project.findByIdAndUpdate(
      body.projectId,
      updateData,
      { new: true }
    );

    return NextResponse.json({
      success: true,
      project,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown Error",
      },
      { status: 500 }
    );
  }
}
export async function DELETE(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);

    const projectId = searchParams.get("projectId");

    await Project.findByIdAndDelete(projectId);

    return NextResponse.json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown Error",
      },
      { status: 500 }
    );
  }
}