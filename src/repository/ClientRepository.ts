import { EliaBusinessId, EliaPool } from '@/elia-injection'
import { Client } from '@/entity/Client'
import { inject, singleton, withPgClient } from '@wabot-dev/framework'
import { Pool } from 'pg'
import { v4 } from 'uuid'

@singleton()
export class ClientRepository {
  private table = '"public"."clients"'
  private columns = '"id", "business_id", "full_name",  "phone", "email"'

  constructor(
    @inject(EliaPool) private pool: Pool,
    @inject(EliaBusinessId) private businessId: string,
  ) {}

  async find(id: string): Promise<Client | null> {
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

  async findOrThrow(id: string): Promise<Client> {
    const client = await this.find(id)
    if (!client) throw new Error(`Not found Client with id='${id}'`)
    return client
  }

  async create(client: Client): Promise<void> {
    const sql = `
      INSERT INTO ${this.table}(${this.columns})
      VALUES ($1, $2, $3, $4, $5)
    `
    const data = client['data']
    data.id = v4()
    data.createdAt = Date.now()
    client.validate()

    await this.exec(sql, [
      data.id,
      this.businessId,
      data.name,
      data.phone ?? '',
      data.email ?? null,
    ])
  }

  async update(client: Client): Promise<void> {
    const sql = `
      UPDATE ${this.table} 
      SET "full_name"=$1, "phone"=$2, "email"=$3
      WHERE business_id=$4 AND id=$5
    `
    const data = client['data']

    await this.exec(sql, [
      data.name,
      data.phone ?? '',
      data.email ?? null,
      this.businessId,
      client.id,
    ])
  }

  async findByPhone(phone: string): Promise<Client | null> {
    const sql = `
      SELECT ${this.columns}
      FROM ${this.table}
      WHERE business_id = $1
        AND phone = $2
      LIMIT 1
    `
    const items = await this.query(sql, [this.businessId, phone])
    return items[0] ?? null
  }

  private query(sql: string, vars: any[]): Promise<Client[]> {
    return withPgClient(this.pool, async (client) => {
      const result = await client.query(sql, vars)
      return result.rows.map(
        (x) =>
          new Client({
            id: x.id,
            name: x.full_name,
            phone: x.phone,
            email: x.email,
          }),
      )
    })
  }

  private exec(sql: string, vars: any[]): Promise<void> {
    return withPgClient(this.pool, async (client) => {
      await client.query(sql, vars)
    })
  }
}
