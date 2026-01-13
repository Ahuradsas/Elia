import { EliaBusinessId, EliaPool } from '@/elia-injection'
import { Service } from '@/entity/Service'
import { inject, singleton, withPgClient } from '@wabot-dev/framework'
import { Pool } from 'pg'

@singleton()
export class ServiceRepository {
  private table = '"public"."services"'
  private columns = '"id", "business_id", "name",  "price", "duration"'

  constructor(
    @inject(EliaPool) private pool: Pool,
    @inject(EliaBusinessId) private businessId: string,
  ) {}

  async find(id: string): Promise<Service | null> {
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

  async findOrThrow(id: string): Promise<Service> {
    const client = await this.find(id)
    if (!client) throw new Error(`Not found NailService with id='${id}'`)
    return client
  }

  async findActive(): Promise<Service[]> {
    const sql = `
      SELECT ${this.columns}
      FROM ${this.table}
      WHERE "business_id" = $1
    `
    return await this.query(sql, [this.businessId])
  }

  private query(sql: string, vars: any[]): Promise<Service[]> {
    return withPgClient(this.pool, async (client) => {
      const result = await client.query(sql, vars)
      return result.rows.map(
        (x) =>
          new Service({
            name: x.name,
            durationMinutes: x.duration,
            price: x.price,
            isActive: true,
          }),
      )
    })
  }
}
