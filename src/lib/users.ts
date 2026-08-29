import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  assertPersistentStorage,
  getSql,
  isUniqueViolation,
  StorageError,
  usesDatabase,
} from "@/lib/db";

export type StoredUser = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
};

const usersFile = path.join(process.cwd(), "data", "users.json");

type UserRow = {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  created_at: string | Date;
};

function mapUser(row: UserRow): StoredUser {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    passwordHash: row.password_hash,
    createdAt:
      typeof row.created_at === "string" ? row.created_at : row.created_at.toISOString(),
  };
}

async function readUsers(): Promise<StoredUser[]> {
  try {
    const raw = await readFile(usersFile, "utf8");
    const parsed = JSON.parse(raw) as StoredUser[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeUsers(users: StoredUser[]): Promise<void> {
  await mkdir(path.dirname(usersFile), { recursive: true });
  await writeFile(usersFile, `${JSON.stringify(users, null, 2)}\n`, "utf8");
}

export async function findUserByEmail(email: string): Promise<StoredUser | undefined> {
  const normalized = email.toLowerCase();

  if (usesDatabase()) {
    const sql = await getSql();
    const rows = (await sql`
      SELECT id, name, email, password_hash, created_at
      FROM users
      WHERE email = ${normalized}
      LIMIT 1
    `) as UserRow[];
    return rows[0] ? mapUser(rows[0]) : undefined;
  }

  const users = await readUsers();
  return users.find((user) => user.email === normalized);
}

export async function createUser(input: {
  name: string;
  email: string;
  passwordHash: string;
}): Promise<StoredUser> {
  const email = input.email.toLowerCase();
  const user: StoredUser = {
    id: crypto.randomUUID(),
    name: input.name,
    email,
    passwordHash: input.passwordHash,
    createdAt: new Date().toISOString(),
  };

  if (usesDatabase()) {
    const sql = await getSql();
    try {
      await sql`
        INSERT INTO users (id, name, email, password_hash, created_at)
        VALUES (${user.id}, ${user.name}, ${user.email}, ${user.passwordHash}, ${user.createdAt})
      `;
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new StorageError("EMAIL_TAKEN");
      }
      throw error;
    }
    return user;
  }

  assertPersistentStorage();

  const users = await readUsers();
  if (users.some((existing) => existing.email === email)) {
    throw new StorageError("EMAIL_TAKEN");
  }

  users.push(user);
  await writeUsers(users);
  return user;
}
