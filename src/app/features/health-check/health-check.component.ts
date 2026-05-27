import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HealthCheckState, HealthCheckResult, SystemScore } from '../../core/models/models';

@Component({
  selector: 'app-health-check',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-container">
      <div class="hc-wrap">

        <div class="hc-header">
          <a routerLink="/" class="back-link">← Home</a>
          <h1>AC Health Check</h1>
          <p class="hc-sub">4 quick questions - get an instant assessment of your system's condition.</p>
          @if (state().step < 5) {
            <div class="hc-progress">
              <div class="hc-progress-fill" [style.width.%]="progressPct()"></div>
            </div>
            <div class="hc-step-label">Question {{ state().step }} of 4</div>
          }
        </div>

        <!-- Step 1: System age -->
        @if (state().step === 1) {
          <div class="hc-step">
            <h2>How old is your AC system?</h2>
            <p class="hc-step-hint">Age is the biggest factor in service frequency and efficiency.</p>
            <div class="hc-options">
              @for (opt of ageOptions; track opt.value) {
                <button class="hc-option" (click)="select('systemAge', opt.value)">
                  <span class="hc-opt-icon">{{ opt.icon }}</span>
                  <span class="hc-opt-label">{{ opt.label }}</span>
                  <span class="hc-opt-hint">{{ opt.hint }}</span>
                </button>
              }
            </div>
          </div>
        }

        <!-- Step 2: Last serviced -->
        @if (state().step === 2) {
          <div class="hc-step">
            <h2>When was it last professionally serviced?</h2>
            <p class="hc-step-hint">Manufacturers recommend an annual service to maintain warranty and efficiency.</p>
            <div class="hc-options">
              @for (opt of servicedOptions; track opt.value) {
                <button class="hc-option" (click)="select('lastServiced', opt.value)">
                  <span class="hc-opt-icon">{{ opt.icon }}</span>
                  <span class="hc-opt-label">{{ opt.label }}</span>
                  <span class="hc-opt-hint">{{ opt.hint }}</span>
                </button>
              }
            </div>
            <button class="btn-text hc-back" (click)="back()">← Back</button>
          </div>
        }

        <!-- Step 3: Issues noticed -->
        @if (state().step === 3) {
          <div class="hc-step">
            <h2>Any of these sound familiar?</h2>
            <p class="hc-step-hint">Select all that apply - or none if everything seems fine.</p>
            <div class="hc-options hc-multi">
              @for (opt of issueOptions; track opt.value) {
                <button class="hc-option hc-option-check"
                  [class.selected]="state().issues.includes(opt.value)"
                  (click)="toggleIssue(opt.value)">
                  <span class="hc-opt-icon">{{ opt.icon }}</span>
                  <span class="hc-opt-label">{{ opt.label }}</span>
                  <span class="hc-check-indicator">{{ state().issues.includes(opt.value) ? '✓' : '' }}</span>
                </button>
              }
            </div>
            <button class="btn-primary hc-next" (click)="advanceStep()">Continue</button>
            <button class="btn-text hc-back" (click)="back()">← Back</button>
          </div>
        }

        <!-- Step 4: Energy bills -->
        @if (state().step === 4) {
          <div class="hc-step">
            <h2>Have your energy bills increased lately?</h2>
            <p class="hc-step-hint">A dirty or underperforming AC unit can use up to 30% more energy.</p>
            <div class="hc-options">
              @for (opt of energyOptions; track opt.value) {
                <button class="hc-option" (click)="selectEnergy(opt.value)">
                  <span class="hc-opt-icon">{{ opt.icon }}</span>
                  <span class="hc-opt-label">{{ opt.label }}</span>
                  <span class="hc-opt-hint">{{ opt.hint }}</span>
                </button>
              }
            </div>
            <button class="btn-text hc-back" (click)="back()">← Back</button>
          </div>
        }

        <!-- Result -->
        @if (state().step === 5 && state().result) {
          <div class="hc-result">
            <div class="hc-score-ring" [class]="'score-' + state().result!.score">
              <div class="hc-score-inner">
                <div class="hc-score-icon">{{ scoreIcon(state().result!.score) }}</div>
                <div class="hc-score-label">{{ state().result!.scoreLabel }}</div>
              </div>
            </div>

            <h2 class="hc-result-headline">{{ state().result!.headline }}</h2>
            <p class="hc-result-detail">{{ state().result!.detail }}</p>

            @if (state().result!.energySavingEstimate) {
              <div class="hc-saving-banner">
                <span class="hc-saving-icon">&#9889;</span>
                <div>
                  <strong>Potential energy saving</strong>
                  <p>{{ state().result!.energySavingEstimate }}</p>
                </div>
              </div>
            }

            <div class="hc-result-actions">
              @if (state().result!.suggestedAction === 'book-service' || state().result!.suggestedAction === 'book-emergency') {
                <a routerLink="/quote" class="btn-primary">{{ state().result!.actionLabel }}</a>
              }
              @if (state().result!.suggestedAction === 'book-plan') {
                <a routerLink="/service-plans" class="btn-primary">{{ state().result!.actionLabel }}</a>
              }
              <a routerLink="/engineers" class="btn-secondary">Browse engineers</a>
            </div>

            <div class="hc-result-breakdown">
              <h3>Your answers</h3>
              <dl class="hc-answers">
                <dt>System age</dt>
                <dd>{{ ageLabel(state().systemAge) }}</dd>
                <dt>Last serviced</dt>
                <dd>{{ servicedLabel(state().lastServiced) }}</dd>
                <dt>Issues noticed</dt>
                <dd>{{ issuesSummary() }}</dd>
                <dt>Energy bills</dt>
                <dd>{{ energyLabel(state().energyBillIncrease) }}</dd>
              </dl>
            </div>

            <button class="btn-text hc-restart" (click)="restart()">Start over</button>
          </div>
        }

      </div>
    </div>
  `,
  styles: [`
    .hc-wrap {
      max-width: 560px;
      margin: 0 auto;
      padding: 2rem 1.5rem 4rem;
    }
    .hc-header { margin-bottom: 2.5rem; }
    .hc-header h1 { font-size: 1.75rem; margin: 0.5rem 0 0.4rem; }
    .hc-sub { color: #6b7280; font-size: 0.95rem; margin-bottom: 1.25rem; }
    .hc-progress {
      height: 6px;
      background: #e5e7eb;
      border-radius: 999px;
      overflow: hidden;
      margin-bottom: 0.4rem;
    }
    .hc-progress-fill {
      height: 100%;
      background: #1e3a5f;
      border-radius: 999px;
      transition: width 0.3s ease;
    }
    .hc-step-label { font-size: 0.8rem; color: #9ca3af; }

    .hc-step h2 { font-size: 1.35rem; margin-bottom: 0.4rem; }
    .hc-step-hint { font-size: 0.9rem; color: #6b7280; margin-bottom: 1.5rem; }

    .hc-options { display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1.5rem; }
    .hc-option {
      display: grid;
      grid-template-columns: 2.5rem 1fr;
      grid-template-rows: auto auto;
      align-items: center;
      gap: 0 0.75rem;
      padding: 1rem 1.25rem;
      border: 2px solid #e5e7eb;
      border-radius: 12px;
      background: white;
      cursor: pointer;
      text-align: left;
      transition: all 0.15s;
    }
    .hc-option:hover { border-color: #1e3a5f; background: #f8faff; }
    .hc-option.selected { border-color: #1e3a5f; background: #f0f5ff; }
    .hc-opt-icon { font-size: 1.4rem; grid-row: 1 / 3; align-self: center; }
    .hc-opt-label { font-size: 0.95rem; font-weight: 600; color: #111827; }
    .hc-opt-hint { font-size: 0.82rem; color: #6b7280; }

    .hc-multi { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
    .hc-option-check {
      grid-template-columns: 2rem 1fr 1.5rem;
      grid-template-rows: auto;
      padding: 0.9rem 1rem;
    }
    .hc-check-indicator {
      color: #059669;
      font-weight: 700;
      font-size: 1rem;
      justify-self: end;
    }

    .hc-next { width: 100%; margin-bottom: 0.75rem; }
    .hc-back { display: block; text-align: center; }
    .hc-restart { display: block; text-align: center; margin-top: 2rem; }

    /* Result */
    .hc-result { text-align: center; }
    .hc-score-ring {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      border: 6px solid #e5e7eb;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.75rem;
    }
    .score-good { border-color: #059669; background: #d1fae5; }
    .score-service-due { border-color: #d97706; background: #fef3c7; }
    .score-urgent { border-color: #dc2626; background: #fee2e2; }
    .hc-score-inner { text-align: center; }
    .hc-score-icon { font-size: 2.25rem; line-height: 1; margin-bottom: 0.2rem; }
    .hc-score-label { font-size: 0.75rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: #374151; }

    .hc-result-headline { font-size: 1.4rem; margin-bottom: 0.6rem; }
    .hc-result-detail { font-size: 0.95rem; color: #6b7280; line-height: 1.6; max-width: 460px; margin: 0 auto 1.5rem; }

    .hc-saving-banner {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      background: #fffbeb;
      border: 1px solid #fcd34d;
      border-radius: 10px;
      padding: 1rem 1.25rem;
      text-align: left;
      margin-bottom: 2rem;
    }
    .hc-saving-icon { font-size: 1.5rem; }
    .hc-saving-banner strong { font-size: 0.9rem; display: block; color: #92400e; }
    .hc-saving-banner p { font-size: 0.85rem; color: #78350f; margin: 0.2rem 0 0; }

    .hc-result-actions { display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap; margin-bottom: 2.5rem; }

    .hc-result-breakdown {
      background: #f9fafb;
      border-radius: 12px;
      padding: 1.25rem 1.5rem;
      text-align: left;
    }
    .hc-result-breakdown h3 { font-size: 0.9rem; font-weight: 600; color: #374151; margin-bottom: 0.75rem; }
    .hc-answers { display: grid; grid-template-columns: 1fr 1fr; gap: 0.4rem 1rem; }
    .hc-answers dt { font-size: 0.8rem; color: #9ca3af; }
    .hc-answers dd { font-size: 0.9rem; color: #111827; font-weight: 500; margin: 0; }

    @media (max-width: 480px) {
      .hc-multi { grid-template-columns: 1fr; }
      .hc-answers { grid-template-columns: 1fr; }
    }
  `]
})
export class HealthCheckComponent {
  state = signal<HealthCheckState>({
    step: 1,
    systemAge: null,
    lastServiced: null,
    issues: [],
    energyBillIncrease: null,
    result: null
  });

  progressPct = computed(() => [25, 50, 75, 100][Math.min(this.state().step - 1, 3)]);

  ageOptions = [
    { value: 'new',    label: 'Under 2 years',  icon: '🆕', hint: 'Practically brand new' },
    { value: 'mid',    label: '2 – 5 years',    icon: '🟢', hint: 'Prime working life' },
    { value: 'mature', label: '5 – 10 years',   icon: '🟡', hint: 'Service becomes critical' },
    { value: 'old',    label: 'Over 10 years',  icon: '🔴', hint: 'High risk of breakdown' },
  ];

  servicedOptions = [
    { value: 'recent',  label: 'Within the last year',  icon: '✅', hint: 'Good - well maintained' },
    { value: 'overdue', label: '1 – 2 years ago',       icon: '⏳', hint: 'Service now recommended' },
    { value: 'long',    label: '2 – 3 years ago',       icon: '⚠️', hint: 'Efficiency likely reduced' },
    { value: 'never',   label: 'Never / not sure',      icon: '❌', hint: 'Action needed' },
  ];

  issueOptions = [
    { value: 'none',        label: 'No issues',         icon: '😊' },
    { value: 'cooling',     label: 'Reduced cooling',   icon: '❄️' },
    { value: 'noise',       label: 'Strange noise',     icon: '🔊' },
    { value: 'leak',        label: 'Water leak',        icon: '💧' },
    { value: 'smell',       label: 'Bad smell',         icon: '👎' },
    { value: 'wontstart',   label: 'Won\'t turn on',    icon: '⚡' },
  ];

  energyOptions = [
    { value: 'no',          label: 'No change',         icon: '🟢', hint: 'Bills seem normal' },
    { value: 'slightly',    label: 'Slightly higher',   icon: '🟡', hint: 'Marginal increase' },
    { value: 'noticeably',  label: 'Noticeably higher', icon: '🔴', hint: '10%+ increase likely' },
  ];

  select(field: 'systemAge' | 'lastServiced', value: string) {
    this.state.update(s => ({ ...s, [field]: value }));
    setTimeout(() => this.state.update(s => ({ ...s, step: s.step + 1 })), 200);
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
    }, 200);
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
    if (score === 'good') return '✓';
    if (score === 'service-due') return '⚠';
    return '!';
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
