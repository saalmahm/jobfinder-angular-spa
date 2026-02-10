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
  template: `
    <div
      class="min-h-screen bg-center bg-cover bg-no-repeat flex items-center justify-center px-4 py-10 relative overflow-hidden"
      style="background-image: url('/bg-login.png');"
    >
      <div class="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-900/40 to-slate-900/70"></div>
      <div class="absolute inset-0 [box-shadow:inset_0_0_160px_rgba(0,0,0,0.55)]"></div>

      <div class="relative w-full max-w-md">
        <div class="text-center text-white mb-6 drop-shadow">
          <h1 class="text-4xl font-extrabold tracking-wide">JOB FINDER</h1>
          <p class="text-sm text-white/90 mt-1">Your Next Opportunity Awaits</p>
        </div>

        <div class="bg-white/10 backdrop-blur-xl rounded-[2.5rem] shadow-2xl ring-1 ring-white/20 p-8 border border-white/10">
          <h2 class="text-center text-xl font-bold text-white mb-8 ">Create Your Account</h2>

          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-white/70 mb-1 ml-1 uppercase">Prénom</label>
                <input
                  type="text"
                  formControlName="firstName"
                  class="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-sky-400/50 focus:bg-white/20 transition-all text-sm shadow-inner"
                  placeholder="First name"
                />
              </div>
              <div>
                <label class="block text-xs font-semibold text-white/70 mb-1 ml-1 uppercase">Nom</label>
                <input
                  type="text"
                  formControlName="lastName"
                  class="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-sky-400/50 focus:bg-white/20 transition-all text-sm shadow-inner"
                  placeholder="Last name"
                />
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-white/70 mb-1 ml-1 uppercase">Email Address</label>
              <input
                type="email"
                formControlName="email"
                class="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-sky-400/50 focus:bg-white/20 transition-all text-sm shadow-inner"
                placeholder="name@example.com"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-white/70 mb-1 ml-1 uppercase">Password</label>
              <input
                type="password"
                formControlName="password"
                class="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-sky-400/50 focus:bg-white/20 transition-all text-sm shadow-inner"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-white/70 mb-1 ml-1 uppercase">Confirm Password</label>
              <input
                type="password"
                formControlName="confirmPassword"
                class="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-sky-400/50 focus:bg-white/20 transition-all text-sm shadow-inner"
                placeholder="••••••••"
              />
              <p *ngIf="registerForm.get('confirmPassword')?.touched && registerForm.hasError('mismatch')" class="text-xs text-red-400 mt-2 ml-1">
                Les mots de passe ne correspondent pas.
              </p>
            </div>

            <div *ngIf="errorMessage" class="bg-red-500/20 border border-red-500/50 text-red-100 text-xs px-4 py-3 rounded-2xl">
              {{ errorMessage }}
            </div>

            <button
              type="submit"
              [disabled]="registerForm.invalid || isLoading"
              class="w-full mt-4 py-4 rounded-2xl text-sm font-bold text-white uppercase tracking-widest transition-all
                     bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500
                     shadow-lg shadow-sky-500/30 active:scale-[0.98] disabled:opacity-50"
            >
              {{ isLoading ? 'Création...' : 'SIGN UP' }}
            </button>
          </form>

          <div class="mt-8 text-center pt-6 border-t border-white/10">
            <p class="text-xs text-white/50 font-medium lowercase">
              Already have an account? 
              <a routerLink="/login" class="text-sky-400 hover:text-sky-300 ml-1 font-bold uppercase decoration-2 underline-offset-4">Log In</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
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