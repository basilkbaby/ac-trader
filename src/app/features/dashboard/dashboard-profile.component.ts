import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { MOCK_ENGINEER_DETAILS } from '../../core/mock/mock-data';

interface UploadedCert {
  id: number;
  type: string;
  fileName: string;
  uploadedAt: string;
  expiryDate: string | null;
}

const BRAND_LIST = ['Daikin', 'Mitsubishi Electric', 'Samsung', 'LG', 'Hitachi', 'Fujitsu', 'Panasonic', 'Toshiba', 'Midea', 'Gree'];

const CERT_TYPES = [
  'F-Gas Certificate (Category I)',
  'F-Gas Certificate (Category II)',
  'Public Liability Insurance',
  'DBS (Criminal Record) Check',
  'REFCOM Elite Certification',
  'NICEIC Approval',
  'Gas Safe Register',
  'BESA Membership',
  'Other',
];

const MOCK_CERTS: UploadedCert[] = [
  { id: 1, type: 'F-Gas Certificate (Category I)', fileName: 'fgas-cert-2024.pdf',  uploadedAt: '2024-01-10', expiryDate: '2027-01-10' },
  { id: 2, type: 'Public Liability Insurance',     fileName: 'pli-policy-2025.pdf', uploadedAt: '2025-03-01', expiryDate: '2026-03-01' },
];

