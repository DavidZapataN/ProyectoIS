import {
  Component,
  inject,
  OnInit,
  signal,
  WritableSignal,
} from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { RouterLink } from '@angular/router';
import { IPatientModel } from '../../Models/IPatientModel';
import { PatientService } from '../../services/patient.service';
import {
  NotificationComponent,
  NotificationType,
} from '../../components/notification/notification.component';

@Component({
  selector: 'app-inactive-patients',
  standalone: true,
  imports: [RouterLink, NotificationComponent],
  templateUrl: './inactive-patients.component.html',
  styleUrl: './inactive-patients.component.scss',
})
export class InactivePatientsComponent implements OnInit {
  protected authService = inject(AuthService);
  private patientService = inject(PatientService);

  inactivePatients: WritableSignal<IPatientModel[]> = signal([]);

  NotificationType = NotificationType.Success;
  message: string = '';
  isNotification: boolean = false;

  isAlertDeletePatient: boolean = false;
  patientIdToDelete: string = '';

  ngOnInit(): void {
    this.inactivePatients.set(this.getInactivePatients());
  }

  getInactivePatients(): IPatientModel[] {
    const patients = this.patientService.getAllPatients();

    const inactivePatients = patients.filter(
      (patient) => patient.status != 'ACTIVE'
    );

    return inactivePatients;
  }

  activatePatient(patient: IPatientModel) {
    const patients = this.patientService.getAllPatients();

    const index = patients.findIndex((p) => p.id == patient.id);

    patients[index].status = 'ACTIVE';

    localStorage.setItem('patients', JSON.stringify(patients));

    this.inactivePatients.set(this.getInactivePatients());

    this.NotificationType = NotificationType.Success;
    this.message = 'Paciente activado nuevamente';
    this.isNotification = true;
  }

  deletePatient(patientId: string) {
    const patients = this.patientService.getAllPatients();

    const updatedPatients = patients.filter(
      (patient) => patient.id != patientId
    );

    localStorage.setItem('patients', JSON.stringify(updatedPatients));

    this.inactivePatients.update((patients) => {
      patients = patients.filter((patient) => patient.id != patientId);

      return patients;
    });

    this.closeAlertDeletePatient();

    this.NotificationType = NotificationType.Success;
    this.message = 'Paciente borrado exitosamente';
    this.isNotification = true;
  }

  viewAlertDeletePatient(patientId: string) {
    this.patientIdToDelete = patientId;
    this.isAlertDeletePatient = true;
  }

  closeAlertDeletePatient() {
    this.patientIdToDelete = '';
    this.isAlertDeletePatient = false;
  }

  closeNotification() {
    this.isNotification = false;
  }
}
