import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { IPatientModel } from '../../Models/IPatientModel';
import { PatientService } from '../../services/patient.service';
import {
  NotificationComponent,
  NotificationType,
} from '../notification/notification.component';

@Component({
  selector: 'patient-form',
  standalone: true,
  imports: [ReactiveFormsModule, NotificationComponent],
  templateUrl: './patient-form.component.html',
  styleUrl: './patient-form.component.scss',
})
export class PatientFormComponent implements OnInit {
  protected patientsService = inject(PatientService);
  private formBuilder = inject(FormBuilder);

  NotificationType = NotificationType;
  isNotification: boolean = false;

  @Input() isNewPatient: boolean = true;

  @Input() patientToUpdate: IPatientModel = {
    id: '',
    name: '',
    age: '',
    phone: '',
    gender: 'MALE',
    appointments: [],
    status: 'ACTIVE',
  };

  @Output() savePatient = new EventEmitter<IPatientModel>();
  @Output() updatePatient = new EventEmitter<IPatientModel>();
  @Output() close = new EventEmitter<void>();

  patientForm = this.formBuilder.group({
    ID: ['', Validators.required],
    name: ['', Validators.required],
    age: ['', Validators.required],
    phone: ['', Validators.required],
    gender: ['', Validators.required],
    status: ['ACTIVE', Validators.required],
  });

  ngOnInit(): void {
    if (!this.isNewPatient) {
      this.loadPatientData(this.patientToUpdate);
    }
  }

  loadPatientData(patient: IPatientModel) {
    this.ID?.setValue(patient.id);
    this.name?.setValue(patient.name);
    this.age?.setValue(patient.age);
    this.phone?.setValue(patient.phone);
    this.gender?.setValue(patient.gender);
    this.status?.setValue(patient.status);
  }

  onSubmit() {
    this.isNotification = false;

    console.log(this.patientForm.value);
    if (!this.patientForm.valid) {
      this.patientForm.markAllAsTouched();
      return;
    }

    if (this.checkDuplicatedID(this.ID?.value!)) {
      this.isNotification = true;
      return;
    }

    if (this.patientForm.valid) {
      let statusValue: 'ACTIVE' | 'INACTIVE' | 'CANCELED' = 'ACTIVE';

      if (this.status?.value! == 'ACTIVE') statusValue = 'ACTIVE';
      if (this.status?.value! == 'INACTIVE') statusValue = 'INACTIVE';
      if (this.status?.value! == 'CANCELED') statusValue = 'CANCELED';

      const patient: IPatientModel = {
        id: this.ID?.value!,
        name: this.name?.value!,
        age: this.age?.value!,
        phone: this.phone?.value!,
        gender: this.gender?.value! == 'MALE' ? 'MALE' : 'FEMALE',
        appointments: [],
        status: statusValue,
      };

      if (this.isNewPatient) {
        this.savePatient.emit(patient);
      } else {
        this.updatePatient.emit(patient);
      }
      this.closeModal();
    }
  }

  checkDuplicatedID(patientId: string): boolean {
    let patientsArray: IPatientModel[] = [];
    const patientsString = localStorage.getItem('patients');
    if (patientsString) {
      patientsArray = JSON.parse(patientsString);
    }

    const exists = patientsArray.find((p) => p.id == patientId);
    if (exists && this.isNewPatient) {
      return true;
    } else {
      return false;
    }
  }

  closeNotification() {
    this.isNotification = false;
  }

  closeModal() {
    this.close.emit();
  }

  get ID() {
    return this.patientForm.get('ID');
  }
  get name() {
    return this.patientForm.get('name');
  }
  get age() {
    return this.patientForm.get('age');
  }
  get phone() {
    return this.patientForm.get('phone');
  }
  get gender() {
    return this.patientForm.get('gender');
  }
  get status() {
    return this.patientForm.get('status');
  }
}
