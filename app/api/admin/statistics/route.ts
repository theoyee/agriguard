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
    // Check if the email is the admin email
    if (decoded.email !== 'admin@system.com') {
      return null;
    }
    return { uid: decoded.uid, email: decoded.email };
  } catch {
    return null;
  }
}

// ============================================================
//  GET – Admin only: system statistics
// ============================================================
export async function GET(req: NextRequest) {
  try {
    const admin = await verifyAdmin(req);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized – admin access required' },
        { status: 403 }
      );
    }

    // 1. Fetch all needed collections
    const [usersSnapshot, diseasesSnapshot, predictionsSnapshot] = await Promise.all([
      adminDb.collection('users').get(),
      adminDb.collection('diseases').get(),
      adminDb.collection('predictions').get(),
    ]);

    const totalUsers = usersSnapshot.size;
    const totalDiseases = diseasesSnapshot.size;
    const totalScans = predictionsSnapshot.size;

    // 2. Build disease map for severity and name
    const diseaseMap: Record<string, { name: string; severity: string }> = {};
    diseasesSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      diseaseMap[doc.id] = {
        name: data.name || 'Unknown',
        severity: data.severity || 'Moderate',
      };
    });

    // 3. Compute healthy/diseased counts and disease frequency
    let healthyCount = 0;
    const diseaseFreq: Record<string, number> = {};

    predictionsSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      const diseaseId = data.diseaseId;
      const disease = diseaseMap[diseaseId];
      const isHealthy =
        disease?.name?.toLowerCase().includes('healthy') ||
        disease?.severity === 'None';
      if (isHealthy) {
        healthyCount++;
      } else {
        // Count only if not healthy? We'll count all disease names, but we can also count only diseased.
        // For frequency, we count all occurrences, but we can still include healthy as a category.
      }
      // For frequency, we count all diseases, including healthy.
      if (disease) {
        diseaseFreq[disease.name] = (diseaseFreq[disease.name] || 0) + 1;
      } else {
        diseaseFreq['Unknown'] = (diseaseFreq['Unknown'] || 0) + 1;
      }
    });

    // 4. Build stats object
    const stats = {
      totalUsers,
      totalDiseases,
      totalScans,
      healthyCount,
      diseasedCount: totalScans - healthyCount,
      diseaseFreq,
    };

    return NextResponse.json({ success: true, stats });
  } catch (e: any) {
    console.error('GET /api/admin/statistics error:', e);
    return NextResponse.json(
      { success: false, error: e.message || 'Failed to retrieve admin stats' },
      { status: 500 }
    );
  }
}