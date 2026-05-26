import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="hero">
      <div class="hero-inner">
        <div class="hero-badge">F-Gas certified engineers only</div>
        <h1>The UK's specialist<br><span class="hero-accent">AC platform.</span></h1>
        <p class="hero-sub">
          Verified engineers. Transparent quotes. Annual care plans.<br>
          Everything for your air conditioning — in one place.
        </p>
        <div class="hero-actions">
          <a routerLink="/quote" class="btn-primary">Get instant quote</a>
          <a routerLink="/health-check" class="btn-secondary">Free AC health check</a>
        </div>
        <div class="hero-stats">
          <div class="hero-stat">
            <strong>1,200+</strong>
            <span>Verified engineers</span>
          </div>
          <div class="hero-stat-divider"></div>
          <div class="hero-stat">
            <strong>4.8 / 5</strong>
            <span>Average rating</span>
          </div>
          <div class="hero-stat-divider"></div>
          <div class="hero-stat">
            <strong>18,400+</strong>
            <span>Jobs completed</span>
          </div>
          <div class="hero-stat-divider"></div>
          <div class="hero-stat">
            <strong>98%</strong>
            <span>Would recommend</span>
          </div>
        </div>
      </div>
    </section>

    <section class="trust-strip">
      <div class="trust-inner">
        <div class="trust-item">
          <span class="trust-icon">🏅</span>
          <div class="trust-text">
            <strong>F-Gas certified</strong>
            <span>Every engineer verified</span>
          </div>
        </div>
        <div class="trust-item">
          <span class="trust-icon">🛡️</span>
          <div class="trust-text">
            <strong>Insured & checked</strong>
            <span>Public liability confirmed</span>
          </div>
        </div>
        <div class="trust-item">
          <span class="trust-icon">⚡</span>
          <div class="trust-text">
            <strong>Instant pricing</strong>
            <span>No waiting for callbacks</span>
          </div>
        </div>
        <div class="trust-item">
          <span class="trust-icon">⭐</span>
          <div class="trust-text">
            <strong>Verified reviews</strong>
            <span>Only from real customers</span>
          </div>
        </div>
        <div class="trust-item">
          <span class="trust-icon">🔄</span>
          <div class="trust-text">
            <strong>Annual care plans</strong>
            <span>From £99/year</span>
          </div>
        </div>
      </div>
    </section>

    <section class="health-check-banner">
      <div class="hc-banner-inner">
        <div class="hc-banner-text">
          <span class="hc-banner-eyebrow">Free tool</span>
          <h2>Is your AC working as it should?</h2>
          <p>Answer 4 quick questions and get an instant health score for your system — plus an honest recommendation.</p>
          <a routerLink="/health-check" class="btn-primary hc-btn">Take the free health check</a>
        </div>
        <div class="hc-banner-scores">
          <div class="hc-score-demo score-good">
            <span class="score-icon">&#10003;</span>
            <span>Looking good</span>
          </div>
          <div class="hc-score-demo score-amber">
            <span class="score-icon">&#9888;</span>
            <span>Service due</span>
          </div>
          <div class="hc-score-demo score-urgent">
            <span class="score-icon">!</span>
            <span>Urgent</span>
          </div>
        </div>
      </div>
    </section>

    <section class="how-it-works">
      <h2>How it works</h2>
      <div class="steps">
        <div class="step">
          <div class="step-num">1</div>
          <h3>Describe your job</h3>
          <p>Tell us what you need — installation, replacement, service or emergency repair.</p>
        </div>
        <div class="step">
          <div class="step-num">2</div>
          <h3>Get an instant quote</h3>
          <p>We calculate a fair, itemised price based on your property and room size. No fluff.</p>
        </div>
        <div class="step">
          <div class="step-num">3</div>
          <h3>Choose your engineer</h3>
          <p>Browse verified specialists near you — see their cert number, rating, brands and reviews.</p>
        </div>
        <div class="step">
          <div class="step-num">4</div>
          <h3>Book and relax</h3>
          <p>Confirm your preferred date. We handle the rest.</p>
        </div>
      </div>
    </section>

    <section class="plans-preview">
      <div class="plans-preview-inner">
        <div class="plans-preview-text">
          <span class="plans-eyebrow">Annual care plans</span>
          <h2>Protect your AC investment.</h2>
          <p>
            An annual service keeps your system efficient, extends its life, and keeps your warranty valid.
            Our plans start at just £99/year — with a verified engineer assigned to your property.
          </p>
          <ul class="plans-preview-list">
            <li>&#10003; Essential from <strong>£99/yr</strong> — annual service + health report</li>
            <li>&#10003; Premium from <strong>£159/yr</strong> — adds 6-month check + priority booking</li>
            <li>&#10003; Elite from <strong>£249/yr</strong> — adds emergency cover + refrigerant top-up</li>
          </ul>
          <a routerLink="/service-plans" class="btn-primary">See all plans</a>
        </div>
        <div class="plans-preview-visual">
          <div class="plan-mini plan-mini-highlight">
            <div class="plan-mini-badge">Most popular</div>
            <div class="plan-mini-name">Premium</div>
            <div class="plan-mini-price">£159 <span>/yr</span></div>
            <ul>
              <li>Annual full service</li>
              <li>6-month check</li>
              <li>Priority booking</li>
              <li>10% parts discount</li>
            </ul>
            <a routerLink="/service-plans" class="btn-secondary btn-sm plan-mini-btn">Learn more</a>
          </div>
        </div>
      </div>
    </section>

    <section class="brands-section">
      <h2>Brand specialists in our network</h2>
      <p class="brands-sub">Our engineers are certified across all major AC brands</p>
      <div class="brands-grid">
        <div class="brand-chip">Daikin</div>
        <div class="brand-chip">Mitsubishi Electric</div>
        <div class="brand-chip">Samsung</div>
        <div class="brand-chip">LG</div>
        <div class="brand-chip">Hitachi</div>
        <div class="brand-chip">Fujitsu</div>
        <div class="brand-chip">Panasonic</div>
        <div class="brand-chip">Toshiba</div>
        <div class="brand-chip">Midea</div>
        <div class="brand-chip">Gree</div>
      </div>
    </section>

    <section class="cta-band">
      <h2>Are you an AC engineer?</h2>
      <p>Join our growing network of verified specialists. No subscription fee to get started. Get matched with customers in your area.</p>
      <div class="cta-band-actions">
        <a routerLink="/join" class="btn-primary">Join as a specialist</a>
        <a routerLink="/engineers" class="btn-secondary">Browse the network</a>
      </div>
    </section>
  `,
  styles: [`
    .hero-stats {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      margin-top: 2.5rem;
      flex-wrap: wrap;
      justify-content: center;
    }
    .hero-stat { text-align: center; }
    .hero-stat strong { display: block; font-size: 1.5rem; font-weight: 800; color: var(--brand); }
    .hero-stat span { font-size: 0.78rem; color: var(--text-muted); }
    .hero-stat-divider { width: 1px; height: 36px; background: var(--border); }

    .health-check-banner {
      background: #f0f9ff;
      border-top: 1px solid #bae6fd;
      border-bottom: 1px solid #bae6fd;
      padding: 3rem 1.5rem;
    }
    .hc-banner-inner {
      max-width: 900px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      gap: 3rem;
      flex-wrap: wrap;
    }
    .hc-banner-text { flex: 1; min-width: 260px; }
    .hc-banner-eyebrow {
      display: inline-block;
      background: #0284c7;
      color: white;
      font-size: 0.72rem;
      font-weight: 700;
      padding: 0.2rem 0.6rem;
      border-radius: 999px;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      margin-bottom: 0.75rem;
    }
    .hc-banner-text h2 { font-size: 1.5rem; margin-bottom: 0.6rem; color: #0c4a6e; }
    .hc-banner-text p { font-size: 0.95rem; color: #0369a1; line-height: 1.6; margin-bottom: 1.25rem; }
    .hc-btn { display: inline-block; }
    .hc-banner-scores { display: flex; gap: 0.75rem; flex-shrink: 0; }
    .hc-score-demo {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.4rem;
      padding: 1rem 1.25rem;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 600;
      width: 80px;
      text-align: center;
    }
    .hc-score-demo .score-icon { font-size: 1.5rem; font-weight: 700; }
    .score-good { background: #d1fae5; color: #065f46; border: 2px solid #6ee7b7; }
    .score-amber { background: #fef3c7; color: #92400e; border: 2px solid #fcd34d; }
    .score-urgent { background: #fee2e2; color: #991b1b; border: 2px solid #fca5a5; }

    .plans-preview {
      padding: 5rem 1.5rem;
      background: white;
    }
    .plans-preview-inner {
      max-width: 960px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      gap: 4rem;
      flex-wrap: wrap;
    }
    .plans-preview-text { flex: 1; min-width: 280px; }
    .plans-eyebrow {
      display: inline-block;
      background: #e0f2fe;
      color: #0369a1;
      font-size: 0.78rem;
      font-weight: 700;
      padding: 0.2rem 0.7rem;
      border-radius: 999px;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      margin-bottom: 0.75rem;
    }
    .plans-preview-text h2 { font-size: 1.75rem; margin-bottom: 0.6rem; }
    .plans-preview-text p { font-size: 0.95rem; color: #6b7280; line-height: 1.6; margin-bottom: 1.25rem; }
    .plans-preview-list { list-style: none; padding: 0; margin: 0 0 1.75rem; display: flex; flex-direction: column; gap: 0.5rem; }
    .plans-preview-list li { font-size: 0.9rem; color: #374151; }

    .plans-preview-visual { display: flex; justify-content: center; }
    .plan-mini {
      background: white;
      border: 2px solid #e5e7eb;
      border-radius: 16px;
      padding: 1.5rem;
      width: 220px;
      position: relative;
    }
    .plan-mini-highlight { border-color: #1e3a5f; box-shadow: 0 4px 20px rgba(30,58,95,0.15); }
    .plan-mini-badge {
      position: absolute;
      top: -12px;
      left: 50%;
      transform: translateX(-50%);
      background: #1e3a5f;
      color: white;
      font-size: 0.7rem;
      font-weight: 700;
      padding: 0.2rem 0.75rem;
      border-radius: 999px;
      white-space: nowrap;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .plan-mini-name { font-size: 1rem; font-weight: 700; margin-bottom: 0.3rem; color: #111827; }
    .plan-mini-price { font-size: 1.75rem; font-weight: 800; color: #111827; margin-bottom: 1rem; }
    .plan-mini-price span { font-size: 0.9rem; font-weight: 400; color: #6b7280; }
    .plan-mini ul { list-style: none; padding: 0; margin: 0 0 1.25rem; font-size: 0.85rem; color: #374151; display: flex; flex-direction: column; gap: 0.4rem; }
    .plan-mini ul li::before { content: '✓ '; color: #059669; font-weight: 700; }
    .plan-mini-btn { display: block; text-align: center; width: 100%; box-sizing: border-box; }

    .brands-section {
      background: #f9fafb;
      padding: 4rem 1.5rem;
      text-align: center;
    }
    .brands-section h2 { font-size: 1.5rem; margin-bottom: 0.5rem; }
    .brands-sub { color: #6b7280; font-size: 0.9rem; margin-bottom: 2rem; }
    .brands-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      justify-content: center;
      max-width: 700px;
      margin: 0 auto;
    }
    .brand-chip {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 999px;
      padding: 0.4rem 1rem;
      font-size: 0.88rem;
      font-weight: 500;
      color: #374151;
    }

    .cta-band-actions { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }

    @media (max-width: 600px) {
      .hc-banner-scores { display: none; }
      .hero-stat-divider { display: none; }
      .plans-preview-visual { display: none; }
    }
  `]
})
export class HomeComponent {}
