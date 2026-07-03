import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SizingService } from '../../core/services/sizing.service';

interface EquipItem { name: string; qty: number; btu: number; }

// Typical sensible heat output per appliance (BTU/hr) — editable per job.
const EQUIP_PRESETS: { group: string; items: { name: string; btu: number }[] }[] = [
  {
    group: 'Café / commercial kitchen',
    items: [
      { name: 'Dishwasher', btu: 1200 },
      { name: 'Ice machine', btu: 800 },
      { name: 'Refrigerator (commercial)', btu: 600 },
      { name: 'Small fridge / undercounter', btu: 400 },
      { name: 'Freezer', btu: 700 },
      { name: 'Hot water / boiler tap', btu: 1000 },
      { name: 'Milk boiler', btu: 800 },
      { name: 'Coffee machine', btu: 1000 },
      { name: 'Hot oven', btu: 2000 },
      { name: 'Grill / griddle', btu: 3000 },
      { name: 'Microwave', btu: 800 },
      { name: 'Toaster / panini press', btu: 600 },
    ],
  },
  {
    group: 'Office / retail',
    items: [
      { name: 'Desktop PC', btu: 300 },
      { name: 'Laptop', btu: 150 },
      { name: 'Monitor', btu: 200 },
      { name: 'Server', btu: 1500 },
      { name: 'Printer / copier', btu: 500 },
      { name: 'TV / display screen', btu: 350 },
      { name: 'Till / POS terminal', btu: 250 },
    ],
  },
];

// Standard split-system sizes.
const AC_SIZES = [
  { btu: 7000,  kw: 2.0 },
  { btu: 9000,  kw: 2.5 },
  { btu: 12000, kw: 3.5 },
  { btu: 18000, kw: 5.0 },
  { btu: 24000, kw: 7.1 },
];

