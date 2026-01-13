import { TeamMember } from '@/entity/TeamMember'

export class TeamMemberRepository {
  findAll(): Promise<TeamMember[]> {
    throw new Error('Not implemented')
  }

  findAllActive(): Promise<TeamMember[]> {
    throw new Error('Not implemented')
  }

  findAllActiveByServiceId(serviceId: string): Promise<TeamMember[]> {
    throw new Error('Not implemented')
  }
}
