import test, { describe } from 'node:test'
import assert from 'node:assert/strict'
import { addCompleteDays } from './addCompleteDays'

describe(addCompleteDays.name, () => {
  test('adds complete days produce result at end of the day', () => {
    const start = new Date('2025-01-10T12:00:00Z')
    const result = addCompleteDays(start, 5, 'America/Bogota')

    assert.equal(result.toISOString(), '2025-01-15T05:00:00.000Z')
  })

  test('adds complete zero days produce result at end of the day', () => {
    const start = new Date('2025-04-20T12:00:00Z')
    const result = addCompleteDays(start, 0, 'UTC')

    assert.equal(result.toISOString(), '2025-04-21T00:00:00.000Z')
  })
})