@Component({
  selector: 'app-dashboard-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="profile-page">

      <!-- Title row -->
      <div class="profile-titlerow">
        <div>
          <h1>My profile</h1>
          <p class="profile-sub">What customers see on your public listing</p>
        </div>
        <div class="title-actions">
          <button class="btn-text btn-sm" (click)="reset()">Discard</button>
          <button class="btn-primary btn-sm" (click)="save()">Save changes</button>
        </div>
      </div>

      @if (saved()) {
        <div class="save-banner">✓ Profile saved successfully.</div>
      }

      <!-- Two-column body -->
      <div class="profile-columns">

        <!-- ── LEFT column ── -->
        <div class="profile-col">

          <!-- Personal & company -->
          <div class="profile-card">
            <div class="card-header">
              <h3>Personal &amp; company</h3>
            </div>
            <div class="card-body">
              <div class="form-row">
                <div class="form-group">
                  <label>Full name</label>
                  <input type="text" [(ngModel)]="form.fullName" name="fullName" />
                </div>
                <div class="form-group">
                  <label>Company name</label>
                  <input type="text" [(ngModel)]="form.companyName" name="companyName" />
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Email</label>
                  <input type="email" [(ngModel)]="form.email" name="email" />
                </div>
                <div class="form-group">
                  <label>Phone</label>
                  <input type="tel" [(ngModel)]="form.phone" name="phone" />
                </div>
              </div>
              <div class="form-group">
                <label>Bio <span class="lbl-hint">Shown on your public profile</span></label>
                <textarea [(ngModel)]="form.bio" name="bio" rows="4"></textarea>
              </div>
            </div>
          </div>

          <!-- Coverage & rates -->
          <div class="profile-card">
            <div class="card-header">
              <h3>Coverage &amp; rates</h3>
            </div>
            <div class="card-body">
              <div class="form-row">
                <div class="form-group">
                  <label>Coverage postcodes</label>
                  <input type="text" [(ngModel)]="form.coveragePostcode" name="coverage" placeholder="e.g. SW1, SW3, SW7" />
                </div>
                <div class="form-group">
                  <label>Hourly rate (£)</label>
                  <input type="number" [(ngModel)]="form.hourlyRate" name="rate" min="30" />
                </div>
              </div>
              <div class="form-group">
                <label>Specialisms</label>
                <input type="text" [(ngModel)]="form.specialisms" name="specialisms"
                  placeholder="e.g. Installation, Emergency repair, Commercial" />
              </div>
            </div>
          </div>

          <!-- Certifications -->
          <div class="profile-card">
            <div class="card-header">
              <h3>Certifications</h3>
              <button class="btn-secondary btn-sm" (click)="toggleUpload()">
                {{ uploadOpen() ? '✕ Cancel' : '+ Upload' }}
              </button>
            </div>
            <div class="card-body">

              @if (uploadOpen()) {
                <div class="upload-form">
                  <div class="form-row">
                    <div class="form-group">
                      <label>Certificate type</label>
                      <select [(ngModel)]="uploadDraft.type" name="certType">
                        <option value="">- Select -</option>
                        @for (ct of certTypes; track ct) {
                          <option [value]="ct">{{ ct }}</option>
                        }
                      </select>
                    </div>
                    <div class="form-group">
                      <label>Expiry date <span class="lbl-hint">Optional</span></label>
                      <input type="date" [(ngModel)]="uploadDraft.expiryDate" name="certExpiry" />
                    </div>
                  </div>
                  <div class="form-group">
                    <label>File (PDF or image)</label>
                    <div class="file-drop" (click)="fileInput.click()" [class.has-file]="uploadDraft.fileName">
                      @if (uploadDraft.fileName) {
                        <span class="file-chosen">📄 {{ uploadDraft.fileName }}</span>
                      } @else {
                        <span>Click to choose or drag &amp; drop</span>
                        <span class="file-hint">PDF, JPG, PNG - max 5 MB</span>
                      }
                    </div>
                    <input #fileInput type="file" accept=".pdf,.jpg,.jpeg,.png" style="display:none"
                      (change)="onFileChosen($event)" />
                  </div>
                  @if (uploadError()) { <div class="upload-error">{{ uploadError() }}</div> }
                  <button class="btn-primary btn-sm" (click)="submitUpload()">Save certificate</button>
                </div>
              }

              <div class="cert-list">
                @for (cert of certs(); track cert.id) {
                  <div class="cert-row" [class.cert-expiring]="isCertExpiringSoon(cert)">
                    <span class="cert-icon">📋</span>
                    <div class="cert-info">
                      <span class="cert-type">{{ cert.type }}</span>
                      <span class="cert-meta">
                        {{ cert.fileName }} · Uploaded {{ cert.uploadedAt | date:'d MMM yyyy' }}
                        @if (cert.expiryDate) {
                          · Expires <span [class.exp-soon]="isCertExpiringSoon(cert)">{{ cert.expiryDate | date:'d MMM yyyy' }}</span>
                        }
                      </span>
                    </div>
                    <div class="cert-actions">
                      <button class="cert-view-btn" (click)="viewingCert.set(cert)">👁 View</button>
                      <button class="cert-del-btn"  (click)="deleteCert(cert.id)">✕</button>
                    </div>
                  </div>
                }
                @if (certs().length === 0) {
                  <p class="cert-empty">No certificates uploaded yet.</p>
                }
              </div>
            </div>
          </div>

        </div>

        <!-- ── RIGHT column ── -->
        <div class="profile-col">

          <!-- Availability -->
          <div class="profile-card">
            <div class="card-header">
              <h3>Availability</h3>
            </div>
            <div class="card-body">
              <div class="avail-row">
                <label class="avail-toggle-wrap">
                  <div class="big-toggle">
                    <input type="checkbox" [(ngModel)]="form.isAvailable" name="available" />
                    <span class="big-slider"></span>
                  </div>
                </label>
                <div class="avail-text">
                  <strong>{{ form.isAvailable ? 'Available for new jobs' : 'Not taking new jobs' }}</strong>
                  <span>{{ form.isAvailable ? 'Your profile appears in customer searches' : 'Hidden from customer searches' }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Brand specialisms -->
          <div class="profile-card">
            <div class="card-header">
              <h3>Brand specialisms</h3>
              <span class="card-header-hint">{{ selectedBrandsCount() }} selected</span>
            </div>
            <div class="card-body">
              <div class="brand-grid">
                @for (brand of brandList; track brand) {
                  <label class="brand-chip" [class.selected]="isBrandSelected(brand)">
                    <input type="checkbox" [checked]="isBrandSelected(brand)" (change)="toggleBrand(brand)" />
                    {{ brand }}
                  </label>
                }
              </div>
            </div>
          </div>

          <!-- Compliance -->
          <div class="profile-card">
            <div class="card-header">
              <h3>Compliance</h3>
            </div>
            <div class="card-body compliance-list">
              <div class="compliance-item" [class.comp-ok]="true">
                <div class="comp-item-left">
                  <span class="comp-icon">🔑</span>
                  <div>
                    <span class="comp-name">F-Gas Certificate</span>
                    <span class="comp-detail">{{ form.fGasCertNumber }}</span>
                  </div>
                </div>
                <span class="comp-badge comp-verified">Verified ✓</span>
              </div>
              <div class="compliance-item" [class.comp-ok]="form.hasPublicLiability">
                <div class="comp-item-left">
                  <span class="comp-icon">📋</span>
                  <div>
                    <span class="comp-name">Public Liability Insurance</span>
                    <span class="comp-detail">{{ form.hasPublicLiability ? 'On file' : 'Not provided' }}</span>
                  </div>
                </div>
                @if (form.hasPublicLiability) {
                  <span class="comp-badge comp-verified">Verified ✓</span>
                } @else {
                  <span class="comp-badge comp-missing">Upload cert →</span>
                }
              </div>
              <div class="compliance-item">
                <div class="comp-item-left">
                  <span class="comp-icon">🛡️</span>
                  <div>
                    <span class="comp-name">DBS Check</span>
                    <span class="comp-detail">Not provided</span>
                  </div>
                </div>
                <span class="comp-badge comp-missing">Upload cert →</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      <!-- Save bar -->
      <div class="save-bar">
        <button class="btn-text btn-sm" (click)="reset()">Discard changes</button>
        <button class="btn-primary btn-sm" (click)="save()">Save changes</button>
      </div>

    </div>

    <!-- Cert viewer modal -->
    @if (viewingCert()) {
      <div class="modal-backdrop" (click)="viewingCert.set(null)">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <strong>{{ viewingCert()!.type }}</strong>
            <button class="modal-close" (click)="viewingCert.set(null)">✕</button>
          </div>
          <div class="modal-body">
            <div class="cert-preview">
              <span>📄</span>
              <p>{{ viewingCert()!.fileName }}</p>
              <p class="preview-hint">Certificate preview would display here.</p>
              <button class="btn-primary btn-sm">⬇ Download</button>
            </div>
          </div>
          <div class="modal-footer">
            <span>Uploaded {{ viewingCert()!.uploadedAt | date:'d MMM yyyy' }}</span>
            @if (viewingCert()!.expiryDate) {
              <span>Expires {{ viewingCert()!.expiryDate | date:'d MMM yyyy' }}</span>
            }
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .profile-page { display: flex; flex-direction: column; gap: 1.1rem; }

    /* Title */
    .profile-titlerow { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; }
    .profile-titlerow h1 { font-size: 1.25rem; font-weight: 700; margin: 0 0 0.15rem; }
    .profile-sub { font-size: 0.78rem; color: #9ca3af; margin: 0; }
    .title-actions { display: flex; gap: 0.5rem; align-items: center; flex-shrink: 0; }

    .save-banner {
      background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px;
      padding: 0.55rem 1rem; font-size: 0.83rem; font-weight: 600; color: #065f46;
    }

    /* Two-column layout */
    .profile-columns {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.1rem;
      align-items: start;
    }
    .profile-col { display: flex; flex-direction: column; gap: 1.1rem; }

    /* Card */
    .profile-card {
      background: white; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;
    }
    .card-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 0.85rem 1.25rem; border-bottom: 1px solid #f3f4f6;
    }
    .card-header h3 {
      font-size: 0.78rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.05em; color: #6b7280; margin: 0;
    }
    .card-header-hint { font-size: 0.72rem; color: #9ca3af; }
    .card-body { padding: 1.1rem 1.25rem; display: flex; flex-direction: column; gap: 0.85rem; }

    /* Forms */
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
    .form-group { display: flex; flex-direction: column; gap: 0.25rem; }
    .form-group label { font-size: 0.72rem; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.04em; }
    .form-group input, .form-group textarea, .form-group select {
      padding: 0.5rem 0.75rem; border: 1px solid #d1d5db; border-radius: 8px;
      font-size: 0.88rem; width: 100%; box-sizing: border-box; background: white;
    }
    .form-group textarea { resize: vertical; }
    .lbl-hint { font-size: 0.7rem; color: #9ca3af; font-weight: 400; text-transform: none; letter-spacing: 0; margin-left: 0.3rem; }

    /* Availability */
    .avail-row { display: flex; align-items: center; gap: 0.85rem; }
    .avail-toggle-wrap { cursor: pointer; flex-shrink: 0; }
    .big-toggle { position: relative; display: inline-block; width: 48px; height: 26px; }
    .big-toggle input { opacity: 0; width: 0; height: 0; }
    .big-slider { position: absolute; cursor: pointer; inset: 0; background: #d1d5db; border-radius: 26px; transition: 0.2s; }
    .big-slider::before { content: ''; position: absolute; width: 20px; height: 20px; left: 3px; bottom: 3px; background: white; border-radius: 50%; transition: 0.2s; }
    .big-toggle input:checked + .big-slider { background: #059669; }
    .big-toggle input:checked + .big-slider::before { transform: translateX(22px); }
    .avail-text strong { display: block; font-size: 0.88rem; color: #111827; margin-bottom: 0.1rem; }
    .avail-text span { font-size: 0.78rem; color: #9ca3af; }

    /* Brand chips */
    .brand-grid { display: flex; flex-wrap: wrap; gap: 0.4rem; }
    .brand-chip {
      display: flex; align-items: center; gap: 0.3rem;
      padding: 0.3rem 0.65rem; border: 1px solid #e5e7eb; border-radius: 999px;
      cursor: pointer; font-size: 0.78rem; color: #6b7280; transition: all 0.12s;
    }
    .brand-chip:hover { border-color: #1e3a5f; color: #1e3a5f; }
    .brand-chip.selected { border-color: #1e3a5f; background: #eff6ff; color: #1e3a5f; font-weight: 600; }
    .brand-chip input { width: 12px; height: 12px; accent-color: #1e3a5f; }

    /* Compliance */
    .compliance-list { gap: 0.5rem !important; }
    .compliance-item {
      display: flex; align-items: center; justify-content: space-between;
      padding: 0.7rem 0.85rem; border: 1px solid #e5e7eb; border-radius: 10px;
      background: #f9fafb; opacity: 0.6;
    }
    .compliance-item.comp-ok { opacity: 1; border-color: #bbf7d0; background: #f0fdf4; }
    .comp-item-left { display: flex; align-items: center; gap: 0.65rem; }
    .comp-icon { font-size: 1rem; }
    .comp-name   { display: block; font-size: 0.83rem; font-weight: 600; color: #111827; }
    .comp-detail { display: block; font-size: 0.72rem; color: #9ca3af; }
    .comp-badge { font-size: 0.68rem; font-weight: 700; padding: 0.2rem 0.5rem; border-radius: 999px; flex-shrink: 0; }
    .comp-verified { background: #d1fae5; color: #065f46; }
    .comp-missing  { background: #f3f4f6; color: #6b7280; cursor: pointer; }

    /* Certs */
    .upload-form {
      background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px;
      padding: 1rem; display: flex; flex-direction: column; gap: 0.75rem;
      margin-bottom: 0.75rem;
    }
    .file-drop {
      border: 2px dashed #d1d5db; border-radius: 8px; padding: 1.1rem;
      text-align: center; cursor: pointer; font-size: 0.82rem; color: #9ca3af;
      display: flex; flex-direction: column; gap: 0.2rem; transition: all 0.12s;
    }
    .file-drop:hover { border-color: #1e3a5f; background: #f0f5ff; }
    .file-drop.has-file { border-color: #6ee7b7; background: #f0fdf4; }
    .file-chosen { color: #065f46; font-weight: 600; }
    .file-hint { font-size: 0.72rem; }
    .upload-error { font-size: 0.78rem; color: #dc2626; }

    .cert-list { display: flex; flex-direction: column; }
    .cert-row {
      display: flex; align-items: center; gap: 0.65rem;
      padding: 0.65rem 0; border-bottom: 1px solid #f3f4f6;
    }
    .cert-row:last-child { border-bottom: none; }
    .cert-row.cert-expiring { background: #fffbeb; border-radius: 8px; padding: 0.65rem 0.5rem; }
    .cert-icon { font-size: 1rem; flex-shrink: 0; }
    .cert-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 0.1rem; }
    .cert-type { font-size: 0.82rem; font-weight: 600; color: #111827; }
    .cert-meta { font-size: 0.72rem; color: #9ca3af; }
    .exp-soon  { color: #d97706; font-weight: 600; }
    .cert-actions { display: flex; gap: 0.3rem; flex-shrink: 0; }
    .cert-view-btn { font-size: 0.72rem; font-weight: 600; color: #1e3a5f; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 0.18rem 0.5rem; cursor: pointer; }
    .cert-del-btn  { font-size: 0.72rem; color: #9ca3af; background: none; border: 1px solid #e5e7eb; border-radius: 6px; padding: 0.18rem 0.45rem; cursor: pointer; }
    .cert-del-btn:hover { color: #dc2626; border-color: #fca5a5; }
    .cert-empty { font-size: 0.82rem; color: #9ca3af; margin: 0; }

    /* Save bar */
    .save-bar { display: flex; gap: 0.5rem; align-items: center; justify-content: flex-end; padding-top: 0.25rem; }

    /* Modal */
    .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 1rem; }
    .modal { background: white; border-radius: 14px; width: 100%; max-width: 420px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.2); }
    .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 0.85rem 1.1rem; border-bottom: 1px solid #f3f4f6; }
    .modal-header strong { font-size: 0.88rem; }
    .modal-close { background: none; border: none; color: #9ca3af; cursor: pointer; font-size: 1rem; }
    .modal-body { padding: 1.5rem 1.1rem; }
    .cert-preview { text-align: center; display: flex; flex-direction: column; align-items: center; gap: 0.4rem; }
    .cert-preview span { font-size: 2.5rem; }
    .cert-preview p { font-size: 0.85rem; color: #374151; margin: 0; font-weight: 500; }
    .preview-hint { color: #9ca3af !important; font-size: 0.75rem !important; }
    .modal-footer { display: flex; gap: 1.5rem; padding: 0.75rem 1.1rem; border-top: 1px solid #f3f4f6; background: #f9fafb; font-size: 0.75rem; color: #9ca3af; }

    @media (max-width: 900px) {
      .profile-columns { grid-template-columns: 1fr; }
    }
    @media (max-width: 540px) {
      .form-row { grid-template-columns: 1fr; }
    }
  `]
})
export class DashboardProfileComponent implements OnInit {
  auth       = inject(AuthService);
  saved      = signal(false);
  brandList  = BRAND_LIST;
  certTypes  = CERT_TYPES;
  uploadOpen = signal(false);
  uploadError = signal<string | null>(null);
  viewingCert = signal<UploadedCert | null>(null);
  certs      = signal<UploadedCert[]>([...MOCK_CERTS]);
  uploadDraft = { type: '', fileName: '', expiryDate: '' };
  private _selectedFile: File | null = null;
  private _selectedBrands: string[] = [];
  private original!: typeof this.form;

  form = {
    fullName: '', companyName: '', email: '', phone: '',
    bio: '', coveragePostcode: '', hourlyRate: 65,
    specialisms: '', fGasCertNumber: '', hasPublicLiability: false, isAvailable: true,
  };

  ngOnInit() {
    const eng = MOCK_ENGINEER_DETAILS[this.auth.currentUser()!.engineerId!];
    if (eng) {
      this.form = {
        fullName: eng.fullName, companyName: eng.companyName,
        email: eng.email, phone: eng.phone,
        bio: eng.bio ?? '', coveragePostcode: eng.coveragePostcode,
        hourlyRate: eng.hourlyRate, specialisms: eng.specialisms,
        fGasCertNumber: eng.fGasCertNumber,
        hasPublicLiability: eng.hasPublicLiability, isAvailable: eng.isAvailable,
      };
      this._selectedBrands = (eng.brandsSupported || '').split(',').map(s => s.trim()).filter(Boolean);
    }
    this.original = { ...this.form };
  }

  isBrandSelected(brand: string): boolean { return this._selectedBrands.includes(brand); }
  selectedBrandsCount() { return this._selectedBrands.length; }

  toggleBrand(brand: string) {
    this._selectedBrands = this._selectedBrands.includes(brand)
      ? this._selectedBrands.filter(b => b !== brand)
      : [...this._selectedBrands, brand];
  }

  save()  { this.saved.set(true); setTimeout(() => this.saved.set(false), 3000); }
  reset() { this.form = { ...this.original }; }

  toggleUpload() {
    this.uploadOpen.update(v => !v);
    this.uploadDraft = { type: '', fileName: '', expiryDate: '' };
    this._selectedFile = null;
    this.uploadError.set(null);
  }

  onFileChosen(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;
    if (file) { this._selectedFile = file; this.uploadDraft.fileName = file.name; }
  }

  submitUpload() {
    if (!this.uploadDraft.type)  { this.uploadError.set('Please select a certificate type.'); return; }
    if (!this._selectedFile)     { this.uploadError.set('Please choose a file to upload.');   return; }
    this.certs.update(list => [{
      id: Date.now(), type: this.uploadDraft.type, fileName: this.uploadDraft.fileName,
      uploadedAt: new Date().toISOString().split('T')[0], expiryDate: this.uploadDraft.expiryDate || null,
    }, ...list]);
    this.uploadOpen.set(false);
    this.uploadDraft = { type: '', fileName: '', expiryDate: '' };
    this._selectedFile = null;
    this.uploadError.set(null);
  }

  deleteCert(id: number) { this.certs.update(list => list.filter(c => c.id !== id)); }

  isCertExpiringSoon(cert: UploadedCert): boolean {
    if (!cert.expiryDate) return false;
    return new Date(cert.expiryDate).getTime() - Date.now() < 60 * 86400000;
  }
}
