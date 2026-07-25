import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebaseAdmin';

// ============================================================
//  Helper: Verify Firebase token and admin role
// ============================================================
async function verifyAdmin(req: NextRequest): Promise<{ uid: string; email: string } | null> {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  const idToken = authHeader.split('Bearer ')[1];
  try {
    const decoded = await adminAuth.verifyIdToken(idToken);
    // Optionally check if user is admin – we'll check email for simplicity
    // In production, you should use custom claims or Firestore user document
    if (decoded.email !== 'admin@system.com') {
      return null; // not admin
    }
    return { uid: decoded.uid, email: decoded.email };
  } catch {
    return null;
  }
}

// ============================================================
//  GET – Public: list all diseases
// ============================================================
export async function GET(req: NextRequest) {
  try {
    const snapshot = await adminDb.collection('diseases').get();
    const diseases = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return NextResponse.json({ success: true, diseases });
  } catch (e: any) {
    console.error('GET /api/admin/diseases error:', e);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve diseases' },
      { status: 500 }
    );
  }
}

// ============================================================
//  POST – Admin only: create a new disease
// ============================================================
export async function POST(req: NextRequest) {
  try {
    const admin = await verifyAdmin(req);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized – admin access required' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      name,
      scientificName,
      description,
      symptoms,
      causes,
      severity,
      plantType,
      chemical,
      organic,
      fertilizer,
      water,
      prevention,
    } = body;

    if (!name || !scientificName || !plantType) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: name, scientificName, plantType' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const newDiseaseRef = adminDb.collection('diseases').doc();

    await newDiseaseRef.set({
      name,
      scientificName,
      description: description || '',
      symptoms: symptoms || '',
      causes: causes || '',
      severity: severity || 'Low',
      plantType,
      treatment: {
        chemical: chemical || '',
        organic: organic || '',
        fertilizer: fertilizer || '',
        water: water || '',
        prevention: prevention || '',
      },
      createdAt: now,
      updatedAt: now,
    });

    const newDisease = {
      id: newDiseaseRef.id,
      name,
      scientificName,
      description: description || '',
      symptoms: symptoms || '',
      causes: causes || '',
      severity: severity || 'Low',
      plantType,
      treatment: {
        chemical: chemical || '',
        organic: organic || '',
        fertilizer: fertilizer || '',
        water: water || '',
        prevention: prevention || '',
      },
      createdAt: now,
      updatedAt: now,
    };

    return NextResponse.json({ success: true, disease: newDisease });
  } catch (e: any) {
    console.error('POST /api/admin/diseases error:', e);
    return NextResponse.json(
      { success: false, error: e.message || 'Failed to create disease' },
      { status: 500 }
    );
  }
}

// ============================================================
//  PUT – Admin only: update an existing disease
// ============================================================
export async function PUT(req: NextRequest) {
  try {
    const admin = await verifyAdmin(req);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized – admin access required' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      id,
      name,
      scientificName,
      description,
      symptoms,
      causes,
      severity,
      plantType,
      chemical,
      organic,
      fertilizer,
      water,
      prevention,
    } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Missing disease ID' },
        { status: 400 }
      );
    }

    const docRef = adminDb.collection('diseases').doc(id);
    const doc = await docRef.get();
    if (!doc.exists) {
      return NextResponse.json(
        { success: false, error: 'Disease not found' },
        { status: 404 }
      );
    }

    // Build update payload
    const updateData: any = {
      updatedAt: new Date().toISOString(),
    };

    if (name !== undefined) updateData.name = name;
    if (scientificName !== undefined) updateData.scientificName = scientificName;
    if (description !== undefined) updateData.description = description;
    if (symptoms !== undefined) updateData.symptoms = symptoms;
    if (causes !== undefined) updateData.causes = causes;
    if (severity !== undefined) updateData.severity = severity;
    if (plantType !== undefined) updateData.plantType = plantType;

    // Update treatment fields if provided
    const treatmentUpdate: any = {};
    if (chemical !== undefined) treatmentUpdate.chemical = chemical;
    if (organic !== undefined) treatmentUpdate.organic = organic;
    if (fertilizer !== undefined) treatmentUpdate.fertilizer = fertilizer;
    if (water !== undefined) treatmentUpdate.water = water;
    if (prevention !== undefined) treatmentUpdate.prevention = prevention;

    if (Object.keys(treatmentUpdate).length > 0) {
      // Merge with existing treatment or create new
      const existingData = doc.data();
      const existingTreatment = existingData?.treatment || {};
      updateData.treatment = { ...existingTreatment, ...treatmentUpdate };
    }

    await docRef.update(updateData);

    return NextResponse.json({
      success: true,
      message: 'Disease and treatments updated successfully',
    });
  } catch (e: any) {
    console.error('PUT /api/admin/diseases error:', e);
    return NextResponse.json(
      { success: false, error: e.message || 'Failed to update disease' },
      { status: 500 }
    );
  }
}

// ============================================================
//  DELETE – Admin only: delete a disease
// ============================================================
export async function DELETE(req: NextRequest) {
  try {
    const admin = await verifyAdmin(req);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized – admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Missing disease ID' },
        { status: 400 }
      );
    }

    const docRef = adminDb.collection('diseases').doc(id);
    const doc = await docRef.get();
    if (!doc.exists) {
      return NextResponse.json(
        { success: false, error: 'Disease not found' },
        { status: 404 }
      );
    }

    // Optionally, you might also delete associated predictions or just leave them.
    // For simplicity, we only delete the disease document.
    await docRef.delete();

    return NextResponse.json({
      success: true,
      message: 'Disease and associated treatments deleted',
    });
  } catch (e: any) {
    console.error('DELETE /api/admin/diseases error:', e);
    return NextResponse.json(
      { success: false, error: e.message || 'Failed to delete disease' },
      { status: 500 }
    );
  }
}