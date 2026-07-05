import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { getClients, updateClientNotes, daysUntil } from '../../core/mock/mock-data';
import { Client } from '../../core/models/models';

type Filter = 'all' | 'due' | 'plan' | 'leads';

@Component({
  selector: 'app-dashboard-clients',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="cl-page">

      <div class="cl-titlerow">
        <div>
          <h1>Clients</h1>
          <p class="cl-sub">{{ all().length }} clients · {{ dueCount() }} service{{ dueCount() !== 1 ? 's' : '' }} due</p>
        </div>
        <a routerLink="/dashboard/quotes/new" class="btn-primary btn-sm cl-new">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>
          New quote
        </a>
      </div>

      <!-- Metrics -->
      <div class="metrics-bar">
        <div class="metric"><span class="metric-val">{{ all().length }}</span><span class="metric-lbl">Clients</span></div>
        <div class="metric-div"></div>
        <div class="metric"><span class="metric-val warn">{{ dueCount() }}</span><span class="metric-lbl">Services due</span></div>
        <div class="metric-div"></div>
        <div class="metric"><span class="metric-val">{{ planCount() }}</span><span class="metric-lbl">On a plan</span></div>
        <div class="metric-div"></div>
        <div class="metric"><span class="metric-val">£{{ totalValue() | number:'1.0-0' }}</span><span class="metric-lbl">Lifetime value</span></div>
      </div>

      <!-- Search + filter -->
      <div class="cl-toolbar">
        <div class="cl-search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
          <input type="text" [(ngModel)]="search" name="search" placeholder="Search name, postcode or email…" />
          @if (search) { <button class="cl-clear" (click)="search = ''" aria-label="Clear">&#10005;</button> }
        </div>
        <div class="cl-tabs">
          @for (f of filters; track f.key) {
            <button class="cl-tab" [class.active]="filter() === f.key" (click)="filter.set(f.key)">{{ f.label }}</button>
          }
        </div>
      </div>

      <!-- List -->
      <div class="cl-card">
        @if (visible().length === 0) {
          <div class="cl-empty"><p>No clients match.</p></div>
        }
        @for (c of visible(); track c.id) {
          <div class="cl-row" [class.expanded]="expanded() === c.id">
            <div class="cl-row-main" (click)="toggle(c.id)">
              <div class="cl-avatar">{{ initials(c.name) }}</div>
              <div class="cl-info">
                <div class="cl-info-top">
                  <span class="cl-name">{{ c.name }}</span>
                  @for (t of c.tags; track t) { <span class="cl-tag" [class.tag-plan]="t === 'Service plan'" [class.tag-lead]="t === 'New lead'">{{ t }}</span> }
                </div>
                <div class="cl-info-sub">
                  <span>{{ c.postcode }}</span><span class="sep">·</span>
                  <span>{{ c.jobsCount }} job{{ c.jobsCount !== 1 ? 's' : '' }}</span><span class="sep">·</span>
                  <span>£{{ c.totalSpent | number:'1.0-0' }} lifetime</span>
                </div>
              </div>
              <div class="cl-row-right">
                <span class="svc-badge" [class]="'svc-' + svc(c).status">{{ svc(c).label }}</span>
                <span class="cl-chevron" [class.open]="expanded() === c.id">&#8250;</span>
              </div>
            </div>

            @if (expanded() === c.id) {
              <div class="cl-detail">
                <div class="cl-detail-grid">
                  <div class="cl-contact">
                    <div class="cl-detail-lbl">Contact</div>
                    <a [href]="'tel:' + c.phone" class="cl-link">{{ c.phone }}</a>
                    <a [href]="'mailto:' + c.email" class="cl-link">{{ c.email }}</a>
                    <span class="cl-addr">{{ c.address }}, {{ c.postcode }}</span>
                    <span class="cl-since">Client since {{ c.since | date:'MMM yyyy' }}</span>
                  </div>
                  <div class="cl-systems">
                    <div class="cl-detail-lbl">Systems ({{ c.systems.length }})</div>
                    @for (s of c.systems; track $index) {
                      <div class="cl-system">
                        <span class="cl-sys-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M2 12h20M5 5l14 14M5 19 19 5"/></svg></span>
                        <div>
                          <strong>{{ s.brand }} {{ s.model }}</strong>
                          <span class="cl-sys-meta">
                            Installed {{ s.installedDate | date:'MMM yyyy' }} ·
                            {{ s.nextServiceDue ? ('Next service ' + (s.nextServiceDue | date:'d MMM yyyy')) : 'No service scheduled' }}
                          </span>
                        </div>
                      </div>
                    }
                  </div>
                </div>

                <div class="cl-notes">
                  <div class="cl-detail-lbl">Notes</div>
                  <textarea [(ngModel)]="noteDraft" [name]="'note'+c.id" rows="2" (blur)="saveNotes(c)"></textarea>
                </div>

                <div class="cl-actions">
                  <a routerLink="/dashboard/quotes/new" class="btn-primary btn-sm">New quote</a>
                  <a [href]="'tel:' + c.phone" class="btn-secondary btn-sm">Call</a>
                  <a [href]="'mailto:' + c.email" class="btn-secondary btn-sm">Email</a>
                  @if (svc(c).status === 'overdue' || svc(c).status === 'due-soon') {
                    <a [href]="serviceReminderMailto(c)" class="btn-secondary btn-sm">Send service reminder</a>
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
    .cl-page { display: flex; flex-direction: column; gap: 1.1rem; max-width: 980px; }
    .cl-titlerow { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; }
    .cl-titlerow h1 { font-size: 1.25rem; font-weight: 700; margin: 0 0 0.15rem; }
    .cl-sub { font-size: 0.8rem; color: var(--text-muted); margin: 0; }
    .cl-new { display: inline-flex; align-items: center; gap: 0.4rem; flex-shrink: 0; }
    .cl-new svg { width: 15px; height: 15px; }

    .metrics-bar { display: flex; align-items: center; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); overflow: hidden; }
    .metric { flex: 1; display: flex; flex-direction: column; gap: 0.15rem; padding: 0.85rem 1.1rem; }
    .metric-val { font-size: 1.25rem; font-weight: 700; color: var(--text-primary); line-height: 1; }
    .metric-val.warn { color: #d97706; }
    .metric-lbl { font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.04em; }
    .metric-div { width: 1px; background: var(--border); align-self: stretch; }

    .cl-toolbar { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
    .cl-search { display: flex; align-items: center; gap: 0.5rem; flex: 1; min-width: 220px; background: var(--surface); border: 1.5px solid var(--border); border-radius: var(--radius-sm); padding: 0 0.75rem; }
    .cl-search svg { width: 17px; height: 17px; color: var(--text-muted); flex-shrink: 0; }
    .cl-search input { border: none; padding: 0.6rem 0; font-size: 0.9rem; background: none; width: 100%; }
    .cl-search input:focus { outline: none; }
    .cl-clear { background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 0.85rem; padding: 0.25rem; }
    .cl-tabs { display: flex; gap: 0.25rem; background: var(--bg); border: 1px solid var(--border); border-radius: 999px; padding: 0.2rem; }
    .cl-tab { border: none; background: none; border-radius: 999px; padding: 0.4rem 0.8rem; font-size: 0.82rem; font-weight: 600; color: var(--text-secondary); cursor: pointer; white-space: nowrap; }
    .cl-tab.active { background: var(--surface); color: var(--brand); box-shadow: var(--shadow-sm); }

    .cl-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); overflow: hidden; }
    .cl-empty { text-align: center; padding: 2.5rem 1rem; color: var(--text-muted); font-size: 0.88rem; }
    .cl-row { border-bottom: 1px solid var(--border); }
    .cl-row:last-child { border-bottom: none; }
    .cl-row-main { display: flex; align-items: center; gap: 0.85rem; padding: 0.85rem 1.1rem; cursor: pointer; transition: background 0.1s; }
    .cl-row-main:hover { background: var(--bg); }
    .cl-row.expanded .cl-row-main { background: var(--bg); }
    .cl-avatar { width: 40px; height: 40px; flex-shrink: 0; border-radius: 50%; background: var(--grad-hero); color: #fff; font-weight: 700; font-size: 0.85rem; display: flex; align-items: center; justify-content: center; }
    .cl-info { flex: 1; min-width: 0; }
    .cl-info-top { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.15rem; flex-wrap: wrap; }
    .cl-name { font-size: 0.9rem; font-weight: 700; color: var(--text-primary); }
    .cl-tag { font-size: 0.62rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.03em; padding: 0.1rem 0.4rem; border-radius: 999px; background: var(--bg); color: var(--text-secondary); border: 1px solid var(--border); }
    .cl-tag.tag-plan { background: #d1fae5; color: #065f46; border-color: #a7f3d0; }
    .cl-tag.tag-lead { background: var(--brand-light); color: var(--brand); border-color: #bfdbfe; }
    .cl-info-sub { font-size: 0.76rem; color: var(--text-muted); display: flex; gap: 0.4rem; flex-wrap: wrap; }
    .sep { color: var(--border); }
    .cl-row-right { display: flex; align-items: center; gap: 0.6rem; flex-shrink: 0; }
    .svc-badge { font-size: 0.64rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.03em; padding: 0.15rem 0.5rem; border-radius: 999px; white-space: nowrap; }
    .svc-ok { background: #d1fae5; color: #065f46; }
    .svc-due-soon { background: #fef3c7; color: #92400e; }
    .svc-overdue { background: #fee2e2; color: #991b1b; }
    .svc-none { background: var(--bg); color: var(--text-muted); border: 1px solid var(--border); }
    .cl-chevron { font-size: 1.2rem; color: var(--text-muted); transition: transform 0.2s; }
    .cl-chevron.open { transform: rotate(90deg); }

    .cl-detail { padding: 0 1.1rem 1.1rem; background: var(--bg); border-top: 1px solid var(--border); display: flex; flex-direction: column; gap: 1rem; }
    .cl-detail-grid { display: grid; grid-template-columns: 1fr 1.3fr; gap: 1.25rem; padding-top: 1rem; }
    .cl-detail-lbl { font-size: 0.66rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); margin-bottom: 0.5rem; }
    .cl-contact { display: flex; flex-direction: column; gap: 0.25rem; }
    .cl-link { font-size: 0.85rem; color: var(--brand); text-decoration: none; }
    .cl-link:hover { text-decoration: underline; }
    .cl-addr { font-size: 0.82rem; color: var(--text-secondary); }
    .cl-since { font-size: 0.75rem; color: var(--text-muted); margin-top: 0.15rem; }
    .cl-systems { display: flex; flex-direction: column; gap: 0.6rem; }
    .cl-system { display: flex; gap: 0.6rem; align-items: flex-start; }
    .cl-sys-icon { width: 30px; height: 30px; flex-shrink: 0; border-radius: 8px; background: var(--brand-light); color: var(--brand); display: inline-flex; align-items: center; justify-content: center; }
    .cl-sys-icon svg { width: 16px; height: 16px; }
    .cl-system strong { display: block; font-size: 0.84rem; }
    .cl-sys-meta { font-size: 0.74rem; color: var(--text-muted); }
    .cl-notes textarea { width: 100%; padding: 0.55rem 0.7rem; border: 1.5px solid var(--border); border-radius: var(--radius-sm); font-size: 0.85rem; font-family: inherit; box-sizing: border-box; resize: vertical; background: var(--surface); }
    .cl-actions { display: flex; gap: 0.5rem; flex-wrap: wrap; }

    @media (max-width: 640px) {
      .cl-toolbar { flex-direction: column; align-items: stretch; }
      .cl-tabs { overflow-x: auto; }
      .metrics-bar { flex-wrap: wrap; }
      .metric { min-width: 45%; }
      .cl-detail-grid { grid-template-columns: 1fr; gap: 1rem; }
    }
  `]
})
export class DashboardClientsComponent {
  private auth = inject(AuthService);

  all      = signal<Client[]>(getClients(this.auth.currentUser()!.engineerId!));
  search   = '';
  filter   = signal<Filter>('all');
  expanded = signal<number | null>(null);
  noteDraft = '';

  filters: { key: Filter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'due', label: 'Service due' },
    { key: 'plan', label: 'On plan' },
    { key: 'leads', label: 'New leads' },
  ];

  visible = computed(() => {
    const term = this.search.trim().toLowerCase();
    const f = this.filter();
    return this.all().filter(c => {
      if (f === 'due' && !(this.svc(c).status === 'overdue' || this.svc(c).status === 'due-soon')) return false;
      if (f === 'plan' && !c.onServicePlan) return false;
      if (f === 'leads' && !c.tags.includes('New lead')) return false;
      if (!term) return true;
      return (c.name + ' ' + c.postcode + ' ' + c.email + ' ' + c.address).toLowerCase().includes(term);
    });
  });

  dueCount   = computed(() => this.all().filter(c => ['overdue', 'due-soon'].includes(this.svc(c).status)).length);
  planCount  = computed(() => this.all().filter(c => c.onServicePlan).length);
  totalValue = computed(() => this.all().reduce((s, c) => s + c.totalSpent, 0));

  svc(c: Client): { status: 'ok' | 'due-soon' | 'overdue' | 'none'; label: string } {
    const d = daysUntil(c.nextServiceDue);
    if (d === null) return { status: 'none', label: 'No service' };
    if (d < 0) return { status: 'overdue', label: `Overdue ${Math.abs(d)}d` };
    if (d <= 45) return { status: 'due-soon', label: `Due in ${d}d` };
    return { status: 'ok', label: 'Up to date' };
  }

  toggle(id: number) {
    const c = this.all().find(x => x.id === id);
    this.noteDraft = c?.notes ?? '';
    this.expanded.update(v => v === id ? null : id);
  }

  saveNotes(c: Client) {
    updateClientNotes(c.id, this.noteDraft);
    this.all.set(getClients(this.auth.currentUser()!.engineerId!));
  }

  serviceReminderMailto(c: Client): string {
    const subject = encodeURIComponent('Your annual air conditioning service is due');
    const body = encodeURIComponent(
      `Hi ${c.name.split(' ')[0]},\n\nA quick reminder that your air conditioning system is due its annual service. ` +
      `Keeping it serviced maintains efficiency, protects your warranty and prevents costly breakdowns.\n\n` +
      `Would you like me to book you in? Just reply to this email or give me a call.\n\nMany thanks`
    );
    return `mailto:${c.email}?subject=${subject}&body=${body}`;
  }

  initials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  }
}
