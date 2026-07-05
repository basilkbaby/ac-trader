import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { AvailabilityService } from '../../core/services/availability.service';
import { MOCK_ENGINEER_DETAILS, MOCK_PORTFOLIO_GROUPS } from '../../core/mock/mock-data';
import { PortfolioGroup, PortfolioImage } from '../../core/models/models';

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
                        <span class="file-chosen">{{ uploadDraft.fileName }}</span>
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
                    <span class="cert-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2h8l4 4v16H6z"/><path d="M14 2v4h4M9 12l2 2 4-4"/></svg></span>
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
                      <button class="cert-view-btn" (click)="viewingCert.set(cert)">View</button>
                      <button class="cert-del-btn"  (click)="deleteCert(cert.id)">&#10005;</button>
                    </div>
                  </div>
                }
                @if (certs().length === 0) {
                  <p class="cert-empty">No certificates uploaded yet.</p>
                }
              </div>
            </div>
          </div>

          <!-- Portfolio / Previous work -->
          <div class="profile-card">
            <div class="card-header">
              <h3>Portfolio · Previous work</h3>
              <button class="btn-secondary btn-sm" (click)="addGroupOpen.set(!addGroupOpen())">
                {{ addGroupOpen() ? '✕ Cancel' : '+ New album' }}
              </button>
            </div>
            <div class="card-body">

              @if (addGroupOpen()) {
                <div class="upload-form">
                  <div class="form-group">
                    <label>Album title</label>
                    <input type="text" [(ngModel)]="newGroupTitle" name="newGroupTitle"
                      placeholder="e.g. Installations, Commercial jobs…" />
                  </div>
                  @if (addGroupError()) { <div class="upload-error">{{ addGroupError() }}</div> }
                  <button class="btn-primary btn-sm" (click)="createGroup()">Create album</button>
                </div>
              }

              @for (group of portfolioGroups(); track group.id) {
                <div class="portfolio-group">
                  <div class="pg-header">
                    <div class="pg-ring" [style.background]="group.coverColor">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7h3l2-2h8l2 2h3v13H3z"/><circle cx="12" cy="13" r="3.5"/></svg>
                    </div>
                    <div class="pg-info">
                      <span class="pg-title">{{ group.title }}</span>
                      <span class="pg-count">{{ group.images.length }} photo{{ group.images.length !== 1 ? 's' : '' }}</span>
                    </div>
                    <div class="pg-actions">
                      <button class="cert-view-btn" (click)="addPhotoGroup.set(addPhotoGroup() === group.id ? null : group.id)">
                        {{ addPhotoGroup() === group.id ? '✕' : '+ Add photo' }}
                      </button>
                      <button class="cert-del-btn" (click)="deleteGroup(group.id)">✕</button>
                    </div>
                  </div>

                  @if (addPhotoGroup() === group.id) {
                    <div class="upload-form pg-photo-form">
                      <div class="form-group">
                        <label>Caption</label>
                        <input type="text" [(ngModel)]="newPhotoCaption" name="newPhotoCaption"
                          placeholder="Describe the job…" />
                      </div>
                      <div class="form-group">
                        <label>File (PDF or image)</label>
                        <div class="file-drop" (click)="photoInput.click()" [class.has-file]="newPhotoFileName">
                          @if (newPhotoFileName) {
                            <span class="file-chosen">{{ newPhotoFileName }}</span>
                          } @else {
                            <span>Click to choose or drag &amp; drop</span>
                            <span class="file-hint">JPG, PNG, HEIC - max 10 MB</span>
                          }
                        </div>
                        <input #photoInput type="file" accept=".jpg,.jpeg,.png,.heic,.webp"
                          style="display:none" (change)="onPhotoChosen($event)" />
                      </div>
                      @if (addPhotoError()) { <div class="upload-error">{{ addPhotoError() }}</div> }
                      <button class="btn-primary btn-sm" (click)="submitPhoto(group.id)">Save photo</button>
                    </div>
                  }

                  @if (group.images.length > 0) {
                    <div class="pg-thumbs">
                      @for (img of group.images; track img.id) {
                        <div class="pg-thumb" [style.background]="img.color">
                          <span class="pg-thumb-del" (click)="deletePhoto(group.id, img.id)">✕</span>
                          <span class="pg-thumb-label">{{ img.jobType }}</span>
                        </div>
                      }
                    </div>
                  }
                </div>
              }

              @if (portfolioGroups().length === 0) {
                <p class="cert-empty">No albums yet. Create one to showcase your previous work.</p>
              }

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
                    <input type="checkbox" [checked]="avail.available()" (change)="avail.toggle()" name="available" />
                    <span class="big-slider"></span>
                  </div>
                </label>
                <div class="avail-text">
                  <strong>{{ avail.available() ? 'Available for new jobs' : 'Not taking new jobs' }}</strong>
                  <span>{{ avail.available() ? 'Your profile appears in customer searches and the top bar' : 'Hidden from customer searches' }}</span>
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
                  <span class="comp-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2h8l4 4v16H6z"/><path d="M14 2v4h4M9 12l2 2 4-4"/></svg></span>
                  <div>
                    <span class="comp-name">F-Gas Certificate</span>
                    <span class="comp-detail">{{ form.fGasCertNumber }}</span>
                  </div>
                </div>
                <span class="comp-badge comp-verified">Verified &#10003;</span>
              </div>
              <div class="compliance-item" [class.comp-ok]="form.hasPublicLiability">
                <div class="comp-item-left">
                  <span class="comp-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l7 3v6c0 4-3 7-7 9-4-2-7-5-7-9V6z"/></svg></span>
                  <div>
                    <span class="comp-name">Public Liability Insurance</span>
                    <span class="comp-detail">{{ form.hasPublicLiability ? 'On file' : 'Not provided' }}</span>
                  </div>
                </div>
                @if (form.hasPublicLiability) {
                  <span class="comp-badge comp-verified">Verified &#10003;</span>
                } @else {
                  <span class="comp-badge comp-missing">Upload cert &#8594;</span>
                }
              </div>
              <div class="compliance-item">
                <div class="comp-item-left">
                  <span class="comp-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/><path d="M16 11l2 2 3-3" transform="translate(0 -1)"/></svg></span>
                  <div>
                    <span class="comp-name">DBS Check</span>
                    <span class="comp-detail">Not provided</span>
                  </div>
                </div>
                <span class="comp-badge comp-missing">Upload cert &#8594;</span>
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
              <span class="cert-preview-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2h8l4 4v16H6z"/><path d="M14 2v4h4M9 13h6M9 17h4"/></svg></span>
              <p>{{ viewingCert()!.fileName }}</p>
              <p class="preview-hint">Certificate preview would display here.</p>
              <button class="btn-primary btn-sm">Download</button>
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
    .profile-page { display: flex; flex-direction: column; gap: 1.1rem; max-width: 1080px; }

    /* Title */
    .profile-titlerow { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; }
    .profile-titlerow h1 { font-size: 1.25rem; font-weight: 700; margin: 0 0 0.15rem; }
    .profile-sub { font-size: 0.78rem; color: var(--text-muted); margin: 0; }
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
      background: white; border: 1px solid var(--border); border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); overflow: hidden;
    }
    .card-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 0.85rem 1.25rem; border-bottom: 1px solid var(--border);
    }
    .card-header h3 {
      font-size: 0.78rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.05em; color: var(--text-secondary); margin: 0;
    }
    .card-header-hint { font-size: 0.72rem; color: var(--text-muted); }
    .card-body { padding: 1.1rem 1.25rem; display: flex; flex-direction: column; gap: 0.85rem; }

    /* Forms */
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
    .form-group { display: flex; flex-direction: column; gap: 0.25rem; }
    .form-group label { font-size: 0.72rem; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.04em; }
    .form-group input, .form-group textarea, .form-group select {
      padding: 0.5rem 0.75rem; border: 1px solid var(--border); border-radius: 8px;
      font-size: 0.88rem; width: 100%; box-sizing: border-box; background: white;
    }
    .form-group textarea { resize: vertical; }
    .lbl-hint { font-size: 0.7rem; color: var(--text-muted); font-weight: 400; text-transform: none; letter-spacing: 0; margin-left: 0.3rem; }

    /* Availability */
    .avail-row { display: flex; align-items: center; gap: 0.85rem; }
    .avail-toggle-wrap { cursor: pointer; flex-shrink: 0; }
    .big-toggle { position: relative; display: inline-block; width: 48px; height: 26px; }
    .big-toggle input { opacity: 0; width: 0; height: 0; }
    .big-slider { position: absolute; cursor: pointer; inset: 0; background: var(--border); border-radius: 26px; transition: 0.2s; }
    .big-slider::before { content: ''; position: absolute; width: 20px; height: 20px; left: 3px; bottom: 3px; background: white; border-radius: 50%; transition: 0.2s; }
    .big-toggle input:checked + .big-slider { background: #059669; }
    .big-toggle input:checked + .big-slider::before { transform: translateX(22px); }
    .avail-text strong { display: block; font-size: 0.88rem; color: var(--text-primary); margin-bottom: 0.1rem; }
    .avail-text span { font-size: 0.78rem; color: var(--text-muted); }

    /* Brand chips */
    .brand-grid { display: flex; flex-wrap: wrap; gap: 0.4rem; }
    .brand-chip {
      display: flex; align-items: center; gap: 0.3rem;
      padding: 0.3rem 0.65rem; border: 1px solid var(--border); border-radius: 999px;
      cursor: pointer; font-size: 0.78rem; color: var(--text-secondary); transition: all 0.12s;
    }
    .brand-chip:hover { border-color: var(--ink-2); color: var(--ink-2); }
    .brand-chip.selected { border-color: var(--ink-2); background: var(--brand-light); color: var(--ink-2); font-weight: 600; }
    .brand-chip input { width: 12px; height: 12px; accent-color: var(--ink-2); }

    /* Compliance */
    .compliance-list { gap: 0.5rem !important; }
    .compliance-item {
      display: flex; align-items: center; justify-content: space-between;
      padding: 0.7rem 0.85rem; border: 1px solid var(--border); border-radius: 10px;
      background: var(--bg); opacity: 0.6;
    }
    .compliance-item.comp-ok { opacity: 1; border-color: #bbf7d0; background: #f0fdf4; }
    .comp-item-left { display: flex; align-items: center; gap: 0.65rem; }
    .comp-icon { color: var(--text-secondary); display: inline-flex; flex-shrink: 0; }
    .comp-icon svg { width: 19px; height: 19px; }
    .comp-ok .comp-icon { color: var(--success); }
    .comp-name   { display: block; font-size: 0.83rem; font-weight: 600; color: var(--text-primary); }
    .comp-detail { display: block; font-size: 0.72rem; color: var(--text-muted); }
    .comp-badge { font-size: 0.68rem; font-weight: 700; padding: 0.2rem 0.5rem; border-radius: 999px; flex-shrink: 0; }
    .comp-verified { background: #d1fae5; color: #065f46; }
    .comp-missing  { background: var(--border); color: var(--text-secondary); cursor: pointer; }

    /* Certs */
    .upload-form {
      background: var(--bg); border: 1px solid var(--border); border-radius: 10px;
      padding: 1rem; display: flex; flex-direction: column; gap: 0.75rem;
      margin-bottom: 0.75rem;
    }
    .file-drop {
      border: 2px dashed var(--border); border-radius: 8px; padding: 1.1rem;
      text-align: center; cursor: pointer; font-size: 0.82rem; color: var(--text-muted);
      display: flex; flex-direction: column; gap: 0.2rem; transition: all 0.12s;
    }
    .file-drop:hover { border-color: var(--ink-2); background: var(--brand-light); }
    .file-drop.has-file { border-color: #6ee7b7; background: #f0fdf4; }
    .file-chosen { color: #065f46; font-weight: 600; }
    .file-hint { font-size: 0.72rem; }
    .upload-error { font-size: 0.78rem; color: #dc2626; }

    .cert-list { display: flex; flex-direction: column; }
    .cert-row {
      display: flex; align-items: center; gap: 0.65rem;
      padding: 0.65rem 0; border-bottom: 1px solid var(--border);
    }
    .cert-row:last-child { border-bottom: none; }
    .cert-row.cert-expiring { background: #fffbeb; border-radius: 8px; padding: 0.65rem 0.5rem; }
    .cert-icon { flex-shrink: 0; color: var(--brand); display: inline-flex; }
    .cert-icon svg { width: 18px; height: 18px; }
    .cert-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 0.1rem; }
    .cert-type { font-size: 0.82rem; font-weight: 600; color: var(--text-primary); }
    .cert-meta { font-size: 0.72rem; color: var(--text-muted); }
    .exp-soon  { color: #d97706; font-weight: 600; }
    .cert-actions { display: flex; gap: 0.3rem; flex-shrink: 0; }
    .cert-view-btn { font-size: 0.72rem; font-weight: 600; color: var(--ink-2); background: var(--brand-light); border: 1px solid #bfdbfe; border-radius: 6px; padding: 0.18rem 0.5rem; cursor: pointer; }
    .cert-del-btn  { font-size: 0.72rem; color: var(--text-muted); background: none; border: 1px solid var(--border); border-radius: 6px; padding: 0.18rem 0.45rem; cursor: pointer; }
    .cert-del-btn:hover { color: #dc2626; border-color: #fca5a5; }
    .cert-empty { font-size: 0.82rem; color: var(--text-muted); margin: 0; }

    /* Portfolio */
    .portfolio-group {
      background: var(--bg); border: 1px solid var(--border); border-radius: 10px;
      padding: 0.75rem; display: flex; flex-direction: column; gap: 0.6rem;
    }
    .pg-header { display: flex; align-items: center; gap: 0.65rem; }
    .pg-ring {
      width: 40px; height: 40px; border-radius: 50%; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center; color: #fff;
    }
    .pg-ring svg { width: 20px; height: 20px; }
    .pg-info { flex: 1; min-width: 0; }
    .pg-title { display: block; font-size: 0.85rem; font-weight: 600; color: var(--text-primary); }
    .pg-count { font-size: 0.72rem; color: var(--text-muted); }
    .pg-actions { display: flex; gap: 0.3rem; flex-shrink: 0; }
    .pg-photo-form { margin-top: 0; }
    .pg-thumbs { display: flex; flex-wrap: wrap; gap: 0.4rem; padding-top: 0.2rem; }
    .pg-thumb {
      width: 56px; height: 56px; border-radius: 8px; position: relative;
      display: flex; align-items: flex-end; padding: 0.2rem; cursor: default;
    }
    .pg-thumb-del {
      position: absolute; top: 3px; right: 3px; width: 16px; height: 16px;
      border-radius: 50%; background: rgba(0,0,0,0.4); color: white;
      font-size: 0.55rem; display: flex; align-items: center; justify-content: center;
      cursor: pointer; line-height: 1;
    }
    .pg-thumb-label {
      font-size: 0.55rem; font-weight: 700; color: rgba(255,255,255,0.85);
      background: rgba(0,0,0,0.3); border-radius: 4px; padding: 0.1rem 0.25rem;
    }

    /* Save bar */
    .save-bar { display: flex; gap: 0.5rem; align-items: center; justify-content: flex-end; padding-top: 0.25rem; }

    /* Modal */
    .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 1rem; }
    .modal { background: white; border-radius: 14px; width: 100%; max-width: 420px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.2); }
    .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 0.85rem 1.1rem; border-bottom: 1px solid var(--border); }
    .modal-header strong { font-size: 0.88rem; }
    .modal-close { background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 1rem; }
    .modal-body { padding: 1.5rem 1.1rem; }
    .cert-preview { text-align: center; display: flex; flex-direction: column; align-items: center; gap: 0.4rem; }
    .cert-preview-ico { width: 56px; height: 56px; border-radius: 14px; background: var(--brand-light); color: var(--brand); display: inline-flex; align-items: center; justify-content: center; margin-bottom: 0.4rem; }
    .cert-preview-ico svg { width: 28px; height: 28px; }
    .cert-preview p { font-size: 0.85rem; color: var(--text-primary); margin: 0; font-weight: 500; }
    .preview-hint { color: var(--text-muted) !important; font-size: 0.75rem !important; }
    .modal-footer { display: flex; gap: 1.5rem; padding: 0.75rem 1.1rem; border-top: 1px solid var(--border); background: var(--bg); font-size: 0.75rem; color: var(--text-muted); }

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
  avail      = inject(AvailabilityService);
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

  // Portfolio
  private _portfolioGroups = signal<PortfolioGroup[]>(
    MOCK_PORTFOLIO_GROUPS.filter(g => g.engineerId === (this.auth.currentUser()?.engineerId ?? 0))
      .map(g => ({ ...g, images: [...g.images] }))
  );
  addGroupOpen  = signal(false);
  addGroupError = signal<string | null>(null);
  addPhotoGroup = signal<number | null>(null);
  addPhotoError = signal<string | null>(null);
  newGroupTitle  = '';
  newPhotoCaption = '';
  newPhotoFileName = '';
  private _selectedPhoto: File | null = null;

  portfolioGroups(): PortfolioGroup[] { return this._portfolioGroups(); }

  createGroup() {
    if (!this.newGroupTitle.trim()) { this.addGroupError.set('Please enter a title.'); return; }
    const colors = ['var(--ink-2)','#064e3b','#4c1d95','#7f1d1d','#713f12'];
    const accents = ['#3b82f6','#10b981','#a78bfa','#f87171','#fcd34d'];
    const idx = this._portfolioGroups().length % colors.length;
    const newGroup: PortfolioGroup = {
      id: Date.now(), engineerId: this.auth.currentUser()!.engineerId!,
      title: this.newGroupTitle.trim(),
      coverColor: colors[idx], coverAccent: accents[idx], images: [],
    };
    this._portfolioGroups.update(gs => [...gs, newGroup]);
    this.newGroupTitle = '';
    this.addGroupOpen.set(false);
    this.addGroupError.set(null);
  }

  deleteGroup(id: number) {
    this._portfolioGroups.update(gs => gs.filter(g => g.id !== id));
    if (this.addPhotoGroup() === id) this.addPhotoGroup.set(null);
  }

  onPhotoChosen(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;
    if (file) { this._selectedPhoto = file; this.newPhotoFileName = file.name; }
  }

  submitPhoto(groupId: number) {
    if (!this.newPhotoCaption.trim()) { this.addPhotoError.set('Please add a caption.'); return; }
    if (!this._selectedPhoto)         { this.addPhotoError.set('Please choose a photo.');  return; }
    const jobTypes = ['Installation', 'Service', 'Repair', 'Commercial'];
    const newImg: PortfolioImage = {
      id: Date.now(), caption: this.newPhotoCaption.trim(),
      jobType: jobTypes[Math.floor(Math.random() * jobTypes.length)],
      color: 'var(--ink-2)', accentColor: '#3b82f6',
      postedAt: new Date().toISOString().split('T')[0],
    };
    this._portfolioGroups.update(gs =>
      gs.map(g => g.id === groupId ? { ...g, images: [...g.images, newImg] } : g)
    );
    this.newPhotoCaption = '';
    this.newPhotoFileName = '';
    this._selectedPhoto = null;
    this.addPhotoGroup.set(null);
    this.addPhotoError.set(null);
  }

  deletePhoto(groupId: number, imageId: number) {
    this._portfolioGroups.update(gs =>
      gs.map(g => g.id === groupId ? { ...g, images: g.images.filter(i => i.id !== imageId) } : g)
    );
  }

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
