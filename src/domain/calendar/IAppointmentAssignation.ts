import { ITimeRange } from './ITimeRange'

export type IAppointmentAssignation = {
  teamMemberId: string
  range: ITimeRange
  bufferBeforeMs?: number
  bufferAfterMs?: number
}
