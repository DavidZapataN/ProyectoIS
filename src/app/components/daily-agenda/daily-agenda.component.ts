import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { IAppointmentModel } from '../../Models/IAppointmentModel';
import { PatientService } from '../../services/patient.service';
import { DatePipe } from '@angular/common';
import {
  NotificationComponent,
  NotificationType,
} from '../notification/notification.component';
import { IPatientModel } from '../../Models/IPatientModel';

@Component({
  selector: 'daily-agenda',
  standalone: true,
  imports: [DatePipe, NotificationComponent],
  templateUrl: './daily-agenda.component.html',
  styleUrl: './daily-agenda.component.scss',
})
export class DailyAgendaComponent implements OnInit {
  private patientService = inject(PatientService);

  @Output() close = new EventEmitter<void>();
  @Output() updatePatientAppointments = new EventEmitter<IPatientModel>();

  appointments: IAppointmentModel[] = [];
  now = new Date();

  NotificationType = NotificationType.Info;
  message: string = '';
  isNotification: boolean = false;

  ngOnInit(): void {
    const allAppointments = this.patientService.getAllAppointments();

    this.patientService.orderByDateAsc(allAppointments);

    console.log(allAppointments);

    this.filterTodayAppointments(allAppointments);
  }

  filterTodayAppointments(allAppointments: IAppointmentModel[]) {
    this.appointments = allAppointments.filter((appointment) => {
      const appointmentDate = new Date(appointment.date);

      const isSameDay =
        this.now.toDateString() === appointmentDate.toDateString();

      const isAfterNow = appointmentDate.getTime() > this.now.getTime();

      return isSameDay && isAfterNow && appointment.status == 'PENDING';
    });

    console.log(this.appointments);
  }

  updateAppointmentStatus(
    appointment: IAppointmentModel,
    status: 'DONE' | 'EXPIRED'
  ) {
    const allAppointments: IAppointmentModel[] =
      this.patientService.getAllAppointments();

    const indexAppointment = allAppointments.findIndex(
      (app) => app.date == appointment.date
    );

    allAppointments[indexAppointment].status = status;

    localStorage.setItem('appointments', JSON.stringify(allAppointments));

    const patient = this.patientService
      .patients()
      .find((p) => p.id == appointment.patientId);

    const index = patient!.appointments.findIndex(
      (app) => app.date == appointment.date
    );

    patient!.appointments[index].status = status;

    this.updatePatientAppointments.emit(patient);

    this.filterTodayAppointments(allAppointments);

    this.NotificationType = NotificationType.Success;
    this.message = 'Cita actualizada correctamente';
    this.isNotification = true;
  }

  closeNotification() {
    this.isNotification = false;
  }

  closeModal() {
    this.close.emit();
  }
}
