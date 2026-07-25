import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = getAuthenticatedUser(req);
    
    // Authorization check
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 403 });
    }

    const stats = Database.getSystemStats();

    return NextResponse.json({
      success: true,
      stats
    });

  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message || "Failed to retrieve admin stats" }, { status: 500 });
  }
}
