import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-register-page',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-slate-300">
      <div class="max-w-5xl w-full mx-4 bg-slate-800/90 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        <!-- Colonne image -->
        <div class="md:w-1/2 bg-slate-300 relative">
          <img
            src="/signup-illustration.jpg"
            alt="Illustration JobFinder"
            class="h-full w-full object-cover md:rounded-l-3xl"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-slate-900/70 to-transparent"></div>
        </div>

        <!-- Colonne formulaire -->
        <div class="md:w-1/2 p-8 md:p-10 flex flex-col justify-center text-slate-100">
          <div class="mb-6">
            <h2 class="text-3xl font-semibold">Créer un compte</h2>
            <p class="mt-2 text-sm text-slate-300">
              Vous avez déjà un compte ?
              <a routerLink="/login" class="text-violet-400 hover:text-violet-300 font-medium">
                Se connecter
              </a>
            </p>
          </div>

          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-5">
            <!-- Prénom / Nom -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-slate-200 mb-1">Prénom</label>
                <input
                  type="text"
                  formControlName="firstName"
                  class="w-full px-3 py-2 rounded-xl bg-slate-900/70 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm"
                  placeholder="Jean"
                />
                <p *ngIf="registerForm.get('firstName')?.touched && registerForm.get('firstName')?.invalid"
                   class="text-xs text-red-400 mt-1">
                  Le prénom est obligatoire.
                </p>
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-200 mb-1">Nom</label>
                <input
                  type="text"
                  formControlName="lastName"
                  class="w-full px-3 py-2 rounded-xl bg-slate-900/70 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm"
                  placeholder="Dupont"
                />
                <p *ngIf="registerForm.get('lastName')?.touched && registerForm.get('lastName')?.invalid"
                   class="text-xs text-red-400 mt-1">
                  Le nom est obligatoire.
                </p>
              </div>
            </div>

            <!-- Email -->
            <div>
              <label class="block text-sm font-medium text-slate-200 mb-1">Email</label>
              <input
                type="email"
                formControlName="email"
                class="w-full px-3 py-2 rounded-xl bg-slate-900/70 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm"
                placeholder="jean.dupont@example.com"
              />
              <p *ngIf="registerForm.get('email')?.touched && registerForm.get('email')?.invalid"
                 class="text-xs text-red-400 mt-1">
                Email invalide.
              </p>
            </div>

            <!-- Mot de passe -->
            <div>
              <label class="block text-sm font-medium text-slate-200 mb-1">Mot de passe</label>
              <input
                type="password"
                formControlName="password"
                class="w-full px-3 py-2 rounded-xl bg-slate-900/70 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm"
                placeholder="••••••••"
              />
              <p *ngIf="registerForm.get('password')?.touched && registerForm.get('password')?.invalid"
                 class="text-xs text-red-400 mt-1">
                Le mot de passe doit faire au moins 6 caractères.
              </p>
            </div>

            <!-- Confirmation -->
            <div>
              <label class="block text-sm font-medium text-slate-200 mb-1">Confirmer le mot de passe</label>
              <input
                type="password"
                formControlName="confirmPassword"
                class="w-full px-3 py-2 rounded-xl bg-slate-900/70 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm"
                placeholder="••••••••"
              />
              <p *ngIf="registerForm.get('confirmPassword')?.touched && registerForm.hasError('mismatch')"
                 class="text-xs text-red-400 mt-1">
                Les mots de passe ne correspondent pas.
              </p>
            </div>

            <!-- Checkbox CGU -->
            <div class="flex items-start gap-2 text-xs text-slate-300">
              <input
                type="checkbox"
                class="mt-1 h-4 w-4 rounded border-slate-600 bg-slate-900 checked:bg-violet-500 focus:ring-violet-500"
              />
              <span>
                J'accepte les
                <a href="#" class="text-violet-400 hover:text-violet-300 underline">
                  conditions générales
                </a>
                de JobFinder.
              </span>
            </div>

            <!-- Erreur globale -->
            <div *ngIf="errorMessage" class="bg-red-900/40 border border-red-500 text-red-200 text-sm px-3 py-2 rounded-lg">
              {{ errorMessage }}
            </div>

            <!-- Bouton -->
            <button
              type="submit"
              [disabled]="registerForm.invalid || isLoading"
              class="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-60 text-sm font-medium text-white transition-colors">
              {{ isLoading ? 'Création en cours...' : "Créer mon compte" }}
            </button>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container { max-width: 400px; margin: 2rem auto; padding: 1rem; border: 1px solid #ccc; border-radius: 8px; }
    .form-group { margin-bottom: 1rem; }
    .form-control { width: 100%; padding: 8px; box-sizing: border-box; }
    .error { color: red; font-size: 12px; }
    .alert-error { background: #f8d7da; color: #721c24; padding: 10px; border-radius: 4px; margin-bottom: 1rem; }
    .btn { width: 100%; padding: 10px; background: #007bff; color: white; border: none; cursor: pointer; }
    .btn:disabled { background: #ccc; }
  `]
})
export class RegisterPageComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  isLoading = false;
  errorMessage = '';

  registerForm = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required]
  }, { validators: this.passwordMatchValidator });

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    return password && confirmPassword && password.value !== confirmPassword.value ? { mismatch: true } : null;
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.isLoading = true;
      const { confirmPassword, ...userData } = this.registerForm.value;
      
      this.authService.register(userData as any).subscribe({
        next: () => {
          this.router.navigate(['/login']);
        },
        error: (err) => {
          this.errorMessage = err.message || "Une erreur est survenue lors de l'inscription.";
          this.isLoading = false;
        }
      });
    }
  }
}