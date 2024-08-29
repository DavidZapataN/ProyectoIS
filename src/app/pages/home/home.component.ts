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

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NotificationComponent, PatientFormComponent, NotificationComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  protected authService = inject(AuthService);
  protected patientsService = inject(PatientService);

  NotificationType = NotificationType;
  message: string = '';
  isNotification: boolean = false;

  isNewPatientForm: boolean = false;
  isNewPatientInForm: boolean = true;
  patientToUpdate: IPatientModel = {
    id: -1,
    name: '',
    age: '',
    phone: '',
    gender: 'MALE',
    appointments: [],
    status: 'ACTIVE',
  };

  ngOnInit(): void {
    this.patientsService.patients.set(this.getActivePatients());
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
      id: -1,
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
    this.patientsService.patients.update((patients) => {
      patients.push(patient);
      return patients;
    });

    let patientsArray: IPatientModel[] = [];
    const patientsString = localStorage.getItem('patients');
    if (patientsString) {
      patientsArray = JSON.parse(patientsString);
    }
    patientsArray.push(patient);
    localStorage.setItem('patients', JSON.stringify(patientsArray));

    this.message = 'Paciente creado correctamente';
    this.isNotification = true;
  }

  updatePatient(patientToUpdate: IPatientModel) {
    let patients: IPatientModel[] = JSON.parse(
      localStorage.getItem('patients')!
    );
    const index = patients.findIndex((p) => p.id === patientToUpdate.id);
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

    this.message = 'Paciente actualizado correctamente';
    this.isNotification = true;
  }

  getActivePatients(): IPatientModel[] {
    const patientsString = localStorage.getItem('patients');
    if (!patientsString) return [];
    const patients: IPatientModel[] = JSON.parse(patientsString);

    const activePatients: IPatientModel[] = patients.filter(
      (patient) => patient.status === 'ACTIVE'
    );

    activePatients.forEach((patient) => {
      const nextAppointment = this.getNextAppointment(patient.appointments);
      return {
        ...patient,
        nextAppointment,
      };
    });

    return activePatients;
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

  closeNotification() {
    this.isNotification = false;
  }
}
