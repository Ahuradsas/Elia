import { Appointment } from '@/entity/Appointment'
import type { IAppointmentStatus } from '@/entity/Appointment'
import { AppointmentRepository } from '@/repository/AppointmentRepository'
import { Chat, description, isDate, isNumber, isString, mindsetModule } from '@wabot-dev/framework'

/** Request classes for AppointmentModule */
export class ScheduleAppointmentReq {
  @isString()
  @description('ID del servicio que se desea reservar')
  serviceId!: string

  @isString()
  @description('Nombre del servicio')
  serviceName!: string

  @isNumber()
  @description('Nombre del servicio')
  servicePrice!: number

  @isString()
  @description('ID del staff responsable del servicio')
  teamMemberId!: string

  @isString()
  @description('Dirección donde se realizará el servicio')
  address!: string

  @isString()
  @description('Barrio o zona donde se realizará el servicio')
  zone!: string

  @isString()
  @description('Apuntes o información adicional para la prestación del servicio')
  notes!: string

  @isDate()
  @description('Fecha y hora programada para la cita')
  scheduledAt!: Date

  @isDate()
  @description('Fecha y hora de finalización para la cita')
  scheduledEndAt!: Date
}

export class AppointmentIdReq {
  @isString()
  @description('ID de la cita a modificar')
  appointmentId!: string
}

export class UpdateAppointmentReq {
  @isString()
  @description('ID de la cita a actualizar')
  appointmentId!: string

  @isString()
  @description('ID del servicio (opcional, solo si cambia)')
  serviceId?: string

  @isString()
  @description('Nombre del servicio (opcional, solo si cambia)')
  serviceName?: string

  @isNumber()
  @description('Precio del servicio (opcional, solo si cambia)')
  servicePrice?: number

  @isString()
  @description('ID del staff responsable del servicio (opcional, solo si cambia)')
  teamMemberId?: string

  @isString()
  @description('Dirección donde se realizará el servicio (opcional, solo si cambia)')
  address?: string

  @isString()
  @description('Barrio o zona donde se realizará el servicio (opcional, solo si cambia)')
  zone?: string

  @isString()
  @description(
    'Apuntes o información adicional para la prestación del servicio (opcional, solo si cambia)',
  )
  notes?: string

  @isDate()
  @description('Nueva fecha y hora programada para la cita (opcional, solo si cambia)')
  scheduledAt?: Date

  @isDate()
  @description('Nueva fecha y hora de finalización para la cita (opcional, solo si cambia)')
  scheduledEndAt?: Date

  @isString()
  @description('Status de la cita (opcional, solo si cambia)')
  status?: IAppointmentStatus
}

export class FindUpcomingReq {
  @isString()
  @description('ID del cliente a buscar')
  clientId!: string

  @isString()
  @description('Status de la cita a buscar')
  status?: string
}

@mindsetModule()
export class AppointmentModule {
  constructor(
    private appointmentRepository: AppointmentRepository,
    private chat: Chat,
  ) {}

  @description('Schedule a new appointment for a client')
  async scheduleAppointment(req: ScheduleAppointmentReq): Promise<Appointment> {
    const clientId = this.chat.getAssociationsByType('Client').at(0)?.id

    if (!clientId) throw new Error('Should save the client first')

    const appointment = new Appointment({
      clientId,
      serviceId: req.serviceId,
      serviceName: req.serviceName,
      servicePrice: req.servicePrice,
      notes: req.notes,
      teamMemberId: req.teamMemberId,
      address: req.address,
      zone: req.zone,
      scheduledAt: req.scheduledAt.getTime(),
      scheduledEndAt: req.scheduledEndAt.getTime(),
      status: 'pendiente',
    })

    await this.appointmentRepository.create(appointment)
    return appointment
  }

  @description(
    'Update an existing appointment. Puedes cancelar la cita cambiando el status a "cancelada". Only provide the fields that need to be changed.',
  )
  async updateAppointment(req: UpdateAppointmentReq): Promise<Appointment> {
    const appointment = await this.appointmentRepository.find(req.appointmentId)
    if (!appointment) throw new Error(`Appointment ${req.appointmentId} not found`)

    const data = appointment['data']

    if (req.serviceId !== undefined) data.serviceId = req.serviceId
    if (req.serviceName !== undefined) data.serviceName = req.serviceName
    if (req.servicePrice !== undefined) data.servicePrice = req.servicePrice
    if (req.teamMemberId !== undefined) data.teamMemberId = req.teamMemberId
    if (req.address !== undefined) data.address = req.address
    if (req.zone !== undefined) data.zone = req.zone
    if (req.notes !== undefined) data.notes = req.notes
    if (req.scheduledAt !== undefined) data.scheduledAt = req.scheduledAt.getTime()
    if (req.scheduledEndAt !== undefined) data.scheduledEndAt = req.scheduledEndAt.getTime()
    if (req.status !== undefined) data.status = req.status

    await this.appointmentRepository.update(appointment)
    return appointment
  }

  @description('Find all appointments for an user, you can filter by status')
  async findUpcoming(req: FindUpcomingReq): Promise<Appointment[]> {
    return this.appointmentRepository.findByClientId(req.clientId, req.status)
  }
}
