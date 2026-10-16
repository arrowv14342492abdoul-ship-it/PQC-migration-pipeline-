import {
  getOrCreateFirestoreUser,
  getFirestoreUserByUid,
  getFirestoreUserProjects,
  createFirestoreSavedProject,
  createFirestoreAuditLog,
} from './firestoreService.ts';
import { db } from './index.ts';
import { users, savedProjects, auditLogs } from './schema.ts';
import { eq, desc } from 'drizzle-orm';

/**
 * Synchronize or register user profile in persistent storage (Firestore + PostgreSQL fallback)
 */
export async function getOrCreateUser(uid: string, email: string, name?: string) {
  try {
    // Primary persistent store: Firebase Cloud Firestore
    const firestoreUser = await getOrCreateFirestoreUser(uid, email, name);

    // Best-effort dual-sync to PostgreSQL if connection is available
    if (db && process.env.SQL_HOST && process.env.SQL_USER) {
      try {
        await db
          .insert(users)
          .values({
            uid,
            email,
            name: name || null,
          })
          .onConflictDoUpdate({
            target: users.uid,
            set: {
              email,
              ...(name ? { name } : {}),
            },
          });
      } catch (_pgErr) {
        // Silently preserve Firestore source of truth
      }
    }

    return firestoreUser;
  } catch (error) {
    console.error('Failed to get or create user in Firestore:', error);
    throw new Error('Database user synchronization failed.', { cause: error });
  }
}

/**
 * Retrieve user by Firebase UID
 */
export async function getUserByUid(uid: string) {
  try {
    const firestoreUser = await getFirestoreUserByUid(uid);
    if (firestoreUser) {
      return firestoreUser;
    }

    if (db && process.env.SQL_HOST && process.env.SQL_USER) {
      try {
        const result = await db.select().from(users).where(eq(users.uid, uid)).limit(1);
        if (result[0]) {
          return {
            id: String(result[0].id),
            uid: result[0].uid,
            email: result[0].email,
            name: result[0].name,
            createdAt: result[0].createdAt ? result[0].createdAt.toISOString() : new Date().toISOString(),
          };
        }
      } catch (_pgErr) {
        // Quiet fallback
      }
    }
    return null;
  } catch (error) {
    console.error('Failed to get user by uid:', error);
    throw new Error('Failed to retrieve user from database.', { cause: error });
  }
}

/**
 * Fetch saved projects for a user
 */
export async function getUserProjects(userId: string | number) {
  try {
    const uid = String(userId);
    return await getFirestoreUserProjects(uid);
  } catch (error) {
    console.error('Failed to fetch user projects from Firestore:', error);
    throw new Error('Failed to retrieve saved projects.', { cause: error });
  }
}

/**
 * Save project record to persistent store
 */
export async function createSavedProject(data: {
  userId: string | number;
  projectName: string;
  code: string;
  cbomData?: string;
  roadmapData?: string;
  aikidoGrade?: string;
}) {
  try {
    return await createFirestoreSavedProject({
      userId: String(data.userId),
      projectName: data.projectName,
      code: data.code,
      cbomData: data.cbomData,
      roadmapData: data.roadmapData,
      aikidoGrade: data.aikidoGrade,
    });
  } catch (error) {
    console.error('Failed to create saved project in Firestore:', error);
    throw new Error('Failed to save project to database.', { cause: error });
  }
}

/**
 * Record an audit log entry
 */
export async function createAuditLog(
  userId: string | number | null,
  action: string,
  details?: string
) {
  try {
    return await createFirestoreAuditLog(
      userId ? String(userId) : null,
      action,
      details
    );
  } catch (error) {
    console.error('Failed to log audit event to Firestore:', error);
    return null;
  }
}
