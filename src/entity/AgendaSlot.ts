import { Entity, IEntityData } from '@wabot-dev/framework'

export interface IAgendaSlotData extends IEntityData {
  startAt: number
  endAt: number
  isBooked?: boolean
  appointmentId?: string
}

export class AgendaSlot extends Entity<IAgendaSlotData> {
  get startAt() {
    return new Date(this.data.startAt)
  }

  get endAt() {
    return new Date(this.data.endAt)
  }

  isAvailable() {
    return !this.data.isBooked
  }

  book(appointmentId: string) {
    if (!this.isAvailable()) throw new Error(`Slot ${this.id} is already booked`)

    this.data.isBooked = true
    this.data.appointmentId = appointmentId
  }

  release() {
    this.data.isBooked = false
    this.data.appointmentId = undefined
  }
}
