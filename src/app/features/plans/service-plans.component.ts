import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ServicePlanTier } from '../../core/models/models';

@Component({
  selector: 'app-service-plans',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-container">

      <div class="plans-hero">
        <div class="plans-hero-inner">
          <span class="plans-eyebrow">Annual AC Care Plans</span>
          <h1>Keep your AC running perfectly,<br>year after year.</h1>
          <p class="plans-sub">
            A single annual service can cut energy bills by up to 15% and prevent costly breakdowns.
            Choose a plan and let a verified engineer take care of everything.
          </p>
        </div>
      </div>

      <div class="plans-toggle-wrap">
        <button class="toggle-btn" [class.active]="billingAnnual()" (click)="billingAnnual.set(true)">Pay annually</button>
        <button class="toggle-btn" [class.active]="!billingAnnual()" (click)="billingAnnual.set(false)">Pay monthly</button>
        @if (billingAnnual()) {
          <span class="toggle-saving">Save up to 15%</span>
        }
      </div>

      <div class="plans-grid">
        @for (plan of plans; track plan.id) {
          <div class="plan-card" [class.plan-highlight]="plan.highlight">
            @if (plan.badge) {
              <div class="plan-badge">{{ plan.badge }}</div>
            }
            <div class="plan-name">{{ plan.name }}</div>
            <div class="plan-price">
              <span class="plan-amount">£{{ billingAnnual() ? plan.price : plan.priceMonthly }}</span>
              <span class="plan-period">/ {{ billingAnnual() ? 'year' : 'month' }}</span>
            </div>
            @if (billingAnnual()) {
              <div class="plan-equiv">£{{ (plan.price / 12).toFixed(2) }}/mo billed annually</div>
            }
            <p class="plan-desc">{{ plan.description }}</p>
            <ul class="plan-features">
              @for (f of plan.features; track f) {
                <li class="feature-yes">
                  <span class="feat-icon">&#10003;</span> {{ f }}
                </li>
              }
              @for (f of plan.notIncluded; track f) {
                <li class="feature-no">
                  <span class="feat-icon">&#8211;</span> {{ f }}
                </li>
              }
            </ul>
            <a routerLink="/quote" [queryParams]="{ plan: plan.id }"
              class="btn-primary plan-cta" [class.btn-secondary]="!plan.highlight">
              Get started
            </a>
          </div>
        }
      </div>

      <div class="plans-what-includes">
        <h2>What's included in every plan</h2>
        <div class="includes-grid">
          <div class="include-item">
            <div class="include-icon">&#128268;</div>
            <h3>Full system inspection</h3>
            <p>Filters, coils, drain lines, refrigerant level, electrical connections - everything checked.</p>
          </div>
          <div class="include-item">
            <div class="include-icon">&#128203;</div>
            <h3>Written health report</h3>
            <p>You'll receive a digital report after every visit with pass/fail results on each check point.</p>
          </div>
          <div class="include-item">
            <div class="include-icon">&#128736;</div>
            <h3>F-Gas certified engineer</h3>
            <p>Every engineer is registered, certified, and carries public liability insurance.</p>
          </div>
          <div class="include-item">
            <div class="include-icon">&#128197;</div>
            <h3>Annual service reminder</h3>
            <p>We'll remind you when your next service is due - no admin on your side.</p>
          </div>
        </div>
      </div>

      <div class="plans-faq">
        <h2>Common questions</h2>
        <div class="faq-list">
          @for (faq of faqs; track faq.q) {
            <div class="faq-item" [class.faq-open]="openFaq() === faq.q" (click)="toggleFaq(faq.q)">
              <div class="faq-q">
                {{ faq.q }}
                <span class="faq-chevron">{{ openFaq() === faq.q ? '▲' : '▼' }}</span>
              </div>
              @if (openFaq() === faq.q) {
                <div class="faq-a">{{ faq.a }}</div>
              }
            </div>
          }
        </div>
      </div>

      <div class="plans-cta-band">
        <h2>Not sure which plan is right for you?</h2>
        <p>Take the free AC Health Check - 4 questions and we'll tell you exactly what your system needs.</p>
        <div class="plans-cta-actions">
          <a routerLink="/health-check" class="btn-primary">Take free health check</a>
          <a routerLink="/engineers" class="btn-secondary">Browse engineers</a>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .plans-hero {
      background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%);
      color: white;
      padding: 4rem 1.5rem 3rem;
      text-align: center;
      margin-bottom: 0;
    }
    .plans-hero-inner { max-width: 640px; margin: 0 auto; }
    .plans-eyebrow {
      display: inline-block;
      background: rgba(255,255,255,0.15);
      border: 1px solid rgba(255,255,255,0.25);
      border-radius: 999px;
      padding: 0.25rem 1rem;
      font-size: 0.8rem;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      margin-bottom: 1rem;
    }
    .plans-hero h1 { font-size: clamp(1.75rem, 4vw, 2.5rem); margin-bottom: 1rem; line-height: 1.2; }
    .plans-sub { font-size: 1.05rem; opacity: 0.85; line-height: 1.6; }

    .plans-toggle-wrap {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 2rem 1rem 1rem;
      flex-wrap: wrap;
    }
    .toggle-btn {
      padding: 0.5rem 1.25rem;
      border-radius: 999px;
      border: 2px solid #d1d5db;
      background: white;
      cursor: pointer;
      font-size: 0.9rem;
      font-weight: 500;
      color: #374151;
      transition: all 0.15s;
    }
    .toggle-btn.active {
      border-color: #1e3a5f;
      background: #1e3a5f;
      color: white;
    }
    .toggle-saving {
      background: #d1fae5;
      color: #065f46;
      font-size: 0.8rem;
      font-weight: 600;
      padding: 0.2rem 0.6rem;
      border-radius: 999px;
    }

    .plans-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
      max-width: 1000px;
      margin: 1.5rem auto 3rem;
      padding: 0 1.5rem;
    }
    .plan-card {
      background: white;
      border: 2px solid #e5e7eb;
      border-radius: 16px;
      padding: 2rem 1.75rem;
      position: relative;
      transition: box-shadow 0.15s;
    }
    .plan-card:hover { box-shadow: 0 8px 32px rgba(0,0,0,0.1); }
    .plan-highlight {
      border-color: #1e3a5f;
      box-shadow: 0 4px 24px rgba(30,58,95,0.15);
    }
    .plan-badge {
      position: absolute;
      top: -14px;
      left: 50%;
      transform: translateX(-50%);
      background: #1e3a5f;
      color: white;
      font-size: 0.75rem;
      font-weight: 700;
      padding: 0.25rem 1rem;
      border-radius: 999px;
      white-space: nowrap;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }
    .plan-name { font-size: 1.1rem; font-weight: 700; color: #111827; margin-bottom: 0.75rem; }
    .plan-price { display: flex; align-items: baseline; gap: 0.25rem; margin-bottom: 0.25rem; }
    .plan-amount { font-size: 2.5rem; font-weight: 800; color: #111827; }
    .plan-period { font-size: 1rem; color: #6b7280; }
    .plan-equiv { font-size: 0.8rem; color: #9ca3af; margin-bottom: 0.75rem; }
    .plan-desc { font-size: 0.9rem; color: #6b7280; line-height: 1.5; margin-bottom: 1.5rem; border-bottom: 1px solid #f3f4f6; padding-bottom: 1.25rem; }
    .plan-features { list-style: none; padding: 0; margin: 0 0 1.75rem; display: flex; flex-direction: column; gap: 0.6rem; }
    .plan-features li { display: flex; gap: 0.5rem; font-size: 0.9rem; align-items: flex-start; }
    .feature-yes { color: #111827; }
    .feature-no { color: #9ca3af; }
    .feat-icon { font-size: 0.85rem; margin-top: 0.1rem; flex-shrink: 0; }
    .feature-yes .feat-icon { color: #059669; font-weight: 700; }
    .plan-cta { display: block; text-align: center; width: 100%; box-sizing: border-box; }

    .plans-what-includes {
      background: #f9fafb;
      padding: 4rem 1.5rem;
      text-align: center;
    }
    .plans-what-includes h2 { font-size: 1.75rem; margin-bottom: 2.5rem; }
    .includes-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 2rem;
      max-width: 900px;
      margin: 0 auto;
      text-align: left;
    }
    .include-item { }
    .include-icon { font-size: 2rem; margin-bottom: 0.75rem; }
    .include-item h3 { font-size: 1rem; font-weight: 600; margin-bottom: 0.4rem; }
    .include-item p { font-size: 0.9rem; color: #6b7280; line-height: 1.5; }

    .plans-faq {
      max-width: 680px;
      margin: 0 auto;
      padding: 4rem 1.5rem;
    }
    .plans-faq h2 { font-size: 1.75rem; margin-bottom: 2rem; }
    .faq-list { display: flex; flex-direction: column; gap: 0.5rem; }
    .faq-item {
      border: 1px solid #e5e7eb;
      border-radius: 10px;
      overflow: hidden;
      cursor: pointer;
    }
    .faq-q {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.25rem;
      font-size: 0.95rem;
      font-weight: 500;
      color: #111827;
      user-select: none;
    }
    .faq-chevron { color: #9ca3af; font-size: 0.75rem; }
    .faq-a { padding: 0 1.25rem 1rem; font-size: 0.9rem; color: #6b7280; line-height: 1.6; }
    .faq-open { border-color: #1e3a5f; }
    .faq-open .faq-q { background: #f8faff; }

    .plans-cta-band {
      background: #0f172a;
      color: white;
      text-align: center;
      padding: 4rem 1.5rem;
    }
    .plans-cta-band h2 { font-size: 1.75rem; margin-bottom: 0.75rem; }
    .plans-cta-band p { opacity: 0.8; margin-bottom: 2rem; font-size: 1rem; }
    .plans-cta-actions { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }
  `]
})
export class ServicePlansComponent {
  billingAnnual = signal(true);
  openFaq = signal<string | null>(null);

  toggleFaq(q: string) {
    this.openFaq.update(current => current === q ? null : q);
  }

  plans: ServicePlanTier[] = [
    {
      id: 'essential',
      name: 'Essential',
      price: 99,
      priceMonthly: 9.99,
      highlight: false,
      badge: null,
      description: 'Annual service to keep your system clean, efficient, and compliant.',
      features: [
        'Annual full system service visit',
        'Filter clean & replacement check',
        'Refrigerant level inspection',
        'Written health report after visit',
        'Annual service reminder',
        'F-Gas compliant service record',
      ],
      notIncluded: [
        '6-month interim check',
        'Priority booking',
        'Emergency call-out',
      ]
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 159,
      priceMonthly: 15.99,
      highlight: true,
      badge: 'Most popular',
      description: 'Our most popular plan - full annual care plus mid-year peace of mind.',
      features: [
        'Annual full system service visit',
        '6-month interim health check',
        'Filter clean & replacement check',
        'Refrigerant level inspection',
        'Written health report after every visit',
        'Annual service reminder',
        'F-Gas compliant service record',
        'Priority booking (next available slot)',
        '10% discount on parts & accessories',
      ],
      notIncluded: [
        'Emergency same-day call-out',
      ]
    },
    {
      id: 'elite',
      name: 'Elite',
      price: 249,
      priceMonthly: 24.99,
      highlight: false,
      badge: null,
      description: 'Complete year-round cover with same-day emergency response included.',
      features: [
        'Annual full system service visit',
        '6-month interim health check',
        'Filter clean & replacement check',
        'Refrigerant top-up included (up to 200g)',
        'Written health report after every visit',
        'Annual service reminder',
        'F-Gas compliant service record',
        'Priority booking (next available slot)',
        '20% discount on parts & accessories',
        'Emergency same-day call-out (unlimited)',
        'Annual energy efficiency report',
        'Dedicated account manager',
      ],
      notIncluded: []
    }
  ];

  faqs = [
    {
      q: 'What happens if I need a repair during my plan?',
      a: 'Parts and labour for repairs are charged separately at a discounted rate based on your tier (10% Essential, 15% Premium, 20% Elite). Emergency call-outs are included at no extra charge on the Elite plan.'
    },
    {
      q: 'Which AC brands do you cover?',
      a: 'Our engineers are certified across all major brands including Daikin, Mitsubishi Electric, Samsung, LG, Hitachi, Fujitsu, Panasonic, and Toshiba. When you book, we match you with a brand-specialist engineer.'
    },
    {
      q: 'What if I have multiple AC units?',
      a: 'Each plan covers a single indoor unit and its associated outdoor unit. For multi-split or ducted systems, please contact us for a custom quote - we offer multi-unit discounts.'
    },
    {
      q: 'Can I cancel my plan?',
      a: 'Annual plans can be cancelled within 14 days of purchase for a full refund, or after your first service visit for a pro-rata refund. Monthly plans can be cancelled at any time with 30 days notice.'
    },
    {
      q: 'Is refrigerant top-up always included?',
      a: 'Refrigerant top-up (up to 200g F-Gas compliant refrigerant) is included in the Elite plan. Larger top-ups or repairs requiring refrigerant recovery and recharge are quoted separately.'
    },
    {
      q: 'What is the F-Gas compliant service record?',
      a: 'UK law requires a log of all refrigerant handling on systems over 5 tonnes CO2 equivalent. We provide a digital F-Gas record for your system after every service - useful for commercial tenants and property managers.'
    }
  ];
}
