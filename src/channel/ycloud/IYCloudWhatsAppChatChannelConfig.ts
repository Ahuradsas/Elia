export interface IYCloudWhatsAppChatChannelConfig {
  webhook?: string
  direction?: 'incoming' | 'outgoing'
  apiKey?: string
  number: string
}
