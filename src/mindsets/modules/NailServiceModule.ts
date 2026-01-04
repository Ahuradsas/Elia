import { NailService } from '@/entity/NailService'
import { NailServiceRepository } from '@/repository/NailServiceRepository'
import { description, isString, mindsetModule } from '@wabot-dev/framework'

/** Request classes for NailServiceModule */
export class GetServiceByIdReq {
  @isString()
  @description('ID del servicio de uñas que se desea consultar')
  serviceId!: string
}

@mindsetModule()
export class NailServiceModule {
  constructor(private nailServiceRepository: NailServiceRepository) {}

  @description('Fetch all active nail services for the client')
  async getActiveServices(): Promise<NailService[]> {
    return this.nailServiceRepository.findActive()
  }

  @description('Fetch a specific nail service by ID')
  async getServiceById(req: GetServiceByIdReq): Promise<NailService | null> {
    return this.nailServiceRepository.find(req.serviceId)
  }
}
