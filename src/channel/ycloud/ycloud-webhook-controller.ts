import {
  isPresent,
  Logger,
  onPost,
  restController,
  RestRequest,
  runRestControllers,
} from '@wabot-dev/framework'
import { type IYCloudWhatsAppEvent } from './ycloud-whatsapp-events'

const ycloudWebhooksControllers = new Map<string, Function>()

class YCloudWebhookReq extends RestRequest {
  @isPresent()
  body!: IYCloudWhatsAppEvent
}

export function resolveYcloudWebhookController(path: string) {
  const existing = ycloudWebhooksControllers.get(path)
  if (existing) return existing

  @restController(path)
  class YcloudWebhookController {
    private logger = new Logger('wabot:ycloud-webhook-controller')

    @onPost()
    handleEvent(req: YCloudWebhookReq) {
      this.logger.debug(JSON.stringify(req.body))
    }
  }

  ycloudWebhooksControllers.set(path, YcloudWebhookController)

  runRestControllers([YcloudWebhookController])

  return YcloudWebhookController
}
