import { cron, singleton } from '@wabot-dev/framework'
import { AgendaSlotRepository } from '@/repository/AgendaSlotRepository'
import { AgendaSlot, IAgendaSlotData } from '@/entity/AgendaSlot'

function isWorkingDay(date: Date): boolean {
  const day = date.getDay()
  return day >= 1 && day <= 5 // Mon–Fri
}

function addWorkingDays(from: Date, days: number): Date {
  const date = new Date(from)
  let added = 0

  while (added < days) {
    date.setDate(date.getDate() + 1)
    if (isWorkingDay(date)) {
      added++
    }
  }

  return date
}

@singleton()
@cron({ name: 'agenda-slot-generator', cron: '* * * * *' })
export class AgendaSlotGenerator {
  constructor(private agendaSlotRepository: AgendaSlotRepository) {}

  async handle() {
    const openingHour = 10
    const closingHour = 19
    const slotMinutes = 10

    const slotsToCreate: AgendaSlot[] = []

    // 1️⃣ Find last existing slot
    const lastSlot = await this.agendaSlotRepository.findLastSlot()

    // 2️⃣ Determine generation start
    const startDate = lastSlot ? new Date(lastSlot.endAt) : new Date()
    startDate.setSeconds(0, 0)

    // Enforce opening hours
    if (startDate.getHours() < openingHour || startDate.getHours() >= closingHour) {
      startDate.setHours(openingHour, 0, 0, 0)
    }

    // 3️⃣ Determine end date: +2 working days
    const endDate = addWorkingDays(new Date(), 2)

    const current = new Date(startDate)

    while (current <= endDate) {
      // Skip weekends
      if (!isWorkingDay(current)) {
        current.setDate(current.getDate() + 1)
        current.setHours(openingHour, 0, 0, 0)
        continue
      }

      const slotStart = new Date(current)
      const slotEnd = new Date(slotStart)
      slotEnd.setMinutes(slotEnd.getMinutes() + slotMinutes)

      // Stop at closing hour
      if (slotEnd.getHours() > closingHour) {
        current.setDate(current.getDate() + 1)
        current.setHours(openingHour, 0, 0, 0)
        continue
      }

      const existingSlot = await this.agendaSlotRepository.findByStartAt(slotStart)

      if (!existingSlot) {
        const slotData: IAgendaSlotData = {
          startAt: slotStart.getTime(),
          endAt: slotEnd.getTime(),
          isBooked: false,
        }

        slotsToCreate.push(new AgendaSlot(slotData))
      }

      current.setTime(slotEnd.getTime())
    }

    for (const slot of slotsToCreate) {
      await this.agendaSlotRepository.create(slot)
    }

    console.log(`[AgendaSlotGenerator] Created ${slotsToCreate.length} new slots.`)
  }
}
