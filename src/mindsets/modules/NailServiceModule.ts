import { Service } from '@/entity/Service'
import { ServiceRepository } from '@/repository/ServiceRepository'
import { description, isString, mindsetModule } from '@wabot-dev/framework'

/** Request classes for NailServiceModule */
export class GetServiceByIdReq {
  @isString()
  @description('ID del servicio de uñas que se desea consultar')
  serviceId!: string
}

@mindsetModule()
export class NailServiceModule {
  constructor(private nailServiceRepository: ServiceRepository) {}

  @description('Fetch all active nail services for the client')
  async getActiveServices(): Promise<Service[]> {
    return this.nailServiceRepository.findActive()
  }

  @description('Fetch a specific nail service by ID')
  async getServiceById(req: GetServiceByIdReq): Promise<Service | null> {
    return this.nailServiceRepository.find(req.serviceId)
  }
}
