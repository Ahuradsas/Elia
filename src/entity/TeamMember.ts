import { Entity, IEntityData } from '@wabot-dev/framework'

export interface ITeamMemberData extends IEntityData {
  name: string
  isActive: boolean
  servicesIds: string[]
}

export class TeamMember extends Entity<ITeamMemberData> {}
