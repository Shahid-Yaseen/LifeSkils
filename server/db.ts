import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

// For development, use a default local PostgreSQL URL if not set
const databaseUrl = process.env.DATABASE_URL || "postgresql://localhost:5432/lifeskills";

// Create pool with error handling
export const pool = new Pool({ 
  connectionString: databaseUrl,
  // Add connection options for better error handling
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export const db = drizzle({ client: pool, schema });