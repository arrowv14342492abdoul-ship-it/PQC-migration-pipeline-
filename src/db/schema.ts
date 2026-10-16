import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp, jsonb } from 'drizzle-orm/pg-core';
import type { CbomItem } from '../types/pqc.ts';

// Users table linked to Firebase Authentication UID
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  name: text('name'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Saved Projects table for PQC migration and avionics architecture runs
export const savedProjects = pgTable('saved_projects', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  projectName: text('project_name').notNull(),
  code: text('code').notNull(),
  cbomData: jsonb('cbom_data').$type<CbomItem[]>(),
  roadmapData: jsonb('roadmap_data').$type<Record<string, unknown>>(),
  aikidoGrade: text('aikido_grade'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Cryptographic and security audit logs table
export const auditLogs = pgTable('audit_logs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  action: text('action').notNull(),
  details: text('details'),
  timestamp: timestamp('timestamp').defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  projects: many(savedProjects),
  logs: many(auditLogs),
}));

export const savedProjectsRelations = relations(savedProjects, ({ one }) => ({
  user: one(users, {
    fields: [savedProjects.userId],
    references: [users.id],
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
}));
