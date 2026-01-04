import { AgendaSlotRepository } from '@/repository/AgendaSlotRepository'
import { description, isDate, isNumber, mindsetModule } from '@wabot-dev/framework'

/** Request classes for AgendaModule */
export class FindSlotsReq {
  @isDate()
  @description('desde cuando buscar')
  startAt!: Date

  @isDate()
  @description('hasta cuando buscar')
  endAt!: Date

  @isNumber()
  @description('duración requerida en minutos')
  requiredMinutes!: number
}

@mindsetModule()
export class AgendaModule {
  constructor(private agendaSlotRepository: AgendaSlotRepository) {}

  @description('Find available slots in a given period')
  async findAvailableSlots(req: FindSlotsReq) {
    const availableSlots = await this.agendaSlotRepository.findAvailableBetween(req.startAt, req.endAt)
    return availableSlots
  }

  @description('Get current time')
  async getCurrentTime() {
    const now = new Date()
    return {
      now,
      utcOffset: now.getTimezoneOffset(),
    }
  }
}
