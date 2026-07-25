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

    if (predictionsSnapshot.empty) {
      return NextResponse.json({
        success: true,
        predictions: [],
      });
    }

    // 3. Map documents to objects with an explicit 'any' cast to avoid TypeScript errors
    //    because doc.data() might have many fields; we only need a few.
    const predictions: any[] = predictionsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // 4. Fetch associated disease documents for diseaseIds
    const diseaseIds = [
      ...new Set(predictions.map((p) => p.diseaseId).filter(Boolean)),
    ];
    let diseaseMap: Record<string, any> = {};
    if (diseaseIds.length > 0) {
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

    // 5. Enrich predictions with disease data
    const enrichedPredictions = predictions.map((p) => ({
      ...p,
      disease: diseaseMap[p.diseaseId] || null,
      treatment: diseaseMap[p.diseaseId]?.treatment || null,
    }));

    return NextResponse.json({
      success: true,
      predictions: enrichedPredictions,
    });
  } catch (e: any) {
    console.error('History error:', e);
    return NextResponse.json(
      { success: false, error: e.message || 'Failed to retrieve history' },
      { status: 500 }
    );
  }
}