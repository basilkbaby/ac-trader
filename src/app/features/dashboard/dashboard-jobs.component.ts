import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { getMockJobRequests, updateJobStatus } from '../../core/mock/mock-data';
import { JobRequest, JobStatus } from '../../core/models/models';

type JobTab = 'pending' | 'active' | 'completed';

@Component({
  selector: 'app-dashboard-jobs',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="jobs-page">
      <div class="jobs-header">
        <h1>Jobs</h1>
        <div class="jobs-summary">
          <div class="summary-chip chip-pending">{{ counts().pending }} new</div>
          <div class="summary-chip chip-active">{{ counts().active }} active</div>
          <div class="summary-chip chip-done">{{ counts().completed }} completed</div>
        </div>
      </div>

      <div class="jobs-tabs">
        <button class="job-tab" [class.active]="tab() === 'pending'"   (click)="tab.set('pending')">
          New requests @if (counts().pending) { <span class="tab-badge">{{ counts().pending }}</span> }
        </button>
        <button class="job-tab" [class.active]="tab() === 'active'"    (click)="tab.set('active')">Active</button>
        <button class="job-tab" [class.active]="tab() === 'completed'" (click)="tab.set('completed')">Completed</button>
      </div>

      <div class="jobs-list">
        @if (visibleJobs().length === 0) {
          <div class="jobs-empty">No {{ tab() }} jobs right now.</div>
        }
        @for (job of visibleJobs(); track job.id) {
          <div class="job-card">
            <div class="job-card-header">
              <div class="job-type-badge">{{ job.jobType }}</div>
              <span class="job-ref">{{ job.bookingRef }}</span>
              <span class="job-date">Requested {{ job.createdAt | date:'d MMM' }}</span>
            </div>

            <div class="job-card-body">
              <div class="job-customer">
                <div class="job-customer-avatar">{{ initials(job.customerName) }}</div>
                <div class="job-customer-info">
                  <strong>{{ job.customerName }}</strong>
                  <span>{{ job.address }}</span>
                  <span>{{ job.postcode }}</span>
                </div>
              </div>

              <div class="job-meta-grid">
                <div class="job-meta-item">
                  <span class="job-meta-label">Job type</span>
                  <span>{{ job.jobType }}</span>
                </div>
                <div class="job-meta-item">
                  <span class="job-meta-label">Property</span>
                  <span>{{ propertyLabel(job.propertyType) }}, {{ job.roomSizeM2 }}m²</span>
                </div>
                <div class="job-meta-item">
                  <span class="job-meta-label">Preferred date</span>
                  <span>{{ job.preferredDate | date:'EEE d MMM yyyy' }}</span>
                </div>
                <div class="job-meta-item">
                  <span class="job-meta-label">Quote range</span>
                  <span class="job-quote">{{ job.quoteRange }}</span>
                </div>
              </div>

              @if (job.notes) {
                <div class="job-notes">
                  <span class="job-notes-label">Customer notes:</span> {{ job.notes }}
                </div>
              }
            </div>

            <div class="job-card-footer">
              @if (job.status === 'pending') {
                <button class="btn-primary btn-sm" (click)="accept(job.id)">Accept job</button>
                <button class="btn-secondary btn-sm" (click)="decline(job.id)">Decline</button>
              }
              @if (job.status === 'accepted') {
                <button class="btn-primary btn-sm" (click)="markActive(job.id)">Mark as started</button>
                <button class="btn-secondary btn-sm" (click)="contactCustomer(job)">Contact customer</button>
              }
              @if (job.status === 'active') {
                <button class="btn-primary btn-sm" (click)="markComplete(job.id)">Mark as complete</button>
                <button class="btn-secondary btn-sm" (click)="contactCustomer(job)">Contact customer</button>
              }
              @if (job.status === 'completed') {
                <span class="job-completed-label">✓ Completed {{ job.preferredDate | date:'d MMM' }}</span>
                <a routerLink="/dashboard/invoices" class="btn-secondary btn-sm">📄 Create invoice</a>
              }
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .jobs-page { max-width: 800px; }

    .jobs-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
    .jobs-header h1 { font-size: 1.4rem; margin: 0; }
    .jobs-summary { display: flex; gap: 0.5rem; flex-wrap: wrap; }
    .summary-chip {
      font-size: 0.75rem; font-weight: 700;
      padding: 0.2rem 0.6rem; border-radius: 999px;
      text-transform: uppercase; letter-spacing: 0.04em;
    }
    .chip-pending  { background: #fef3c7; color: #92400e; }
    .chip-active   { background: #dbeafe; color: #1e40af; }
    .chip-done     { background: #d1fae5; color: #065f46; }

    .jobs-tabs {
      display: flex;
      border-bottom: 2px solid #e5e7eb;
      margin-bottom: 1.5rem;
      gap: 0;
    }
    .job-tab {
      padding: 0.6rem 1.25rem;
      border: none; background: none;
      font-size: 0.88rem; font-weight: 500;
      color: #6b7280; cursor: pointer;
      border-bottom: 2px solid transparent;
      margin-bottom: -2px;
      display: flex; align-items: center; gap: 0.4rem;
    }
    .job-tab.active { color: #1e3a5f; border-bottom-color: #1e3a5f; }
    .tab-badge {
      background: #1e3a5f; color: white;
      font-size: 0.7rem; font-weight: 700;
      padding: 0.1rem 0.4rem; border-radius: 999px;
    }

    .jobs-list { display: flex; flex-direction: column; gap: 1rem; }
    .jobs-empty { color: #9ca3af; font-size: 0.9rem; padding: 2rem 0; text-align: center; }

    .job-card {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 14px;
      overflow: hidden;
    }
    .job-card-header {
      display: flex; align-items: center; gap: 0.75rem;
      padding: 0.75rem 1.25rem;
      background: #f9fafb;
      border-bottom: 1px solid #f3f4f6;
      flex-wrap: wrap;
    }
    .job-type-badge {
      background: #1e3a5f; color: white;
      font-size: 0.75rem; font-weight: 600;
      padding: 0.2rem 0.6rem; border-radius: 999px;
    }
    .job-ref { font-size: 0.8rem; color: #9ca3af; }
    .job-date { font-size: 0.78rem; color: #9ca3af; margin-left: auto; }

    .job-card-body { padding: 1.25rem; display: flex; flex-direction: column; gap: 1rem; }

    .job-customer { display: flex; gap: 0.75rem; align-items: flex-start; }
    .job-customer-avatar {
      width: 38px; height: 38px; border-radius: 50%;
      background: #e5e7eb; display: flex; align-items: center; justify-content: center;
      font-size: 0.8rem; font-weight: 700; color: #374151; flex-shrink: 0;
    }
    .job-customer-info { display: flex; flex-direction: column; gap: 0.15rem; }
    .job-customer-info strong { font-size: 0.95rem; }
    .job-customer-info span { font-size: 0.82rem; color: #6b7280; }

    .job-meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
    .job-meta-item { display: flex; flex-direction: column; gap: 0.15rem; }
    .job-meta-label { font-size: 0.72rem; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.04em; font-weight: 600; }
    .job-meta-item span:last-child { font-size: 0.88rem; color: #374151; }
    .job-quote { font-weight: 700; color: #111827; }

    .job-notes {
      background: #fffbeb;
      border: 1px solid #fcd34d;
      border-radius: 8px;
      padding: 0.6rem 0.85rem;
      font-size: 0.85rem;
      color: #78350f;
    }
    .job-notes-label { font-weight: 600; }

    .job-card-footer {
      display: flex; align-items: center; gap: 0.75rem;
      padding: 0.85rem 1.25rem;
      border-top: 1px solid #f3f4f6;
      background: #fafafa;
      flex-wrap: wrap;
    }
    .job-completed-label { font-size: 0.85rem; color: #059669; font-weight: 600; }

    @media (max-width: 480px) {
      .job-meta-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class DashboardJobsComponent {
  auth = inject(AuthService);
  tab  = signal<JobTab>('pending');

  private _jobs = signal<JobRequest[]>(getMockJobRequests(this.auth.currentUser()!.engineerId!));

  visibleJobs = computed(() => {
    const t = this.tab();
    if (t === 'active') return this._jobs().filter(j => j.status === 'accepted' || j.status === 'active');
    return this._jobs().filter(j => j.status === t);
  });

  counts = computed(() => ({
    pending:   this._jobs().filter(j => j.status === 'pending').length,
    active:    this._jobs().filter(j => j.status === 'accepted' || j.status === 'active').length,
    completed: this._jobs().filter(j => j.status === 'completed').length,
  }));

  accept(id: number)       { this.mutate(id, 'accepted'); }
  decline(id: number)      { this.mutate(id, 'declined'); }
  markActive(id: number)   { this.mutate(id, 'active'); }
  markComplete(id: number) { this.mutate(id, 'completed'); this.tab.set('completed'); }

  contactCustomer(job: JobRequest) {
    window.open(`tel:${job.customerPhone}`);
  }

  private mutate(id: number, status: JobStatus) {
    updateJobStatus(id, status);
    this._jobs.set(getMockJobRequests(this.auth.currentUser()!.engineerId!));
  }

  initials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  propertyLabel(type: string): string {
    const map: Record<string, string> = { flat: 'Flat', terr: 'Terraced', semi: 'Semi-detached', det: 'Detached', comm: 'Commercial' };
    return map[type] ?? type;
  }
}
