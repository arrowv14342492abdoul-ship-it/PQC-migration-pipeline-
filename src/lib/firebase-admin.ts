import fs from 'fs';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const firebaseConfig = JSON.parse(
  fs.readFileSync(new URL('../../firebase-applet-config.json', import.meta.url), 'utf-8')
);

if (!getApps().length) {
  initializeApp({
    projectId: firebaseConfig.projectId,
  });
}

export const adminAuth = getAuth();
export const adminDb = firebaseConfig.firestoreDatabaseId
  ? getFirestore(firebaseConfig.firestoreDatabaseId)
  : getFirestore();
