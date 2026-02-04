import { EliaBusinessId, EliaPool } from '@/elia-injection'
import { BotConfig } from '@/entity/BotConfig'
import { inject, singleton, withPgClient } from '@wabot-dev/framework'
import { Pool } from 'pg'

@singleton()
export class BotConfigRepository {
  private table = '"public"."bot_scheduler_config"'
  private columnsList = [
    'id',
    'business_id',
    'bot_name',
    'language',
    'personality',
    'limits',
    'context',
    'is_active',
  ]
  private columns = this.columnsList.map((c) => `"${c}"`).join(', ')

  constructor(
    @inject(EliaPool) private pool: Pool,
    @inject(EliaBusinessId) private businessId: string,
  ) {}

  async find(): Promise<BotConfig | null> {
    const sql = `
      SELECT ${this.columns}
      FROM ${this.table}
      WHERE "business_id" = $1
      LIMIT 1
    `
    const items = await this.query(sql, [this.businessId])
    return items.at(0) ?? null
  }

  async findOrThrow(): Promise<BotConfig> {
    const client = await this.find()
    if (!client) throw new Error(`Not found BotConfig`)
    return client
  }

  private query(sql: string, vars: any[]): Promise<BotConfig[]> {
    return withPgClient(this.pool, async (client) => {
      const result = await client.query(sql, vars)
      return result.rows.map(
        (x) =>
          new BotConfig({
            id: x.id,
            name: x.bot_name,
            language: x.language,
            personality: x.personality,
            limits: x.limits,
            context: x.context,
            isOn: x.is_active,
            testNumbers: [
              '+573134336124', 
              '+573003410949', 
              '+573145063381', 
              '+573001258147',
            ],
          }),
      )
    })
  }
}
