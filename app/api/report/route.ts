import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing prediction ID" }, { status: 400 });
    }

    const prediction = Database.getPredictionById(id);
    if (!prediction) {
      return NextResponse.json({ success: false, error: "Prediction report not found" }, { status: 404 });
    }

    // Increment download/view count
    const report = Database.createReport(id);

    return NextResponse.json({
      success: true,
      report,
      prediction
    });

  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message || "Failed to retrieve report" }, { status: 500 });
  }
}
