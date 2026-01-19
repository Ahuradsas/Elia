import { container, ControllerMetadataStore, IConstructor } from '@wabot-dev/framework'
import { IYCloudWhatsAppChatChannelConfig } from './IYCloudWhatsAppChatChannelConfig'
import { YCloudWhatsAppChatChannel } from './YCloudWhatsAppChatChannel'
import { YCloudWhatsAppChatChannelConfig } from './YCloudWhatsAppChatChannelConfig'

export function whatsAppByYCloud(config?: IYCloudWhatsAppChatChannelConfig | string) {
  return function (target: object, propertyKey: string | symbol) {
    const store = container.resolve(ControllerMetadataStore)
    store.saveChannelMetadata({
      channelConstructor: YCloudWhatsAppChatChannel,
      functionName: propertyKey.toString(),
      controllerConstructor: target.constructor as IConstructor<any>,
      channelConfig:
        typeof config === 'string'
          ? new YCloudWhatsAppChatChannelConfig(config, 'incoming', undefined, undefined)
          : new YCloudWhatsAppChatChannelConfig(
              config?.number,
              config?.direction ?? 'incoming',
              config?.webhook,
              config?.apiKey,
            ),
    })
  }
}
