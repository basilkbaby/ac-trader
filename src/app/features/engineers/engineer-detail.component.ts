import { Component, inject, signal, OnInit, input, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EngineerService } from '../../core/services/engineer.service';
import { EngineerDetail, PortfolioGroup, PortfolioImage } from '../../core/models/models';
import { MOCK_PORTFOLIO_GROUPS } from '../../core/mock/mock-data';

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

          <!-- Portfolio story rings -->
          @if (portfolioGroups().length > 0) {
            <div class="portfolio-strip">
              <div class="portfolio-rings">
                @for (group of portfolioGroups(); track group.id) {
                  <button class="story-ring-btn" (click)="openStory(group, 0)">
                    <div class="story-ring" [style.--ring-color]="group.coverAccent">
                      <div class="story-thumb" [style.background]="group.coverColor">
                        <span class="story-thumb-icon">📸</span>
                      </div>
                    </div>
                    <span class="story-label">{{ group.title }}</span>
                  </button>
                }
              </div>
            </div>
          }

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

    <!-- Story viewer -->
    @if (storyGroup()) {
      <div class="story-overlay" (click)="closeStory()">
        <div class="story-viewer" (click)="$event.stopPropagation()">

          <!-- Progress bars -->
          <div class="story-progress">
            @for (img of storyGroup()!.images; track img.id; let i = $index) {
              <div class="story-prog-track">
                <div class="story-prog-fill"
                  [class.done]="i < storyIndex()"
                  [class.active]="i === storyIndex()">
                </div>
              </div>
            }
          </div>

          <!-- Header -->
          <div class="story-header">
            <div class="story-meta">
              <div class="story-avatar-sm">{{ initials(engineer()!.fullName) }}</div>
              <div class="story-meta-text">
                <span class="story-name">{{ engineer()!.fullName }}</span>
                <span class="story-group-title">{{ storyGroup()!.title }}</span>
              </div>
            </div>
            <button class="story-close" (click)="closeStory()">✕</button>
          </div>

          <!-- Image card -->
          <div class="story-card"
            [style.background]="'linear-gradient(160deg, ' + currentImage()!.color + ' 0%, ' + currentImage()!.accentColor + '33 100%)'">
            <div class="story-job-pill">{{ currentImage()!.jobType }}</div>
            <div class="story-card-inner">
              <div class="story-placeholder-icon">🔧</div>
              <p class="story-caption">{{ currentImage()!.caption }}</p>
              <span class="story-date">{{ currentImage()!.postedAt | date:'d MMM yyyy' }}</span>
            </div>
          </div>

          <!-- Nav tap zones -->
          <div class="story-nav story-nav-prev" (click)="prevImage()"></div>
          <div class="story-nav story-nav-next" (click)="nextImage()"></div>

          <!-- Counter -->
          <div class="story-counter">{{ storyIndex() + 1 }} / {{ storyGroup()!.images.length }}</div>

        </div>
      </div>
    }
  `,
  styles: [`
    /* Portfolio story rings */
    .portfolio-strip {
      padding: 1.25rem 0 0.25rem;
      border-bottom: 1px solid #f3f4f6;
      margin-bottom: 0.5rem;
    }
    .portfolio-rings {
      display: flex; gap: 1.25rem; flex-wrap: wrap;
    }
    .story-ring-btn {
      display: flex; flex-direction: column; align-items: center; gap: 0.4rem;
      background: none; border: none; cursor: pointer; padding: 0;
    }
    .story-ring {
      width: 68px; height: 68px; border-radius: 50%;
      background: conic-gradient(var(--ring-color, #3b82f6) 0%, var(--ring-color, #3b82f6) 100%);
      padding: 3px;
      display: flex; align-items: center; justify-content: center;
    }
    .story-thumb {
      width: 60px; height: 60px; border-radius: 50%;
      border: 3px solid white;
      display: flex; align-items: center; justify-content: center;
    }
    .story-thumb-icon { font-size: 1.4rem; }
    .story-label { font-size: 0.72rem; font-weight: 600; color: #374151; max-width: 72px; text-align: center; line-height: 1.2; }

    /* Story viewer overlay */
    .story-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,0.85);
      z-index: 2000; display: flex; align-items: center; justify-content: center;
    }
    .story-viewer {
      position: relative; width: 100%; max-width: 390px; height: 680px;
      border-radius: 18px; overflow: hidden; display: flex; flex-direction: column;
    }

    /* Progress bars */
    .story-progress {
      position: absolute; top: 10px; left: 10px; right: 10px;
      display: flex; gap: 4px; z-index: 10;
    }
    .story-prog-track {
      flex: 1; height: 3px; background: rgba(255,255,255,0.35); border-radius: 999px; overflow: hidden;
    }
    .story-prog-fill { height: 100%; width: 0; background: white; transition: none; border-radius: 999px; }
    .story-prog-fill.done  { width: 100%; }
    .story-prog-fill.active { width: 60%; }

    /* Story header */
    .story-header {
      position: absolute; top: 22px; left: 10px; right: 10px;
      display: flex; align-items: center; justify-content: space-between;
      z-index: 10;
    }
    .story-meta { display: flex; align-items: center; gap: 0.6rem; }
    .story-avatar-sm {
      width: 36px; height: 36px; border-radius: 50%;
      background: #1e3a5f; border: 2px solid white;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.72rem; font-weight: 700; color: white; flex-shrink: 0;
    }
    .story-meta-text { display: flex; flex-direction: column; }
    .story-name { font-size: 0.82rem; font-weight: 700; color: white; text-shadow: 0 1px 3px rgba(0,0,0,0.5); }
    .story-group-title { font-size: 0.7rem; color: rgba(255,255,255,0.75); }
    .story-close {
      background: rgba(0,0,0,0.3); border: none; color: white;
      border-radius: 50%; width: 28px; height: 28px;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; font-size: 0.82rem; backdrop-filter: blur(4px);
    }

    /* Story card */
    .story-card {
      flex: 1; display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      padding: 5rem 1.5rem 3rem;
      position: relative;
    }
    .story-job-pill {
      position: absolute; top: 72px; right: 16px;
      background: rgba(255,255,255,0.18); backdrop-filter: blur(8px);
      color: white; font-size: 0.72rem; font-weight: 700;
      padding: 0.25rem 0.65rem; border-radius: 999px;
      border: 1px solid rgba(255,255,255,0.25);
    }
    .story-card-inner { text-align: center; display: flex; flex-direction: column; align-items: center; gap: 0.75rem; }
    .story-placeholder-icon { font-size: 3.5rem; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3)); }
    .story-caption {
      font-size: 1rem; font-weight: 600; color: white; line-height: 1.4;
      text-shadow: 0 2px 6px rgba(0,0,0,0.4); max-width: 280px;
    }
    .story-date { font-size: 0.75rem; color: rgba(255,255,255,0.65); }

    /* Nav tap zones */
    .story-nav {
      position: absolute; top: 0; bottom: 0; width: 40%; cursor: pointer; z-index: 5;
    }
    .story-nav-prev { left: 0; }
    .story-nav-next { right: 0; }

    /* Counter */
    .story-counter {
      position: absolute; bottom: 14px; left: 50%; transform: translateX(-50%);
      font-size: 0.72rem; color: rgba(255,255,255,0.6); z-index: 10;
    }

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

  // Portfolio stories
  storyGroup  = signal<PortfolioGroup | null>(null);
  storyIndex  = signal(0);

  portfolioGroups(): PortfolioGroup[] {
    return MOCK_PORTFOLIO_GROUPS.filter(g => g.engineerId === +this.id());
  }

  currentImage(): PortfolioImage | null {
    const g = this.storyGroup();
    if (!g) return null;
    return g.images[this.storyIndex()] ?? null;
  }

  openStory(group: PortfolioGroup, index: number) {
    this.storyGroup.set(group);
    this.storyIndex.set(index);
  }

  closeStory() { this.storyGroup.set(null); }

  nextImage() {
    const g = this.storyGroup();
    if (!g) return;
    if (this.storyIndex() < g.images.length - 1) {
      this.storyIndex.update(i => i + 1);
    } else {
      this.closeStory();
    }
  }

  prevImage() {
    if (this.storyIndex() > 0) {
      this.storyIndex.update(i => i - 1);
    }
  }

  @HostListener('document:keydown', ['$event'])
  onKey(e: KeyboardEvent) {
    if (!this.storyGroup()) return;
    if (e.key === 'ArrowRight') this.nextImage();
    if (e.key === 'ArrowLeft')  this.prevImage();
    if (e.key === 'Escape')     this.closeStory();
  }

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
