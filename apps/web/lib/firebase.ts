import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

const missingConfigProxy = <T extends object>(name: string): T =>
  new Proxy({} as T, {
    get(_target, prop) {
      throw new Error(
        `[Firebase] Cannot access '${String(prop)}' on '${name}': Firebase is not initialized. ` +
          "Copy .env.example to .env.local and fill in NEXT_PUBLIC_FIREBASE_API_KEY and NEXT_PUBLIC_FIREBASE_PROJECT_ID."
      );
    },
  });

let app: FirebaseApp | undefined;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

if (isFirebaseConfigured) {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]!;
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
} else {
  if (typeof window === "undefined") {
    console.warn(
      "[Firebase] Missing NEXT_PUBLIC_FIREBASE_API_KEY or NEXT_PUBLIC_FIREBASE_PROJECT_ID. " +
        "Firebase is not initialized. Copy .env.example to .env.local and fill in your credentials."
    );
  }
  app = undefined;
  auth = missingConfigProxy<Auth>("auth");
  db = missingConfigProxy<Firestore>("db");
  storage = missingConfigProxy<FirebaseStorage>("storage");
}

export { app, auth, db, storage };
