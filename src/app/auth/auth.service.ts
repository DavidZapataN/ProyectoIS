import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private router = inject(Router);

  private isAuthenticated: boolean = false;
  private username = 'admin';
  private password = '1234';

  login(user: string, password: string): boolean {
    if (user === this.username && password === this.password) {
      this.isAuthenticated = true;
      localStorage.setItem('isAuthenticated', 'true');
      return true;
    }

    return false;
  }

  logout(): void {
    this.isAuthenticated = false;
    localStorage.removeItem('isAuthenticated');
    this.router.navigate(['/login']);
  }

  isLogged(): boolean {
    return (
      this.isAuthenticated || localStorage.getItem('isAuthenticated') === 'true'
    );
  }
}
