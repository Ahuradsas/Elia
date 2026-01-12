export type ITimeRange = {
  start: number
  end: number
}

export type IAppointment = {
  assessorId: string
  range: ITimeRange
  bufferBeforeMs?: number
  bufferAfterMs?: number
}

export type IWorkingHours = {
  assessorId: string
  ranges: ITimeRange[]
}

export type ISlotRequest = {
  duration: number
  interval: number
  bufferBeforeMs?: number
  bufferAfterMs?: number
}

export type IAvailableSlot = {
  assessorId: string
  range: ITimeRange
}

export class TimeSlotEngine {
  constructor(
    private readonly workingHours: IWorkingHours[],
    private readonly appointments: IAppointment[],
  ) {}

  calculateSlots(request: ISlotRequest): IAvailableSlot[] {
    const slots: IAvailableSlot[] = []

    for (const wh of this.workingHours) {
      // Step 1: get blocked ranges for this assessor
      const blocked = this.appointments
        .filter((a) => a.assessorId === wh.assessorId)
        .map((a) => this.toBlockedRange(a))
        .sort((a, b) => a.start - b.start)

      for (const workingRange of wh.ranges) {
        // Step 2: subtract blocked ranges to get free ranges
        const freeRanges = this.subtractRanges(workingRange, blocked)

        // Step 3: generate slots in each free range
        for (const free of freeRanges) {
          slots.push(...this.generateSlotsWithBuffers(wh.assessorId, free, request))
        }
      }
    }

    return slots
  }

  // ──────────────────────────────────────────────
  // Range math
  // ──────────────────────────────────────────────

  private subtractRanges(base: ITimeRange, blocked: ITimeRange[]): ITimeRange[] {
    let ranges: ITimeRange[] = [base]

    for (const block of blocked) {
      ranges = ranges.flatMap((r) => this.subtractSingle(r, block))
    }

    return ranges
  }

  private subtractSingle(base: ITimeRange, block: ITimeRange): ITimeRange[] {
    if (block.end <= base.start || block.start >= base.end) return [base]

    const result: ITimeRange[] = []
    if (block.start > base.start) result.push({ start: base.start, end: block.start })
    if (block.end < base.end) result.push({ start: block.end, end: base.end })
    return result
  }

  // ──────────────────────────────────────────────
  // Appointment → blocked range
  // ──────────────────────────────────────────────

  private toBlockedRange(a: IAppointment): ITimeRange {
    return {
      start: Math.max(0, a.range.start - (a.bufferBeforeMs ?? 0)),
      end: a.range.end + (a.bufferAfterMs ?? 0),
    }
  }

  // ──────────────────────────────────────────────
  // Slot generation with slot buffers
  // ──────────────────────────────────────────────

  private generateSlotsWithBuffers(
    assessorId: string,
    free: ITimeRange,
    request: ISlotRequest,
  ): IAvailableSlot[] {
    const { duration, interval, bufferBeforeMs = 0, bufferAfterMs = 0 } = request
    const slots: IAvailableSlot[] = []

    // Step 1: adjust free range by slot buffers
    const start = free.start + bufferBeforeMs
    const end = free.end - bufferAfterMs

    const lastStart = end - duration
    if (lastStart < start) return []

    // Step 2: generate sliding slots
    for (let t = start; t <= lastStart; t += interval) {
      slots.push({
        assessorId,
        range: { start: t, end: t + duration },
      })
    }

    return slots
  }
}
