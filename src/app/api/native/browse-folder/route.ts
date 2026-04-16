import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function GET() {
  try {
    // This executes AppleScript on the host machine to prompt for a folder
    // Returns the POSIX path of the selected folder
    const script = `osascript -e 'set folderPath to POSIX path of (choose folder with prompt "Select Project Folder")' -e 'return folderPath'`;
    
    const { stdout } = await execAsync(script);
    const path = stdout.trim();
    
    if (path) {
      return NextResponse.json({ path });
    } else {
      return NextResponse.json({ error: 'No path selected' }, { status: 400 });
    }
  } catch (error: any) {
    // If the user clicks "Cancel", osascript exits with an error code
    if (error.stderr && error.stderr.includes('User canceled')) {
       return NextResponse.json({ error: 'User canceled' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}
