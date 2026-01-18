import { Entity, IEntityData } from '@wabot-dev/framework'
import { IDayOfWeekWorkSlots } from '@/domain/calendar'

export interface IDayOfWeekWorkHoursData extends IEntityData {
  dayOfWeek: number
  ranges: { startHour: number; startMinute: number; endHour: number; endMinute: number }[]
}

export class DayOfWeekWorkHours
  extends Entity<IDayOfWeekWorkHoursData>
  implements IDayOfWeekWorkSlots
{
  get dayOfWeek() {
    return this.data.dayOfWeek
  }

  get ranges() {
    return this.data.ranges
  }
}
