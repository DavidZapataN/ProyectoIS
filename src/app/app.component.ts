import { Router, RouterOutlet } from '@angular/router';
import { IPatientModel } from './Models/IPatientModel';
import { Component, inject } from '@angular/core';
import { NotificationComponent } from './components/notification/notification.component';
import { PatientService } from './services/patient.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {}
