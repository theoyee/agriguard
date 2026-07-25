import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

// Only initialize if not already running
if (!getApps().length) {
  try {
    const serviceAccount = JSON.parse(
      Buffer.from(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON!, 'base64').toString()
    );
    initializeApp({
      credential: cert(serviceAccount),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });
    console.log('✅ Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.error('❌ Firebase Admin SDK initialization failed:', error);
    throw error; // will be caught in API routes
  }
}

// Export the services
export const adminAuth = getAuth();
export const adminDb = getFirestore();
export const adminStorage = getStorage();