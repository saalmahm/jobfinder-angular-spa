import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { Application } from '../../../core/models/application.model';
import { ApplicationsService } from '../services/applications.service';
import { AuthService } from '../../../core/services/auth.service';
import { StatusLabelPipe } from '../../../core/pipes/status-label.pipe';
import { StatusColorPipe } from '../../../core/pipes/status-color.pipe';

@Component({
  standalone: true,
  selector: 'app-applications-page',
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    StatusLabelPipe,
    StatusColorPipe,
  ],
  templateUrl: './applications-page.component.html',
})
export class ApplicationsPageComponent implements OnInit {
  private applicationsService = inject(ApplicationsService);
  private authService = inject(AuthService);
  private router = inject(Router);

  applications: Application[] = [];
  filteredApplications: Application[] = [];
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  selectedStatus: 'all' | 'en_attente' | 'accepte' | 'refuse' = 'all';

  editingNoteId: string | number | null = null;
  editingNoteText = '';

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (!user?.id) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadApplications(user.id);
  }

  loadApplications(userId: string | number): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.applicationsService.getApplicationsByUserId(userId).subscribe({
      next: (apps) => {
        this.applications = apps.sort((a, b) => {
          return (
            new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
          );
        });
        this.applyFilter();
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage =
          err?.status === 0
            ? 'JSON Server non démarré (http://localhost:3000)'
            : 'Erreur lors du chargement des candidatures.';
        this.isLoading = false;
      },
    });
  }

  applyFilter(): void {
    if (this.selectedStatus === 'all') {
      this.filteredApplications = [...this.applications];
    } else {
      this.filteredApplications = this.applications.filter(
        (app) => app.status === this.selectedStatus,
      );
    }
  }

  onFilterChange(status: 'all' | 'en_attente' | 'accepte' | 'refuse'): void {
    this.selectedStatus = status;
    this.applyFilter();
  }

  updateStatus(
    app: Application,
    newStatus: 'en_attente' | 'accepte' | 'refuse',
  ): void {
    if (!app.id) return;

    this.applicationsService
      .updateApplication(app.id, { status: newStatus })
      .subscribe({
        next: (updated) => {
          const index = this.applications.findIndex((a) => a.id === app.id);
          if (index !== -1) {
            this.applications[index] = updated;
            this.applyFilter();
          }
          this.showSuccessMessage('Statut mis à jour avec succès !');
        },
        error: (err) => {
          this.showErrorMessage('Erreur lors de la mise à jour du statut.');
        },
      });
  }

  startEditNote(app: Application): void {
    this.editingNoteId = app.id ?? null;
    this.editingNoteText = app.notes || '';
  }

  cancelEditNote(): void {
    this.editingNoteId = null;
    this.editingNoteText = '';
  }

  saveNote(app: Application): void {
    if (!app.id) return;

    this.applicationsService
      .updateApplication(app.id, { notes: this.editingNoteText })
      .subscribe({
        next: (updated) => {
          const index = this.applications.findIndex((a) => a.id === app.id);
          if (index !== -1) {
            this.applications[index] = updated;
            this.applyFilter();
          }
          this.editingNoteId = null;
          this.editingNoteText = '';
          this.showSuccessMessage('Notes mises à jour avec succès !');
        },
        error: (err) => {
          this.showErrorMessage('Erreur lors de la mise à jour des notes.');
        },
      });
  }

  deleteApplication(app: Application): void {
    if (!app.id) return;

    if (
      !confirm(
        `Êtes-vous sûr de vouloir supprimer cette candidature ?\n"${app.title}"`,
      )
    ) {
      return;
    }

    this.applicationsService.deleteApplication(app.id).subscribe({
      next: () => {
        this.applications = this.applications.filter((a) => a.id !== app.id);
        this.applyFilter();
        this.showSuccessMessage('Candidature supprimée avec succès !');
      },
      error: (err) => {
        this.showErrorMessage(
          'Erreur lors de la suppression de la candidature.',
        );
      },
    });
  }

  openJobUrl(app: Application): void {
    if (!app.url) return;
    window.open(app.url, '_blank', 'noopener');
  }

  getStatistics() {
    const total = this.applications.length;
    const enAttente = this.applications.filter(
      (a) => a.status === 'en_attente',
    ).length;
    const accepte = this.applications.filter(
      (a) => a.status === 'accepte',
    ).length;
    const refuse = this.applications.filter(
      (a) => a.status === 'refuse',
    ).length;

    return { total, enAttente, accepte, refuse };
  }

  showSuccessMessage(message: string): void {
    this.successMessage = message;
    this.errorMessage = '';
    setTimeout(() => {
      this.successMessage = '';
    }, 4000);
  }

  showErrorMessage(message: string): void {
    this.errorMessage = message;
    this.successMessage = '';
    setTimeout(() => {
      this.errorMessage = '';
    }, 4000);
  }

  trackById(_: number, item: Application): string | number {
    return item.id ?? 0;
  }
}
