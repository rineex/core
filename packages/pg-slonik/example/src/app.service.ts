import type { DatabasePool } from 'slonik';

import { Injectable } from '@nestjs/common';
import { InjectPool } from '@rineex/pg-slonik';
import { sql } from 'slonik';

@Injectable()
export class AppService {
  constructor(@InjectPool() private readonly pool: DatabasePool) {}

  /**
   * Verifies slonik-interceptor-field-name-transformation: creates a table
   * with snake_case columns, inserts a row, selects and returns it.
   * Response should have camelCase keys (fullName, createdAt) when interceptor works.
   */
  async getFieldNameDemo(): Promise<{
    message: string;
    rows: Record<string, unknown>[];
  }> {
    await this.pool.query(sql.unsafe`
      CREATE TABLE IF NOT EXISTS _example_field_demo (
        id serial PRIMARY KEY,
        full_name text NOT NULL,
        created_at timestamptz DEFAULT current_timestamp
      )
    `);
    await this.pool.query(
      sql.unsafe`TRUNCATE _example_field_demo RESTART IDENTITY`,
    );
    await this.pool.query(sql.unsafe`
      INSERT INTO
        _example_field_demo (full_name)
      VALUES
        ('Alice')
    `);
    const rows = await this.pool.any(sql.unsafe`
      SELECT
        id,
        full_name,
        created_at
      FROM
        _example_field_demo
      LIMIT
        5
    `);
    return {
      message:
        'If interceptor works, keys are camelCase (fullName, createdAt).',
      rows: rows as Record<string, unknown>[],
    };
  }

  async getHealth(): Promise<{ ok: boolean; now?: string }> {
    const result = await this.pool.one(
      sql.unsafe`SELECT current_timestamp AS now`,
    );
    const row = result as { now?: number | string | Date };
    const raw = row?.now;
    const now =
      raw == null
        ? undefined
        : raw instanceof Date
          ? raw.toISOString()
          : typeof raw === 'string'
            ? raw
            : new Date(raw as number).toISOString();
    return { ok: true, now };
  }
}
