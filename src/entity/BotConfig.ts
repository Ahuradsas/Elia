import { Entity, IEntityData } from '@wabot-dev/framework'

export interface IBotConfigData extends IEntityData {
  name: string
  language: string
  personality: string
  limits: string
  context: string
  isOn: boolean
  testNumbers: string[]
}

export class BotConfig extends Entity<IBotConfigData> {
  get name(): string {
    return this.data.name
  }
  get language(): string {
    return this.data.language
  }
  get personality(): string {
    return this.data.personality
  }
  get limits(): string {
    return this.data.limits
  }
  get context(): string {
    return this.data.context
  }
  get isOn(): boolean {
    return this.data.isOn
  }
  get testNumbers(): string[] {
    return this.data.testNumbers
  }
}
