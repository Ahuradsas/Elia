import { addCompleteDays } from '@/domain/calendar'
import { AvailableSlotsCalculator } from '@/domain/calendar/AvailableSlotsCalculator'
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
    private dayWorkingHoursRepository: DayOfWeekWorkHoursRepository,
    private appointmentRepository: AppointmentRepository,
    private serviceRepository: ServiceRepository,
  ) {}

  async handle(req: IReadAvailableSlotsForServiceReq) {
    const service = await this.serviceRepository.findOrThrow(req.serviceId)
    const teamMembers = await this.teamMemberRepository.findAllActiveByServiceId(req.serviceId)
    const daysWorkingHours = await this.dayWorkingHoursRepository.findWeeklyConfig()

    const workingHoursCalculator = new WorkSlotsCalculator({
      timeZone: this.config.timeZone,
      weeklyConfig: daysWorkingHours,
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

    return availableSlotsCalculator.calculateSlots({
      durationMs: service.durationMinutes * 60 * 1000,
      intervalMs: 30 * 60 * 1000,
      bufferAfterMs: 30 * 60 * 1000,
      bufferBeforeMs: 30 * 60 * 1000,
    })
  }
}
