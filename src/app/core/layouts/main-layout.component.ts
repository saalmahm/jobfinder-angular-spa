import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-main-layout',
  imports: [CommonModule, RouterModule],
  templateUrl: './main-layout.component.html',
})
export class MainLayoutComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}