import { ITimeRange } from './ITimeRange'

export type IDayOfWeekWorkSlots = {
  dayOfWeek: number // 0 = Sunday, 6 = Saturday
  ranges: { startHour: number; startMinute: number; endHour: number; endMinute: number }[]
}

export type ISpecialDayWorkSlots = {
  date: string // YYYY-MM-DD
  ranges: { startHour: number; startMinute: number; endHour: number; endMinute: number }[]
}

export type IWorkSlotsCalculatorConfig = {
  timeZone: string
  weeklyConfig: IDayOfWeekWorkSlots[]
  specialDays?: ISpecialDayWorkSlots[]
}

export class WorkSlotsCalculator {
  constructor(private readonly config: IWorkSlotsCalculatorConfig) {}

  calculate(startDate: Date, endDate: Date): ITimeRange[] {
    const ranges: ITimeRange[] = []

    let current = new Date(startDate)
    current.setHours(0, 0, 0, 0)

    const end = new Date(endDate)
    end.setHours(0, 0, 0, 0)

    while (current <= end) {
      const ymd = current.toISOString().slice(0, 10)

      const special = this.config.specialDays?.find((d) => d.date === ymd)

      const dayRanges =
        special?.ranges ||
        this.config.weeklyConfig.find((d) => d.dayOfWeek === current.getDay())?.ranges ||
        []

      for (const r of dayRanges) {
        const startUtc = this.toUtc(current, r.startHour, r.startMinute)
        const endUtc = this.toUtc(current, r.endHour, r.endMinute)

        if (startUtc < endUtc) {
          ranges.push({ start: startUtc, end: endUtc })
        }
      }

      current.setDate(current.getDate() + 1)
    }

    return ranges
  }

  /**
   * Convert a local time in the given timeZone to UTC timestamp
   */
  private toUtc(date: Date, hour: number, minute: number): number {
    const tz = this.config.timeZone

    // Format the target date/time in that time zone
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      hour12: false,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).formatToParts(date)

    // Extract components
    const d: Record<string, number> = {}
    for (const p of parts) {
      if (p.type !== 'literal') d[p.type] = parseInt(p.value)
    }

    // Build the UTC timestamp for the target time in the time zone
    const utcDate = new Date(Date.UTC(d.year, d.month - 1, d.day, hour, minute, 0, 0))
    const offsetMs = this.getTimeZoneOffsetMs(date, tz)
    return utcDate.getTime() - offsetMs
  }

  /**
   * Return the time zone offset at a given date in milliseconds
   */
  private getTimeZoneOffsetMs(date: Date, timeZone: string): number {
    const dtf = new Intl.DateTimeFormat('en-US', {
      hour12: false,
      timeZone,
      weekday: 'short',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
    })
    const parts = dtf.formatToParts(date)
    const filled: Record<string, number> = {}
    for (const p of parts) {
      if (p.type !== 'literal') filled[p.type] = parseInt(p.value)
    }

    const asDate = Date.UTC(
      filled.year,
      (filled.month ?? 1) - 1,
      filled.day ?? 1,
      filled.hour ?? 0,
      filled.minute ?? 0,
      filled.second ?? 0,
    )

    return asDate - date.getTime()
  }
}
