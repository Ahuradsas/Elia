import test, { describe } from 'node:test'
import assert from 'node:assert/strict'
import { TimeSlotEngine, ITimeRange, IWorkingHours, IAppointment } from './TimeSlotEngine'

/**
 * Helpers
 */
const minutes = (m: number) => m * 60 * 1000

const range = (start: number, end: number): ITimeRange => ({
  start: minutes(start),
  end: minutes(end),
})

describe(TimeSlotEngine.name, () => {
  test('generates slots using requested duration and interval', () => {
    const workingHours: IWorkingHours[] = [
      {
        assessorId: 'A1',
        ranges: [range(0, 120)], // 2 hours
      },
    ]

    const engine = new TimeSlotEngine(workingHours, [])

    const slots = engine.calculateSlots({
      duration: minutes(30),
      interval: minutes(15),
    })

    assert.equal(slots.length, 7)
    assert.deepEqual(
      slots.map((s) => [s.range.start, s.range.end]),
      [
        [0, 30],
        [15, 45],
        [30, 60],
        [45, 75],
        [60, 90],
        [75, 105],
        [90, 120],
      ].map(([s, e]) => [minutes(s), minutes(e)]),
    )
  })

  test('handles multiple working hour ranges per assessor', () => {
    const workingHours: IWorkingHours[] = [
      {
        assessorId: 'A1',
        ranges: [range(0, 60), range(120, 180)],
      },
    ]

    const engine = new TimeSlotEngine(workingHours, [])

    const slots = engine.calculateSlots({
      duration: minutes(30),
      interval: minutes(30),
    })

    assert.deepEqual(
      slots.map((s) => [s.range.start, s.range.end]),
      [
        [0, 30],
        [30, 60],
        [120, 150],
        [150, 180],
      ].map(([s, e]) => [minutes(s), minutes(e)]),
    )
  })

  test('does not mix appointments between assessors', () => {
    const workingHours: IWorkingHours[] = [
      { assessorId: 'A1', ranges: [range(0, 60)] },
      { assessorId: 'A2', ranges: [range(0, 60)] },
    ]

    const appointments: IAppointment[] = [
      {
        assessorId: 'A1',
        range: range(0, 60),
      },
    ]

    const engine = new TimeSlotEngine(workingHours, appointments)

    const slots = engine.calculateSlots({
      duration: minutes(30),
      interval: minutes(30),
    })

    assert.equal(slots.filter((s) => s.assessorId === 'A1').length, 0)

    assert.equal(slots.filter((s) => s.assessorId === 'A2').length, 2)
  })

  test('allows slots that exactly fit working range', () => {
    const workingHours: IWorkingHours[] = [
      {
        assessorId: 'A1',
        ranges: [range(0, 30)],
      },
    ]

    const engine = new TimeSlotEngine(workingHours, [])

    const slots = engine.calculateSlots({
      duration: minutes(30),
      interval: minutes(15),
    })

    assert.equal(slots.length, 1)
    assert.deepEqual(slots[0].range, range(0, 30))
  })

  test('returns empty array when no slot can fit', () => {
    const workingHours: IWorkingHours[] = [
      {
        assessorId: 'A1',
        ranges: [range(0, 20)],
      },
    ]

    const engine = new TimeSlotEngine(workingHours, [])

    const slots = engine.calculateSlots({
      duration: minutes(30),
      interval: minutes(15),
    })

    assert.equal(slots.length, 0)
  })

  test('appointment buffer prevents overlapping slots', () => {
    const workingHours: IWorkingHours[] = [
      { assessorId: 'A1', ranges: [range(0, 120)] }, // 0 - 120 min
    ]

    const appointments: IAppointment[] = [
      {
        assessorId: 'A1',
        range: range(30, 60), // 30-60
        bufferBeforeMs: minutes(10), // blocked 20-30
        bufferAfterMs: minutes(15), // blocked 60-75
        // total blocket 20-75
      },
    ]

    const engine = new TimeSlotEngine(workingHours, appointments)

    const slots = engine.calculateSlots({
      duration: minutes(15),
      interval: minutes(15),
    })

    const expected = [
      [0, 15],
      [75, 90],
      [90, 105],
      [105, 120],
    ].map(([s, e]) => [minutes(s), minutes(e)])

    assert.deepEqual(
      slots.map((s) => [s.range.start, s.range.end]),
      expected,
    )
  })

  test('slot request buffer prevents generating slots too close to edges', () => {
    const workingHours: IWorkingHours[] = [
      { assessorId: 'A1', ranges: [range(0, 120)] }, // 0 - 120 min
    ]

    const engine = new TimeSlotEngine(workingHours, [])

    const slots = engine.calculateSlots({
      duration: minutes(30),
      interval: minutes(15),
      bufferBeforeMs: minutes(10),
      bufferAfterMs: minutes(20),
    })

    // The first slot cannot start at 0 (bufferBefore 10)
    const expectedStarts = [10, 25, 40, 55, 70] // in minutes
    const actualStarts = slots.map((s) => s.range.start / 60000)

    assert.deepEqual(actualStarts, expectedStarts)
  })

  test('combination of appointment buffer and slot request buffer', () => {
    const workingHours: IWorkingHours[] = [{ assessorId: 'A1', ranges: [range(0, 120)] }]

    const appointments: IAppointment[] = [
      {
        assessorId: 'A1',
        range: range(30, 60),
        bufferBeforeMs: minutes(5),
        bufferAfterMs: minutes(10),
        // The appointment blocks 25-70
      },
    ]

    const engine = new TimeSlotEngine(workingHours, appointments)

    const slots = engine.calculateSlots({
      duration: minutes(15),
      interval: minutes(15),
      bufferBeforeMs: minutes(10),
      bufferAfterMs: minutes(10),
    })

    // Slot buffer further restricts slot placement
    const expected = [
      [80, 95],
      [95, 110],
    ].map(([s, e]) => [minutes(s), minutes(e)])

    assert.deepEqual(
      slots.map((s) => [s.range.start, s.range.end]),
      expected,
    )
  })

  test('slot buffer respects working hours boundaries', () => {
    const workingHours: IWorkingHours[] = [{ assessorId: 'A1', ranges: [range(0, 120)] }]

    const engine = new TimeSlotEngine(workingHours, [])

    const slots = engine.calculateSlots({
      duration: minutes(30),
      interval: minutes(15),
      bufferAfterMs: minutes(20), // cannot extend past 120
    })

    const expectedEnds = [30, 45, 60, 75, 90] // last slot end + buffer <= 120
    const actualEnds = slots.map((s) => s.range.end / 60000)

    assert.deepEqual(actualEnds, expectedEnds)
  })
})
