import { whatsAppByYCloud } from '@/channel'
import { NailHomeSchedulerMindset } from '@/mindsets/NailHomeSchedulerMindset'
import { chatBot, ChatBot, chatController, cmd, type IReceivedMessage } from '@wabot-dev/framework'

@chatController()
export class ChatController {
  constructor(@chatBot(NailHomeSchedulerMindset) private homeSchedulerBot: ChatBot) {}

  @cmd()
  //@whatsApp('573134336124')
  @whatsAppByYCloud('+573018724155')
  onMessage(context: IReceivedMessage) {
    console.log('********* Incoming ******************')
    console.log(context.message)
    console.log('***************************')
    this.homeSchedulerBot.sendMessage(context.message, (replyMessage) => {
      //context.reply({...replyMessage, text: replyMessage.text?.replaceAll('**', '*')})
      console.log('********* Reply ******************')
      console.log(replyMessage)
      console.log('***************************')
    })
  }

  @whatsAppByYCloud({ number: '+573018724155', direction: 'outgoing' })
  onOutgoingMessage(context: IReceivedMessage) {
    console.log('*********** OutGoing ****************')
    console.log(context.message)
    console.log('***************************')
  }
}
