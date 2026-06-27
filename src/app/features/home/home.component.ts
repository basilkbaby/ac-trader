import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EngineerService } from '../../core/services/engineer.service';
import { Engineer } from '../../core/models/models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <!-- ─── Hero ─────────────────────────────────────────────────────────── -->
    <section class="hero">
      <div class="hero-grid">
        <div class="hero-copy">
          <h1>The UK's Professional<br><span class="hero-accent">Air Conditioning Network</span></h1>
          <p class="hero-sub">
            The network connecting homeowners and businesses with verified,
            F-Gas certified air conditioning engineers — and giving those engineers
            the tools to run and grow their business.
          </p>
          <div class="hero-actions">
            <a routerLink="/quote" class="btn-primary">I'm a customer</a>
            <a routerLink="/join" class="btn-secondary hero-eng-btn">I'm an engineer</a>
          </div>
          <ul class="hero-trust">
            <li><span class="ht-tick">&#10003;</span> F-Gas certified engineers only</li>
            <li><span class="ht-tick">&#10003;</span> Identity &amp; insurance verified</li>
            <li><span class="ht-tick">&#10003;</span> Fixed, upfront pricing</li>
            <li><span class="ht-tick">&#10003;</span> Free, no-obligation quotes</li>
          </ul>
        </div>

        <!-- Floating estimate card -->
        <div class="hero-card-wrap">
          <div class="estimate-card">
            <div class="ec-head">
              <span class="ec-eyebrow">Instant estimate</span>
              <span class="verified-badge"><span class="vb-tick">&#10003;</span> Fixed pricing</span>
            </div>
            <div class="ec-row"><span>Job type</span><strong>Installation</strong></div>
            <div class="ec-row"><span>Property</span><strong>2-bed flat</strong></div>
            <div class="ec-row"><span>Rooms</span><strong>1 &middot; wall-mounted</strong></div>
            <div class="ec-estimate">
              <span>Estimated cost</span>
              <strong>£1,600 – £2,100</strong>
            </div>
            <a routerLink="/quote" class="btn-primary ec-cta">Get my instant quote</a>
            <p class="ec-note">No callbacks. No haggling. Itemised, transparent pricing.</p>
          </div>
          <div class="hero-float hero-float-1">
            <span class="hf-icon">&#9733;</span>
            <div><strong>4.9</strong><span>James M. &middot; Chelsea</span></div>
          </div>
          <div class="hero-float hero-float-2">
            <span class="hf-icon hf-blue">&#10003;</span>
            <div><strong>Booking confirmed</strong><span>Tomorrow, 10:00am</span></div>
          </div>
        </div>
      </div>
    </section>

    <!-- ─── Trust strip ──────────────────────────────────────────────────── -->
    <section class="trust-strip">
      <div class="trust-inner">
        <div class="trust-item">
          <span class="trust-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 4 5v6c0 4.5 3.2 7.9 8 9 4.8-1.1 8-4.5 8-9V5z"/><path d="M9 12l2 2 4-4"/></svg>
          </span>
          <div class="trust-text"><strong>Identity verified</strong><span>Every engineer checked</span></div>
        </div>
        <div class="trust-item">
          <span class="trust-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M8 21h8M12 17v4M6 3h12v6a6 6 0 0 1-12 0z"/><path d="M6 5H3.5a1 1 0 0 0-1 1.2A4 4 0 0 0 6 9M18 5h2.5a1 1 0 0 1 1 1.2A4 4 0 0 1 18 9"/></svg>
          </span>
          <div class="trust-text"><strong>F-Gas certified</strong><span>Legally qualified</span></div>
        </div>
        <div class="trust-item">
          <span class="trust-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l7 3v6c0 4-3 7-7 9-4-2-7-5-7-9V6z"/></svg>
          </span>
          <div class="trust-text"><strong>Insurance checked</strong><span>Public liability confirmed</span></div>
        </div>
        <div class="trust-item">
          <span class="trust-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M16 11a4 4 0 1 0-8 0"/><circle cx="12" cy="7" r="4"/><path d="M4.5 21a7.5 7.5 0 0 1 11.5-6.3"/><path d="M16 18l2 2 4-4"/></svg>
          </span>
          <div class="trust-text"><strong>DBS checked</strong><span>Safe in your home</span></div>
        </div>
        <div class="trust-item">
          <span class="trust-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l2.7 5.5 6 .9-4.3 4.2 1 6L12 18.8 6.6 19.6l1-6L3.3 9.4l6-.9z"/></svg>
          </span>
          <div class="trust-text"><strong>Verified reviews</strong><span>Only from real jobs</span></div>
        </div>
      </div>
    </section>

    <!-- ─── How it works ─────────────────────────────────────────────────── -->
    <section class="how-section">
      <div class="section-head">
        <span class="eyebrow">For customers</span>
        <h2>The safest way to hire an AC engineer</h2>
        <p>Four simple steps — from instant pricing to a confirmed booking, with a verified professional you can trust.</p>
      </div>
      <div class="how-steps">
        <div class="how-step">
          <div class="how-num">1</div>
          <h3>Find</h3>
          <p>Get an instant, itemised price and see verified engineers covering your postcode.</p>
        </div>
        <div class="how-step">
          <div class="how-num">2</div>
          <h3>Compare</h3>
          <p>Side-by-side: ratings, reviews, brands, response time and fixed quotes.</p>
        </div>
        <div class="how-step">
          <div class="how-num">3</div>
          <h3>Book</h3>
          <p>Choose your date and confirm online. No phone tag, no waiting for callbacks.</p>
        </div>
        <div class="how-step">
          <div class="how-num">4</div>
          <h3>Relax</h3>
          <p>Your job, warranty, certificates and service history — all kept in one place.</p>
        </div>
      </div>
    </section>

    <!-- ─── Featured engineers ───────────────────────────────────────────── -->
    <section class="featured-section">
      <div class="section-head">
        <span class="eyebrow">Top rated near you</span>
        <h2>Featured engineers</h2>
        <p>A snapshot of the verified specialists in our network — every one F-Gas certified and insurance checked.</p>
      </div>

      @if (featured().length) {
        <div class="featured-grid">
          @for (eng of featured(); track eng.id) {
            <a [routerLink]="['/engineers', eng.id]" class="feng-card lift">
              <div class="feng-top">
                <div class="feng-avatar">{{ initials(eng.fullName) }}</div>
                <div class="feng-id">
                  <h3>{{ eng.fullName }}</h3>
                  <span class="feng-company">{{ eng.companyName }}</span>
                </div>
                @if (eng.isVerified) {
                  <span class="feng-tick" title="Verified">&#10003;</span>
                }
              </div>
              <div class="feng-rating">
                <span class="feng-stars">&#9733;&#9733;&#9733;&#9733;&#9733;</span>
                <strong>{{ eng.averageRating }}</strong>
                <span class="feng-jobs">&middot; {{ eng.jobsCompleted }} jobs</span>
              </div>
              <div class="feng-brands">
                @for (b of brandList(eng); track b) {
                  <span class="feng-brand">{{ b }}</span>
                }
              </div>
              <div class="feng-foot">
                <span class="feng-area">&#128205; {{ firstPostcode(eng) }}</span>
                <span class="feng-status" [class.available]="eng.isAvailable">
                  {{ eng.isAvailable ? 'Available now' : 'Booking ahead' }}
                </span>
              </div>
            </a>
          }
        </div>
        <div class="featured-cta">
          <a routerLink="/engineers" class="btn-secondary">Browse all engineers</a>
        </div>
      } @else {
        <div class="featured-skeleton">
          <div class="skel-card"></div><div class="skel-card"></div><div class="skel-card"></div>
        </div>
      }
    </section>

    <!-- ─── Customer value props ─────────────────────────────────────────── -->
    <section class="value-section">
      <div class="value-inner">
        <div class="value-copy">
          <span class="eyebrow">Why customers trust us</span>
          <h2>Not just "someone." The safest place to hire.</h2>
          <p>Every engineer on the platform is identity-verified and qualified before they can take a single job. You get transparency at every step.</p>
          <a routerLink="/quote" class="btn-primary">Get an instant quote</a>
        </div>
        <div class="value-grid">
          <div class="value-pill"><span>&#10003;</span> Verified engineers</div>
          <div class="value-pill"><span>&#10003;</span> Insurance checked</div>
          <div class="value-pill"><span>&#10003;</span> F-Gas certified</div>
          <div class="value-pill"><span>&#10003;</span> Genuine reviews</div>
          <div class="value-pill"><span>&#10003;</span> Fixed pricing</div>
          <div class="value-pill"><span>&#10003;</span> Instant quotes</div>
          <div class="value-pill"><span>&#10003;</span> Emergency callouts</div>
          <div class="value-pill"><span>&#10003;</span> Warranty protection</div>
        </div>
      </div>
    </section>

    <!-- ─── Engineer growth (sell software, not leads) ───────────────────── -->
    <section class="grow-section">
      <div class="grow-inner">
        <div class="grow-copy">
          <span class="eyebrow eyebrow-accent">For engineers</span>
          <h2>Grow your air conditioning business.</h2>
          <p>
            We don't just send you leads. We give you the complete toolkit to win work,
            look professional and run your business — all in one place.
          </p>
          <ul class="grow-list">
            <li><span>&#10003;</span> Online profile &amp; SEO page</li>
            <li><span>&#10003;</span> Instant enquiries &amp; leads</li>
            <li><span>&#10003;</span> Calendar &amp; bookings</li>
            <li><span>&#10003;</span> Quotes &amp; invoicing</li>
            <li><span>&#10003;</span> Customer management (CRM)</li>
            <li><span>&#10003;</span> AI quote writer</li>
          </ul>
          <div class="grow-actions">
            <a routerLink="/join" class="btn-primary">Join the network</a>
            <a routerLink="/login" class="grow-link">Already a member? Sign in &rarr;</a>
          </div>
        </div>

        <div class="grow-visual">
          <div class="dash-card">
            <div class="dash-head">
              <span>Business hub</span>
              <span class="dash-live">&#9679; Live</span>
            </div>
            <div class="dash-metrics">
              <div class="dash-metric">
                <span class="dm-label">This month</span>
                <strong class="dm-value">£4,210</strong>
                <span class="dm-trend up">&#9650; 12%</span>
              </div>
              <div class="dash-metric">
                <span class="dm-label">New enquiries</span>
                <strong class="dm-value">8</strong>
                <span class="dm-trend">today</span>
              </div>
            </div>
            <div class="dash-bars">
              <span style="height:38%"></span><span style="height:55%"></span>
              <span style="height:44%"></span><span style="height:70%"></span>
              <span style="height:88%"></span><span style="height:78%"></span>
            </div>
            <div class="dash-foot">
              <div class="dash-row"><span class="dr-dot"></span> Installation &middot; Chelsea<span class="dr-amt">£2,580</span></div>
              <div class="dash-row"><span class="dr-dot green"></span> Service &middot; Mayfair<span class="dr-amt">£153</span></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ─── Reviews ──────────────────────────────────────────────────────── -->
    <section class="reviews-section">
      <div class="section-head">
        <span class="eyebrow">Loved by homeowners</span>
        <h2>What customers say</h2>
      </div>
      <div class="reviews-grid">
        <div class="rev-card">
          <div class="rev-stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
          <p>"Cold in 30 minutes and the install was spotless. Booked online in two minutes — no callbacks, no haggling. Exactly how it should be."</p>
          <div class="rev-author"><span class="rev-av">FH</span><div><strong>Fiona H.</strong><span>Chelsea &middot; Installation</span></div></div>
        </div>
        <div class="rev-card">
          <div class="rev-stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
          <p>"Emergency callout on a Saturday in the heatwave. Verified engineer with me within two hours. Knowing they were FGAS certified gave real peace of mind."</p>
          <div class="rev-author"><span class="rev-av">OM</span><div><strong>Olga M.</strong><span>Kensington &middot; Emergency</span></div></div>
        </div>
        <div class="rev-card">
          <div class="rev-stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
          <p>"Compared three engineers side by side with real reviews and fixed prices. So much easier than ringing round. The warranty record is a lovely touch."</p>
          <div class="rev-author"><span class="rev-av">DL</span><div><strong>David L.</strong><span>Mayfair &middot; Commercial</span></div></div>
        </div>
      </div>
    </section>

    <!-- ─── Final CTA ────────────────────────────────────────────────────── -->
    <section class="cta-final">
      <div class="cta-final-inner">
        <h2>One platform. Two ways to win.</h2>
        <p>Whether you're cooling your home or growing your business, it starts here.</p>
        <div class="cta-final-actions">
          <a routerLink="/quote" class="btn-primary">Get an instant quote</a>
          <a routerLink="/join" class="btn-secondary cta-eng">Join as an engineer</a>
        </div>
      </div>
    </section>
  `,
  styles: [`
    :host { display: block; }

    /* ── Hero ── */
    .hero {
      background: var(--grad-hero);
      color: #fff;
      padding: 3.5rem 1.25rem 4rem;
      position: relative;
      overflow: hidden;
      border-bottom: none;
    }
    .hero::after {
      content: ''; position: absolute; inset: 0;
      background:
        radial-gradient(40% 60% at 12% 110%, rgba(25,192,214,0.18), transparent 70%);
      pointer-events: none;
    }
    .hero-grid {
      position: relative; z-index: 1;
      max-width: 1120px; margin: 0 auto;
      display: grid; grid-template-columns: 1fr; gap: 2.5rem;
      align-items: center; text-align: center;
    }
    .hero h1 { color: #fff; font-size: clamp(2.1rem, 6vw, 3.6rem); margin-bottom: 1.1rem; letter-spacing: -0.03em; }
    .hero-accent {
      background: var(--grad-accent);
      -webkit-background-clip: text; background-clip: text; color: transparent;
    }
    .hero-sub { font-size: 1.05rem; color: rgba(255,255,255,0.78); max-width: 540px; margin: 0 auto 1.75rem; }
    .hero-actions { display: flex; flex-direction: column; gap: 0.75rem; max-width: 320px; margin: 0 auto 2.25rem; }
    .hero-eng-btn { background: rgba(255,255,255,0.08); color: #fff; border-color: rgba(255,255,255,0.25); backdrop-filter: blur(4px); }
    .hero-eng-btn:hover { background: rgba(255,255,255,0.16); border-color: rgba(255,255,255,0.5); }
    .hero-trust { list-style: none; padding: 0; margin: 0; display: grid; grid-template-columns: 1fr 1fr; gap: 0.55rem 1.25rem; max-width: 420px; margin: 0 auto; }
    .hero-trust li { display: flex; align-items: center; gap: 0.55rem; font-size: 0.88rem; font-weight: 500; color: rgba(255,255,255,0.88); text-align: left; }
    .ht-tick { width: 20px; height: 20px; flex-shrink: 0; border-radius: 50%; background: rgba(25,192,214,0.18); color: var(--accent); display: inline-flex; align-items: center; justify-content: center; font-size: 0.62rem; font-weight: 700; }

    /* Estimate card */
    .hero-card-wrap { position: relative; display: flex; justify-content: center; }
    .estimate-card {
      background: #fff; color: var(--text-primary);
      border-radius: var(--radius-xl); padding: 1.5rem;
      width: 100%; max-width: 360px; box-shadow: var(--shadow-xl);
      text-align: left; position: relative; z-index: 2;
    }
    .ec-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; }
    .ec-eyebrow { font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--brand); }
    .ec-row { display: flex; justify-content: space-between; padding: 0.6rem 0; border-bottom: 1px solid var(--border); font-size: 0.9rem; }
    .ec-row span { color: var(--text-secondary); }
    .ec-row strong { color: var(--text-primary); font-weight: 600; }
    .ec-estimate {
      display: flex; flex-direction: column; gap: 0.15rem;
      background: var(--brand-light); border-radius: var(--radius-md);
      padding: 0.85rem 1rem; margin: 1rem 0;
    }
    .ec-estimate span { font-size: 0.78rem; color: var(--brand-dark); font-weight: 600; }
    .ec-estimate strong { font-size: 1.5rem; font-weight: 800; color: var(--ink-2); }
    .ec-cta { width: 100%; text-align: center; }
    .ec-note { font-size: 0.74rem; color: var(--text-muted); text-align: center; margin-top: 0.75rem; }

    .hero-float {
      position: absolute; background: #fff; color: var(--text-primary);
      border-radius: var(--radius-md); box-shadow: var(--shadow-lg);
      padding: 0.6rem 0.85rem; display: flex; align-items: center; gap: 0.55rem;
      z-index: 3; font-size: 0.78rem;
    }
    .hero-float strong { display: block; font-size: 0.85rem; }
    .hero-float span { color: var(--text-muted); font-size: 0.72rem; }
    .hf-icon { width: 30px; height: 30px; border-radius: 8px; background: #FFF4DB; color: var(--gold); display: flex; align-items: center; justify-content: center; font-size: 0.9rem; flex-shrink: 0; }
    .hf-blue { background: var(--brand-light); color: var(--brand); }
    .hero-float-1 { top: -14px; left: -8px; }
    .hero-float-2 { bottom: -18px; right: -6px; }

    /* ── Trust strip ── */
    .trust-strip { background: var(--surface); border-bottom: 1px solid var(--border); padding: 0; }
    .trust-inner { display: grid; grid-template-columns: 1fr 1fr; max-width: 1120px; margin: 0 auto; }
    .trust-item { display: flex; align-items: center; gap: 0.65rem; padding: 1rem 1.1rem; border-right: 1px solid var(--border); border-bottom: 1px solid var(--border); }
    .trust-icon { width: 38px; height: 38px; flex-shrink: 0; background: var(--brand-light); color: var(--brand); border-radius: 10px; display: flex; align-items: center; justify-content: center; }
    .trust-icon svg { width: 20px; height: 20px; }
    .trust-text strong { display: block; font-size: 0.84rem; color: var(--text-primary); font-weight: 700; }
    .trust-text span { font-size: 0.72rem; color: var(--text-muted); }

    /* ── How it works ── */
    .how-section { background: var(--bg); padding: 4rem 1.25rem; }
    .how-steps { display: grid; grid-template-columns: 1fr; gap: 1rem; max-width: 1120px; margin: 0 auto; }
    .how-step { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 1.5rem; box-shadow: var(--shadow-sm); }
    .how-num { width: 42px; height: 42px; border-radius: 12px; background: var(--grad-brand); color: #fff; font-weight: 800; font-size: 1.1rem; display: flex; align-items: center; justify-content: center; margin-bottom: 0.9rem; box-shadow: 0 6px 14px -4px rgba(11,92,255,0.5); }
    .how-step h3 { font-size: 1.05rem; margin-bottom: 0.4rem; }
    .how-step p { font-size: 0.9rem; color: var(--text-secondary); }

    /* ── Featured engineers ── */
    .featured-section { background: var(--surface); padding: 4rem 1.25rem; }
    .featured-grid { display: grid; grid-template-columns: 1fr; gap: 1.25rem; max-width: 1120px; margin: 0 auto; }
    .feng-card { display: block; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 1.25rem; box-shadow: var(--shadow-sm); color: inherit; }
    .feng-card:hover { text-decoration: none; }
    .feng-top { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.9rem; }
    .feng-avatar { width: 48px; height: 48px; border-radius: 14px; background: var(--grad-hero); color: #fff; font-weight: 700; font-size: 1rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .feng-id { flex: 1; min-width: 0; }
    .feng-id h3 { font-size: 1rem; margin-bottom: 0.1rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .feng-company { font-size: 0.8rem; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block; }
    .feng-tick { width: 24px; height: 24px; border-radius: 50%; background: var(--brand); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; flex-shrink: 0; }
    .feng-rating { display: flex; align-items: center; gap: 0.35rem; margin-bottom: 0.85rem; font-size: 0.88rem; }
    .feng-stars { color: var(--gold); letter-spacing: 1px; }
    .feng-rating strong { font-weight: 700; }
    .feng-jobs { color: var(--text-muted); }
    .feng-brands { display: flex; flex-wrap: wrap; gap: 0.35rem; margin-bottom: 1rem; }
    .feng-brand { font-size: 0.72rem; background: var(--bg); border: 1px solid var(--border); color: var(--text-secondary); border-radius: 999px; padding: 0.2rem 0.6rem; }
    .feng-foot { display: flex; align-items: center; justify-content: space-between; padding-top: 0.85rem; border-top: 1px solid var(--border); }
    .feng-area { font-size: 0.8rem; color: var(--text-muted); }
    .feng-status { font-size: 0.72rem; font-weight: 700; padding: 0.22rem 0.6rem; border-radius: 999px; background: var(--bg); color: var(--text-muted); }
    .feng-status.available { background: var(--success-bg); color: var(--success); }
    .featured-cta { text-align: center; margin-top: 2rem; }
    .featured-skeleton { display: grid; grid-template-columns: 1fr; gap: 1.25rem; max-width: 1120px; margin: 0 auto; }
    .skel-card { height: 200px; border-radius: var(--radius-lg); background: linear-gradient(90deg, #eef1f6 25%, #f6f8fb 50%, #eef1f6 75%); background-size: 200% 100%; animation: shimmer 1.4s infinite; }
    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

    /* ── Value props ── */
    .value-section { background: var(--bg); padding: 4rem 1.25rem; }
    .value-inner { max-width: 1120px; margin: 0 auto; display: grid; grid-template-columns: 1fr; gap: 2.5rem; align-items: center; }
    .value-copy h2 { font-size: clamp(1.5rem, 4vw, 2.1rem); margin-bottom: 0.75rem; }
    .value-copy p { font-size: 1rem; color: var(--text-secondary); margin-bottom: 1.5rem; }
    .value-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
    .value-pill { display: flex; align-items: center; gap: 0.6rem; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 0.85rem 1rem; font-size: 0.9rem; font-weight: 600; color: var(--text-primary); box-shadow: var(--shadow-sm); }
    .value-pill span { width: 22px; height: 22px; flex-shrink: 0; border-radius: 50%; background: var(--success-bg); color: var(--success); display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 700; }

    /* ── Grow (engineers) ── */
    .grow-section { background: var(--ink); color: #fff; padding: 4.5rem 1.25rem; }
    .grow-inner { max-width: 1120px; margin: 0 auto; display: grid; grid-template-columns: 1fr; gap: 2.5rem; align-items: center; }
    .grow-copy h2 { color: #fff; font-size: clamp(1.6rem, 4.5vw, 2.4rem); margin-bottom: 0.85rem; }
    .grow-copy > p { color: rgba(255,255,255,0.72); font-size: 1.02rem; margin-bottom: 1.5rem; max-width: 520px; }
    .grow-list { list-style: none; padding: 0; margin: 0 0 1.75rem; display: grid; grid-template-columns: 1fr 1fr; gap: 0.7rem; }
    .grow-list li { display: flex; align-items: center; gap: 0.55rem; font-size: 0.92rem; color: rgba(255,255,255,0.9); }
    .grow-list li span { width: 22px; height: 22px; flex-shrink: 0; border-radius: 50%; background: rgba(25,192,214,0.18); color: var(--accent); display: flex; align-items: center; justify-content: center; font-size: 0.68rem; font-weight: 700; }
    .grow-actions { display: flex; flex-direction: column; gap: 0.85rem; align-items: flex-start; }
    .grow-link { color: var(--accent); font-weight: 600; font-size: 0.92rem; }
    .grow-link:hover { color: #fff; text-decoration: none; }

    /* Engineer dashboard visual */
    .grow-visual { display: flex; justify-content: center; }
    .dash-card { background: #fff; color: var(--text-primary); border-radius: var(--radius-xl); padding: 1.5rem; width: 100%; max-width: 380px; box-shadow: var(--shadow-xl); }
    .dash-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.1rem; font-weight: 700; font-size: 0.95rem; }
    .dash-live { font-size: 0.72rem; font-weight: 700; color: var(--success); display: inline-flex; align-items: center; gap: 0.3rem; }
    .dash-metrics { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 1.25rem; }
    .dash-metric { background: var(--bg); border-radius: var(--radius-md); padding: 0.85rem; }
    .dm-label { font-size: 0.72rem; color: var(--text-muted); display: block; }
    .dm-value { font-size: 1.4rem; font-weight: 800; color: var(--ink-2); display: block; margin: 0.15rem 0; }
    .dm-trend { font-size: 0.72rem; color: var(--text-muted); font-weight: 600; }
    .dm-trend.up { color: var(--success); }
    .dash-bars { display: flex; align-items: flex-end; gap: 0.5rem; height: 70px; margin-bottom: 1.25rem; }
    .dash-bars span { flex: 1; background: var(--grad-brand); border-radius: 6px 6px 0 0; opacity: 0.85; }
    .dash-bars span:last-child { background: var(--grad-accent); }
    .dash-foot { display: flex; flex-direction: column; gap: 0.6rem; }
    .dash-row { display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; color: var(--text-secondary); }
    .dr-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--brand); flex-shrink: 0; }
    .dr-dot.green { background: var(--success); }
    .dr-amt { margin-left: auto; font-weight: 700; color: var(--text-primary); }

    /* ── Reviews ── */
    .reviews-section { background: var(--surface); padding: 4rem 1.25rem; }
    .reviews-grid { display: grid; grid-template-columns: 1fr; gap: 1.25rem; max-width: 1120px; margin: 0 auto; }
    .rev-card { background: var(--bg); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 1.5rem; }
    .rev-stars { color: var(--gold); letter-spacing: 2px; margin-bottom: 0.85rem; }
    .rev-card p { font-size: 0.95rem; color: var(--text-primary); line-height: 1.6; margin-bottom: 1.25rem; }
    .rev-author { display: flex; align-items: center; gap: 0.65rem; }
    .rev-av { width: 38px; height: 38px; border-radius: 50%; background: var(--grad-hero); color: #fff; font-weight: 700; font-size: 0.8rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .rev-author strong { display: block; font-size: 0.88rem; }
    .rev-author span { font-size: 0.78rem; color: var(--text-muted); }

    /* ── Final CTA ── */
    .cta-final { background: var(--grad-hero); padding: 4.5rem 1.25rem; text-align: center; }
    .cta-final-inner { max-width: 640px; margin: 0 auto; }
    .cta-final h2 { color: #fff; font-size: clamp(1.6rem, 4.5vw, 2.3rem); margin-bottom: 0.75rem; }
    .cta-final p { color: rgba(255,255,255,0.78); font-size: 1.05rem; margin-bottom: 1.75rem; }
    .cta-final-actions { display: flex; flex-direction: column; gap: 0.75rem; max-width: 320px; margin: 0 auto; }
    .cta-eng { background: rgba(255,255,255,0.08); color: #fff; border-color: rgba(255,255,255,0.25); }
    .cta-eng:hover { background: rgba(255,255,255,0.16); border-color: rgba(255,255,255,0.5); }

    /* ── Tablet / desktop ── */
    @media (min-width: 720px) {
      .hero { padding: 4.5rem 1.5rem 5rem; }
      .hero-grid { grid-template-columns: 1.05fr 0.95fr; gap: 3rem; text-align: left; }
      .hero-sub { margin-left: 0; margin-right: 0; }
      .hero-sub { margin-bottom: 2rem; }
      .hero-actions { flex-direction: row; max-width: none; margin: 0 0 2.5rem; }
      .hero-trust { margin: 0; }
      .trust-inner { grid-template-columns: repeat(5, 1fr); }
      .trust-item { border-bottom: none; }
      .trust-item:last-child { border-right: none; }
      .how-steps { grid-template-columns: repeat(4, 1fr); }
      .featured-grid { grid-template-columns: repeat(3, 1fr); }
      .featured-skeleton { grid-template-columns: repeat(3, 1fr); }
      .value-inner { grid-template-columns: 1fr 1fr; gap: 3.5rem; }
      .grow-inner { grid-template-columns: 1.05fr 0.95fr; gap: 3.5rem; }
      .grow-actions { flex-direction: row; align-items: center; }
      .reviews-grid { grid-template-columns: repeat(3, 1fr); }
      .cta-final-actions { flex-direction: row; max-width: none; justify-content: center; }
    }

    @media (max-width: 480px) {
      .hero-float { display: none; }
    }
  `]
})
export class HomeComponent {
  private engineerService = inject(EngineerService);
  featured = signal<Engineer[]>([]);

  constructor() {
    this.engineerService.getAll().subscribe(list => {
      const top = [...list]
        .filter(e => e.isVerified)
        .sort((a, b) => b.averageRating - a.averageRating || b.jobsCompleted - a.jobsCompleted)
        .slice(0, 3);
      this.featured.set(top);
    });
  }

  initials(name: string): string {
    return name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();
  }

  brandList(eng: Engineer): string[] {
    return eng.brandsSupported.split(',').map(b => b.trim()).filter(Boolean).slice(0, 3);
  }

  firstPostcode(eng: Engineer): string {
    return eng.coveragePostcode.split(',')[0].trim();
  }
}
