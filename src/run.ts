import {
  ChatAdapter,
  ChatRepository,
  container,
  PgChatRepository,
  runChatControllers,
  Env,
  OpenaiChatAdapter,
  runCronHandlers,
  JobRepository,
  PgJobRepository,
  CronJobRepository,
  PgCronJobRepository,
  Locker,
  PgLocker,
} from '@wabot-dev/framework'
import { ChatController } from './controllers/ChatController'
import { Pool } from 'pg'
import { AgendaSlotGenerator } from './cron/AgendaSlotGenerator'
const env = container.resolve(Env)

container.registerInstance(Pool, new Pool({ connectionString: env.requireString('DATABASE_URL') }))
container.registerType(Locker, PgLocker)

container.registerType(ChatAdapter, OpenaiChatAdapter)
container.registerType(ChatRepository, PgChatRepository)

container.registerType(JobRepository, PgJobRepository)
container.registerType(CronJobRepository, PgCronJobRepository)

runChatControllers([ChatController])
runCronHandlers([AgendaSlotGenerator])
