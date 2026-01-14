import { ReadAvailableSlotsForService } from '@/application/ReadServiceAvailableSlots'
import { description, isString, mindsetModule } from '@wabot-dev/framework'

/** Request classes for AgendaModule */
export class FindSlotsReq {
  @isString()
  @description('id del servicio que se desea agendar')
  serviceId!: string
}

@mindsetModule()
export class AgendaModule {
  constructor(private readAvailableSlotsForService: ReadAvailableSlotsForService) {}

  @description('Find available slots in a given period')
  async findAvailableSlots(req: FindSlotsReq) {
    const availableSlots = await this.readAvailableSlotsForService.handle({
      serviceId: req.serviceId,
    })
    return availableSlots
  }

  @description('Get current time')
  async getCurrentTime() {
    const now = new Date()
    const offset = now.getTimezoneOffset()
    return {
      now,
      utcOffset: {
        hours: Math.floor(offset / 60),
        minutes: offset % 60,
      },
    }
  }
}
