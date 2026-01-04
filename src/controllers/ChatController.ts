import { NailHomeSchedulerMindset } from '@/mindsets/NailHomeSchedulerMindset'
import { chatBot, ChatBot, chatController, cmd, whatsApp, type IReceivedMessage } from '@wabot-dev/framework'

@chatController()
export class ChatController {
  constructor(@chatBot(NailHomeSchedulerMindset) private homeSchedulerBot: ChatBot) {}

  @cmd()
  @whatsApp('573134336124')
  onMessage(context: IReceivedMessage) {
    this.homeSchedulerBot.sendMessage(context.message, (replyMessage) => {
      context.reply({...replyMessage, text: replyMessage.text?.replaceAll('**', '*')})
    })
  }
}
