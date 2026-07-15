import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { EngineerService } from '../../core/services/engineer.service';

const BRAND_LIST = ['Daikin', 'Mitsubishi Electric', 'Samsung', 'LG', 'Hitachi', 'Fujitsu', 'Panasonic', 'Toshiba', 'Midea', 'Gree'];

// Rough centre-point per UK postcode area — a coverage marker, not real geocoding.
// Falls back to central London if the entered area isn't recognised.
const POSTCODE_AREA_COORDS: Record<string, [number, number]> = {
  E: [51.5150, -0.0500], EC: [51.5175, -0.0920], N: [51.5580, -0.1090], NW: [51.5550, -0.1950],
  SE: [51.4780, -0.0450], SW: [51.4650, -0.1850], W: [51.5090, -0.1950], WC: [51.5175, -0.1250],
  M: [53.4808, -2.2426], B: [52.4862, -1.8904], LS: [53.8008, -1.5491], G: [55.8642, -4.2518],
  EH: [55.9533, -3.1883], BS: [51.4545, -2.5879], L: [53.4084, -2.9916], NE: [54.9783, -1.6178],
  S: [53.3811, -1.4701], CF: [51.4816, -3.1791], BT: [54.5973, -5.9301], NG: [52.9548, -1.1581],
  LE: [52.6369, -1.1398], CB: [52.2053, 0.1218], OX: [51.7520, -1.2577], BA: [51.3811, -2.3590],
  BN: [50.8225, -0.1372], PO: [50.8198, -1.0880], SO: [50.9097, -1.4044], EX: [50.7184, -3.5339],
  PL: [50.3755, -4.1427], YO: [53.9600, -1.0873], HU: [53.7457, -0.3367], DE: [52.9225, -1.4746],
  CV: [52.4068, -1.5197], ST: [52.9970, -2.1798], RG: [51.4543, -0.9781], MK: [52.0406, -0.7594],
  LU: [51.8787, -0.4200], AB: [57.1497, -2.0943], DD: [56.4620, -2.9707], SA: [51.6214, -3.9436],
  NP: [51.5842, -2.9977], IP: [52.0567, 1.1482], NR: [52.6309, 1.2974], CT: [51.2802, 1.0789],
  GU: [51.2362, -0.5704], KT: [51.4123, -0.3007], CR: [51.3720, -0.0980], WD: [51.6560, -0.3960],
  AL: [51.7520, -0.3360],
};

function estimateLatLng(postcode: string): { lat: number; lng: number } {
  const area = (postcode || '').trim().toUpperCase().match(/^[A-Z]{1,2}/)?.[0] ?? '';
  const coords = POSTCODE_AREA_COORDS[area];
  return coords ? { lat: coords[0], lng: coords[1] } : { lat: 51.5074, lng: -0.1278 };
}

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
              <h2 class="form-section-title">Company details</h2>
              <p class="form-section-hint">Shown on the quotes and invoices you send to customers — required for legal, professional documents.</p>
              <div class="form-grid">
                <div class="form-group form-full">
                  <label>Registered / trading address *</label>
                  <textarea [(ngModel)]="form.companyAddress" name="companyAddress" rows="2" required
                    placeholder="14 Battersea Rise&#10;London&#10;SW11 1EE"></textarea>
                </div>
                <div class="form-group">
                  <label>Companies House number <span class="label-hint">If a limited company</span></label>
                  <input type="text" [(ngModel)]="form.companyRegNumber" name="companyRegNumber" placeholder="e.g. 09876543" />
                </div>
                <div class="form-group">
                  <label>VAT registration number <span class="label-hint">If VAT-registered</span></label>
                  <input type="text" [(ngModel)]="form.vatNumber" name="vatNumber" placeholder="e.g. GB 234 5678 90" />
                </div>
                <div class="form-group form-full">
                  <label>Company logo <span class="label-hint">Optional — appears on your quotes &amp; invoices</span></label>
                  @if (logoPreview()) {
                    <div class="logo-preview-row">
                      <img [src]="logoPreview()" alt="Company logo preview" class="logo-preview" />
                      <button type="button" class="btn-text btn-sm" (click)="removeLogo()">Remove</button>
                    </div>
                  } @else {
                    <input type="file" accept="image/png,image/jpeg,image/svg+xml" (change)="onLogoChosen($event)" />
                  }
                  @if (logoError()) { <p class="error-msg">{{ logoError() }}</p> }
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

    .logo-preview-row { display: flex; align-items: center; gap: 0.85rem; }
    .logo-preview { width: 64px; height: 64px; object-fit: contain; border: 1px solid var(--border); border-radius: 8px; background: white; padding: 0.35rem; }

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

  logoPreview = signal<string | null>(null);
  logoError = signal<string | null>(null);

  form = {
    fullName: '', email: '', phone: '', companyName: '',
    fGasCertNumber: '', coveragePostcode: '',
    latitude: 51.5074, longitude: -0.1278,
    hourlyRate: 65, specialisms: '',
    brandsSupported: '',
    hasPublicLiability: false,
    publicLiabilityAmount: 2,
    bio: '',
    companyAddress: '', companyRegNumber: '', vatNumber: '', companyLogoUrl: '',
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

  onLogoChosen(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;
    if (!file) return;
    this.logoError.set(null);
    if (file.size > 500_000) { this.logoError.set('Logo must be under 500KB.'); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      this.form.companyLogoUrl = dataUrl;
      this.logoPreview.set(dataUrl);
    };
    reader.readAsDataURL(file);
  }

  removeLogo() {
    this.form.companyLogoUrl = '';
    this.logoPreview.set(null);
    this.logoError.set(null);
  }

  submit() {
    this.loading.set(true);
    this.error.set(null);
    this.form.brandsSupported = this.selectedBrands.join(', ');
    // Approximate coordinates from the coverage postcode so the engineer plots in roughly the right area.
    const { lat, lng } = estimateLatLng(this.form.coveragePostcode);
    this.form.latitude = lat;
    this.form.longitude = lng;
    this.engineerService.register(this.form).subscribe({
      next: () => { this.loading.set(false); this.submitted.set(true); },
      error: (err) => { this.loading.set(false); this.error.set(err.message); }
    });
  }
}
