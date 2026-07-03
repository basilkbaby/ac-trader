import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { getMockInvoices, createMockInvoice, updateInvoiceStatus } from '../../core/mock/mock-data';
import { Invoice, InvoiceItem, InvoiceStatus } from '../../core/models/models';

@Component({
  selector: 'app-dashboard-invoices',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="inv-page">

      @if (!creating() && !viewing()) {

        <!-- Title row -->
        <div class="inv-titlerow">
          <div>
            <h1>Invoices</h1>
            <p class="inv-sub">{{ invoices().length }} invoice{{ invoices().length !== 1 ? 's' : '' }} total</p>
          </div>
          <button class="btn-primary btn-sm" (click)="startCreate()">+ New invoice</button>
        </div>

        <!-- Metrics bar -->
        <div class="metrics-bar">
          <div class="metric">
            <span class="metric-val">£{{ totals().paid | number:'1.0-0' }}</span>
            <span class="metric-lbl">Paid</span>
          </div>
          <div class="metric-div"></div>
          <div class="metric">
            <span class="metric-val warn">£{{ totals().outstanding | number:'1.0-0' }}</span>
            <span class="metric-lbl">Outstanding</span>
          </div>
          <div class="metric-div"></div>
          <div class="metric">
            <span class="metric-val">{{ invoiceCount('draft') }}</span>
            <span class="metric-lbl">Drafts</span>
          </div>
          <div class="metric-div"></div>
          <div class="metric">
            <span class="metric-val">{{ invoiceCount('overdue') }}</span>
            <span class="metric-lbl warn-lbl">Overdue</span>
          </div>
        </div>

        <!-- Invoice list -->
        <div class="inv-card">
          @if (invoices().length === 0) {
            <div class="inv-empty">No invoices yet. Create your first invoice above.</div>
          }
          @for (inv of invoices(); track inv.id) {
            <div class="inv-row">
              <div class="inv-row-left">
                <span class="inv-number">{{ inv.invoiceNumber }}</span>
                <span class="inv-customer">{{ inv.customerName }}</span>
                @if (inv.jobRef) { <span class="inv-jobref">{{ inv.jobRef }}</span> }
              </div>
              <div class="inv-row-mid">
                <span>{{ inv.issuedAt | date:'d MMM yyyy' }}</span>
                <span class="inv-due" [class.overdue]="isOverdue(inv)">Due {{ inv.dueAt | date:'d MMM' }}</span>
              </div>
              <div class="inv-row-right">
                <span class="inv-total">£{{ inv.total | number:'1.2-2' }}</span>
                <span class="inv-status" [class]="'ist-' + inv.status">{{ inv.status | titlecase }}</span>
                <button class="inv-view-btn" (click)="viewInvoice(inv)">View</button>
                @if (inv.status === 'sent') {
                  <button class="inv-paid-btn" (click)="markPaid(inv.id)">Mark paid</button>
                }
              </div>
            </div>
          }
        </div>
      }

      <!-- ── Invoice detail view ── -->
      @if (viewing()) {
        <div class="inv-detail">
          <div class="inv-detail-topbar">
            <button class="btn-text btn-sm" (click)="viewing.set(null)">← Back</button>
            <div class="inv-detail-actions">
              <button class="btn-secondary btn-sm" (click)="printInvoice()">Print</button>
              @if (viewing()!.status === 'draft') {
                <button class="btn-primary btn-sm" (click)="sendInvoice(viewing()!.id)">Send to customer</button>
              }
              @if (viewing()!.status === 'sent') {
                <button class="inv-paid-btn" (click)="markPaid(viewing()!.id); viewing.set(null)">Mark as paid</button>
              }
            </div>
          </div>

          <div class="inv-doc">
            <div class="inv-doc-head">
              <div>
                <div class="inv-doc-brand"><span class="logo-ac">Cool</span> <span class="logo-tr">HQ</span></div>
                <div class="inv-doc-brandlbl">Tax Invoice</div>
              </div>
              <div class="inv-doc-meta">
                <div class="inv-meta-row"><span>Invoice</span><strong>{{ viewing()!.invoiceNumber }}</strong></div>
                <div class="inv-meta-row"><span>Issued</span><span>{{ viewing()!.issuedAt | date:'d MMM yyyy' }}</span></div>
                <div class="inv-meta-row"><span>Due</span><span [class.overdue-text]="isOverdue(viewing()!)">{{ viewing()!.dueAt | date:'d MMM yyyy' }}</span></div>
                <div class="inv-meta-row">
                  <span>Status</span>
                  <span class="inv-status" [class]="'ist-' + viewing()!.status">{{ viewing()!.status | titlecase }}</span>
                </div>
              </div>
            </div>

            <div class="inv-doc-parties">
              <div class="inv-party">
                <div class="inv-party-lbl">From</div>
                <strong>{{ auth.currentUser()!.fullName }}</strong>
                <span>F-Gas Certified Engineer</span>
              </div>
              <div class="inv-party">
                <div class="inv-party-lbl">To</div>
                <strong>{{ viewing()!.customerName }}</strong>
                <span>{{ viewing()!.customerEmail }}</span>
                @if (viewing()!.jobRef) { <span>Ref: {{ viewing()!.jobRef }}</span> }
              </div>
            </div>

            <table class="inv-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th class="tr">Qty</th>
                  <th class="tr">Unit price</th>
                  <th class="tr">Amount</th>
                </tr>
              </thead>
              <tbody>
                @for (item of viewing()!.items; track $index) {
                  <tr>
                    <td>{{ item.description }}</td>
                    <td class="tr">{{ item.quantity }}</td>
                    <td class="tr">£{{ item.unitPrice | number:'1.2-2' }}</td>
                    <td class="tr">£{{ (item.quantity * item.unitPrice) | number:'1.2-2' }}</td>
                  </tr>
                }
              </tbody>
            </table>

            <div class="inv-totals">
              <div class="inv-tot-row"><span>Subtotal</span><span>£{{ viewing()!.subtotal | number:'1.2-2' }}</span></div>
              <div class="inv-tot-row"><span>VAT (20%)</span><span>£{{ viewing()!.vatAmount | number:'1.2-2' }}</span></div>
              <div class="inv-tot-grand"><span>Total due</span><span>£{{ viewing()!.total | number:'1.2-2' }}</span></div>
            </div>

            @if (viewing()!.notes) {
              <div class="inv-notes-block">
                <span class="inv-notes-lbl">Notes</span>
                <p>{{ viewing()!.notes }}</p>
              </div>
            }
          </div>
        </div>
      }

      <!-- ── Create invoice ── -->
      @if (creating()) {
        <div class="inv-create">
          <div class="inv-create-topbar">
            <button class="btn-text btn-sm" (click)="creating.set(false)">← Back</button>
            <h2>New invoice</h2>
          </div>

          <div class="inv-create-body">
            <div class="create-section">
              <h3>Customer details</h3>
              <div class="create-grid">
                <div class="form-group">
                  <label>Customer name *</label>
                  <input type="text" [(ngModel)]="draft.customerName" name="cn" placeholder="John Smith" />
                </div>
                <div class="form-group">
                  <label>Customer email *</label>
                  <input type="email" [(ngModel)]="draft.customerEmail" name="ce" placeholder="john@example.com" />
                </div>
                <div class="form-group">
                  <label>Job reference</label>
                  <input type="text" [(ngModel)]="draft.jobRef" name="jr" placeholder="#ACT-5001" />
                </div>
                <div class="form-group">
                  <label>Due date *</label>
                  <input type="date" [(ngModel)]="draft.dueAt" name="da" [min]="today" />
                </div>
              </div>
            </div>

            <div class="create-section">
              <div class="create-items-header">
                <h3>Line items</h3>
                <button class="btn-secondary btn-sm" (click)="addItem()" type="button">+ Add line</button>
              </div>
              <div class="items-head-row">
                <span class="col-d">Description</span>
                <span class="col-q">Qty</span>
                <span class="col-p">Unit price</span>
                <span class="col-t">Total</span>
                <span class="col-x"></span>
              </div>
              @for (item of draft.items; track $index; let i = $index) {
                <div class="item-row">
                  <input class="col-d" type="text" [(ngModel)]="item.description" [name]="'d'+i"
                    placeholder="e.g. Daikin FTXM25R installation" (input)="recalc()" />
                  <input class="col-q" type="number" [(ngModel)]="item.quantity" [name]="'q'+i"
                    min="1" (input)="recalc()" />
                  <input class="col-p" type="number" [(ngModel)]="item.unitPrice" [name]="'p'+i"
                    min="0" step="0.01" placeholder="0.00" (input)="recalc()" />
                  <span class="col-t">£{{ lineTotal(item) | number:'1.2-2' }}</span>
                  <button class="col-x item-del" (click)="removeItem(i)" type="button">✕</button>
                </div>
              }
            </div>

            <div class="create-totals">
              <div class="ct-row"><span>Subtotal</span><span>£{{ draft.subtotal | number:'1.2-2' }}</span></div>
              <div class="ct-row"><span>VAT (20%)</span><span>£{{ draft.vatAmount | number:'1.2-2' }}</span></div>
              <div class="ct-grand"><span>Total</span><span>£{{ draft.total | number:'1.2-2' }}</span></div>
            </div>

            <div class="form-group">
              <label>Notes (optional)</label>
              <textarea [(ngModel)]="draft.notes" name="notes" rows="2"
                placeholder="e.g. Payment due within 14 days. BACS preferred."></textarea>
            </div>

            @if (createError()) {
              <div class="create-error">{{ createError() }}</div>
            }

            <div class="create-actions">
              <button class="btn-primary btn-sm" (click)="saveInvoice('draft')">Save as draft</button>
              <button class="btn-secondary btn-sm" (click)="saveInvoice('sent')">Send to customer</button>
            </div>
          </div>
        </div>
      }

    </div>
  `,
  styles: [`
    .inv-page { display: flex; flex-direction: column; gap: 1.1rem; max-width: 860px; }

    /* Title */
    .inv-titlerow { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; }
    .inv-titlerow h1 { font-size: 1.25rem; font-weight: 700; margin: 0 0 0.15rem; }
    .inv-sub { font-size: 0.78rem; color: var(--text-muted); margin: 0; }

    /* Metrics bar */
    .metrics-bar {
      display: flex; align-items: center;
      background: white; border: 1px solid var(--border); border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); overflow: hidden;
    }
    .metric { flex: 1; display: flex; flex-direction: column; gap: 0.15rem; padding: 0.85rem 1.1rem; }
    .metric-val { font-size: 1.25rem; font-weight: 700; color: var(--text-primary); line-height: 1; }
    .metric-val.warn { color: #d97706; }
    .metric-lbl { font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.04em; }
    .metric-lbl.warn-lbl { color: #d97706; }
    .metric-div { width: 1px; background: var(--border); align-self: stretch; }

    /* Invoice list card */
    .inv-card { background: white; border: 1px solid var(--border); border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); overflow: hidden; }
    .inv-empty { padding: 2.5rem 1rem; text-align: center; font-size: 0.85rem; color: var(--text-muted); }

    .inv-row {
      display: flex; align-items: center; gap: 1rem;
      padding: 0.75rem 1rem; border-bottom: 1px solid var(--border);
      transition: background 0.1s;
    }
    .inv-row:last-child { border-bottom: none; }
    .inv-row:hover { background: var(--bg); }

    .inv-row-left { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 0.15rem; }
    .inv-number   { font-size: 0.85rem; font-weight: 700; color: var(--text-primary); }
    .inv-customer { font-size: 0.8rem; color: var(--text-secondary); }
    .inv-jobref   { font-size: 0.72rem; color: var(--text-muted); }

    .inv-row-mid  { flex-shrink: 0; display: flex; flex-direction: column; gap: 0.15rem; font-size: 0.78rem; color: var(--text-muted); }
    .inv-due.overdue { color: #dc2626; font-weight: 600; }

    .inv-row-right { display: flex; align-items: center; gap: 0.5rem; flex-shrink: 0; flex-wrap: wrap; justify-content: flex-end; }
    .inv-total { font-size: 0.9rem; font-weight: 700; color: var(--text-primary); }

    .inv-status {
      font-size: 0.65rem; font-weight: 700; padding: 0.15rem 0.45rem;
      border-radius: 999px; text-transform: uppercase; letter-spacing: 0.04em;
    }
    .ist-paid    { background: #d1fae5; color: #065f46; }
    .ist-sent    { background: #dbeafe; color: #1e40af; }
    .ist-draft   { background: var(--border); color: var(--text-secondary); }
    .ist-overdue { background: #fee2e2; color: #991b1b; }

    .inv-view-btn {
      font-size: 0.75rem; font-weight: 600; color: var(--ink-2);
      background: var(--brand-light); border: 1px solid #bfdbfe; border-radius: 6px;
      padding: 0.2rem 0.55rem; cursor: pointer; transition: all 0.12s;
    }
    .inv-view-btn:hover { background: #dbeafe; }
    .inv-paid-btn {
      font-size: 0.75rem; font-weight: 600; color: #059669;
      background: none; border: 1px solid #6ee7b7; border-radius: 6px;
      padding: 0.2rem 0.55rem; cursor: pointer;
    }

    /* ── Invoice detail ── */
    .inv-detail { display: flex; flex-direction: column; gap: 1rem; }
    .inv-detail-topbar { display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; flex-wrap: wrap; }
    .inv-detail-actions { display: flex; gap: 0.5rem; align-items: center; }

    .inv-doc {
      background: white; border: 1px solid var(--border); border-radius: 12px;
      padding: 1.75rem; display: flex; flex-direction: column; gap: 1.5rem;
    }
    .inv-doc-head { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem; }
    .inv-doc-brand .logo-ac { font-size: 1.2rem; font-weight: 900; color: var(--brand); }
    .inv-doc-brand .logo-tr { font-size: 1.2rem; font-weight: 900; color: var(--text-primary); }
    .inv-doc-brandlbl { font-size: 0.72rem; color: var(--text-muted); margin-top: 0.2rem; }
    .inv-doc-meta { display: flex; flex-direction: column; gap: 0.35rem; }
    .inv-meta-row { display: flex; gap: 1rem; justify-content: flex-end; align-items: center; font-size: 0.83rem; }
    .inv-meta-row span:first-child { color: var(--text-muted); }
    .inv-meta-row strong { font-size: 0.95rem; color: var(--text-primary); }
    .overdue-text { color: #dc2626; font-weight: 600; }

    .inv-doc-parties { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
    .inv-party { display: flex; flex-direction: column; gap: 0.2rem; }
    .inv-party-lbl { font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); margin-bottom: 0.15rem; }
    .inv-party strong { font-size: 0.88rem; color: var(--text-primary); }
    .inv-party span { font-size: 0.78rem; color: var(--text-secondary); }

    .inv-table { width: 100%; border-collapse: collapse; }
    .inv-table th { font-size: 0.68rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: var(--text-muted); padding: 0.45rem 0.65rem; border-bottom: 2px solid var(--border); text-align: left; }
    .inv-table td { padding: 0.6rem 0.65rem; font-size: 0.83rem; color: var(--text-primary); border-bottom: 1px solid var(--border); }
    .inv-table .tr { text-align: right; }
    .inv-table th.tr { text-align: right; }

    .inv-totals { max-width: 260px; margin-left: auto; display: flex; flex-direction: column; gap: 0.3rem; }
    .inv-tot-row { display: flex; justify-content: space-between; font-size: 0.83rem; color: var(--text-secondary); padding: 0.25rem 0; border-bottom: 1px solid var(--border); }
    .inv-tot-grand { display: flex; justify-content: space-between; font-size: 1rem; font-weight: 700; color: var(--text-primary); padding-top: 0.4rem; border-top: 2px solid var(--text-primary); }

    .inv-notes-block { border-top: 1px solid var(--border); padding-top: 1rem; }
    .inv-notes-lbl { font-size: 0.68rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: var(--text-muted); display: block; margin-bottom: 0.3rem; }
    .inv-notes-block p { font-size: 0.83rem; color: var(--text-primary); margin: 0; }

    /* ── Create form ── */
    .inv-create { display: flex; flex-direction: column; gap: 1rem; }
    .inv-create-topbar { display: flex; align-items: center; gap: 1rem; }
    .inv-create-topbar h2 { font-size: 1rem; font-weight: 700; margin: 0; }

    .inv-create-body {
      background: white; border: 1px solid var(--border); border-radius: 12px;
      padding: 1.25rem; display: flex; flex-direction: column; gap: 1.25rem;
    }
    .create-section { display: flex; flex-direction: column; gap: 0.75rem; }
    .create-section h3 { font-size: 0.78rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: var(--text-secondary); margin: 0; }
    .create-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }

    .form-group { display: flex; flex-direction: column; gap: 0.25rem; }
    .form-group label { font-size: 0.72rem; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.04em; }
    .form-group input, .form-group textarea {
      padding: 0.5rem 0.75rem; border: 1px solid var(--border); border-radius: 8px; font-size: 0.88rem;
    }

    .create-items-header { display: flex; align-items: center; justify-content: space-between; }
    .create-items-header h3 { margin: 0; }

    .items-head-row, .item-row {
      display: grid; grid-template-columns: 1fr 55px 95px 85px 28px;
      gap: 0.4rem; align-items: center;
    }
    .items-head-row {
      font-size: 0.68rem; font-weight: 700; color: var(--text-muted);
      text-transform: uppercase; letter-spacing: 0.04em;
      padding-bottom: 0.4rem; border-bottom: 1px solid var(--border);
    }
    .item-row { margin-top: 0.4rem; }
    .item-row input { width: 100%; padding: 0.45rem 0.6rem; border: 1px solid var(--border); border-radius: 7px; font-size: 0.83rem; box-sizing: border-box; }
    .col-t { font-size: 0.83rem; font-weight: 600; color: var(--text-primary); text-align: right; }
    .col-q, .col-p { text-align: right; }
    .item-del { background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 0.85rem; }
    .item-del:hover { color: #dc2626; }

    .create-totals { max-width: 260px; margin-left: auto; display: flex; flex-direction: column; gap: 0.25rem; }
    .ct-row { display: flex; justify-content: space-between; font-size: 0.83rem; color: var(--text-secondary); padding: 0.2rem 0; border-bottom: 1px solid var(--border); }
    .ct-grand { display: flex; justify-content: space-between; font-size: 1rem; font-weight: 700; color: var(--text-primary); padding-top: 0.35rem; border-top: 2px solid var(--text-primary); margin-top: 0.1rem; }

    .create-error { color: #dc2626; font-size: 0.83rem; }
    .create-actions { display: flex; gap: 0.5rem; flex-wrap: wrap; }

    @media (max-width: 600px) {
      .create-grid { grid-template-columns: 1fr; }
      .items-head-row { display: none; }
      .item-row { grid-template-columns: 1fr 45px 75px 65px 24px; }
      .inv-doc-parties { grid-template-columns: 1fr; }
      .metrics-bar { flex-wrap: wrap; }
      .metric { min-width: 45%; }
    }
  `]
})
export class DashboardInvoicesComponent {
  auth        = inject(AuthService);
  creating    = signal(false);
  viewing     = signal<Invoice | null>(null);
  createError = signal<string | null>(null);
  today       = new Date().toISOString().split('T')[0];

  private _invoices = signal<Invoice[]>(getMockInvoices(this.auth.currentUser()!.engineerId!));
  invoices = computed(() => this._invoices());

  totals = computed(() => ({
    paid:        this._invoices().filter(i => i.status === 'paid').reduce((s, i) => s + i.total, 0),
    outstanding: this._invoices().filter(i => i.status === 'sent' || i.status === 'overdue').reduce((s, i) => s + i.total, 0),
  }));

  invoiceCount(status: string): number {
    if (status === 'overdue') return this._invoices().filter(i => this.isOverdue(i)).length;
    return this._invoices().filter(i => i.status === status).length;
  }

  draft: { customerName: string; customerEmail: string; jobRef: string; dueAt: string; items: InvoiceItem[]; subtotal: number; vatAmount: number; total: number; notes: string; } = this.emptyDraft();

  startCreate() { this.draft = this.emptyDraft(); this.creating.set(true); this.viewing.set(null); }

  viewInvoice(inv: Invoice) { this.viewing.set(inv); this.creating.set(false); }

  addItem()          { this.draft.items.push({ description: '', quantity: 1, unitPrice: 0 }); }
  removeItem(i: number) { this.draft.items.splice(i, 1); this.recalc(); }

  recalc() {
    this.draft.subtotal  = this.draft.items.reduce((s, it) => s + it.quantity * it.unitPrice, 0);
    this.draft.vatAmount = Math.round(this.draft.subtotal * 0.2 * 100) / 100;
    this.draft.total     = Math.round((this.draft.subtotal + this.draft.vatAmount) * 100) / 100;
  }

  lineTotal(item: InvoiceItem): number { return item.quantity * item.unitPrice; }

  saveInvoice(status: InvoiceStatus) {
    if (!this.draft.customerName || !this.draft.customerEmail) { this.createError.set('Customer name and email are required.'); return; }
    if (this.draft.items.length === 0 || this.draft.items.every(i => !i.description)) { this.createError.set('Add at least one line item.'); return; }
    this.recalc();
    createMockInvoice({
      engineerId: this.auth.currentUser()!.engineerId!, customerName: this.draft.customerName,
      customerEmail: this.draft.customerEmail, jobRef: this.draft.jobRef || null,
      items: [...this.draft.items], subtotal: this.draft.subtotal, vatAmount: this.draft.vatAmount,
      total: this.draft.total, status, issuedAt: new Date().toISOString(),
      dueAt: new Date(this.draft.dueAt).toISOString(), notes: this.draft.notes || null,
    });
    this._invoices.set(getMockInvoices(this.auth.currentUser()!.engineerId!));
    this.creating.set(false);
  }

  sendInvoice(id: number) {
    updateInvoiceStatus(id, 'sent');
    this._invoices.set(getMockInvoices(this.auth.currentUser()!.engineerId!));
    this.viewing.set(this._invoices().find(i => i.id === id) ?? null);
  }

  markPaid(id: number) {
    updateInvoiceStatus(id, 'paid');
    this._invoices.set(getMockInvoices(this.auth.currentUser()!.engineerId!));
    if (this.viewing()?.id === id) this.viewing.set(this._invoices().find(i => i.id === id) ?? null);
  }

  printInvoice() { window.print(); }

  isOverdue(inv: Invoice): boolean { return inv.status === 'sent' && new Date(inv.dueAt) < new Date(); }

  private emptyDraft() {
    const due = new Date(); due.setDate(due.getDate() + 14);
    return { customerName: '', customerEmail: '', jobRef: '', dueAt: due.toISOString().split('T')[0], items: [{ description: '', quantity: 1, unitPrice: 0 }], subtotal: 0, vatAmount: 0, total: 0, notes: '' };
  }
}
