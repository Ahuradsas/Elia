import { onGet, restController } from '@wabot-dev/framework'

@restController('/ready')
export class ReadyController {
  @onGet()
  ready() {
    return 'OK'
  }
}
