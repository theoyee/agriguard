import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

// Helper to create a transparent lazy-loading proxy
function createLazyProxy<T extends object>(initializer: () => T): T {
  let instance: T | null = null;
  const getInstance = () => {
    if (!instance) {
      instance = initializer();
    }
    return instance;
  };

  return new Proxy({} as T, {
    get(target, prop, receiver) {
      const inst = getInstance();
      const value = Reflect.get(inst, prop);
      if (typeof value === 'function') {
        return value.bind(inst);
      }
      return value;
    },
    set(target, prop, value, receiver) {
      const inst = getInstance();
      return Reflect.set(inst, prop, value);
    },
    has(target, prop) {
      const inst = getInstance();
      return Reflect.has(inst, prop);
    },
    ownKeys(target) {
      const inst = getInstance();
      return Reflect.ownKeys(inst);
    },
    getOwnPropertyDescriptor(target, prop) {
      const inst = getInstance();
      return Reflect.getOwnPropertyDescriptor(inst, prop);
    },
    getPrototypeOf(target) {
      const inst = getInstance();
      return Reflect.getPrototypeOf(inst);
    },
  });
}

// Function to initialize firebase-admin lazily
function initAdmin() {
  if (!getApps().length) {
    const credsBase64 = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
    if (!credsBase64) {
      throw new Error('GOOGLE_APPLICATION_CREDENTIALS_JSON environment variable is not configured');
    }
    try {
      const serviceAccount = JSON.parse(
        Buffer.from(credsBase64, 'base64').toString('utf8')
      );
      initializeApp({
        credential: cert(serviceAccount),
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      });
      console.log('✅ Firebase Admin SDK initialized successfully');
    } catch (error) {
      console.error('❌ Firebase Admin SDK initialization failed:', error);
      throw error;
    }
  }
}

// Export the services as lazy proxies
export const adminAuth = createLazyProxy(() => {
  initAdmin();
  return getAuth();
});

export const adminDb = createLazyProxy(() => {
  initAdmin();
  return getFirestore();
});

export const adminStorage = createLazyProxy(() => {
  initAdmin();
  return getStorage();
});