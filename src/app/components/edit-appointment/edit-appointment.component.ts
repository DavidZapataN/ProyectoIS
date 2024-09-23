import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { IPatientModel } from '../../Models/IPatientModel';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { IAppointmentModel } from '../../Models/IAppointmentModel';
import { DatePipe } from '@angular/common';
import { PatientService } from '../../services/patient.service';

@Component({
  selector: 'edit-appointment',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe],
  templateUrl: './edit-appointment.component.html',
  styleUrl: './edit-appointment.component.scss',
})
export class EditAppointmentComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
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

  @Input() appointmentToUpdate: IAppointmentModel = {
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

  @Output() updatePatientAppointments = new EventEmitter<IPatientModel>();
  @Output() close = new EventEmitter<void>();

  editAppointmentForm = this.formBuilder.group({
    status: ['', [Validators.required]],
    weight: ['', [Validators.required, Validators.pattern('^\\d+(\\.\\d+)?$')]],
    height: ['', [Validators.required, Validators.pattern('^\\d+(\\.\\d+)?$')]],
    backMeasurement: [
      '',
      [Validators.required, Validators.pattern('^\\d+(\\.\\d+)?$')],
    ],
    upperAbdomenMeasurement: [
      '',
      [Validators.required, Validators.pattern('^\\d+(\\.\\d+)?$')],
    ],
    lowerAbdomenMeasurement: [
      '',
      [Validators.required, Validators.pattern('^\\d+(\\.\\d+)?$')],
    ],
    hipMeasurement: [
      '',
      [Validators.required, Validators.pattern('^\\d+(\\.\\d+)?$')],
    ],
    armMeasurement: [
      '',
      [Validators.required, Validators.pattern('^\\d+(\\.\\d+)?$')],
    ],
    legMeasurement: [
      '',
      [Validators.required, Validators.pattern('^\\d+(\\.\\d+)?$')],
    ],
  });

  ngOnInit(): void {
    this.loadAppointmentData();
  }

  loadAppointmentData() {
    this.status?.setValue(this.appointmentToUpdate.status);
    this.weight?.setValue(this.appointmentToUpdate.measures.weight.toString());
    this.height?.setValue(this.appointmentToUpdate.measures.height.toString());
    this.backMeasurement?.setValue(
      this.appointmentToUpdate.measures.backMeasurement.toString()
    );
    this.upperAbdomenMeasurement?.setValue(
      this.appointmentToUpdate.measures.upperAbdomenMeasurement.toString()
    );
    this.lowerAbdomenMeasurement?.setValue(
      this.appointmentToUpdate.measures.lowerAbdomenMeasurement.toString()
    );
    this.hipMeasurement?.setValue(
      this.appointmentToUpdate.measures.hipMeasurement.toString()
    );
    this.armMeasurement?.setValue(
      this.appointmentToUpdate.measures.armMeasurement.toString()
    );
    this.legMeasurement?.setValue(
      this.appointmentToUpdate.measures.weight.toString()
    );
  }

  updateAppointment() {
    if (!this.editAppointmentForm.valid) {
      this.editAppointmentForm.markAllAsTouched();
      return;
    }

    const index = this.patient.appointments.findIndex(
      (app) => app.date == this.appointmentToUpdate.date
    );

    let statusValue: 'PENDING' | 'DONE' | 'EXPIRED' = 'PENDING';

    if (this.status?.value! == 'PENDING') statusValue = 'PENDING';
    if (this.status?.value! == 'DONE') statusValue = 'DONE';
    if (this.status?.value! == 'EXPIRED') statusValue = 'EXPIRED';

    const appointment: IAppointmentModel = {
      date: this.appointmentToUpdate.date,
      patientName: this.appointmentToUpdate.patientName,
      measures: {
        weight: parseFloat(this.weight?.value!),
        height: parseFloat(this.height?.value!),
        backMeasurement: parseFloat(this.backMeasurement?.value!),
        upperAbdomenMeasurement: parseFloat(
          this.upperAbdomenMeasurement?.value!
        ),
        lowerAbdomenMeasurement: parseFloat(
          this.lowerAbdomenMeasurement?.value!
        ),
        hipMeasurement: parseFloat(this.hipMeasurement?.value!),
        armMeasurement: parseFloat(this.armMeasurement?.value!),
        legMeasurement: parseFloat(this.legMeasurement?.value!),
      },
      status: statusValue,
    };

    this.patient.appointments[index] = appointment;

    let appointments: IAppointmentModel[] =
      this.patientService.getAllAppointments();

    const indexArray = appointments.findIndex(
      (app) => app.date === appointment.date
    );

    appointments[indexArray] = appointment;

    localStorage.setItem('appointments', JSON.stringify(appointments));

    this.updatePatientAppointments.emit(this.patient);

    this.closeModal();
  }

  closeModal() {
    this.close.emit();
  }

  get status() {
    return this.editAppointmentForm.get('status');
  }
  get weight() {
    return this.editAppointmentForm.get('weight');
  }
  get height() {
    return this.editAppointmentForm.get('height');
  }
  get backMeasurement() {
    return this.editAppointmentForm.get('backMeasurement');
  }
  get upperAbdomenMeasurement() {
    return this.editAppointmentForm.get('upperAbdomenMeasurement');
  }
  get lowerAbdomenMeasurement() {
    return this.editAppointmentForm.get('lowerAbdomenMeasurement');
  }
  get hipMeasurement() {
    return this.editAppointmentForm.get('hipMeasurement');
  }
  get armMeasurement() {
    return this.editAppointmentForm.get('armMeasurement');
  }
  get legMeasurement() {
    return this.editAppointmentForm.get('legMeasurement');
  }
}
