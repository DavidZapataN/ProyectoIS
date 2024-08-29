import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { IPatientModel } from '../../Models/IPatientModel';
import { AuthService } from '../../auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private authService = inject(AuthService);
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);

  inputPasswordType: string = 'password';

  loginError: boolean = false;

  loginForm = this.formBuilder.group({
    user: ['', Validators.required],
    password: ['', Validators.required],
  });

  showPassword() {
    this.inputPasswordType = 'text';
  }

  hidePassword() {
    this.inputPasswordType = 'password';
  }

  onSubmit() {
    if (!this.loginForm.valid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    if (this.authService.login(this.user?.value!, this.password?.value!)) {
      this.router.navigate(['/home']);
    } else {
      this.loginError = true;
    }
  }

  get user() {
    return this.loginForm.get('user');
  }

  get password() {
    return this.loginForm.get('password');
  }
}
