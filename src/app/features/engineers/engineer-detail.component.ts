import { Component, inject, signal, OnInit, OnDestroy, input, HostListener } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { EngineerService } from '../../core/services/engineer.service';
import { EngineerDetail, PortfolioGroup, PortfolioImage } from '../../core/models/models';
import { MOCK_PORTFOLIO_GROUPS } from '../../core/mock/mock-data';

@Component({
  selector: 'app-engineer-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    @if (loading()) { <div class="page-container"><div class="loading-state">Loading...</div></div> }
    @if (error()) { <div class="page-container"><div class="error-state">{{ error() }}</div></div> }

    @if (engineer()) {
      <!-- Shareable business landing hero -->
      <section class="profile-hero">
        <div class="profile-hero-inner">
          <a routerLink="/engineers" class="profile-back-link">&larr; All engineers</a>

          <div class="profile-hero-main">
            <div class="profile-logo-wrap">
              @if (engineer()!.companyLogoUrl && !logoLoadError()) {
                <img [src]="engineer()!.companyLogoUrl" [alt]="engineer()!.companyName" class="profile-logo-img" (error)="logoLoadError.set(true)" />
              } @else {
                <div class="profile-logo-fallback">{{ initials(engineer()!.companyName) }}</div>
              }
              @if (engineer()!.isAvailable) { <span class="profile-avail-dot" title="Available now"></span> }
            </div>

            <div class="profile-hero-text">
              <h1 class="profile-company-name">{{ engineer()!.companyName }}</h1>
              <p class="profile-byline">Run by {{ engineer()!.fullName }}</p>

              <div class="profile-badges">
                @if (engineer()!.isVerified) {
                  <span class="p-badge p-badge-green">&#10003; ID Verified</span>
                }
                @if (engineer()!.hasPublicLiability) {
                  <span class="p-badge p-badge-blue">Insured</span>
                }
                @if (engineer()!.hasDbsCheck) {
                  <span class="p-badge p-badge-purple">DBS Checked</span>
                }
                <span class="p-badge" [class.p-badge-green]="engineer()!.isAvailable" [class.p-badge-gray]="!engineer()!.isAvailable">
                  {{ engineer()!.isAvailable ? 'Available now' : 'Currently busy' }}
                </span>
              </div>

              <div class="profile-stats-row">
                <span class="profile-stat">
                  <strong>{{ engineer()!.averageRating.toFixed(1) }}</strong>
                  <span class="profile-stat-stars">{{ stars(engineer()!.averageRating) }}</span>
                  <span class="profile-stat-sub">({{ engineer()!.reviews.length }} reviews)</span>
                </span>
                <span class="profile-stat-sep">&middot;</span>
                <span class="profile-stat">{{ engineer()!.jobsCompleted }} jobs completed</span>
                <span class="profile-stat-sep">&middot;</span>
                <span class="profile-stat">Serving {{ engineer()!.coveragePostcode }}</span>
              </div>
            </div>

            <div class="profile-hero-actions">
              <a routerLink="/quote" class="btn-primary profile-cta-primary">Get a quote</a>
              <button type="button" class="profile-btn-ghost" (click)="shareProfile()">
                {{ shareCopied() ? '&#10003; Link copied' : '&#8599; Share profile' }}
              </button>
            </div>
          </div>

          <div class="profile-stat-cards">
            <div class="profile-stat-card">
              <span class="psc-val">{{ engineer()!.responseRatePercent || 95 }}%</span>
              <span class="psc-label">Response rate</span>
            </div>
            <div class="profile-stat-card">
              <span class="psc-val">{{ engineer()!.avgResponseHours }}h</span>
              <span class="psc-label">Avg. response</span>
            </div>
            <div class="profile-stat-card">
              <span class="psc-val">{{ yearsTrading() }}+</span>
              <span class="psc-label">Years trading</span>
            </div>
            <div class="profile-stat-card">
              <span class="psc-val">{{ engineer()!.jobsCompleted }}</span>
              <span class="psc-label">Jobs completed</span>
            </div>
          </div>
        </div>
      </section>

      <div class="page-container">
        <div class="detail-wrap">

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
              <h2>About {{ engineer()!.companyName }}</h2>
              <p class="detail-bio">{{ engineer()!.bio }}</p>
            </div>
          }

          <div class="panel-section">
            <h2 class="panel-heading">Credentials &amp; trust</h2>
            <div class="trust-grid">
              <div class="trust-card" [class.trust-card-on]="true">
                <div class="trust-card-icon ti-cert">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="5"/><path d="M8.5 13 7 22l5-3 5 3-1.5-9"/></svg>
                </div>
                <div class="trust-card-body">
                  <strong>F-Gas Certificate</strong>
                  <span>{{ engineer()!.fGasCertNumber }}</span>
                </div>
                <span class="trust-check" title="Verified">&#10003;</span>
              </div>
              <div class="trust-card" [class.trust-card-on]="engineer()!.hasPublicLiability">
                <div class="trust-card-icon ti-shield">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 4 5v6c0 5 3.5 9 8 11 4.5-2 8-6 8-11V5z"/></svg>
                </div>
                <div class="trust-card-body">
                  <strong>Public Liability Insurance</strong>
                  <span>{{ engineer()!.hasPublicLiability ? 'Confirmed on file' : 'Not provided' }}</span>
                </div>
                @if (engineer()!.hasPublicLiability) { <span class="trust-check" title="Verified">&#10003;</span> }
              </div>
              <div class="trust-card" [class.trust-card-on]="engineer()!.hasDbsCheck">
                <div class="trust-card-icon ti-dbs">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>
                </div>
                <div class="trust-card-body">
                  <strong>DBS Check</strong>
                  <span>{{ engineer()!.hasDbsCheck ? 'Enhanced DBS cleared' : 'Not provided' }}</span>
                </div>
                @if (engineer()!.hasDbsCheck) { <span class="trust-check" title="Verified">&#10003;</span> }
              </div>
              <div class="trust-card trust-card-on">
                <div class="trust-card-icon ti-member">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M8 21h8M12 17v4M7 4h10v4a5 5 0 0 1-10 0z"/><path d="M7 5H4a3 3 0 0 0 3 5M17 5h3a3 3 0 0 1-3 5"/></svg>
                </div>
                <div class="trust-card-body">
                  <strong>Member since {{ memberSinceYear() }}</strong>
                  <span>{{ engineer()!.jobsCompleted }} jobs completed</span>
                </div>
              </div>
            </div>
          </div>

          <div class="panel-section">
            <div class="detail-grid-v2">
              <div class="glance-card">
                <h2 class="panel-heading">Service details</h2>
                <div class="glance-row">
                  <span class="glance-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s7-6.5 7-12a7 7 0 0 0-14 0c0 5.5 7 12 7 12z"/><circle cx="12" cy="9" r="2.5"/></svg></span>
                  <span class="glance-label">Coverage area</span>
                  <span class="glance-val">{{ engineer()!.coveragePostcode }}</span>
                </div>
                <div class="glance-row">
                  <span class="glance-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M9.5 15.5c.5 1 1.4 1.5 2.5 1.5 1.7 0 3-1 3-2.3 0-3-5.5-1.5-5.5-4.4C9.5 9 10.8 8 12.5 8c1.1 0 2 .5 2.5 1.5M12 6.5v11"/></svg></span>
                  <span class="glance-label">Hourly rate</span>
                  <span class="glance-val">£{{ engineer()!.hourlyRate }}/hr</span>
                </div>
                <div class="glance-row">
                  <span class="glance-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></span>
                  <span class="glance-label">Jobs completed</span>
                  <span class="glance-val">{{ engineer()!.jobsCompleted }}</span>
                </div>
                <div class="glance-row">
                  <span class="glance-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m12 2 2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.8L6 21l1.6-7-5.4-4.7 7.1-.6z"/></svg></span>
                  <span class="glance-label">Average rating</span>
                  <span class="glance-val"><span class="inline-stars">{{ stars(engineer()!.averageRating) }}</span> {{ engineer()!.averageRating.toFixed(1) }}/5</span>
                </div>
              </div>

              <div class="glance-card">
                <h2 class="panel-heading">Specialisms</h2>
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
          </div>

          @if (engineer()!.ratingBreakdown) {
            <div class="panel-section rating-breakdown-section">
              <h2 class="panel-heading">Rating breakdown</h2>
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

          <div class="panel-section">
            <h2 class="panel-heading">Reviews
              @if (engineer()!.reviews.length > 0) {
                <span class="review-count">({{ engineer()!.reviews.length }})</span>
              }
            </h2>
            @if (engineer()!.reviews.length === 0) {
              <p class="empty-reviews">No reviews yet - be the first to review after your job!</p>
            }
            <div class="review-list">
              @for (review of engineer()!.reviews; track review.id) {
                <div class="review-card">
                  <div class="review-avatar">{{ initials(review.customerName) }}</div>
                  <div class="review-body">
                    <div class="review-header">
                      <strong>{{ review.customerName }}</strong>
                      @if (review.isVerified) {
                        <span class="badge badge-green review-badge">Verified booking</span>
                      }
                      <span class="review-date">{{ review.createdAt | date:'d MMM yyyy' }}</span>
                    </div>
                    <div class="review-meta-row">
                      <span class="review-stars">{{ stars(review.rating) }}</span>
                      @if (review.jobType) {
                        <span class="review-job-type">{{ review.jobType | titlecase }}</span>
                      }
                    </div>
                    <p class="review-comment">{{ review.comment }}</p>
                  </div>
                </div>
              }
            </div>
          </div>

          <div class="detail-book-footer">
            <div class="book-footer-text">
              <strong>Ready to book {{ engineer()!.companyName }}?</strong>
              <span>Get an instant quote then confirm your date.</span>
            </div>
            <a routerLink="/quote" class="btn-primary">Get a quote</a>
          </div>

        </div>
      </div>
    }

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
    /* ── Shareable business landing hero ─────────────────────────────────────── */
    .profile-hero {
      background: var(--grad-hero);
      color: #fff;
      padding: 2.5rem 1.25rem 0;
      position: relative;
      overflow: hidden;
    }
    .profile-hero::after {
      content: ''; position: absolute; inset: 0;
      background: radial-gradient(45% 70% at 85% 0%, rgba(25,192,214,0.18), transparent 70%);
      pointer-events: none;
    }
    .profile-hero-inner { position: relative; z-index: 1; max-width: 1100px; margin: 0 auto; }

    .profile-back-link {
      display: inline-block; font-size: 0.85rem; color: rgba(255,255,255,0.7);
      margin-bottom: 1.5rem;
    }
    .profile-back-link:hover { color: #fff; text-decoration: none; }

    .profile-hero-main {
      display: flex; align-items: flex-start; gap: 1.5rem; flex-wrap: wrap;
      padding-bottom: 1.75rem;
    }

    .profile-logo-wrap { position: relative; flex-shrink: 0; }
    .profile-logo-img {
      width: 96px; height: 96px; border-radius: 50%; object-fit: cover;
      border: 3px solid rgba(255,255,255,0.85);
      box-shadow: var(--shadow-lg);
    }
    .profile-logo-fallback {
      width: 96px; height: 96px; border-radius: 50%;
      background: var(--grad-accent); color: #fff;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.6rem; font-weight: 800;
      border: 3px solid rgba(255,255,255,0.85);
      box-shadow: var(--shadow-lg);
    }
    .profile-avail-dot {
      position: absolute; bottom: 4px; right: 4px;
      width: 18px; height: 18px; border-radius: 50%;
      background: #22c55e; border: 3px solid var(--ink);
    }

    .profile-hero-text { flex: 1; min-width: 240px; }
    .profile-company-name { color: #fff; font-size: clamp(1.5rem, 4.5vw, 2.4rem); margin-bottom: 0.15rem; }
    .profile-byline { color: rgba(255,255,255,0.72); font-size: 0.95rem; margin-bottom: 0.85rem; }

    .profile-badges { display: flex; gap: 0.4rem; flex-wrap: wrap; margin-bottom: 0.85rem; }
    .p-badge {
      display: inline-flex; align-items: center; border-radius: 999px;
      padding: 0.2rem 0.6rem; font-size: 0.72rem; font-weight: 600;
      background: rgba(255,255,255,0.12); color: rgba(255,255,255,0.9);
      border: 1px solid rgba(255,255,255,0.18);
    }
    .p-badge-green { background: rgba(34,197,94,0.18); color: #6ee7b7; border-color: rgba(110,231,183,0.3); }
    .p-badge-blue  { background: rgba(59,130,246,0.18); color: #93c5fd; border-color: rgba(147,197,253,0.3); }
    .p-badge-purple{ background: rgba(167,139,250,0.18); color: #c4b5fd; border-color: rgba(196,181,253,0.3); }
    .p-badge-gray  { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.6); }

    .profile-stats-row {
      display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;
      font-size: 0.85rem; color: rgba(255,255,255,0.78);
    }
    .profile-stat { display: inline-flex; align-items: center; gap: 0.3rem; }
    .profile-stat strong { color: #fff; }
    .profile-stat-stars { color: var(--gold); }
    .profile-stat-sub { color: rgba(255,255,255,0.55); }
    .profile-stat-sep { color: rgba(255,255,255,0.35); }

    .profile-hero-actions {
      display: flex; flex-direction: column; gap: 0.6rem;
      margin-left: auto; flex-shrink: 0; width: 100%; max-width: 220px;
    }
    .profile-cta-primary { text-align: center; }
    .profile-btn-ghost {
      background: rgba(255,255,255,0.08); border: 1.5px solid rgba(255,255,255,0.3);
      color: #fff; border-radius: var(--radius-sm); padding: 0.55rem 1rem;
      font-size: 0.9rem; font-weight: 600; cursor: pointer; text-align: center;
      transition: background 0.15s;
    }
    .profile-btn-ghost:hover { background: rgba(255,255,255,0.18); }

    .profile-stat-cards {
      display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem;
      padding-bottom: 2rem;
    }
    .profile-stat-card {
      background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.12);
      border-radius: var(--radius-md); padding: 0.85rem 1rem;
      display: flex; flex-direction: column; gap: 0.15rem;
      backdrop-filter: blur(6px);
    }
    .psc-val { font-size: 1.3rem; font-weight: 800; color: #fff; }
    .psc-label { font-size: 0.72rem; color: rgba(255,255,255,0.6); }

    @media (min-width: 700px) {
      .profile-hero-actions { width: auto; }
      .profile-stat-cards { grid-template-columns: repeat(4, 1fr); }
    }

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
      background: var(--ink-2); border: 2px solid white;
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

    .detail-bio { color: #374151; line-height: 1.7; font-size: 0.95rem; }

    /* ── Panel sections (Credentials, Service details, Rating, Reviews) ─────── */
    .panel-section {
      background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm); padding: 1.5rem 1.75rem; margin: 1.5rem 0;
    }
    .panel-heading {
      display: flex; align-items: center; gap: 0.5rem;
      margin-bottom: 1.25rem; padding-bottom: 0.85rem;
      border-bottom: 1px solid var(--border);
    }

    /* Credentials & trust */
    .trust-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1rem;
    }
    .trust-card {
      position: relative;
      display: flex; align-items: flex-start; gap: 0.85rem;
      padding: 1rem 1.1rem;
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      background: var(--bg);
      opacity: 0.65;
      transition: transform 0.15s, box-shadow 0.15s;
    }
    .trust-card-on {
      opacity: 1;
      border-color: #6ee7b7;
      background: var(--success-bg);
    }
    .trust-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-sm); }
    .trust-card-icon {
      width: 40px; height: 40px; flex-shrink: 0; border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      background: var(--brand-light); color: var(--brand);
    }
    .trust-card-icon svg { width: 20px; height: 20px; }
    .trust-card-icon.ti-shield, .trust-card-icon.ti-dbs { background: rgba(10,123,74,0.12); color: var(--success); }
    .trust-card-icon.ti-member { background: #fef3c7; color: #b45309; }
    .trust-card-body { display: flex; flex-direction: column; gap: 0.15rem; min-width: 0; }
    .trust-card-body strong { font-size: 0.88rem; color: var(--text-primary); }
    .trust-card-body span { font-size: 0.8rem; color: var(--text-secondary); }
    .trust-check {
      position: absolute; top: 0.7rem; right: 0.7rem;
      width: 20px; height: 20px; border-radius: 50%;
      background: var(--success); color: #fff;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.65rem; font-weight: 700; flex-shrink: 0;
    }

    .badge-blue { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; border-radius: 999px; padding: 0.15rem 0.5rem; font-size: 0.75rem; }
    .badge-purple { background: #faf5ff; color: #7c3aed; border: 1px solid #ddd6fe; border-radius: 999px; padding: 0.15rem 0.5rem; font-size: 0.75rem; }

    /* Service details + Specialisms */
    .detail-grid-v2 { display: grid; grid-template-columns: 1fr; gap: 1.75rem; }
    @media (min-width: 700px) { .detail-grid-v2 { grid-template-columns: 1fr 1fr; } }
    .glance-card .panel-heading { margin-bottom: 1rem; padding-bottom: 0.6rem; }
    .glance-row {
      display: flex; align-items: center; gap: 0.65rem;
      padding: 0.65rem 0; border-bottom: 1px solid var(--border);
      font-size: 0.88rem;
    }
    .glance-row:last-child { border-bottom: none; }
    .glance-ico {
      width: 28px; height: 28px; flex-shrink: 0; border-radius: 8px;
      background: var(--brand-light); color: var(--brand);
      display: flex; align-items: center; justify-content: center;
    }
    .glance-ico svg { width: 15px; height: 15px; }
    .glance-label { color: var(--text-secondary); flex: 1; }
    .glance-val { color: var(--text-primary); font-weight: 600; }

    .brands-label { font-size: 0.85rem; font-weight: 600; color: #374151; margin: 1rem 0 0.5rem; }
    .specialism-brand { background: #eff6ff; color: #1d4ed8; border-color: #bfdbfe; }

    .inline-stars { color: #f59e0b; }

    .rating-breakdown-section { max-width: 480px; }
    .rating-breakdown { display: flex; flex-direction: column; gap: 0.75rem; }
    .rating-row { display: grid; grid-template-columns: 120px 1fr 2.5rem; align-items: center; gap: 0.75rem; }
    .rating-label { font-size: 0.85rem; color: #374151; }
    .rating-bar-wrap { height: 8px; background: #e5e7eb; border-radius: 999px; overflow: hidden; }
    .rating-bar-fill { height: 100%; background: linear-gradient(90deg, var(--gold), #fbbf24); border-radius: 999px; transition: width 0.4s ease; }
    .rating-val { font-size: 0.85rem; font-weight: 600; color: #111827; text-align: right; }

    /* Reviews */
    .review-count { font-size: 1rem; font-weight: 400; color: #6b7280; margin-left: 0.25rem; }
    .review-list { display: flex; flex-direction: column; gap: 1rem; }
    .review-card {
      display: flex; gap: 0.85rem; align-items: flex-start;
      background: var(--bg); border: 1px solid var(--border); border-radius: var(--radius-md);
      padding: 1rem 1.1rem; margin-bottom: 0;
    }
    .review-avatar {
      width: 38px; height: 38px; border-radius: 50%; flex-shrink: 0;
      background: var(--grad-accent); color: #fff;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.75rem; font-weight: 700;
    }
    .review-body { flex: 1; min-width: 0; }
    .review-header .review-date { margin-left: auto; }
    .review-meta-row { display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.4rem; }
    .review-job-type {
      display: inline-block;
      font-size: 0.75rem;
      background: #f3f4f6;
      color: #374151;
      border-radius: 999px;
      padding: 0.1rem 0.5rem;
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
export class EngineerDetailComponent implements OnInit, OnDestroy {
  id = input.required<string>();
  private engineerService = inject(EngineerService);
  private titleService = inject(Title);
  private metaService = inject(Meta);
  private document = inject(DOCUMENT);

  private static readonly DEFAULT_TITLE = "CoolHQ - The UK's Professional Air Conditioning Network";
  private static readonly DEFAULT_DESCRIPTION = "The UK's professional air conditioning network. Hire verified, F-Gas certified AC engineers with instant fixed-price quotes.";

  engineer = signal<EngineerDetail | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  logoLoadError = signal(false);
  shareCopied = signal(false);

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
      next: (data) => {
        this.loading.set(false);
        this.engineer.set(data);
        this.updateMetaTags(data);
      },
      error: (err) => { this.loading.set(false); this.error.set(err.message); }
    });
  }

  private updateMetaTags(eng: EngineerDetail) {
    const title = `${eng.companyName} — ${eng.averageRating.toFixed(1)}★ rated | Cool HQ`;
    const description = `${eng.companyName}, run by ${eng.fullName}. F-Gas certified air conditioning engineers serving ${eng.coveragePostcode}. ${eng.jobsCompleted} jobs completed, ${eng.averageRating.toFixed(1)}/5 average rating.`;
    const url = this.document.location.href;
    const [firstName, ...rest] = eng.fullName.split(' ');

    this.titleService.setTitle(title);
    this.metaService.updateTag({ name: 'description', content: description });

    this.metaService.updateTag({ property: 'og:type', content: 'profile' });
    this.metaService.updateTag({ property: 'og:site_name', content: 'Cool HQ' });
    this.metaService.updateTag({ property: 'og:title', content: title });
    this.metaService.updateTag({ property: 'og:description', content: description });
    this.metaService.updateTag({ property: 'og:url', content: url });
    this.metaService.updateTag({ property: 'profile:first_name', content: firstName });
    if (rest.length) this.metaService.updateTag({ property: 'profile:last_name', content: rest.join(' ') });

    this.metaService.updateTag({ name: 'twitter:title', content: title });
    this.metaService.updateTag({ name: 'twitter:description', content: description });

    if (eng.companyLogoUrl) {
      this.metaService.updateTag({ property: 'og:image', content: eng.companyLogoUrl });
      this.metaService.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
      this.metaService.updateTag({ name: 'twitter:image', content: eng.companyLogoUrl });
    } else {
      this.metaService.removeTag('property="og:image"');
      this.metaService.updateTag({ name: 'twitter:card', content: 'summary' });
      this.metaService.removeTag('name="twitter:image"');
    }

    this.updateCanonicalLink(url);
  }

  private updateCanonicalLink(url: string) {
    let link = this.document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.document.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }

  ngOnDestroy() {
    this.titleService.setTitle(EngineerDetailComponent.DEFAULT_TITLE);
    this.metaService.updateTag({ name: 'description', content: EngineerDetailComponent.DEFAULT_DESCRIPTION });
    this.metaService.updateTag({ property: 'og:type', content: 'website' });
    this.metaService.updateTag({ property: 'og:title', content: EngineerDetailComponent.DEFAULT_TITLE });
    this.metaService.updateTag({ property: 'og:description', content: EngineerDetailComponent.DEFAULT_DESCRIPTION });
    this.metaService.updateTag({ name: 'twitter:title', content: EngineerDetailComponent.DEFAULT_TITLE });
    this.metaService.updateTag({ name: 'twitter:description', content: EngineerDetailComponent.DEFAULT_DESCRIPTION });
    this.metaService.updateTag({ name: 'twitter:card', content: 'summary' });
    this.metaService.removeTag('property="og:url"');
    this.metaService.removeTag('property="og:image"');
    this.metaService.removeTag('name="twitter:image"');
    this.metaService.removeTag('property="profile:first_name"');
    this.metaService.removeTag('property="profile:last_name"');
    const link = this.document.querySelector('link[rel="canonical"]');
    link?.remove();
  }

  async shareProfile() {
    const eng = this.engineer();
    if (!eng) return;
    const url = window.location.href;
    const shareData = {
      title: eng.companyName,
      text: `${eng.companyName} — ${eng.averageRating.toFixed(1)}★ rated air conditioning engineers on Cool HQ.`,
      url
    };
    if (navigator.share) {
      try { await navigator.share(shareData); return; } catch { /* cancelled — fall through to copy */ }
    }
    try {
      await navigator.clipboard.writeText(url);
      this.shareCopied.set(true);
      setTimeout(() => this.shareCopied.set(false), 2000);
    } catch { /* clipboard unavailable, no-op */ }
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

  yearsTrading(): number {
    const d = this.engineer()?.memberSince || this.engineer()?.createdAt;
    if (!d) return 1;
    const years = new Date().getFullYear() - new Date(d).getFullYear();
    return Math.max(1, years);
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
