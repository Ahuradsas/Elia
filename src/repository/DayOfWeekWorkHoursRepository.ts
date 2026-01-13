import { DayOfWeekWorkHours } from '@/entity/DayOfWeekWorkHours'

export class DayOfWeekWorkHoursRepository {
  findAll(): Promise<DayOfWeekWorkHours[]> {
    throw new Error('Not implemented')
  }
  findWeeklyConfig(): Promise<DayOfWeekWorkHours[]> {
    throw new Error('Not implemented')
  }
}
