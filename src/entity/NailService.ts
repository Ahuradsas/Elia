import { Entity, IEntityData } from '@wabot-dev/framework'

export interface INailServiceData extends IEntityData {
  name: string
  durationMinutes: number
  price: number
  isActive: boolean
}

export class NailService extends Entity<INailServiceData> {
  get name() {
    return this.data.name
  }

  get durationMinutes() {
    return this.data.durationMinutes
  }

  get price() {
    return this.data.price
  }

  isAvailable() {
    return this.data.isActive
  }

  deactivate() {
    this.data.isActive = false
  }

  activate() {
    this.data.isActive = true
  }
}
