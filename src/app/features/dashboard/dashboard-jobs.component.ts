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

      <!-- Title row -->
      <div class="jobs-titlerow">
        <div>
          <h1>Jobs</h1>
          <p class="jobs-sub">{{ counts().pending }} new · {{ counts().active }} active · {{ counts().completed }} completed</p>
        </div>
      </div>

      <!-- Metrics bar -->
      <div class="metrics-bar">
        <div class="metric">
          <span class="metric-val warn">{{ counts().pending }}</span>
          <span class="metric-lbl">New requests</span>
        </div>
        <div class="metric-div"></div>
        <div class="metric">
          <span class="metric-val">{{ counts().active }}</span>
          <span class="metric-lbl">Active jobs</span>
        </div>
        <div class="metric-div"></div>
        <div class="metric">
          <span class="metric-val">{{ counts().completed }}</span>
          <span class="metric-lbl">Completed</span>
        </div>
        <div class="metric-div"></div>
        <div class="metric">
          <span class="metric-val">{{ counts().pending + counts().active + counts().completed }}</span>
          <span class="metric-lbl">Total</span>
        </div>
      </div>

      <!-- Tabs -->
      <div class="jobs-tabs">
        <button class="job-tab" [class.active]="tab() === 'pending'" (click)="tab.set('pending')">
          New requests
          @if (counts().pending) { <span class="tab-badge">{{ counts().pending }}</span> }
        </button>
        <button class="job-tab" [class.active]="tab() === 'active'"    (click)="tab.set('active')">Active</button>
        <button class="job-tab" [class.active]="tab() === 'completed'" (click)="tab.set('completed')">Completed</button>
      </div>

      <!-- Job list -->
      <div class="jobs-card">
        @if (visibleJobs().length === 0) {
          <div class="jobs-empty">No {{ tab() }} jobs right now.</div>
        }
        @for (job of visibleJobs(); track job.id) {
          <div class="job-row" [class.expanded]="expanded() === job.id">

            <!-- Main row -->
            <div class="job-row-main" (click)="toggle(job.id)">
              <div class="job-date-badge">
                <span class="jdb-day">{{ job.preferredDate | date:'d' }}</span>
                <span class="jdb-mon">{{ job.preferredDate | date:'MMM' }}</span>
              </div>

              <div class="job-row-info">
                <div class="job-row-top">
                  <span class="job-type">{{ job.jobType }}</span>
                  <span class="job-ref">{{ job.bookingRef }}</span>
                </div>
                <div class="job-row-sub">
                  <span class="job-customer-name">{{ job.customerName }}</span>
                  <span class="sep">·</span>
                  <span>{{ job.postcode }}</span>
                  <span class="sep">·</span>
                  <span>{{ propertyLabel(job.propertyType) }}, {{ job.roomSizeM2 }}m²</span>
                </div>
              </div>

              <div class="job-row-right">
                <span class="job-price">{{ job.quoteRange }}</span>
                <span class="jstatus" [class]="'js-' + job.status">{{ statusLabel(job.status) }}</span>
              </div>

              <span class="job-chevron" [class.open]="expanded() === job.id">›</span>
            </div>

            <!-- Expanded detail -->
            @if (expanded() === job.id) {
              <div class="job-detail">
                <div class="job-detail-grid">
                  <div class="jd-item">
                    <span class="jd-label">Customer</span>
                    <span>{{ job.customerName }}</span>
                  </div>
                  <div class="jd-item">
                    <span class="jd-label">Phone</span>
                    <a [href]="'tel:' + job.customerPhone" class="jd-phone">{{ job.customerPhone }}</a>
                  </div>
                  <div class="jd-item">
                    <span class="jd-label">Address</span>
                    <span>{{ job.address }}, {{ job.postcode }}</span>
                  </div>
                  <div class="jd-item">
                    <span class="jd-label">Preferred date</span>
                    <span>{{ job.preferredDate | date:'EEEE d MMM yyyy' }}</span>
                  </div>
                  <div class="jd-item">
                    <span class="jd-label">Quote range</span>
                    <span class="jd-price">{{ job.quoteRange }}</span>
                  </div>
                  <div class="jd-item">
                    <span class="jd-label">Requested</span>
                    <span>{{ job.createdAt | date:'d MMM yyyy' }}</span>
                  </div>
                </div>

                @if (job.notes) {
                  <div class="job-notes">
                    <span class="job-notes-lbl">Customer notes</span>
                    {{ job.notes }}
                  </div>
                }

                <div class="job-actions">
                  @if (job.status === 'pending') {
                    <button class="btn-primary btn-sm" (click)="accept(job.id)">Accept job</button>
                    <button class="btn-secondary btn-sm" (click)="decline(job.id)">Decline</button>
                  }
                  @if (job.status === 'accepted') {
                    <button class="btn-primary btn-sm" (click)="markActive(job.id)">Mark as started</button>
                    <button class="btn-secondary btn-sm" (click)="contactCustomer(job)">Call customer</button>
                  }
                  @if (job.status === 'active') {
                    <button class="btn-primary btn-sm" (click)="markComplete(job.id)">Mark as complete</button>
                    <button class="btn-secondary btn-sm" (click)="contactCustomer(job)">Call customer</button>
                  }
                  @if (job.status === 'completed') {
                    <span class="job-done-lbl">&#10003; Completed</span>
                    <a routerLink="/dashboard/quotes/new" class="btn-secondary btn-sm">New quote</a>
                    <a routerLink="/dashboard/invoices" class="btn-secondary btn-sm">Create invoice</a>
                  }
                </div>
              </div>
            }

          </div>
        }
      </div>

    </div>
  `,
  styles: [`
    .jobs-page { display: flex; flex-direction: column; gap: 1.1rem; max-width: 860px; }

    /* Title */
    .jobs-titlerow h1 { font-size: 1.25rem; font-weight: 700; margin: 0 0 0.15rem; }
    .jobs-sub { font-size: 0.78rem; color: var(--text-muted); margin: 0; }

    /* Metrics bar - same as overview */
    .metrics-bar {
      display: flex; align-items: center;
      background: white; border: 1px solid var(--border); border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); overflow: hidden;
    }
    .metric { flex: 1; display: flex; flex-direction: column; gap: 0.15rem; padding: 0.85rem 1.1rem; }
    .metric-val { font-size: 1.25rem; font-weight: 700; color: var(--text-primary); line-height: 1; }
    .metric-val.warn { color: #d97706; }
    .metric-lbl { font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.04em; }
    .metric-div { width: 1px; background: var(--border); align-self: stretch; }

    /* Tabs */
    .jobs-tabs {
      display: flex; border-bottom: 2px solid var(--border); gap: 0;
    }
    .job-tab {
      padding: 0.55rem 1.1rem; border: none; background: none;
      font-size: 0.85rem; font-weight: 500; color: var(--text-secondary); cursor: pointer;
      border-bottom: 2px solid transparent; margin-bottom: -2px;
      display: flex; align-items: center; gap: 0.4rem; transition: all 0.12s;
    }
    .job-tab:hover { color: var(--text-primary); }
    .job-tab.active { color: var(--ink-2); border-bottom-color: var(--ink-2); }
    .tab-badge {
      background: var(--ink-2); color: white;
      font-size: 0.65rem; font-weight: 700; padding: 0.1rem 0.4rem; border-radius: 999px;
    }

    /* Jobs card container */
    .jobs-card {
      background: white; border: 1px solid var(--border); border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); overflow: hidden;
    }
    .jobs-empty { padding: 2.5rem 1rem; text-align: center; font-size: 0.85rem; color: var(--text-muted); }

    /* Job row */
    .job-row { border-bottom: 1px solid var(--border); }
    .job-row:last-child { border-bottom: none; }

    .job-row-main {
      display: flex; align-items: center; gap: 0.85rem;
      padding: 0.75rem 1rem; cursor: pointer; transition: background 0.1s;
    }
    .job-row-main:hover { background: var(--bg); }
    .job-row.expanded .job-row-main { background: var(--bg); }

    .job-date-badge {
      width: 34px; flex-shrink: 0; text-align: center;
      background: var(--brand-light); border-radius: 7px; padding: 0.25rem 0;
    }
    .jdb-day { display: block; font-size: 1rem; font-weight: 700; color: var(--brand); line-height: 1; }
    .jdb-mon { display: block; font-size: 0.6rem; text-transform: uppercase; color: #93c5fd; font-weight: 600; }

    .job-row-info { flex: 1; min-width: 0; }
    .job-row-top { display: flex; align-items: center; gap: 0.55rem; margin-bottom: 0.2rem; }
    .job-type { font-size: 0.85rem; font-weight: 600; color: var(--text-primary); }
    .job-ref  { font-size: 0.72rem; color: var(--text-muted); }
    .job-row-sub { font-size: 0.78rem; color: var(--text-muted); display: flex; gap: 0.35rem; flex-wrap: wrap; align-items: center; }
    .job-customer-name { color: var(--text-secondary); font-weight: 500; }
    .sep { color: var(--border); }

    .job-row-right { display: flex; flex-direction: column; align-items: flex-end; gap: 0.25rem; flex-shrink: 0; }
    .job-price { font-size: 0.8rem; font-weight: 700; color: #059669; }
    .jstatus { font-size: 0.62rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; padding: 0.15rem 0.45rem; border-radius: 999px; }
    .js-pending   { background: #fef3c7; color: #92400e; }
    .js-accepted  { background: #d1fae5; color: #065f46; }
    .js-active    { background: #dbeafe; color: #1e40af; }
    .js-completed { background: var(--border); color: var(--text-primary); }
    .js-declined  { background: #fee2e2; color: #991b1b; }

    .job-chevron {
      font-size: 1.1rem; color: var(--border); flex-shrink: 0;
      transition: transform 0.2s; display: inline-block;
    }
    .job-chevron.open { transform: rotate(90deg); }

    /* Expanded detail */
    .job-detail {
      padding: 0 1rem 1rem 1rem;
      border-top: 1px solid var(--border);
      display: flex; flex-direction: column; gap: 0.85rem;
      background: var(--bg);
    }
    .job-detail-grid {
      display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.65rem;
      padding-top: 0.85rem;
    }
    .jd-item { display: flex; flex-direction: column; gap: 0.15rem; }
    .jd-label { font-size: 0.68rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.04em; }
    .jd-item span:last-child { font-size: 0.83rem; color: var(--text-primary); }
    .jd-price { color: #059669 !important; font-weight: 700 !important; }
    .jd-phone { font-size: 0.83rem; color: var(--brand); text-decoration: none; font-weight: 500; }
    .jd-phone:hover { text-decoration: underline; }

    .job-notes {
      background: #fffbeb; border: 1px solid #fcd34d; border-radius: 8px;
      padding: 0.55rem 0.85rem; font-size: 0.82rem; color: #78350f;
    }
    .job-notes-lbl { font-weight: 700; display: block; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 0.2rem; }

    .job-actions { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
    .job-done-lbl { font-size: 0.82rem; color: #059669; font-weight: 600; }

    @media (max-width: 600px) {
      .job-detail-grid { grid-template-columns: 1fr 1fr; }
      .metrics-bar { flex-wrap: wrap; }
      .metric { min-width: 45%; }
    }
  `]
})
export class DashboardJobsComponent {
  auth     = inject(AuthService);
  tab      = signal<JobTab>('pending');
  expanded = signal<number | null>(null);

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

  toggle(id: number) {
    this.expanded.update(v => v === id ? null : id);
  }

  accept(id: number)       { this.mutate(id, 'accepted'); }
  decline(id: number)      { this.mutate(id, 'declined'); this.expanded.set(null); }
  markActive(id: number)   { this.mutate(id, 'active'); }
  markComplete(id: number) { this.mutate(id, 'completed'); this.tab.set('completed'); }

  contactCustomer(job: JobRequest) { window.open(`tel:${job.customerPhone}`); }

  private mutate(id: number, status: JobStatus) {
    updateJobStatus(id, status);
    this._jobs.set(getMockJobRequests(this.auth.currentUser()!.engineerId!));
  }

  statusLabel(status: string): string {
    const m: Record<string, string> = { pending: 'New', accepted: 'Accepted', active: 'Active', completed: 'Done', declined: 'Declined' };
    return m[status] ?? status;
  }

  propertyLabel(type: string): string {
    const m: Record<string, string> = { flat: 'Flat', terr: 'Terraced', semi: 'Semi-det.', det: 'Detached', comm: 'Commercial' };
    return m[type] ?? type;
  }

  initials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }
}
