import { Component, inject, OnInit } from '@angular/core';
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
import { AppointmentFormComponent } from '../../components/appointment-form/appointment-form.component';
import { DatePipe } from '@angular/common';
import { ManageAppointmentsComponent } from '../../components/manage-appointments/manage-appointments.component';
import { EditAppointmentComponent } from '../../components/edit-appointment/edit-appointment.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    NotificationComponent,
    PatientFormComponent,
    AppointmentFormComponent,
    ManageAppointmentsComponent,
    EditAppointmentComponent,
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

  activeEditAppointment: boolean = false;
  activeNewAppointment: boolean = false;
  patientToSchedule: IPatientModel = {
    id: '',
    name: '',
    age: '',
    phone: '',
    gender: 'MALE',
    appointments: [],
    status: 'ACTIVE',
  };
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

  isManageAppointments: boolean = false;

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
    console.log(patient);

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
    const nextAppointment = this.getNextAppointment(
      patientToUpdate.appointments
    );

    nextAppointment ? (patientToUpdate.nextAppointment = nextAppointment) : '';

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

    localStorage.setItem('patients', JSON.stringify(activePatients));

    return activePatients;
  }

  viewAppointmentForm(
    appointmentStatus: 'NEW' | 'TO_MANAGE',
    patient: IPatientModel
  ) {
    this.patientToSchedule = patient;

    if (appointmentStatus == 'NEW') {
      this.activeNewAppointment = true;
    }

    if (appointmentStatus == 'TO_MANAGE') {
      this.appointmentToUpdate = patient.nextAppointment!;
      this.activeEditAppointment = true;
    }
  }

  closeAppointmentForm() {
    this.patientToSchedule = {
      id: '',
      name: '',
      age: '',
      phone: '',
      gender: 'MALE',
      appointments: [],
      status: 'ACTIVE',
    };
    this.activeNewAppointment = false;
    this.activeEditAppointment = false;
  }

  scheduleAppointment(patient: IPatientModel) {
    this.updatePatientAppointments(patient, false);

    this.NotificationType = NotificationType.Success;
    this.message = 'Cita programada éxitosamente';
    this.isNotification = true;
  }

  updatePatientAppointments(patient: IPatientModel, showNotification: boolean) {
    patient.appointments = this.updateExpiredAppointments(patient.appointments);

    const nextAppointment = this.getNextAppointment(patient.appointments);
    nextAppointment
      ? (patient.nextAppointment = nextAppointment)
      : (patient.nextAppointment = undefined);

    this.updatePatient(patient, false);

    if (showNotification) {
      this.NotificationType = NotificationType.Success;
      this.message = 'Cita actualizada éxitosamente';
      this.isNotification = true;
    }
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
      if (appointment.status === 'PENDING') {
        const appointmentDate = new Date(appointment.date);

        // Sumar 30 minutos a la fecha de la cita
        const appointmentDateWithMargin = new Date(appointmentDate);
        appointmentDateWithMargin.setMinutes(appointmentDate.getMinutes() + 10);

        if (now > appointmentDateWithMargin) {
          appointment.status = 'EXPIRED';
        }
      }
    });

    return appointments;
  }

  getAllPatients(): IPatientModel[] {
    const patientsString = localStorage.getItem('patients');
    if (!patientsString) return [];

    return JSON.parse(patientsString);
  }

  viewAppointments(patient: IPatientModel) {
    if (patient.appointments.length <= 0) {
      this.NotificationType = NotificationType.Info;
      this.message = `${patient.name} no tiene citas registradas`;
      this.isNotification = true;
      return;
    }

    this.patientToSchedule = patient;
    this.isManageAppointments = true;
  }

  closeAppointmentsModal() {
    this.patientToSchedule = {
      id: '',
      name: '',
      age: '',
      phone: '',
      gender: 'MALE',
      appointments: [],
      status: 'ACTIVE',
    };

    this.isManageAppointments = false;
  }

  closeNotification() {
    this.isNotification = false;
  }
}
