import { getDatePartsInTimeZone } from './getDatePartsInTimeZone'
import { getTimeZoneOffset } from './getTimeZoneOffset'

export function addCompleteDays(start: Date, days: number, timeZone: string): Date {
  const parts = getDatePartsInTimeZone(start, timeZone)

  const offset = getTimeZoneOffset(timeZone, start)

  const target = new Date(
    Date.UTC(parts.year, parts.month - 1, parts.day + days, -offset.hours, -offset.minutes, 0),
  )

  if (target < start) {
    target.setDate(target.getDate() + 1)
  }

  return target
}
