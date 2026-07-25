import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const user = getAuthenticatedUser(req);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const { name, scientificName, description, symptoms, causes, severity, plantType, chemical, organic, fertilizer, water, prevention } = await req.json();

    if (!name || !scientificName || !plantType) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const newDisease = Database.createDisease({
      name,
      scientificName,
      description: description || "",
      symptoms: symptoms || "",
      causes: causes || "",
      severity: severity || "Low",
      plantType
    }, {
      chemical: chemical || "",
      organic: organic || "",
      fertilizer: fertilizer || "",
      water: water || "",
      prevention: prevention || ""
    });

    return NextResponse.json({ success: true, disease: newDisease });

  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message || "Failed to create disease" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = getAuthenticatedUser(req);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const { id, name, scientificName, description, symptoms, causes, severity, plantType, chemical, organic, fertilizer, water, prevention } = await req.json();

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing disease ID" }, { status: 400 });
    }

    Database.updateDisease(id, {
      name,
      scientificName,
      description,
      symptoms,
      causes,
      severity,
      plantType
    }, {
      chemical,
      organic,
      fertilizer,
      water,
      prevention
    });

    return NextResponse.json({ success: true, message: "Disease and treatments updated successfully" });

  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message || "Failed to update disease" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = getAuthenticatedUser(req);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing disease ID" }, { status: 400 });
    }

    Database.deleteDisease(id);
    return NextResponse.json({ success: true, message: "Disease and associated treatments deleted" });

  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message || "Failed to delete disease" }, { status: 500 });
  }
}
export async function GET(req: NextRequest) {
  try {
    const diseases = Database.getDiseases();
    return NextResponse.json({ success: true, diseases });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: "Failed to retrieve diseases" }, { status: 500 });
  }
}
