import { YCloudWhatsAppChatChannel } from '@/channel'
import { Client } from '@/entity/Client'
import { ClientRepository } from '@/repository/ClientRepository'
import {
  Chat,
  ChatRepository,
  description,
  isOptional,
  isString,
  mindsetModule,
} from '@wabot-dev/framework'

/** Request classes for ClientModule */
export class UpdateClientReq {
  @isString()
  @description('Nombre completo de la clienta')
  name!: string

  @isString()
  @description('Número de teléfono de la clienta (clave para identificarla)')
  phone!: string

  @isString()
  @description('Dirección donde se realizará el servicio. Opcional si ya está registrada')
  @isOptional()
  address?: string

  @isString()
  @description('Zona o barrio de la dirección. Útil para logística')
  @isOptional()
  zone?: string
}

@mindsetModule()
export class ClientModule {
  constructor(
    private clientRepository: ClientRepository,
    private chat: Chat,
    private chatRepository: ChatRepository,
  ) {}

  @description('Create or update client profile with basic info')
  async upsertClient(req: UpdateClientReq): Promise<Client> {
    let clientId = this.chat.getAssociationsByType('Client').at(0)?.id
    let client = clientId ? await this.clientRepository.findOrThrow(clientId) : null

    if (!client) {
      client = new Client({ phone: req.phone, name: req.name })
      await this.clientRepository.create(client)
      this.chat.addAssociation({ type: 'Client', id: client.id })
      await (this.chatRepository as any).update(this.chat)
    }

    if (req.name) client.setName(req.name)
    if (req.address) client.setAddress(req.address, req.zone)

    await this.clientRepository.update(client)
    return client
  }

  @description('read the actual info saved of the client, return null if client not found')
  async getCurrentClientInfo(): Promise<Client | null> {
    let clientId = this.chat.getAssociationsByType('Client').at(0)?.id
    let client = clientId ? await this.clientRepository.findOrThrow(clientId) : null
    return client
  }

  @description('read the phone of user')
  async getUserPhone(): Promise<string | null> {
    const whatsApp = this.chat.connections.find((x) => x.channelName === YCloudWhatsAppChatChannel.channelName)?.id
    return whatsApp ?? null
  }
}
