import { Appointment } from '@/entity/Appointment'
import { PgCrudRepository, singleton } from '@wabot-dev/framework'
import { Pool } from 'pg'

@singleton()
export class AppointmentRepository extends PgCrudRepository<Appointment> {
  constructor(pool: Pool) {
    super(pool, {
      schema: 'edglam',
      table: 'appointment',
      constructor: Appointment,
    })
  }

  async findByClientId(clientId: string): Promise<Appointment[]> {
    const query = `
      SELECT ${this.columns}
      FROM ${this.table}
      WHERE data @> $1::jsonb
      ORDER BY (data->>'scheduledAt')::bigint DESC
    `
    return this.query(query, [JSON.stringify({ clientId })])
  }

  async findUpcoming(): Promise<Appointment[]> {
    const now = Date.now()
    const query = `
      SELECT ${this.columns}
      FROM ${this.table}
      WHERE (data->>'scheduledAt')::bigint >= $1
        AND data->>'status' IN ('pending', 'confirmed')
      ORDER BY (data->>'scheduledAt')::bigint ASC
    `
    return this.query(query, [now])
  }

  async findOverlapping(startAt: Date, endAt: Date): Promise<Appointment[]> {
    const query = `
      SELECT ${this.columns}
      FROM ${this.table}
      WHERE data->>'startAt' <= $2::bigint
        AND data->>'endAt' >= $1::bigint
    `
    return await this.query(query, [startAt.getTime(), endAt.getTime()])
  }
}
