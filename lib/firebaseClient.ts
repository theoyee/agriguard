import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

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

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp | null = null;

function getClientApp(): FirebaseApp {
  if (!app) {
    if (!getApps().length) {
      if (!firebaseConfig.apiKey) {
        throw new Error('Firebase Client SDK initialization failed: NEXT_PUBLIC_FIREBASE_API_KEY is not defined');
      }
      app = initializeApp(firebaseConfig);
    } else {
      app = getApp();
    }
  }
  return app;
}

// Export services as lazy proxies
export const auth = createLazyProxy<Auth>(() => {
  const clientApp = getClientApp();
  return getAuth(clientApp);
});

export const db = createLazyProxy<Firestore>(() => {
  const clientApp = getClientApp();
  return getFirestore(clientApp);
});

export const storage = createLazyProxy<FirebaseStorage>(() => {
  const clientApp = getClientApp();
  return getStorage(clientApp);
});

export const googleProvider = new GoogleAuthProvider();