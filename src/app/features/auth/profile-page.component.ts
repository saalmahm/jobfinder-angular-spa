import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';

@Component({
  standalone: true,
  selector: 'app-profile-page',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile-page.component.html',
})
export class ProfilePageComponent implements OnInit {
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  user: Omit<User, 'password'> | null = null;

  isEditing = false;
  isLoading = false;
  errorMessage = '';

  initials = 'U';
  fullName = '';
  nickName = '';

  profileForm = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
  });

  ngOnInit() {
    this.user = this.authService.getCurrentUser();
    if (!this.user) {
      this.router.navigate(['/login']);
      return;
    }

    this.refreshComputedFields();
    this.fillForm();
  }

  private refreshComputedFields(): void {
    const first = (this.user?.firstName || '').trim();
    const last = (this.user?.lastName || '').trim();
    const name = `${first} ${last}`.trim();

    this.fullName = name;
    this.nickName = first || '—';

    const a = first?.[0] ?? '';
    const b = last?.[0] ?? '';
    const init = `${a}${b}`.toUpperCase().trim();
    this.initials = init || (this.user?.email?.[0]?.toUpperCase() ?? 'U');
  }

  toggleEdit(value: boolean) {
    this.isEditing = value;
    this.errorMessage = '';
    if (!this.isEditing) this.fillForm();
  }

  fillForm() {
    if (!this.user) return;

    this.profileForm.patchValue({
      firstName: this.user.firstName,
      lastName: this.user.lastName,
      email: this.user.email,
    });
  }

  onSubmit() {
    if (this.profileForm.invalid || !this.user?.id) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.updateUser(this.user.id, this.profileForm.value as any).subscribe({
      next: (updatedUser) => {
        this.user = updatedUser;
        this.refreshComputedFields();
        this.isEditing = false;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to update profile.';
        this.isLoading = false;
      },
    });
  }

  onDeleteAccount() {
    if (!this.user?.id) return;

    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      this.authService.deleteUser(this.user.id).subscribe({
        next: () => this.router.navigate(['/']),
        error: () => alert('An error occurred while deleting your account.'),
      });
    }
  }
}