# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **conversational AI scheduling bot** for a nail salon (Edglam) built on WhatsApp using the `@wabot-dev/framework`. The bot helps customers check service availability, book appointments, and manage their bookings by integrating with an external business management system called **Elia**.

## Common Commands

### Development
```bash
npm run dev           # Run in development mode with hot reload
npm run build         # Type check and build for production
npm start             # Run production build
npm run tsc           # Type check only (no build)
npm run fmt           # Format all files with Prettier
```

### Testing
```bash
npm run test:unit     # Run all unit tests (files matching *.unit.test.ts)
```

To run a single test file:
```bash
node --import @yucacodes/ts --test './src/path/to/file.unit.test.ts'
```

## Architecture Overview

### Layered Architecture

The codebase follows **clean architecture** principles with clear separation:

```
Controllers (Presentation)
    ↓
Mindsets + Modules (Conversational AI)
    ↓
Application Services (Use Cases)
    ↓
Domain Logic (Business Rules)
    ↓
Repositories (Data Access)
```

### Key Architectural Concepts

#### 1. Dual Database Architecture

The application uses **two separate databases**:

- **Wabot Database** (`DATABASE_URL`): Stores chat history, conversation state, jobs
- **Elia Database** (`ELIA_DATABASE_URL`): External business management system with clients, services, appointments, team members

All repositories connect to the Elia database and automatically scope queries by `ELIA_BUSINESS_ID` for multi-tenancy.

#### 2. Mindset-Driven Conversational AI

The bot's behavior is defined by the `NailHomeSchedulerMindset` which declares:
- **Identity**: Bot personality and role
- **Skills**: What the bot can do
- **Limits**: What the bot cannot/should not do
- **Workflow**: Step-by-step conversation flow
- **Modules**: Groups of related functions exposed as LLM tools

**How it works:**
1. User sends WhatsApp message → `ChatController`
2. `ChatBot` (injected with mindset) sends message + available tools to LLM
3. LLM decides to call a function (e.g., `findAvailableSlots`)
4. `MindsetOperator` routes call to the appropriate module method
5. Module executes business logic and returns result to LLM
6. LLM formulates natural language response
7. Bot sends reply via WhatsApp

#### 3. The @wabot-dev/framework

This framework provides:
- **Dependency injection** (`container`, `@singleton()`, `@inject()`)
- **Conversational AI primitives** (`@mindset()`, `@mindsetModule()`, `ChatBot`, `MindsetOperator`)
- **Multi-channel support** (WhatsApp, Telegram, Socket, CLI)
- **LLM adapters** (OpenAI, Anthropic, Google, DeepSeek)
- **Repository pattern** (`PgCrudRepository`, transaction helpers)
- **Job system** (`@command()`, `@cron()`)
- **Controllers** (`@chatController()`, `@restController()`)
- **Validation** (`@isString()`, `@isNumber()`, etc.)

### Directory Structure

- **`src/controllers/`**: Handle incoming messages and REST requests
- **`src/mindsets/`**: Bot personality and conversation workflow
- **`src/mindsets/modules/`**: Function modules exposed as LLM tools
- **`src/application/`**: Use cases that orchestrate domain logic
- **`src/domain/calendar/`**: Pure business logic for scheduling calculations
- **`src/entity/`**: Domain entities (Client, Service, Appointment, etc.)
- **`src/repository/`**: Data access layer for Elia database
- **`src/use-case/`**: Alternative location for use cases (legacy)

## Domain Logic: Calendar/Scheduling

The scheduling system is the most complex part of the codebase. It calculates available appointment slots by:

### 1. Work Slots Calculation (`WorkSlotsCalculator`)

**Purpose**: Determine when the business is open

**Process**:
- Takes weekly work hours (e.g., Mon-Fri 9am-5pm)
- Considers business timezone (`ELIA_BUSINESS_TZ`)
- Generates UTC time ranges for all open hours
- Handles special days/holidays if configured

