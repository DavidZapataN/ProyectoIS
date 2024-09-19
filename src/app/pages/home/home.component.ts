import {
  Component,
  inject,
  OnInit,
  signal,
  WritableSignal,
} from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import {
  NotificationComponent,
  NotificationType,
} from '../../components/notification/notification.component';
import { IPatientModel } from '../../Models/IPatientModel';
import { IAppointmentModel } from '../../Models/IAppointmentModel';
import { PatientFormComponent } from '../../components/patient-form/patient-form.component';
import { PatientService } from '../../services/patient.service';
import { FormsModule } from '@angular/forms';
import { NewAppointmentComponent } from '../../components/new-appointment/new-appointment.component';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    NotificationComponent,
    PatientFormComponent,
    NewAppointmentComponent,
    FormsModule,
    DatePipe,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  protected authService = inject(AuthService);
  protected patientsService = inject(PatientService);

  searchIdQuery: string = '';
  searchNameQuery: string = '';
  searchGenderQuery: string = 'all';

  NotificationType = NotificationType.Success;
  message: string = '';
  isNotification: boolean = false;

  isNewPatientForm: boolean = false;
  isNewPatientInForm: boolean = true;
  patientToUpdate: IPatientModel = {
    id: '',
    name: '',
    age: '',
    phone: '',
    gender: 'MALE',
    appointments: [],
    status: 'ACTIVE',
  };

  isNewAppointment: boolean = false;
  patientToSchedule: IPatientModel = {
    id: '',
    name: '',
    age: '',
    phone: '',
    gender: 'MALE',
    appointments: [],
    status: 'ACTIVE',
  };

  ngOnInit(): void {
    const appointments = localStorage.getItem('appointments');
    if (appointments) {
      const appointmentsArray = this.updateExpiredAppointments(
        JSON.parse(appointments)
      );
      localStorage.setItem('appointments', JSON.stringify(appointmentsArray));
    }

    this.patientsService.patients.set(this.getActivePatients());
  }

  borrarCitas() {
    localStorage.removeItem('appointments');

    let patients = this.getActivePatients();

    patients.forEach((patient) => {
      patient.appointments = [];
      patient.nextAppointment = undefined;
      return patient;
    });

    localStorage.setItem('patients', JSON.stringify(patients));
  }

  searchById() {
    this.isNotification = false;

    if (this.searchIdQuery === '') {
      this.patientsService.patients.set(this.getActivePatients());
      return;
    }

    const patientsArray = this.getAllPatients();
    const patient = patientsArray.find(
      (p) => p.id == this.searchIdQuery && p.status == 'ACTIVE'
    );

    if (patient) {
      this.patientsService.patients.set([patient]);
    } else {
      this.NotificationType = NotificationType.Warning;
      this.message =
        'No se encotró ningún paciente activo con ese número de cédula';
      this.isNotification = true;
    }
  }

  searchByName() {
    this.isNotification = false;

    if (this.searchNameQuery === '') {
      this.patientsService.patients.set(this.getActivePatients());
      return;
    }

    const patientsArray = this.getAllPatients();
    const patientsFound = patientsArray.filter(
      (patient) =>
        patient.name
          .toLowerCase()
          .includes(this.searchNameQuery.toLowerCase()) &&
        patient.status == 'ACTIVE'
    );

    if (patientsFound.length > 0) {
      this.patientsService.patients.set(patientsFound);
    } else {
      this.NotificationType = NotificationType.Warning;
      this.message = 'No se encontraron pacientes';
      this.isNotification = true;
    }
  }

  searchByGender() {
    this.isNotification = false;

    if (this.searchGenderQuery === '' || this.searchGenderQuery == 'all') {
      this.patientsService.patients.set(this.getActivePatients());
      return;
    }

    const patientsArray = this.getAllPatients();
    const patientsFound = patientsArray.filter(
      (patient) =>
        patient.gender == this.searchGenderQuery && patient.status == 'ACTIVE'
    );

    if (patientsFound.length > 0) {
      this.patientsService.patients.set(patientsFound);
    } else {
      this.NotificationType = NotificationType.Warning;
      this.message = 'No se encontraron pacientes';
      this.isNotification = true;
    }
  }

  viewPatientForm(patientStatus: 'NEW' | 'TO_UPDATE', patient?: IPatientModel) {
    if (patientStatus == 'NEW') {
      this.isNewPatientInForm = true;
      this.isNewPatientForm = true;
    }

    if (patientStatus == 'TO_UPDATE' && patient) {
      this.patientToUpdate = patient;
      this.isNewPatientInForm = false;
      this.isNewPatientForm = true;
    }
  }

  closePatientForm() {
    this.patientToUpdate = {
      id: '',
      name: '',
      age: '',
      phone: '',
      gender: 'MALE',
      appointments: [],
      status: 'ACTIVE',
    };
    this.isNewPatientForm = false;
  }

  createPatient(patient: IPatientModel) {
    let patientsArray: IPatientModel[] = this.getAllPatients();
    patientsArray.push(patient);
    localStorage.setItem('patients', JSON.stringify(patientsArray));

    this.patientsService.patients.update((patients) => {
      patients.push(patient);
      return patients;
    });

    this.NotificationType = NotificationType.Success;
    this.message = 'Paciente creado correctamente';
    this.isNotification = true;
  }

  updatePatient(patientToUpdate: IPatientModel, showNotification: boolean) {
    let patients: IPatientModel[] = this.getAllPatients();
    const index = patients.findIndex((p) => p.id == patientToUpdate.id);
    patients[index] = patientToUpdate;
    localStorage.setItem('patients', JSON.stringify(patients));

    if (
      patientToUpdate.status === 'CANCELED' ||
      patientToUpdate.status === 'INACTIVE'
    ) {
      this.patientsService.patients.update((patients) => {
        patients = patients.filter((p) => p.id !== patientToUpdate.id);
        return patients;
      });
    } else {
      this.patientsService.patients.update((patients) => {
        const index = patients.findIndex((p) => p.id == patientToUpdate.id);
        patients[index] = patientToUpdate;
        return patients;
      });
    }

    if (this.patientsService.patients().length <= 0) {
      this.patientsService.patients.set(this.getActivePatients());
    }

    if (showNotification) {
      this.NotificationType = NotificationType.Success;
      this.message = 'Paciente actualizado correctamente';
      this.isNotification = true;
    }
  }

  getActivePatients(): IPatientModel[] {
    const patientsString = localStorage.getItem('patients');
    if (!patientsString) return [];
    const patients: IPatientModel[] = JSON.parse(patientsString);

    const activePatients: IPatientModel[] = patients.filter(
      (patient) => patient.status === 'ACTIVE'
    );

    activePatients.forEach((patient) => {
      patient.appointments = this.updateExpiredAppointments(
        patient.appointments
      );

      const nextAppointment = this.getNextAppointment(patient.appointments);
      nextAppointment ? (patient.nextAppointment = nextAppointment) : null;
      return patient;
    });

    return activePatients;
  }

  viewNewAppointmentForm(patient: IPatientModel) {
    this.patientToSchedule = patient;
    this.isNewAppointment = true;
  }

  updatePatientAppointments(patient: IPatientModel) {
    patient.appointments = this.updateExpiredAppointments(patient.appointments);

    const nextAppointment = this.getNextAppointment(patient.appointments);
    nextAppointment ? (patient.nextAppointment = nextAppointment) : null;

    this.updatePatient(patient, false);
  }

  closeNewAppointmentForm() {
    this.patientToSchedule = {
      id: '',
      name: '',
      age: '',
      phone: '',
      gender: 'MALE',
      appointments: [],
      status: 'ACTIVE',
    };
    this.isNewAppointment = false;
  }

  getNextAppointment(
    appointments: IAppointmentModel[]
  ): IAppointmentModel | null {
    const pendingAppointments = appointments.filter(
      (app) => app.status === 'PENDING'
    );

    if (pendingAppointments.length <= 0) {
      return null;
    }

    return pendingAppointments.reduce((earliest, current) => {
      return new Date(current.date) < new Date(earliest.date)
        ? current
        : earliest;
    });
  }

  updateExpiredAppointments(appointments: IAppointmentModel[]) {
    const now = new Date();

    appointments.forEach((appointment) => {
      if (
        appointment.status === 'PENDING' &&
        new Date(appointment.date) < now
      ) {
        appointment.status = 'EXPIRED';
      }
    });

    return appointments;
  }

  getAllPatients(): IPatientModel[] {
    const patientsString = localStorage.getItem('patients');
    if (!patientsString) return [];

    return JSON.parse(patientsString);
  }

  closeNotification() {
    this.isNotification = false;
  }
}
