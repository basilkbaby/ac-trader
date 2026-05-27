import { Component, inject, signal, OnInit, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EngineerService } from '../../core/services/engineer.service';
import { EngineerDetail } from '../../core/models/models';

@Component({
  selector: 'app-engineer-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-container">
      @if (loading()) { <div class="loading-state">Loading...</div> }
      @if (error()) { <div class="error-state">{{ error() }}</div> }

      @if (engineer()) {
        <div class="detail-wrap">
          <a routerLink="/engineers" class="back-link">← Back to engineers</a>

          <div class="detail-header">
            <div class="detail-avatar">{{ initials(engineer()!.fullName) }}</div>
            <div class="detail-info">
              <h1>{{ engineer()!.fullName }}</h1>
              <p class="detail-company">{{ engineer()!.companyName }}</p>
              <div class="detail-badges">
                @if (engineer()!.isVerified) {
                  <span class="badge badge-green">&#10003; ID Verified</span>
                }
                @if (engineer()!.hasPublicLiability) {
                  <span class="badge badge-blue">Insured</span>
                }
                @if (engineer()!.hasDbsCheck) {
                  <span class="badge badge-purple">DBS Checked</span>
                }
                <span class="badge" [class.badge-green]="engineer()!.isAvailable" [class.badge-gray]="!engineer()!.isAvailable">
                  {{ engineer()!.isAvailable ? 'Available' : 'Currently busy' }}
                </span>
              </div>
              <div class="detail-response">
                <span class="response-rate">{{ engineer()!.responseRatePercent || 95 }}% response rate</span>
                @if (engineer()!.avgResponseHours) {
                  <span class="response-time">Typically replies within {{ engineer()!.avgResponseHours }}h</span>
                }
              </div>
            </div>
            <div class="detail-cta">
              <a routerLink="/quote" class="btn-primary">Get a quote</a>
              <a routerLink="/service-plans" class="btn-secondary detail-plan-btn">See service plans</a>
            </div>
          </div>

          @if (engineer()!.bio) {
            <div class="detail-section">
              <h2>About {{ engineer()!.fullName.split(' ')[0] }}</h2>
              <p class="detail-bio">{{ engineer()!.bio }}</p>
            </div>
          }

          <div class="trust-signals-section">
            <h2>Credentials & trust</h2>
            <div class="trust-grid">
              <div class="trust-item" [class.trust-verified]="true">
                <div class="trust-icon">&#128272;</div>
                <div class="trust-content">
                  <strong>F-Gas Certificate</strong>
                  <span>{{ engineer()!.fGasCertNumber }}</span>
                  <span class="trust-verified-label">Verified &#10003;</span>
                </div>
              </div>
              <div class="trust-item" [class.trust-verified]="engineer()!.hasPublicLiability">
                <div class="trust-icon">&#128220;</div>
                <div class="trust-content">
                  <strong>Public Liability Insurance</strong>
                  <span>{{ engineer()!.hasPublicLiability ? 'Confirmed on file' : 'Not provided' }}</span>
                  @if (engineer()!.hasPublicLiability) {
                    <span class="trust-verified-label">Verified &#10003;</span>
                  }
                </div>
              </div>
              <div class="trust-item" [class.trust-verified]="engineer()!.hasDbsCheck">
                <div class="trust-icon">&#128100;</div>
                <div class="trust-content">
                  <strong>DBS Check</strong>
                  <span>{{ engineer()!.hasDbsCheck ? 'Enhanced DBS cleared' : 'Not provided' }}</span>
                  @if (engineer()!.hasDbsCheck) {
                    <span class="trust-verified-label">Verified &#10003;</span>
                  }
                </div>
              </div>
              <div class="trust-item trust-verified">
                <div class="trust-icon">&#127942;</div>
                <div class="trust-content">
                  <strong>Member since</strong>
                  <span>{{ memberSinceYear() }}</span>
                  <span class="trust-verified-label">{{ engineer()!.jobsCompleted }} jobs completed</span>
                </div>
              </div>
            </div>
          </div>

          <div class="detail-grid">
            <div class="detail-section">
              <h2>Service details</h2>
              <table class="info-table">
                <tr><td>Coverage area</td><td>{{ engineer()!.coveragePostcode }}</td></tr>
                <tr><td>Hourly rate</td><td>£{{ engineer()!.hourlyRate }}/hr</td></tr>
                <tr><td>Jobs completed</td><td>{{ engineer()!.jobsCompleted }}</td></tr>
                <tr>
                  <td>Average rating</td>
                  <td>
                    <span class="inline-stars">{{ stars(engineer()!.averageRating) }}</span>
                    {{ engineer()!.averageRating.toFixed(1) }}/5
                  </td>
                </tr>
              </table>
            </div>

            <div class="detail-section">
              <h2>Specialisms</h2>
              <div class="specialisms-list">
                @for (s of specialisms(); track s) {
                  <span class="specialism-tag">{{ s }}</span>
                }
              </div>
              @if (brands().length > 0) {
                <h3 class="brands-label">Brand specialists</h3>
                <div class="specialisms-list">
                  @for (b of brands(); track b) {
                    <span class="specialism-tag specialism-brand">{{ b }}</span>
                  }
                </div>
              }
            </div>
          </div>

          @if (engineer()!.ratingBreakdown) {
            <div class="detail-section rating-breakdown-section">
              <h2>Rating breakdown</h2>
              <div class="rating-breakdown">
                @for (item of ratingItems(); track item.label) {
                  <div class="rating-row">
                    <span class="rating-label">{{ item.label }}</span>
                    <div class="rating-bar-wrap">
                      <div class="rating-bar-fill" [style.width.%]="item.pct"></div>
                    </div>
                    <span class="rating-val">{{ item.val.toFixed(1) }}</span>
                  </div>
                }
              </div>
            </div>
          }

          <div class="detail-section">
            <h2>Reviews
              @if (engineer()!.reviews.length > 0) {
                <span class="review-count">({{ engineer()!.reviews.length }})</span>
              }
            </h2>
            @if (engineer()!.reviews.length === 0) {
              <p class="empty-reviews">No reviews yet - be the first to review after your job!</p>
            }
            @for (review of engineer()!.reviews; track review.id) {
              <div class="review-card">
                <div class="review-header">
                  <strong>{{ review.customerName }}</strong>
                  <span class="review-stars">{{ stars(review.rating) }}</span>
                  @if (review.isVerified) {
                    <span class="badge badge-green review-badge">Verified booking</span>
                  }
                </div>
                @if (review.jobType) {
                  <span class="review-job-type">{{ review.jobType | titlecase }}</span>
                }
                <p class="review-comment">{{ review.comment }}</p>
                <span class="review-date">{{ review.createdAt | date:'d MMM yyyy' }}</span>
              </div>
            }
          </div>

          <div class="detail-book-footer">
            <div class="book-footer-text">
              <strong>Ready to book {{ engineer()!.fullName.split(' ')[0] }}?</strong>
              <span>Get an instant quote then confirm your date.</span>
            </div>
            <a routerLink="/quote" class="btn-primary">Get a quote</a>
          </div>

        </div>
      }
    </div>
  `,
  styles: [`
    .detail-response {
      display: flex;
      gap: 0.75rem;
      margin-top: 0.4rem;
      font-size: 0.82rem;
      color: #6b7280;
      flex-wrap: wrap;
    }
    .response-rate { font-weight: 600; color: #059669; }
    .detail-plan-btn { display: block; text-align: center; margin-top: 0.5rem; }

    .detail-bio { color: #374151; line-height: 1.7; font-size: 0.95rem; }

    .trust-signals-section {
      margin: 2rem 0;
    }
    .trust-signals-section h2 { margin-bottom: 1rem; }
    .trust-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1rem;
    }
    .trust-item {
      display: flex;
      gap: 0.75rem;
      padding: 1rem 1.25rem;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      background: #f9fafb;
      opacity: 0.6;
    }
    .trust-verified {
      opacity: 1;
      border-color: #6ee7b7;
      background: #f0fdf4;
    }
    .trust-icon { font-size: 1.4rem; flex-shrink: 0; }
    .trust-content { display: flex; flex-direction: column; gap: 0.15rem; }
    .trust-content strong { font-size: 0.88rem; color: #111827; }
    .trust-content span { font-size: 0.8rem; color: #6b7280; }
    .trust-verified-label { font-size: 0.75rem; color: #059669; font-weight: 600; }

    .badge-blue { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; border-radius: 999px; padding: 0.15rem 0.5rem; font-size: 0.75rem; }
    .badge-purple { background: #faf5ff; color: #7c3aed; border: 1px solid #ddd6fe; border-radius: 999px; padding: 0.15rem 0.5rem; font-size: 0.75rem; }

    .brands-label { font-size: 0.85rem; font-weight: 600; color: #374151; margin: 1rem 0 0.5rem; }
    .specialism-brand { background: #eff6ff; color: #1d4ed8; border-color: #bfdbfe; }

    .inline-stars { color: #f59e0b; }

    .rating-breakdown-section { max-width: 480px; }
    .rating-breakdown { display: flex; flex-direction: column; gap: 0.75rem; }
    .rating-row { display: grid; grid-template-columns: 120px 1fr 2.5rem; align-items: center; gap: 0.75rem; }
    .rating-label { font-size: 0.85rem; color: #374151; }
    .rating-bar-wrap { height: 8px; background: #e5e7eb; border-radius: 999px; overflow: hidden; }
    .rating-bar-fill { height: 100%; background: #f59e0b; border-radius: 999px; transition: width 0.4s ease; }
    .rating-val { font-size: 0.85rem; font-weight: 600; color: #111827; text-align: right; }

    .review-count { font-size: 1rem; font-weight: 400; color: #6b7280; margin-left: 0.25rem; }
    .review-job-type {
      display: inline-block;
      font-size: 0.75rem;
      background: #f3f4f6;
      color: #374151;
      border-radius: 999px;
      padding: 0.1rem 0.5rem;
      margin-bottom: 0.4rem;
    }

    .detail-book-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #f0f5ff;
      border: 1px solid #c7d9f5;
      border-radius: 14px;
      padding: 1.25rem 1.5rem;
      margin-top: 2rem;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .book-footer-text { display: flex; flex-direction: column; gap: 0.2rem; }
    .book-footer-text strong { font-size: 1rem; color: #111827; }
    .book-footer-text span { font-size: 0.88rem; color: #6b7280; }
  `]
})
export class EngineerDetailComponent implements OnInit {
  id = input.required<string>();
  private engineerService = inject(EngineerService);

  engineer = signal<EngineerDetail | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit() {
    this.loading.set(true);
    this.engineerService.getById(+this.id()).subscribe({
      next: (data) => { this.loading.set(false); this.engineer.set(data); },
      error: (err) => { this.loading.set(false); this.error.set(err.message); }
    });
  }

  initials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  stars(rating: number): string {
    const full = Math.round(rating);
    return '★'.repeat(full) + '☆'.repeat(5 - full);
  }

  specialisms(): string[] {
    return (this.engineer()?.specialisms || '').split(',').map(s => s.trim()).filter(Boolean);
  }

  brands(): string[] {
    return (this.engineer()?.brandsSupported || '').split(',').map(s => s.trim()).filter(Boolean);
  }

  memberSinceYear(): string {
    const d = this.engineer()?.memberSince || this.engineer()?.createdAt;
    if (!d) return 'Early member';
    return new Date(d).getFullYear().toString();
  }

  ratingItems(): { label: string; val: number; pct: number }[] {
    const rb = this.engineer()?.ratingBreakdown;
    if (!rb) return [];
    return [
      { label: 'Professionalism', val: rb.professionalism, pct: (rb.professionalism / 5) * 100 },
      { label: 'Punctuality',     val: rb.punctuality,     pct: (rb.punctuality / 5) * 100 },
      { label: 'Quality of work', val: rb.quality,         pct: (rb.quality / 5) * 100 },
      { label: 'Value for money', val: rb.value,           pct: (rb.value / 5) * 100 },
    ];
  }
}
