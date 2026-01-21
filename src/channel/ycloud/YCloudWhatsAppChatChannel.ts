import {
  Env,
  IChannelMessage,
  IChatChannel,
  IChatConnection,
  injectable,
  Logger,
} from '@wabot-dev/framework'
import { YCloudApi } from './YCloudApi'
import { YCloudWhatsAppChatChannelConfig } from './YCloudWhatsAppChatChannelConfig'
import { listenYCloudWebhook } from './ycloud-webhook-controller'

@injectable()
export class YCloudWhatsAppChatChannel implements IChatChannel {
  private listener: null | ((received: IChannelMessage) => Promise<void>) = null
  private apiKey: string
  private api: YCloudApi
  private logger = new Logger('wabot:ycloud-whatsapp-chat-channel')

  static channelName = 'YCloudWhatsAppChatChannel'

  constructor(
    private config: YCloudWhatsAppChatChannelConfig,
    private env: Env,
  ) {
    this.apiKey = config.apiKey ?? env.requireString('YCLOUD_API_KEY')
    this.api = new YCloudApi(this.apiKey)
  }

  listen(callback: (received: IChannelMessage) => Promise<void>): void {
    this.listener = callback
  }

  connect(): void {
    listenYCloudWebhook(this.config.webhook ?? '/ycloud/webhook', async (event) => {
      if (!this.listener) return
      const direction = this.config.direction ?? 'incoming'

      if (direction === 'incoming') {
        if (event.type !== 'whatsapp.inbound_message.received') return
        if (this.config.number != null && event.whatsappInboundMessage.to !== this.config.number)
          return

        const chatConnection: IChatConnection = {
          id: event.whatsappInboundMessage.from,
          channelName: YCloudWhatsAppChatChannel.channelName,
          chatType: 'PRIVATE',
        }

        await this.listener({
          chatConnection,
          message: {
            text: event.whatsappInboundMessage.text?.body,
          },
          reply: async (repplyMessage) => {
            if (!repplyMessage.text) {
              this.logger.warn('Reply message has no text content')
              return
            }

            try {
              const response = await this.api.sendTextMessage(
                event.whatsappInboundMessage.to,
                event.whatsappInboundMessage.from,
                repplyMessage.text,
              )
              this.logger.info('Message sent successfully:', response.id)
              if (response.wamid) return { wbmid: response.wamid }
            } catch (error) {
              this.logger.error('Failed to send reply message:', error)
              throw error
            }
          },
        })
      } else if (direction === 'outgoing') {
        if (event.type !== 'whatsapp.message.updated') return
        if (event.whatsappMessage.status !== 'delivered') return
        if (this.config.number != null && event.whatsappMessage.from !== this.config.number) return

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
          reply: async (repplyMessage) => {
            if (!repplyMessage.text) {
              this.logger.warn('Reply message has no text content')
              return
            }

            try {
              const response = await this.api.sendTextMessage(
                event.whatsappMessage.from,
                event.whatsappMessage.to,
                repplyMessage.text,
              )
              this.logger.info('Message sent successfully:', response.id)
              if (response.wamid) return { wbmid: response.wamid }
            } catch (error) {
              this.logger.error('Failed to send reply message:', error)
              throw error
            }
          },
        })
      }
    })
  }
}
