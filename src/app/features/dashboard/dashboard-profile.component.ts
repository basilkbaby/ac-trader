import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { MOCK_ENGINEER_DETAILS } from '../../core/mock/mock-data';
import { EngineerDetail } from '../../core/models/models';

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
  { id: 1, type: 'F-Gas Certificate (Category I)', fileName: 'fgas-cert-2024.pdf', uploadedAt: '2024-01-10', expiryDate: '2027-01-10' },
  { id: 2, type: 'Public Liability Insurance',      fileName: 'pli-policy-2025.pdf', uploadedAt: '2025-03-01', expiryDate: '2026-03-01' },
];

@Component({
  selector: 'app-dashboard-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="profile-page">
      <div class="profile-header">
        <h1>My profile</h1>
        <p class="profile-sub">This is what customers see on your public profile.</p>
      </div>

      @if (saved()) {
        <div class="save-banner">&#10003; Profile saved successfully.</div>
      }

      <div class="profile-sections">

        <div class="profile-section">
          <h2>Personal & company</h2>
          <div class="form-grid">
            <div class="form-group">
              <label>Full name</label>
              <input type="text" [(ngModel)]="form.fullName" name="fullName" />
            </div>
            <div class="form-group">
              <label>Company name</label>
              <input type="text" [(ngModel)]="form.companyName" name="companyName" />
            </div>
            <div class="form-group">
              <label>Email</label>
              <input type="email" [(ngModel)]="form.email" name="email" />
            </div>
            <div class="form-group">
              <label>Phone</label>
              <input type="tel" [(ngModel)]="form.phone" name="phone" />
            </div>
            <div class="form-group form-full">
              <label>Bio <span class="label-hint">Tell customers about your experience — shown on your public profile</span></label>
              <textarea [(ngModel)]="form.bio" name="bio" rows="4"></textarea>
            </div>
          </div>
        </div>

        <div class="profile-section">
          <h2>Coverage & rates</h2>
          <div class="form-grid">
            <div class="form-group">
              <label>Coverage postcodes</label>
              <input type="text" [(ngModel)]="form.coveragePostcode" name="coverage"
                placeholder="e.g. SW1, SW3, SW7" />
            </div>
            <div class="form-group">
              <label>Hourly rate (£)</label>
              <input type="number" [(ngModel)]="form.hourlyRate" name="rate" min="30" />
            </div>
            <div class="form-group form-full">
              <label>Specialisms</label>
              <input type="text" [(ngModel)]="form.specialisms" name="specialisms"
                placeholder="e.g. Installation, Emergency repair, Commercial" />
            </div>
          </div>
        </div>

        <div class="profile-section">
          <h2>Brand specialisms</h2>
          <div class="brand-grid">
            @for (brand of brandList; track brand) {
              <label class="brand-label" [class.selected]="isBrandSelected(brand)">
                <input type="checkbox" [checked]="isBrandSelected(brand)" (change)="toggleBrand(brand)" />
                {{ brand }}
              </label>
            }
          </div>
        </div>

        <div class="profile-section">
          <h2>Availability</h2>
          <div class="availability-row">
            <label class="avail-toggle-label">
              <div class="big-toggle">
                <input type="checkbox" [(ngModel)]="form.isAvailable" name="available" />
                <span class="big-slider"></span>
              </div>
              <div class="avail-text">
                <strong>{{ form.isAvailable ? 'Available for new jobs' : 'Not taking new jobs' }}</strong>
                <span>{{ form.isAvailable ? 'Your profile appears in search results' : 'Hidden from customer searches' }}</span>
              </div>
            </label>
          </div>
        </div>

        <div class="profile-section">
          <div class="cert-section-header">
            <h2>Certifications & compliance</h2>
            <button class="btn-secondary btn-sm" (click)="toggleUpload()">
              {{ uploadOpen() ? '✕ Cancel' : '+ Upload certificate' }}
            </button>
          </div>

          <!-- Upload form -->
          @if (uploadOpen()) {
            <div class="cert-upload-form">
              <div class="form-group">
                <label>Certificate type</label>
                <select [(ngModel)]="uploadDraft.type" name="certType">
                  <option value="">— Select type —</option>
                  @for (ct of certTypes; track ct) {
                    <option [value]="ct">{{ ct }}</option>
                  }
                </select>
              </div>
              <div class="form-group">
                <label>Expiry date <span class="label-hint">(leave blank if no expiry)</span></label>
                <input type="date" [(ngModel)]="uploadDraft.expiryDate" name="certExpiry" />
              </div>
              <div class="form-group form-full">
                <label>Certificate file (PDF or image)</label>
                <div class="file-drop" (click)="fileInput.click()" [class.has-file]="uploadDraft.fileName">
                  @if (uploadDraft.fileName) {
                    <span class="file-chosen">📄 {{ uploadDraft.fileName }}</span>
                  } @else {
                    <span>Click to choose file or drag & drop</span>
                    <span class="file-hint">PDF, JPG, PNG — max 5MB</span>
                  }
                </div>
                <input #fileInput type="file" accept=".pdf,.jpg,.jpeg,.png" style="display:none"
                  (change)="onFileChosen($event)" />
              </div>
              @if (uploadError()) {
                <div class="upload-error">{{ uploadError() }}</div>
              }
              <button class="btn-primary btn-sm" (click)="submitUpload()">Save certificate</button>
            </div>
          }

          <!-- Uploaded certificates list -->
          <div class="cert-list">
            @for (cert of certs(); track cert.id) {
              <div class="cert-card" [class.cert-expiring]="isCertExpiringSoon(cert)">
                <div class="cert-card-icon">📋</div>
                <div class="cert-card-info">
                  <strong>{{ cert.type }}</strong>
                  <span>{{ cert.fileName }}</span>
                  <span class="cert-meta">
                    Uploaded {{ cert.uploadedAt | date:'d MMM yyyy' }}
                    @if (cert.expiryDate) {
                      · Expires <span [class.cert-expiring-text]="isCertExpiringSoon(cert)">{{ cert.expiryDate | date:'d MMM yyyy' }}</span>
                    }
                  </span>
                </div>
                <div class="cert-card-actions">
                  <button class="cert-view-btn" (click)="viewCert(cert)" title="View certificate">👁 View</button>
                  <button class="cert-del-btn" (click)="deleteCert(cert.id)" title="Remove">✕</button>
                </div>
              </div>
            }
            @if (certs().length === 0) {
              <div class="cert-empty">No certificates uploaded yet. Upload your F-Gas cert and insurance to get verified.</div>
            }
          </div>

          <!-- Certificate viewer modal -->
          @if (viewingCert()) {
            <div class="cert-modal-backdrop" (click)="viewingCert.set(null)">
              <div class="cert-modal" (click)="$event.stopPropagation()">
                <div class="cert-modal-header">
                  <strong>{{ viewingCert()!.type }}</strong>
                  <button class="cert-modal-close" (click)="viewingCert.set(null)">✕</button>
                </div>
                <div class="cert-modal-body">
                  <div class="cert-preview-placeholder">
                    <span class="cert-preview-icon">📄</span>
                    <p>{{ viewingCert()!.fileName }}</p>
                    <p class="cert-preview-hint">Certificate preview would display here.</p>
                    <button class="btn-primary btn-sm">⬇ Download</button>
                  </div>
                </div>
                <div class="cert-modal-meta">
                  <span>Uploaded {{ viewingCert()!.uploadedAt | date:'d MMMM yyyy' }}</span>
                  @if (viewingCert()!.expiryDate) {
                    <span>Expires {{ viewingCert()!.expiryDate | date:'d MMMM yyyy' }}</span>
                  }
                </div>
              </div>
            </div>
          }
        </div>

      </div>

      <div class="profile-save-bar">
        <button class="btn-primary" (click)="save()">Save profile</button>
        <button class="btn-secondary" (click)="reset()">Discard changes</button>
      </div>
    </div>
  `,
  styles: [`
    .profile-page { max-width: 720px; }
    .profile-header { margin-bottom: 1.5rem; }
    .profile-header h1 { font-size: 1.4rem; margin: 0 0 0.3rem; }
    .profile-sub { font-size: 0.88rem; color: #6b7280; }

    .save-banner {
      background: #d1fae5; color: #065f46; border: 1px solid #6ee7b7;
      border-radius: 8px; padding: 0.65rem 1rem;
      font-size: 0.88rem; font-weight: 600; margin-bottom: 1.25rem;
    }

    .profile-sections { display: flex; flex-direction: column; gap: 0; }
    .profile-section {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 14px;
      padding: 1.5rem;
      margin-bottom: 1rem;
    }
    .profile-section h2 { font-size: 1rem; font-weight: 700; margin-bottom: 1.25rem; color: #111827; }

    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .form-full { grid-column: 1 / -1; }
    .form-group { display: flex; flex-direction: column; gap: 0.3rem; }
    .form-group label { font-size: 0.75rem; font-weight: 600; color: #374151; text-transform: uppercase; letter-spacing: 0.04em; }
    .form-group input, .form-group textarea { padding: 0.6rem 0.85rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 0.9rem; width: 100%; box-sizing: border-box; }
    .label-hint { font-size: 0.75rem; color: #9ca3af; font-weight: 400; text-transform: none; letter-spacing: 0; display: block; margin-top: 0.1rem; }

    .brand-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 0.5rem; }
    .brand-label {
      display: flex; align-items: center; gap: 0.5rem;
      padding: 0.45rem 0.75rem; border: 1px solid #e5e7eb; border-radius: 8px;
      cursor: pointer; font-size: 0.85rem; color: #374151; background: white;
      transition: all 0.15s;
    }
    .brand-label:hover { border-color: #1e3a5f; }
    .brand-label.selected { border-color: #1e3a5f; background: #f0f5ff; color: #1e3a5f; font-weight: 500; }
    .brand-label input { accent-color: #1e3a5f; }

    .availability-row { }
    .avail-toggle-label { display: flex; align-items: center; gap: 1rem; cursor: pointer; }
    .big-toggle { position: relative; display: inline-block; width: 52px; height: 28px; flex-shrink: 0; }
    .big-toggle input { opacity: 0; width: 0; height: 0; }
    .big-slider { position: absolute; cursor: pointer; inset: 0; background: #d1d5db; border-radius: 28px; transition: 0.2s; }
    .big-slider::before { content: ''; position: absolute; width: 22px; height: 22px; left: 3px; bottom: 3px; background: white; border-radius: 50%; transition: 0.2s; }
    .big-toggle input:checked + .big-slider { background: #059669; }
    .big-toggle input:checked + .big-slider::before { transform: translateX(24px); }
    .avail-text { display: flex; flex-direction: column; gap: 0.15rem; }
    .avail-text strong { font-size: 0.95rem; color: #111827; }
    .avail-text span { font-size: 0.82rem; color: #6b7280; }

    .cert-section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem; }
    .cert-section-header h2 { margin: 0; }

    .cert-upload-form {
      background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px;
      padding: 1.25rem; margin-bottom: 1.25rem;
      display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;
    }
    .cert-upload-form .form-full { grid-column: 1 / -1; }
    .cert-upload-form .btn-primary { grid-column: 1 / -1; justify-self: start; }
    .cert-upload-form select {
      padding: 0.6rem 0.85rem; border: 1px solid #d1d5db; border-radius: 8px;
      font-size: 0.9rem; width: 100%; background: white;
    }
    .file-drop {
      border: 2px dashed #d1d5db; border-radius: 8px; padding: 1.5rem 1rem;
      text-align: center; cursor: pointer; transition: all 0.15s;
      font-size: 0.88rem; color: #6b7280; display: flex; flex-direction: column; gap: 0.25rem;
    }
    .file-drop:hover { border-color: #1e3a5f; background: #f0f5ff; }
    .file-drop.has-file { border-color: #6ee7b7; background: #f0fdf4; }
    .file-chosen { color: #065f46; font-weight: 600; }
    .file-hint { font-size: 0.78rem; color: #9ca3af; }
    .upload-error { grid-column: 1 / -1; color: #dc2626; font-size: 0.85rem; }

    .cert-list { display: flex; flex-direction: column; gap: 0.65rem; }
    .cert-card {
      display: flex; align-items: center; gap: 0.85rem;
      padding: 0.9rem 1rem; border: 1px solid #e5e7eb; border-radius: 10px; background: white;
    }
    .cert-card.cert-expiring { border-color: #fcd34d; background: #fffbeb; }
    .cert-card-icon { font-size: 1.4rem; flex-shrink: 0; }
    .cert-card-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 0.15rem; }
    .cert-card-info strong { font-size: 0.88rem; color: #111827; }
    .cert-card-info span { font-size: 0.8rem; color: #6b7280; }
    .cert-meta { font-size: 0.75rem !important; }
    .cert-expiring-text { color: #d97706; font-weight: 600; }
    .cert-card-actions { display: flex; gap: 0.4rem; flex-shrink: 0; }
    .cert-view-btn {
      font-size: 0.78rem; font-weight: 600; color: #1e3a5f;
      background: #f0f5ff; border: 1px solid #bfdbfe; border-radius: 6px;
      padding: 0.25rem 0.6rem; cursor: pointer; transition: all 0.15s;
    }
    .cert-view-btn:hover { background: #dbeafe; }
    .cert-del-btn {
      font-size: 0.78rem; color: #9ca3af; background: none; border: 1px solid #e5e7eb;
      border-radius: 6px; padding: 0.25rem 0.5rem; cursor: pointer;
    }
    .cert-del-btn:hover { color: #dc2626; border-color: #fca5a5; }
    .cert-empty { font-size: 0.85rem; color: #9ca3af; padding: 1rem 0; }

    .cert-modal-backdrop {
      position: fixed; inset: 0; background: rgba(0,0,0,0.45); z-index: 1000;
      display: flex; align-items: center; justify-content: center; padding: 1rem;
    }
    .cert-modal {
      background: white; border-radius: 16px; width: 100%; max-width: 480px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.2); overflow: hidden;
    }
    .cert-modal-header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 1rem 1.25rem; border-bottom: 1px solid #e5e7eb;
    }
    .cert-modal-header strong { font-size: 0.95rem; }
    .cert-modal-close { background: none; border: none; font-size: 1rem; cursor: pointer; color: #9ca3af; }
    .cert-modal-body { padding: 2rem 1.25rem; }
    .cert-preview-placeholder {
      text-align: center; display: flex; flex-direction: column; align-items: center; gap: 0.5rem;
    }
    .cert-preview-icon { font-size: 3rem; }
    .cert-preview-placeholder p { margin: 0; font-size: 0.88rem; color: #374151; font-weight: 500; }
    .cert-preview-hint { color: #9ca3af !important; font-size: 0.78rem !important; }
    .cert-modal-meta {
      display: flex; gap: 1.5rem; padding: 0.85rem 1.25rem;
      border-top: 1px solid #f3f4f6; background: #f9fafb;
      font-size: 0.78rem; color: #6b7280;
    }

    .profile-save-bar { display: flex; gap: 0.75rem; margin-top: 1rem; flex-wrap: wrap; }

    @media (max-width: 540px) { .form-grid { grid-template-columns: 1fr; } }
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

  private selectedBrands: string[] = [];
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
      this.selectedBrands = (eng.brandsSupported || '').split(',').map(s => s.trim()).filter(Boolean);
    }
    this.original = { ...this.form };
  }

  isBrandSelected(brand: string): boolean { return this.selectedBrands.includes(brand); }

  toggleBrand(brand: string) {
    if (this.selectedBrands.includes(brand)) {
      this.selectedBrands = this.selectedBrands.filter(b => b !== brand);
    } else {
      this.selectedBrands = [...this.selectedBrands, brand];
    }
  }

  save() {
    this.saved.set(true);
    setTimeout(() => this.saved.set(false), 3000);
  }

  reset() {
    this.form = { ...this.original };
  }

  toggleUpload() {
    this.uploadOpen.update(v => !v);
    this.uploadDraft = { type: '', fileName: '', expiryDate: '' };
    this._selectedFile = null;
    this.uploadError.set(null);
  }

  onFileChosen(event: Event) {
    const input = event.target as HTMLInputElement;
    const file  = input.files?.[0] ?? null;
    if (file) {
      this._selectedFile = file;
      this.uploadDraft.fileName = file.name;
    }
  }

  submitUpload() {
    if (!this.uploadDraft.type) {
      this.uploadError.set('Please select a certificate type.');
      return;
    }
    if (!this._selectedFile) {
      this.uploadError.set('Please choose a file to upload.');
      return;
    }
    const newCert: UploadedCert = {
      id: Date.now(),
      type: this.uploadDraft.type,
      fileName: this.uploadDraft.fileName,
      uploadedAt: new Date().toISOString().split('T')[0],
      expiryDate: this.uploadDraft.expiryDate || null,
    };
    this.certs.update(list => [newCert, ...list]);
    this.uploadOpen.set(false);
    this.uploadDraft = { type: '', fileName: '', expiryDate: '' };
    this._selectedFile = null;
    this.uploadError.set(null);
  }

  viewCert(cert: UploadedCert) {
    this.viewingCert.set(cert);
  }

  deleteCert(id: number) {
    this.certs.update(list => list.filter(c => c.id !== id));
  }

  isCertExpiringSoon(cert: UploadedCert): boolean {
    if (!cert.expiryDate) return false;
    const diff = new Date(cert.expiryDate).getTime() - Date.now();
    return diff < 60 * 24 * 60 * 60 * 1000; // within 60 days
  }
}
