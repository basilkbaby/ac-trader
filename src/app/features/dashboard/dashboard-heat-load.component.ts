import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SizingService } from '../../core/services/sizing.service';
import { PROPERTY_TYPES, WALL_TYPES } from '../../core/mock/mock-data';

interface EquipItem { name: string; qty: number; btu: number; }
type RoomMode = 'volume' | 'dims';
interface RoomInput { id: number; name: string; mode: RoomMode; volumeM3: number; lengthM: number; widthM: number; heightM: number; wallType: string; }

// Used only to back out an equivalent floor area (for the Quote Builder handoff) when a room
// was entered directly as a volume rather than length × width × height.
const STANDARD_CEILING_M = 2.4;

// Typical sensible heat output per appliance (BTU/hr) - editable per job.
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
          <p class="hl-sub">Start with the property, then break it down room by room. Add people, windows, lighting &amp; equipment for an accurate unit size.</p>
        </div>
      </div>

      <div class="hl-grid">

        <!-- ── Inputs ─────────────────────────────────────────────────── -->
        <div class="hl-col">

          <!-- All heat sources, grouped & explained -->
          <div class="hl-card hl-inputs">

            <div class="hl-group">
              <div class="hl-group-head">
                <span class="hl-group-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/></svg></span>
                <div><h4>Property</h4><span class="hl-group-hint">Sets the base heat-gain factor.</span></div>
              </div>
              <div class="hl-fields">
                <div class="hl-field">
                  <label>Property type</label>
                  <select [(ngModel)]="propertyType" name="propType">
                    @for (pt of propertyTypes; track pt.value) { <option [value]="pt.value">{{ pt.label }}</option> }
                  </select>
                </div>
                <div class="hl-field">
                  <label>Postcode <span class="hl-opt">optional</span></label>
                  <input type="text" [(ngModel)]="postcode" name="postcode" placeholder="e.g. SW1A 1AA" autocapitalize="characters" />
                </div>
              </div>
            </div>

            <div class="hl-group">
              <div class="hl-group-head">
                <span class="hl-group-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg></span>
                <div><h4>Rooms</h4><span class="hl-group-hint">Add every room being cooled — length, width &amp; wall type.</span></div>
              </div>

              @for (room of rooms(); track room.id; let i = $index) {
                <div class="hl-room-card">
                  <div class="hl-room-card-top">
                    <input type="text" class="rm-name" [(ngModel)]="room.name" [name]="'rn'+i" placeholder="Room name" />
                    <button class="hl-del rm-del" type="button" (click)="removeRoom(room.id)" [disabled]="rooms().length <= 1" aria-label="Remove room">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/></svg>
                    </button>
                  </div>

                  <div class="hl-mode-toggle" role="tablist" [attr.aria-label]="'Room size entry for ' + room.name">
                    <button type="button" role="tab" [attr.aria-selected]="room.mode === 'volume'" [class.active]="room.mode === 'volume'" (click)="setRoomMode(room, 'volume')">Volume</button>
                    <button type="button" role="tab" [attr.aria-selected]="room.mode === 'dims'" [class.active]="room.mode === 'dims'" (click)="setRoomMode(room, 'dims')">L × W × H</button>
                  </div>

                  @if (room.mode === 'volume') {
                    <div class="hl-fields">
                      <div class="hl-field">
                        <label>Volume <span class="hl-opt">m³</span></label>
                        <input type="number" inputmode="decimal" [(ngModel)]="room.volumeM3" [name]="'rv'+i" min="1" step="0.5" />
                      </div>
                      <div class="hl-field">
                        <label>Wall type</label>
                        <select [(ngModel)]="room.wallType" [name]="'rt'+i">
                          @for (wt of wallTypes; track wt.value) { <option [value]="wt.value">{{ wt.label }}</option> }
                        </select>
                      </div>
                    </div>
                  } @else {
                    <div class="hl-fields">
                      <div class="hl-field">
                        <label>Length <span class="hl-opt">m</span></label>
                        <input type="number" inputmode="decimal" [(ngModel)]="room.lengthM" [name]="'rl'+i" min="0.5" step="0.1" />
                      </div>
                      <div class="hl-field">
                        <label>Width <span class="hl-opt">m</span></label>
                        <input type="number" inputmode="decimal" [(ngModel)]="room.widthM" [name]="'rw'+i" min="0.5" step="0.1" />
                      </div>
                      <div class="hl-field">
                        <label>Height <span class="hl-opt">m</span></label>
                        <input type="number" inputmode="decimal" [(ngModel)]="room.heightM" [name]="'rh'+i" min="1.8" step="0.1" />
                      </div>
                      <div class="hl-field">
                        <label>Wall type</label>
                        <select [(ngModel)]="room.wallType" [name]="'rt'+i">
                          @for (wt of wallTypes; track wt.value) { <option [value]="wt.value">{{ wt.label }}</option> }
                        </select>
                      </div>
                    </div>
                  }

                  <div class="hl-room-hint">{{ roomVolume(room) | number:'1.0-1' }} m³ · ≈ {{ roomBtu(room) | number }} BTU/hr</div>
                </div>
              }
              <button class="hl-add-room" type="button" (click)="addRoom()">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg> Add room
              </button>
            </div>

            <div class="hl-group">
              <div class="hl-group-head">
                <span class="hl-group-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.5"/><path d="M3 20a6 6 0 0 1 12 0"/><path d="M16 5a3 3 0 0 1 0 6M21 20a6 6 0 0 0-5-5.9"/></svg></span>
                <div><h4>People</h4><span class="hl-group-hint">Body heat — 400–600 BTU each.</span></div>
              </div>
              <div class="hl-fields">
                <div class="hl-field"><label>Number of people</label><input type="number" inputmode="numeric" [(ngModel)]="people" name="people" min="0" /></div>
                <div class="hl-field">
                  <label>Activity level</label>
                  <select [(ngModel)]="personBtu" name="activity">
                    <option [ngValue]="400">Seated / light</option>
                    <option [ngValue]="500">Standard</option>
                    <option [ngValue]="600">Active / busy</option>
                  </select>
                </div>
              </div>
            </div>

            <div class="hl-group">
              <div class="hl-group-head">
                <span class="hl-group-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg></span>
                <div><h4>Windows &amp; sunlight</h4><span class="hl-group-hint">Solar heat through the glass.</span></div>
              </div>
              <div class="hl-fields">
                <div class="hl-field"><label>Window area <span class="hl-opt">m²</span></label><input type="number" inputmode="decimal" [(ngModel)]="windowAreaM2" name="win" min="0" step="0.1" /></div>
                <div class="hl-field">
                  <label>Sun exposure</label>
                  <select [(ngModel)]="windowFactor" name="sun">
                    <option [ngValue]="700">Shaded / north-facing</option>
                    <option [ngValue]="1000">Standard</option>
                    <option [ngValue]="1300">Sunny / south-facing</option>
                  </select>
                </div>
              </div>
            </div>

            <div class="hl-group">
              <div class="hl-group-head">
                <span class="hl-group-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6M10 21h4M12 2a6 6 0 0 0-4 10.5c.6.6 1 1.3 1 2.1V15h6v-.4c0-.8.4-1.5 1-2.1A6 6 0 0 0 12 2z"/></svg></span>
                <div><h4>Lighting</h4><span class="hl-group-hint">Lights give off heat — ≈ 3.4 BTU per watt.</span></div>
              </div>
              <div class="hl-fields">
                <div class="hl-field"><label>Total lighting <span class="hl-opt">watts</span></label><input type="number" inputmode="numeric" [(ngModel)]="lightWatts" name="lights" min="0" /></div>
              </div>
            </div>

          </div>

          <!-- Equipment -->
          <div class="hl-card">
            <div class="hl-group-head hl-equip-head-row">
              <span class="hl-group-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M9 2v6M15 2v6M7 8h10v3a5 5 0 0 1-10 0z"/><path d="M12 16v6"/></svg></span>
              <div><h4>Equipment</h4><span class="hl-group-hint">Fridges, ovens, PCs, servers — anything that runs warm.</span></div>
            </div>
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
                @for (item of equipment(); track $index; let i = $index) {
                  <div class="hl-equip-card">
                    <div class="hl-equip-card-top">
                      <input class="e-name" type="text" [(ngModel)]="item.name" [name]="'en'+i" placeholder="Item name" />
                      <button class="hl-del e-x" (click)="removeEquip(i)" type="button" aria-label="Remove">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/></svg>
                      </button>
                    </div>
                    <div class="hl-fields">
                      <div class="hl-field">
                        <label>Quantity</label>
                        <input type="number" inputmode="numeric" [(ngModel)]="item.qty" [name]="'eq'+i" min="1" />
                      </div>
                      <div class="hl-field">
                        <label>BTU <span class="hl-opt">each</span></label>
                        <input type="number" inputmode="numeric" [(ngModel)]="item.btu" [name]="'eb'+i" min="0" step="50" />
                      </div>
                      <div class="hl-field">
                        <label>Total</label>
                        <span class="e-sub-display">{{ (item.qty * item.btu) | number }} BTU/hr</span>
                      </div>
                    </div>
                  </div>
                }
              </div>
            } @else {
              <p class="hl-equip-empty">None added — most rooms don't need any. Use the dropdown above if this job has kitchen or office equipment running.</p>
            }
          </div>

        </div>

        <!-- ── Results ────────────────────────────────────────────────── -->
        <div class="hl-col">
          <div class="hl-card hl-results">
            <div class="hl-card-head"><h3>Heat load breakdown</h3></div>

            <ul class="hl-breakdown">
              <li>
                <span class="b-label">Rooms<span class="b-calc">{{ rooms().length }} room{{ rooms().length !== 1 ? 's' : '' }} · {{ totalVolumeM3() | number:'1.0-1' }}m³ · factor {{ baseFactor() }}</span></span>
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
                <p class="hl-reco-note">Load exceeds a single split - consider a multi-split or VRF system.</p>
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
    .hl-col { display: flex; flex-direction: column; gap: 0.9rem; min-width: 0; }

    .hl-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); padding: 1rem 1.1rem; }
    .hl-card-head { margin-bottom: 0.75rem; }
    .hl-card-head h3 { font-size: 0.78rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-secondary); margin: 0; }

    .hl-fields { display: grid; grid-template-columns: repeat(auto-fit, minmax(135px, 1fr)); gap: 0.7rem 0.75rem; }
    .hl-field { display: flex; flex-direction: column; gap: 0.25rem; min-width: 0; }
    .hl-field-wide { grid-column: span 2; }
    .hl-field label { font-size: 0.68rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.03em; }
    .hl-opt { color: var(--text-muted); font-weight: 400; text-transform: none; }
    .hl-field input, .hl-field select { padding: 0.5rem 0.65rem; border: 1.5px solid var(--border); border-radius: var(--radius-sm); font-size: 0.9rem; background: var(--surface); width: 100%; box-sizing: border-box; }

    /* Grouped, explained sections */
    .hl-group + .hl-group { border-top: 1px solid var(--border); margin-top: 0.9rem; padding-top: 0.9rem; }
    .hl-group-head { display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.7rem; }
    .hl-group-ico { width: 30px; height: 30px; flex-shrink: 0; border-radius: 8px; background: var(--brand-light); color: var(--brand); display: inline-flex; align-items: center; justify-content: center; }
    .hl-group-ico svg { width: 17px; height: 17px; }
    .hl-group-head h4 { font-size: 0.86rem; font-weight: 700; margin: 0; color: var(--text-primary); line-height: 1.2; }
    .hl-group-hint { font-size: 0.72rem; color: var(--text-muted); }
    .hl-equip-head-row { margin-bottom: 0.85rem; }

    /* Rooms — one self-contained card per room, stacks naturally at any width */
    .hl-room-card { border: 1.5px solid var(--border); border-radius: var(--radius-md); padding: 0.85rem; margin-bottom: 0.7rem; }
    .hl-room-card-top { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.6rem; }
    .rm-name { font-weight: 600; flex: 1; min-width: 0; padding: 0.5rem 0.65rem; border: 1.5px solid var(--border); border-radius: 7px; font-size: 0.85rem; box-sizing: border-box; }

    .hl-mode-toggle { display: inline-flex; padding: 0.2rem; background: var(--bg); border: 1px solid var(--border); border-radius: 999px; margin-bottom: 0.7rem; width: 100%; }
    .hl-mode-toggle button {
      flex: 1; background: none; border: none; border-radius: 999px; cursor: pointer;
      font-size: 0.78rem; font-weight: 600; color: var(--text-secondary); padding: 0.5rem 0.6rem;
      min-height: 38px; transition: background 0.12s, color 0.12s;
    }
    .hl-mode-toggle button.active { background: var(--surface); color: var(--brand); box-shadow: var(--shadow-sm); }

    .hl-room-card .hl-fields input, .hl-room-card .hl-fields select { padding: 0.5rem 0.6rem; border-radius: 7px; font-size: 0.85rem; }
    .hl-room-hint { font-size: 0.72rem; color: var(--text-muted); margin: 0.6rem 0 0; padding-left: 0.1rem; }
    .hl-add-room { display: inline-flex; align-items: center; justify-content: center; gap: 0.35rem; margin-top: 0.2rem; background: none; border: 1.5px dashed var(--border); border-radius: var(--radius-sm); color: var(--brand); font-size: 0.85rem; font-weight: 600; padding: 0.65rem 0.75rem; min-height: 44px; width: 100%; cursor: pointer; }
    .hl-add-room:hover { border-color: var(--brand); background: var(--brand-light); }
    .hl-add-room svg { width: 14px; height: 14px; }

    /* Equipment — same self-contained, labeled card pattern as Rooms: guarantees every field
       has real width to show its value, and a visible label so it's clear what's being edited. */
    .hl-equip-add { display: flex; gap: 0.5rem; margin-bottom: 0.85rem; }
    .hl-equip-add select { flex: 1; padding: 0.55rem 0.7rem; border: 1.5px solid var(--border); border-radius: var(--radius-sm); font-size: 0.88rem; background: var(--surface); }
    .hl-equip-empty { font-size: 0.83rem; color: var(--text-muted); margin: 0; }
    .hl-equip-list { display: flex; flex-direction: column; gap: 0.7rem; }
    .hl-equip-card { border: 1.5px solid var(--border); border-radius: var(--radius-md); padding: 0.85rem; }
    .hl-equip-card-top { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.6rem; }
    .hl-equip-card .e-name { font-weight: 600; flex: 1; min-width: 0; padding: 0.5rem 0.65rem; border: 1.5px solid var(--border); border-radius: 7px; font-size: 0.85rem; box-sizing: border-box; }
    .hl-equip-card .hl-fields input { padding: 0.5rem 0.6rem; border-radius: 7px; font-size: 0.85rem; }
    .e-sub-display { display: flex; align-items: center; padding: 0.5rem 0; font-size: 0.9rem; font-weight: 700; color: var(--text-primary); }
    .hl-del { background: none; border: 1px solid var(--border); border-radius: 7px; color: var(--text-muted); cursor: pointer; padding: 0.3rem; display: inline-flex; align-items: center; justify-content: center; }
    .hl-del svg { width: 14px; height: 14px; }
    .hl-del:hover { color: var(--danger); border-color: #fca5a5; }
    .hl-del:disabled { opacity: 0.35; cursor: not-allowed; }

    /* Results */
    .hl-breakdown { list-style: none; padding: 0; margin: 0 0 0.9rem; }
    .hl-breakdown li { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 0.45rem 0; border-bottom: 1px solid var(--border); }
    .b-label { display: flex; flex: 1; min-width: 0; flex-direction: column; font-size: 0.86rem; color: var(--text-primary); font-weight: 500; }
    .b-calc { font-size: 0.72rem; color: var(--text-muted); font-weight: 400; margin-top: 0.1rem; }
    .hl-breakdown strong { font-size: 0.9rem; font-weight: 700; white-space: nowrap; flex-shrink: 0; }

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

    /* Mobile: bigger tap targets and ≥16px inputs (prevents iOS Safari auto-zoom-on-focus, and
       just plain easier to read what you're typing). Applies to every text box on this page —
       room cards, equipment cards, and the property/people/window/lighting fields alike. */
    @media (max-width: 700px) {
      .hl-field input, .hl-field select,
      .hl-room-card .hl-fields input, .hl-room-card .hl-fields select,
      .hl-equip-card .hl-fields input,
      .rm-name, .hl-equip-card .e-name, .hl-equip-add select {
        font-size: 1rem;
        padding-top: 0.6rem;
        padding-bottom: 0.6rem;
      }
      .hl-del { min-width: 40px; min-height: 40px; }
      .hl-del svg { width: 16px; height: 16px; }
      .hl-mode-toggle button { min-height: 44px; font-size: 0.82rem; }
      .hl-add-room { min-height: 48px; font-size: 0.9rem; }
      .hl-use, .hl-copy { min-height: 48px; }
      .hl-equip-add { flex-direction: column; }
      .hl-equip-add select, .hl-equip-add button { width: 100%; min-height: 44px; }

      /* Labels and grouped-section hints — a touch bigger for comfortable reading on a phone */
      .hl-field label { font-size: 0.74rem; }
      .hl-group-hint, .hl-sub { font-size: 0.76rem; }
      .hl-group-head h4 { font-size: 0.92rem; }
      .b-calc { font-size: 0.74rem; }
    }

    @media (max-width: 560px) {
      .hl-card { padding: 1rem 0.85rem; }
      .hl-page { gap: 0.85rem; }

      /* Total banner — stack and centre both stats so it reads as one balanced block instead
         of a left/right split with nothing to anchor it */
      .hl-total { flex-direction: column; align-items: center; text-align: center; gap: 0.5rem; padding: 1.1rem 1.25rem; }
      .hl-total-kw { align-self: center; }

      .hl-reco-head { flex-wrap: wrap; }
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
  propertyTypes = PROPERTY_TYPES;
  wallTypes = WALL_TYPES;

  // Property
  propertyType = 'flat';
  postcode = '';
  // Base fabric/ambient gain per m³ — varies with glazing ratio & occupancy density by property type.
  private propertyFactors: Record<string, number> = {
    flat: 130, terr: 133, semi: 136, det: 140, comm: 145,
  };

  // Rooms — default to direct volume entry (quicker on mobile than three separate dimensions)
  rooms = signal<RoomInput[]>([
    { id: 1, name: 'Room 1', mode: 'volume', volumeM3: 49, lengthM: 6, widthM: 3, heightM: 2.7, wallType: 'cavity' },
  ]);

  // People
  people    = 2;
  personBtu = 500;
  // Windows
  windowAreaM2 = 2;
  windowFactor = 1000;
  // Lighting
  lightWatts = 400;
  // Equipment (pre-loaded example set)
  // Empty by default — most jobs (living rooms, bedrooms, offices) have no extra heat-generating
  // equipment. Add kitchen/office items from the dropdown only when the job actually needs them.
  equipment = signal<EquipItem[]>([]);
  presetPick = '';
  copied = signal(false);

  // ── Loads (BTU/hr) ──────────────────────────────────────────────────────────
  // Plain methods, not computed() signals: these depend on plain (non-signal) form fields like
  // `people`/`propertyType`, and on room/equipment objects that ngModel mutates in place rather
  // than replacing via rooms.set()/update() — so a computed() here would never see a dependency
  // change and would stay stuck at its first-rendered value. Plain methods just re-run on every
  // change-detection pass, which ngModel already triggers on every edit, so they stay live.
  baseFactor(): number { return this.propertyFactors[this.propertyType] ?? 133; }
  totalAreaM2(): number { return this.rooms().reduce((s, r) => s + this.roomArea(r), 0); }
  totalVolumeM3(): number { return this.rooms().reduce((s, r) => s + this.roomVolume(r), 0); }
  roomLoad(): number { return this.rooms().reduce((s, r) => s + this.roomBtu(r), 0); }
  peopleLoad(): number { return (Number(this.people) || 0) * (Number(this.personBtu) || 0); }
  equipmentLoad(): number { return this.equipment().reduce((s, e) => s + (Number(e.qty) || 0) * (Number(e.btu) || 0), 0); }
  windowLoad(): number { return Math.round((Number(this.windowAreaM2) || 0) * (Number(this.windowFactor) || 0)); }
  lightsLoad(): number { return Math.round((Number(this.lightWatts) || 0) * 3.41); }
  totalBtu(): number { return this.roomLoad() + this.peopleLoad() + this.equipmentLoad() + this.windowLoad() + this.lightsLoad(); }
  kw(): number { return this.totalBtu() / 3412; }

  reco(): { recommendedBtu: number; recommendedKw: number; multiUnit: boolean; units: number } {
    const target = this.totalBtu() * 1.1;               // ~10% headroom
    const single = AC_SIZES.find(s => s.btu >= target);
    if (single) {
      return { recommendedBtu: single.btu, recommendedKw: single.kw, multiUnit: false, units: 1 };
    }
    const largest = AC_SIZES[AC_SIZES.length - 1];
    const units = Math.ceil(target / largest.btu);
    return { recommendedBtu: largest.btu, recommendedKw: largest.kw, multiUnit: true, units };
  }

  /** Room volume in m³ — entered directly, or derived from L × W × H in dimensions mode. */
  roomVolume(r: RoomInput): number {
    return r.mode === 'volume'
      ? (Number(r.volumeM3) || 0)
      : (Number(r.lengthM) || 0) * (Number(r.widthM) || 0) * (Number(r.heightM) || 0);
  }
  /** Floor area — only meaningful for the Quote Builder's square-room handoff; in volume mode
   *  it's backed out using a standard ceiling height since no dimensions were given. */
  roomArea(r: RoomInput): number {
    if (r.mode === 'volume') return (Number(r.volumeM3) || 0) / STANDARD_CEILING_M;
    return (Number(r.lengthM) || 0) * (Number(r.widthM) || 0);
  }
  private wallFactor(type: string): number { return this.wallTypes.find(w => w.value === type)?.factor ?? 1.0; }
  roomBtu(r: RoomInput): number { return Math.round(this.roomVolume(r) * this.baseFactor() * this.wallFactor(r.wallType)); }

  setRoomMode(r: RoomInput, mode: RoomMode) { r.mode = mode; }

  addRoom() {
    const n = this.rooms().length + 1;
    this.rooms.update(list => [...list, { id: Date.now(), name: `Room ${n}`, mode: 'volume', volumeM3: 30, lengthM: 4, widthM: 3, heightM: 2.7, wallType: 'cavity' }]);
  }
  removeRoom(id: number) {
    if (this.rooms().length <= 1) return;
    this.rooms.update(list => list.filter(r => r.id !== id));
  }

  addPreset() {
    if (!this.presetPick) return;
    const [name, btu] = this.presetPick.split('|');
    this.equipment.update(list => [...list, { name, qty: 1, btu: Number(btu) || 0 }]);
    this.presetPick = '';
  }
  removeEquip(i: number) { this.equipment.update(list => list.filter((_, n) => n !== i)); }

  useInQuote() {
    const r = this.reco();
    const propLabel = this.propertyTypes.find(p => p.value === this.propertyType)?.label ?? 'property';
    this.sizing.set({
      totalBtu: this.totalBtu(),
      kw: Math.round(this.kw() * 10) / 10,
      recommendedBtu: r.recommendedBtu,
      recommendedKw: r.recommendedKw,
      roomAreaM2: this.totalAreaM2(),
      multiUnit: r.multiUnit,
      label: propLabel,
      propertyType: this.propertyType,
      postcode: this.postcode,
    });
    this.router.navigate(['/dashboard/quotes/new']);
  }

  copy() {
    const propLabel = this.propertyTypes.find(p => p.value === this.propertyType)?.label ?? '';
    const roomLines = this.rooms().map(r =>
      `  ${r.name}: ${this.roomVolume(r).toFixed(1)}m³ × ${this.baseFactor()} × ${this.wallFactor(r.wallType)} = ${this.roomBtu(r).toLocaleString()} BTU/hr`
    );
    const lines = [
      `Heat load - ${propLabel}${this.postcode ? ' (' + this.postcode.toUpperCase() + ')' : ''}`,
      `Rooms (${this.rooms().length}):`,
      ...roomLines,
      `Room/volume subtotal: ${this.roomLoad().toLocaleString()} BTU/hr`,
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
