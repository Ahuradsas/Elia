import { EliaBusinessId, EliaPool } from '@/elia-injection'
import { TeamMember } from '@/entity/TeamMember'
import { inject, singleton, withPgClient } from '@wabot-dev/framework'
import { Pool } from 'pg'

@singleton()
export class TeamMemberRepository {
  private table = '"public"."team_members"'
  private columns = '"id", "business_id", "full_name",  "is_active"'

  constructor(
    @inject(EliaPool) private pool: Pool,
    @inject(EliaBusinessId) private businessId: string,
  ) {}

  async findAll(): Promise<TeamMember[]> {
    const sql = `
      SELECT ${this.columns}
      FROM ${this.table}
      WHERE "business_id" = $1
    `
    const items = await this.query(sql, [this.businessId])
    return items
  }

  async findAllActive(): Promise<TeamMember[]> {
    const sql = `
      SELECT ${this.columns}
      FROM ${this.table}
      WHERE "business_id" = $1
        AND is_active = TRUE
    `
    const items = await this.query(sql, [this.businessId])
    return items
  }

  async findAllActiveByServiceId(serviceId: string): Promise<TeamMember[]> {
    const sql = `
      SELECT ${this.columns}
      FROM ${this.table}
      WHERE "business_id" = $1
        AND is_active = TRUE
    `
    const items = await this.query(sql, [this.businessId])
    return items
  }

  private query(sql: string, vars: any[]): Promise<TeamMember[]> {
    return withPgClient(this.pool, async (client) => {
      const result = await client.query(sql, vars)
      return result.rows.map(
        (x) =>
          new TeamMember({
            id: x.id,
            name: x.full_name,
            isActive: x.is_active,
            servicesIds: [],
          }),
      )
    })
  }
}
