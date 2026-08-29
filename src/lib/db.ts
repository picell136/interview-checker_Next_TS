import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

export class StorageError extends Error {
  constructor(
    public readonly code: "EMAIL_TAKEN" | "NO_DATABASE",
    message?: string,
  ) {
    super(message ?? code);
    this.name = "StorageError";
  }
}

type Sql = NeonQueryFunction<false, false>;

let sqlClient: Sql | null = null;
let schemaReady: Promise<void> | null = null;

export function getDatabaseUrl(): string | undefined {
  const url =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL_NON_POOLING;
  return url?.trim() || undefined;
}

export function usesDatabase(): boolean {
  return Boolean(getDatabaseUrl());
}

export function assertPersistentStorage(): void {
  if (process.env.VERCEL && !getDatabaseUrl()) {
    throw new StorageError("NO_DATABASE");
  }
}

export async function getSql(): Promise<Sql> {
  const url = getDatabaseUrl();
  if (!url) {
    throw new StorageError("NO_DATABASE");
  }

  if (!sqlClient) {
    sqlClient = neon(url);
  }

  schemaReady ??= ensureSchema(sqlClient);
  await schemaReady;
  return sqlClient;
}

async function ensureSchema(sql: Sql): Promise<void> {
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS results (
      user_id TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
      topic_id TEXT NOT NULL,
      topic_title TEXT NOT NULL,
      score INTEGER NOT NULL,
      total INTEGER NOT NULL,
      finished_at TIMESTAMPTZ NOT NULL,
      PRIMARY KEY (user_id, topic_id)
    )
  `;
}

export function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    String((error as { code: unknown }).code) === "23505"
  );
}
