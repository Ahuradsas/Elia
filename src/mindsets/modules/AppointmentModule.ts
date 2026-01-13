import { Appointment } from '@/entity/Appointment'
import { AppointmentRepository } from '@/repository/AppointmentRepository'
import { Chat, description, isNumber, isString, mindsetModule } from '@wabot-dev/framework'

/** Request classes for AppointmentModule */
export class ScheduleAppointmentReq {
  @isString()
  @description('ID del servicio que se desea reservar')
  serviceId!: string

  @isString()
  @description('Nombre del servicio')
  serviceName!: string

  @isString()
  @description('ID del staff responsable del servicio')
  teamMemberId!: string

  @isString()
  @description('Dirección donde se realizará el servicio')
  address!: string

  @isString()
  @description('Barrio o zona donde se realizará el servicio')
  zone!: string

  @isNumber()
  @description('Fecha y hora programada para la cita (timestamp ms)')
  scheduledAt!: number

  @isNumber()
  @description('Fecha y hora de finalización para la cita (timestamp ms)')
  scheduledEndAt!: number
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
      serviceName: req.serviceName,
      teamMemberId: req.teamMemberId,
      address: req.address,
      zone: req.zone,
      scheduledAt: req.scheduledAt,
      scheduledEndAt: req.scheduledEndAt,
      status: 'pending',
    })

    await this.appointmentRepository.create(appointment)
    return appointment
  }

  // @description('Cancel an appointment')
  // async cancelAppointment(req: AppointmentIdReq): Promise<Appointment> {
  //   const appointment = await this.appointmentRepository.find(req.appointmentId)
  //   if (!appointment) throw new Error(`Appointment ${req.appointmentId} not found`)
  //   appointment.cancel()
  //   await this.appointmentRepository.update(appointment)
  //   return appointment
  // }
}
