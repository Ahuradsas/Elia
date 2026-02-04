import { getDatePartsInTimeZone } from '@/domain/calendar/getDatePartsInTimeZone'
import { getTimeZoneOffset } from '@/domain/calendar/getTimeZoneOffset'
import { EliaBusinessId, EliaBusinessTz, EliaPool } from '@/elia-injection'
import { Appointment } from '@/entity/Appointment'
import { inject, singleton, withPgClient } from '@wabot-dev/framework'
import { Pool } from 'pg'
import { v4 } from 'uuid'

@singleton()
export class AppointmentRepository {
  private table = '"public"."appointments"'
  private columns =
    '"id", "business_id", "client_id", "service_id", "service_name", "total_price", "notes", "appointment_date", "appointment_time", "appointment_end_time", "direccion", "zona_barrio", "status", "team_member_id"'

  constructor(
    @inject(EliaPool) private pool: Pool,
    @inject(EliaBusinessId) private businessId: string,
    @inject(EliaBusinessTz) private tz: string,
  ) {}

  async find(id: string): Promise<Appointment | null> {
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

  async findOrThrow(id: string): Promise<Appointment> {
    const client = await this.find(id)
    if (!client) throw new Error(`Not found Appointment with id='${id}'`)
    return client
  }

  async create(item: Appointment): Promise<void> {
    const sql = `
      INSERT INTO ${this.table}(${this.columns})
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
    `
    const data = item['data']
    data.id = v4()
    data.createdAt = Date.now()
    item.validate()

    const { year, month, day, hour, minute } = getDatePartsInTimeZone(
      new Date(data.scheduledAt),
      this.tz,
    )

    const { hour: endHour, minute: endMinute } = getDatePartsInTimeZone(
      new Date(data.scheduledEndAt),
      this.tz,
    )

    await this.exec(sql, [
      data.id,
      this.businessId,
      data.clientId,
      data.serviceId,
      data.serviceName,
      data.servicePrice,
      data.notes,
      `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`,
      `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
      `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`,
      data.address,
      data.zone,
      data.status,
      data.teamMemberId,
    ])
  }

  async findByClientId(clientId: string): Promise<Appointment[]> {
    const query = `
      SELECT ${this.columns}
      FROM ${this.table}
      WHERE client_id = $1
        AND business_id = $2
      ORDER BY appointment_time DESC
    `
    return this.query(query, [clientId, this.businessId])
  }

  async findUpcoming(): Promise<Appointment[]> {
    const now = new Date()
    const query = `
      SELECT ${this.columns}
      FROM ${this.table}
      WHERE appointment_time >= $1
        AND business_id = $2
        AND status IN ('pending', 'confirmed')
      ORDER BY appointment_time ASC
    `
    return this.query(query, [now, this.businessId])
  }

  async findOverlapping(startAt: Date, endAt: Date): Promise<Appointment[]> {
    const query = `
      SELECT ${this.columns}
      FROM ${this.table}
      WHERE (appointment_date + appointment_time) <= $2::timestamptz
        AND (appointment_date + appointment_end_time) >= $1::timestamptz
        AND business_id = $3
    `
    return await this.query(query, [startAt.toISOString(), endAt.toISOString(), this.businessId])
  }

  private query(sql: string, vars: any[]): Promise<Appointment[]> {
    return withPgClient(this.pool, async (client) => {
      const result = await client.query(sql, vars)
      return result.rows.map((x) => {
        const [year, month, date] = [
          x.appointment_date.getFullYear(),
          x.appointment_date.getMonth(),
          x.appointment_date.getDate(),
        ]
        const [hour, minute] = x.appointment_time.split(':')
        const [endHour, endMinute] = x.appointment_end_time.split(':')

        const tzOffset = getTimeZoneOffset(this.tz, x.appointment_date)

        const scheduledAt =
          Date.UTC(year, month, date, hour, minute) -
          tzOffset.hours * 3600 * 1000 -
          tzOffset.minutes * 60 * 1000

        const scheduledEndAt =
          Date.UTC(year, month, date, endHour, endMinute) -
          tzOffset.hours * 3600 * 1000 -
          tzOffset.minutes * 60 * 1000

        const appointment = new Appointment({
          id: x.id,
          clientId: x.client_id,
          serviceId: x.service_id,
          serviceName: x.service_name,
          servicePrice: x.total_price,
          notes: x.notes,
          address: x.direction,
          scheduledAt: scheduledAt,
          scheduledEndAt: scheduledEndAt,
          zone: x.zona_barrio,
          status: x.status,
          teamMemberId: x.team_member_id,
        })

        return appointment
      })
    })
  }

  private exec(sql: string, vars: any[]): Promise<void> {
    return withPgClient(this.pool, async (client) => {
      await client.query(sql, vars)
    })
  }
}
