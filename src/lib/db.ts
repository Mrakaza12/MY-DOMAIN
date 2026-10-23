import { sql } from "drizzle-orm";
import type { NodePgQueryResultHKT } from "drizzle-orm/node-postgres";
import type { PgDatabase } from "drizzle-orm/pg-core";

import * as schema from "./schema";

/**
 * Both drivers (node-postgres in production, PGlite locally) implement the
 * same query API, so the app is typed against the shared PgDatabase class.
 */
export type Database = PgDatabase<NodePgQueryResultHKT, typeof schema>;

const globalForDb = globalThis as typeof globalThis & {
  __keylineDb?: Promise<Database>;
  __keylineSchemaReady?: Promise<void>;
};

async function createDatabase(): Promise<Database> {
  const url = process.env.DATABASE_URL?.trim();

  if (url) {
    // Production / any real Postgres (Neon, Supabase, RDS, local…).
    const [{ drizzle }, { Pool }] = await Promise.all([
      import("drizzle-orm/node-postgres"),
      import("pg"),
    ]);

    const pool = new Pool({
      connectionString: url,
      max: 5,
      allowExitOnIdle: true,
    });

    return drizzle(pool, { schema });
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "DATABASE_URL is required in production. Add it to your environment (see DEPLOY.md).",
    );
  }

  // Local development without a database server: PGlite runs Postgres in
  // WebAssembly and keeps data in ./.data/pglite.
  const [{ PGlite }, { drizzle }, { mkdirSync }] = await Promise.all([
    import("@electric-sql/pglite"),
    import("drizzle-orm/pglite"),
    import("node:fs"),
  ]);

  const dataDir = ".data/pglite";
  mkdirSync(dataDir, { recursive: true });

  const client = new PGlite(dataDir);
  return drizzle(client, { schema }) as unknown as Database;
}

/** Lazily creates (and caches) the database connection for this process. */
export function getDb(): Promise<Database> {
  const cached = globalForDb.__keylineDb;
  if (cached) return cached;

  // Don't cache a failed connection attempt — let the next request retry.
  const connecting = createDatabase().catch((error) => {
    globalForDb.__keylineDb = undefined;
    throw error;
  });

  globalForDb.__keylineDb = connecting;
  return connecting;
}

/**
 * Creates the tables if they do not exist yet. This keeps a fresh database
 * (for example a brand-new Neon project) working on first request, without a
 * manual migration step.
 */
export function ensureSchema(): Promise<void> {
  if (!globalForDb.__keylineSchemaReady) {
    globalForDb.__keylineSchemaReady = (async () => {
      const db = await getDb();

      await db.execute(sql`
        create table if not exists users (
          id serial primary key,
          email text not null,
          password_hash text not null,
          display_name text,
          created_at timestamptz not null default now()
        )
      `);
      await db.execute(sql`
        create unique index if not exists users_email_key on users (email)
      `);
      await db.execute(sql`
        create table if not exists sessions (
          id serial primary key,
          user_id integer not null references users(id) on delete cascade,
          token_hash text not null,
          expires_at timestamptz not null,
          created_at timestamptz not null default now()
        )
      `);
      await db.execute(sql`
        create unique index if not exists sessions_token_hash_key on sessions (token_hash)
      `);
      await db.execute(sql`
        create index if not exists sessions_user_id_idx on sessions (user_id)
      `);
      await db.execute(sql`
        create table if not exists login_events (
          id serial primary key,
          user_id integer references users(id) on delete cascade,
          email text not null,
          outcome text not null,
          ip_address text,
          user_agent text,
          created_at timestamptz not null default now()
        )
      `);
      await db.execute(sql`
        create index if not exists login_events_user_id_idx on login_events (user_id)
      `);
    })().catch((error) => {
      // Let the next request retry instead of caching a permanent failure.
      globalForDb.__keylineSchemaReady = undefined;
      throw error;
    });
  }

  return globalForDb.__keylineSchemaReady;
}

/** Connection helper that always makes sure the tables exist first. */
export async function db(): Promise<Database> {
  await ensureSchema();
  return getDb();
}
