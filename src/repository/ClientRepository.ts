import { Client } from '@/entity/Client'
import { PgCrudRepository, singleton } from '@wabot-dev/framework'
import { Pool } from 'pg'

@singleton()
export class ClientRepository extends PgCrudRepository<Client> {
  constructor(pool: Pool) {
    super(pool, {
      schema: 'edglam',
      table: 'client',
      constructor: Client,
    })
  }

  async findByPhone(phone: string): Promise<Client | null> {
    const query = `
      SELECT ${this.columns}
      FROM ${this.table}
      WHERE data @> $1::jsonb
      LIMIT 1
    `
    const items = await this.query(query, [JSON.stringify({ phone })])
    return items[0] ?? null
  }
}
