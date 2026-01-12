import { Entity, IEntityData } from '@wabot-dev/framework'

export interface IClientData extends IEntityData {
  name: string
  phone: string
  address?: string
  zone?: string
  notes?: string
  email?: string
  lastAppointmentAt?: number
}

export class Client extends Entity<IClientData> {
  get name() {
    return this.data.name
  }

  get phone() {
    return this.data.phone
  }

  get address() {
    return this.data.address
  }

  get zone() {
    return this.data.zone
  }

  get isProfileComplete() {
    return !!this.data.name && !!this.data.address
  }

  setName(name: string) {
    this.data.name = name
  }

  setAddress(address: string, zone?: string) {
    this.data.address = address
    this.data.zone = zone
  }

  markLastAppointment() {
    this.data.lastAppointmentAt = Date.now()
  }
}
