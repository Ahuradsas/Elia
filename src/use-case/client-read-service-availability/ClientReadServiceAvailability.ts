import { TeamMemberRepository } from '@/repository/TeamMemberRepository'
import { injectable } from '@wabot-dev/framework'

@injectable()
export class ClientReadServiceAvailability {
  constructor(private teamMemberRepository: TeamMemberRepository) {}
}
