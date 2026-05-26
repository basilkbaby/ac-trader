import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { QuoteService } from '../../core/services/quote.service';
import { QuoteWizardState } from '../../core/models/models';

@Component({
  selector: 'app-quote',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="quote-wrap">

        <div class="quote-header">
          <div class="progress-bar">
            <div class="progress-fill" [style.width.%]="progressPct()"></div>
          </div>
          <div class="progress-meta">
            <span>{{ stepLabel() }}</span>
            <span class="progress-time">{{ timeEst() }}</span>
          </div>
        </div>

        @if (loading()) {
          <div class="loading-state">
            <div class="loading-spinner"></div>
            <p>Calculating your estimate…</p>
          </div>
        }

        @if (!loading() && !state().result) {

          <!-- Step 1: Job type -->
          @if (state().step === 1) {
            <div class="step-content">
              <h2>What do you need?</h2>
              <p class="step-sub">Select the type of work — we'll tailor your estimate</p>
              <div class="option-grid">
                @for (opt of jobTypes; track opt.value) {
                  <button class="option-btn" (click)="selectJob(opt.value)">
                    <span class="opt-icon">{{ opt.icon }}</span>
                    <div>
                      <span class="opt-label">{{ opt.label }}</span>
                      <span class="opt-desc">{{ opt.desc }}</span>
                    </div>
                  </button>
                }
              </div>
            </div>
          }

          <!-- Step 2 — unit count (install / replace) -->
          @if (state().step === 2 && isIR()) {
            <div class="step-content">
              <h2>How many rooms or areas?</h2>
              <p class="step-sub">Each indoor unit serves one zone — multi-split systems share one outdoor unit</p>
              <div class="option-grid unit-grid">
                @for (opt of unitCounts; track opt.value) {
                  <button class="option-btn unit-btn" (click)="selectUnitCount(opt.value)">
                    <span class="unit-num">{{ opt.value }}{{ opt.value === 4 ? '+' : '' }}</span>
                    <span class="opt-label">{{ opt.label }}</span>
                    <span class="opt-desc">{{ opt.desc }}</span>
                  </button>
                }
              </div>
              <button class="btn-text step-back" (click)="back()">← Back</button>
            </div>
          }

          <!-- Step 2 — service type -->
          @if (state().step === 2 && isService()) {
            <div class="step-content">
              <h2>What type of service?</h2>
              <p class="step-sub">We'll match you with a certified engineer for your specific need</p>
              <div class="option-grid">
                @for (opt of serviceTypes; track opt.value) {
                  <button class="option-btn" (click)="selectServiceType(opt.value)">
                    <span class="opt-icon">{{ opt.icon }}</span>
                    <div>
                      <span class="opt-label">{{ opt.label }}</span>
                      <span class="opt-desc">{{ opt.desc }}</span>
                    </div>
                  </button>
                }
              </div>
              <button class="btn-text step-back" (click)="back()">← Back</button>
            </div>
          }

          <!-- Step 2 — fault type (emergency) -->
          @if (state().step === 2 && isEmergency()) {
            <div class="step-content">
              <h2>What's the problem?</h2>
              <p class="step-sub">Helps us estimate likely cause and repair time</p>
              <div class="option-grid">
                @for (opt of faultTypes; track opt.value) {
                  <button class="option-btn" (click)="selectFaultType(opt.value)">
                    <span class="opt-icon">{{ opt.icon }}</span>
                    <div>
                      <span class="opt-label">{{ opt.label }}</span>
                      <span class="opt-desc">{{ opt.desc }}</span>
                    </div>
                  </button>
                }
              </div>
              <button class="btn-text step-back" (click)="back()">← Back</button>
            </div>
          }

          <!-- Step 3 — room size (install / replace) -->
          @if (state().step === 3 && isIR()) {
            <div class="step-content">
              <h2>How large is the main room or area?</h2>
              <p class="step-sub">Determines the BTU capacity needed — larger rooms need more powerful units</p>
              <div class="option-grid">
                @for (opt of roomSizes; track opt.value) {
                  <button class="option-btn" (click)="selectRoomSize(opt.value)">
                    <span class="opt-icon">{{ opt.icon }}</span>
                    <div>
                      <span class="opt-label">{{ opt.label }}</span>
                      <span class="opt-desc">{{ opt.desc }}</span>
                    </div>
                  </button>
                }
              </div>
              <button class="btn-text step-back" (click)="back()">← Back</button>
            </div>
          }

          <!-- Step 3 (service/emergency) or Step 4 (install/replace) — property type -->
          @if ((state().step === 3 && !isIR()) || (state().step === 4 && isIR())) {
            <div class="step-content">
              <h2>What type of property?</h2>
              <p class="step-sub">Affects pipework routing, access complexity, and installation time</p>
              <div class="option-grid prop-grid">
                @for (opt of propertyTypes; track opt.value) {
                  <button class="option-btn"
                    [class.selected]="state().propertyType === opt.value"
                    (click)="selectProperty(opt.value)">
                    <span class="opt-icon">{{ opt.icon }}</span>
                    <div>
                      <span class="opt-label">{{ opt.label }}</span>
                    </div>
                  </button>
                }
              </div>
              @if (!isIR()) {
                <div class="postcode-row">
                  <input type="text" [(ngModel)]="postcodeInput" name="postcode"
                    placeholder="Postcode (e.g. SW1A 1AA)" class="postcode-input" maxlength="8" />
                  <p class="postcode-hint">Used to find certified engineers near you — optional</p>
                </div>
                @if (error()) { <p class="error-msg">{{ error() }}</p> }
              }
              <button class="btn-text step-back" (click)="back()">← Back</button>
            </div>
          }

          <!-- Step 5 — brand preference (install / replace) -->
          @if (state().step === 5 && isIR()) {
            <div class="step-content">
              <h2>Brand preference?</h2>
              <p class="step-sub">Only affects unit cost — all installations are by the same certified engineers</p>
              <div class="brand-grid">
                @for (opt of brandTiers; track opt.value) {
                  <button class="brand-btn"
                    [class.selected]="state().brandTier === opt.value"
                    (click)="selectBrand(opt.value)">
                    <div class="brand-btn-top">
                      <span class="brand-icon">{{ opt.icon }}</span>
                      <strong>{{ opt.label }}</strong>
                      <span class="brand-range">{{ opt.priceRange }}</span>
                    </div>
                    <p class="brand-desc">{{ opt.desc }}</p>
                    <span class="brand-examples">e.g. {{ opt.examples }}</span>
                  </button>
                }
              </div>
              <div class="postcode-row">
                <input type="text" [(ngModel)]="postcodeInput" name="postcode"
                  placeholder="Postcode (e.g. SW1A 1AA)" class="postcode-input" maxlength="8" />
                <p class="postcode-hint">Used to match you with engineers nearby — optional</p>
              </div>
              @if (error()) { <p class="error-msg">{{ error() }}</p> }
              <button class="btn-text step-back" (click)="back()">← Back</button>
            </div>
          }

        }

        <!-- Result -->
        @if (!loading() && state().result) {
          <div class="step-content">

            <div class="result-eyebrow">
              @if (isEmergency()) {
                <span class="badge-urgent">⚡ Same-day dispatch available</span>
              } @else {
                <span class="badge-ok">✓ Instant estimate</span>
              }
            </div>

            <h2>
              @if (isInstall()) { New installation estimate }
              @else if (isReplace()) { Replacement estimate }
              @else if (isService()) { Service estimate }
              @else { Emergency call-out estimate }
            </h2>

            <p class="result-meta">
              @if (isIR()) {
                {{ state().unitCount }} {{ state().unitCount === 1 ? 'unit' : 'units' }} ·
                {{ brandLabel() }} · {{ propLabel() }} · {{ state().result!.estimatedDuration }}
              } @else if (isService()) {
                {{ svcLabel() }} · {{ propLabel() }} · {{ state().result!.estimatedDuration }}
              } @else {
                {{ faultLabel() }} · {{ propLabel() }} · {{ state().result!.estimatedDuration }}
              }
            </p>

            <!-- Price band -->
            <div class="price-band">
              <span class="price-band-label">Estimated total inc. VAT</span>
              <div class="price-range">
                £{{ state().result!.totalLow | number:'1.0-0' }}
                <span class="price-dash">–</span>
                £{{ state().result!.totalHigh | number:'1.0-0' }}
              </div>
            </div>

            <!-- Breakdown -->
            <div class="breakdown-card">
              <div class="breakdown-title">Price breakdown (ex. VAT)</div>

              @if (state().result!.unitCostLow > 0) {
                <div class="breakdown-row">
                  <span>Unit supply{{ state().unitCount > 1 ? ' (' + state().unitCount + ' units)' : '' }}</span>
                  <span>£{{ state().result!.unitCostLow | number:'1.0-0' }} – £{{ state().result!.unitCostHigh | number:'1.0-0' }}</span>
                </div>
              }
              @if (state().result!.labourCostLow > 0) {
                <div class="breakdown-row">
                  <span>{{ isService() ? 'Service labour' : 'Installation labour' }}</span>
                  <span>£{{ state().result!.labourCostLow | number:'1.0-0' }} – £{{ state().result!.labourCostHigh | number:'1.0-0' }}</span>
                </div>
              }
              @if (state().result!.pipeworkCostLow > 0) {
                <div class="breakdown-row">
                  <span>Pipework, fittings{{ state().unitCount > 1 ? ' & outdoor unit' : '' }}</span>
                  <span>£{{ state().result!.pipeworkCostLow | number:'1.0-0' }} – £{{ state().result!.pipeworkCostHigh | number:'1.0-0' }}</span>
                </div>
              }
              @if (state().result!.calloutFeeLow > 0) {
                <div class="breakdown-row">
                  <span>Call-out fee (inc. first hour)</span>
                  <span>£{{ state().result!.calloutFeeLow | number:'1.0-0' }} – £{{ state().result!.calloutFeeHigh | number:'1.0-0' }}</span>
                </div>
              }
              <div class="breakdown-row vat-row">
                <span>VAT (20%)</span>
                <span>Included in total above</span>
              </div>
              <div class="breakdown-total">
                <span>Total estimate</span>
                <span>£{{ state().result!.totalLow | number:'1.0-0' }} – £{{ state().result!.totalHigh | number:'1.0-0' }}</span>
              </div>
            </div>

            <!-- Inclusions -->
            <div class="inclusions-card">
              <div class="inclusions-title">What's included</div>
              <ul class="inclusions-list">
                @for (item of state().result!.inclusions; track item) {
                  <li>{{ item }}</li>
                }
              </ul>
            </div>

            <!-- Notices -->
            @if (isEmergency()) {
              <div class="notice notice-warn">
                <strong>Parts not included</strong> — parts are diagnosed and quoted on-site.
                The figures above cover labour and call-out only.
              </div>
            } @else {
              <div class="notice">
                <strong>What could affect the final price</strong> — difficult access, pipe runs over 6m,
                non-standard wall types, or consumer unit upgrades may add cost.
                Your engineer confirms before any work begins.
              </div>
            }

            @if (isIR() && state().result!.recommendedBtu) {
              <p class="btu-note">
                Recommended capacity: <strong>{{ state().result!.recommendedBtu }}</strong> per unit
                for a {{ roomSizeLabel() }}
              </p>
            }

            <!-- CTAs -->
            <div class="quote-actions">
              <button class="btn-primary" (click)="goToBooking()">Book a specialist</button>
              <button class="btn-secondary" (click)="goToEngineers()">See engineers near me</button>
            </div>

            <!-- Email quote -->
            <div class="email-section">
              <button class="btn-text" (click)="toggleEmailForm()">
                {{ showEmailForm() ? 'Cancel' : '📧 Email me this quote' }}
              </button>
              @if (showEmailForm()) {
                <div class="email-row">
                  <input type="email" [(ngModel)]="emailInput" name="email" placeholder="Your email address" />
                  <button class="btn-secondary btn-sm" (click)="sendEmail()">Send</button>
                </div>
              }
            </div>

            <button class="btn-text restart-btn" (click)="restart()">Start over</button>

          </div>
        }

      </div>
    </div>
  `,
  styles: [`
    /* Loading */
    .loading-spinner {
      width: 36px; height: 36px; border: 3px solid var(--border);
      border-top-color: var(--brand); border-radius: 50%;
      animation: spin 0.7s linear infinite; margin: 0 auto 1rem;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* Unit count grid */
    .unit-grid { grid-template-columns: 1fr 1fr; }
    .unit-btn { flex-direction: column; align-items: center; text-align: center; padding: 1.25rem 0.75rem; gap: 0.25rem; }
    .unit-num { font-size: 2.25rem; font-weight: 800; color: var(--brand); line-height: 1; }

    /* Property 2-col */
    .prop-grid { grid-template-columns: 1fr 1fr; }

    /* Postcode input */
    .postcode-row { margin: 1rem 0 0.25rem; }
    .postcode-input { max-width: 210px; text-transform: uppercase; }
    .postcode-hint { font-size: 0.78rem; color: var(--text-muted); margin-top: 0.35rem; }

    .step-back { display: block; text-align: center; margin-top: 0.75rem; }

    /* Brand tier cards */
    .brand-grid { display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1.25rem; }
    .brand-btn {
      display: block; width: 100%; text-align: left;
      padding: 1rem 1.1rem; border: 1.5px solid var(--border);
      border-radius: var(--radius-md); background: var(--surface);
      cursor: pointer; transition: border-color 0.15s, background 0.15s;
    }
    .brand-btn:hover, .brand-btn.selected { border-color: var(--brand); background: var(--brand-light); }
    .brand-btn-top { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.3rem; }
    .brand-icon { font-size: 1.1rem; }
    .brand-btn-top strong { font-size: 0.95rem; color: var(--text-primary); flex: 1; }
    .brand-range { font-size: 0.78rem; color: var(--text-muted); white-space: nowrap; }
    .brand-desc { font-size: 0.85rem; color: var(--text-secondary); margin: 0 0 0.2rem; }
    .brand-examples { font-size: 0.78rem; color: var(--text-muted); font-style: italic; }

    /* Result */
    .result-eyebrow { margin-bottom: 0.5rem; }
    .badge-ok {
      display: inline-block; background: var(--success-bg); color: var(--success);
      font-size: 0.72rem; font-weight: 700; padding: 0.22rem 0.7rem;
      border-radius: 999px; text-transform: uppercase; letter-spacing: 0.05em;
    }
    .badge-urgent {
      display: inline-block; background: #fee2e2; color: #991b1b;
      font-size: 0.72rem; font-weight: 700; padding: 0.22rem 0.7rem;
      border-radius: 999px; text-transform: uppercase; letter-spacing: 0.05em;
    }
    .result-meta { font-size: 0.85rem; color: var(--text-muted); margin-top: 0.3rem; margin-bottom: 1.25rem; }

    /* Price band */
    .price-band {
      background: var(--brand-light); border: 1.5px solid #c7d7ff;
      border-radius: var(--radius-md); padding: 1.25rem 1.5rem;
      text-align: center; margin-bottom: 1.1rem;
    }
    .price-band-label { display: block; font-size: 0.75rem; font-weight: 600; color: var(--brand); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 0.35rem; }
    .price-range { font-size: 2.25rem; font-weight: 800; color: var(--text-primary); line-height: 1.1; }
    .price-dash { margin: 0 0.25rem; color: var(--text-muted); }

    /* Breakdown */
    .breakdown-card {
      border: 1px solid var(--border); border-radius: var(--radius-md);
      padding: 1rem 1.1rem; margin-bottom: 1rem; background: var(--surface);
    }
    .breakdown-title { font-size: 0.72rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.6rem; }
    .breakdown-row { display: flex; justify-content: space-between; align-items: center; padding: 0.45rem 0; border-bottom: 1px solid var(--border); font-size: 0.875rem; gap: 1rem; }
    .breakdown-row span:first-child { color: var(--text-secondary); }
    .breakdown-row span:last-child { font-weight: 500; white-space: nowrap; }
    .vat-row span { color: var(--text-muted) !important; font-weight: 400 !important; font-size: 0.8rem; }
    .breakdown-total { display: flex; justify-content: space-between; align-items: center; padding: 0.7rem 0 0.1rem; font-weight: 700; }
    .breakdown-total span:last-child { color: var(--brand); font-size: 1rem; }

    /* Inclusions */
    .inclusions-card { margin-bottom: 1rem; }
    .inclusions-title { font-size: 0.72rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.55rem; }
    .inclusions-list { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 0.3rem; }
    .inclusions-list li { font-size: 0.875rem; color: var(--text-primary); display: flex; align-items: flex-start; gap: 0.5rem; }
    .inclusions-list li::before { content: '✓'; color: var(--success); font-weight: 700; flex-shrink: 0; margin-top: 0.05rem; }

    /* Notices */
    .notice { background: #fffbeb; border: 1px solid #fcd34d; border-radius: var(--radius-sm); padding: 0.75rem 1rem; font-size: 0.82rem; color: #78350f; margin-bottom: 1rem; line-height: 1.55; }
    .notice strong { display: block; margin-bottom: 0.15rem; color: #92400e; }
    .notice-warn { background: #fef2f2; border-color: #fca5a5; color: #991b1b; }
    .notice-warn strong { color: #991b1b; }

    .btu-note { font-size: 0.82rem; color: var(--text-muted); margin-bottom: 1rem; }

    /* Email section */
    .email-section { margin-top: 0.75rem; text-align: center; }
    .email-row { display: flex; gap: 0.5rem; margin-top: 0.6rem; flex-wrap: wrap; }
    .email-row input { flex: 1; min-width: 180px; }

    .restart-btn { display: block; text-align: center; margin-top: 0.5rem; }
  `]
})
export class QuoteComponent {
  private quoteService = inject(QuoteService);
  private router       = inject(Router);

  loading       = signal(false);
  error         = signal<string | null>(null);
  showEmailForm = signal(false);

  postcodeInput = '';
  emailInput    = '';

  state = signal<QuoteWizardState>({
    step: 1, jobType: null, unitCount: 1,
    roomSize: null, roomSizeM2: 25,
    propertyType: null, brandTier: null,
    serviceJobType: null, faultType: null,
    postcodeArea: '', customerEmail: '', customerPhone: '',
    result: null,
  });

  isIR        = computed(() => this.state().jobType === 'install' || this.state().jobType === 'replace');
  isInstall   = computed(() => this.state().jobType === 'install');
  isReplace   = computed(() => this.state().jobType === 'replace');
  isService   = computed(() => this.state().jobType === 'service');
  isEmergency = computed(() => this.state().jobType === 'emergency');

  totalSteps  = computed(() => this.isIR() ? 5 : 3);
  progressPct = computed(() => {
    if (this.state().result) return 100;
    const step = this.isIR() ? this.state().step : Math.min(this.state().step, 3);
    return Math.min(95, Math.round((step / this.totalSteps()) * 100));
  });
  stepLabel = computed(() => {
    if (this.state().result) return 'Your estimate';
    const step = this.isIR() ? this.state().step : Math.min(this.state().step, 3);
    return `Step ${step} of ${this.totalSteps()}`;
  });
  timeEst = computed(() => {
    if (this.state().result) return 'Done ✓';
    return (['~90 sec', '~60 sec', '~30 sec', '~15 sec', 'Almost done'])[this.state().step - 1] ?? '';
  });

  brandLabel    = computed(() => {
    const m: Record<string,string> = { budget: 'budget-range', mid: 'mid-range', premium: 'premium' };
    return m[this.state().brandTier ?? ''] ?? '';
  });
  propLabel     = computed(() => this.propertyTypes.find(p => p.value === this.state().propertyType)?.label ?? '');
  svcLabel      = computed(() => this.serviceTypes.find(s => s.value === this.state().serviceJobType)?.label ?? 'service');
  faultLabel    = computed(() => this.faultTypes.find(f => f.value === this.state().faultType)?.label ?? '');
  roomSizeLabel = computed(() => this.roomSizes.find(r => r.value === this.state().roomSize)?.label?.toLowerCase() ?? 'room');

  jobTypes = [
    { value: 'install',   label: 'New installation',      desc: 'No existing AC system',             icon: '❄️' },
    { value: 'replace',   label: 'Replace existing',       desc: 'Like-for-like or upgrade',          icon: '🔄' },
    { value: 'service',   label: 'Service / maintenance',  desc: 'Annual check, repair or deep clean', icon: '🔧' },
    { value: 'emergency', label: 'Emergency repair',       desc: 'System down — urgent response',     icon: '🚨' },
  ];

  unitCounts = [
    { value: 1, label: '1 room',  desc: 'Single split system'           },
    { value: 2, label: '2 rooms', desc: 'Multi-split or 2 × single'     },
    { value: 3, label: '3 rooms', desc: 'Multi-split system'            },
    { value: 4, label: 'rooms',   desc: 'VRF or large multi-split'      },
  ];

  roomSizes = [
    { value: 'small',  label: 'Small room',  desc: 'Up to 20 m² — bedroom, study',           icon: '🛏️' },
    { value: 'medium', label: 'Medium room', desc: '20–35 m² — living room, open plan',       icon: '🛋️' },
    { value: 'large',  label: 'Large room',  desc: '35–60 m² — large open plan, kitchen-diner', icon: '🏠' },
    { value: 'xlarge', label: 'Very large',  desc: 'Over 60 m² — whole floor or multi-zone',  icon: '🏢' },
  ];

  propertyTypes = [
    { value: 'flat',  label: 'Flat / apartment',   icon: '🏢' },
    { value: 'terr',  label: 'Terraced house',      icon: '🏘️' },
    { value: 'semi',  label: 'Semi-detached',       icon: '🏡' },
    { value: 'det',   label: 'Detached house',      icon: '🏰' },
    { value: 'comm',  label: 'Commercial / office', icon: '🏗️' },
  ];

  serviceTypes = [
    { value: 'annual', label: 'Annual service',     desc: 'Filter clean, gas check, performance test', icon: '🔧' },
    { value: 'strip',  label: 'Deep clean',         desc: 'Full internal strip and chemical clean',    icon: '🧹' },
    { value: 'repair', label: 'Non-urgent repair',  desc: 'Specific fault, booked in advance',         icon: '🔩' },
  ];

  faultTypes = [
    { value: 'not-cooling', label: 'Not cooling / heating', desc: 'Running but no output',              icon: '🌡️' },
    { value: 'wont-start',  label: 'Won\'t turn on',        desc: 'No power or not responding',         icon: '⚡' },
    { value: 'leaking',     label: 'Water leaking',         desc: 'Visible dripping from indoor unit',  icon: '💧' },
    { value: 'noise',       label: 'Loud or strange noise', desc: 'Rattling, grinding or hissing',      icon: '🔊' },
  ];

  brandTiers = [
    {
      value: 'budget',   label: 'Budget-friendly', icon: '💰',
      priceRange: 'lower cost',
      desc: 'Good quality, functional units at a lower upfront investment',
      examples: 'Gree, Midea, Haier',
    },
    {
      value: 'mid',      label: 'Mid-range',       icon: '⭐',
      priceRange: 'popular choice',
      desc: 'Reliable brands with strong after-sales support and parts availability',
      examples: 'LG, Samsung, Panasonic, Toshiba',
    },
    {
      value: 'premium',  label: 'Premium',          icon: '🏆',
      priceRange: 'best efficiency',
      desc: 'Market-leading efficiency ratings, quieter operation, longer warranties',
      examples: 'Daikin, Mitsubishi Electric, Fujitsu, Hitachi',
    },
  ];

  // ── Navigation ──────────────────────────────────────────────────────────────

  selectJob(value: string) {
    this.state.update(s => ({ ...s, jobType: value }));
    setTimeout(() => this.state.update(s => ({ ...s, step: 2 })), 220);
  }

  selectUnitCount(value: number) {
    this.state.update(s => ({ ...s, unitCount: value }));
    setTimeout(() => this.state.update(s => ({ ...s, step: 3 })), 220);
  }

  selectRoomSize(value: string) {
    const m2: Record<string, number> = { small: 15, medium: 28, large: 48, xlarge: 70 };
    this.state.update(s => ({ ...s, roomSize: value, roomSizeM2: m2[value] ?? 25 }));
    setTimeout(() => this.state.update(s => ({ ...s, step: 4 })), 220);
  }

  selectProperty(value: string) {
    this.state.update(s => ({ ...s, propertyType: value, postcodeArea: this.postcodeInput }));
    if (this.isIR()) {
      setTimeout(() => this.state.update(s => ({ ...s, step: 5 })), 220);
    } else {
      setTimeout(() => this.calculate(), 220);
    }
  }

  selectServiceType(value: string) {
    this.state.update(s => ({ ...s, serviceJobType: value }));
    setTimeout(() => this.state.update(s => ({ ...s, step: 3 })), 220);
  }

  selectFaultType(value: string) {
    this.state.update(s => ({ ...s, faultType: value }));
    setTimeout(() => this.state.update(s => ({ ...s, step: 3 })), 220);
  }

  selectBrand(value: string) {
    this.state.update(s => ({ ...s, brandTier: value, postcodeArea: this.postcodeInput }));
    setTimeout(() => this.calculate(), 220);
  }

  back() {
    const s = this.state();
    if (s.result) {
      this.state.update(st => ({ ...st, result: null, step: this.isIR() ? 5 : 3 }));
      return;
    }
    if (s.step > 1) this.state.update(st => ({ ...st, step: st.step - 1 }));
  }

  calculate() {
    this.loading.set(true);
    this.error.set(null);
    const s = this.state();
    this.quoteService.save({
      jobType:        s.jobType!,
      propertyType:   s.propertyType ?? 'flat',
      roomSizeM2:     s.roomSizeM2,
      unitCount:      s.unitCount,
      brandTier:      s.brandTier ?? undefined,
      serviceJobType: s.serviceJobType ?? undefined,
      faultType:      s.faultType ?? undefined,
      postcodeArea:   s.postcodeArea || undefined,
    }).subscribe({
      next:  result => { this.loading.set(false); this.state.update(st => ({ ...st, result })); },
      error: err    => { this.loading.set(false); this.error.set(err.message); },
    });
  }

  goToBooking() {
    const id = this.state().result?.id;
    if (id) this.router.navigate(['/booking', id]);
  }

  goToEngineers() { this.router.navigate(['/engineers']); }

  toggleEmailForm() { this.showEmailForm.update(v => !v); }

  sendEmail() { this.showEmailForm.set(false); }

  restart() {
    this.postcodeInput = '';
    this.emailInput    = '';
    this.showEmailForm.set(false);
    this.state.set({
      step: 1, jobType: null, unitCount: 1,
      roomSize: null, roomSizeM2: 25,
      propertyType: null, brandTier: null,
      serviceJobType: null, faultType: null,
      postcodeArea: '', customerEmail: '', customerPhone: '',
      result: null,
    });
  }
}
