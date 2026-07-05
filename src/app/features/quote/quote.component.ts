import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { QuoteService } from '../../core/services/quote.service';
import { QuoteWizardState } from '../../core/models/models';

@Component({
  selector: 'app-quote',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="quote-page">
      <div class="quote-shell">

        <!-- Header + stepper -->
        <header class="quote-top">
          <div class="quote-top-head">
            <span class="eyebrow">Instant AC quote</span>
            <h1>Build your free, no-obligation quote</h1>
            <p class="quote-top-sub">Transparent, itemised pricing from F-Gas certified engineers - in under two minutes.</p>
          </div>

          <ol class="stepper" [attr.aria-label]="'Step ' + (activeIndex()+1) + ' of ' + stepper().length">
            @for (node of stepper(); track node; let i = $index) {
              <li class="stepper-node"
                  [class.is-done]="i < activeIndex()"
                  [class.is-active]="i === activeIndex()">
                <span class="stepper-dot">
                  @if (i < activeIndex()) {
                    <span class="stepper-check" [innerHTML]="icon('check')"></span>
                  } @else {
                    {{ i + 1 }}
                  }
                </span>
                <span class="stepper-label">{{ node }}</span>
              </li>
            }
          </ol>
        </header>

        <div class="quote-layout">

          <!-- ── Main column ─────────────────────────────────────────────── -->
          <main class="quote-main">

            @if (loading()) {
              <div class="quote-loading">
                <div class="loading-spinner"></div>
                <p>Calculating your estimate…</p>
              </div>
            }

            @if (!loading() && !state().result) {

              <!-- Step 1: Job type -->
              @if (state().step === 1) {
                <section class="step">
                  <h2 class="step-title">What do you need?</h2>
                  <p class="step-hint">Select the type of work and we'll tailor your estimate.</p>
                  <div class="opt-list">
                    @for (opt of jobTypes; track opt.value) {
                      <button class="opt-card" (click)="selectJob(opt.value)">
                        <span class="opt-ico" [innerHTML]="icon(opt.icon)"></span>
                        <span class="opt-body">
                          <span class="opt-label">{{ opt.label }}</span>
                          <span class="opt-desc">{{ opt.desc }}</span>
                        </span>
                        <span class="opt-arrow" [innerHTML]="icon('chevron')"></span>
                      </button>
                    }
                  </div>
                </section>
              }

              <!-- Step 2 - unit count (install / replace) -->
              @if (state().step === 2 && isIR()) {
                <section class="step">
                  <h2 class="step-title">How many rooms or areas?</h2>
                  <p class="step-hint">Each indoor unit serves one zone - multi-split systems share one outdoor unit.</p>
                  <div class="tile-grid">
                    @for (opt of unitCounts; track opt.value) {
                      <button class="tile" [class.selected]="state().unitCount === opt.value" (click)="selectUnitCount(opt.value)">
                        <span class="tile-num">{{ opt.value }}{{ opt.value === 4 ? '+' : '' }}</span>
                        <span class="tile-label">{{ opt.label }}</span>
                        <span class="tile-desc">{{ opt.desc }}</span>
                      </button>
                    }
                  </div>
                  <button class="step-back" (click)="back()"><span [innerHTML]="icon('back')"></span> Back</button>
                </section>
              }

              <!-- Step 2 - service type -->
              @if (state().step === 2 && isService()) {
                <section class="step">
                  <h2 class="step-title">What type of service?</h2>
                  <p class="step-hint">We'll match you with a certified engineer for your specific need.</p>
                  <div class="opt-list">
                    @for (opt of serviceTypes; track opt.value) {
                      <button class="opt-card" (click)="selectServiceType(opt.value)">
                        <span class="opt-ico" [innerHTML]="icon(opt.icon)"></span>
                        <span class="opt-body">
                          <span class="opt-label">{{ opt.label }}</span>
                          <span class="opt-desc">{{ opt.desc }}</span>
                        </span>
                        <span class="opt-arrow" [innerHTML]="icon('chevron')"></span>
                      </button>
                    }
                  </div>
                  <button class="step-back" (click)="back()"><span [innerHTML]="icon('back')"></span> Back</button>
                </section>
              }

              <!-- Step 2 - fault type (emergency) -->
              @if (state().step === 2 && isEmergency()) {
                <section class="step">
                  <h2 class="step-title">What's the problem?</h2>
                  <p class="step-hint">Helps us estimate the likely cause and repair time.</p>
                  <div class="opt-list">
                    @for (opt of faultTypes; track opt.value) {
                      <button class="opt-card" (click)="selectFaultType(opt.value)">
                        <span class="opt-ico" [innerHTML]="icon(opt.icon)"></span>
                        <span class="opt-body">
                          <span class="opt-label">{{ opt.label }}</span>
                          <span class="opt-desc">{{ opt.desc }}</span>
                        </span>
                        <span class="opt-arrow" [innerHTML]="icon('chevron')"></span>
                      </button>
                    }
                  </div>
                  <button class="step-back" (click)="back()"><span [innerHTML]="icon('back')"></span> Back</button>
                </section>
              }

              <!-- Step 3 - room size (install / replace) -->
              @if (state().step === 3 && isIR()) {
                <section class="step">
                  <h2 class="step-title">How large is the main room?</h2>
                  <p class="step-hint">This sets the BTU capacity needed - larger rooms need more powerful units.</p>
                  <div class="tile-grid">
                    @for (opt of roomSizes; track opt.value) {
                      <button class="tile" [class.selected]="state().roomSize === opt.value" (click)="selectRoomSize(opt.value)">
                        <span class="tile-area">{{ opt.area }}</span>
                        <span class="tile-label">{{ opt.label }}</span>
                        <span class="tile-desc">{{ opt.desc }}</span>
                      </button>
                    }
                  </div>
                  <button class="step-back" (click)="back()"><span [innerHTML]="icon('back')"></span> Back</button>
                </section>
              }

              <!-- property type (step 3 service/emergency, step 4 install/replace) -->
              @if ((state().step === 3 && !isIR()) || (state().step === 4 && isIR())) {
                <section class="step">
                  <h2 class="step-title">What type of property?</h2>
                  <p class="step-hint">Affects pipework routing, access and installation time.</p>
                  <div class="opt-list opt-list-2col">
                    @for (opt of propertyTypes; track opt.value) {
                      <button class="opt-card opt-card-compact"
                        [class.selected]="state().propertyType === opt.value"
                        (click)="selectProperty(opt.value)">
                        <span class="opt-ico" [innerHTML]="icon(opt.icon)"></span>
                        <span class="opt-label">{{ opt.label }}</span>
                      </button>
                    }
                  </div>
                  @if (!isIR()) {
                    <div class="field-row">
                      <label>Postcode <span class="field-optional">(optional)</span></label>
                      <input type="text" [(ngModel)]="postcodeInput" name="postcode"
                        placeholder="e.g. SW1A 1AA" class="postcode-input" maxlength="8" />
                      <p class="field-hint">Used to find certified engineers near you.</p>
                    </div>
                    @if (error()) { <p class="error-msg">{{ error() }}</p> }
                  }
                  <button class="step-back" (click)="back()"><span [innerHTML]="icon('back')"></span> Back</button>
                </section>
              }

              <!-- Step 5 - brand preference (install / replace) -->
              @if (state().step === 5 && isIR()) {
                <section class="step">
                  <h2 class="step-title">Brand &amp; budget preference</h2>
                  <p class="step-hint">Only affects unit cost - every install is by the same certified engineers.</p>
                  <div class="brand-list">
                    @for (opt of brandTiers; track opt.value) {
                      <button class="brand-card"
                        [class.selected]="state().brandTier === opt.value"
                        (click)="selectBrand(opt.value)">
                        <span class="brand-ico" [innerHTML]="icon(opt.icon)"></span>
                        <span class="brand-main">
                          <span class="brand-head">
                            <strong>{{ opt.label }}</strong>
                            <span class="brand-range">{{ opt.priceRange }}</span>
                          </span>
                          <span class="brand-desc">{{ opt.desc }}</span>
                          <span class="brand-examples">e.g. {{ opt.examples }}</span>
                        </span>
                      </button>
                    }
                  </div>
                  <div class="field-row">
                    <label>Postcode <span class="field-optional">(optional)</span></label>
                    <input type="text" [(ngModel)]="postcodeInput" name="postcode"
                      placeholder="e.g. SW1A 1AA" class="postcode-input" maxlength="8" />
                    <p class="field-hint">Used to match you with engineers nearby.</p>
                  </div>
                  @if (error()) { <p class="error-msg">{{ error() }}</p> }
                  <button class="step-back" (click)="back()"><span [innerHTML]="icon('back')"></span> Back</button>
                </section>
              }
            }

            <!-- ── Result ────────────────────────────────────────────────── -->
            @if (!loading() && state().result) {
              <section class="result">

                <div class="result-head">
                  <div>
                    @if (isEmergency()) {
                      <span class="pill pill-urgent"><span [innerHTML]="icon('zap')"></span> Same-day dispatch</span>
                    } @else {
                      <span class="pill pill-ok"><span [innerHTML]="icon('check')"></span> Instant estimate</span>
                    }
                    <h2 class="result-title">
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
                  </div>
                  <span class="quote-ref">Ref ACT-Q{{ state().result!.id }}</span>
                </div>

                <!-- Price band -->
                <div class="price-band">
                  <div class="price-band-main">
                    <span class="price-band-label">Estimated total inc. VAT</span>
                    <div class="price-range">
                      £{{ state().result!.totalLow | number:'1.0-0' }}
                      <span class="price-dash">–</span>
                      £{{ state().result!.totalHigh | number:'1.0-0' }}
                    </div>
                  </div>
                  @if (isIR()) {
                    <div class="price-finance">
                      <span class="finance-from">from <strong>£{{ monthlyFrom() | number:'1.0-0' }}/mo</strong></span>
                      <span class="finance-note">24 months · 0% APR representative</span>
                    </div>
                  }
                </div>

                <!-- Breakdown -->
                <div class="panel">
                  <div class="panel-title">Price breakdown <span class="panel-title-note">ex. VAT</span></div>
                  @if (state().result!.unitCostLow > 0) {
                    <div class="bd-row">
                      <span>Unit supply{{ state().unitCount > 1 ? ' (' + state().unitCount + ' units)' : '' }}</span>
                      <span>£{{ state().result!.unitCostLow | number:'1.0-0' }} – £{{ state().result!.unitCostHigh | number:'1.0-0' }}</span>
                    </div>
                  }
                  @if (state().result!.labourCostLow > 0) {
                    <div class="bd-row">
                      <span>{{ isService() ? 'Service labour' : 'Installation labour' }}</span>
                      <span>£{{ state().result!.labourCostLow | number:'1.0-0' }} – £{{ state().result!.labourCostHigh | number:'1.0-0' }}</span>
                    </div>
                  }
                  @if (state().result!.pipeworkCostLow > 0) {
                    <div class="bd-row">
                      <span>Pipework, fittings{{ state().unitCount > 1 ? ' & outdoor unit' : '' }}</span>
                      <span>£{{ state().result!.pipeworkCostLow | number:'1.0-0' }} – £{{ state().result!.pipeworkCostHigh | number:'1.0-0' }}</span>
                    </div>
                  }
                  @if (state().result!.calloutFeeLow > 0) {
                    <div class="bd-row">
                      <span>Call-out fee (inc. first hour)</span>
                      <span>£{{ state().result!.calloutFeeLow | number:'1.0-0' }} – £{{ state().result!.calloutFeeHigh | number:'1.0-0' }}</span>
                    </div>
                  }
                  <div class="bd-row bd-vat"><span>VAT (20%)</span><span>Included in total</span></div>
                  <div class="bd-total">
                    <span>Total estimate</span>
                    <span>£{{ state().result!.totalLow | number:'1.0-0' }} – £{{ state().result!.totalHigh | number:'1.0-0' }}</span>
                  </div>
                </div>

                <!-- Inclusions -->
                <div class="panel">
                  <div class="panel-title">What's included</div>
                  <ul class="inc-list">
                    @for (item of state().result!.inclusions; track item) {
                      <li><span class="inc-tick" [innerHTML]="icon('check')"></span> {{ item }}</li>
                    }
                  </ul>
                </div>

                <!-- Notice -->
                @if (isEmergency()) {
                  <div class="notice notice-warn">
                    <span class="notice-ico" [innerHTML]="icon('info')"></span>
                    <span><strong>Parts not included.</strong> Parts are diagnosed and quoted on-site. The figures above cover labour and call-out only.</span>
                  </div>
                } @else {
                  <div class="notice">
                    <span class="notice-ico" [innerHTML]="icon('info')"></span>
                    <span><strong>What could affect the final price.</strong> Difficult access, pipe runs over 6m, non-standard walls or a consumer-unit upgrade may add cost. Your engineer confirms before any work begins.</span>
                  </div>
                }

                @if (isIR() && state().result!.recommendedBtu) {
                  <p class="btu-note">Recommended capacity: <strong>{{ state().result!.recommendedBtu }}</strong> per unit for a {{ roomSizeLabel() }}.</p>
                }

                <!-- What happens next -->
                <div class="panel next-panel">
                  <div class="panel-title">What happens next</div>
                  <ol class="next-list">
                    <li><span class="next-num">1</span> Book a verified engineer or request quotes from up to 3 specialists.</li>
                    <li><span class="next-num">2</span> They confirm the details and a fixed price - no obligation.</li>
                    <li><span class="next-num">3</span> Choose your date and the work is booked in.</li>
                  </ol>
                </div>

                <!-- CTAs -->
                <div class="result-actions">
                  <button class="btn-primary" (click)="goToBooking()">Book a specialist</button>
                  <button class="btn-secondary" (click)="goToEngineers()">Compare engineers near me</button>
                </div>

                <!-- Email + restart -->
                <div class="result-foot">
                  <button class="link-btn" (click)="toggleEmailForm()">
                    <span [innerHTML]="icon('mail')"></span> {{ showEmailForm() ? 'Cancel' : 'Email me this quote' }}
                  </button>
                  <span class="foot-divider">·</span>
                  <button class="link-btn" (click)="restart()"><span [innerHTML]="icon('refresh')"></span> Start over</button>
                </div>
                @if (showEmailForm()) {
                  @if (emailSent()) {
                    <p class="email-sent"><span [innerHTML]="icon('check')"></span> Quote sent to {{ emailInput }}</p>
                  } @else {
                    <div class="email-row">
                      <input type="email" [(ngModel)]="emailInput" name="email" placeholder="you@email.com" />
                      <button class="btn-secondary btn-sm" (click)="sendEmail()">Send quote</button>
                    </div>
                  }
                }

                <p class="validity">This estimate is valid for 30 days · Ref ACT-Q{{ state().result!.id }}</p>
              </section>
            }
          </main>

          <!-- ── Sidebar ─────────────────────────────────────────────────── -->
          <aside class="quote-aside">
            @if (!state().result) {
              <div class="aside-card">
                <div class="aside-title">Your selection</div>
                @if (summary().length) {
                  <ul class="summary-list">
                    @for (row of summary(); track row.label) {
                      <li><span>{{ row.label }}</span><strong>{{ row.value }}</strong></li>
                    }
                  </ul>
                } @else {
                  <p class="aside-empty">Answer a few quick questions to build your instant estimate.</p>
                }
              </div>
            } @else {
              <div class="aside-card">
                <div class="aside-title">Quote summary</div>
                <ul class="summary-list">
                  @for (row of summary(); track row.label) {
                    <li><span>{{ row.label }}</span><strong>{{ row.value }}</strong></li>
                  }
                  <li><span>Reference</span><strong>ACT-Q{{ state().result!.id }}</strong></li>
                </ul>
              </div>
            }

            <div class="aside-card aside-trust">
              <div class="aside-title">Why quote with us</div>
              <ul class="trust-list">
                <li><span class="trust-ico" [innerHTML]="icon('check')"></span> 100% free &amp; no obligation</li>
                <li><span class="trust-ico" [innerHTML]="icon('shield')"></span> F-Gas certified engineers only</li>
                <li><span class="trust-ico" [innerHTML]="icon('pound')"></span> Fixed-price confidence</li>
                <li><span class="trust-ico" [innerHTML]="icon('clock')"></span> Takes under 2 minutes</li>
              </ul>
            </div>

            <div class="aside-help">
              <span class="help-ico" [innerHTML]="icon('phone')"></span>
              <div>
                <strong>Need a hand?</strong>
                <span>Call 0800 123 4567 · Mon–Sat 8am–8pm</span>
              </div>
            </div>
          </aside>

        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .quote-page { background: var(--bg); min-height: 100%; }
    .quote-shell { max-width: 1080px; margin: 0 auto; padding: 2rem 1rem 4rem; }

    /* Header */
    .quote-top-head { text-align: center; margin-bottom: 1.75rem; }
    .quote-top-head h1 { font-size: clamp(1.5rem, 4vw, 2.1rem); margin-bottom: 0.4rem; }
    .quote-top-sub { color: var(--text-secondary); font-size: 0.98rem; max-width: 520px; margin: 0 auto; }

    /* Stepper */
    .stepper { list-style: none; display: flex; align-items: flex-start; justify-content: space-between; gap: 0.25rem; padding: 0; margin: 0 auto 2rem; max-width: 720px; position: relative; }
    .stepper-node { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 0.4rem; position: relative; text-align: center; }
    .stepper-node::before { content: ''; position: absolute; top: 15px; left: -50%; width: 100%; height: 2px; background: var(--border); z-index: 0; }
    .stepper-node:first-child::before { display: none; }
    .stepper-node.is-done::before, .stepper-node.is-active::before { background: var(--brand); }
    .stepper-dot { position: relative; z-index: 1; width: 32px; height: 32px; border-radius: 50%; background: var(--surface); border: 2px solid var(--border); color: var(--text-muted); font-size: 0.82rem; font-weight: 700; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
    .stepper-node.is-active .stepper-dot { border-color: var(--brand); color: var(--brand); box-shadow: 0 0 0 4px var(--brand-light); }
    .stepper-node.is-done .stepper-dot { background: var(--brand); border-color: var(--brand); color: #fff; }
    .stepper-check { display: inline-flex; }
    .stepper-check svg { width: 16px; height: 16px; }
    .stepper-label { font-size: 0.72rem; font-weight: 600; color: var(--text-muted); max-width: 80px; line-height: 1.2; }
    .stepper-node.is-active .stepper-label { color: var(--text-primary); }

    /* Layout */
    .quote-layout { display: grid; grid-template-columns: 1fr; gap: 1.5rem; align-items: start; }
    .quote-main { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); box-shadow: var(--shadow-md); padding: 1.75rem 1.5rem; }

    .quote-loading { text-align: center; padding: 3rem 1rem; color: var(--text-secondary); }
    .loading-spinner { width: 40px; height: 40px; border: 3px solid var(--border); border-top-color: var(--brand); border-radius: 50%; animation: spin 0.7s linear infinite; margin: 0 auto 1rem; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .step-title { font-size: 1.3rem; margin-bottom: 0.35rem; }
    .step-hint { color: var(--text-secondary); font-size: 0.92rem; margin-bottom: 1.5rem; }

    /* Option cards (icon list) */
    .opt-list { display: flex; flex-direction: column; gap: 0.65rem; }
    .opt-list-2col { display: grid; grid-template-columns: 1fr 1fr; }
    .opt-card {
      display: flex; align-items: center; gap: 0.9rem;
      width: 100%; text-align: left; cursor: pointer;
      padding: 0.95rem 1rem; background: var(--surface);
      border: 1.5px solid var(--border); border-radius: var(--radius-md);
      transition: border-color 0.15s, background 0.15s, box-shadow 0.15s, transform 0.1s;
    }
    .opt-card:hover { border-color: var(--brand); background: var(--brand-light); box-shadow: var(--shadow-sm); }
    .opt-card.selected { border-color: var(--brand); background: var(--brand-light); }
    .opt-card:active { transform: scale(0.995); }
    .opt-card-compact { flex-direction: column; text-align: center; gap: 0.55rem; padding: 1.25rem 0.75rem; }
    .opt-ico { width: 44px; height: 44px; flex-shrink: 0; border-radius: 12px; background: var(--brand-light); color: var(--brand); display: flex; align-items: center; justify-content: center; }
    .opt-ico svg { width: 22px; height: 22px; }
    .opt-body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 0.1rem; }
    .opt-label { font-weight: 600; font-size: 0.98rem; color: var(--text-primary); }
    .opt-desc { font-size: 0.82rem; color: var(--text-muted); }
    .opt-arrow { color: var(--text-muted); flex-shrink: 0; display: flex; }
    .opt-arrow svg { width: 18px; height: 18px; }
    .opt-card:hover .opt-arrow { color: var(--brand); }

    /* Tiles (units / room size) */
    .tile-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.65rem; }
    .tile { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 0.2rem; padding: 1.25rem 0.75rem; cursor: pointer; background: var(--surface); border: 1.5px solid var(--border); border-radius: var(--radius-md); transition: all 0.15s; }
    .tile:hover { border-color: var(--brand); background: var(--brand-light); }
    .tile.selected { border-color: var(--brand); background: var(--brand-light); box-shadow: 0 0 0 3px var(--brand-light); }
    .tile-num { font-size: 2rem; font-weight: 800; color: var(--brand); line-height: 1.1; }
    .tile-area { font-size: 1.2rem; font-weight: 800; color: var(--brand); line-height: 1.2; }
    .tile-label { font-weight: 600; font-size: 0.92rem; color: var(--text-primary); }
    .tile-desc { font-size: 0.76rem; color: var(--text-muted); }

    /* Brand cards */
    .brand-list { display: flex; flex-direction: column; gap: 0.75rem; }
    .brand-card { display: flex; gap: 0.9rem; align-items: flex-start; text-align: left; width: 100%; cursor: pointer; padding: 1.1rem; background: var(--surface); border: 1.5px solid var(--border); border-radius: var(--radius-md); transition: all 0.15s; }
    .brand-card:hover { border-color: var(--brand); background: var(--brand-light); }
    .brand-card.selected { border-color: var(--brand); background: var(--brand-light); box-shadow: 0 0 0 3px var(--brand-light); }
    .brand-ico { width: 42px; height: 42px; flex-shrink: 0; border-radius: 12px; background: var(--surface); border: 1px solid var(--border); color: var(--brand); display: flex; align-items: center; justify-content: center; }
    .brand-ico svg { width: 22px; height: 22px; }
    .brand-main { flex: 1; min-width: 0; }
    .brand-head { display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.2rem; }
    .brand-head strong { font-size: 0.98rem; color: var(--text-primary); }
    .brand-range { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: var(--brand); background: var(--surface); border: 1px solid var(--border); padding: 0.1rem 0.5rem; border-radius: 999px; }
    .brand-desc { display: block; font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.2rem; }
    .brand-examples { display: block; font-size: 0.78rem; color: var(--text-muted); }

    /* Field */
    .field-row { margin-top: 1.5rem; padding-top: 1.25rem; border-top: 1px solid var(--border); }
    .field-row label { font-size: 0.85rem; font-weight: 600; color: var(--text-primary); margin-bottom: 0.4rem; display: block; }
    .field-optional { color: var(--text-muted); font-weight: 400; }
    .postcode-input { max-width: 220px; text-transform: uppercase; }
    .field-hint { font-size: 0.78rem; color: var(--text-muted); margin-top: 0.4rem; }
    .error-msg { color: var(--danger); font-size: 0.85rem; margin-top: 0.6rem; }

    .step-back { display: inline-flex; align-items: center; gap: 0.35rem; margin-top: 1.5rem; background: none; border: none; color: var(--text-secondary); font-size: 0.88rem; font-weight: 500; cursor: pointer; padding: 0.4rem 0; }
    .step-back svg { width: 16px; height: 16px; }
    .step-back:hover { color: var(--brand); }

    /* ── Result ── */
    .result-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; margin-bottom: 1.25rem; }
    .pill { display: inline-flex; align-items: center; gap: 0.35rem; font-size: 0.72rem; font-weight: 700; padding: 0.25rem 0.7rem; border-radius: 999px; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 0.6rem; }
    .pill svg { width: 13px; height: 13px; }
    .pill-ok { background: var(--success-bg); color: var(--success); }
    .pill-urgent { background: #fee2e2; color: #991b1b; }
    .result-title { font-size: 1.4rem; margin-bottom: 0.3rem; }
    .result-meta { font-size: 0.85rem; color: var(--text-muted); }
    .quote-ref { font-size: 0.72rem; font-family: ui-monospace, monospace; color: var(--text-muted); background: var(--bg); border: 1px solid var(--border); padding: 0.3rem 0.6rem; border-radius: var(--radius-sm); white-space: nowrap; flex-shrink: 0; }

    .price-band { display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap; background: var(--grad-hero); color: #fff; border-radius: var(--radius-lg); padding: 1.4rem 1.6rem; margin-bottom: 1.25rem; }
    .price-band-label { display: block; font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: rgba(255,255,255,0.7); margin-bottom: 0.3rem; }
    .price-range { font-size: 2.1rem; font-weight: 800; line-height: 1.1; color: #fff; }
    .price-dash { margin: 0 0.25rem; color: rgba(255,255,255,0.6); }
    .price-finance { text-align: right; }
    .finance-from { display: block; font-size: 1.05rem; color: #fff; }
    .finance-from strong { color: var(--accent); font-weight: 800; }
    .finance-note { font-size: 0.72rem; color: rgba(255,255,255,0.6); }

    .panel { border: 1px solid var(--border); border-radius: var(--radius-md); padding: 1.1rem 1.2rem; margin-bottom: 1rem; }
    .panel-title { font-size: 0.72rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 0.75rem; }
    .panel-title-note { color: var(--text-muted); font-weight: 500; text-transform: none; letter-spacing: 0; }
    .bd-row { display: flex; justify-content: space-between; gap: 1rem; padding: 0.5rem 0; border-bottom: 1px solid var(--border); font-size: 0.88rem; }
    .bd-row span:first-child { color: var(--text-secondary); }
    .bd-row span:last-child { font-weight: 600; white-space: nowrap; }
    .bd-vat span { color: var(--text-muted) !important; font-weight: 400 !important; font-size: 0.82rem; }
    .bd-total { display: flex; justify-content: space-between; padding-top: 0.75rem; font-weight: 700; }
    .bd-total span:last-child { color: var(--brand); }

    .inc-list { list-style: none; padding: 0; display: grid; gap: 0.5rem; }
    .inc-list li { display: flex; align-items: flex-start; gap: 0.55rem; font-size: 0.88rem; color: var(--text-primary); }
    .inc-tick { color: var(--success); flex-shrink: 0; margin-top: 0.05rem; display: inline-flex; }
    .inc-tick svg { width: 16px; height: 16px; }

    .notice { display: flex; gap: 0.65rem; background: #fffbeb; border: 1px solid #fcd34d; border-radius: var(--radius-md); padding: 0.85rem 1rem; font-size: 0.84rem; color: #78350f; margin-bottom: 1rem; line-height: 1.5; }
    .notice strong { color: #92400e; }
    .notice-ico { flex-shrink: 0; color: #b45309; display: inline-flex; }
    .notice-ico svg { width: 18px; height: 18px; }
    .notice-warn { background: #fef2f2; border-color: #fca5a5; color: #991b1b; }
    .notice-warn strong { color: #991b1b; }
    .notice-warn .notice-ico { color: #dc2626; }

    .btu-note { font-size: 0.84rem; color: var(--text-muted); margin-bottom: 1rem; }

    .next-panel { background: var(--bg); border-color: var(--border); }
    .next-list { list-style: none; padding: 0; display: grid; gap: 0.7rem; }
    .next-list li { display: flex; align-items: flex-start; gap: 0.65rem; font-size: 0.88rem; color: var(--text-primary); }
    .next-num { width: 22px; height: 22px; flex-shrink: 0; border-radius: 50%; background: var(--brand); color: #fff; font-size: 0.74rem; font-weight: 700; display: flex; align-items: center; justify-content: center; }

    .result-actions { display: grid; gap: 0.65rem; margin-bottom: 1.1rem; }
    .result-foot { display: flex; align-items: center; justify-content: center; gap: 0.6rem; flex-wrap: wrap; }
    .link-btn { display: inline-flex; align-items: center; gap: 0.35rem; background: none; border: none; cursor: pointer; color: var(--brand); font-size: 0.86rem; font-weight: 600; padding: 0.3rem 0; }
    .link-btn svg { width: 16px; height: 16px; }
    .link-btn:hover { text-decoration: underline; }
    .foot-divider { color: var(--text-muted); }
    .email-row { display: flex; gap: 0.5rem; margin-top: 0.75rem; flex-wrap: wrap; }
    .email-row input { flex: 1; min-width: 180px; }
    .email-sent { display: inline-flex; align-items: center; gap: 0.4rem; margin-top: 0.75rem; color: var(--success); font-size: 0.88rem; font-weight: 600; justify-content: center; width: 100%; }
    .email-sent svg { width: 16px; height: 16px; }
    .validity { text-align: center; font-size: 0.76rem; color: var(--text-muted); margin-top: 1.25rem; }

    /* ── Sidebar ── */
    .quote-aside { display: flex; flex-direction: column; gap: 1rem; }
    .aside-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); padding: 1.25rem; }
    .aside-title { font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-muted); margin-bottom: 0.85rem; }
    .aside-empty { font-size: 0.88rem; color: var(--text-secondary); line-height: 1.5; }
    .summary-list { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 0.55rem; }
    .summary-list li { display: flex; justify-content: space-between; gap: 0.75rem; font-size: 0.86rem; padding-bottom: 0.55rem; border-bottom: 1px solid var(--border); }
    .summary-list li:last-child { border-bottom: none; padding-bottom: 0; }
    .summary-list span { color: var(--text-muted); }
    .summary-list strong { color: var(--text-primary); font-weight: 600; text-align: right; }
    .trust-list { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 0.65rem; }
    .trust-list li { display: flex; align-items: center; gap: 0.6rem; font-size: 0.86rem; color: var(--text-primary); }
    .trust-ico { width: 26px; height: 26px; flex-shrink: 0; border-radius: 8px; background: var(--brand-light); color: var(--brand); display: inline-flex; align-items: center; justify-content: center; }
    .trust-ico svg { width: 15px; height: 15px; }
    .aside-help { display: flex; align-items: center; gap: 0.7rem; background: var(--ink); color: #fff; border-radius: var(--radius-lg); padding: 1rem 1.1rem; }
    .help-ico { width: 36px; height: 36px; flex-shrink: 0; border-radius: 10px; background: rgba(255,255,255,0.1); color: var(--accent); display: inline-flex; align-items: center; justify-content: center; }
    .help-ico svg { width: 18px; height: 18px; }
    .aside-help strong { display: block; font-size: 0.88rem; }
    .aside-help span { font-size: 0.78rem; color: rgba(255,255,255,0.65); }

    /* ── Tablet / desktop ── */
    @media (min-width: 640px) {
      .opt-list-2col { grid-template-columns: repeat(3, 1fr); }
      .tile-grid { grid-template-columns: repeat(4, 1fr); }
      .result-actions { grid-template-columns: 1fr 1fr; }
    }
    @media (min-width: 920px) {
      .quote-layout { grid-template-columns: 1fr 320px; }
      .quote-aside { position: sticky; top: 80px; }
      .opt-list-2col { grid-template-columns: 1fr 1fr; }
    }
    @media (max-width: 520px) {
      .stepper-label { display: none; }
      .stepper { max-width: 320px; }
    }
  `]
})
export class QuoteComponent {
  private quoteService = inject(QuoteService);
  private router       = inject(Router);
  private sanitizer    = inject(DomSanitizer);

  loading       = signal(false);
  error         = signal<string | null>(null);
  showEmailForm = signal(false);
  emailSent     = signal(false);

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

  /** Stepper node labels - depend on the chosen path. */
  stepper = computed(() => {
    if (this.isIR())        return ['Job type', 'Rooms', 'Room size', 'Property', 'Preferences', 'Your quote'];
    if (this.isService())   return ['Job type', 'Service', 'Property', 'Your quote'];
    if (this.isEmergency()) return ['Job type', 'Problem', 'Property', 'Your quote'];
    return ['Job type', 'Details', 'Property', 'Your quote'];
  });
  activeIndex = computed(() => {
    if (this.state().result) return this.stepper().length - 1;
    return this.state().step - 1;
  });

  monthlyFrom = computed(() => Math.round((this.state().result?.totalLow ?? 0) / 24));

  brandLabel    = computed(() => {
    const m: Record<string,string> = { budget: 'budget-range', mid: 'mid-range', premium: 'premium' };
    return m[this.state().brandTier ?? ''] ?? '';
  });
  propLabel     = computed(() => this.propertyTypes.find(p => p.value === this.state().propertyType)?.label ?? '');
  svcLabel      = computed(() => this.serviceTypes.find(s => s.value === this.state().serviceJobType)?.label ?? 'service');
  faultLabel    = computed(() => this.faultTypes.find(f => f.value === this.state().faultType)?.label ?? '');
  roomSizeLabel = computed(() => this.roomSizes.find(r => r.value === this.state().roomSize)?.label?.toLowerCase() ?? 'room');
  jobLabel      = computed(() => this.jobTypes.find(j => j.value === this.state().jobType)?.label ?? '');

  /** Live "Your selection" rows for the sidebar. */
  summary = computed(() => {
    const s = this.state();
    const rows: { label: string; value: string }[] = [];
    if (s.jobType)  rows.push({ label: 'Job', value: this.jobLabel() });
    if (this.isIR()) {
      if (s.step > 2 || s.result) rows.push({ label: 'Rooms', value: `${s.unitCount}${s.unitCount === 4 ? '+' : ''}` });
      if (s.roomSize)             rows.push({ label: 'Room size', value: this.roomSizes.find(r => r.value === s.roomSize)?.label ?? '' });
      if (s.propertyType)         rows.push({ label: 'Property', value: this.propLabel() });
      if (s.brandTier)            rows.push({ label: 'Preference', value: this.brandTiers.find(b => b.value === s.brandTier)?.label ?? '' });
    } else if (this.isService()) {
      if (s.serviceJobType) rows.push({ label: 'Service', value: this.svcLabel() });
      if (s.propertyType)   rows.push({ label: 'Property', value: this.propLabel() });
    } else if (this.isEmergency()) {
      if (s.faultType)    rows.push({ label: 'Problem', value: this.faultLabel() });
      if (s.propertyType) rows.push({ label: 'Property', value: this.propLabel() });
    }
    if (s.postcodeArea) rows.push({ label: 'Postcode', value: s.postcodeArea.toUpperCase() });
    return rows;
  });

  // ── Icons (inline SVG, sanitized once) ───────────────────────────────────────
  private rawIcons: Record<string, string> = {
    install:   '<path d="M12 2v20M2 12h20M5 5l14 14M5 19 19 5"/>',
    replace:   '<path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/><path d="M3 21v-5h5"/>',
    service:   '<path d="M14.5 6.5a3.5 3.5 0 0 0-4.6 4.6l-6.4 6.4 2 2 6.4-6.4a3.5 3.5 0 0 0 4.6-4.6l-2.3 2.3-2-2 2.3-2.3z"/>',
    emergency: '<path d="M12 3 2 20h20L12 3z"/><path d="M12 9v5"/><path d="M12 17h.01"/>',
    annual:    '<path d="M9 4H7a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="3" rx="1"/><path d="M9 14l2 2 4-4"/>',
    clean:     '<path d="M12 3s5 5.5 5 9a5 5 0 0 1-10 0c0-3.5 5-9 5-9z"/>',
    repair:    '<path d="M14.5 6.5a3.5 3.5 0 0 0-4.6 4.6l-6.4 6.4 2 2 6.4-6.4a3.5 3.5 0 0 0 4.6-4.6l-2.3 2.3-2-2 2.3-2.3z"/>',
    thermo:    '<path d="M14 14.8V5a2 2 0 0 0-4 0v9.8a4 4 0 1 0 4 0z"/>',
    zap:       '<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z"/>',
    droplet:   '<path d="M12 3s6 6.5 6 10a6 6 0 0 1-12 0c0-3.5 6-10 6-10z"/>',
    noise:     '<path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M17 8a5 5 0 0 1 0 8"/>',
    flat:      '<rect x="5" y="3" width="14" height="18" rx="1"/><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2"/>',
    house:     '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
    commercial:'<path d="M3 21h18"/><rect x="5" y="3" width="14" height="18" rx="1"/><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2"/>',
    tag:       '<path d="M3 12 11.5 3.5a2 2 0 0 1 1.4-.5H20a1 1 0 0 1 1 1v7.1a2 2 0 0 1-.5 1.4L12 21z"/><circle cx="16" cy="8" r="1.3"/>',
    star:      '<path d="M12 3l2.7 5.5 6 .9-4.3 4.2 1 6L12 18.8 6.6 21.6l1-6L3.3 9.4l6-.9z"/>',
    trophy:    '<path d="M8 4h8v4a4 4 0 0 1-8 0V4z"/><path d="M8 6H5v1a3 3 0 0 0 3 3M16 6h3v1a3 3 0 0 1-3 3"/><path d="M10 15h4v3h-4z"/><path d="M8 21h8M12 18v3"/>',
    check:     '<path d="M20 6 9 17l-5-5"/>',
    chevron:   '<path d="M9 6l6 6-6 6"/>',
    back:      '<path d="M19 12H5M12 19l-7-7 7-7"/>',
    shield:    '<path d="M12 3l7 3v6c0 4-3 7-7 9-4-2-7-5-7-9V6z"/><path d="M9 12l2 2 4-4"/>',
    clock:     '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    info:      '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
    pound:     '<path d="M9 21h8M7 13h7M9 21c2-2 2-3 2-6 0-2.5-1-4-1-6a3 3 0 0 1 5.5-1.7"/>',
    mail:      '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
    phone:     '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L20 13l2 5v2a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1z"/>',
  };
  private safeIcons: Record<string, SafeHtml> = {};
  icon(key: string): SafeHtml {
    if (!this.safeIcons[key]) {
      const body = this.rawIcons[key] ?? '';
      this.safeIcons[key] = this.sanitizer.bypassSecurityTrustHtml(
        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`
      );
    }
    return this.safeIcons[key];
  }

  jobTypes = [
    { value: 'install',   label: 'New installation',      desc: 'No existing AC system',              icon: 'install' },
    { value: 'replace',   label: 'Replace existing',       desc: 'Like-for-like or upgrade',           icon: 'replace' },
    { value: 'service',   label: 'Service / maintenance',  desc: 'Annual check, repair or deep clean', icon: 'service' },
    { value: 'emergency', label: 'Emergency repair',       desc: 'System down - urgent response',      icon: 'emergency' },
  ];

  unitCounts = [
    { value: 1, label: '1 room',  desc: 'Single split'        },
    { value: 2, label: '2 rooms', desc: 'Multi or 2×single'   },
    { value: 3, label: '3 rooms', desc: 'Multi-split'         },
    { value: 4, label: 'rooms',   desc: 'VRF / large multi'   },
  ];

  roomSizes = [
    { value: 'small',  label: 'Small',      area: '≤20m²',  desc: 'Bedroom, study' },
    { value: 'medium', label: 'Medium',     area: '20–35m²', desc: 'Living room' },
    { value: 'large',  label: 'Large',      area: '35–60m²', desc: 'Open plan' },
    { value: 'xlarge', label: 'Very large', area: '60m²+',  desc: 'Whole floor' },
  ];

  propertyTypes = [
    { value: 'flat',  label: 'Flat / apartment',   icon: 'flat' },
    { value: 'terr',  label: 'Terraced house',      icon: 'house' },
    { value: 'semi',  label: 'Semi-detached',       icon: 'house' },
    { value: 'det',   label: 'Detached house',      icon: 'house' },
    { value: 'comm',  label: 'Commercial / office', icon: 'commercial' },
  ];

  serviceTypes = [
    { value: 'annual', label: 'Annual service',     desc: 'Filter clean, gas check, performance test', icon: 'annual' },
    { value: 'strip',  label: 'Deep clean',         desc: 'Full internal strip and chemical clean',    icon: 'clean' },
    { value: 'repair', label: 'Non-urgent repair',  desc: 'Specific fault, booked in advance',         icon: 'repair' },
  ];

  faultTypes = [
    { value: 'not-cooling', label: 'Not cooling / heating', desc: 'Running but no output',             icon: 'thermo' },
    { value: 'wont-start',  label: 'Won\'t turn on',        desc: 'No power or not responding',        icon: 'zap' },
    { value: 'leaking',     label: 'Water leaking',         desc: 'Visible dripping from indoor unit', icon: 'droplet' },
    { value: 'noise',       label: 'Loud or strange noise', desc: 'Rattling, grinding or hissing',     icon: 'noise' },
  ];

  brandTiers = [
    { value: 'budget',  label: 'Budget-friendly', icon: 'tag',    priceRange: 'lower cost',     desc: 'Good quality, functional units at a lower upfront investment',           examples: 'Gree, Midea, Haier' },
    { value: 'mid',     label: 'Mid-range',       icon: 'star',   priceRange: 'popular choice',  desc: 'Reliable brands with strong after-sales support and parts availability', examples: 'LG, Samsung, Panasonic, Toshiba' },
    { value: 'premium', label: 'Premium',         icon: 'trophy', priceRange: 'best efficiency', desc: 'Market-leading efficiency, quieter operation and longer warranties',     examples: 'Daikin, Mitsubishi Electric, Fujitsu, Hitachi' },
  ];

  // ── Navigation ──────────────────────────────────────────────────────────────

  selectJob(value: string) {
    this.state.update(s => ({ ...s, jobType: value }));
    setTimeout(() => this.state.update(s => ({ ...s, step: 2 })), 180);
  }

  selectUnitCount(value: number) {
    this.state.update(s => ({ ...s, unitCount: value }));
    setTimeout(() => this.state.update(s => ({ ...s, step: 3 })), 180);
  }

  selectRoomSize(value: string) {
    const m2: Record<string, number> = { small: 15, medium: 28, large: 48, xlarge: 70 };
    this.state.update(s => ({ ...s, roomSize: value, roomSizeM2: m2[value] ?? 25 }));
    setTimeout(() => this.state.update(s => ({ ...s, step: 4 })), 180);
  }

  selectProperty(value: string) {
    this.state.update(s => ({ ...s, propertyType: value, postcodeArea: this.postcodeInput }));
    if (this.isIR()) {
      setTimeout(() => this.state.update(s => ({ ...s, step: 5 })), 180);
    } else {
      setTimeout(() => this.calculate(), 180);
    }
  }

  selectServiceType(value: string) {
    this.state.update(s => ({ ...s, serviceJobType: value }));
    setTimeout(() => this.state.update(s => ({ ...s, step: 3 })), 180);
  }

  selectFaultType(value: string) {
    this.state.update(s => ({ ...s, faultType: value }));
    setTimeout(() => this.state.update(s => ({ ...s, step: 3 })), 180);
  }

  selectBrand(value: string) {
    this.state.update(s => ({ ...s, brandTier: value, postcodeArea: this.postcodeInput }));
    setTimeout(() => this.calculate(), 180);
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

  toggleEmailForm() { this.showEmailForm.update(v => !v); this.emailSent.set(false); }

  sendEmail() { if (this.emailInput.trim()) this.emailSent.set(true); }

  restart() {
    this.postcodeInput = '';
    this.emailInput    = '';
    this.showEmailForm.set(false);
    this.emailSent.set(false);
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
