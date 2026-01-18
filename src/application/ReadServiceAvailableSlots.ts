import { addCompleteDays } from '@/domain/calendar'
import { AvailableSlotsCalculator } from '@/domain/calendar/AvailableSlotsCalculator'
import { getDatePartsInTimeZone } from '@/domain/calendar/getDatePartsInTimeZone'
import { getTimeZoneOffset } from '@/domain/calendar/getTimeZoneOffset'
import { WorkSlotsCalculator } from '@/domain/calendar/WorkSlotsCalculator'
import { AppointmentRepository } from '@/repository/AppointmentRepository'
import { DayOfWeekWorkHoursRepository } from '@/repository/DayOfWeekWorkHoursRepository'
import { ServiceRepository } from '@/repository/ServiceRepository'
import { TeamMemberRepository } from '@/repository/TeamMemberRepository'
import { singleton } from '@wabot-dev/framework'

export interface IReadAvailableSlotsForServiceReq {
  serviceId: string
  teamMemberId?: string
}

@singleton()
export class ReadAvailableSlotsForService {
  private config = {
    maxFutureDays: 15,
    timeZone: 'America/Bogota',
  }

  constructor(
    private teamMemberRepository: TeamMemberRepository,
    private dayOfWeekWorkHoursRepository: DayOfWeekWorkHoursRepository,
    private appointmentRepository: AppointmentRepository,
    private serviceRepository: ServiceRepository,
  ) {}

  async handle(req: IReadAvailableSlotsForServiceReq) {
    const service = await this.serviceRepository.findOrThrow(req.serviceId)
    const teamMembers = await this.teamMemberRepository.findAllActiveByServiceId(req.serviceId)
    const daysOfWeekWorkHours = await this.dayOfWeekWorkHoursRepository.findWeeklyConfig()

    const workingHoursCalculator = new WorkSlotsCalculator({
      timeZone: this.config.timeZone,
      weeklyConfig: daysOfWeekWorkHours,
    })

    const start = new Date()
    const end = addCompleteDays(start, this.config.maxFutureDays, this.config.timeZone)

    const workingHoursRanges = workingHoursCalculator.calculate(start, end)
    const appointments = await this.appointmentRepository.findOverlapping(start, end)

    const teamMembersWorkSlots = teamMembers.map((tm) => ({
      teamMemberId: tm.id,
      ranges: workingHoursRanges,
    }))

    const availableSlotsCalculator = new AvailableSlotsCalculator(
      teamMembersWorkSlots,
      appointments,
    )

    const slots = availableSlotsCalculator.calculateSlots({
      durationMs: service.durationMinutes * 60 * 1000,
      intervalMs: 30 * 60 * 1000,
      bufferAfterMs: 30 * 60 * 1000,
      bufferBeforeMs: 30 * 60 * 1000,
    })

    const formatedSlots = slots.map((x) => {
      const start = getDatePartsInTimeZone(new Date(x.range.start), this.config.timeZone)
      const end = getDatePartsInTimeZone(new Date(x.range.end), this.config.timeZone)

      return {
        teamMemberId: x.teamMemberId,
        utcOffset: getTimeZoneOffset(this.config.timeZone, new Date(x.range.start)),
        range: {
          start: {
            year: start.year,
            month: start.month,
            day: start.day,
            hour: start.hour,
            minute: start.minute,
          },
          end: {
            year: end.year,
            month: end.month,
            day: end.day,
            hour: end.hour,
            minute: end.minute,
          },
        },
      }
    })

    return formatedSlots
  }
}
