import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebaseAdmin';

export async function GET(req: NextRequest) {
  try {
    // 1. Verify Firebase ID token
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Missing or invalid Authorization header' },
        { status: 401 }
      );
    }
    const idToken = authHeader.split('Bearer ')[1];
    let uid: string;
    try {
      const decoded = await adminAuth.verifyIdToken(idToken);
      uid = decoded.uid;
    } catch (e) {
      console.error('Token verification failed:', e);
      return NextResponse.json(
        { success: false, error: 'Invalid Firebase token' },
        { status: 401 }
      );
    }

    // 2. Fetch all predictions for this user from Firestore
    const predictionsSnapshot = await adminDb
      .collection('predictions')
      .where('userId', '==', uid)
      .orderBy('createdAt', 'desc')
      .get();

    // If no predictions, return empty stats
    if (predictionsSnapshot.empty) {
      return NextResponse.json({
        success: true,
        stats: {
          totalScans: 0,
          healthyCount: 0,
          diseasedCount: 0,
          diseaseFreq: {},
          cropFreq: {},
          recentPredictions: [],
          monthlyTrend: [],
        },
      });
    }

    const predictions: any[] = predictionsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // 3. Fetch associated disease documents for all unique diseaseIds
    const diseaseIds = [...new Set(predictions.map((p) => p.diseaseId).filter(Boolean))];
    let diseaseMap: Record<string, any> = {};
    if (diseaseIds.length > 0) {
      // Firestore 'in' query supports up to 10 values; split into chunks if needed
      const chunkSize = 10;
      for (let i = 0; i < diseaseIds.length; i += chunkSize) {
        const chunk = diseaseIds.slice(i, i + chunkSize);
        const diseaseSnapshot = await adminDb
          .collection('diseases')
          .where('__name__', 'in', chunk)
          .get();
        diseaseSnapshot.forEach((doc) => {
          diseaseMap[doc.id] = { id: doc.id, ...doc.data() };
        });
      }
    }

    // 4. Enrich predictions with disease data (if not already denormalized)
    const enrichedPredictions = predictions.map((p) => {
      const disease = diseaseMap[p.diseaseId] || null;
      return {
        ...p,
        disease: disease,
      };
    });

    // 5. Compute statistics (same logic as before)
    const totalScans = enrichedPredictions.length;
    const healthyCount = enrichedPredictions.filter(
      (p) =>
        p.disease?.name?.toLowerCase().includes('healthy') ||
        p.disease?.severity === 'None'
    ).length;
    const diseasedCount = totalScans - healthyCount;

    const cropFreq: Record<string, number> = {};
    const diseaseFreq: Record<string, number> = {};

    enrichedPredictions.forEach((p) => {
      if (p.disease) {
        diseaseFreq[p.disease.name] = (diseaseFreq[p.disease.name] || 0) + 1;
        cropFreq[p.disease.plantType] = (cropFreq[p.disease.plantType] || 0) + 1;
      }
    });

    const recentPredictions = enrichedPredictions.slice(0, 5);

    // Monthly trend (last 6 months)
    const monthlyTrend: {
      month: string;
      total: number;
      healthy: number;
      diseased: number;
    }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthLabel = d.toLocaleString('default', { month: 'short' });
      const yearLabel = d.getFullYear().toString().substring(2);
      monthlyTrend.push({
        month: `${monthLabel} '${yearLabel}`,
        total: 0,
        healthy: 0,
        diseased: 0,
      });
    }

    enrichedPredictions.forEach((p) => {
      const pDate = new Date(p.createdAt);
      const pMonth = pDate.toLocaleString('default', { month: 'short' });
      const pYear = pDate.getFullYear().toString().substring(2);
      const label = `${pMonth} '${pYear}`;
      const found = monthlyTrend.find((m) => m.month === label);
      if (found) {
        found.total++;
        const isHealthy =
          p.disease?.name?.toLowerCase().includes('healthy') ||
          p.disease?.severity === 'None';
        if (isHealthy) {
          found.healthy++;
        } else {
          found.diseased++;
        }
      }
    });

    // 6. Return dashboard stats
    return NextResponse.json({
      success: true,
      stats: {
        totalScans,
        healthyCount,
        diseasedCount,
        diseaseFreq,
        cropFreq,
        recentPredictions,
        monthlyTrend,
      },
    });
  } catch (e: any) {
    console.error('Dashboard error:', e);
    return NextResponse.json(
      { success: false, error: e.message || 'Failed to retrieve dashboard stats' },
      { status: 500 }
    );
  }
}