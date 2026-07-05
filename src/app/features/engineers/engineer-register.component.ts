import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { EngineerService } from '../../core/services/engineer.service';

const BRAND_LIST = ['Daikin', 'Mitsubishi Electric', 'Samsung', 'LG', 'Hitachi', 'Fujitsu', 'Panasonic', 'Toshiba', 'Midea', 'Gree'];

@Component({
  selector: 'app-engineer-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    @if (!submitted()) {
      <section class="page-hero">
        <div class="page-hero-inner">
          <span class="eyebrow">For engineers</span>
          <h1>Join the network. Grow your business.</h1>
          <p>Get matched with local customers - plus the tools to quote, invoice and manage every job. No subscription to start; the first 50 engineers get 3 months commission-free.</p>
          <ul class="page-hero-trust">
            <li><span>&#10003;</span> Identity verified</li>
            <li><span>&#10003;</span> F-Gas cert checked</li>
            <li><span>&#10003;</span> Insurance confirmed</li>
            <li><span>&#10003;</span> Rated by customers</li>
          </ul>
        </div>
      </section>
    }

    <div class="page-container">
      <div class="register-wrap">
        @if (!submitted()) {

          <form (ngSubmit)="submit()">

            <div class="form-section">
              <h2 class="form-section-title">Personal details</h2>
              <div class="form-grid">
                <div class="form-group">
                  <label>Full name *</label>
                  <input type="text" [(ngModel)]="form.fullName" name="fullName" required />
                </div>
                <div class="form-group">
                  <label>Company name *</label>
                  <input type="text" [(ngModel)]="form.companyName" name="companyName" required />
                </div>
                <div class="form-group">
                  <label>Email *</label>
                  <input type="email" [(ngModel)]="form.email" name="email" required />
                </div>
                <div class="form-group">
                  <label>Phone *</label>
                  <input type="tel" [(ngModel)]="form.phone" name="phone" required />
                </div>
                <div class="form-group form-full">
                  <label>About you <span class="label-hint">Tell customers about your experience and approach (min 50 words recommended)</span></label>
                  <textarea [(ngModel)]="form.bio" name="bio" rows="4"
                    placeholder="e.g. I've been installing and servicing AC systems for 12 years across London. I specialise in Daikin and Mitsubishi Electric systems and take pride in clean, tidy installations with no mess left behind."></textarea>
                </div>
              </div>
            </div>

            <div class="form-section">
              <h2 class="form-section-title">Certification & coverage</h2>
              <div class="form-grid">
                <div class="form-group">
                  <label>F-Gas certificate number *</label>
                  <input type="text" [(ngModel)]="form.fGasCertNumber" name="fGasCertNumber"
                    placeholder="e.g. FGC-2021-44821" required />
                </div>
                <div class="form-group">
                  <label>Primary coverage postcode *</label>
                  <input type="text" [(ngModel)]="form.coveragePostcode" name="coveragePostcode"
                    placeholder="e.g. SW1, N1" required />
                </div>
                <div class="form-group">
                  <label>Hourly rate (£)</label>
                  <input type="number" [(ngModel)]="form.hourlyRate" name="hourlyRate" min="30" />
                </div>
                <div class="form-group form-full">
                  <label>Specialisms (comma separated)</label>
                  <input type="text" [(ngModel)]="form.specialisms" name="specialisms"
                    placeholder="e.g. Installation, Emergency repair, Commercial, Multi-split" />
                </div>
              </div>
            </div>

            <div class="form-section">
              <h2 class="form-section-title">Brand specialisms</h2>
              <p class="form-section-hint">Select the brands you are certified or experienced with. This helps customers find you when filtering by brand.</p>
              <div class="brand-check-grid">
                @for (brand of brandList; track brand) {
                  <label class="brand-check-label" [class.selected]="isBrandSelected(brand)">
                    <input type="checkbox"
                      [checked]="isBrandSelected(brand)"
                      (change)="toggleBrand(brand)" />
                    {{ brand }}
                  </label>
                }
              </div>
            </div>

            <div class="form-section">
              <h2 class="form-section-title">Insurance & compliance</h2>
              <p class="form-section-hint">Engineers with verified insurance and checks receive a trust badge on their profile and rank higher in search results.</p>
              <div class="form-grid">
                <div class="form-group form-full">
                  <label class="checkbox-label">
                    <input type="checkbox" [(ngModel)]="form.hasPublicLiability" name="hasPublicLiability" />
                    <span>
                      I hold valid Public Liability Insurance
                      <span class="label-hint">We will ask for a copy during verification</span>
                    </span>
                  </label>
                </div>
                @if (form.hasPublicLiability) {
                  <div class="form-group">
                    <label>Cover amount (£ million)</label>
                    <select [(ngModel)]="form.publicLiabilityAmount" name="publicLiabilityAmount">
                      <option [ngValue]="1">£1m</option>
                      <option [ngValue]="2">£2m</option>
                      <option [ngValue]="5">£5m</option>
                      <option [ngValue]="10">£10m+</option>
                    </select>
                  </div>
                }
              </div>
            </div>

            @if (error()) {
              <p class="error-msg">{{ error() }}</p>
            }

            <button type="submit" class="btn-primary full-width" [disabled]="loading()">
              {{ loading() ? 'Submitting...' : 'Register as a specialist' }}
            </button>
            <p class="form-note">Your application will be reviewed within 24 hours. We verify your F-Gas certificate before your profile goes live.</p>
          </form>
        }

        @if (submitted()) {
          <div class="success-state">
            <div class="success-icon">&#10003;</div>
            <h2>You're on the list!</h2>
            <p>We'll verify your F-Gas certificate and insurance and be in touch within 24 hours to complete your profile setup.</p>
            <div class="success-next-steps">
              <h3>What happens next</h3>
              <ol>
                <li>We verify your F-Gas certificate number</li>
                <li>We'll email you to confirm insurance documents</li>
                <li>Your profile goes live - customers in your area can find you</li>
                <li>First job request lands in your inbox</li>
              </ol>
            </div>
            <a routerLink="/" class="btn-primary">Back to home</a>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .register-trust-strip {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
      margin-bottom: 2rem;
      padding: 1rem;
      background: #f0fdf4;
      border: 1px solid #6ee7b7;
      border-radius: 12px;
    }
    .reg-trust-item {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.85rem;
      font-weight: 500;
      color: #065f46;
    }

    .form-section { margin-bottom: 2rem; }
    .form-section-title { font-size: 1.05rem; font-weight: 700; color: #111827; margin-bottom: 0.25rem; }
    .form-section-hint { font-size: 0.85rem; color: #6b7280; margin-bottom: 1rem; }

    .label-hint { display: block; font-size: 0.78rem; color: #9ca3af; font-weight: 400; margin-top: 0.1rem; }

    .brand-check-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
      gap: 0.5rem;
    }
    .brand-check-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 0.75rem;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.88rem;
      color: #374151;
      background: white;
      transition: all 0.15s;
    }
    .brand-check-label:hover { border-color: var(--ink-2); }
    .brand-check-label.selected { border-color: var(--ink-2); background: #f0f5ff; color: var(--ink-2); font-weight: 500; }
    .brand-check-label input { accent-color: var(--ink-2); }

    .checkbox-label {
      display: flex;
      align-items: flex-start;
      gap: 0.6rem;
      font-size: 0.9rem;
      color: #374151;
      cursor: pointer;
    }
    .checkbox-label input { margin-top: 0.2rem; accent-color: var(--ink-2); }

    .success-next-steps {
      background: #f9fafb;
      border-radius: 12px;
      padding: 1.25rem 1.5rem;
      margin: 1.5rem 0;
      text-align: left;
    }
    .success-next-steps h3 { font-size: 0.9rem; font-weight: 600; color: #374151; margin-bottom: 0.75rem; }
    .success-next-steps ol { padding-left: 1.2rem; font-size: 0.88rem; color: #6b7280; line-height: 1.8; }
  `]
})
export class EngineerRegisterComponent {
  private engineerService = inject(EngineerService);

  loading = signal(false);
  error = signal<string | null>(null);
  submitted = signal(false);

  brandList = BRAND_LIST;
  selectedBrands: string[] = [];

  form = {
    fullName: '', email: '', phone: '', companyName: '',
    fGasCertNumber: '', coveragePostcode: '',
    latitude: 51.5074, longitude: -0.1278,
    hourlyRate: 65, specialisms: '',
    brandsSupported: '',
    hasPublicLiability: false,
    publicLiabilityAmount: 2,
    bio: ''
  };

  isBrandSelected(brand: string): boolean {
    return this.selectedBrands.includes(brand);
  }

  toggleBrand(brand: string) {
    if (this.selectedBrands.includes(brand)) {
      this.selectedBrands = this.selectedBrands.filter(b => b !== brand);
    } else {
      this.selectedBrands = [...this.selectedBrands, brand];
    }
    this.form.brandsSupported = this.selectedBrands.join(', ');
  }

  submit() {
    this.loading.set(true);
    this.error.set(null);
    this.form.brandsSupported = this.selectedBrands.join(', ');
    this.engineerService.register(this.form).subscribe({
      next: () => { this.loading.set(false); this.submitted.set(true); },
      error: (err) => { this.loading.set(false); this.error.set(err.message); }
    });
  }
}
