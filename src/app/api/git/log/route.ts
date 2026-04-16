import { NextRequest, NextResponse } from "next/server";
import { GitService } from "@/lib/git-service";

export async function POST(req: NextRequest) {
  try {
    const { projectPath, branch, maxCount, skip, search, showAll } = await req.json();

    if (!projectPath || !branch) {
      return NextResponse.json(
        { error: "projectPath and branch are required" },
        { status: 400 },
      );
    }

    const gitService = new GitService(projectPath);
    const logs = await gitService.getLog(branch, { maxCount, skip, search, showAll });

    return NextResponse.json({ logs });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal error" },
      { status: 500 },
    );
  }
}
