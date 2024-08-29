import { Injectable, signal, WritableSignal } from '@angular/core';
import { IPatientModel } from '../Models/IPatientModel';

@Injectable({
  providedIn: 'root',
})
export class PatientService {
  patients: WritableSignal<IPatientModel[]> = signal([]);

  onKeyPress(event: KeyboardEvent): void {
    const input = event.key;
    if (!/^[0-9]$/.test(input) && input !== 'Backspace') {
      event.preventDefault();
    }
  }
}
