import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-login-page',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login-page.component.html',
  styles: [],
})
export class LoginPageComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  rememberMe = false;
  isLoading = false;
  errorMessage = '';

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  onSubmit() {
    if (!this.loginForm.valid) return;
    this.isLoading = true;
    this.errorMessage = '';

    const email = this.loginForm.value.email!;
    const password = this.loginForm.value.password!;
    const mode = this.rememberMe ? 'local' : 'session';

    this.authService.login(email, password, mode).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.errorMessage = err?.message || 'Erreur lors de la connexion.';
        this.isLoading = false;
      },
    });
  }
}