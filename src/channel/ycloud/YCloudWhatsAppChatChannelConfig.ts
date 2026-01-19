import { IYCloudWhatsAppChatChannelConfig } from './IYCloudWhatsAppChatChannelConfig'

export class YCloudWhatsAppChatChannelConfig implements IYCloudWhatsAppChatChannelConfig {
  constructor(
    public number: string | undefined,
    public direction: 'incoming' | 'outgoing',
    public webhook: string | undefined,
    public apiKey: string | undefined,
  ) {}
}
