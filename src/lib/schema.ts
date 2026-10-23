import {
  index,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

/**
 * Registered accounts. Emails are stored lower-cased so lookups are
 * case-insensitive, and the password is kept only as an scrypt hash.
 */
export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    displayName: text("display_name"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [uniqueIndex("users_email_key").on(table.email)],
);

/** Server-side sessions. Only the SHA-256 hash of the cookie token is stored. */
export const sessions = pgTable(
  "sessions",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("sessions_token_hash_key").on(table.tokenHash),
    index("sessions_user_id_idx").on(table.userId),
  ],
);

/**
 * Audit trail of sign-in activity. Passwords are never written here — only
 * the outcome of an attempt and basic request metadata.
 */
export const loginEvents = pgTable(
  "login_events",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").references(() => users.id, {
      onDelete: "cascade",
    }),
    email: text("email").notNull(),
    outcome: text("outcome").notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("login_events_user_id_idx").on(table.userId)],
);

export type User = typeof users.$inferSelect;
export type LoginEvent = typeof loginEvents.$inferSelect;
