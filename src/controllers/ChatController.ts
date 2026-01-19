import { whatsAppByYCloud, YCloudWhatsAppChatChannel } from '@/channel'
import { NailHomeSchedulerMindset } from '@/mindsets/NailHomeSchedulerMindset'
import { BotConfigRepository } from '@/repository/BotConfigRepository'
import {
  Chat,
  chatBot,
  ChatBot,
  chatController,
  cmd,
  type IReceivedMessage,
} from '@wabot-dev/framework'

@chatController()
export class ChatController {
  constructor(
    @chatBot(NailHomeSchedulerMindset) private homeSchedulerBot: ChatBot,
    private botConfigRepository: BotConfigRepository,
    private chat: Chat,
  ) {}

  @cmd()
  @whatsAppByYCloud()
  async onMessage(context: IReceivedMessage) {
    const config = await this.botConfigRepository.findOrThrow()
    const connection = this.chat.connections.find(
      (x) => x.channelName === YCloudWhatsAppChatChannel.channelName,
    )

    if (!config.isOn && (!connection || !config.testNumbers.includes(connection.id))) return

    console.log('*********** Incoming ****************')
    console.log(context.message)
    console.log(connection)
    console.log('***************************')

    this.homeSchedulerBot.sendMessage(context.message, (replyMessage) => {
      context.reply({ ...replyMessage, text: replyMessage.text?.replaceAll('**', '*') })
    })
  }

  @whatsAppByYCloud({ direction: 'outgoing' })
  onOutgoingMessage(context: IReceivedMessage) {
    console.log('*********** OutGoing ****************')
    console.log(context.message)
    console.log('***************************')
  }
}
