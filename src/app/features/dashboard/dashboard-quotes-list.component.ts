import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { getSavedQuotes, updateSavedQuoteStatus } from '../../core/mock/mock-data';
import { SavedQuote, SavedQuoteStatus } from '../../core/models/models';

type Filter = 'all' | SavedQuoteStatus;

@Component({
  selector: 'app-dashboard-quotes-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="ql-page">

      <!-- Title -->
      <div class="ql-titlerow">
        <div>
          <h1>Quotations</h1>
          <p class="ql-sub">{{ all().length }} quote{{ all().length !== 1 ? 's' : '' }} · {{ statusCount('accepted') }} accepted</p>
        </div>
        <a routerLink="/dashboard/quotes/new" class="btn-primary btn-sm ql-new">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>
          New quote
        </a>
      </div>

      <!-- Metrics -->
      <div class="metrics-bar">
        <div class="metric"><span class="metric-val">£{{ totals().value | number:'1.0-0' }}</span><span class="metric-lbl">Total quoted</span></div>
        <div class="metric-div"></div>
        <div class="metric"><span class="metric-val">{{ statusCount('draft') }}</span><span class="metric-lbl">Drafts</span></div>
        <div class="metric-div"></div>
        <div class="metric"><span class="metric-val">{{ statusCount('sent') }}</span><span class="metric-lbl">Sent</span></div>
        <div class="metric-div"></div>
        <div class="metric"><span class="metric-val">{{ statusCount('accepted') }}</span><span class="metric-lbl">Accepted</span></div>
      </div>

      <!-- Search + filter -->
      <div class="ql-toolbar">
        <div class="ql-search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
          <input type="text" [(ngModel)]="search" name="search" placeholder="Search by ref, customer or title…" />
          @if (search) { <button class="ql-clear" (click)="search = ''" aria-label="Clear">&#10005;</button> }
        </div>
        <div class="ql-tabs">
          @for (f of filters; track f.key) {
            <button class="ql-tab" [class.active]="filter() === f.key" (click)="filter.set(f.key)">
              {{ f.label }}@if (f.key !== 'all') { <span class="ql-tab-count">{{ statusCount(f.key) }}</span> }
            </button>
          }
        </div>
      </div>

      <!-- List -->
      <div class="ql-card">
        @if (visible().length === 0) {
          <div class="ql-empty">
            @if (all().length === 0) {
              <p><strong>No quotes yet.</strong></p>
              <p class="ql-empty-sub">Create your first professional quotation in a couple of minutes.</p>
              <a routerLink="/dashboard/quotes/new" class="btn-primary btn-sm">New quote</a>
            } @else {
              <p>No quotes match your search.</p>
            }
          </div>
        }
        @for (q of visible(); track q.id) {
          <a [routerLink]="['/dashboard/quotes', q.id]" class="ql-row">
            <div class="ql-row-main">
              <div class="ql-row-top">
                <span class="ql-ref">{{ q.ref }}</span>
                <span class="ql-status" [class]="'qs-' + q.status">{{ q.status | titlecase }}</span>
              </div>
              <span class="ql-customer">{{ q.customerName || 'No customer name' }}</span>
              <span class="ql-jobtitle">{{ q.summary }}</span>
            </div>
            <div class="ql-row-right">
              <span class="ql-total">£{{ q.total | number:'1.0-0' }}</span>
              <span class="ql-date">{{ q.createdAt | date:'d MMM yyyy' }}</span>
              <span class="ql-view">View &#8594;</span>
            </div>
          </a>
        }
      </div>
    </div>
  `,
  styles: [`
    .ql-page { display: flex; flex-direction: column; gap: 1.1rem; max-width: 900px; }
    .ql-titlerow { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; }
    .ql-titlerow h1 { font-size: 1.25rem; font-weight: 700; margin: 0 0 0.15rem; }
    .ql-sub { font-size: 0.8rem; color: var(--text-muted); margin: 0; }
    .ql-new { display: inline-flex; align-items: center; gap: 0.4rem; flex-shrink: 0; }
    .ql-new svg { width: 15px; height: 15px; }

    .metrics-bar { display: flex; align-items: center; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); overflow: hidden; }
    .metric { flex: 1; display: flex; flex-direction: column; gap: 0.15rem; padding: 0.85rem 1.1rem; }
    .metric-val { font-size: 1.25rem; font-weight: 700; color: var(--text-primary); line-height: 1; }
    .metric-lbl { font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.04em; }
    .metric-div { width: 1px; background: var(--border); align-self: stretch; }

    .ql-toolbar { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
    .ql-search { display: flex; align-items: center; gap: 0.5rem; flex: 1; min-width: 220px; background: var(--surface); border: 1.5px solid var(--border); border-radius: var(--radius-sm); padding: 0 0.75rem; }
    .ql-search svg { width: 17px; height: 17px; color: var(--text-muted); flex-shrink: 0; }
    .ql-search input { border: none; padding: 0.6rem 0; font-size: 0.9rem; background: none; width: 100%; }
    .ql-search input:focus { outline: none; }
    .ql-clear { background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 0.85rem; padding: 0.25rem; }

    .ql-tabs { display: flex; gap: 0.25rem; background: var(--bg); border: 1px solid var(--border); border-radius: 999px; padding: 0.2rem; }
    .ql-tab { display: inline-flex; align-items: center; gap: 0.35rem; border: none; background: none; border-radius: 999px; padding: 0.4rem 0.8rem; font-size: 0.82rem; font-weight: 600; color: var(--text-secondary); cursor: pointer; white-space: nowrap; }
    .ql-tab.active { background: var(--surface); color: var(--brand); box-shadow: var(--shadow-sm); }
    .ql-tab-count { font-size: 0.7rem; background: var(--border); color: var(--text-secondary); border-radius: 999px; padding: 0.05rem 0.35rem; }
    .ql-tab.active .ql-tab-count { background: var(--brand-light); color: var(--brand); }

    .ql-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); overflow: hidden; }
    .ql-empty { text-align: center; padding: 2.75rem 1rem; }
    .ql-empty p { margin: 0 0 0.35rem; font-size: 0.92rem; color: var(--text-primary); }
    .ql-empty-sub { font-size: 0.85rem; color: var(--text-muted) !important; margin-bottom: 1.1rem !important; }

    .ql-row { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 0.9rem 1.1rem; border-bottom: 1px solid var(--border); text-decoration: none; color: inherit; transition: background 0.12s; }
    .ql-row:last-child { border-bottom: none; }
    .ql-row:hover { background: var(--bg); text-decoration: none; }
    .ql-row-main { min-width: 0; flex: 1; display: flex; flex-direction: column; gap: 0.15rem; }
    .ql-row-top { display: flex; align-items: center; gap: 0.6rem; }
    .ql-ref { font-size: 0.86rem; font-weight: 700; color: var(--text-primary); }
    .ql-status { font-size: 0.62rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; padding: 0.12rem 0.45rem; border-radius: 999px; }
    .qs-draft { background: var(--bg); color: var(--text-secondary); border: 1px solid var(--border); }
    .qs-sent { background: #dbeafe; color: #1e40af; }
    .qs-accepted { background: #d1fae5; color: #065f46; }
    .qs-declined { background: #fee2e2; color: #991b1b; }
    .ql-customer { font-size: 0.85rem; color: var(--text-primary); font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .ql-jobtitle { font-size: 0.76rem; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .ql-row-right { display: flex; flex-direction: column; align-items: flex-end; gap: 0.1rem; flex-shrink: 0; }
    .ql-total { font-size: 0.95rem; font-weight: 800; color: var(--text-primary); }
    .ql-date { font-size: 0.74rem; color: var(--text-muted); }
    .ql-view { font-size: 0.74rem; font-weight: 700; color: var(--brand); }

    @media (max-width: 600px) {
      .ql-toolbar { flex-direction: column; align-items: stretch; }
      .ql-tabs { overflow-x: auto; }
      .metrics-bar { flex-wrap: wrap; }
      .metric { min-width: 45%; }
      .ql-jobtitle { display: none; }
      .ql-view { display: none; }
    }
  `]
})
export class DashboardQuotesListComponent {
  private auth = inject(AuthService);

  all    = signal<SavedQuote[]>(getSavedQuotes(this.auth.currentUser()!.engineerId!));
  search = '';
  filter = signal<Filter>('all');

  filters: { key: Filter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'draft', label: 'Drafts' },
    { key: 'sent', label: 'Sent' },
    { key: 'accepted', label: 'Accepted' },
  ];

  visible = computed(() => {
    const term = this.search.trim().toLowerCase();
    const f = this.filter();
    return this.all().filter(q => {
      if (f !== 'all' && q.status !== f) return false;
      if (!term) return true;
      return (q.ref + ' ' + q.customerName + ' ' + q.title + ' ' + q.summary).toLowerCase().includes(term);
    });
  });

  totals = computed(() => ({ value: this.all().reduce((s, q) => s + q.total, 0) }));
  statusCount(s: SavedQuoteStatus): number { return this.all().filter(q => q.status === s).length; }
}
