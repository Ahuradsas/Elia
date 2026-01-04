import { Appointment } from '@/entity/Appointment'
import { AppointmentRepository } from '@/repository/AppointmentRepository'
import { Chat, description, isNumber, isString, mindsetModule } from '@wabot-dev/framework'

/** Request classes for AppointmentModule */
export class ScheduleAppointmentReq {
  @isString()
  @description('ID del servicio de uñas que se desea reservar')
  serviceId!: string

  @isString()
  @description('ID del slot de agenda donde se realizará la cita')
  slotId!: string

  @isString()
  @description('Dirección donde se realizará el servicio')
  address!: string

  @isNumber()
  @description('Fecha y hora programada para la cita (timestamp ms)')
  scheduledAt!: number
}

export class AppointmentIdReq {
  @isString()
  @description('ID de la cita a modificar')
  appointmentId!: string
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
      slotId: req.slotId,
      address: req.address,
      scheduledAt: req.scheduledAt,
      status: 'pending',
    })

    await this.appointmentRepository.create(appointment)
    return appointment
  }

  @description('Cancel an appointment')
  async cancelAppointment(req: AppointmentIdReq): Promise<Appointment> {
    const appointment = await this.appointmentRepository.find(req.appointmentId)
    if (!appointment) throw new Error(`Appointment ${req.appointmentId} not found`)
    appointment.cancel()
    await this.appointmentRepository.update(appointment)
    return appointment
  }
}
