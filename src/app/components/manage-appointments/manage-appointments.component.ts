import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { IPatientModel } from '../../Models/IPatientModel';
import { IAppointmentModel } from '../../Models/IAppointmentModel';
import { PatientService } from '../../services/patient.service';
import { DatePipe, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppointmentFormComponent } from '../appointment-form/appointment-form.component';
import {
  NotificationComponent,
  NotificationType,
} from '../notification/notification.component';

@Component({
  selector: 'manage-appointments',
  standalone: true,
  imports: [
    DatePipe,
    NgClass,
    FormsModule,
    AppointmentFormComponent,
    NotificationComponent,
  ],
  templateUrl: './manage-appointments.component.html',
  styleUrl: './manage-appointments.component.scss',
})
export class ManageAppointmentsComponent implements OnInit {
  private patientService = inject(PatientService);

  @Input({ required: true }) patient: IPatientModel = {
    id: '',
    name: '',
    age: '',
    phone: '',
    gender: 'MALE',
    appointments: [],
    status: 'ACTIVE',
  };

  @Output() updatePatientAppointments = new EventEmitter<IPatientModel>();
  @Output() close = new EventEmitter<void>();

  searchByStatusQuery: string = 'all';

  appointments: IAppointmentModel[] = [];

  appointmentToViewDetails: IAppointmentModel = {
    date: '',
    patientName: '',
    measures: {
      weight: 0,
      height: 0,
      backMeasurement: 0,
      upperAbdomenMeasurement: 0,
      lowerAbdomenMeasurement: 0,
      hipMeasurement: 0,
      armMeasurement: 0,
      legMeasurement: 0,
    },
    status: 'PENDING',
  };

  NotificationType = NotificationType.Info;
  message: string = '';
  isNotification: boolean = false;

  activeEditAppointment: boolean = false;
  appointmentToUpdate: IAppointmentModel = {
    date: '',
    patientName: '',
    measures: {
      weight: 0,
      height: 0,
      backMeasurement: 0,
      upperAbdomenMeasurement: 0,
      lowerAbdomenMeasurement: 0,
      hipMeasurement: 0,
      armMeasurement: 0,
      legMeasurement: 0,
    },
    status: 'PENDING',
  };

  ngOnInit(): void {
    this.checkAppointments();
  }

  checkAppointments() {
    this.patientService.orderByDateAsc(this.patient.appointments);
    this.appointments = this.patient.appointments;
  }

  deleteAppointment(appointment: IAppointmentModel) {
    let appointments: IAppointmentModel[] =
      this.patientService.getAllAppointments();

    appointments = appointments.filter((app) => app.date !== appointment.date);

    localStorage.setItem('appointments', JSON.stringify(appointments));

    this.patient.appointments = appointments;

    this.checkAppointments();
    this.updatePatientAppointments.emit(this.patient);

    if (this.patient.appointments.length <= 0) {
      this.closeModal();
    }
  }

  viewAppointmentToEdit(appointment: IAppointmentModel) {
    this.appointmentToUpdate = appointment;
    this.activeEditAppointment = true;
  }

  closeAppointmentForm() {
    this.appointmentToUpdate = {
      date: '',
      patientName: '',
      measures: {
        weight: 0,
        height: 0,
        backMeasurement: 0,
        upperAbdomenMeasurement: 0,
        lowerAbdomenMeasurement: 0,
        hipMeasurement: 0,
        armMeasurement: 0,
        legMeasurement: 0,
      },
      status: 'PENDING',
    };

    this.activeEditAppointment = false;
  }

  viewAppointmentDetails(appointment: IAppointmentModel) {
    this.appointmentToViewDetails = appointment;
  }

  closeAppointmentDetails() {
    this.appointmentToViewDetails = {
      date: '',
      patientName: '',
      measures: {
        weight: 0,
        height: 0,
        backMeasurement: 0,
        upperAbdomenMeasurement: 0,
        lowerAbdomenMeasurement: 0,
        hipMeasurement: 0,
        armMeasurement: 0,
        legMeasurement: 0,
      },
      status: 'PENDING',
    };
  }

  searchByStatus() {
    this.appointments = this.patient.appointments;

    if (this.searchByStatusQuery == 'all') return;

    if (this.searchByStatusQuery == 'PENDING') {
      this.appointments = this.appointments.filter(
        (app) => app.status == 'PENDING'
      );
    }

    if (this.searchByStatusQuery == 'DONE') {
      this.appointments = this.appointments.filter(
        (app) => app.status == 'DONE'
      );
    }

    if (this.searchByStatusQuery == 'EXPIRED') {
      this.appointments = this.appointments.filter(
        (app) => app.status == 'EXPIRED'
      );
    }
  }

  closeModal() {
    this.close.emit();
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'PENDIENTE';
      case 'DONE':
        return 'VISTA';
      case 'EXPIRED':
        return 'VENCIDA';
      default:
        return 'PENDIENTE';
    }
  }
}
