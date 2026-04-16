import { NextRequest, NextResponse } from 'next/server';
import { GitService } from '@/lib/git-service';

export async function POST(req: NextRequest) {
  try {
    const { projectPath, hash } = await req.json();

    if (!projectPath || !hash) {
      return NextResponse.json({ error: 'projectPath and hash are required' }, { status: 400 });
    }

    const gitService = new GitService(projectPath);
    const details = await gitService.getCommitDetails(hash);
    
    return NextResponse.json(details);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}
