import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IPatientModel } from '../../Models/IPatientModel';

@Component({
  selector: 'manage-appointments',
  standalone: true,
  imports: [],
  templateUrl: './manage-appointments.component.html',
  styleUrl: './manage-appointments.component.scss',
})
export class ManageAppointmentsComponent {
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

  closeModal() {
    this.close.emit();
  }
}
