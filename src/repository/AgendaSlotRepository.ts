import { AgendaSlot } from '@/entity/AgendaSlot'
import { PgCrudRepository, singleton } from '@wabot-dev/framework'
import { Pool } from 'pg'

@singleton()
export class AgendaSlotRepository extends PgCrudRepository<AgendaSlot> {
  constructor(pool: Pool) {
    super(pool, {
      schema: 'edglam',
      table: 'agenda_slot',
      constructor: AgendaSlot,
    })
  }

  async findAvailableBetween(startAt: Date, endAt: Date): Promise<AgendaSlot[]> {
    const query = `
      SELECT ${this.columns}
      FROM ${this.table}
      WHERE (data->>'isBooked') IS DISTINCT FROM 'true'
        AND (data->>'startAt')::bigint >= $1
        AND (data->>'endAt')::bigint <= $2
      ORDER BY (data->>'startAt')::bigint ASC
    `
    return this.query(query, [startAt.getTime(), endAt.getTime()])
  }

  async findLastSlot(): Promise<AgendaSlot | null> {
    const query = `
      SELECT ${this.columns}
      FROM ${this.table}
      ORDER BY (data->>'endAt')::bigint DESC
      LIMIT 1
  `
    const result = await this.query(query, [])
    return result[0] ?? null
  }

  async findByStartAt(startAt: Date): Promise<AgendaSlot | null> {
    const query = `
      SELECT ${this.columns}
      FROM ${this.table}
      WHERE (data->>'startAt')::bigint = $1
      LIMIT 1
  `
    const result = await this.query(query, [startAt.getTime()])
    return result[0] ?? null
  }
}
