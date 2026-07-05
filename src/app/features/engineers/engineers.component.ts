import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { EngineerService } from '../../core/services/engineer.service';
import { Engineer } from '../../core/models/models';

type SortKey = 'rating' | 'jobs' | 'price-asc' | 'price-desc' | 'newest';

const BRANDS = ['Daikin', 'Mitsubishi Electric', 'Samsung', 'LG', 'Hitachi', 'Fujitsu', 'Panasonic', 'Toshiba'];

@Component({
  selector: 'app-engineers',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <section class="page-hero">
      <div class="page-hero-inner">
        <span class="eyebrow">The network near you</span>
        <h1>Find your AC engineer</h1>
        <p>Every engineer is F-Gas certified, insurance checked and identity verified - compare ratings, brands and response times.</p>
        <ul class="page-hero-trust">
          <li><span>&#10003;</span> Verified profiles</li>
          <li><span>&#10003;</span> Real customer reviews</li>
          <li><span>&#10003;</span> Fixed, upfront quotes</li>
        </ul>
      </div>
    </section>

    <div class="page-container">
      <div class="filter-panel">
        <div class="filter-row filter-row-top">
          <div class="filter-group filter-postcode">
            <label>Postcode area</label>
            <input type="text" placeholder="e.g. SW1, N1, E"
              [(ngModel)]="postcodeFilter"
              (keyup.enter)="loadEngineers()" />
          </div>
          <div class="filter-group">
            <label>Sort by</label>
            <select [(ngModel)]="sortKey" (change)="applySort()">
              <option value="rating">Highest rated</option>
              <option value="jobs">Most jobs done</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
            </select>
          </div>
          <div class="filter-group filter-actions">
            <button class="btn-primary" (click)="loadEngineers()">Search</button>
          </div>
        </div>

        <div class="filter-row filter-row-brands">
          <span class="filter-label-sm">Brand specialist:</span>
          <div class="brand-filter-list">
            <button class="brand-filter-btn"
              [class.active]="selectedBrand() === null"
              (click)="selectedBrand.set(null)">Any brand</button>
            @for (brand of brands; track brand) {
              <button class="brand-filter-btn"
                [class.active]="selectedBrand() === brand"
                (click)="selectedBrand.set(brand)">{{ brand }}</button>
            }
          </div>
        </div>

        <div class="filter-row filter-row-toggles">
          <label class="toggle-label">
            <input type="checkbox" [(ngModel)]="availableOnly" (change)="applySort()" />
            Available now only
          </label>
          <label class="toggle-label">
            <input type="checkbox" [(ngModel)]="verifiedOnly" (change)="applySort()" />
            Verified only
          </label>
        </div>
      </div>

      @if (loading()) {
        <div class="loading-state">Finding engineers...</div>
      }

      @if (error()) {
        <div class="error-state">{{ error() }}</div>
      }

      @if (!loading()) {
        <div class="results-meta">
          @if (filtered().length > 0) {
            <span>{{ filtered().length }} engineer{{ filtered().length !== 1 ? 's' : '' }} found</span>
          }
        </div>
      }

      @if (!loading() && filtered().length === 0 && !error()) {
        <div class="empty-state">
          <p>No engineers found for that search.</p>
          <p>Try a different postcode or remove filters. <a routerLink="/join">Engineers can register here</a>.</p>
        </div>
      }

      <div class="engineers-grid">
        @for (eng of filtered(); track eng.id) {
          <div class="engineer-card">
            <div class="eng-header">
              <div class="eng-avatar">{{ initials(eng.fullName) }}</div>
              <div class="eng-meta">
                <h3>{{ eng.fullName }}</h3>
                <span class="eng-company">{{ eng.companyName }}</span>
                <div class="eng-trust-row">
                  @if (eng.isVerified) {
                    <span class="badge badge-green badge-xs">&#10003; Verified</span>
                  }
                  @if (eng.hasPublicLiability) {
                    <span class="badge badge-blue badge-xs">Insured</span>
                  }
                </div>
              </div>
              <div class="eng-status" [class.available]="eng.isAvailable">
                {{ eng.isAvailable ? 'Available' : 'Busy' }}
              </div>
            </div>

            <div class="eng-stats">
              <div class="stat">
                <strong>{{ eng.averageRating.toFixed(1) }}</strong>
                <span>&#9733; Rating</span>
              </div>
              <div class="stat">
                <strong>{{ eng.jobsCompleted }}</strong>
                <span>Jobs done</span>
              </div>
              <div class="stat">
                <strong>£{{ eng.hourlyRate }}/hr</strong>
                <span>Rate</span>
              </div>
              <div class="stat">
                <strong>{{ eng.responseRatePercent || 95 }}%</strong>
                <span>Response</span>
              </div>
            </div>

            <div class="eng-cert">
              <span class="cert-num">F-Gas: {{ eng.fGasCertNumber }}</span>
              @if (eng.avgResponseHours) {
                <span class="eng-response-time">Replies in ~{{ eng.avgResponseHours }}h</span>
              }
            </div>

            <div class="eng-specialisms">
              @for (s of topSpecialisms(eng); track s) {
                <span class="specialism-tag">{{ s }}</span>
              }
              @if (brandTags(eng).length > 0) {
                @for (b of brandTags(eng); track b) {
                  <span class="specialism-tag specialism-brand">{{ b }}</span>
                }
              }
            </div>

            <div class="eng-footer">
              <span class="eng-postcode">&#128205; {{ eng.coveragePostcode }}</span>
              <a [routerLink]="['/engineers', eng.id]" class="btn-secondary btn-sm">
                View profile
              </a>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .filter-panel {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-md);
      padding: 1.25rem 1.5rem;
      margin-bottom: 2rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .filter-row { display: flex; align-items: flex-end; gap: 1rem; flex-wrap: wrap; }
    .filter-group { display: flex; flex-direction: column; gap: 0.3rem; }
    .filter-group label { font-size: 0.74rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.06em; }
    .filter-group input, .filter-group select {
      padding: 0.6rem 0.85rem;
      border: 1.5px solid var(--border);
      border-radius: var(--radius-sm);
      font-size: 0.9rem;
      background: var(--surface);
      min-width: 160px;
    }
    .filter-postcode input { min-width: 200px; }
    .filter-actions { justify-content: flex-end; padding-bottom: 0; }

    .filter-row-brands { align-items: center; flex-wrap: wrap; gap: 0.5rem; padding-top: 0.25rem; border-top: 1px solid var(--border); }
    .filter-label-sm { font-size: 0.74rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.06em; flex-shrink: 0; }
    .brand-filter-list { display: flex; flex-wrap: wrap; gap: 0.4rem; }
    .brand-filter-btn {
      padding: 0.34rem 0.85rem;
      border: 1.5px solid var(--border);
      border-radius: 999px;
      background: var(--surface);
      font-size: 0.82rem;
      font-weight: 500;
      cursor: pointer;
      color: var(--text-secondary);
      transition: all 0.15s;
    }
    .brand-filter-btn:hover { border-color: var(--brand); color: var(--brand); }
    .brand-filter-btn.active { background: var(--brand); border-color: var(--brand); color: #fff; box-shadow: 0 4px 12px -4px rgba(11,92,255,0.5); }

    .filter-row-toggles { gap: 1.5rem; }
    .toggle-label { display: flex; align-items: center; gap: 0.4rem; font-size: 0.88rem; color: var(--text-secondary); cursor: pointer; }

    .results-meta { font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1rem; font-weight: 500; }

    .eng-trust-row { display: flex; gap: 0.3rem; margin-top: 0.25rem; flex-wrap: wrap; }
    .badge-xs { font-size: 0.7rem; padding: 0.1rem 0.4rem; }
    .badge-blue { background: var(--brand-light); color: var(--brand); border: 1px solid #bfdbfe; border-radius: 999px; }

    .eng-response-time { font-size: 0.75rem; color: var(--text-muted); }
    .specialism-brand { background: var(--brand-light); color: var(--brand); border-color: #bfdbfe; }
  `]
})
export class EngineersComponent implements OnInit {
  private engineerService = inject(EngineerService);

  engineers = signal<Engineer[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  postcodeFilter = '';
  availableOnly = false;
  verifiedOnly = false;
  sortKey: SortKey = 'rating';
  selectedBrand = signal<string | null>(null);

  brands = BRANDS;

  filtered = computed(() => {
    let list = [...this.engineers()];
    const brand = this.selectedBrand();

    if (this.availableOnly) list = list.filter(e => e.isAvailable);
    if (this.verifiedOnly) list = list.filter(e => e.isVerified);
    if (brand) {
      list = list.filter(e =>
        (e.brandsSupported || '').toLowerCase().includes(brand.toLowerCase()) ||
        (e.specialisms || '').toLowerCase().includes(brand.toLowerCase())
      );
    }

    switch (this.sortKey) {
      case 'rating':     return list.sort((a, b) => b.averageRating - a.averageRating);
      case 'jobs':       return list.sort((a, b) => b.jobsCompleted - a.jobsCompleted);
      case 'price-asc':  return list.sort((a, b) => a.hourlyRate - b.hourlyRate);
      case 'price-desc': return list.sort((a, b) => b.hourlyRate - a.hourlyRate);
      default: return list;
    }
  });

  ngOnInit() { this.loadEngineers(); }

  loadEngineers() {
    this.loading.set(true);
    this.error.set(null);
    this.engineerService.getAll(
      this.postcodeFilter || undefined,
      this.availableOnly || undefined
    ).subscribe({
      next: (data) => { this.loading.set(false); this.engineers.set(data); },
      error: (err) => { this.loading.set(false); this.error.set(err.message); }
    });
  }

  applySort() {
    // reactive - filtered() recomputes automatically
  }

  initials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  topSpecialisms(eng: Engineer): string[] {
    return (eng.specialisms || '').split(',').map(s => s.trim()).filter(Boolean).slice(0, 3);
  }

  brandTags(eng: Engineer): string[] {
    return (eng.brandsSupported || '').split(',').map(s => s.trim()).filter(Boolean).slice(0, 2);
  }
}
