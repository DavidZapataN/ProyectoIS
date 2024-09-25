import { DatePipe } from '@angular/common';
import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IAppointmentModel } from '../../Models/IAppointmentModel';
import { NotificationComponent } from '../notification/notification.component';
import { IPatientModel } from '../../Models/IPatientModel';
import { PatientService } from '../../services/patient.service';

@Component({
  selector: 'appointment-form-modal',
  standalone: true,
  imports: [FormsModule, DatePipe, NotificationComponent, ReactiveFormsModule],
  templateUrl: './appointment-form.component.html',
  styleUrl: './appointment-form.component.scss',
})
export class AppointmentFormComponent implements OnInit {
  private datePipe = inject(DatePipe);
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

  @Input() isToRescheduleAppointment: boolean = false;
  @Input() appointmentToReshedule: IAppointmentModel = {
    date: '',
    patientId: '',
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

  @Output() updatePatientAppointments = new EventEmitter<IPatientModel>();
  @Output() close = new EventEmitter<void>();

  availableDates: string[] = [];
  currentDate: any;
  selectedDay: string = '';
  selectedDate: string = '';

  ngOnInit(): void {
    this.currentDate = new Date();
    this.currentDate = this.datePipe.transform(this.currentDate, 'yyyy-MM-dd');

    this.selectedDay = this.currentDate;
    this.onDateSelected();
  }

  resheduleAppointment(appointment: IAppointmentModel) {
    const appointments: IAppointmentModel[] =
      this.patientService.getAllAppointments();
    const index = appointments.findIndex(
      (app) => app.date === this.appointmentToReshedule.date
    );

    appointments[index] = appointment;

    localStorage.setItem('appointments', JSON.stringify(appointments));

    const indexArray = this.patient.appointments.findIndex(
      (app) => app.date == this.appointmentToReshedule.date
    );

    this.patient.appointments[indexArray] = appointment;

    this.updatePatientAppointments.emit(this.patient);

    this.closeModal();
  }

  saveAppointment() {
    if (this.selectedDate == '') return;

    const date = new Date(this.selectedDate);

    let appointment: IAppointmentModel = {
      date: date.toString(),
      patientId: this.patient.id,
      patientName: this.patient.name,
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

    if (this.isToRescheduleAppointment) {
      this.resheduleAppointment(appointment);
      return;
    }

    const appointments = this.patientService.getAllAppointments();

    appointments.push(appointment);

    localStorage.setItem('appointments', JSON.stringify(appointments));

    this.onDateSelected();

    this.patient.appointments.push(appointment);
    this.updatePatientAppointments.emit(this.patient);

    this.closeModal();
  }

  onDateSelected() {
    this.availableDates = this.getAvailableSlotsForDate(this.selectedDay);
  }

  getAvailableSlotsForDate(selectedDay: string): string[] {
    const appointments = this.patientService.getAllAppointments();
    const availableSlots = this.generateAvailableSlots(
      new Date(`${selectedDay}T00:00`)
    );

    //Filtrar los horarios que ya están ocupados
    const availableFilteredSlots = availableSlots.filter((slot) => {
      const slotDate = new Date(slot);
      return !appointments.some((appointment: IAppointmentModel) => {
        const appointmentDate = new Date(appointment.date);
        return appointmentDate.toLocaleString() == slotDate.toLocaleString();
      });
    });

    return availableFilteredSlots;
  }

  generateAvailableSlots(selectedDate: Date): string[] {
    const availableDates: string[] = [];
    const dayOfWeek = selectedDate.getDay();

    let startTime = new Date(selectedDate);
    let endTime = new Date(selectedDate);

    if (dayOfWeek === 1) {
      // Lunes: 4:00 PM a 9:00 PM
      startTime.setHours(16, 0, 0, 0); // 4:00 PM
      endTime.setHours(21, 0, 0, 0); // 9:00 PM
    } else if (dayOfWeek >= 2 && dayOfWeek <= 5) {
      // Martes a Viernes: 8:00 AM a 8:00 PM
      startTime.setHours(8, 0, 0, 0); // 8:00 AM
      endTime.setHours(20, 0, 0, 0); // 8:00 PM
    } else {
      // Sábado y Domingo: no hay citas
      return [];
    }

    // Genera los intervalos de 30 minutos
    while (startTime < endTime) {
      availableDates.push(startTime.toString());
      startTime.setMinutes(startTime.getMinutes() + 30);
    }

    const now = new Date();
    if (selectedDate.toDateString() === now.toDateString()) {
      return availableDates.filter((slot) => new Date(slot) > now);
    }

    return availableDates;
  }

  closeModal() {
    this.close.emit();
  }
}
