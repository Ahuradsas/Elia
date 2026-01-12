import { EliaBusinessId, EliaPool } from '@/elia-injection'
import { NailService } from '@/entity/NailService'
import { inject, singleton, withPgClient } from '@wabot-dev/framework'
import { Pool } from 'pg'

@singleton()
export class NailServiceRepository {
  private table = '"public"."services"'
  private columns = '"id", "business_id", "name",  "price", "duration"'

  constructor(
    @inject(EliaPool) private pool: Pool,
    @inject(EliaBusinessId) private businessId: string,
  ) {}

  async find(id: string): Promise<NailService | null> {
    const sql = `
      SELECT ${this.columns}
      FROM ${this.table}
      WHERE "business_id" = $1
        AND "id" = $2
      LIMIT 1
    `
    const items = await this.query(sql, [this.businessId, id])
    return items.at(0) ?? null
  }

  async findActive(): Promise<NailService[]> {
    const sql = `
      SELECT ${this.columns}
      FROM ${this.table}
      WHERE "business_id" = $1
    `
    return await this.query(sql, [this.businessId])
  }

  private query(sql: string, vars: any[]): Promise<NailService[]> {
    return withPgClient(this.pool, async (client) => {
      const result = await client.query(sql, vars)
      return result.rows.map(
        (x) =>
          new NailService({
            name: x.name,
            durationMinutes: x.duration,
            price: x.price,
            isActive: true,
          }),
      )
    })
  }
}
