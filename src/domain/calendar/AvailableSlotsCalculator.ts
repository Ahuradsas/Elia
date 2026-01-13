import { IAppointmentAssignation } from './IAppointmentAssignation'
import { ITeamMemberAvailableSlot } from './ITeamMemberAvailableSlot'
import { ITeamMemberWorkSlots } from './ITeamMemberWorkSlots'
import { ITimeRange } from './ITimeRange'

export type ICalculateAvailableSlotsReq = {
  durationMs: number
  intervalMs: number
  bufferBeforeMs?: number
  bufferAfterMs?: number
}

export class AvailableSlotsCalculator {
  constructor(
    private readonly teamMembersWorkSlots: ITeamMemberWorkSlots[],
    private readonly appointmentsAssignations: IAppointmentAssignation[],
  ) {}

  calculateSlots(request: ICalculateAvailableSlotsReq): ITeamMemberAvailableSlot[] {
    const slots: ITeamMemberAvailableSlot[] = []

    for (const wh of this.teamMembersWorkSlots) {
      // Step 1: get blocked ranges for this assessor
      const blocked = this.appointmentsAssignations
        .filter((a) => a.teamMemberId === wh.teamMemberId)
        .map((a) => this.toBlockedRange(a))
        .sort((a, b) => a.start - b.start)

      for (const workingRange of wh.ranges) {
        // Step 2: subtract blocked ranges to get free ranges
        const freeRanges = this.subtractRanges(workingRange, blocked)

        // Step 3: generate slots in each free range
        for (const free of freeRanges) {
          slots.push(...this.generateSlotsWithBuffers(wh.teamMemberId, free, request))
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

  private toBlockedRange(a: IAppointmentAssignation): ITimeRange {
    return {
      start: Math.max(0, a.range.start - (a.bufferBeforeMs ?? 0)),
      end: a.range.end + (a.bufferAfterMs ?? 0),
    }
  }

  // ──────────────────────────────────────────────
  // Slot generation with slot buffers
  // ──────────────────────────────────────────────

  private generateSlotsWithBuffers(
    teamMemberId: string,
    free: ITimeRange,
    request: ICalculateAvailableSlotsReq,
  ): ITeamMemberAvailableSlot[] {
    const {
      durationMs: duration,
      intervalMs: interval,
      bufferBeforeMs = 0,
      bufferAfterMs = 0,
    } = request
    const slots: ITeamMemberAvailableSlot[] = []

    // Step 1: adjust free range by slot buffers
    const start = free.start + bufferBeforeMs
    const end = free.end - bufferAfterMs

    const lastStart = end - duration
    if (lastStart < start) return []

    // Step 2: generate sliding slots
    for (let t = start; t <= lastStart; t += interval) {
      slots.push({
        teamMemberId,
        range: { start: t, end: t + duration },
      })
    }

    return slots
  }
}
