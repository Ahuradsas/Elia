import {
  ChatAdapter,
  ChatRepository,
  container,
  PgChatRepository,
  runChatControllers,
  Env,
  OpenaiChatAdapter,
} from '@wabot-dev/framework'
import { MyController } from './controllers/MyController'
import { Pool } from 'pg'
const env = container.resolve(Env)

container.registerInstance(Pool, new Pool({ connectionString: env.requireString('DATABASE_URL') }))

container.registerType(ChatAdapter, OpenaiChatAdapter)
container.registerType(ChatRepository, PgChatRepository)
runChatControllers([MyController])
