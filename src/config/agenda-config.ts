export interface IDayWorkingHours {
  day: number // 0 = Sunday, 1 = Monday, ... 6 = Saturday
  startHour: number
  endHour: number
}

export const DEFAULT_WORKING_HOURS: IDayWorkingHours[] = [
  { day: 1, startHour: 10, endHour: 19 }, // Monday
  { day: 2, startHour: 10, endHour: 19 }, // Tuesday
  { day: 3, startHour: 10, endHour: 19 }, // Wednesday
  { day: 4, startHour: 10, endHour: 19 }, // Thursday
  { day: 5, startHour: 10, endHour: 19 }, // Friday
  { day: 6, startHour: 10, endHour: 17 }, // Saturday
  { day: 0, startHour: 0, endHour: 0 }, // Sunday off
]
