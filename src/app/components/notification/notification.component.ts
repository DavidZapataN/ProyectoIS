import { NgClass } from '@angular/common';
import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { PatientService } from '../../services/patient.service';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [NgClass],
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.scss',
})
export class NotificationComponent implements OnInit, OnDestroy {
  private utilsService = inject(PatientService);

  @Input() message: string = '';
  @Input() type: NotificationType = NotificationType.Info;
  @Input() duration: number = 5000;

  @Output() close = new EventEmitter<void>();

  icons = {
    success: 'check_circle',
    error: 'cancel',
    info: 'info',
    warning: 'notification_important',
  };

  timeoutId: any;

  ngOnInit(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    this.timeoutId = setTimeout(() => {
      this.closeNotification();
    }, this.duration);
  }

  get notificationClass(): string {
    return `toast-${this.type}`;
  }

  get icon() {
    return this.icons[this.type];
  }

  closeNotification() {
    this.close.emit();
  }

  ngOnDestroy(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }
}

export enum NotificationType {
  Success = 'success',
  Error = 'error',
  Info = 'info',
  Warning = 'warning',
}