@Component({
  selector: 'app-dashboard-heat-load',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="hl-page">

      <div class="hl-titlerow">
        <div>
          <h1>Heat load calculator</h1>
          <p class="hl-sub">Size the unit properly — factor in the room, people, equipment, glazing &amp; lighting.</p>
        </div>
      </div>

      <div class="hl-grid">

        <!-- ── Inputs ─────────────────────────────────────────────────── -->
        <div class="hl-col">

          <!-- Room -->
          <div class="hl-card">
            <div class="hl-card-head"><h3>Room</h3></div>
            <div class="hl-fields">
              <div class="hl-field">
                <label>Floor area <span class="hl-opt">m²</span></label>
                <input type="number" [(ngModel)]="areaM2" name="area" min="1" />
              </div>
              <div class="hl-field">
                <label>Ceiling height <span class="hl-opt">m</span></label>
                <input type="number" [(ngModel)]="heightM" name="height" min="2" step="0.1" />
              </div>
              <div class="hl-field">
                <label>Space type</label>
                <select [(ngModel)]="spaceLabel" name="space">
                  <option value="Café / commercial kitchen">Café / kitchen</option>
                  <option value="Office">Office</option>
                  <option value="Retail unit">Retail unit</option>
                  <option value="Residential room">Residential room</option>
                  <option value="Server / comms room">Server room</option>
                </select>
              </div>
            </div>
          </div>

          <!-- People -->
          <div class="hl-card">
            <div class="hl-card-head"><h3>Occupancy</h3></div>
            <div class="hl-fields">
              <div class="hl-field">
                <label>Number of people</label>
                <input type="number" [(ngModel)]="people" name="people" min="0" />
              </div>
              <div class="hl-field">
                <label>Activity level</label>
                <select [(ngModel)]="personBtu" name="activity">
                  <option [ngValue]="400">Seated / light (400)</option>
                  <option [ngValue]="500">Standard (500)</option>
                  <option [ngValue]="600">Active / busy (600)</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Windows -->
          <div class="hl-card">
            <div class="hl-card-head"><h3>Glazing / windows</h3></div>
            <div class="hl-fields">
              <div class="hl-field">
                <label>Total window area <span class="hl-opt">m²</span></label>
                <input type="number" [(ngModel)]="windowAreaM2" name="win" min="0" step="0.1" />
              </div>
              <div class="hl-field">
                <label>Sun exposure</label>
                <select [(ngModel)]="windowFactor" name="sun">
                  <option [ngValue]="700">Shaded / north-facing (700)</option>
                  <option [ngValue]="1000">Standard (1000)</option>
                  <option [ngValue]="1300">Sunny / south-facing (1300)</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Lighting -->
          <div class="hl-card">
            <div class="hl-card-head"><h3>Lighting</h3></div>
            <div class="hl-fields">
              <div class="hl-field">
                <label>Total lighting load <span class="hl-opt">watts</span></label>
                <input type="number" [(ngModel)]="lightWatts" name="lights" min="0" />
              </div>
            </div>
          </div>

          <!-- Equipment -->
          <div class="hl-card">
            <div class="hl-card-head"><h3>Equipment</h3></div>
            <div class="hl-equip-add">
              <select [(ngModel)]="presetPick" name="preset">
                <option value="">Add equipment…</option>
                @for (g of presets; track g.group) {
                  <optgroup [label]="g.group">
                    @for (it of g.items; track it.name) {
                      <option [value]="it.name + '|' + it.btu">{{ it.name }} ({{ it.btu }} BTU)</option>
                    }
                  </optgroup>
                }
                <option value="Custom item|500">+ Custom item…</option>
              </select>
              <button class="btn-secondary btn-sm" (click)="addPreset()" type="button">Add</button>
            </div>

            @if (equipment().length) {
              <div class="hl-equip-list">
                <div class="hl-equip-head">
                  <span class="e-name">Item</span><span class="e-qty">Qty</span><span class="e-btu">BTU ea.</span><span class="e-sub">Total</span><span class="e-x"></span>
                </div>
                @for (item of equipment(); track $index; let i = $index) {
                  <div class="hl-equip-row">
                    <input class="e-name" type="text" [(ngModel)]="item.name" [name]="'en'+i" />
                    <input class="e-qty" type="number" [(ngModel)]="item.qty" [name]="'eq'+i" min="1" />
                    <input class="e-btu" type="number" [(ngModel)]="item.btu" [name]="'eb'+i" min="0" step="50" />
                    <span class="e-sub">{{ (item.qty * item.btu) | number }}</span>
                    <button class="e-x hl-del" (click)="removeEquip(i)" type="button" aria-label="Remove">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/></svg>
                    </button>
                  </div>
                }
              </div>
            } @else {
              <p class="hl-equip-empty">No equipment added. Use the dropdown to add kitchen or office appliances.</p>
            }
          </div>

        </div>

        <!-- ── Results ────────────────────────────────────────────────── -->
        <div class="hl-col">
          <div class="hl-card hl-results">
            <div class="hl-card-head"><h3>Heat load breakdown</h3></div>

            <ul class="hl-breakdown">
              <li>
                <span class="b-label">Room / volume<span class="b-calc">{{ areaM2 }}m² × {{ heightM }}m × 141</span></span>
                <strong>{{ roomLoad() | number }}</strong>
              </li>
              <li>
                <span class="b-label">People<span class="b-calc">{{ people }} × {{ personBtu }}</span></span>
                <strong>{{ peopleLoad() | number }}</strong>
              </li>
              <li>
                <span class="b-label">Equipment<span class="b-calc">{{ equipment().length }} item{{ equipment().length !== 1 ? 's' : '' }}</span></span>
                <strong>{{ equipmentLoad() | number }}</strong>
              </li>
              <li>
                <span class="b-label">Windows / solar<span class="b-calc">{{ windowAreaM2 }}m² × {{ windowFactor }}</span></span>
                <strong>{{ windowLoad() | number }}</strong>
              </li>
              <li>
                <span class="b-label">Lighting<span class="b-calc">{{ lightWatts }}W × 3.41</span></span>
                <strong>{{ lightsLoad() | number }}</strong>
              </li>
            </ul>

            <div class="hl-total">
              <div class="hl-total-btu">
                <span>Total heat load</span>
                <strong>{{ totalBtu() | number }} <em>BTU/hr</em></strong>
              </div>
              <div class="hl-total-kw">{{ kw() | number:'1.1-1' }} kW</div>
            </div>

            <!-- Recommendation -->
            <div class="hl-reco">
              <div class="hl-reco-head">
                <span class="hl-reco-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M2 12h20M5 5l14 14M5 19 19 5"/></svg></span>
                <div>
                  <span class="hl-reco-lbl">Recommended unit <span class="hl-reco-hint">(incl. ~10% headroom)</span></span>
                  @if (reco().multiUnit) {
                    <strong>{{ reco().units }} × {{ reco().recommendedBtu | number }} BTU units</strong>
                  } @else {
                    <strong>{{ reco().recommendedBtu | number }} BTU · {{ reco().recommendedKw | number:'1.1-1' }} kW</strong>
                  }
                </div>
              </div>
              @if (reco().multiUnit) {
                <p class="hl-reco-note">Load exceeds a single split — consider a multi-split or VRF system.</p>
              }
            </div>

            <button class="btn-primary hl-use" (click)="useInQuote()">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
              Use in Quote Builder
            </button>
            <button class="btn-secondary btn-sm hl-copy" (click)="copy()">Copy calculation</button>
            @if (copied()) { <p class="hl-copied">Copied to clipboard.</p> }

            <p class="hl-disclaimer">Guideline sizing using standard sensible-heat factors. Confirm against manufacturer data and a site survey before ordering.</p>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .hl-page { display: flex; flex-direction: column; gap: 1.1rem; max-width: 1000px; }
    .hl-titlerow h1 { font-size: 1.25rem; font-weight: 700; margin: 0 0 0.15rem; }
    .hl-sub { font-size: 0.8rem; color: var(--text-muted); margin: 0; }

    .hl-grid { display: grid; grid-template-columns: 1fr; gap: 1.1rem; align-items: start; }
    .hl-col { display: flex; flex-direction: column; gap: 1.1rem; min-width: 0; }

    .hl-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); padding: 1.1rem 1.25rem; }
    .hl-card-head { margin-bottom: 0.9rem; }
    .hl-card-head h3 { font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-secondary); margin: 0; }

    .hl-fields { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
    .hl-field { display: flex; flex-direction: column; gap: 0.3rem; }
    .hl-field label { font-size: 0.72rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.03em; }
    .hl-opt { color: var(--text-muted); font-weight: 400; text-transform: none; }
    .hl-field input, .hl-field select { padding: 0.55rem 0.7rem; border: 1.5px solid var(--border); border-radius: var(--radius-sm); font-size: 0.9rem; background: var(--surface); width: 100%; box-sizing: border-box; }

    /* Equipment */
    .hl-equip-add { display: flex; gap: 0.5rem; margin-bottom: 0.85rem; }
    .hl-equip-add select { flex: 1; padding: 0.55rem 0.7rem; border: 1.5px solid var(--border); border-radius: var(--radius-sm); font-size: 0.88rem; background: var(--surface); }
    .hl-equip-empty { font-size: 0.83rem; color: var(--text-muted); margin: 0; }
    .hl-equip-head, .hl-equip-row { display: grid; grid-template-columns: 1fr 48px 78px 68px 30px; gap: 0.4rem; align-items: center; }
    .hl-equip-head { font-size: 0.64rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.04em; padding-bottom: 0.4rem; border-bottom: 1px solid var(--border); }
    .hl-equip-row { margin-top: 0.45rem; }
    .hl-equip-row input { width: 100%; padding: 0.45rem 0.55rem; border: 1.5px solid var(--border); border-radius: 7px; font-size: 0.83rem; box-sizing: border-box; }
    .e-qty, .e-btu { text-align: right; }
    .hl-equip-head .e-qty, .hl-equip-head .e-btu, .hl-equip-head .e-sub { text-align: right; }
    .e-sub { font-size: 0.82rem; font-weight: 700; text-align: right; color: var(--text-primary); }
    .hl-del { background: none; border: 1px solid var(--border); border-radius: 7px; color: var(--text-muted); cursor: pointer; padding: 0.3rem; display: inline-flex; align-items: center; justify-content: center; }
    .hl-del svg { width: 14px; height: 14px; }
    .hl-del:hover { color: var(--danger); border-color: #fca5a5; }

    /* Results */
    .hl-breakdown { list-style: none; padding: 0; margin: 0 0 1rem; }
    .hl-breakdown li { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 0.6rem 0; border-bottom: 1px solid var(--border); }
    .b-label { display: flex; flex-direction: column; font-size: 0.88rem; color: var(--text-primary); font-weight: 500; }
    .b-calc { font-size: 0.72rem; color: var(--text-muted); font-weight: 400; margin-top: 0.1rem; }
    .hl-breakdown strong { font-size: 0.9rem; font-weight: 700; white-space: nowrap; }

    .hl-total { display: flex; align-items: center; justify-content: space-between; gap: 1rem; background: var(--grad-hero); color: #fff; border-radius: var(--radius-md); padding: 1rem 1.25rem; margin-bottom: 1rem; }
    .hl-total-btu span { display: block; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.05em; color: rgba(255,255,255,0.7); margin-bottom: 0.2rem; }
    .hl-total-btu strong { font-size: 1.5rem; font-weight: 800; }
    .hl-total-btu em { font-size: 0.8rem; font-style: normal; font-weight: 500; color: rgba(255,255,255,0.75); }
    .hl-total-kw { font-size: 1.6rem; font-weight: 800; color: var(--accent); white-space: nowrap; }

    .hl-reco { border: 1.5px solid var(--brand-light); background: var(--brand-light); border-radius: var(--radius-md); padding: 0.9rem 1rem; margin-bottom: 1rem; }
    .hl-reco-head { display: flex; align-items: center; gap: 0.75rem; }
    .hl-reco-ico { width: 38px; height: 38px; flex-shrink: 0; border-radius: 10px; background: var(--brand); color: #fff; display: inline-flex; align-items: center; justify-content: center; }
    .hl-reco-ico svg { width: 20px; height: 20px; }
    .hl-reco-lbl { display: block; font-size: 0.74rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: var(--brand-dark); }
    .hl-reco-hint { font-weight: 400; text-transform: none; letter-spacing: 0; color: var(--text-muted); }
    .hl-reco-head strong { display: block; font-size: 1.05rem; color: var(--ink-2); margin-top: 0.1rem; }
    .hl-reco-note { font-size: 0.78rem; color: var(--brand-dark); margin: 0.6rem 0 0; }

    .hl-use { width: 100%; display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem; margin-bottom: 0.6rem; }
    .hl-use svg { width: 17px; height: 17px; }
    .hl-copy { width: 100%; }
    .hl-copied { text-align: center; font-size: 0.8rem; color: var(--success); font-weight: 600; margin: 0.6rem 0 0; }
    .hl-disclaimer { font-size: 0.72rem; color: var(--text-muted); margin-top: 0.85rem; line-height: 1.5; }

    @media (min-width: 880px) {
      .hl-grid { grid-template-columns: 1fr 380px; }
      .hl-results { position: sticky; top: 80px; }
    }
    @media (max-width: 560px) {
      .hl-card { padding: 1rem; }
      .hl-total { flex-wrap: wrap; }
      /* Equipment: name on its own row, controls below */
      .hl-equip-head { display: none; }
      .hl-equip-row {
        grid-template-columns: 1fr auto auto 32px;
        grid-template-areas: 'name name name name' 'qty btu sub del';
        gap: 0.45rem; align-items: center; margin-top: 0.65rem;
        padding-top: 0.65rem; border-top: 1px solid var(--border);
      }
      .hl-equip-row:first-of-type { border-top: none; margin-top: 0.4rem; }
      .hl-equip-row .e-name { grid-area: name; }
      .hl-equip-row .e-qty { grid-area: qty; text-align: left; }
      .hl-equip-row .e-btu { grid-area: btu; text-align: left; }
      .hl-equip-row .e-sub { grid-area: sub; }
      .hl-equip-row .hl-del { grid-area: del; }
    }
    @media (max-width: 400px) {
      .hl-fields { grid-template-columns: 1fr; }
    }
  `]
})
export class DashboardHeatLoadComponent {
  private router  = inject(Router);
  private sizing  = inject(SizingService);

  presets = EQUIP_PRESETS;

  // Room
  areaM2   = 18;
  heightM  = 3;
  spaceLabel = 'Café / commercial kitchen';
  // People
  people    = 2;
  personBtu = 500;
  // Windows
  windowAreaM2 = 2;
  windowFactor = 1000;
  // Lighting
  lightWatts = 400;
  // Equipment (pre-seeded with the café example)
  equipment = signal<EquipItem[]>([
    { name: 'Dishwasher', qty: 1, btu: 1200 },
    { name: 'Ice machine', qty: 1, btu: 800 },
    { name: 'Refrigerator (commercial)', qty: 1, btu: 600 },
    { name: 'Hot water / boiler tap', qty: 1, btu: 1000 },
    { name: 'Milk boiler', qty: 1, btu: 800 },
    { name: 'Coffee machine', qty: 1, btu: 1000 },
    { name: 'Hot oven', qty: 1, btu: 2000 },
    { name: 'Small fridge / undercounter', qty: 1, btu: 400 },
  ]);
  presetPick = '';
  copied = signal(false);

  // ── Loads (BTU/hr) ──────────────────────────────────────────────────────────
  roomLoad      = computed(() => Math.round((Number(this.areaM2) || 0) * (Number(this.heightM) || 0) * 141));
  peopleLoad    = computed(() => (Number(this.people) || 0) * (Number(this.personBtu) || 0));
  equipmentLoad = computed(() => this.equipment().reduce((s, e) => s + (Number(e.qty) || 0) * (Number(e.btu) || 0), 0));
  windowLoad    = computed(() => Math.round((Number(this.windowAreaM2) || 0) * (Number(this.windowFactor) || 0)));
  lightsLoad    = computed(() => Math.round((Number(this.lightWatts) || 0) * 3.41));
  totalBtu      = computed(() => this.roomLoad() + this.peopleLoad() + this.equipmentLoad() + this.windowLoad() + this.lightsLoad());
  kw            = computed(() => this.totalBtu() / 3412);

  reco = computed(() => {
    const target = this.totalBtu() * 1.1;               // ~10% headroom
    const single = AC_SIZES.find(s => s.btu >= target);
    if (single) {
      return { recommendedBtu: single.btu, recommendedKw: single.kw, multiUnit: false, units: 1 };
    }
    const largest = AC_SIZES[AC_SIZES.length - 1];
    const units = Math.ceil(target / largest.btu);
    return { recommendedBtu: largest.btu, recommendedKw: largest.kw, multiUnit: true, units };
  });

  addPreset() {
    if (!this.presetPick) return;
    const [name, btu] = this.presetPick.split('|');
    this.equipment.update(list => [...list, { name, qty: 1, btu: Number(btu) || 0 }]);
    this.presetPick = '';
  }
  removeEquip(i: number) { this.equipment.update(list => list.filter((_, n) => n !== i)); }

  useInQuote() {
    const r = this.reco();
    this.sizing.set({
      totalBtu: this.totalBtu(),
      kw: Math.round(this.kw() * 10) / 10,
      recommendedBtu: r.recommendedBtu,
      recommendedKw: r.recommendedKw,
      roomAreaM2: Number(this.areaM2) || 0,
      multiUnit: r.multiUnit,
      label: this.spaceLabel,
    });
    this.router.navigate(['/dashboard/quotes/new']);
  }

  copy() {
    const lines = [
      `Heat load — ${this.spaceLabel} (${this.areaM2}m² × ${this.heightM}m)`,
      `Room/volume:  ${this.roomLoad().toLocaleString()} BTU/hr`,
      `People:       ${this.peopleLoad().toLocaleString()} BTU/hr`,
      `Equipment:    ${this.equipmentLoad().toLocaleString()} BTU/hr`,
      `Windows:      ${this.windowLoad().toLocaleString()} BTU/hr`,
      `Lighting:     ${this.lightsLoad().toLocaleString()} BTU/hr`,
      `TOTAL:        ${this.totalBtu().toLocaleString()} BTU/hr  (${(this.kw()).toFixed(1)} kW)`,
      `Recommended:  ${this.reco().recommendedBtu.toLocaleString()} BTU unit`,
    ].join('\n');
    navigator.clipboard?.writeText(lines);
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 2500);
  }
}
