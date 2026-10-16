import fs from 'fs';
import { adminDb } from '../lib/firebase-admin.ts';

const firebaseConfig = JSON.parse(
  fs.readFileSync(new URL('../../firebase-applet-config.json', import.meta.url), 'utf-8')
);

export interface FirestoreUser {
  id: string;
  uid: string;
  email: string;
  name?: string | null;
  createdAt: string;
}

export interface FirestoreSavedProject {
  id: string;
  userId: string;
  projectName: string;
  code: string;
  cbomData?: string | null;
  roadmapData?: string | null;
  aikidoGrade?: string | null;
  createdAt: string;
}

export interface FirestoreAuditLog {
  id: string;
  userId?: string | null;
  action: string;
  details?: string | null;
  timestamp: string;
}

/**
 * Get or register user in Firestore
 */
export async function getOrCreateFirestoreUser(
  uid: string,
  email: string,
  name?: string
): Promise<FirestoreUser> {
  const userRef = adminDb.collection('users').doc(uid);
  const snap = await userRef.get();

  if (snap.exists) {
    const data = snap.data() || {};
    const updatedUser: FirestoreUser = {
      id: uid,
      uid,
      email: email || data.email || 'user@example.com',
      name: name !== undefined ? name : (data.name || null),
      createdAt: data.createdAt || new Date().toISOString(),
    };
    if (email !== data.email || (name && name !== data.name)) {
      await userRef.set(
        {
          email,
          ...(name ? { name } : {}),
        },
        { merge: true }
      );
    }
    return updatedUser;
  }

  const newUser: FirestoreUser = {
    id: uid,
    uid,
    email: email || 'user@example.com',
    name: name || null,
    createdAt: new Date().toISOString(),
  };

  await userRef.set(newUser);
  return newUser;
}

/**
 * Retrieve user by Firebase UID
 */
export async function getFirestoreUserByUid(uid: string): Promise<FirestoreUser | null> {
  const userRef = adminDb.collection('users').doc(uid);
  const snap = await userRef.get();
  if (!snap.exists) {
    return null;
  }
  const data = snap.data() || {};
  return {
    id: uid,
    uid,
    email: data.email || 'user@example.com',
    name: data.name || null,
    createdAt: data.createdAt || new Date().toISOString(),
  };
}

/**
 * Retrieve saved projects for a user
 */
export async function getFirestoreUserProjects(uid: string): Promise<FirestoreSavedProject[]> {
  const projectsRef = adminDb
    .collection('users')
    .doc(uid)
    .collection('projects')
    .orderBy('createdAt', 'desc');

  try {
    const snap = await projectsRef.get();
    return snap.docs.map((doc) => {
      const d = doc.data();
      return {
        id: doc.id,
        userId: uid,
        projectName: d.projectName || 'Untitled Project',
        code: d.code || '',
        cbomData: d.cbomData || null,
        roadmapData: d.roadmapData || null,
        aikidoGrade: d.aikidoGrade || null,
        createdAt: d.createdAt || new Date().toISOString(),
      };
    });
  } catch (err) {
    console.error('Failed to query user projects from Firestore:', err);
    return [];
  }
}

/**
 * Save a new project to Firestore
 */
export async function createFirestoreSavedProject(data: {
  userId: string;
  projectName: string;
  code: string;
  cbomData?: string | null;
  roadmapData?: string | null;
  aikidoGrade?: string | null;
}): Promise<FirestoreSavedProject> {
  const projectRef = adminDb
    .collection('users')
    .doc(data.userId)
    .collection('projects')
    .doc();

  const project: FirestoreSavedProject = {
    id: projectRef.id,
    userId: data.userId,
    projectName: data.projectName,
    code: data.code,
    cbomData: data.cbomData || null,
    roadmapData: data.roadmapData || null,
    aikidoGrade: data.aikidoGrade || null,
    createdAt: new Date().toISOString(),
  };

  await projectRef.set(project);
  return project;
}

/**
 * Create an audit log entry in Firestore
 */
export async function createFirestoreAuditLog(
  userId: string | null,
  action: string,
  details?: string | null
): Promise<FirestoreAuditLog> {
  const logRef = adminDb.collection('auditLogs').doc();
  const entry: FirestoreAuditLog = {
    id: logRef.id,
    userId: userId || null,
    action,
    details: details || null,
    timestamp: new Date().toISOString(),
  };

  await logRef.set(entry);
  return entry;
}

/**
 * Database status descriptor
 */
export function getFirestoreDatabaseStatus() {
  return {
    database: 'Firebase Cloud Firestore (Enterprise Edition)',
    status: 'ONLINE',
    projectId: firebaseConfig.projectId,
    databaseId: firebaseConfig.firestoreDatabaseId || '(default)',
    collections: ['users', 'users/{userId}/projects', 'auditLogs'],
    storageBucket: firebaseConfig.storageBucket,
    authDomain: firebaseConfig.authDomain,
  };
}
