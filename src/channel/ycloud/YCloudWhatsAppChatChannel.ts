import {
  Env,
  IChannelMessage,
  IChatChannel,
  IChatConnection,
  injectable,
} from '@wabot-dev/framework'
import { YCloudWhatsAppChatChannelConfig } from './YCloudWhatsAppChatChannelConfig'
import { listenYCloudWebhook } from './ycloud-webhook-controller'

@injectable()
export class YCloudWhatsAppChatChannel implements IChatChannel {
  private listener: null | ((received: IChannelMessage) => void) = null
  private apiKey: string

  static channelName = 'YCloudWhatsAppChatChannel'

  constructor(
    private config: YCloudWhatsAppChatChannelConfig,
    private env: Env,
  ) {
    this.apiKey = config.apiKey ?? env.requireString('YCLOUD_API_KEY')
  }

  listen(callback: (received: IChannelMessage) => void): void {
    this.listener = callback
  }

  connect(): void {
    listenYCloudWebhook(this.config.webhook ?? '/ycloud/webhook', (event) => {
      if (!this.listener) return
      const direction = this.config.direction ?? 'incoming'

      if (direction === 'incoming') {
        if (event.type !== 'whatsapp.inbound_message.received') return
        if (event.whatsappInboundMessage.to !== this.config.number) return

        const chatConnection: IChatConnection = {
          id: event.whatsappInboundMessage.from,
          channelName: YCloudWhatsAppChatChannel.channelName,
          chatType: 'PRIVATE',
        }

        this.listener({
          chatConnection,
          message: {
            text: event.whatsappInboundMessage.text?.body,
          },
          reply: (repplyMessage) => {
            console.log(repplyMessage)
          },
        })
      } else if (direction === 'outgoing') {
        if (event.type !== 'whatsapp.message.updated') return
        if (event.whatsappMessage.status !== 'delivered') return
        if (event.whatsappMessage.from !== this.config.number) return

        const chatConnection: IChatConnection = {
          id: event.whatsappMessage.to,
          channelName: YCloudWhatsAppChatChannel.channelName,
          chatType: 'PRIVATE',
        }

        this.listener({
          chatConnection,
          message: {
            text: event.whatsappMessage.text?.body,
          },
          reply: (repplyMessage) => {
            console.log(repplyMessage)
          },
        })
      }
    })
  }
}
