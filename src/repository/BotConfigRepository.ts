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

  private static readonly CACHE_TTL_MS = 60_000

  private cachedValue: BotConfig | null = null
  private cachedAt: number = 0

  constructor(
    @inject(EliaPool) private pool: Pool,
    @inject(EliaBusinessId) private businessId: string,
  ) {}

  async find(): Promise<BotConfig | null> {
    if (Date.now() - this.cachedAt < BotConfigRepository.CACHE_TTL_MS) {
      return this.cachedValue
    }

    const sql = `
      SELECT ${this.columns}
      FROM ${this.table}
      WHERE "business_id" = $1
      LIMIT 1
    `
    const items = await this.query(sql, [this.businessId])
    this.cachedValue = items.at(0) ?? null
    this.cachedAt = Date.now()
    return this.cachedValue
  }

  async findOrThrow(): Promise<BotConfig> {
    const client = await this.find()
    if (!client) throw new Error(`Not found BotConfig`)
    return client
  }

  private query(sql: string, vars: any[]): Promise<BotConfig[]> {
    return withPgClient(this.pool, async (client) => {
      
      const testNumbersRows = await client.query(`
        SELECT "id", "business_id", "country_code", "phone_number"
        FROM "public"."bot_test_numbers"
        WHERE "business_id" = $1
      `, [this.businessId])

      const testNumbers = testNumbersRows.rows.map(x => `${x.country_code}${x.phone_number}`)

      const result = await client.query(sql, vars)
      return result.rows.map(
        (x) =>
          new BotConfig({
            id: x.id,
            name: x.bot_name,
            language: x.language,
            personality: x.personality,
            limits: x.limits,
            context: x.context ?? '',
            isOn: x.is_active,
            testNumbers,
          }),
      )
    })
  }
}
