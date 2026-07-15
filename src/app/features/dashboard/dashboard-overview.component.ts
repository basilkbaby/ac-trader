import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AuthService } from '../../core/services/auth.service';
import { JobService } from '../../core/services/job.service';
import { InvoiceService } from '../../core/services/invoice.service';
import { QuotationService } from '../../core/services/quotation.service';
import { ClientService } from '../../core/services/client.service';
import { EngineerService } from '../../core/services/engineer.service';
import { JobRequest, Invoice, SavedQuote, Client, EngineerDetail } from '../../core/models/models';
import { daysUntil, MOCK_MONTHLY_EARNINGS } from '../../core/mock/mock-data';

interface Attention { key: string; icon: string; text: string; link: string; tone: 'warn' | 'info' | 'danger'; }
interface Tool { icon: string; title: string; desc: string; link: string; }

@Component({
  selector: 'app-dashboard-overview',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="hub">

      <!-- Greeting -->
      <div class="hub-titlerow">
        <div>
          <h1>Good {{ greeting() }}, {{ firstName() }}</h1>
          <p class="hub-date">{{ today | date:'EEEE d MMMM yyyy' }}</p>
        </div>
        <span class="verified-badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 4 5v6c0 4.5 3.2 7.9 8 9 4.8-1.1 8-4.5 8-9V5z"/><path d="M9 12l2 2 4-4"/></svg> F-Gas Verified</span>
      </div>

      <!-- Metrics -->
      <div class="metrics-bar">
        <div class="metric"><span class="metric-val">£{{ currentMonthEarnings() | number }}</span><span class="metric-lbl">This month</span><span class="metric-delta up">&#9650; 12%</span></div>
        <div class="metric-div"></div>
        <div class="metric"><span class="metric-val warn">£{{ outstanding().amount | number }}</span><span class="metric-lbl">Outstanding</span><span class="metric-delta">{{ outstanding().count }} invoice{{ outstanding().count !== 1 ? 's' : '' }}</span></div>
        <div class="metric-div"></div>
        <div class="metric"><span class="metric-val">{{ quotesSent() }}</span><span class="metric-lbl">Quotes out</span><span class="metric-delta">awaiting reply</span></div>
        <div class="metric-div"></div>
        <div class="metric"><span class="metric-val">{{ rating() }} <span class="metric-star">&#9733;</span></span><span class="metric-lbl">Rating</span><span class="metric-delta">{{ reviewCount() }} reviews</span></div>
      </div>

      <!-- Needs attention + Tools -->
      <div class="hub-body">

        <div class="hub-card attention">
          <div class="hub-card-head"><h2>Needs your attention</h2></div>
          @if (attention().length === 0) {
            <div class="attn-clear">
              <span class="attn-clear-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></span>
              <span>You're all caught up. Nice work.</span>
            </div>
          }
          @for (a of attention(); track a.key) {
            <a [routerLink]="a.link" class="attn-row">
              <span class="attn-ico" [class]="'attn-' + a.tone" [innerHTML]="iconSvg(a.icon)"></span>
              <span class="attn-text">{{ a.text }}</span>
              <span class="attn-arrow">&#8594;</span>
            </a>
          }
        </div>

        <div class="hub-card">
          <div class="hub-card-head"><h2>Your business tools</h2></div>
          <div class="tools-grid">
            @for (t of tools; track t.title) {
              <a [routerLink]="t.link" class="tool">
                <span class="tool-ico" [innerHTML]="iconSvg(t.icon)"></span>
                <span class="tool-title">{{ t.title }}</span>
                <span class="tool-desc">{{ t.desc }}</span>
              </a>
            }
          </div>
        </div>

      </div>

      <!-- Jobs + earnings -->
      <div class="hub-body">
        <div class="hub-card">
          <div class="hub-card-head"><h2>Upcoming jobs</h2><a routerLink="/dashboard/jobs" class="hub-card-link">All jobs &#8594;</a></div>
          <div class="job-rows">
            @if (upcomingJobs().length === 0) { <div class="hub-empty">No upcoming jobs.</div> }
            @for (job of upcomingJobs(); track job.id) {
              <div class="job-row">
                <div class="job-row-date"><span class="jd-day">{{ job.preferredDate | date:'d' }}</span><span class="jd-mon">{{ job.preferredDate | date:'MMM' }}</span></div>
                <div class="job-row-info"><span class="job-row-type">{{ job.jobType }}</span><span class="job-row-sub">{{ job.customerName }} · {{ job.postcode }}</span></div>
                <div class="job-row-right"><span class="job-row-price">{{ job.quoteRange }}</span><span class="jstatus" [class]="'js-' + job.status">{{ job.status }}</span></div>
              </div>
            }
          </div>
        </div>

        <div class="hub-card">
          <div class="hub-card-head"><h2>Earnings (6 months)</h2><span class="hub-card-total">£{{ totalEarnings() | number }}</span></div>
          <div class="chart-wrap">
            @for (entry of earnings; track entry.month) {
              <div class="chart-col">
                <div class="chart-bar-wrap"><div class="chart-bar" [style.height.%]="barHeight(entry.amount)" [class.bar-current]="isCurrentMonth(entry.month)"></div></div>
                <span class="chart-mon">{{ entry.month }}</span>
              </div>
            }
          </div>
          <div class="chart-legend">
            @for (entry of earnings; track entry.month) { <span class="chart-amt" [class.amt-current]="isCurrentMonth(entry.month)">£{{ (entry.amount / 1000).toFixed(1) }}k</span> }
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .hub { display: flex; flex-direction: column; gap: 1.1rem; max-width: 1080px; }
    .hub-titlerow { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; }
    .hub-titlerow h1 { font-size: 1.25rem; font-weight: 700; margin: 0 0 0.15rem; }
    .hub-date { font-size: 0.78rem; color: var(--text-muted); margin: 0; }
    .verified-badge { display: inline-flex; align-items: center; gap: 0.35rem; font-size: 0.72rem; font-weight: 700; padding: 0.3rem 0.7rem; border-radius: 999px; background: #f0fdf4; border: 1px solid #bbf7d0; color: #065f46; white-space: nowrap; }
    .verified-badge svg { width: 13px; height: 13px; }

    .metrics-bar { display: flex; align-items: center; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); overflow: hidden; }
    .metric { flex: 1; display: flex; flex-direction: column; gap: 0.15rem; padding: 0.85rem 1.1rem; }
    .metric-val { font-size: 1.25rem; font-weight: 700; color: var(--text-primary); line-height: 1; }
    .metric-val.warn { color: #d97706; }
    .metric-star { color: var(--gold); }
    .metric-lbl { font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.04em; }
    .metric-delta { font-size: 0.72rem; color: var(--text-muted); }
    .metric-delta.up { color: #059669; }
    .metric-div { width: 1px; background: var(--border); align-self: stretch; }

    .hub-body { display: grid; grid-template-columns: 1fr 1fr; gap: 1.1rem; align-items: start; }
    .hub-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); overflow: hidden; }
    .hub-card-head { display: flex; align-items: center; justify-content: space-between; padding: 0.85rem 1rem; border-bottom: 1px solid var(--border); }
    .hub-card-head h2 { font-size: 0.82rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: var(--text-secondary); margin: 0; }
    .hub-card-link { font-size: 0.78rem; color: var(--brand); text-decoration: none; }
    .hub-card-total { font-size: 0.82rem; color: var(--text-muted); font-weight: 600; }
    .hub-empty { padding: 1.5rem 1rem; font-size: 0.83rem; color: var(--text-muted); text-align: center; }

    /* Attention */
    .attn-clear { display: flex; align-items: center; gap: 0.6rem; padding: 1.25rem 1rem; font-size: 0.88rem; color: var(--text-secondary); }
    .attn-clear-ico { width: 30px; height: 30px; border-radius: 50%; background: #d1fae5; color: #065f46; display: inline-flex; align-items: center; justify-content: center; }
    .attn-clear-ico svg { width: 17px; height: 17px; }
    .attn-row { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1rem; border-bottom: 1px solid var(--border); text-decoration: none; color: inherit; transition: background 0.12s; }
    .attn-row:last-child { border-bottom: none; }
    .attn-row:hover { background: var(--bg); }
    .attn-ico { width: 34px; height: 34px; flex-shrink: 0; border-radius: 9px; display: inline-flex; align-items: center; justify-content: center; }
    .attn-ico svg { width: 18px; height: 18px; }
    .attn-warn { background: #fef3c7; color: #b45309; }
    .attn-info { background: var(--brand-light); color: var(--brand); }
    .attn-danger { background: #fee2e2; color: #dc2626; }
    .attn-text { flex: 1; min-width: 0; font-size: 0.86rem; color: var(--text-primary); }
    .attn-arrow { color: var(--text-muted); flex-shrink: 0; }
    .attn-row:hover .attn-arrow { color: var(--brand); }

    /* Tools */
    .tools-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0; }
    .tool { display: flex; flex-direction: column; gap: 0.25rem; padding: 1rem; text-decoration: none; color: inherit; border-right: 1px solid var(--border); border-bottom: 1px solid var(--border); transition: background 0.12s; }
    .tool:nth-child(even) { border-right: none; }
    .tool:hover { background: var(--bg); }
    .tool-ico { width: 34px; height: 34px; border-radius: 9px; background: var(--brand-light); color: var(--brand); display: inline-flex; align-items: center; justify-content: center; margin-bottom: 0.35rem; }
    .tool-ico svg { width: 18px; height: 18px; }
    .tool-title { font-size: 0.88rem; font-weight: 700; color: var(--text-primary); }
    .tool-desc { font-size: 0.74rem; color: var(--text-muted); }

    /* Jobs */
    .job-rows { display: flex; flex-direction: column; }
    .job-row { display: flex; align-items: center; gap: 0.75rem; padding: 0.65rem 1rem; border-bottom: 1px solid var(--bg); }
    .job-row:last-child { border-bottom: none; }
    .job-row-date { width: 32px; flex-shrink: 0; text-align: center; background: var(--brand-light); border-radius: 6px; padding: 0.25rem 0; }
    .jd-day { display: block; font-size: 0.95rem; font-weight: 700; color: var(--brand); line-height: 1; }
    .jd-mon { display: block; font-size: 0.6rem; text-transform: uppercase; color: #93c5fd; font-weight: 600; }
    .job-row-info { flex: 1; min-width: 0; }
    .job-row-type { display: block; font-size: 0.83rem; font-weight: 600; color: var(--text-primary); }
    .job-row-sub { display: block; font-size: 0.75rem; color: var(--text-muted); }
    .job-row-right { display: flex; flex-direction: column; align-items: flex-end; gap: 0.2rem; flex-shrink: 0; }
    .job-row-price { font-size: 0.78rem; color: #059669; font-weight: 600; }
    .jstatus { font-size: 0.62rem; font-weight: 700; text-transform: uppercase; padding: 0.1rem 0.4rem; border-radius: 999px; }
    .js-pending { background: #fef3c7; color: #92400e; } .js-accepted { background: #d1fae5; color: #065f46; } .js-active { background: #dbeafe; color: #1e40af; }

    /* Chart */
    .chart-wrap { display: flex; align-items: flex-end; gap: 0.35rem; height: 90px; padding: 0.75rem 1rem 0; }
    .chart-col { flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%; justify-content: flex-end; }
    .chart-bar-wrap { flex: 1; width: 100%; display: flex; align-items: flex-end; }
    .chart-bar { width: 100%; background: #bfdbfe; border-radius: 3px 3px 0 0; transition: height 0.3s; min-height: 3px; }
    .chart-bar.bar-current { background: var(--brand); }
    .chart-mon { font-size: 0.62rem; color: var(--text-muted); margin-top: 0.2rem; }
    .chart-legend { display: flex; padding: 0 1rem 0.75rem; }
    .chart-amt { flex: 1; font-size: 0.62rem; color: var(--text-muted); text-align: center; }
    .chart-amt.amt-current { color: var(--brand); font-weight: 700; }

    @media (max-width: 720px) {
      .hub-body { grid-template-columns: 1fr; }
      .metrics-bar { flex-wrap: wrap; }
      .metric { min-width: 45%; }
    }
  `]
})
export class DashboardOverviewComponent {
  auth     = inject(AuthService);
  private jobSvc = inject(JobService);
  private invoiceSvc = inject(InvoiceService);
  private quotationSvc = inject(QuotationService);
  private clientSvc = inject(ClientService);
  private engineerSvc = inject(EngineerService);
  today    = new Date();
  earnings = MOCK_MONTHLY_EARNINGS;

  private eid = this.auth.currentUser()!.engineerId!;

  private jobs   = signal<JobRequest[]>([]);
  private invoicesData = signal<Invoice[]>([]);
  private quotes = signal<SavedQuote[]>([]);
  private clients = signal<Client[]>([]);
  private engineer = signal<EngineerDetail | null>(null);

  constructor() {
    this.jobSvc.getJobs(this.eid).subscribe(j => this.jobs.set(j));
    this.invoiceSvc.getInvoices(this.eid).subscribe(i => this.invoicesData.set(i));
    this.quotationSvc.list(this.eid).subscribe(q => this.quotes.set(q));
    this.clientSvc.list(this.eid).subscribe(c => this.clients.set(c));
    this.engineerSvc.getById(this.eid).subscribe(e => this.engineer.set(e));
  }

  tools: Tool[] = [
    { icon: 'quote',   title: 'Quotations',   desc: 'Create & manage quotes', link: '/dashboard/quotes' },
    { icon: 'clients', title: 'Clients',      desc: 'Your customer book',     link: '/dashboard/clients' },
    { icon: 'heat',    title: 'Heat load',    desc: 'Size units accurately',  link: '/dashboard/heat-load' },
    { icon: 'invoice', title: 'Invoices',     desc: 'Bill & get paid',        link: '/dashboard/invoices' },
    { icon: 'jobs',    title: 'Jobs',         desc: 'Your job pipeline',      link: '/dashboard/jobs' },
    { icon: 'profile', title: 'My profile',   desc: 'Your public listing',    link: '/dashboard/profile' },
  ];

  greeting() { const h = new Date().getHours(); return h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening'; }
  firstName() { return this.auth.currentUser()?.fullName.split(' ')[0] ?? ''; }

  pendingJobs  = computed(() => this.jobs().filter(j => j.status === 'pending'));
  upcomingJobs = computed(() => this.jobs().filter(j => ['accepted', 'active', 'pending'].includes(j.status)).slice(0, 5));

  outstanding = computed(() => {
    const list = this.invoicesData().filter(i => i.status === 'sent' || i.status === 'overdue');
    return { amount: Math.round(list.reduce((s, i) => s + i.total, 0)), count: list.length };
  });
  private overdueInvoices = computed(() => this.invoicesData().filter(i => i.status === 'sent' && new Date(i.dueAt) < new Date()));

  quotesSent = computed(() => this.quotes().filter(q => q.status === 'sent').length);
  private servicesDue = computed(() => this.clients().filter(c => { const d = daysUntil(c.nextServiceDue); return d !== null && d <= 45; }).length);

  currentMonthEarnings = computed(() => MOCK_MONTHLY_EARNINGS[MOCK_MONTHLY_EARNINGS.length - 1].amount);
  totalEarnings        = computed(() => MOCK_MONTHLY_EARNINGS.reduce((s, e) => s + e.amount, 0));
  rating      = computed(() => this.engineer()?.averageRating ?? 4.9);
  reviewCount = computed(() => this.engineer()?.reviews.length ?? 0);

  attention = computed<Attention[]>(() => {
    const out: Attention[] = [];
    const pj = this.pendingJobs().length;
    if (pj) out.push({ key: 'jobs', icon: 'jobs', tone: 'warn', link: '/dashboard/jobs', text: `${pj} new job request${pj > 1 ? 's' : ''} — respond quickly for the best acceptance rate` });
    const sd = this.servicesDue();
    if (sd) out.push({ key: 'svc', icon: 'clients', tone: 'warn', link: '/dashboard/clients', text: `${sd} annual service${sd > 1 ? 's' : ''} due soon — send a reminder to win repeat work` });
    const qs = this.quotesSent();
    if (qs) out.push({ key: 'quotes', icon: 'quote', tone: 'info', link: '/dashboard/quotes', text: `${qs} quote${qs > 1 ? 's' : ''} awaiting a reply — follow up to close the sale` });
    const oi = this.overdueInvoices();
    if (oi.length) out.push({ key: 'inv', icon: 'invoice', tone: 'danger', link: '/dashboard/invoices', text: `£${Math.round(oi.reduce((s, i) => s + i.total, 0)).toLocaleString()} overdue across ${oi.length} invoice${oi.length > 1 ? 's' : ''}` });
    return out;
  });

  barHeight(amount: number): number {
    const max = Math.max(...MOCK_MONTHLY_EARNINGS.map(e => e.amount));
    return Math.round((amount / max) * 100);
  }
  isCurrentMonth(month: string): boolean { return month === MOCK_MONTHLY_EARNINGS[MOCK_MONTHLY_EARNINGS.length - 1].month; }

  // Inline icon set (static constants → bypass-sanitized so SVG renders)
  private sanitizer = inject(DomSanitizer);
  private icons: Record<string, string> = {
    quote:   '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 7h8M8 11h2M8 15h2M14 11h2M14 15h2"/>',
    clients: '<circle cx="9" cy="8" r="3.5"/><path d="M3 20a6 6 0 0 1 12 0"/><path d="M16 5a3 3 0 0 1 0 6M21 20a6 6 0 0 0-5-5.9"/>',
    heat:    '<path d="M12 2v20M2 12h20M5 5l14 14M5 19 19 5"/>',
    invoice: '<path d="M6 2h8l4 4v16H6z"/><path d="M14 2v4h4M9 13h6M9 17h6"/>',
    jobs:    '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/>',
    profile: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  };
  private safe: Record<string, SafeHtml> = {};
  iconSvg(key: string): SafeHtml {
    if (!this.safe[key]) {
      this.safe[key] = this.sanitizer.bypassSecurityTrustHtml(
        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${this.icons[key] ?? ''}</svg>`
      );
    }
    return this.safe[key];
  }
}
