import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { getMockJobRequests, MOCK_MONTHLY_EARNINGS } from '../../core/mock/mock-data';

@Component({
  selector: 'app-dashboard-overview',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="overview">

      <!-- Page title row -->
      <div class="ov-titlerow">
        <div>
          <h1>Good {{ greeting() }}, {{ firstName() }}</h1>
          <p class="ov-date">{{ today | date:'EEEE d MMMM yyyy' }}</p>
        </div>
        <span class="verified-badge">✓ F-Gas Verified</span>
      </div>

      <!-- Metrics bar -->
      <div class="metrics-bar">
        <div class="metric">
          <span class="metric-val">£{{ currentMonthEarnings | number }}</span>
          <span class="metric-lbl">This month</span>
          <span class="metric-delta up">+12%</span>
        </div>
        <div class="metric-div"></div>
        <div class="metric">
          <span class="metric-val warn">£{{ outstandingAmount | number }}</span>
          <span class="metric-lbl">Outstanding</span>
          <span class="metric-delta">{{ outstandingCount }} invoices</span>
        </div>
        <div class="metric-div"></div>
        <div class="metric">
          <span class="metric-val">{{ completedThisMonth }}</span>
          <span class="metric-lbl">Jobs done</span>
          <span class="metric-delta up">{{ pendingCount }} pending</span>
        </div>
        <div class="metric-div"></div>
        <div class="metric">
          <span class="metric-val">4.9 <span class="metric-star">&#9733;</span></span>
          <span class="metric-lbl">Rating</span>
          <span class="metric-delta">312 reviews</span>
        </div>
      </div>

      <!-- Alert -->
      @if (pendingJobs().length > 0) {
        <div class="alert-row">
          <span class="alert-pip"></span>
          <span class="alert-msg">
            <strong>{{ pendingJobs().length }} new job request{{ pendingJobs().length > 1 ? 's' : '' }}</strong>
            - respond within 2 hours for best acceptance rate
          </span>
          <a routerLink="/dashboard/jobs" class="alert-link">View →</a>
        </div>
      }

      <!-- Two-column body -->
      <div class="ov-body">

        <!-- Upcoming jobs -->
        <div class="ov-card">
          <div class="ov-card-header">
            <h2>Upcoming jobs</h2>
            <a routerLink="/dashboard/jobs" class="ov-card-link">All jobs →</a>
          </div>
          <div class="job-rows">
            @if (upcomingJobs().length === 0) {
              <div class="ov-empty">No upcoming jobs.</div>
            }
            @for (job of upcomingJobs(); track job.id) {
              <div class="job-row">
                <div class="job-row-date">
                  <span class="jd-day">{{ job.preferredDate | date:'d' }}</span>
                  <span class="jd-mon">{{ job.preferredDate | date:'MMM' }}</span>
                </div>
                <div class="job-row-info">
                  <span class="job-row-type">{{ job.jobType }}</span>
                  <span class="job-row-sub">{{ job.customerName }} · {{ job.postcode }}</span>
                </div>
                <div class="job-row-right">
                  <span class="job-row-price">{{ job.quoteRange }}</span>
                  <span class="jstatus" [class]="'js-' + job.status">{{ job.status }}</span>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Earnings chart -->
        <div class="ov-card">
          <div class="ov-card-header">
            <h2>Earnings (6 months)</h2>
            <span class="ov-card-total">£{{ totalEarnings | number }} total</span>
          </div>
          <div class="chart-wrap">
            @for (entry of earnings; track entry.month) {
              <div class="chart-col">
                <div class="chart-bar-wrap">
                  <div class="chart-bar" [style.height.%]="barHeight(entry.amount)"
                       [class.bar-current]="isCurrentMonth(entry.month)"></div>
                </div>
                <span class="chart-mon">{{ entry.month }}</span>
              </div>
            }
          </div>
          <div class="chart-legend">
            @for (entry of earnings; track entry.month) {
              <span class="chart-amt" [class.amt-current]="isCurrentMonth(entry.month)">
                £{{ (entry.amount / 1000).toFixed(1) }}k
              </span>
            }
          </div>
        </div>

      </div>

      <!-- Quick actions -->
      <div class="quick-actions">
        <a routerLink="/dashboard/quotes/new" class="qa qa-primary">
          <span class="qa-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 7h8M8 11h2M8 15h2M14 11h2M14 15h2"/></svg></span>New quote
        </a>
        <a routerLink="/dashboard/invoices" class="qa">
          <span class="qa-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2h8l4 4v16H6z"/><path d="M14 2v4h4M9 13h6M9 17h6"/></svg></span>New invoice
        </a>
        <a routerLink="/dashboard/jobs" class="qa">
          <span class="qa-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></svg></span>View jobs
        </a>
        <a routerLink="/dashboard/profile" class="qa">
          <span class="qa-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg></span>Edit profile
        </a>
        <a routerLink="/engineers/1" class="qa">
          <span class="qa-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg></span>Public profile
        </a>
      </div>

    </div>
  `,
  styles: [`
    .overview { display: flex; flex-direction: column; gap: 1.1rem; max-width: 900px; }

    /* Title row */
    .ov-titlerow { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; }
    .ov-titlerow h1 { font-size: 1.25rem; font-weight: 700; margin: 0 0 0.15rem; }
    .ov-date { font-size: 0.78rem; color: var(--text-muted); margin: 0; }
    .verified-badge {
      font-size: 0.72rem; font-weight: 700; padding: 0.25rem 0.7rem;
      border-radius: 999px; background: #f0fdf4; border: 1px solid #bbf7d0; color: #065f46;
      white-space: nowrap; margin-top: 0.1rem;
    }

    /* Metrics bar */
    .metrics-bar {
      display: flex; align-items: center;
      background: white; border: 1px solid var(--border); border-radius: 12px;
      padding: 0; overflow: hidden;
    }
    .metric {
      flex: 1; display: flex; flex-direction: column; gap: 0.15rem;
      padding: 0.85rem 1.1rem;
    }
    .metric-val { font-size: 1.25rem; font-weight: 700; color: var(--text-primary); line-height: 1; }
    .metric-val.warn { color: #d97706; }
    .metric-lbl { font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.04em; }
    .metric-delta { font-size: 0.72rem; color: var(--text-muted); }
    .metric-delta.up { color: #059669; }
    .metric-div { width: 1px; background: var(--border); align-self: stretch; }

    /* Alert */
    .alert-row {
      display: flex; align-items: center; gap: 0.65rem;
      background: #fffbeb; border: 1px solid #fcd34d; border-radius: 10px;
      padding: 0.65rem 1rem; font-size: 0.83rem;
    }
    .alert-pip { width: 6px; height: 6px; border-radius: 50%; background: #f59e0b; flex-shrink: 0; }
    .alert-msg { flex: 1; color: var(--text-primary); }
    .alert-msg strong { color: #92400e; }
    .alert-link { font-size: 0.8rem; font-weight: 700; color: var(--brand); text-decoration: none; white-space: nowrap; }

    /* Body grid */
    .ov-body { display: grid; grid-template-columns: 1fr 1fr; gap: 1.1rem; }

    .ov-card { background: white; border: 1px solid var(--border); border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); overflow: hidden; }
    .ov-card-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 0.85rem 1rem; border-bottom: 1px solid var(--border);
    }
    .ov-card-header h2 { font-size: 0.82rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: var(--text-secondary); margin: 0; }
    .ov-card-link  { font-size: 0.78rem; color: var(--brand); text-decoration: none; }
    .ov-card-total { font-size: 0.78rem; color: var(--text-muted); }
    .ov-empty { padding: 1.5rem 1rem; font-size: 0.83rem; color: var(--text-muted); text-align: center; }

    /* Job rows */
    .job-rows { display: flex; flex-direction: column; }
    .job-row {
      display: flex; align-items: center; gap: 0.75rem;
      padding: 0.65rem 1rem; border-bottom: 1px solid var(--bg);
    }
    .job-row:last-child { border-bottom: none; }
    .job-row-date {
      width: 32px; flex-shrink: 0; text-align: center;
      background: var(--brand-light); border-radius: 6px; padding: 0.25rem 0;
    }
    .jd-day { display: block; font-size: 0.95rem; font-weight: 700; color: var(--brand); line-height: 1; }
    .jd-mon { display: block; font-size: 0.6rem; text-transform: uppercase; color: #93c5fd; font-weight: 600; }
    .job-row-info { flex: 1; min-width: 0; }
    .job-row-type { display: block; font-size: 0.83rem; font-weight: 600; color: var(--text-primary); }
    .job-row-sub  { display: block; font-size: 0.75rem; color: var(--text-muted); }
    .job-row-right { display: flex; flex-direction: column; align-items: flex-end; gap: 0.2rem; flex-shrink: 0; }
    .job-row-price { font-size: 0.78rem; color: #059669; font-weight: 600; }
    .jstatus { font-size: 0.62rem; font-weight: 700; text-transform: uppercase; padding: 0.1rem 0.4rem; border-radius: 999px; }
    .js-pending  { background: #fef3c7; color: #92400e; }
    .js-accepted { background: #d1fae5; color: #065f46; }
    .js-active   { background: #dbeafe; color: #1e40af; }

    /* Chart */
    .chart-wrap {
      display: flex; align-items: flex-end; gap: 0.35rem;
      height: 90px; padding: 0.75rem 1rem 0;
    }
    .chart-col { flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%; justify-content: flex-end; }
    .chart-bar-wrap { flex: 1; width: 100%; display: flex; align-items: flex-end; }
    .chart-bar {
      width: 100%; background: #bfdbfe; border-radius: 3px 3px 0 0;
      transition: height 0.3s; min-height: 3px;
    }
    .chart-bar.bar-current { background: var(--brand); }
    .chart-mon { font-size: 0.62rem; color: var(--text-muted); margin-top: 0.2rem; }
    .chart-legend {
      display: flex; padding: 0 1rem 0.75rem;
    }
    .chart-amt { flex: 1; font-size: 0.62rem; color: var(--text-muted); text-align: center; }
    .chart-amt.amt-current { color: var(--brand); font-weight: 700; }

    /* Quick actions */
    .quick-actions { display: flex; gap: 0.65rem; }
    .qa {
      flex: 1; display: flex; align-items: center; justify-content: center; gap: 0.4rem;
      padding: 0.65rem 0.5rem; background: white; border: 1px solid var(--border);
      border-radius: 10px; text-decoration: none; color: var(--text-primary);
      font-size: 0.8rem; font-weight: 500; transition: all 0.12s;
    }
    .qa:hover { background: var(--brand-light); border-color: #93c5fd; color: var(--brand); }
    .qa-ico { display: inline-flex; align-items: center; justify-content: center; color: var(--brand); }
    .qa-ico svg { width: 17px; height: 17px; }
    .qa-primary { background: var(--brand); border-color: var(--brand); color: #fff; }
    .qa-primary .qa-ico { color: #fff; }
    .qa-primary:hover { background: var(--brand-dark); border-color: var(--brand-dark); color: #fff; }
    .metric-star { color: var(--gold); }

    @media (max-width: 700px) {
      .ov-body { grid-template-columns: 1fr; }
      .metrics-bar { flex-wrap: wrap; }
      .metric { min-width: 45%; }
      .quick-actions { flex-wrap: wrap; }
      .qa { min-width: calc(50% - 0.35rem); }
    }
  `]
})
export class DashboardOverviewComponent {
  auth    = inject(AuthService);
  today   = new Date();
  earnings = MOCK_MONTHLY_EARNINGS;

  greeting() {
    const h = new Date().getHours();
    return h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening';
  }
  firstName() { return this.auth.currentUser()?.fullName.split(' ')[0] ?? ''; }

  private allJobs() { return getMockJobRequests(this.auth.currentUser()!.engineerId!); }
  pendingJobs()     { return this.allJobs().filter(j => j.status === 'pending'); }
  upcomingJobs()    { return this.allJobs().filter(j => ['accepted', 'active', 'pending'].includes(j.status)).slice(0, 5); }

  get pendingCount()         { return this.pendingJobs().length; }
  get completedThisMonth()   { return this.allJobs().filter(j => j.status === 'completed').length; }
  get currentMonthEarnings() { return MOCK_MONTHLY_EARNINGS[MOCK_MONTHLY_EARNINGS.length - 1].amount; }
  get outstandingAmount()    { return 1240; }
  get outstandingCount()     { return 2; }
  get totalEarnings()        { return MOCK_MONTHLY_EARNINGS.reduce((s, e) => s + e.amount, 0); }

  barHeight(amount: number): number {
    const max = Math.max(...MOCK_MONTHLY_EARNINGS.map(e => e.amount));
    return Math.round((amount / max) * 100);
  }

  isCurrentMonth(month: string): boolean {
    return month === MOCK_MONTHLY_EARNINGS[MOCK_MONTHLY_EARNINGS.length - 1].month;
  }
}
