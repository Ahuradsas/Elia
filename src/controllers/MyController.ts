import { MyMindset } from '@/mindsets/MyMindset'
import { chatBot, ChatBot, chatController, cmd, type IReceivedMessage } from '@wabot-dev/framework'

@chatController()
export class MyController {
  constructor(@chatBot(MyMindset) private myBot: ChatBot) {}

  @cmd()
  onMessage(context: IReceivedMessage) {
    this.myBot.sendMessage(context.message, (replyMessage) => {
      context.reply(replyMessage)
    })
  }
}
