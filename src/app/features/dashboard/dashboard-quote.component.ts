import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { SizingService } from '../../core/services/sizing.service';
import { EngineerService } from '../../core/services/engineer.service';
import { InvoiceService } from '../../core/services/invoice.service';
import { QuotationService, SaveQuotePayload } from '../../core/services/quotation.service';
import { generateQuoteItems, PROPERTY_TYPES, WALL_TYPES } from '../../core/mock/mock-data';
import { InvoiceItem, EquipRow, SavedQuoteStatus } from '../../core/models/models';

@Component({
  selector: 'app-dashboard-quote',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="qb-page">

      <!-- ═══════════ PREVIEW (printable document) ═══════════ -->
      @if (preview()) {
        <div class="qb-preview-top qb-noprint">
          <div class="qb-preview-bar">
            <button class="btn-text btn-sm" (click)="preview.set(false)">&#8592; Back to editor</button>
            <div class="qb-preview-actions">
              <button class="btn-secondary btn-sm" (click)="print()">Print / Save PDF</button>
              @if (status() === 'draft') {
                <button class="btn-primary btn-sm" (click)="sendQuote()">Send to customer</button>
              }
              @if (status() === 'sent') {
                <button class="btn-secondary btn-sm qb-decline-btn" (click)="markDeclined()">Mark declined</button>
                <button class="btn-primary btn-sm qb-accept-btn" (click)="markAccepted()">Mark accepted</button>
              }
              @if (status() === 'accepted' || status() === 'declined') {
                <button class="btn-text btn-sm" (click)="reopenDraft()">Reopen as draft</button>
              }
              <button class="btn-sm" [class.btn-primary]="status() === 'accepted'" [class.btn-secondary]="status() !== 'accepted'" (click)="createInvoice()">Create invoice</button>
            </div>
          </div>

          <!-- Lifecycle stepper -->
          <div class="qb-lifecycle">
            <div class="lc-step" [class.lc-done]="lifecycleIndex() > 0" [class.lc-active]="lifecycleIndex() === 0">
              <span class="lc-dot">@if (lifecycleIndex() > 0) { <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg> } @else { 1 }</span>
              <span class="lc-label">Draft</span>
            </div>
            <div class="lc-track" [class.lc-filled]="lifecycleIndex() >= 1"></div>
            <div class="lc-step" [class.lc-done]="lifecycleIndex() > 1" [class.lc-active]="lifecycleIndex() === 1">
              <span class="lc-dot">@if (lifecycleIndex() > 1) { <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg> } @else { 2 }</span>
              <span class="lc-label">Sent</span>
            </div>
            <div class="lc-track" [class.lc-filled]="lifecycleIndex() >= 2"></div>
            <div class="lc-step" [class.lc-active]="lifecycleIndex() === 2" [class.lc-declined]="isDeclined()">
              <span class="lc-dot">
                @if (isDeclined()) { <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg> }
                @else if (lifecycleIndex() === 2) { <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg> }
                @else { 3 }
              </span>
              <span class="lc-label">{{ isDeclined() ? 'Declined' : 'Accepted' }}</span>
            </div>
          </div>

          @if (actionError()) { <div class="qb-error">{{ actionError() }}</div> }
          @if (savedMsg()) { <div class="qb-saved"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg> {{ savedMsg() }}</div> }
        </div>

        <div class="qb-doc" id="quote-doc">
          <!-- Header -->
          <div class="doc-head">
            <div class="doc-brand">
              @if (company.logoUrl) {
                <img [src]="company.logoUrl" alt="{{ company.name }} logo" class="doc-logo-img" />
              } @else {
                <div class="doc-logo">{{ company.name || 'Your Company' }}</div>
              }
              <div class="doc-contact">
                @if (company.email) { <span>{{ company.email }}</span> }
                @if (company.phone) { <span>{{ company.phone }}</span> }
                @if (company.website) { <span>{{ company.website }}</span> }
                @if (company.address) { <span class="doc-contact-addr">{{ company.address }}</span> }
                @if (company.regNumber) { <span>Company No. {{ company.regNumber }}</span> }
                @if (company.vatNumber) { <span>VAT Reg. No. {{ company.vatNumber }}</span> }
              </div>
            </div>
            <div class="doc-meta">
              <div class="doc-quote-word">QUOTATION</div>
              <div class="doc-meta-row"><span>Ref</span><strong>{{ quoteRef }}</strong></div>
              <div class="doc-meta-row"><span>Date</span><span>{{ quoteDate | date:'dd/MM/yyyy' }}</span></div>
              <div class="doc-meta-row"><span>Valid</span><span>30 days</span></div>
            </div>
          </div>

          <div class="doc-to">
            <div class="doc-label">To</div>
            <strong>{{ customerName || '[Customer name]' }}</strong>
            <div class="doc-address">{{ customerAddress || '[Customer address]' }}</div>
          </div>

          <h2 class="doc-title">{{ quoteTitle }}</h2>

          <p class="doc-intro">
            Dear {{ customerName ? customerName.split(' ')[0] : 'Sir/Madam' }},<br>
            Thank you for the opportunity to provide a quotation for the works described below at your property.
          </p>

          <!-- Scope -->
          @if (scopeLines().length) {
            <section class="doc-section">
              <h3>Scope of Works</h3>
              <ul class="doc-bullets">
                @for (line of scopeLines(); track $index) { <li>{{ line }}</li> }
              </ul>
            </section>
          }

          <!-- Equipment schedule -->
          @if (equipment().length) {
            <section class="doc-section">
              <h3>Equipment Schedule</h3>
              <table class="doc-table">
                <thead><tr><th class="c-q">Qty</th><th class="c-m">Model</th><th>Description</th></tr></thead>
                <tbody>
                  @for (e of equipment(); track $index) {
                    <tr><td class="c-q">{{ e.qty }}</td><td class="c-m">{{ e.model || '-' }}</td><td>{{ e.description }}</td></tr>
                  }
                </tbody>
              </table>
            </section>
          }

          <!-- Cost breakdown -->
          <section class="doc-section">
            <h3>Cost Breakdown</h3>
            <table class="doc-table doc-cost">
              <thead><tr><th>Description</th><th class="c-cost">Cost (£)</th></tr></thead>
              <tbody>
                @for (item of items(); track $index) {
                  <tr><td>{{ item.description }}</td><td class="c-cost">{{ lineTotal(item) | number:'1.0-0' }}</td></tr>
                }
              </tbody>
              <tfoot>
                <tr><td class="tf-lbl">Subtotal</td><td class="c-cost">£{{ subtotal() | number:'1.0-0' }}</td></tr>
              </tfoot>
            </table>
          </section>

          <!-- Additional works -->
          @if (addWorks() && (addWorksCost || addWorksDesc)) {
            <section class="doc-section">
              <h3>Additional Works</h3>
              <p class="doc-addworks">{{ addWorksDesc }}</p>
              <table class="doc-table doc-cost">
                <tbody><tr><td>Additional works</td><td class="c-cost">£{{ addWorksCost | number:'1.0-0' }}</td></tr></tbody>
              </table>
            </section>
          }

          <!-- Summary -->
          <section class="doc-section">
            <h3>Summary of Costs</h3>
            <table class="doc-table doc-cost doc-summary">
              <tbody>
                <tr><td>Subtotal</td><td class="c-cost">£{{ subtotal() | number:'1.0-0' }}</td></tr>
                @if (addWorks() && addWorksCost) {
                  <tr><td>Additional works</td><td class="c-cost">£{{ addWorksCost | number:'1.0-0' }}</td></tr>
                }
                @if (applyVat()) {
                  <tr><td>VAT (20%)</td><td class="c-cost">£{{ vat() | number:'1.2-2' }}</td></tr>
                }
              </tbody>
              <tfoot>
                <tr><td class="tf-lbl">Total{{ applyVat() ? ' (inc. VAT)' : '' }}</td><td class="c-cost tf-total">£{{ total() | number:'1.2-2' }}</td></tr>
              </tfoot>
            </table>
          </section>

          <!-- Exclusions -->
          @if (exclusionLines().length) {
            <section class="doc-section">
              <h3>Exclusions</h3>
              <ul class="doc-bullets">
                @for (line of exclusionLines(); track $index) { <li>{{ line }}</li> }
              </ul>
            </section>
          }

          <!-- Notes -->
          @if (noteLines().length) {
            <section class="doc-section">
              <h3>Notes</h3>
              <ul class="doc-bullets">
                @for (line of noteLines(); track $index) { <li>{{ line }}</li> }
              </ul>
            </section>
          }

          <p class="doc-outro">
            We trust this quotation meets your requirements and look forward to working with you.
            Please do not hesitate to contact us should you have any questions or wish to proceed.
          </p>

          <div class="doc-signoff">
            <span>Yours sincerely,</span>
            <strong>{{ company.contact || auth.currentUser()!.fullName }}</strong>
            @if (company.name) { <span>{{ company.name }}</span> }
          </div>
        </div>
      }

      <!-- ═══════════ EDITOR ═══════════ -->
      @if (!preview()) {
        <div class="qb-titlerow">
          <div>
            <h1>Quote builder</h1>
            <p class="qb-sub">Generate accurate pricing, then produce a professional, send-ready quotation.</p>
          </div>
          @if (generated()) {
            <button class="btn-text btn-sm" (click)="reset()">Start again</button>
          }
        </div>

        <div class="qb-grid">

          <!-- ── Inputs ─────────────────────────────────────────────────── -->
          <div class="qb-card qb-inputs">
            @if (sizingNote()) {
              <div class="qb-sizing-banner">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M2 12h20M5 5l14 14M5 19 19 5"/></svg>
                <span>{{ sizingNote() }}</span>
              </div>
            }
            <div class="qb-card-head">
              <span class="qb-head-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 7h8M8 11h2M8 15h2M14 11h2M14 15h2"/></svg></span>
              <h3>Job details</h3>
            </div>

            <div class="qb-fields">
              <div class="qb-field qb-field-wide">
                <label>Job type</label>
                <select [(ngModel)]="jobType" name="jobType">
                  <option value="install">New installation</option>
                  <option value="replace">Replacement</option>
                  <option value="service">Service / maintenance</option>
                  <option value="emergency">Emergency repair</option>
                </select>
              </div>
              <div class="qb-field">
                <label>Property type</label>
                <select [(ngModel)]="propertyType" name="prop">
                  @for (pt of propertyTypes; track pt.value) { <option [value]="pt.value">{{ pt.label }}</option> }
                </select>
              </div>
              <div class="qb-field">
                <label>Postcode <span class="qb-opt">optional</span></label>
                <input type="text" [(ngModel)]="jobPostcode" name="postcode" placeholder="e.g. SW1A 1AA" />
              </div>

              @if (isIR()) {
                <div class="qb-field">
                  <label>How many rooms</label>
                  <select [(ngModel)]="unitCount" name="units">
                    <option [ngValue]="1">1 room</option>
                    <option [ngValue]="2">2 rooms (multi-split)</option>
                    <option [ngValue]="3">3 rooms (multi-split)</option>
                    <option [ngValue]="4">4+ (VRF / large)</option>
                  </select>
                </div>
                <div class="qb-field">
                  <label>Wall type</label>
                  <select [(ngModel)]="wallType" name="wallType">
                    @for (wt of wallTypes; track wt.value) { <option [value]="wt.value">{{ wt.label }}</option> }
                  </select>
                </div>
                <div class="qb-field">
                  <label>Room length <span class="qb-opt">m</span></label>
                  <input type="number" [(ngModel)]="roomLengthM" name="roomLen" min="1" step="0.1" />
                </div>
                <div class="qb-field">
                  <label>Room width <span class="qb-opt">m</span></label>
                  <input type="number" [(ngModel)]="roomWidthM" name="roomWid" min="1" step="0.1" />
                </div>
                <div class="qb-field qb-field-wide qb-room-hint">Main room area: <strong>{{ roomSizeM2 }} m²</strong></div>
                <div class="qb-field qb-field-wide">
                  <label>Brand / budget tier</label>
                  <select [(ngModel)]="brandTier" name="tier">
                    <option value="budget">Budget-range</option>
                    <option value="mid">Mid-range</option>
                    <option value="premium">Premium</option>
                  </select>
                </div>
              }
              @if (jobType === 'service') {
                <div class="qb-field">
                  <label>Service type</label>
                  <select [(ngModel)]="serviceJobType" name="svc">
                    <option value="annual">Annual service</option>
                    <option value="strip">Deep clean</option>
                    <option value="repair">Non-urgent repair</option>
                  </select>
                </div>
                <div class="qb-field">
                  <label>Number of units</label>
                  <select [(ngModel)]="unitCount" name="svcunits">
                    <option [ngValue]="1">1 unit</option><option [ngValue]="2">2 units</option>
                    <option [ngValue]="3">3 units</option><option [ngValue]="4">4+ units</option>
                  </select>
                </div>
              }
            </div>

            <button class="btn-primary qb-generate" (click)="generate()">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z"/></svg>
              {{ generated() ? 'Regenerate' : 'Generate quote' }}
            </button>
          </div>

          <!-- ── Output ─────────────────────────────────────────────────── -->
          <div class="qb-card qb-output">
            @if (!generated()) {
              <div class="qb-empty">
                <span class="qb-empty-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3 8-8"/><path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9"/></svg></span>
                <p><strong>Your quote will appear here.</strong></p>
                <p class="qb-empty-sub">Set the job details and hit <em>Generate quote</em> - you'll get itemised pricing plus an editable, professional document.</p>
              </div>
            } @else {
              <div class="qb-card-head qb-out-head">
                <div><h3>Quote</h3><p class="qb-meta">{{ meta().summary }} · {{ meta().recommendedBtu }} · est. {{ meta().estimatedDuration }}</p></div>
                <span class="qb-suggest">Suggested - edit freely</span>
              </div>

              <!-- Customer + reference -->
              <div class="qb-block">
                <div class="qb-block-title">Customer &amp; reference</div>
                <div class="qb-two">
                  <div class="qb-field"><label>Customer name</label><input type="text" [(ngModel)]="customerName" name="cn" placeholder="John Smith" /></div>
                  <div class="qb-field"><label>Customer email</label><input type="email" [(ngModel)]="customerEmail" name="ce" placeholder="john@example.com" /></div>
                </div>
                <div class="qb-field"><label>Site address</label><textarea [(ngModel)]="customerAddress" name="addr" rows="2" placeholder="145 Shenley Lane&#10;AL2 1LL"></textarea></div>
                <div class="qb-two">
                  <div class="qb-field"><label>Quote reference</label><input type="text" [(ngModel)]="quoteRef" name="ref" /></div>
                  <div class="qb-field"><label>Quote title</label><input type="text" [(ngModel)]="quoteTitle" name="qtitle" /></div>
                </div>
              </div>

              <!-- Scope of works -->
              <div class="qb-block">
                <div class="qb-block-title">Scope of works <span class="qb-block-hint">one item per line</span></div>
                <textarea [(ngModel)]="scopeText" name="scope" rows="6" class="qb-textarea-mono"></textarea>
              </div>

              <!-- Equipment schedule -->
              <div class="qb-block">
                <div class="qb-block-title">Equipment schedule</div>
                <div class="qb-eq-head"><span>Qty</span><span>Model</span><span>Description</span><span></span></div>
                @for (e of equipment(); track $index; let i = $index) {
                  <div class="qb-eq-row">
                    <input type="number" [(ngModel)]="e.qty" [name]="'eqq'+i" min="1" />
                    <input type="text" [(ngModel)]="e.model" [name]="'eqm'+i" placeholder="Model no." />
                    <input type="text" [(ngModel)]="e.description" [name]="'eqd'+i" placeholder="Description" />
                    <button class="qb-del" (click)="removeEquip(i)" type="button" aria-label="Remove"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/></svg></button>
                  </div>
                }
                <button class="qb-add" (click)="addEquip()" type="button"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg> Add equipment</button>
              </div>

              <!-- Cost breakdown -->
              <div class="qb-block">
                <div class="qb-block-title">Cost breakdown</div>

                <div class="qb-extras-row">
                  <span class="qb-extras-lbl">Quick add:</span>
                  @for (ex of commonExtras; track ex.label) {
                    <button type="button" class="qb-extra-chip" (click)="addExtra(ex)">+ {{ ex.label }}</button>
                  }
                </div>

                <div class="qb-items-head"><span class="c-desc">Description</span><span class="c-qty">Qty</span><span class="c-price">Unit £</span><span class="c-total">Total</span><span class="c-x"></span></div>
                @for (item of items(); track $index; let i = $index) {
                  <div class="qb-item-row" [class.qb-item-negative]="lineTotal(item) < 0">
                    <input class="c-desc" type="text" [(ngModel)]="item.description" [name]="'d'+i" placeholder="Description" aria-label="Description" />
                    <input class="c-qty" type="number" [(ngModel)]="item.quantity" [name]="'q'+i" min="1" placeholder="Qty" aria-label="Quantity" />
                    <input class="c-price" type="number" [(ngModel)]="item.unitPrice" [name]="'p'+i" step="1" placeholder="Unit £" aria-label="Unit price" />
                    <span class="c-total">£{{ lineTotal(item) | number:'1.2-2' }}</span>
                    <button class="c-x qb-del" (click)="removeItem(i)" type="button" aria-label="Remove"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/></svg></button>
                  </div>
                }
                <div class="qb-cost-actions">
                  <button class="qb-add" (click)="addItem()" type="button"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg> Add line</button>
                  <button class="qb-add qb-adjust-toggle" (click)="toggleAdjust()" type="button"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h16M4 6h10M4 18h10"/></svg> Add discount / surcharge</button>
                </div>

                @if (adjustOpen()) {
                  <div class="qb-adjust-form">
                    <div class="qb-two">
                      <div class="qb-field">
                        <label>Type</label>
                        <select [(ngModel)]="adjustType" name="adjType">
                          <option value="discount">Discount</option>
                          <option value="surcharge">Surcharge</option>
                        </select>
                      </div>
                      <div class="qb-field">
                        <label>Method</label>
                        <select [(ngModel)]="adjustMethod" name="adjMethod">
                          <option value="percent">% of subtotal</option>
                          <option value="fixed">Fixed amount £</option>
                        </select>
                      </div>
                    </div>
                    <div class="qb-two">
                      <div class="qb-field">
                        <label>{{ adjustMethod === 'percent' ? 'Percentage' : 'Amount £' }}</label>
                        <input type="number" [(ngModel)]="adjustValue" name="adjValue" min="0" step="1" />
                      </div>
                      <div class="qb-field">
                        <label>Note <span class="qb-opt">optional</span></label>
                        <input type="text" [(ngModel)]="adjustNote" name="adjNote" placeholder="e.g. loyalty, difficult access" />
                      </div>
                    </div>
                    <div class="qb-adjust-actions">
                      <button type="button" class="btn-secondary btn-sm" (click)="adjustOpen.set(false)">Cancel</button>
                      <button type="button" class="btn-primary btn-sm" (click)="applyAdjustment()">Add to quote</button>
                    </div>
                  </div>
                }
              </div>

              <!-- Additional works -->
              <div class="qb-block">
                <label class="qb-check"><input type="checkbox" [(ngModel)]="addWorksModel" name="aw" (ngModelChange)="addWorks.set($event)" /> <span>Add "Additional works" section (e.g. electrical supply)</span></label>
                @if (addWorks()) {
                  <div class="qb-two qb-aw">
                    <div class="qb-field qb-aw-desc"><label>Description</label><textarea [(ngModel)]="addWorksDesc" name="awd" rows="2" placeholder="Provision of a new power supply from the distribution board to the outdoor unit (32A RCBO, isolator, containment & cabling)."></textarea></div>
                    <div class="qb-field"><label>Cost £</label><input type="number" [(ngModel)]="addWorksCost" name="awc" min="0" /></div>
                  </div>
                }
              </div>

              <!-- Exclusions & notes -->
              <div class="qb-two">
                <div class="qb-block"><div class="qb-block-title">Exclusions</div><textarea [(ngModel)]="exclusionsText" name="excl" rows="4" class="qb-textarea-mono"></textarea></div>
                <div class="qb-block"><div class="qb-block-title">Notes</div><textarea [(ngModel)]="notesText" name="notes" rows="4" class="qb-textarea-mono"></textarea></div>
              </div>

              <!-- Totals -->
              <div class="qb-totals">
                <label class="qb-check" [class.qb-check-disabled]="!company.vatNumber">
                  <input type="checkbox" [(ngModel)]="applyVatModel" name="vat" [disabled]="!company.vatNumber" (ngModelChange)="applyVat.set($event)" />
                  <span>Add VAT (20%)</span>
                </label>
                @if (!company.vatNumber) {
                  <span class="qb-vat-hint">Add a VAT number in your profile to charge VAT.</span>
                }
                <div class="qb-tot-rows">
                  <div class="qb-tot-row"><span>Subtotal</span><span>£{{ subtotal() | number:'1.2-2' }}</span></div>
                  @if (addWorks() && addWorksCost) { <div class="qb-tot-row"><span>Additional works</span><span>£{{ addWorksCost | number:'1.2-2' }}</span></div> }
                  @if (applyVat()) { <div class="qb-tot-row"><span>VAT (20%)</span><span>£{{ vat() | number:'1.2-2' }}</span></div> }
                  <div class="qb-tot-grand"><span>Total</span><span>£{{ total() | number:'1.2-2' }}</span></div>
                </div>
              </div>

              @if (actionError()) { <div class="qb-error">{{ actionError() }}</div> }
              @if (savedMsg()) { <div class="qb-saved"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg> {{ savedMsg() }}</div> }

              <div class="qb-actions">
                <button class="btn-primary btn-sm" (click)="openPreview()">Preview quote</button>
                <button class="btn-secondary btn-sm" (click)="createInvoice()">Create invoice</button>
                <button class="btn-secondary btn-sm" (click)="saveQuote()">Save</button>
              </div>
              <p class="qb-disclaimer">Prices are suggested from typical market rates and your job inputs. Always confirm on-site before booking.</p>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .qb-page { display: flex; flex-direction: column; gap: 1.1rem; max-width: 1040px; }
    .qb-titlerow { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; }
    .qb-titlerow h1 { font-size: 1.25rem; font-weight: 700; margin: 0 0 0.15rem; }
    .qb-sub { font-size: 0.8rem; color: var(--text-muted); margin: 0; }

    .qb-grid { display: grid; grid-template-columns: 1fr; gap: 1.1rem; align-items: start; }
    .qb-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); padding: 1.25rem; }
    .qb-card-head { display: flex; align-items: center; gap: 0.6rem; margin-bottom: 1.1rem; }
    .qb-head-ico { width: 34px; height: 34px; flex-shrink: 0; border-radius: 10px; background: var(--brand-light); color: var(--brand); display: inline-flex; align-items: center; justify-content: center; }
    .qb-head-ico svg { width: 19px; height: 19px; }
    .qb-card-head h3 { font-size: 0.95rem; font-weight: 700; margin: 0; }
    .qb-sizing-banner { display: flex; align-items: flex-start; gap: 0.55rem; background: var(--brand-light); border: 1px solid #bfdbfe; border-radius: var(--radius-md); padding: 0.7rem 0.85rem; margin-bottom: 1rem; font-size: 0.82rem; color: var(--brand-dark); line-height: 1.45; }
    .qb-sizing-banner svg { width: 18px; height: 18px; flex-shrink: 0; color: var(--brand); margin-top: 0.05rem; }

    .qb-fields { display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 0.7rem 0.75rem; margin-bottom: 1.1rem; }
    .qb-field { display: flex; flex-direction: column; gap: 0.3rem; min-width: 0; }
    .qb-field-wide { grid-column: span 2; }
    .qb-field label { font-size: 0.72rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.04em; }
    .qb-opt { color: var(--text-muted); font-weight: 400; text-transform: none; letter-spacing: 0; }
    .qb-field input, .qb-field select, .qb-field textarea { padding: 0.55rem 0.7rem; border: 1.5px solid var(--border); border-radius: var(--radius-sm); font-size: 0.9rem; background: var(--surface); width: 100%; box-sizing: border-box; font-family: inherit; }
    .qb-room-hint { font-size: 0.8rem; color: var(--text-secondary); background: var(--bg); border-radius: var(--radius-sm); padding: 0.55rem 0.7rem; justify-content: center; }
    .qb-room-hint strong { color: var(--brand); }
    .qb-generate { width: 100%; display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem; }
    .qb-generate svg { width: 17px; height: 17px; }

    .qb-empty { text-align: center; padding: 2.5rem 1rem; }
    .qb-empty-ico { width: 56px; height: 56px; margin: 0 auto 0.85rem; border-radius: 16px; background: var(--brand-light); color: var(--brand); display: flex; align-items: center; justify-content: center; }
    .qb-empty-ico svg { width: 28px; height: 28px; }
    .qb-empty p { margin: 0 0 0.25rem; font-size: 0.92rem; color: var(--text-primary); }
    .qb-empty-sub { font-size: 0.85rem; color: var(--text-muted) !important; max-width: 340px; margin: 0 auto !important; }

    .qb-out-head { align-items: flex-start; justify-content: space-between; }
    .qb-meta { font-size: 0.78rem; color: var(--text-muted); margin: 0.2rem 0 0; }
    .qb-suggest { font-size: 0.68rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: var(--brand); background: var(--brand-light); padding: 0.25rem 0.6rem; border-radius: 999px; white-space: nowrap; flex-shrink: 0; }

    /* Editor blocks */
    .qb-block { padding: 1rem 0; border-top: 1px solid var(--border); }
    .qb-block-title { font-size: 0.72rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.7rem; }
    .qb-block-hint { font-weight: 400; text-transform: none; letter-spacing: 0; color: var(--text-muted); }
    .qb-two { display: grid; grid-template-columns: 1fr 1fr; gap: 0.7rem; }
    .qb-textarea-mono { width: 100%; padding: 0.6rem 0.7rem; border: 1.5px solid var(--border); border-radius: var(--radius-sm); font-size: 0.85rem; line-height: 1.5; box-sizing: border-box; font-family: inherit; resize: vertical; }
    .qb-check { display: flex; align-items: center; gap: 0.45rem; font-size: 0.85rem; color: var(--text-secondary); cursor: pointer; }
    .qb-check-disabled { opacity: 0.55; cursor: not-allowed; }
    .qb-vat-hint { display: block; font-size: 0.74rem; color: var(--text-muted); margin-top: 0.3rem; }
    .qb-aw { margin-top: 0.7rem; grid-template-columns: 1fr 120px; }
    .qb-aw-desc textarea { font-family: inherit; }

    /* Equipment rows */
    .qb-eq-head, .qb-eq-row { display: grid; grid-template-columns: 50px 1fr 1.4fr 30px; gap: 0.4rem; align-items: center; }
    .qb-eq-head { font-size: 0.66rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.04em; padding-bottom: 0.4rem; }
    .qb-eq-row { margin-bottom: 0.45rem; }
    .qb-eq-row input { padding: 0.45rem 0.55rem; border: 1.5px solid var(--border); border-radius: 7px; font-size: 0.83rem; width: 100%; box-sizing: border-box; }

    /* Cost items */
    .qb-items-head, .qb-item-row { display: grid; grid-template-columns: 1fr 52px 78px 80px 30px; gap: 0.4rem; align-items: center; }
    .qb-items-head { font-size: 0.66rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.04em; padding-bottom: 0.45rem; border-bottom: 1px solid var(--border); }
    .qb-item-row { margin-top: 0.45rem; }
    .qb-item-row input { width: 100%; padding: 0.5rem 0.6rem; border: 1.5px solid var(--border); border-radius: 7px; font-size: 0.84rem; box-sizing: border-box; }
    .c-qty, .c-price { text-align: right; }
    .c-total { font-size: 0.84rem; font-weight: 700; color: var(--text-primary); text-align: right; }
    .qb-items-head .c-qty, .qb-items-head .c-price, .qb-items-head .c-total { text-align: right; }
    .qb-del { background: none; border: 1px solid var(--border); border-radius: 7px; color: var(--text-muted); cursor: pointer; padding: 0.32rem; display: inline-flex; align-items: center; justify-content: center; }
    .qb-del svg { width: 14px; height: 14px; }
    .qb-del:hover { color: var(--danger); border-color: #fca5a5; }
    .qb-add { display: inline-flex; align-items: center; gap: 0.35rem; margin-top: 0.6rem; background: none; border: 1.5px dashed var(--border); border-radius: var(--radius-sm); color: var(--brand); font-size: 0.82rem; font-weight: 600; padding: 0.45rem 0.8rem; cursor: pointer; }
    .qb-add svg { width: 15px; height: 15px; }
    .qb-add:hover { border-color: var(--brand); background: var(--brand-light); }

    .qb-totals { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; flex-wrap: wrap; padding: 1rem 0; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); margin: 0.5rem 0 1rem; }
    .qb-tot-rows { min-width: 200px; margin-left: auto; display: flex; flex-direction: column; gap: 0.3rem; }
    .qb-tot-row { display: flex; justify-content: space-between; font-size: 0.85rem; color: var(--text-secondary); }
    .qb-tot-grand { display: flex; justify-content: space-between; font-size: 1.15rem; font-weight: 800; color: var(--text-primary); padding-top: 0.5rem; margin-top: 0.15rem; border-top: 2px solid var(--text-primary); }
    .qb-tot-grand span:last-child { color: var(--brand); }

    .qb-error { color: var(--danger); font-size: 0.83rem; margin-bottom: 0.75rem; }
    .qb-saved { display: flex; align-items: center; gap: 0.4rem; color: var(--success); font-size: 0.85rem; font-weight: 600; margin-bottom: 0.75rem; }
    .qb-saved svg { width: 16px; height: 16px; }
    .qb-actions { display: flex; gap: 0.5rem; flex-wrap: wrap; }
    .qb-disclaimer { font-size: 0.72rem; color: var(--text-muted); margin-top: 0.85rem; line-height: 1.5; }

    /* ═══ Preview bar ═══ */
    .qb-preview-top { display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1.1rem; }
    .qb-preview-bar { display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md); box-shadow: var(--shadow-sm); padding: 0.6rem 0.85rem; }
    .qb-preview-actions { display: flex; gap: 0.5rem; flex-wrap: wrap; }
    .qb-decline-btn { color: var(--danger); border-color: #fca5a5; }
    .qb-decline-btn:hover { background: var(--danger-bg); border-color: var(--danger); }
    .qb-accept-btn { background: var(--success); border-color: var(--success); }
    .qb-accept-btn:hover { filter: brightness(1.08); }

    /* Lifecycle stepper */
    .qb-lifecycle { display: flex; align-items: flex-start; justify-content: center; gap: 0; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md); box-shadow: var(--shadow-sm); padding: 1rem 1.5rem; }
    .lc-step { display: flex; flex-direction: column; align-items: center; gap: 0.35rem; flex: 0 0 auto; }
    .lc-dot { width: 28px; height: 28px; border-radius: 50%; background: var(--bg); border: 2px solid var(--border); color: var(--text-muted); font-size: 0.78rem; font-weight: 700; display: flex; align-items: center; justify-content: center; }
    .lc-dot svg { width: 14px; height: 14px; }
    .lc-label { font-size: 0.74rem; font-weight: 600; color: var(--text-muted); }
    .lc-step.lc-active .lc-dot { border-color: var(--brand); color: var(--brand); background: var(--brand-light); }
    .lc-step.lc-active .lc-label { color: var(--brand); }
    .lc-step.lc-done .lc-dot { background: var(--success); border-color: var(--success); color: #fff; }
    .lc-step.lc-done .lc-label { color: var(--text-primary); }
    .lc-step.lc-declined .lc-dot { background: var(--danger); border-color: var(--danger); color: #fff; }
    .lc-step.lc-declined .lc-label { color: var(--danger); }
    .lc-track { width: 56px; height: 2px; background: var(--border); margin: 13px 0.5rem 0; flex-shrink: 0; }
    .lc-track.lc-filled { background: var(--success); }

    /* Quick-add extras */
    .qb-extras-row { display: flex; flex-wrap: wrap; align-items: center; gap: 0.4rem; margin-bottom: 0.85rem; }
    .qb-extras-lbl { font-size: 0.74rem; color: var(--text-muted); font-weight: 600; margin-right: 0.15rem; }
    .qb-extra-chip { font-size: 0.78rem; font-weight: 500; color: var(--brand); background: var(--brand-light); border: 1px solid #bfdbfe; border-radius: 999px; padding: 0.3rem 0.7rem; cursor: pointer; transition: all 0.12s; }
    .qb-extra-chip:hover { background: var(--brand); color: #fff; border-color: var(--brand); }

    .qb-item-negative .c-total { color: var(--danger); }
    .qb-cost-actions { display: flex; gap: 0.5rem; flex-wrap: wrap; }

    /* Manual adjustment */
    .qb-adjust-form { margin-top: 0.85rem; padding: 1rem; background: var(--bg); border: 1px solid var(--border); border-radius: var(--radius-md); display: flex; flex-direction: column; gap: 0.75rem; }
    .qb-adjust-actions { display: flex; justify-content: flex-end; gap: 0.5rem; }

    /* ═══ Document ═══ */
    .qb-doc {
      background: #fff; color: #1a1a1a; max-width: 800px; margin: 0 auto;
      border: 1px solid var(--border); border-radius: var(--radius-md); box-shadow: var(--shadow-md);
      padding: 2.5rem 2.75rem; font-size: 0.9rem; line-height: 1.55;
    }
    .doc-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 2rem; border-bottom: 3px solid var(--brand); padding-bottom: 1rem; margin-bottom: 1.5rem; }
    .doc-logo { font-size: 1.4rem; font-weight: 800; color: var(--ink-2); letter-spacing: -0.01em; }
    .doc-logo-img { max-width: 180px; max-height: 56px; object-fit: contain; }
    .doc-contact { display: flex; flex-direction: column; gap: 0.1rem; margin-top: 0.4rem; font-size: 0.78rem; color: #555; }
    .doc-contact-addr { white-space: pre-line; margin-top: 0.15rem; }
    .doc-meta { text-align: right; flex-shrink: 0; }
    .doc-quote-word { font-size: 1.1rem; font-weight: 800; letter-spacing: 0.15em; color: var(--brand); margin-bottom: 0.4rem; }
    .doc-meta-row { display: flex; justify-content: flex-end; gap: 0.75rem; font-size: 0.82rem; color: #555; }
    .doc-meta-row strong { color: #1a1a1a; }

    .doc-to { margin-bottom: 1.25rem; }
    .doc-label { font-size: 0.68rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #888; margin-bottom: 0.2rem; }
    .doc-to strong { font-size: 0.95rem; display: block; }
    .doc-address { font-size: 0.85rem; color: #444; white-space: pre-line; }

    .doc-title { font-size: 1.05rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.01em; color: var(--ink-2); margin: 0 0 1rem; line-height: 1.35; }
    .doc-intro, .doc-outro { font-size: 0.88rem; color: #333; margin-bottom: 1.5rem; }

    .doc-section { margin-bottom: 1.5rem; }
    .doc-section h3 { font-size: 0.82rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: var(--brand); border-bottom: 1px solid #e5e5e5; padding-bottom: 0.35rem; margin: 0 0 0.7rem; }
    .doc-bullets { margin: 0; padding-left: 1.1rem; }
    .doc-bullets li { font-size: 0.86rem; color: #333; margin-bottom: 0.3rem; }

    .doc-table { width: 100%; border-collapse: collapse; }
    .doc-table th { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.04em; color: #777; text-align: left; padding: 0.4rem 0.5rem; border-bottom: 2px solid #ddd; }
    .doc-table td { font-size: 0.85rem; padding: 0.4rem 0.5rem; border-bottom: 1px solid #eee; color: #2a2a2a; }
    .doc-table .c-q { width: 44px; text-align: center; }
    .doc-table .c-m { width: 160px; font-family: ui-monospace, monospace; font-size: 0.8rem; }
    .doc-cost .c-cost { text-align: right; width: 110px; white-space: nowrap; }
    .doc-table tfoot td { border-bottom: none; border-top: 2px solid #ccc; font-weight: 700; padding-top: 0.5rem; }
    .doc-table .tf-lbl { text-align: right; }
    .doc-summary tfoot .tf-total { color: var(--brand); font-size: 1rem; }
    .doc-addworks { font-size: 0.85rem; color: #333; margin: 0 0 0.6rem; }

    .doc-signoff { margin-top: 2rem; display: flex; flex-direction: column; gap: 0.15rem; }
    .doc-signoff span { font-size: 0.85rem; color: #444; }
    .doc-signoff strong { font-size: 0.95rem; margin-top: 0.75rem; }

    @media (min-width: 900px) {
      .qb-grid { grid-template-columns: 320px 1fr; }
      .qb-inputs { position: sticky; top: 80px; }
    }
    @media (max-width: 640px) {
      .qb-card { padding: 1rem; }
      .qb-two, .qb-aw { grid-template-columns: 1fr; }
      .qb-out-head { flex-direction: column; gap: 0.5rem; }
      .qb-titlerow { flex-wrap: wrap; }

      /* Preview bar → full-width actions */
      .qb-preview-bar { flex-wrap: wrap; }
      .qb-preview-actions { width: 100%; }
      .qb-preview-actions .btn-secondary, .qb-preview-actions .btn-primary { flex: 1; text-align: center; }
      .qb-actions .btn-primary, .qb-actions .btn-secondary { flex: 1 1 45%; text-align: center; }

      /* Cost items: description on its own row, controls below */
      .qb-items-head { display: none; }
      .qb-item-row {
        grid-template-columns: 1fr 1fr auto 34px;
        grid-template-areas: 'desc desc desc desc' 'qty price total del';
        gap: 0.45rem; align-items: center; margin-top: 0.7rem;
        padding-top: 0.7rem; border-top: 1px solid var(--border);
      }
      .qb-item-row:first-of-type { border-top: none; margin-top: 0.5rem; }
      .qb-item-row .c-desc { grid-area: desc; }
      .qb-item-row .c-qty { grid-area: qty; text-align: left; }
      .qb-item-row .c-price { grid-area: price; text-align: left; }
      .qb-item-row .c-total { grid-area: total; }
      .qb-item-row .qb-del { grid-area: del; }

      /* Equipment: qty + model + delete on top, description underneath */
      .qb-eq-head { display: none; }
      .qb-eq-row {
        grid-template-columns: 60px 1fr 34px;
        grid-template-areas: 'qty model del' 'desc desc desc';
        gap: 0.45rem; margin-bottom: 0.7rem; padding-bottom: 0.7rem;
        border-bottom: 1px solid var(--border);
      }
      .qb-eq-row > input:nth-child(1) { grid-area: qty; }
      .qb-eq-row > input:nth-child(2) { grid-area: model; }
      .qb-eq-row > input:nth-child(3) { grid-area: desc; }
      .qb-eq-row > .qb-del { grid-area: del; }

      /* Document */
      .qb-doc { padding: 1.5rem 1.25rem; }
      .doc-head { flex-direction: column; gap: 0.75rem; }
      .doc-meta { text-align: left; }
      .doc-meta-row { justify-content: flex-start; }
      .doc-title { font-size: 0.98rem; }
      .doc-section { overflow-x: auto; }
      .doc-table { min-width: 340px; }
      .doc-table .c-m { width: auto; }
      .doc-cost .c-cost { width: 90px; }

      /* Preview bar / lifecycle */
      .qb-preview-actions { width: 100%; }
      .qb-preview-actions button { flex: 1 1 auto; text-align: center; }
      .qb-lifecycle { padding: 0.85rem 0.5rem; }
      .lc-track { width: 24px; margin: 13px 0.25rem 0; }
      .lc-label { font-size: 0.64rem; }
    }
    @media (max-width: 400px) {
      .qb-fields { grid-template-columns: 1fr; }
      .qb-field-wide { grid-column: span 1; }
    }
  `]
})
export class DashboardQuoteComponent {
  auth           = inject(AuthService);
  private router = inject(Router);
  private route  = inject(ActivatedRoute);
  private sizing = inject(SizingService);
  private engineerSvc = inject(EngineerService);
  private invoiceSvc  = inject(InvoiceService);
  private quotationSvc = inject(QuotationService);
  private eid = this.auth.currentUser()?.engineerId ?? 0;
  private loadedQuoteId: number | null = null;

  // Job inputs
  propertyTypes = PROPERTY_TYPES;
  wallTypes     = WALL_TYPES;

  jobType        = 'install';
  unitCount      = 1;
  roomLengthM    = 5;
  roomWidthM     = 5;
  propertyType   = 'flat';
  jobPostcode    = '';
  wallType       = 'cavity';
  brandTier      = 'mid';
  serviceJobType = 'annual';

  /** Main room area (m²), derived from length × width. */
  get roomSizeM2(): number { return Math.round((Number(this.roomLengthM) || 0) * (Number(this.roomWidthM) || 0)); }

  // Output state
  generated = signal(false);
  preview   = signal(false);
  items     = signal<InvoiceItem[]>([]);
  meta      = signal<{ summary: string; recommendedBtu: string; estimatedDuration: string }>({ summary: '', recommendedBtu: '', estimatedDuration: '' });
  applyVat  = signal(false);
  applyVatModel = false;

  // Quote lifecycle
  status = signal<SavedQuoteStatus>('draft');
  lifecycleIndex = computed(() => ({ draft: 0, sent: 1, accepted: 2, declined: 2 } as Record<SavedQuoteStatus, number>)[this.status()]);
  isDeclined = computed(() => this.status() === 'declined');

  // Quick-add extras
  readonly commonExtras: { label: string; description: string; unitPrice: number }[] = [
    { label: 'Call-out fee', description: 'Call-out fee (first hour included)', unitPrice: 90 },
    { label: 'Consumables & waste removal', description: 'Consumables, packaging removal & waste disposal', unitPrice: 45 },
    { label: 'Extended warranty', description: 'Manufacturer extended warranty registration', unitPrice: 0 },
    { label: 'Weekend / out-of-hours', description: 'Weekend / out-of-hours surcharge', unitPrice: 75 },
    { label: 'Additional refrigerant', description: 'Additional refrigerant charge (per 100g R32)', unitPrice: 35 },
    { label: 'Access equipment', description: 'Scaffold tower / access equipment hire', unitPrice: 120 },
  ];

  // Manual adjustment (discount / surcharge)
  adjustOpen   = signal(false);
  adjustType: 'discount' | 'surcharge' = 'discount';
  adjustMethod: 'percent' | 'fixed' = 'percent';
  adjustValue  = 10;
  adjustNote   = '';

  // Document fields
  customerName  = '';
  customerEmail = '';
  customerAddress = '';
  quoteRef   = '';
  quoteDate  = new Date();
  quoteTitle = '';
  scopeText  = '';
  equipment  = signal<EquipRow[]>([]);
  exclusionsText = '';
  notesText  = '';
  addWorks   = signal(false);
  addWorksModel = false;
  addWorksDesc = '';
  addWorksCost = 0;

  company = {
    name: '', contact: '', email: '', phone: '', website: '',
    address: '', regNumber: '', vatNumber: '', logoUrl: '' as string | null,
  };

  actionError = signal<string | null>(null);
  savedMsg    = signal<string | null>(null);

  // Heat-load handoff
  sizingNote = signal<string | null>(null);
  private sizingBtu: number | null = null;

  constructor() {
    // Company details from the engineer's profile
    if (this.eid) {
      this.engineerSvc.getById(this.eid).subscribe(eng => {
        if (!eng) return;
        const domain = eng.email?.split('@')[1] ?? '';
        this.company = {
          name: eng.companyName, contact: eng.fullName, email: eng.email, phone: eng.phone,
          website: domain ? 'www.' + domain : '', address: eng.companyAddress ?? '',
          regNumber: eng.companyRegNumber ?? '', vatNumber: eng.vatNumber ?? '',
          logoUrl: eng.companyLogoUrl ?? '',
        };
      });
    }
    this.quoteRef = this.newRef();

    // Loading an existing quote?
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) { this.loadQuote(Number(idParam)); return; }

    const rec = this.sizing.consume();
    if (rec) {
      this.jobType = 'install';
      if (rec.propertyType) this.propertyType = rec.propertyType;
      if (rec.postcode) this.jobPostcode = rec.postcode;
      if (rec.roomAreaM2 > 0) {
        // Heat-load hands off a total area, not a length/width pair — assume a square room as a sane, editable default.
        const side = Math.round(Math.sqrt(rec.roomAreaM2) * 10) / 10;
        this.roomLengthM = side;
        this.roomWidthM = side;
      }
      this.sizingBtu = rec.recommendedBtu;
      this.sizingNote.set(
        `Sized from heat-load calc: ${rec.totalBtu.toLocaleString()} BTU/hr (${rec.kw} kW) for ${rec.label.toLowerCase()} - ` +
        `pricing a ${rec.recommendedBtu.toLocaleString()} BTU ${rec.multiUnit ? 'multi-split' : 'unit'}.`
      );
      this.generate();
    }
  }

  isIR() { return this.jobType === 'install' || this.jobType === 'replace'; }

  scopeLines      = computed(() => this.scopeText.split('\n').map(l => l.trim()).filter(Boolean));
  exclusionLines  = computed(() => this.exclusionsText.split('\n').map(l => l.trim()).filter(Boolean));
  noteLines       = computed(() => this.notesText.split('\n').map(l => l.trim()).filter(Boolean));

  subtotal = computed(() => this.items().reduce((s, i) => s + (Number(i.quantity) || 0) * (Number(i.unitPrice) || 0), 0));
  net      = computed(() => this.subtotal() + (this.addWorks() ? (Number(this.addWorksCost) || 0) : 0));
  vat      = computed(() => this.applyVat() ? Math.round(this.net() * 0.2 * 100) / 100 : 0);
  total    = computed(() => Math.round((this.net() + this.vat()) * 100) / 100);

  lineTotal(item: InvoiceItem): number { return (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0); }

  generate() {
    const res = generateQuoteItems({
      jobType: this.jobType, unitCount: Number(this.unitCount), roomSizeM2: Number(this.roomSizeM2),
      propertyType: this.propertyType, brandTier: this.brandTier, serviceJobType: this.serviceJobType,
      wallType: this.wallType, recommendedBtu: this.sizingBtu ?? undefined,
    });
    this.items.set(res.items.map(i => ({ ...i })));
    this.meta.set({ summary: res.summary, recommendedBtu: res.recommendedBtu, estimatedDuration: res.estimatedDuration });

    if (!this.customerAddress.trim() && this.jobPostcode.trim()) {
      this.customerAddress = this.jobPostcode.trim().toUpperCase();
    }

    // Professional document defaults
    this.quoteTitle = this.defaultTitle();
    this.scopeText = this.defaultScope(res.recommendedBtu).join('\n');
    this.equipment.set(this.defaultEquipment(res.recommendedBtu));
    if (!this.exclusionsText.trim()) this.exclusionsText = this.defaultExclusions().join('\n');
    if (!this.notesText.trim()) this.notesText = this.defaultNotes().join('\n');

    this.generated.set(true);
    this.actionError.set(null);
    this.savedMsg.set(null);
  }

  private tierName() { return this.brandTier === 'budget' ? 'budget-range' : this.brandTier === 'premium' ? 'premium' : 'mid-range'; }

  private defaultTitle(): string {
    if (this.isIR()) return `Quotation – Supply & Installation of Air Conditioning System`;
    if (this.jobType === 'service') return `Quotation – Air Conditioning Service`;
    return `Quotation – Air Conditioning Repair`;
  }

  private defaultScope(btu: string): string[] {
    const n = Number(this.unitCount);
    const multi = n > 1;
    if (this.isIR()) {
      return [
        `Supply and installation of ${this.tierName()} ${multi ? 'multi-split' : 'single-split'} air conditioning system`,
        `Installation of ${n} indoor wall-mounted unit${multi ? 's' : ''}`,
        `Installation of ${multi ? '1 outdoor condenser unit' : 'outdoor condenser unit'} mounted on external wall brackets`,
        `Installation of refrigerant pipework with insulation (lagging)`,
        ...(this.wallType === 'solid' ? [`Core drilling through solid brickwork with internal and external making good`] : []),
        `Installation of condensate drainage system`,
        `Electrical interconnection between indoor and outdoor units`,
        `Installation of trunking to ensure a neat and professional finish`,
        `Full system testing, commissioning and client handover`,
      ];
    }
    if (this.jobType === 'service') {
      return [
        `Full service and performance check of the existing system${n > 1 ? 's' : ''}`,
        `Filter clean and condensate drainage check`,
        `Refrigerant pressure and level check`,
        `Electrical safety check`,
        `Written service report and handover`,
      ];
    }
    return [
      `Attend site to diagnose the reported fault`,
      `Full diagnostic and written fault report`,
      `Repair recommendation (any parts quoted separately)`,
    ];
  }

  private defaultEquipment(btu: string): EquipRow[] {
    if (!this.isIR()) return [];
    const n = Number(this.unitCount);
    const rows: EquipRow[] = [];
    rows.push({ qty: 1, model: '', description: n > 1 ? `Multi-split outdoor condenser (${n}:1)` : `Outdoor condenser unit` });
    rows.push({ qty: n, model: '', description: `Wall-mounted indoor unit - ${btu}` });
    return rows;
  }

  private defaultExclusions(): string[] {
    return [
      'Any unforeseen site-specific requirements',
      'Structural or building works',
      'Decorative making good (plastering / painting)',
      'Electrical supply upgrades beyond those stated above',
    ];
  }

  private defaultNotes(): string[] {
    return [
      'All works will be carried out in accordance with current UK regulations and industry standards.',
      'Installation date to be agreed upon acceptance of this quotation.',
      "Manufacturer's warranty applies to all supplied equipment.",
      'This quotation is valid for 30 days from the date above.',
    ];
  }

  addItem()  { this.items.update(l => [...l, { description: '', quantity: 1, unitPrice: 0 }]); }
  removeItem(i: number) { this.items.update(l => l.filter((_, n) => n !== i)); }
  addEquip() { this.equipment.update(l => [...l, { qty: 1, model: '', description: '' }]); }
  removeEquip(i: number) { this.equipment.update(l => l.filter((_, n) => n !== i)); }

  addExtra(extra: { description: string; unitPrice: number }) {
    this.items.update(l => [...l, { description: extra.description, quantity: 1, unitPrice: extra.unitPrice }]);
  }

  toggleAdjust() { this.adjustOpen.update(v => !v); }

  applyAdjustment() {
    const value = Number(this.adjustValue) || 0;
    let amount = this.adjustMethod === 'percent'
      ? Math.round(this.subtotal() * value / 100 * 100) / 100
      : value;
    amount = this.adjustType === 'discount' ? -Math.abs(amount) : Math.abs(amount);

    const label = this.adjustType === 'discount' ? 'Discount' : 'Surcharge';
    const methodLabel = this.adjustMethod === 'percent' ? `${value}%` : `£${value}`;
    const description = `${label} (${methodLabel})${this.adjustNote.trim() ? ' — ' + this.adjustNote.trim() : ''}`;

    this.items.update(l => [...l, { description, quantity: 1, unitPrice: amount }]);
    this.adjustOpen.set(false);
    this.adjustValue = 10;
    this.adjustNote = '';
  }

  private validItems(): boolean { return this.items().some(i => i.description.trim() && (Number(i.unitPrice) || 0) > 0); }

  openPreview() {
    if (!this.validItems()) { this.actionError.set('Add at least one priced line item.'); return; }
    this.actionError.set(null);
    this.preview.set(true);
    window.scrollTo(0, 0);
  }

  print() { window.print(); }

  createInvoice() {
    this.savedMsg.set(null);
    if (!this.customerName.trim() || !this.customerEmail.trim()) { this.actionError.set('Add a customer name and email to create an invoice.'); this.preview.set(false); return; }
    if (!this.validItems()) { this.actionError.set('Add at least one priced line item.'); return; }
    this.actionError.set(null);
    const items: InvoiceItem[] = this.items().map(i => ({ ...i, quantity: Number(i.quantity), unitPrice: Number(i.unitPrice) }));
    if (this.addWorks() && Number(this.addWorksCost) > 0) {
      items.push({ description: this.addWorksDesc.trim() || 'Additional works', quantity: 1, unitPrice: Number(this.addWorksCost) });
    }
    const due = new Date(); due.setDate(due.getDate() + 14);
    this.invoiceSvc.create(this.eid, {
      engineerId: this.eid,
      customerName: this.customerName.trim(), customerEmail: this.customerEmail.trim(),
      jobRef: this.quoteRef, items,
      subtotal: this.net(), vatAmount: this.vat(), total: this.total(),
      status: 'draft', issuedAt: new Date().toISOString(), dueAt: due.toISOString(),
      notes: `Generated from quote ${this.quoteRef}: ${this.meta().summary}`,
    }).subscribe(() => this.router.navigate(['/dashboard/invoices']));
  }

  private newRef(): string { return `QTE-${Math.floor(100 + Math.random() * 899)}/${new Date().getFullYear()}`; }

  private quoteData() {
    return {
      ref: this.quoteRef, status: this.status(),
      customerName: this.customerName.trim(), customerEmail: this.customerEmail.trim(),
      customerAddress: this.customerAddress.trim(), title: this.quoteTitle, summary: this.meta().summary,
      recommendedBtu: this.meta().recommendedBtu, estimatedDuration: this.meta().estimatedDuration,
      scopeText: this.scopeText, exclusionsText: this.exclusionsText, notesText: this.notesText,
      equipment: this.equipment().map(e => ({ ...e })), items: this.items().map(i => ({ ...i })),
      addWorks: this.addWorks(), addWorksDesc: this.addWorksDesc, addWorksCost: Number(this.addWorksCost) || 0,
      vat: this.applyVat(), subtotal: this.subtotal(), vatAmount: this.vat(), total: this.total(),
    };
  }

  /** Persist a lifecycle status change without leaving the preview. */
  private persistAndStay() {
    const payload = this.quoteData() as SaveQuotePayload;
    const obs = this.loadedQuoteId
      ? this.quotationSvc.update(this.loadedQuoteId, payload)
      : this.quotationSvc.create(this.eid, payload);
    obs.subscribe(saved => {
      this.loadedQuoteId = saved.id;
      this.savedMsg.set(this.statusMessage());
      setTimeout(() => this.savedMsg.set(null), 3500);
    });
  }

  private statusMessage(): string {
    const m: Record<SavedQuoteStatus, string> = {
      draft: 'Reopened as a draft.',
      sent: 'Marked as sent to the customer.',
      accepted: 'Quote accepted — ready to invoice or book the job.',
      declined: 'Quote marked as declined.',
    };
    return m[this.status()];
  }

  sendQuote() {
    if (!this.validItems()) { this.actionError.set('Add at least one priced line item.'); return; }
    if (!this.customerEmail.trim()) { this.actionError.set('Add a customer email before sending.'); return; }
    this.actionError.set(null);
    this.status.set('sent');
    this.persistAndStay();
  }

  markAccepted() { this.status.set('accepted'); this.actionError.set(null); this.persistAndStay(); }
  markDeclined() { this.status.set('declined'); this.actionError.set(null); this.persistAndStay(); }
  reopenDraft()  { this.status.set('draft');    this.actionError.set(null); this.persistAndStay(); }

  private loadQuote(id: number) {
    this.quotationSvc.getById(id).subscribe(q => {
      if (!q) return;
      this.loadedQuoteId = q.id;
      this.customerName = q.customerName; this.customerEmail = q.customerEmail; this.customerAddress = q.customerAddress;
      this.quoteRef = q.ref; this.quoteTitle = q.title; this.quoteDate = new Date(q.createdAt);
      this.scopeText = q.scopeText; this.exclusionsText = q.exclusionsText; this.notesText = q.notesText;
      this.equipment.set(q.equipment.map(e => ({ ...e }))); this.items.set(q.items.map(i => ({ ...i })));
      this.addWorks.set(q.addWorks); this.addWorksModel = q.addWorks; this.addWorksDesc = q.addWorksDesc; this.addWorksCost = q.addWorksCost;
      this.applyVat.set(q.vat); this.applyVatModel = q.vat;
      this.status.set(q.status);
      this.meta.set({ summary: q.summary, recommendedBtu: q.recommendedBtu, estimatedDuration: q.estimatedDuration });
      this.generated.set(true);
      this.preview.set(true);
    });
  }

  saveQuote() {
    if (!this.validItems()) { this.actionError.set('Add at least one priced line item.'); return; }
    this.actionError.set(null);
    const payload = this.quoteData() as SaveQuotePayload;
    const obs = this.loadedQuoteId
      ? this.quotationSvc.update(this.loadedQuoteId, payload)
      : this.quotationSvc.create(this.eid, payload);
    obs.subscribe(saved => { this.loadedQuoteId = saved.id; this.router.navigate(['/dashboard/quotes']); });
  }

  reset() {
    this.generated.set(false); this.preview.set(false); this.items.set([]); this.equipment.set([]);
    this.customerName = ''; this.customerEmail = ''; this.customerAddress = '';
    this.scopeText = ''; this.exclusionsText = ''; this.notesText = '';
    this.addWorks.set(false); this.addWorksModel = false; this.addWorksDesc = ''; this.addWorksCost = 0;
    this.applyVat.set(false); this.applyVatModel = false;
    this.status.set('draft'); this.adjustOpen.set(false);
    this.actionError.set(null); this.savedMsg.set(null);
    this.sizingBtu = null; this.sizingNote.set(null);
    this.loadedQuoteId = null;
    this.quoteRef = this.newRef();
    this.quoteDate = new Date();
  }
}
