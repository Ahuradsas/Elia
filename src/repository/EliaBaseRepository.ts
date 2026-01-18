import { Entity, IConstructor, withPgClient } from '@wabot-dev/framework'
import { Pool } from 'pg'
import { v4 } from 'uuid'

export class EliaCrudRepository<T extends Entity<object>> {
  constructor(
    protected pool: Pool,
    protected businessId: string,
    protected schema: string,
    protected table: string,
    protected columns: string[],
    protected ctor: IConstructor<T>,
    protected mapRowToEntity: (row: any) => T,
    protected mapEntityToRow: (row: any) => T,
  ) {}

  async find(id: string): Promise<T | null> {
    const sql = `
        SELECT ${this.columns.join(', ')}
        FROM ${this.schema}.${this.table}
        WHERE "business_id" = $1
          AND "id" = $2
        LIMIT 1
      `
    const items = await this.query(sql, [this.businessId, id])
    return items.at(0) ?? null
  }

  async findOrThrow(id: string): Promise<T> {
    const client = await this.find(id)
    if (!client) throw new Error(`Not found Client with id='${id}'`)
    return client
  }

  protected query(sql: string, vars: any[]): Promise<T[]> {
    return withPgClient(this.pool, async (client) => {
      const result = await client.query(sql, vars)
      return result.rows.map(this.mapRowToEntity)
    })
  }

  protected exec(sql: string, vars: any[]): Promise<void> {
    return withPgClient(this.pool, async (client) => {
      await client.query(sql, vars)
    })
  }
}
