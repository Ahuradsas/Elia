import { EliaBusinessId, EliaPool } from '@/elia-injection'
import { TeamMemberWorkingHours } from '@/entity/TeamMemberWorkingHours'
import { inject, singleton, withPgClient } from '@wabot-dev/framework'
import { Pool } from 'pg'

@singleton()
export class TeamMemberWorkingHoursRepository {
  private table = '"public"."team_member_working_hours"'
  private columnsList = [
    'id',
    'team_member_id',
    'day_of_week',
    'is_available',
    'start_time',
    'end_time',
  ]
  private columns = this.columnsList.map((c) => `"${c}"`).join(', ')

  constructor(
    @inject(EliaPool) private pool: Pool,
    @inject(EliaBusinessId) private businessId: string,
  ) {}

  async findByTeamMemberIds(ids: string[]): Promise<TeamMemberWorkingHours[]> {
    const placeholders = ids.map((_, i) => `$${i + 1}`)

    const sql = `
      SELECT DISTINCT ON(team_member_id, day_of_week) ${this.columns}
      FROM ${this.table}
      WHERE team_member_id IN (${placeholders.join(', ')})
        AND is_available = TRUE
      ORDER BY team_member_id ASC, day_of_week ASC, created_at DESC
    `
    const items = await this.query(sql, [...ids])
    return items
  }

  private query(sql: string, vars: any[]): Promise<TeamMemberWorkingHours[]> {
    return withPgClient(this.pool, async (client) => {
      const result = await client.query(sql, vars)
      return result.rows.map(
        (x) =>
          new TeamMemberWorkingHours({
            id: x.id,
            teamMemberId: x.team_member_id,
            dayOfWeek: x.day_of_week,
            ranges: [
              {
                startHour: Number(x.start_time.split(':')[0]),
                startMinute: Number(x.start_time.split(':')[1]),
                endHour: Number(x.end_time.split(':')[0]),
                endMinute: Number(x.end_time.split(':')[1]),
              },
            ],
          }),
      )
    })
  }
}
