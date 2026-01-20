import { Entity, IEntityData } from '@wabot-dev/framework'

export interface ITeamMemberWorkingHoursData extends IEntityData {
  teamMemberId: string
  dayOfWeek: number
  ranges: { startHour: number; startMinute: number; endHour: number; endMinute: number }[]
}

export class TeamMemberWorkingHours extends Entity<ITeamMemberWorkingHoursData> {
  get teamMemberId() {
    return this.data.teamMemberId
  }

  get dayOfWeek() {
    return this.data.dayOfWeek
  }

  get ranges() {
    return this.data.ranges
  }
}
