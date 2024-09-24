import { Injectable, signal, WritableSignal } from '@angular/core';
import { IPatientModel } from '../Models/IPatientModel';

@Injectable({
  providedIn: 'root',
})
export class PatientService {
  patients: WritableSignal<IPatientModel[]> = signal([]);

  getAllPatients(): IPatientModel[] {
    const patientsString = localStorage.getItem('patients');
    if (!patientsString) return [];

    return JSON.parse(patientsString);
  }

  getAllAppointments() {
    const appointments = localStorage.getItem('appointments');
    return appointments ? JSON.parse(appointments) : [];
  }

  // Ordenar de más reciente a más antigua
  orderByDateDesc(list: any) {
    list.sort((a: any, b: any) => {
      return <any>new Date(b.date) - <any>new Date(a.date);
    });
  }

  // Ordenar de más antigua a más reciente
  orderByDateAsc(list: any) {
    list.sort((a: any, b: any) => {
      return <any>new Date(a.date) - <any>new Date(b.date);
    });
  }

  onKeyPress(event: KeyboardEvent): void {
    const input = event.key;
    if (!/^[0-9]$/.test(input) && input !== 'Backspace') {
      event.preventDefault();
    }
  }
}
