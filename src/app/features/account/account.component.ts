import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { MOCK_CUSTOMER_BOOKINGS, MOCK_CUSTOMER_PLAN, MOCK_CUSTOMER_AC_SYSTEMS } from '../../core/mock/mock-data';
import { CustomerBooking, CustomerServicePlan, CustomerAcSystem } from '../../core/models/models';

type AccountTab = 'bookings' | 'plan' | 'systems' | 'profile';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-container">
      <div class="account-layout">

        <!-- Left sidebar -->
        <aside class="account-sidebar">
          <div class="sidebar-user">
            <div class="sidebar-avatar">{{ auth.currentUser()!.avatarInitials }}</div>
            <div class="sidebar-user-info">
              <strong>{{ auth.currentUser()!.fullName }}</strong>
              <span>{{ auth.currentUser()!.email }}</span>
            </div>
          </div>

          <nav class="sidebar-nav">
            <button class="snav-item" [class.active]="tab() === 'bookings'" (click)="tab.set('bookings')">
              <span class="snav-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V3h6v1M9 10h6M9 14h6"/></svg></span> Bookings
              <span class="snav-count">{{ bookings.length }}</span>
            </button>
            <button class="snav-item" [class.active]="tab() === 'plan'" (click)="tab.set('plan')">
              <span class="snav-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l7 3v6c0 4-3 7-7 9-4-2-7-5-7-9V6z"/><path d="M9 12l2 2 4-4"/></svg></span> Service plan
              @if (plan) { <span class="snav-badge active">Active</span> }
            </button>
            <button class="snav-item" [class.active]="tab() === 'systems'" (click)="tab.set('systems')">
              <span class="snav-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M2 12h20M5 5l14 14M5 19 19 5"/></svg></span> My AC systems
              <span class="snav-count">{{ systems.length }}</span>
            </button>
            <button class="snav-item" [class.active]="tab() === 'profile'" (click)="tab.set('profile')">
              <span class="snav-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg></span> Profile
            </button>
          </nav>

          <div class="sidebar-actions">
            <a routerLink="/quote" class="btn-primary btn-sm sidebar-cta">+ New booking</a>
          </div>
        </aside>

        <!-- Main content -->
        <main class="account-main">

          <!-- Bookings -->
          @if (tab() === 'bookings') {
            <div class="content-section">
              <div class="content-header">
                <div>
                  <h2>Bookings</h2>
                  <p class="content-sub">{{ bookings.length }} booking{{ bookings.length !== 1 ? 's' : '' }} total</p>
                </div>
              </div>

              @if (bookings.length === 0) {
                <div class="empty-state">
                  <p>No bookings yet - <a routerLink="/quote">get your first quote</a>.</p>
                </div>
              }

              <div class="booking-list">
                @for (b of bookings; track b.id) {
                  <div class="booking-card">
                    <div class="booking-card-main">
                      <div class="booking-status-dot" [class]="'dot-' + b.status"></div>
                      <div class="booking-info">
                        <div class="booking-info-top">
                          <span class="booking-job-type">{{ b.jobType }}</span>
                          <span class="booking-ref">{{ b.bookingRef }}</span>
                          <span class="status-chip" [class]="'chip-' + b.status">{{ statusLabel(b.status) }}</span>
                        </div>
                        <div class="booking-info-row">
                          <span>{{ b.address }}</span>
                          <span class="sep">·</span>
                          <span>{{ b.preferredDate | date:'d MMM yyyy' }}</span>
                          @if (b.engineerName) {
                            <span class="sep">·</span>
                            <span>{{ b.engineerName }}</span>
                          }
                          <span class="sep">·</span>
                          <span class="booking-price">{{ b.quoteRange }}</span>
                        </div>
                      </div>
                    </div>

                    <div class="booking-timeline">
                      @for (step of timelineSteps(b.status); track step.label) {
                        <div class="tl-step" [class.done]="step.done" [class.current]="step.current">
                          <div class="tl-dot"></div>
                          <span>{{ step.label }}</span>
                        </div>
                      }
                      <div class="tl-track"></div>
                    </div>

                    @if (b.status === 'completed') {
                      <div class="booking-card-footer">
                        <button class="btn-sm btn-secondary" (click)="leaveReview(b)">Leave a review</button>
                        <a routerLink="/quote" class="btn-sm btn-text">Rebook</a>
                      </div>
                    }
                  </div>
                }
              </div>
            </div>
          }

          <!-- Service plan -->
          @if (tab() === 'plan') {
            <div class="content-section">
              <div class="content-header">
                <div>
                  <h2>Service plan</h2>
                  <p class="content-sub">{{ plan ? plan.tierName + ' plan - active' : 'No active plan' }}</p>
                </div>
              </div>

              @if (plan) {
                <div class="plan-card">
                  <div class="plan-card-left">
                    <div class="plan-tier-name">{{ plan.tierName }}</div>
                    <div class="plan-tier-sub">Annual service agreement</div>
                    <div class="plan-dates">
                      <div class="plan-date-row">
                        <span>Started</span>
                        <span>{{ plan.startDate | date:'d MMM yyyy' }}</span>
                      </div>
                      <div class="plan-date-row next-service">
                        <span>Next service</span>
                        <strong>{{ plan.nextServiceDate | date:'d MMM yyyy' }}</strong>
                      </div>
                      <div class="plan-date-row">
                        <span>Engineer</span>
                        <span>{{ plan.engineerName }}</span>
                      </div>
                    </div>
                    <div class="plan-actions">
                      <a routerLink="/service-plans" class="btn-secondary btn-sm">Upgrade</a>
                      <button class="btn-text btn-sm">Cancel</button>
                    </div>
                  </div>
                  <div class="plan-card-right">
                    <div class="plan-countdown" [class]="countdownClass()">
                      <div class="countdown-val">{{ daysUntilService() }}</div>
                      <div class="countdown-lbl">days to<br>service</div>
                    </div>
                    <div class="plan-features">
                      <div class="pf-item">✓ Annual full service &amp; gas check</div>
                      @if (plan.tier === 'premium' || plan.tier === 'elite') {
                        <div class="pf-item">✓ 6-month interim check</div>
                        <div class="pf-item">✓ Priority booking</div>
                        <div class="pf-item">✓ 10% off parts</div>
                      }
                      @if (plan.tier === 'elite') {
                        <div class="pf-item">✓ Same-day emergency call-out</div>
                        <div class="pf-item">✓ Refrigerant top-up</div>
                      }
                    </div>
                  </div>
                </div>
              } @else {
                <div class="no-plan">
                  <div class="no-plan-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l7 3v6c0 4-3 7-7 9-4-2-7-5-7-9V6z"/><path d="M9 12l2 2 4-4"/></svg></div>
                  <h3>No active plan</h3>
                  <p>Plans start from £99/yr - keeps your AC efficient and warranty valid.</p>
                  <a routerLink="/service-plans" class="btn-primary btn-sm">Browse plans</a>
                </div>
              }
            </div>
          }

          <!-- AC Systems -->
          @if (tab() === 'systems') {
            <div class="content-section">
              <div class="content-header">
                <div>
                  <h2>My AC systems</h2>
                  <p class="content-sub">Track units, service history, and warranty</p>
                </div>
                <button class="btn-secondary btn-sm">+ Register system</button>
              </div>

              <div class="systems-list">
                @for (sys of systems; track sys.id) {
                  <div class="system-row">
                    <div class="system-row-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M2 12h20M5 5l14 14M5 19 19 5"/></svg></div>
                    <div class="system-row-info">
                      <div class="system-row-top">
                        <strong>{{ sys.nickname }}</strong>
                        <span class="system-model-txt">{{ sys.brand }} {{ sys.model }}</span>
                        <span class="svc-badge" [class]="'svc-' + sys.serviceStatus">{{ serviceStatusLabel(sys.serviceStatus) }}</span>
                      </div>
                      <div class="system-row-meta">
                        <span>{{ sys.roomLabel }}</span>
                        <span class="sep">·</span>
                        <span>Installed {{ sys.installDate | date:'d MMM yyyy' }}</span>
                        <span class="sep">·</span>
                        <span>Last serviced: {{ sys.lastServicedDate ? (sys.lastServicedDate | date:'d MMM yyyy') : 'Not recorded' }}</span>
                        @if (sys.warrantyExpiry) {
                          <span class="sep">·</span>
                          <span [class.expiring]="isWarrantyExpiringSoon(sys)">Warranty until {{ sys.warrantyExpiry | date:'d MMM yyyy' }}</span>
                        }
                      </div>
                    </div>
                    <a routerLink="/quote" class="btn-primary btn-sm system-svc-btn">Book service</a>
                  </div>
                }
              </div>
            </div>
          }

          <!-- Profile -->
          @if (tab() === 'profile') {
            <div class="content-section">
              <div class="content-header">
                <div>
                  <h2>Profile</h2>
                  <p class="content-sub">Personal details and address</p>
                </div>
              </div>
              <div class="profile-form">
                <div class="pf-row">
                  <div class="form-group">
                    <label>Full name</label>
                    <input type="text" [value]="auth.currentUser()!.fullName" />
                  </div>
                  <div class="form-group">
                    <label>Email</label>
                    <input type="email" [value]="auth.currentUser()!.email" />
                  </div>
                </div>
                <div class="pf-row">
                  <div class="form-group">
                    <label>Phone</label>
                    <input type="tel" placeholder="Add a phone number" />
                  </div>
                  <div class="form-group">
                    <label>Default address</label>
                    <input type="text" placeholder="Your home address" />
                  </div>
                </div>
                <button class="btn-primary btn-sm">Save changes</button>
              </div>
            </div>
          }

        </main>
      </div>
    </div>
  `,
  styles: [`
    .account-layout {
      display: flex; gap: 0; max-width: 960px; margin: 0 auto;
      min-height: calc(100vh - 64px);
      padding: 2rem 1.5rem;
      gap: 1.5rem;
      align-items: flex-start;
    }

    /* Sidebar */
    .account-sidebar {
      width: 210px; flex-shrink: 0;
      background: white; border: 1px solid var(--border); border-radius: var(--radius-lg); box-shadow: var(--shadow-sm);
      padding: 1.25rem; display: flex; flex-direction: column; gap: 1.25rem;
      position: sticky; top: 80px;
    }
    .sidebar-user { display: flex; align-items: center; gap: 0.65rem; }
    .sidebar-avatar {
      width: 36px; height: 36px; border-radius: 50%; background: var(--ink-2);
      color: white; font-size: 0.78rem; font-weight: 700;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .sidebar-user-info { min-width: 0; }
    .sidebar-user-info strong { display: block; font-size: 0.82rem; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .sidebar-user-info span { font-size: 0.72rem; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block; }

    .sidebar-nav { display: flex; flex-direction: column; gap: 0.1rem; }
    .snav-item {
      display: flex; align-items: center; gap: 0.5rem;
      width: 100%; text-align: left; padding: 0.5rem 0.65rem;
      background: none; border: none; border-radius: 8px;
      font-size: 0.83rem; color: var(--text-secondary); cursor: pointer; transition: all 0.12s;
    }
    .snav-item:hover { background: var(--border); color: var(--text-primary); }
    .snav-item.active { background: var(--brand-light); color: var(--ink-2); font-weight: 600; }
    .snav-icon { width: 18px; height: 18px; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .snav-icon svg { width: 17px; height: 17px; }
    .snav-count {
      margin-left: auto; font-size: 0.7rem; background: var(--border); color: var(--text-secondary);
      border-radius: 999px; padding: 0.1rem 0.4rem; font-weight: 600;
    }
    .snav-item.active .snav-count { background: #dbeafe; color: #1e40af; }
    .snav-badge {
      margin-left: auto; font-size: 0.65rem; font-weight: 700; padding: 0.1rem 0.45rem;
      border-radius: 999px; text-transform: uppercase; letter-spacing: 0.04em;
    }
    .snav-badge.active { background: #d1fae5; color: #065f46; }

    .sidebar-actions { padding-top: 0.5rem; border-top: 1px solid var(--border); }
    .sidebar-cta { width: 100%; text-align: center; display: block; }

    /* Main content */
    .account-main { flex: 1; min-width: 0; }

    .content-section { background: white; border: 1px solid var(--border); border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); overflow: hidden; }
    .content-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 1rem 1.25rem; border-bottom: 1px solid var(--border);
    }
    .content-header h2 { font-size: 0.95rem; font-weight: 700; margin: 0 0 0.1rem; color: var(--text-primary); }
    .content-sub { font-size: 0.78rem; color: var(--text-muted); margin: 0; }

    /* Booking cards */
    .booking-list { display: flex; flex-direction: column; }
    .booking-card { border-bottom: 1px solid var(--border); }
    .booking-card:last-child { border-bottom: none; }

    .booking-card-main {
      display: flex; align-items: flex-start; gap: 0.85rem;
      padding: 0.9rem 1.25rem;
    }
    .booking-status-dot {
      width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; margin-top: 0.3rem;
    }
    .dot-confirmed { background: #059669; }
    .dot-completed { background: #3b82f6; }
    .dot-pending   { background: #f59e0b; }
    .dot-cancelled { background: #ef4444; }

    .booking-info { flex: 1; min-width: 0; }
    .booking-info-top { display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.25rem; flex-wrap: wrap; }
    .booking-job-type { font-size: 0.85rem; font-weight: 600; color: var(--text-primary); }
    .booking-ref { font-size: 0.75rem; color: var(--text-muted); }
    .status-chip {
      font-size: 0.68rem; font-weight: 700; padding: 0.15rem 0.5rem; border-radius: 999px;
      text-transform: uppercase; letter-spacing: 0.04em;
    }
    .chip-confirmed { background: #d1fae5; color: #065f46; }
    .chip-completed { background: var(--brand-light); color: var(--brand); }
    .chip-pending   { background: #fef3c7; color: #92400e; }
    .chip-cancelled { background: #fee2e2; color: #991b1b; }

    .booking-info-row { font-size: 0.8rem; color: var(--text-secondary); display: flex; gap: 0.4rem; flex-wrap: wrap; align-items: center; }
    .sep { color: var(--border); }
    .booking-price { color: #059669; font-weight: 600; }

    /* Timeline */
    .booking-timeline {
      position: relative; display: flex;
      padding: 0 1.25rem 0.85rem 2.85rem; gap: 0;
    }
    .tl-track {
      position: absolute; top: 6px; left: 2.85rem; right: 1.25rem; height: 1px; background: var(--border);
    }
    .tl-step {
      flex: 1; display: flex; flex-direction: column; align-items: center; gap: 0.25rem;
      position: relative; z-index: 1;
    }
    .tl-dot {
      width: 12px; height: 12px; border-radius: 50%;
      background: var(--border); border: 2px solid white; box-shadow: 0 0 0 1.5px var(--border);
    }
    .tl-step.done .tl-dot   { background: #059669; box-shadow: 0 0 0 1.5px #a7f3d0; }
    .tl-step.current .tl-dot { background: var(--brand); box-shadow: 0 0 0 1.5px #bfdbfe; }
    .tl-step span { font-size: 0.62rem; color: var(--text-muted); text-align: center; }
    .tl-step.done span    { color: #059669; font-weight: 600; }
    .tl-step.current span { color: var(--brand); font-weight: 600; }

    .booking-card-footer {
      display: flex; gap: 0.5rem; align-items: center;
      padding: 0.6rem 1.25rem 0.85rem 2.85rem;
    }

    /* Plan card */
    .plan-card {
      display: flex; gap: 0; margin: 1.25rem;
      border: 1px solid var(--border); border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); overflow: hidden;
    }
    .plan-card-left {
      flex: 1; padding: 1.25rem; display: flex; flex-direction: column; gap: 1rem;
      border-right: 1px solid var(--border);
    }
    .plan-tier-name { font-size: 1.1rem; font-weight: 700; color: var(--text-primary); }
    .plan-tier-sub  { font-size: 0.78rem; color: var(--text-muted); margin-top: -0.75rem; }
    .plan-dates { display: flex; flex-direction: column; gap: 0.45rem; }
    .plan-date-row { display: flex; justify-content: space-between; font-size: 0.82rem; color: var(--text-secondary); }
    .plan-date-row span:first-child { color: var(--text-muted); }
    .plan-date-row.next-service { background: var(--brand-light); padding: 0.3rem 0.5rem; border-radius: 6px; margin: 0 -0.5rem; }
    .plan-date-row.next-service strong { color: var(--ink-2); }
    .plan-actions { display: flex; gap: 0.5rem; align-items: center; }

    .plan-card-right {
      width: 170px; flex-shrink: 0; padding: 1.25rem;
      display: flex; flex-direction: column; gap: 1rem; background: var(--bg);
    }
    .plan-countdown {
      text-align: center; border-radius: 10px; padding: 0.75rem 0.5rem;
    }
    .plan-countdown.ok       { background: #f0fdf4; border: 1px solid #bbf7d0; }
    .plan-countdown.due-soon { background: #fffbeb; border: 1px solid #fcd34d; }
    .plan-countdown.overdue  { background: #fef2f2; border: 1px solid #fecaca; }
    .countdown-val { font-size: 2rem; font-weight: 800; line-height: 1; }
    .plan-countdown.ok .countdown-val       { color: #059669; }
    .plan-countdown.due-soon .countdown-val { color: #d97706; }
    .plan-countdown.overdue .countdown-val  { color: #dc2626; }
    .countdown-lbl { font-size: 0.65rem; color: var(--text-muted); margin-top: 0.2rem; }
    .plan-features { display: flex; flex-direction: column; gap: 0.3rem; }
    .pf-item { font-size: 0.78rem; color: var(--text-primary); }
    .pf-item::first-letter { color: #059669; }

    .no-plan { text-align: center; padding: 2.5rem 1.5rem; }
    .no-plan-icon { width: 52px; height: 52px; margin: 0 auto 0.75rem; border-radius: 14px; background: var(--brand-light); color: var(--brand); display: flex; align-items: center; justify-content: center; }
    .no-plan-icon svg { width: 26px; height: 26px; }
    .no-plan h3 { font-size: 1rem; margin-bottom: 0.35rem; }
    .no-plan p  { font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1.25rem; }

    /* AC Systems */
    .systems-list { display: flex; flex-direction: column; }
    .system-row {
      display: flex; align-items: center; gap: 0.85rem;
      padding: 0.9rem 1.25rem; border-bottom: 1px solid var(--border);
    }
    .system-row:last-child { border-bottom: none; }
    .system-row-icon {
      width: 36px; height: 36px; background: var(--brand-light); color: var(--brand);
      border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .system-row-icon svg { width: 19px; height: 19px; }
    .system-row-info { flex: 1; min-width: 0; }
    .system-row-top { display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.25rem; flex-wrap: wrap; }
    .system-row-top strong { font-size: 0.85rem; color: var(--text-primary); }
    .system-model-txt { font-size: 0.78rem; color: var(--text-muted); }
    .svc-badge {
      font-size: 0.65rem; font-weight: 700; padding: 0.15rem 0.45rem;
      border-radius: 999px; text-transform: uppercase; letter-spacing: 0.04em;
    }
    .svc-ok       { background: #d1fae5; color: #065f46; }
    .svc-due-soon { background: #fef3c7; color: #92400e; }
    .svc-overdue  { background: #fee2e2; color: #991b1b; }
    .system-row-meta { font-size: 0.78rem; color: var(--text-muted); display: flex; gap: 0.4rem; flex-wrap: wrap; }
    .expiring { color: #d97706; font-weight: 600; }
    .system-svc-btn { flex-shrink: 0; }

    /* Profile form */
    .profile-form { padding: 1.25rem; display: flex; flex-direction: column; gap: 1rem; }
    .pf-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .form-group { display: flex; flex-direction: column; gap: 0.25rem; }
    .form-group label { font-size: 0.72rem; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.04em; }
    .form-group input { padding: 0.5rem 0.75rem; border: 1px solid var(--border); border-radius: 8px; font-size: 0.88rem; }

    @media (max-width: 720px) {
      .account-layout { flex-direction: column; padding: 1rem; gap: 1rem; }
      .account-sidebar { width: 100%; position: static; }
      .sidebar-nav { flex-direction: row; flex-wrap: wrap; gap: 0.25rem; }
      .snav-item { flex: 1; justify-content: center; min-width: 100px; }
      .pf-row { grid-template-columns: 1fr; }
      .plan-card { flex-direction: column; }
      .plan-card-right { width: 100%; flex-direction: row; flex-wrap: wrap; gap: 1rem; }
    }
  `]
})
export class AccountComponent {
  auth    = inject(AuthService);
  tab     = signal<AccountTab>('bookings');
  bookings: CustomerBooking[]    = MOCK_CUSTOMER_BOOKINGS;
  plan:    CustomerServicePlan | null = MOCK_CUSTOMER_PLAN;
  systems: CustomerAcSystem[]    = MOCK_CUSTOMER_AC_SYSTEMS;

  statusLabel(status: string): string {
    const m: Record<string, string> = { confirmed: 'Confirmed', completed: 'Completed', pending: 'Pending', cancelled: 'Cancelled' };
    return m[status] ?? status;
  }

  timelineSteps(status: string) {
    const steps = ['Booked', 'Confirmed', 'In progress', 'Done'];
    const idx: Record<string, number> = { pending: 0, confirmed: 1, active: 2, completed: 3, cancelled: 0 };
    const i = idx[status] ?? 0;
    return steps.map((label, n) => ({ label, done: n < i, current: n === i }));
  }

  daysUntilService(): number {
    if (!this.plan) return 0;
    return Math.max(0, Math.ceil((new Date(this.plan.nextServiceDate).getTime() - Date.now()) / 86400000));
  }

  countdownClass(): string {
    const d = this.daysUntilService();
    return d <= 0 ? 'overdue' : d <= 30 ? 'due-soon' : 'ok';
  }

  serviceStatusLabel(s: string): string {
    const m: Record<string, string> = { ok: 'Service OK', 'due-soon': 'Due soon', overdue: 'Overdue' };
    return m[s] ?? s;
  }

  isWarrantyExpiringSoon(sys: CustomerAcSystem): boolean {
    if (!sys.warrantyExpiry) return false;
    return new Date(sys.warrantyExpiry).getTime() - Date.now() < 180 * 86400000;
  }

  leaveReview(b: CustomerBooking): void {
    alert(`Review flow for ${b.bookingRef} - coming soon!`);
  }
}
