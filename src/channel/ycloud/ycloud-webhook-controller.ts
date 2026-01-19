import {
  isPresent,
  Logger,
  onPost,
  restController,
  RestRequest,
  runRestControllers,
} from '@wabot-dev/framework'
import { type IYCloudWhatsAppEvent } from './ycloud-webhook-events'

export type IYCloudEventListener = (event: IYCloudWhatsAppEvent) => void | Promise<void>

interface IYCloudWebhookControllerPack {
  listeners: IYCloudEventListener[]
}

const webhooksControllersPacks = new Map<string, IYCloudWebhookControllerPack>()

class YCloudWebhookReq extends RestRequest {
  @isPresent()
  body!: IYCloudWhatsAppEvent
}

export function listenYCloudWebhook(path: string, listener: IYCloudEventListener) {
  const existing = webhooksControllersPacks.get(path)
  if (existing) {
    existing.listeners.push(listener)
    return
  }

  const pack: IYCloudWebhookControllerPack = {
    listeners: [listener],
  }

  webhooksControllersPacks.set(path, pack)

  @restController(path)
  class YCloudWebhookController {
    private logger = new Logger('wabot:ycloud-webhook-controller')

    @onPost()
    async handleEvent(req: YCloudWebhookReq) {
      this.logger.debug(`received event ${req.body.type}`)
      await Promise.allSettled(pack.listeners.map((l) => l(req.body)))
    }
  }

  runRestControllers([YCloudWebhookController])
}