### 2. Available Slots Calculation (`AvailableSlotsCalculator`)

**Purpose**: Find bookable time slots accounting for existing appointments

**Algorithm**:
1. Get work slots for each team member
2. Fetch existing appointments with buffer times
3. Subtract booked ranges from work ranges → free ranges
4. Generate sliding time slots at specified intervals
5. Ensure each slot has required buffer before/after

**Key Innovation**: Range subtraction algorithm handles overlapping appointments elegantly.

### 3. Time Zone Handling

**Critical**: All times are stored in UTC milliseconds, but calculations must respect the business timezone.

**Helper functions**:
- `getTimeZoneOffset()`: Get GMT offset for a timezone at a specific date
- `getDatePartsInTimeZone()`: Decompose Date into parts in a specific timezone
- `addCompleteDays()`: Add complete days handling DST transitions

**Pattern**:
1. Convert UTC → Business timezone
2. Perform calendar calculations
3. Convert back to UTC

## Elia Integration

### What is Elia?

Elia is an external business management system that owns the master data. This bot is a **read-heavy integration** that:
- Reads business configuration (services, hours, team members)
- Reads and writes client data
- Reads and writes appointments

### Repository Pattern

All repositories:
1. Inject `EliaPool` (database connection)
2. Inject `EliaBusinessId` (for multi-tenancy scoping)
3. Inject `EliaBusinessTz` (for timezone conversions)
4. Automatically scope all queries by `business_id`

**Example**:
```typescript
@singleton()
export class ServiceRepository {
  constructor(
    @inject(EliaPool) private pool: Pool,
    @inject(EliaBusinessId) private businessId: string,
  ) {}

  async findAll() {
    // business_id automatically included
    return this.query('SELECT * FROM services WHERE business_id = $1', [this.businessId])
  }
}
```

### Elia Database Tables

- **`clients`**: Customer records
- **`services`**: Service catalog (with duration, price)
- **`team_members`**: Staff who perform services
- **`business_working_hours`**: Weekly schedule configuration
- **`appointments`**: Scheduled appointments

## Dependency Injection

The application uses `tsyringe` for DI. Configuration happens in `src/run.ts`:

```typescript
// Database connections
container.registerInstance(Pool, new Pool({ connectionString: env.requireString('DATABASE_URL') }))
container.register(EliaPool, { useValue: new Pool({ connectionString: env.requireString('ELIA_DATABASE_URL') })})

// Implementations
container.registerType(ChatAdapter, OpenaiChatAdapter)
container.registerType(WhatsAppSender, WhatsAppSenderByWabotProxy)
container.registerType(WhatsAppReceiver, WhatsAppReceiverByWabotProxy)

// Business configuration
container.register(EliaBusinessId, { useValue: env.requireString('ELIA_BUSINESS_ID') })
container.register(EliaBusinessTz, { useValue: env.requireString('ELIA_BUSINESS_TZ') })
```

**Usage in classes**:
```typescript
@singleton()
export class MyService {
  constructor(
    @inject(EliaPool) private pool: Pool,
    private someRepository: SomeRepository, // Auto-injected
  ) {}
}
```

## Environment Variables

Required variables (see `.env.example`):
- `DATABASE_URL`: Main wabot database connection string
- `ELIA_DATABASE_URL`: Elia business system database
- `ELIA_BUSINESS_ID`: Business identifier for multi-tenancy
- `ELIA_BUSINESS_TZ`: Business timezone (e.g., "America/Bogota")
- `OPENAI_API_KEY`: OpenAI API key for LLM
- `WABOT_PROXY_*`: WhatsApp connection credentials

## Key Files Reference

### Entry Point
- `src/run.ts`: Application bootstrap and DI configuration

### Controllers
- `src/controllers/ChatController.ts`: WhatsApp message handler
- `src/controllers/ReadyController.ts`: Health check endpoint

