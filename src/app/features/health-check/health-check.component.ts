import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { HealthCheckState, HealthCheckResult, SystemScore } from '../../core/models/models';

@Component({
  selector: 'app-health-check',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="hc-page">
      <div class="hc-shell">

        <!-- Header + stepper -->
        <header class="hc-top">
          <div class="hc-top-head">
            <span class="eyebrow">Free AC health check</span>
            <h1>How healthy is your air conditioning?</h1>
            <p class="hc-top-sub">Answer 4 quick questions for an instant, honest assessment of your system - no obligation.</p>
          </div>

          <ol class="stepper" [attr.aria-label]="'Step ' + (activeIndex()+1) + ' of ' + stepper().length">
            @for (node of stepper(); track node; let i = $index) {
              <li class="stepper-node" [class.is-done]="i < activeIndex()" [class.is-active]="i === activeIndex()">
                <span class="stepper-dot">
                  @if (i < activeIndex()) {
                    <span class="stepper-check" [innerHTML]="icon('check')"></span>
                  } @else { {{ i + 1 }} }
                </span>
                <span class="stepper-label">{{ node }}</span>
              </li>
            }
          </ol>
        </header>

        <div class="hc-layout">

          <!-- ── Main column ─────────────────────────────────────────────── -->
          <main class="hc-main">

            <!-- Step 1: System age -->
            @if (state().step === 1) {
              <section class="step">
                <h2 class="step-title">How old is your AC system?</h2>
                <p class="step-hint">Age is the biggest factor in service frequency and efficiency.</p>
                <div class="opt-list">
                  @for (opt of ageOptions; track opt.value) {
                    <button class="opt-card" (click)="select('systemAge', opt.value)">
                      <span class="opt-ico" [class]="'tone-' + opt.tone" [innerHTML]="icon(opt.icon)"></span>
                      <span class="opt-body">
                        <span class="opt-label">{{ opt.label }}</span>
                        <span class="opt-desc">{{ opt.hint }}</span>
                      </span>
                      <span class="opt-arrow" [innerHTML]="icon('chevron')"></span>
                    </button>
                  }
                </div>
              </section>
            }

            <!-- Step 2: Last serviced -->
            @if (state().step === 2) {
              <section class="step">
                <h2 class="step-title">When was it last professionally serviced?</h2>
                <p class="step-hint">Manufacturers recommend an annual service to keep warranty and efficiency.</p>
                <div class="opt-list">
                  @for (opt of servicedOptions; track opt.value) {
                    <button class="opt-card" (click)="select('lastServiced', opt.value)">
                      <span class="opt-ico" [class]="'tone-' + opt.tone" [innerHTML]="icon(opt.icon)"></span>
                      <span class="opt-body">
                        <span class="opt-label">{{ opt.label }}</span>
                        <span class="opt-desc">{{ opt.hint }}</span>
                      </span>
                      <span class="opt-arrow" [innerHTML]="icon('chevron')"></span>
                    </button>
                  }
                </div>
                <button class="step-back" (click)="back()"><span [innerHTML]="icon('back')"></span> Back</button>
              </section>
            }

            <!-- Step 3: Issues noticed (multi-select) -->
            @if (state().step === 3) {
              <section class="step">
                <h2 class="step-title">Any of these sound familiar?</h2>
                <p class="step-hint">Select all that apply - or "no issues" if everything seems fine.</p>
                <div class="check-grid">
                  @for (opt of issueOptions; track opt.value) {
                    <button class="check-card"
                      [class.selected]="state().issues.includes(opt.value)"
                      (click)="toggleIssue(opt.value)">
                      <span class="check-box">
                        @if (state().issues.includes(opt.value)) {
                          <span [innerHTML]="icon('check')"></span>
                        }
                      </span>
                      <span class="check-ico" [innerHTML]="icon(opt.icon)"></span>
                      <span class="check-label">{{ opt.label }}</span>
                    </button>
                  }
                </div>
                <button class="btn-primary hc-continue" (click)="advanceStep()">Continue</button>
                <button class="step-back" (click)="back()"><span [innerHTML]="icon('back')"></span> Back</button>
              </section>
            }

            <!-- Step 4: Energy bills -->
            @if (state().step === 4) {
              <section class="step">
                <h2 class="step-title">Have your energy bills increased lately?</h2>
                <p class="step-hint">A dirty or underperforming unit can use up to 30% more energy.</p>
                <div class="opt-list">
                  @for (opt of energyOptions; track opt.value) {
                    <button class="opt-card" (click)="selectEnergy(opt.value)">
                      <span class="opt-ico" [class]="'tone-' + opt.tone" [innerHTML]="icon(opt.icon)"></span>
                      <span class="opt-body">
                        <span class="opt-label">{{ opt.label }}</span>
                        <span class="opt-desc">{{ opt.hint }}</span>
                      </span>
                      <span class="opt-arrow" [innerHTML]="icon('chevron')"></span>
                    </button>
                  }
                </div>
                <button class="step-back" (click)="back()"><span [innerHTML]="icon('back')"></span> Back</button>
              </section>
            }

            <!-- ── Result ────────────────────────────────────────────────── -->
            @if (state().step === 5 && state().result) {
              <section class="result">
                <div class="score-row">
                  <div class="score-ring" [class]="'score-' + state().result!.score">
                    <span class="score-icon" [innerHTML]="icon(scoreIcon(state().result!.score))"></span>
                  </div>
                  <div class="score-text">
                    <span class="score-tag" [class]="'tag-' + state().result!.score">{{ state().result!.scoreLabel }}</span>
                    <h2 class="result-headline">{{ state().result!.headline }}</h2>
                  </div>
                </div>

                <p class="result-detail">{{ state().result!.detail }}</p>

                @if (state().result!.energySavingEstimate) {
                  <div class="saving-banner">
                    <span class="saving-ico" [innerHTML]="icon('pound')"></span>
                    <div>
                      <strong>Potential energy saving</strong>
                      <p>{{ state().result!.energySavingEstimate }}</p>
                    </div>
                  </div>
                }

                <div class="result-actions">
                  @if (state().result!.suggestedAction === 'book-service' || state().result!.suggestedAction === 'book-emergency') {
                    <a routerLink="/quote" class="btn-primary">{{ state().result!.actionLabel }}</a>
                  }
                  @if (state().result!.suggestedAction === 'book-plan') {
                    <a routerLink="/service-plans" class="btn-primary">{{ state().result!.actionLabel }}</a>
                  }
                  <a routerLink="/engineers" class="btn-secondary">Browse engineers</a>
                </div>

                <div class="panel">
                  <div class="panel-title">Your answers</div>
                  <ul class="summary-list">
                    <li><span>System age</span><strong>{{ ageLabel(state().systemAge) }}</strong></li>
                    <li><span>Last serviced</span><strong>{{ servicedLabel(state().lastServiced) }}</strong></li>
                    <li><span>Symptoms</span><strong>{{ issuesSummary() }}</strong></li>
                    <li><span>Energy bills</span><strong>{{ energyLabel(state().energyBillIncrease) }}</strong></li>
                  </ul>
                </div>

                <div class="result-foot">
                  <button class="link-btn" (click)="restart()"><span [innerHTML]="icon('refresh')"></span> Start over</button>
                </div>
                <p class="disclaimer">This is a guideline assessment based on your answers, not a substitute for an on-site inspection.</p>
              </section>
            }
          </main>

          <!-- ── Sidebar ─────────────────────────────────────────────────── -->
          <aside class="hc-aside">
            <div class="aside-card">
              <div class="aside-title">Your answers</div>
              @if (answers().length) {
                <ul class="summary-list">
                  @for (row of answers(); track row.label) {
                    <li><span>{{ row.label }}</span><strong>{{ row.value }}</strong></li>
                  }
                </ul>
              } @else {
                <p class="aside-empty">Answer a few questions to get your instant health score.</p>
              }
            </div>

            <div class="aside-card aside-trust">
              <div class="aside-title">Honest by design</div>
              <ul class="trust-list">
                <li><span class="trust-ico" [innerHTML]="icon('clock')"></span> Takes under 60 seconds</li>
                <li><span class="trust-ico" [innerHTML]="icon('check')"></span> 100% free, no obligation</li>
                <li><span class="trust-ico" [innerHTML]="icon('shield')"></span> No hard sell - straight advice</li>
                <li><span class="trust-ico" [innerHTML]="icon('leaf')"></span> Cut energy use up to 30%</li>
              </ul>
            </div>

            <div class="aside-help">
              <span class="help-ico" [innerHTML]="icon('phone')"></span>
              <div>
                <strong>Prefer to talk?</strong>
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
    .hc-page { background: var(--bg); min-height: 100%; }
    .hc-shell { max-width: 1080px; margin: 0 auto; padding: 2rem 1rem 4rem; }

    /* Header */
    .hc-top-head { text-align: center; margin-bottom: 1.75rem; }
    .hc-top-head h1 { font-size: clamp(1.5rem, 4vw, 2.1rem); margin-bottom: 0.4rem; }
    .hc-top-sub { color: var(--text-secondary); font-size: 0.98rem; max-width: 520px; margin: 0 auto; }

    /* Stepper */
    .stepper { list-style: none; display: flex; align-items: flex-start; justify-content: space-between; gap: 0.25rem; padding: 0; margin: 0 auto 2rem; max-width: 640px; }
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
    .hc-layout { display: grid; grid-template-columns: 1fr; gap: 1.5rem; align-items: start; }
    .hc-main { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); box-shadow: var(--shadow-md); padding: 1.75rem 1.5rem; }

    .step-title { font-size: 1.3rem; margin-bottom: 0.35rem; }
    .step-hint { color: var(--text-secondary); font-size: 0.92rem; margin-bottom: 1.5rem; }

    /* Option cards */
    .opt-list { display: flex; flex-direction: column; gap: 0.65rem; }
    .opt-card { display: flex; align-items: center; gap: 0.9rem; width: 100%; text-align: left; cursor: pointer; padding: 0.95rem 1rem; background: var(--surface); border: 1.5px solid var(--border); border-radius: var(--radius-md); transition: border-color 0.15s, background 0.15s, box-shadow 0.15s, transform 0.1s; }
    .opt-card:hover { border-color: var(--brand); background: var(--brand-light); box-shadow: var(--shadow-sm); }
    .opt-card:active { transform: scale(0.995); }
    .opt-ico { width: 44px; height: 44px; flex-shrink: 0; border-radius: 12px; background: var(--brand-light); color: var(--brand); display: flex; align-items: center; justify-content: center; }
    .opt-ico svg { width: 22px; height: 22px; }
    .opt-ico.tone-good { background: var(--success-bg); color: var(--success); }
    .opt-ico.tone-warn { background: #fef3c7; color: #b45309; }
    .opt-ico.tone-bad  { background: #fee2e2; color: #dc2626; }
    .opt-body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 0.1rem; }
    .opt-label { font-weight: 600; font-size: 0.98rem; color: var(--text-primary); }
    .opt-desc { font-size: 0.82rem; color: var(--text-muted); }
    .opt-arrow { color: var(--text-muted); flex-shrink: 0; display: flex; }
    .opt-arrow svg { width: 18px; height: 18px; }
    .opt-card:hover .opt-arrow { color: var(--brand); }

    /* Multi-select check cards */
    .check-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.65rem; margin-bottom: 1.25rem; }
    .check-card { display: flex; align-items: center; gap: 0.65rem; text-align: left; cursor: pointer; padding: 0.85rem 0.9rem; background: var(--surface); border: 1.5px solid var(--border); border-radius: var(--radius-md); transition: all 0.15s; }
    .check-card:hover { border-color: var(--brand); }
    .check-card.selected { border-color: var(--brand); background: var(--brand-light); }
    .check-box { width: 22px; height: 22px; flex-shrink: 0; border-radius: 6px; border: 1.5px solid var(--border); background: var(--surface); display: flex; align-items: center; justify-content: center; color: #fff; }
    .check-card.selected .check-box { background: var(--brand); border-color: var(--brand); }
    .check-box svg { width: 14px; height: 14px; }
    .check-ico { color: var(--text-secondary); display: inline-flex; }
    .check-ico svg { width: 19px; height: 19px; }
    .check-card.selected .check-ico { color: var(--brand); }
    .check-label { font-size: 0.9rem; font-weight: 600; color: var(--text-primary); }

    .hc-continue { width: 100%; margin-bottom: 0.5rem; }
    .step-back { display: inline-flex; align-items: center; gap: 0.35rem; margin-top: 1.25rem; background: none; border: none; color: var(--text-secondary); font-size: 0.88rem; font-weight: 500; cursor: pointer; padding: 0.4rem 0; }
    .step-back svg { width: 16px; height: 16px; }
    .step-back:hover { color: var(--brand); }

    /* ── Result ── */
    .score-row { display: flex; align-items: center; gap: 1.1rem; margin-bottom: 1.1rem; }
    .score-ring { width: 76px; height: 76px; flex-shrink: 0; border-radius: 50%; border: 5px solid; display: flex; align-items: center; justify-content: center; }
    .score-ring svg { width: 32px; height: 32px; }
    .score-good { border-color: var(--success); background: var(--success-bg); color: var(--success); }
    .score-service-due { border-color: #d97706; background: #fef3c7; color: #b45309; }
    .score-urgent { border-color: var(--danger); background: #fee2e2; color: var(--danger); }
    .score-tag { display: inline-block; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; padding: 0.2rem 0.6rem; border-radius: 999px; margin-bottom: 0.4rem; }
    .tag-good { background: var(--success-bg); color: var(--success); }
    .tag-service-due { background: #fef3c7; color: #b45309; }
    .tag-urgent { background: #fee2e2; color: var(--danger); }
    .result-headline { font-size: 1.35rem; line-height: 1.25; }
    .result-detail { font-size: 0.95rem; color: var(--text-secondary); line-height: 1.65; margin-bottom: 1.25rem; }

    .saving-banner { display: flex; gap: 0.75rem; align-items: flex-start; background: #fffbeb; border: 1px solid #fcd34d; border-radius: var(--radius-md); padding: 1rem 1.1rem; margin-bottom: 1.25rem; }
    .saving-ico { width: 34px; height: 34px; flex-shrink: 0; border-radius: 10px; background: #fef3c7; color: #b45309; display: inline-flex; align-items: center; justify-content: center; }
    .saving-ico svg { width: 18px; height: 18px; }
    .saving-banner strong { font-size: 0.9rem; display: block; color: #92400e; }
    .saving-banner p { font-size: 0.85rem; color: #78350f; margin: 0.2rem 0 0; line-height: 1.5; }

    .result-actions { display: grid; gap: 0.65rem; margin-bottom: 1.25rem; }
    .panel { border: 1px solid var(--border); border-radius: var(--radius-md); padding: 1.1rem 1.2rem; margin-bottom: 1rem; }
    .panel-title { font-size: 0.72rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 0.75rem; }
    .summary-list { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 0.55rem; }
    .summary-list li { display: flex; justify-content: space-between; gap: 0.75rem; font-size: 0.86rem; padding-bottom: 0.55rem; border-bottom: 1px solid var(--border); }
    .summary-list li:last-child { border-bottom: none; padding-bottom: 0; }
    .summary-list span { color: var(--text-muted); }
    .summary-list strong { color: var(--text-primary); font-weight: 600; text-align: right; }

    .result-foot { text-align: center; }
    .link-btn { display: inline-flex; align-items: center; gap: 0.35rem; background: none; border: none; cursor: pointer; color: var(--brand); font-size: 0.86rem; font-weight: 600; padding: 0.3rem 0; }
    .link-btn svg { width: 16px; height: 16px; }
    .link-btn:hover { text-decoration: underline; }
    .disclaimer { text-align: center; font-size: 0.76rem; color: var(--text-muted); margin-top: 0.75rem; }

    /* ── Sidebar ── */
    .hc-aside { display: flex; flex-direction: column; gap: 1rem; }
    .aside-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); padding: 1.25rem; }
    .aside-title { font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-muted); margin-bottom: 0.85rem; }
    .aside-empty { font-size: 0.88rem; color: var(--text-secondary); line-height: 1.5; }
    .trust-list { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 0.65rem; }
    .trust-list li { display: flex; align-items: center; gap: 0.6rem; font-size: 0.86rem; color: var(--text-primary); }
    .trust-ico { width: 26px; height: 26px; flex-shrink: 0; border-radius: 8px; background: var(--brand-light); color: var(--brand); display: inline-flex; align-items: center; justify-content: center; }
    .trust-ico svg { width: 15px; height: 15px; }
    .aside-help { display: flex; align-items: center; gap: 0.7rem; background: var(--ink); color: #fff; border-radius: var(--radius-lg); padding: 1rem 1.1rem; }
    .help-ico { width: 36px; height: 36px; flex-shrink: 0; border-radius: 10px; background: rgba(255,255,255,0.1); color: var(--accent); display: inline-flex; align-items: center; justify-content: center; }
    .help-ico svg { width: 18px; height: 18px; }
    .aside-help strong { display: block; font-size: 0.88rem; }
    .aside-help span { font-size: 0.78rem; color: rgba(255,255,255,0.65); }

    @media (min-width: 640px) {
      .result-actions { grid-template-columns: 1fr 1fr; }
    }
    @media (min-width: 920px) {
      .hc-layout { grid-template-columns: 1fr 320px; }
      .hc-aside { position: sticky; top: 80px; }
    }
    @media (max-width: 520px) {
      .stepper-label { display: none; }
      .stepper { max-width: 320px; }
      .check-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class HealthCheckComponent {
  private sanitizer = inject(DomSanitizer);

  state = signal<HealthCheckState>({
    step: 1,
    systemAge: null,
    lastServiced: null,
    issues: [],
    energyBillIncrease: null,
    result: null
  });

  stepper = computed(() => ['System age', 'Last service', 'Symptoms', 'Energy', 'Result']);
  activeIndex = computed(() => this.state().result ? 4 : this.state().step - 1);

  /** Live answer rows for the sidebar. */
  answers = computed(() => {
    const s = this.state();
    const rows: { label: string; value: string }[] = [];
    if (s.systemAge)            rows.push({ label: 'System age', value: this.ageLabel(s.systemAge) });
    if (s.lastServiced)         rows.push({ label: 'Last service', value: this.servicedLabel(s.lastServiced) });
    if (s.step > 3 || s.result) rows.push({ label: 'Symptoms', value: this.issuesSummary() });
    if (s.energyBillIncrease)   rows.push({ label: 'Energy bills', value: this.energyLabel(s.energyBillIncrease) });
    return rows;
  });

  // ── Icons (inline SVG, sanitized once) ───────────────────────────────────────
  private rawIcons: Record<string, string> = {
    leaf:      '<path d="M4 20c0-8 6-14 16-15 0 10-6 16-14 16a6 6 0 0 1-2-1z"/><path d="M9 15c2-3 5-5 8-6"/>',
    check:     '<path d="M20 6 9 17l-5-5"/>',
    clock:     '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    alert:     '<path d="M12 3 2 20h20L12 3z"/><path d="M12 9v5"/><path d="M12 17h.01"/>',
    x:         '<path d="M18 6 6 18M6 6l12 12"/>',
    snowflake: '<path d="M12 2v20M2 12h20M5 5l14 14M5 19 19 5"/>',
    noise:     '<path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M17 8a5 5 0 0 1 0 8"/>',
    droplet:   '<path d="M12 3s6 6.5 6 10a6 6 0 0 1-12 0c0-3.5 6-10 6-10z"/>',
    wind:      '<path d="M3 8h10a3 3 0 1 0-3-3"/><path d="M3 12h15a3 3 0 1 1-3 3"/><path d="M3 16h8a2.5 2.5 0 1 1-2.5 2.5"/>',
    zap:       '<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z"/>',
    smile:     '<circle cx="12" cy="12" r="9"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><path d="M9 9h.01M15 9h.01"/>',
    flat:      '<path d="M5 12h14"/>',
    trendup:   '<path d="M3 17l6-6 4 4 7-7"/><path d="M17 7h4v4"/>',
    shield:    '<path d="M12 3l7 3v6c0 4-3 7-7 9-4-2-7-5-7-9V6z"/><path d="M9 12l2 2 4-4"/>',
    pound:     '<path d="M9 21h8M7 13h7M9 21c2-2 2-3 2-6 0-2.5-1-4-1-6a3 3 0 0 1 5.5-1.7"/>',
    phone:     '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L16 13l5 2v2a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1z"/>',
    back:      '<path d="M19 12H5M12 19l-7-7 7-7"/>',
    chevron:   '<path d="M9 6l6 6-6 6"/>',
    refresh:   '<path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/><path d="M3 21v-5h5"/>',
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

  ageOptions = [
    { value: 'new',    label: 'Under 2 years',  icon: 'leaf',  tone: 'good', hint: 'Practically brand new' },
    { value: 'mid',    label: '2 – 5 years',    icon: 'check', tone: 'good', hint: 'Prime working life' },
    { value: 'mature', label: '5 – 10 years',   icon: 'clock', tone: 'warn', hint: 'Service becomes critical' },
    { value: 'old',    label: 'Over 10 years',  icon: 'alert', tone: 'bad',  hint: 'Higher risk of breakdown' },
  ];

  servicedOptions = [
    { value: 'recent',  label: 'Within the last year', icon: 'check', tone: 'good', hint: 'Good - well maintained' },
    { value: 'overdue', label: '1 – 2 years ago',      icon: 'clock', tone: 'warn', hint: 'Service now recommended' },
    { value: 'long',    label: '2 – 3 years ago',      icon: 'alert', tone: 'bad',  hint: 'Efficiency likely reduced' },
    { value: 'never',   label: 'Never / not sure',     icon: 'x',     tone: 'bad',  hint: 'Action needed' },
  ];

  issueOptions = [
    { value: 'none',      label: 'No issues',       icon: 'smile' },
    { value: 'cooling',   label: 'Reduced cooling', icon: 'snowflake' },
    { value: 'noise',     label: 'Strange noise',   icon: 'noise' },
    { value: 'leak',      label: 'Water leak',      icon: 'droplet' },
    { value: 'smell',     label: 'Bad smell',       icon: 'wind' },
    { value: 'wontstart', label: 'Won\'t turn on',  icon: 'zap' },
  ];

  energyOptions = [
    { value: 'no',         label: 'No change',         icon: 'flat',    tone: 'good', hint: 'Bills seem normal' },
    { value: 'slightly',   label: 'Slightly higher',   icon: 'trendup', tone: 'warn', hint: 'Marginal increase' },
    { value: 'noticeably', label: 'Noticeably higher', icon: 'alert',   tone: 'bad',  hint: '10%+ increase likely' },
  ];

  select(field: 'systemAge' | 'lastServiced', value: string) {
    this.state.update(s => ({ ...s, [field]: value }));
    setTimeout(() => this.state.update(s => ({ ...s, step: s.step + 1 })), 180);
  }

  toggleIssue(value: string) {
    this.state.update(s => {
      const issues = s.issues.includes(value)
        ? s.issues.filter(i => i !== value)
        : [...s.issues.filter(i => i !== 'none'), value === 'none' ? 'none' : value];
      if (value === 'none') return { ...s, issues: ['none'] };
      return { ...s, issues: issues.filter(i => i !== 'none') };
    });
  }

  advanceStep() {
    this.state.update(s => ({ ...s, step: s.step + 1 }));
  }

  selectEnergy(value: string) {
    this.state.update(s => ({ ...s, energyBillIncrease: value }));
    setTimeout(() => {
      const result = this.calculateResult();
      this.state.update(s => ({ ...s, step: 5, result }));
    }, 180);
  }

  back() {
    this.state.update(s => ({ ...s, step: Math.max(1, s.step - 1) }));
  }

  restart() {
    this.state.set({ step: 1, systemAge: null, lastServiced: null, issues: [], energyBillIncrease: null, result: null });
  }

  private calculateResult(): HealthCheckResult {
    const s = this.state();
    let score = 0;

    // Age scoring
    if (s.systemAge === 'new') score += 0;
    else if (s.systemAge === 'mid') score += 1;
    else if (s.systemAge === 'mature') score += 2;
    else if (s.systemAge === 'old') score += 3;

    // Service history scoring
    if (s.lastServiced === 'recent') score += 0;
    else if (s.lastServiced === 'overdue') score += 2;
    else if (s.lastServiced === 'long') score += 3;
    else if (s.lastServiced === 'never') score += 4;

    // Issue scoring
    const hasNoIssues = s.issues.includes('none') || s.issues.length === 0;
    if (!hasNoIssues) {
      if (s.issues.includes('wontstart')) score += 5;
      else if (s.issues.includes('leak')) score += 4;
      else score += s.issues.length * 1.5;
    }

    // Energy scoring
    if (s.energyBillIncrease === 'slightly') score += 1;
    else if (s.energyBillIncrease === 'noticeably') score += 2;

    const urgent = s.issues.includes('wontstart') || s.issues.includes('leak');

    if (urgent || score >= 8) {
      const isEmergency = s.issues.includes('wontstart');
      return {
        score: 'urgent',
        scoreLabel: 'Urgent',
        headline: isEmergency ? 'Your system needs immediate attention.' : 'Your system is showing signs of serious strain.',
        detail: isEmergency
          ? 'An AC that won\'t start could be a refrigerant fault, electrical issue, or compressor failure. Don\'t wait - get an engineer to look at it now.'
          : 'The combination of age, service history, and the issues you\'ve described means your system is at real risk of a costly breakdown. A service now is far cheaper than an emergency repair.',
        energySavingEstimate: s.energyBillIncrease !== 'no'
          ? 'A full service on a system in this condition can reduce energy consumption by 20–30%, saving £100–£250/year on a typical home system.'
          : null,
        suggestedAction: isEmergency ? 'book-emergency' : 'book-service',
        actionLabel: isEmergency ? 'Book emergency repair' : 'Book a service now'
      };
    }

    if (score >= 4) {
      return {
        score: 'service-due',
        scoreLabel: 'Service due',
        headline: 'Your AC would benefit from a service soon.',
        detail: 'Your system is past the point where an annual service is overdue. Left unserviced, dirty filters and low refrigerant quietly drain efficiency and shorten the unit\'s lifespan.',
        energySavingEstimate: s.energyBillIncrease !== 'no'
          ? 'A service now could restore efficiency and cut your energy bills by up to 15% - that\'s typically £60–£120/year back in your pocket.'
          : null,
        suggestedAction: 'book-plan',
        actionLabel: 'See annual service plans'
      };
    }

    return {
      score: 'good',
      scoreLabel: 'Looking good',
      headline: 'Your system appears to be in good health.',
      detail: 'Based on your answers, your AC is well-maintained and performing as expected. To stay ahead of any issues, consider an annual service plan - it\'s the best way to protect your investment.',
      energySavingEstimate: null,
      suggestedAction: 'book-plan',
      actionLabel: 'Explore annual service plans'
    };
  }

  scoreIcon(score: SystemScore): string {
    if (score === 'good') return 'check';
    if (score === 'service-due') return 'clock';
    return 'alert';
  }

  ageLabel(val: string | null): string {
    return this.ageOptions.find(o => o.value === val)?.label ?? '-';
  }

  servicedLabel(val: string | null): string {
    return this.servicedOptions.find(o => o.value === val)?.label ?? '-';
  }

  energyLabel(val: string | null): string {
    return this.energyOptions.find(o => o.value === val)?.label ?? '-';
  }

  issuesSummary(): string {
    const s = this.state();
    if (s.issues.length === 0 || s.issues.includes('none')) return 'None reported';
    return s.issues.map(v => this.issueOptions.find(o => o.value === v)?.label ?? v).join(', ');
  }
}
