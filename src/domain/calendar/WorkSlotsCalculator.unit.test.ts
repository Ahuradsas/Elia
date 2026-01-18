import test, { describe } from 'node:test'
import assert from 'node:assert/strict'
import { WorkSlotsCalculator } from './WorkSlotsCalculator'

describe(WorkSlotsCalculator.name, () => {
  const ms = (h: number, m: number) => h * 60 * 60 * 1000 + m * 60 * 1000

  test('generates ranges for a single weekly day', () => {
    const calculator = new WorkSlotsCalculator({
      timeZone: 'UTC',
      weeklyConfig: [
        { dayOfWeek: 1, ranges: [{ startHour: 9, startMinute: 0, endHour: 17, endMinute: 0 }] }, // Monday
      ],
    })

    const start = new Date('2026-01-12') // Monday
    const end = new Date('2026-01-13')
    const result = calculator.calculate(start, end)

    assert.equal(result.length, 1)
    assert.equal(result[0].end - result[0].start, ms(8, 0))
  })

  test('handles multiple weekly days', () => {
    const calculator = new WorkSlotsCalculator({
      timeZone: 'UTC',
      weeklyConfig: [
        { dayOfWeek: 1, ranges: [{ startHour: 9, startMinute: 0, endHour: 17, endMinute: 0 }] }, // Monday
        { dayOfWeek: 2, ranges: [{ startHour: 10, startMinute: 0, endHour: 16, endMinute: 0 }] }, // Tuesday
      ],
    })

    const start = new Date('2026-01-12') // Monday
    const end = new Date('2026-01-14') // Tuesday
    const result = calculator.calculate(start, end)

    assert.deepEqual(result.length, 2)
    const [monday, tuesday] = result
    assert.deepEqual(monday.end - monday.start, ms(8, 0))
    assert.deepEqual(tuesday.end - tuesday.start, ms(6, 0))
  })

  test('special day overrides weekly config', () => {
    const calculator = new WorkSlotsCalculator({
      timeZone: 'UTC',
      weeklyConfig: [
        { dayOfWeek: 1, ranges: [{ startHour: 9, startMinute: 0, endHour: 17, endMinute: 0 }] }, // Monday
      ],
      specialDays: [
        {
          date: '2026-01-12',
          ranges: [{ startHour: 8, startMinute: 0, endHour: 12, endMinute: 0 }],
        }, // Monday override
      ],
    })

    const start = new Date('2026-01-12')
    const end = new Date('2026-01-13')
    const result = calculator.calculate(start, end)

    assert.deepEqual(result.length, 1)
    assert.deepEqual(result[0].end - result[0].start, ms(4, 0))
  })

  test('handles multiple days with special days', () => {
    const calculator = new WorkSlotsCalculator({
      timeZone: 'UTC',
      weeklyConfig: [
        { dayOfWeek: 1, ranges: [{ startHour: 9, startMinute: 0, endHour: 17, endMinute: 0 }] },
        { dayOfWeek: 2, ranges: [{ startHour: 10, startMinute: 0, endHour: 16, endMinute: 0 }] },
      ],
      specialDays: [
        {
          date: '2026-01-13',
          ranges: [{ startHour: 8, startMinute: 0, endHour: 12, endMinute: 0 }],
        },
      ],
    })

    const start = new Date('2026-01-12')
    const end = new Date('2026-01-14')
    const result = calculator.calculate(start, end)

    assert.deepEqual(result.length, 2)
    const [monday, tuesday] = result
    assert.deepEqual(monday.end - monday.start, ms(8, 0))
    assert.deepEqual(tuesday.end - tuesday.start, ms(4, 0)) // special day overrides weekly
  })

  test('produces UTC timestamps correctly in non-UTC timezone', () => {
    const calculator = new WorkSlotsCalculator({
      timeZone: 'America/New_York',
      weeklyConfig: [
        { dayOfWeek: 1, ranges: [{ startHour: 9, startMinute: 0, endHour: 17, endMinute: 0 }] }, // Monday
      ],
    })

    const start = new Date('2026-01-12')
    const end = new Date('2026-01-13')
    const result = calculator.calculate(start, end)

    // Should be in UTC timestamps
    const range = result[0]
    const startDate = new Date(range.start)
    const endDate = new Date(range.end)

    assert.equal(startDate.getUTCHours(), 14) // 9:00 EST = 14:00 UTC
    assert.equal(endDate.getUTCHours(), 22) // 17:00 EST = 22:00 UTC
  })

  test('returns empty array when no working hours', () => {
    const calculator = new WorkSlotsCalculator({
      timeZone: 'UTC',
      weeklyConfig: [],
    })

    const start = new Date('2026-01-12')
    const end = new Date('2026-01-13')
    const result = calculator.calculate(start, end)

    assert.deepEqual(result, [])
  })
})