### Mindset
- `src/mindsets/NailHomeSchedulerMindset.ts`: Bot personality and workflow
- `src/mindsets/modules/AgendaModule.ts`: Availability checking functions
- `src/mindsets/modules/AppointmentModule.ts`: Booking management functions
- `src/mindsets/modules/ClientModule.ts`: Client management functions
- `src/mindsets/modules/NailServiceModule.ts`: Service catalog functions

### Domain Logic
- `src/domain/calendar/WorkSlotsCalculator.ts`: Business hours calculation
- `src/domain/calendar/AvailableSlotsCalculator.ts`: Available slot finder
- `src/domain/calendar/getTimeZoneOffset.ts`: Timezone offset helper
- `src/domain/calendar/getDatePartsInTimeZone.ts`: Timezone date decomposition

### Application Layer
- `src/application/ReadServiceAvailableSlots.ts`: Main scheduling use case

### Repositories
- `src/repository/ClientRepository.ts`: Client data access
- `src/repository/ServiceRepository.ts`: Service catalog access
- `src/repository/AppointmentRepository.ts`: Appointment persistence
- `src/repository/TeamMemberRepository.ts`: Team member data
- `src/repository/DayOfWeekWorkHoursRepository.ts`: Business hours config

## Testing Strategy

### Unit Tests
- Located alongside source files with `.unit.test.ts` suffix
- Focus on domain logic (calculators, pure functions)
- Use Node.js built-in test runner
- Examples: `AvailableSlotsCalculator.unit.test.ts`, `WorkSlotsCalculator.unit.test.ts`

### What to Test
- **Domain logic**: Calculators, range operations, timezone conversions
- **Complex algorithms**: Slot generation, appointment conflict detection
- **Edge cases**: DST transitions, overlapping appointments, boundary conditions

### What NOT to Test
- Framework decorators and DI
- Simple CRUD repositories (integration test territory)
- LLM responses (non-deterministic)

## Important Patterns

### Adding a New Function to the Bot

1. Create/update a mindset module in `src/mindsets/modules/`
2. Define a request class with decorated properties for parameters
3. Add method with `@description()` decorator that receives the request object as `argument`
4. Inject required repositories/services
5. Register module in `NailHomeSchedulerMindset.modules`

**Example**:
```typescript
// Define request class with decorated properties
export class MyFunctionReq {
  @isString()
  @description('Parameter description')
  param!: string

  @isNumber()
  @description('Another parameter')
  count!: number
}

@mindsetModule()
export class ExampleModule {
  constructor(private repo: SomeRepository) {}

  @description('Brief description of what this does')
  async myFunction(argument: MyFunctionReq) {
    // Access parameters from argument object
    const { param, count } = argument
    // Implementation
    return result
  }
}
```

**Note**: Each property of the argument object must be annotated with validators (`@isString()`, `@isNumber()`, `@isDate()`, etc.) and `@description()` decorators. The framework automatically converts these into OpenAI function calling schemas.

### Working with Dates and Timezones

**Always**:
- Store dates as UTC milliseconds (`number`)
- Use `getDatePartsInTimeZone()` when decomposing dates
- Use `addCompleteDays()` instead of simple addition
- Consider DST transitions when calculating future dates
- Inject `@inject(EliaBusinessTz)` when timezone-aware logic is needed

**Never**:
- Use `Date.getHours()` or similar local methods
- Assume 24-hour days (DST exists)
- Hardcode timezone offsets

### Repository Queries

All Elia repositories must:
1. Scope by `business_id`
2. Map database column names to entity properties
3. Handle timezone conversion for date columns
4. Use parameterized queries (never string concatenation)

## TypeScript Configuration

- **Module system**: ESNext with bundler resolution
- **Decorators**: Enabled (`experimentalDecorators`, `emitDecoratorMetadata`)
- **Strict mode**: Enabled
- **Path alias**: `@/*` maps to `src/*`
