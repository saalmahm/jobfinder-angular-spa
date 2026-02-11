import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-register-page',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register-page.component.html',
  styles: [],
})
export class RegisterPageComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  isLoading = false;
  errorMessage = '';

  registerForm = this.fb.group(
    {
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: this.passwordMatchValidator }
  );

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    return password && confirmPassword && password.value !== confirmPassword.value ? { mismatch: true } : null;
  }

  onSubmit() {
    if (!this.registerForm.valid) return;
    this.isLoading = true;
    this.errorMessage = '';
    const { confirmPassword, ...userData } = this.registerForm.value;
    this.authService.register(userData as any).subscribe({
      next: () => this.router.navigate(['/login']),
      error: (err) => {
        this.errorMessage = err?.message || "Une erreur est survenue.";
        this.isLoading = false;
      },
    });
  }
}