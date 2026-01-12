import { Entity, IEntityData } from '@wabot-dev/framework'

export type IAppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled'

export interface IAppointmentData extends IEntityData {
  clientId: string
  serviceId: string
  serviceName: string
  address: string
  scheduledAt: number
  status: IAppointmentStatus
  cancelledAt?: number
  completedAt?: number
}

export class Appointment extends Entity<IAppointmentData> {
  get status() {
    return this.data.status
  }

  isPending() {
    return this.data.status === 'pending'
  }

  isConfirmed() {
    return this.data.status === 'confirmed'
  }

  confirm() {
    if (!this.isPending()) throw new Error(`Appointment ${this.id} cannot be confirmed`)
    this.data.status = 'confirmed'
  }

  cancel() {
    if (this.data.status === 'completed')
      throw new Error(`Completed appointment cannot be cancelled`)
    this.data.status = 'cancelled'
    this.data.cancelledAt = Date.now()
  }

  complete() {
    if (!this.isConfirmed()) throw new Error(`Only confirmed appointments can be completed`)
    this.data.status = 'completed'
    this.data.completedAt = Date.now()
  }
}
