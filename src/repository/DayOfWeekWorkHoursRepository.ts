import { EliaBusinessId, EliaPool } from '@/elia-injection'
import { DayOfWeekWorkHours } from '@/entity/DayOfWeekWorkHours'
import { inject, singleton, withPgClient } from '@wabot-dev/framework'
import { Pool } from 'pg'

@singleton()
export class DayOfWeekWorkHoursRepository {
  private table = '"public"."business_working_hours"'
  private columns = '"id", "business_id", "day_of_week"'

  constructor(
    @inject(EliaPool) private pool: Pool,
    @inject(EliaBusinessId) private businessId: string,
  ) {}

  async findAll(): Promise<DayOfWeekWorkHours[]> {
    const sql = `
      SELECT ${this.columns}
      FROM ${this.table}
      WHERE business_id = $1
        AND is_open = TRUE
      ORDER BY created_at DESC
    `
    const items = await this.query(sql, [this.businessId])
    return items
  }

  async findWeeklyConfig(): Promise<DayOfWeekWorkHours[]> {
    const sql = `
      SELECT DISTINCT ON(day_of_week) ${this.columns}
      FROM ${this.table}
      WHERE business_id = $1
        AND is_open = TRUE
      ORDER BY day_of_week ASC, created_at DESC
    `
    const items = await this.query(sql, [this.businessId])
    return items
  }

  private query(sql: string, vars: any[]): Promise<DayOfWeekWorkHours[]> {
    return withPgClient(this.pool, async (client) => {
      const result = await client.query(sql, vars)
      return result.rows.map(
        (x) =>
          new DayOfWeekWorkHours({
            id: x.id,
            dayOfWeek: x.day_of_week,
            ranges: [],
          }),
      )
    })
  }
}
