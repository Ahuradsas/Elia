export function getTimeZoneOffset(timeZone: string, date: Date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    timeZoneName: 'shortOffset',
  }).formatToParts(date)

  const tzPart = parts.find((p) => p.type === 'timeZoneName')?.value // e.g. "GMT+05:30"

  if (!tzPart || tzPart === 'GMT') {
    return { hours: 0, minutes: 0 }
  }

  const match = tzPart.match(/GMT([+-]\d{1,2})(?::(\d{2}))?/)
  if (!match) {
    throw new Error(`Unable to parse offset: ${tzPart}`)
  }

  const hours = Number(match[1])
  const minutes = Number(match[2] ?? 0)

  return { hours, minutes }
}
