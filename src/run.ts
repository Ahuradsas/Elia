import {
  ChatAdapter,
  ChatRepository,
  container,
  CronJobRepository,
  Env,
  JobRepository,
  Locker,
  OpenaiChatAdapter,
  PgChatRepository,
  PgCronJobRepository,
  PgJobRepository,
  PgLocker,
  runChatControllers,
  runRestControllers,
  WhatsAppReceiver,
  WhatsAppReceiverByWabotProxy,
  WhatsAppSender,
  WhatsAppSenderByWabotProxy,
} from '@wabot-dev/framework'
import { Pool } from 'pg'
import { ChatController } from './controllers/ChatController'

import { ReadyController } from './controllers/ReadyController'
import { EliaBusinessId, EliaBusinessTz, EliaPool } from './elia-injection'
const env = container.resolve(Env)

container.registerInstance(Pool, new Pool({ connectionString: env.requireString('DATABASE_URL') }))
container.registerType(Locker, PgLocker)

container.registerType(ChatAdapter, OpenaiChatAdapter)
container.registerType(ChatRepository, PgChatRepository)

container.registerType(JobRepository, PgJobRepository)
container.registerType(CronJobRepository, PgCronJobRepository)

container.registerType(WhatsAppReceiver, WhatsAppReceiverByWabotProxy)
container.registerType(WhatsAppSender, WhatsAppSenderByWabotProxy)

container.register(EliaBusinessId, { useValue: env.requireString('ELIA_BUSINESS_ID') })
container.register(EliaBusinessTz, { useValue: env.requireString('ELIA_BUSINESS_TZ') })
container.register(EliaPool, {
  useValue: new Pool({ connectionString: env.requireString('ELIA_DATABASE_URL') }),
})

runRestControllers([ReadyController])
runChatControllers([ChatController])
