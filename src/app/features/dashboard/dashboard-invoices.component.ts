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
        <div class="inv-header">
          <h1>Invoices</h1>
          <button class="btn-primary btn-sm" (click)="startCreate()">+ New invoice</button>
        </div>

        <!-- Summary stats -->
        <div class="inv-stats">
          <div class="inv-stat">
            <span class="inv-stat-val">£{{ totals().paid | number:'1.2-2' }}</span>
            <span class="inv-stat-label">Paid</span>
          </div>
          <div class="inv-stat">
            <span class="inv-stat-val">£{{ totals().outstanding | number:'1.2-2' }}</span>
            <span class="inv-stat-label">Outstanding</span>
          </div>
          <div class="inv-stat">
            <span class="inv-stat-val">{{ invoices().length }}</span>
            <span class="inv-stat-label">Total invoices</span>
          </div>
        </div>

        <!-- Invoice list -->
        <div class="inv-list">
          @for (inv of invoices(); track inv.id) {
            <div class="inv-row">
              <div class="inv-row-left">
                <div class="inv-number">{{ inv.invoiceNumber }}</div>
                <div class="inv-customer">{{ inv.customerName }}</div>
                @if (inv.jobRef) { <div class="inv-jobref">{{ inv.jobRef }}</div> }
              </div>
              <div class="inv-row-mid">
                <div class="inv-dates">
                  <span>Issued {{ inv.issuedAt | date:'d MMM yyyy' }}</span>
                  <span class="inv-due" [class.overdue]="isOverdue(inv)">Due {{ inv.dueAt | date:'d MMM' }}</span>
                </div>
              </div>
              <div class="inv-row-right">
                <div class="inv-total">£{{ inv.total | number:'1.2-2' }}</div>
                <span class="inv-status" [class]="'inv-' + inv.status">{{ inv.status | titlecase }}</span>
                <button class="inv-view-btn" (click)="viewInvoice(inv)">View</button>
                @if (inv.status === 'sent') {
                  <button class="inv-action-btn" (click)="markPaid(inv.id)">Mark paid</button>
                }
              </div>
            </div>
          }
        </div>
      }

      <!-- Invoice detail view -->
      @if (viewing()) {
        <div class="inv-view">
          <div class="inv-view-topbar">
            <button class="btn-text" (click)="viewing.set(null)">← Back to invoices</button>
            <div class="inv-view-actions">
              <button class="btn-secondary btn-sm" (click)="printInvoice()">🖨 Print / Download</button>
              @if (viewing()!.status === 'draft') {
                <button class="btn-primary btn-sm" (click)="sendInvoice(viewing()!.id)">Send to customer</button>
              }
              @if (viewing()!.status === 'sent') {
                <button class="inv-action-btn" (click)="markPaid(viewing()!.id); viewing.set(null)">Mark as paid</button>
              }
            </div>
          </div>

          <div class="inv-doc" id="inv-print-area">
            <div class="inv-doc-header">
              <div class="inv-doc-brand">
                <span class="logo-ac">AC</span><span class="logo-trader">trader</span>
                <span class="inv-doc-subtitle">Tax Invoice</span>
              </div>
              <div class="inv-doc-meta">
                <div class="inv-meta-row"><span>Invoice</span><strong>{{ viewing()!.invoiceNumber }}</strong></div>
                <div class="inv-meta-row"><span>Issued</span><span>{{ viewing()!.issuedAt | date:'d MMM yyyy' }}</span></div>
                <div class="inv-meta-row"><span>Due</span><span [class.overdue-text]="isOverdue(viewing()!)">{{ viewing()!.dueAt | date:'d MMM yyyy' }}</span></div>
                <div class="inv-meta-row">
                  <span>Status</span>
                  <span class="inv-status" [class]="'inv-' + viewing()!.status">{{ viewing()!.status | titlecase }}</span>
                </div>
              </div>
            </div>

            <div class="inv-doc-parties">
              <div class="inv-party">
                <div class="inv-party-label">From</div>
                <strong>{{ auth.currentUser()!.fullName }}</strong>
                <span>F-Gas Certified Engineer</span>
                <span>actrader.co.uk</span>
              </div>
              <div class="inv-party">
                <div class="inv-party-label">To</div>
                <strong>{{ viewing()!.customerName }}</strong>
                <span>{{ viewing()!.customerEmail }}</span>
                @if (viewing()!.jobRef) { <span>Job ref: {{ viewing()!.jobRef }}</span> }
              </div>
            </div>

            <table class="inv-doc-table">
              <thead>
                <tr>
                  <th class="col-desc">Description</th>
                  <th class="col-qty">Qty</th>
                  <th class="col-up">Unit price</th>
                  <th class="col-lt">Amount</th>
                </tr>
              </thead>
              <tbody>
                @for (item of viewing()!.items; track $index) {
                  <tr>
                    <td>{{ item.description }}</td>
                    <td class="text-right">{{ item.quantity }}</td>
                    <td class="text-right">£{{ item.unitPrice | number:'1.2-2' }}</td>
                    <td class="text-right">£{{ (item.quantity * item.unitPrice) | number:'1.2-2' }}</td>
                  </tr>
                }
              </tbody>
            </table>

            <div class="inv-doc-totals">
              <div class="inv-tot-row"><span>Subtotal</span><span>£{{ viewing()!.subtotal | number:'1.2-2' }}</span></div>
              <div class="inv-tot-row"><span>VAT (20%)</span><span>£{{ viewing()!.vatAmount | number:'1.2-2' }}</span></div>
              <div class="inv-tot-row inv-tot-grand"><span>Total due</span><span>£{{ viewing()!.total | number:'1.2-2' }}</span></div>
            </div>

            @if (viewing()!.notes) {
              <div class="inv-doc-notes">
                <strong>Notes</strong>
                <p>{{ viewing()!.notes }}</p>
              </div>
            }
          </div>
        </div>
      }

      <!-- Create invoice form -->
      @if (creating()) {
        <div class="inv-create">
          <div class="inv-create-header">
            <button class="btn-text" (click)="creating.set(false)">← Back to invoices</button>
            <h2>New invoice</h2>
          </div>

          <div class="inv-form-grid">
            <div class="form-group">
              <label>Customer name *</label>
              <input type="text" [(ngModel)]="draft.customerName" name="cn" placeholder="e.g. John Smith" />
            </div>
            <div class="form-group">
              <label>Customer email *</label>
              <input type="email" [(ngModel)]="draft.customerEmail" name="ce" placeholder="john@example.com" />
            </div>
            <div class="form-group">
              <label>Job reference</label>
              <input type="text" [(ngModel)]="draft.jobRef" name="jr" placeholder="e.g. #ACT-5001" />
            </div>
            <div class="form-group">
              <label>Due date *</label>
              <input type="date" [(ngModel)]="draft.dueAt" name="da" [min]="today" />
            </div>
          </div>

          <div class="inv-items-section">
            <h3>Line items</h3>
            <div class="inv-items-header">
              <span class="col-desc">Description</span>
              <span class="col-qty">Qty</span>
              <span class="col-price">Unit price</span>
              <span class="col-line">Line total</span>
              <span class="col-del"></span>
            </div>
            @for (item of draft.items; track $index; let i = $index) {
              <div class="inv-item-row">
                <input class="col-desc" type="text" [(ngModel)]="item.description" [name]="'desc' + i"
                  placeholder="e.g. Daikin FTXM25R installation" (input)="recalc()" />
                <input class="col-qty" type="number" [(ngModel)]="item.quantity" [name]="'qty' + i"
                  min="1" step="1" (input)="recalc()" />
                <input class="col-price" type="number" [(ngModel)]="item.unitPrice" [name]="'up' + i"
                  min="0" step="0.01" placeholder="0.00" (input)="recalc()" />
                <span class="col-line">£{{ lineTotal(item) | number:'1.2-2' }}</span>
                <button class="col-del item-del-btn" (click)="removeItem(i)" type="button">✕</button>
              </div>
            }
            <button class="btn-secondary btn-sm inv-add-line" (click)="addItem()" type="button">+ Add line</button>
          </div>

          <div class="inv-totals">
            <div class="inv-total-row">
              <span>Subtotal</span>
              <span>£{{ draft.subtotal | number:'1.2-2' }}</span>
            </div>
            <div class="inv-total-row">
              <span>VAT (20%)</span>
              <span>£{{ draft.vatAmount | number:'1.2-2' }}</span>
            </div>
            <div class="inv-total-row inv-grand-total">
              <span>Total</span>
              <span>£{{ draft.total | number:'1.2-2' }}</span>
            </div>
          </div>

          <div class="form-group inv-notes">
            <label>Notes (optional)</label>
            <textarea [(ngModel)]="draft.notes" name="notes" rows="2"
              placeholder="e.g. Payment due within 14 days. BACS preferred."></textarea>
          </div>

          @if (createError()) {
            <div class="error-msg">{{ createError() }}</div>
          }

          <div class="inv-create-actions">
            <button class="btn-primary" (click)="saveInvoice('draft')">Save as draft</button>
            <button class="btn-secondary" (click)="saveInvoice('sent')">Send to customer</button>
          </div>
        </div>
      }

    </div>
  `,
  styles: [`
    .inv-page { max-width: 860px; }
    .inv-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; }
    .inv-header h1 { font-size: 1.4rem; margin: 0; }

    .inv-stats {
      display: flex; gap: 1rem; margin-bottom: 2rem; flex-wrap: wrap;
    }
    .inv-stat {
      background: white; border: 1px solid #e5e7eb; border-radius: 12px;
      padding: 1rem 1.5rem; display: flex; flex-direction: column; gap: 0.2rem; min-width: 120px;
    }
    .inv-stat-val { font-size: 1.5rem; font-weight: 700; color: #111827; }
    .inv-stat-label { font-size: 0.78rem; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.04em; }

    .inv-list { display: flex; flex-direction: column; gap: 0.75rem; }
    .inv-row {
      display: flex; align-items: center; gap: 1rem;
      background: white; border: 1px solid #e5e7eb; border-radius: 12px;
      padding: 1rem 1.25rem; flex-wrap: wrap;
    }
    .inv-row-left { flex: 1; min-width: 160px; display: flex; flex-direction: column; gap: 0.2rem; }
    .inv-number { font-size: 0.88rem; font-weight: 700; color: #111827; }
    .inv-customer { font-size: 0.85rem; color: #374151; }
    .inv-jobref { font-size: 0.78rem; color: #9ca3af; }
    .inv-row-mid { flex: 1; min-width: 140px; }
    .inv-dates { display: flex; flex-direction: column; gap: 0.15rem; font-size: 0.82rem; color: #6b7280; }
    .inv-due.overdue { color: #dc2626; font-weight: 600; }
    .inv-row-right { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
    .inv-total { font-size: 1rem; font-weight: 700; color: #111827; }
    .inv-status {
      font-size: 0.72rem; font-weight: 700;
      padding: 0.2rem 0.6rem; border-radius: 999px;
      text-transform: uppercase; letter-spacing: 0.04em;
    }
    .inv-paid    { background: #d1fae5; color: #065f46; }
    .inv-sent    { background: #dbeafe; color: #1e40af; }
    .inv-draft   { background: #f3f4f6; color: #374151; }
    .inv-overdue { background: #fee2e2; color: #991b1b; }
    .inv-view-btn {
      font-size: 0.78rem; font-weight: 600; color: #1e3a5f;
      background: #f0f5ff; border: 1px solid #bfdbfe; border-radius: 6px;
      padding: 0.2rem 0.6rem; cursor: pointer; transition: all 0.15s;
    }
    .inv-view-btn:hover { background: #dbeafe; }
    .inv-action-btn {
      font-size: 0.78rem; font-weight: 600; color: #059669;
      background: none; border: 1px solid #6ee7b7; border-radius: 6px;
      padding: 0.2rem 0.6rem; cursor: pointer;
    }

    /* Invoice detail view */
    .inv-view { max-width: 700px; }
    .inv-view-topbar {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 1.5rem; flex-wrap: wrap; gap: 0.75rem;
    }
    .inv-view-actions { display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center; }

    .inv-doc {
      background: white; border: 1px solid #e5e7eb; border-radius: 16px;
      padding: 2rem; display: flex; flex-direction: column; gap: 1.75rem;
    }
    .inv-doc-header { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem; }
    .inv-doc-brand { display: flex; flex-direction: column; gap: 0.2rem; }
    .inv-doc-brand .logo-ac { font-size: 1.25rem; font-weight: 900; color: #0057FF; }
    .inv-doc-brand .logo-trader { font-size: 1.25rem; font-weight: 900; color: #111827; }
    .inv-doc-subtitle { font-size: 0.78rem; color: #9ca3af; margin-top: 0.25rem; }
    .inv-doc-meta { display: flex; flex-direction: column; gap: 0.4rem; text-align: right; }
    .inv-meta-row { display: flex; gap: 1rem; justify-content: flex-end; align-items: center; font-size: 0.88rem; }
    .inv-meta-row span:first-child { color: #9ca3af; }
    .inv-meta-row strong { font-size: 1rem; }
    .overdue-text { color: #dc2626; font-weight: 600; }

    .inv-doc-parties { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
    .inv-party { display: flex; flex-direction: column; gap: 0.2rem; }
    .inv-party-label { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #9ca3af; margin-bottom: 0.2rem; }
    .inv-party strong { font-size: 0.95rem; color: #111827; }
    .inv-party span { font-size: 0.82rem; color: #6b7280; }

    .inv-doc-table { width: 100%; border-collapse: collapse; }
    .inv-doc-table th {
      font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em;
      color: #9ca3af; padding: 0.5rem 0.75rem; border-bottom: 2px solid #e5e7eb; text-align: left;
    }
    .inv-doc-table td { padding: 0.65rem 0.75rem; font-size: 0.88rem; color: #374151; border-bottom: 1px solid #f3f4f6; }
    .inv-doc-table .text-right { text-align: right; }
    .inv-doc-table th.col-qty, .inv-doc-table th.col-up, .inv-doc-table th.col-lt { text-align: right; }

    .inv-doc-totals {
      max-width: 280px; margin-left: auto;
      display: flex; flex-direction: column; gap: 0.4rem;
    }
    .inv-tot-row {
      display: flex; justify-content: space-between;
      font-size: 0.9rem; color: #374151; padding: 0.3rem 0;
    }
    .inv-tot-grand {
      font-size: 1.05rem; font-weight: 700; color: #111827;
      border-top: 2px solid #111827; padding-top: 0.5rem; margin-top: 0.25rem;
    }
    .inv-doc-notes { border-top: 1px solid #f3f4f6; padding-top: 1.25rem; }
    .inv-doc-notes strong { font-size: 0.82rem; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.04em; display: block; margin-bottom: 0.35rem; }
    .inv-doc-notes p { font-size: 0.88rem; color: #374151; margin: 0; }

    /* Create form */
    .inv-create-header { margin-bottom: 1.5rem; }
    .inv-create-header h2 { font-size: 1.25rem; margin: 0.5rem 0 0; }
    .inv-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 2rem; }
    .form-group { display: flex; flex-direction: column; gap: 0.3rem; }
    .form-group label { font-size: 0.75rem; font-weight: 600; color: #374151; text-transform: uppercase; letter-spacing: 0.04em; }
    .form-group input, .form-group textarea {
      padding: 0.6rem 0.85rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 0.9rem;
    }

    .inv-items-section { margin-bottom: 1.5rem; }
    .inv-items-section h3 { font-size: 0.95rem; font-weight: 600; margin-bottom: 0.75rem; }
    .inv-items-header, .inv-item-row {
      display: grid;
      grid-template-columns: 1fr 60px 100px 90px 32px;
      gap: 0.5rem; align-items: center;
    }
    .inv-items-header { font-size: 0.72rem; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.04em; padding: 0 0 0.4rem; border-bottom: 1px solid #f3f4f6; margin-bottom: 0.5rem; }
    .inv-item-row { margin-bottom: 0.5rem; }
    .inv-item-row input {
      width: 100%; padding: 0.5rem 0.6rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 0.88rem; box-sizing: border-box;
    }
    .col-line { font-size: 0.88rem; font-weight: 600; color: #111827; text-align: right; }
    .item-del-btn { background: none; border: none; color: #9ca3af; cursor: pointer; font-size: 0.9rem; padding: 0; }
    .item-del-btn:hover { color: #dc2626; }
    .inv-add-line { margin-top: 0.5rem; }

    .inv-totals { max-width: 320px; margin-left: auto; margin-bottom: 1.5rem; }
    .inv-total-row { display: flex; justify-content: space-between; font-size: 0.9rem; color: #374151; padding: 0.4rem 0; border-bottom: 1px solid #f3f4f6; }
    .inv-grand-total { font-size: 1.05rem; font-weight: 700; color: #111827; border-bottom: none; padding-top: 0.6rem; }

    .inv-notes { margin-bottom: 1.5rem; }
    .inv-create-actions { display: flex; gap: 0.75rem; flex-wrap: wrap; }

    @media (max-width: 600px) {
      .inv-form-grid { grid-template-columns: 1fr; }
      .inv-items-header { display: none; }
      .inv-item-row { grid-template-columns: 1fr 50px 80px 70px 28px; }
    }
  `]
})
export class DashboardInvoicesComponent {
  auth     = inject(AuthService);
  creating = signal(false);
  viewing  = signal<Invoice | null>(null);
  createError = signal<string | null>(null);
  today    = new Date().toISOString().split('T')[0];

  private _invoices = signal<Invoice[]>(getMockInvoices(this.auth.currentUser()!.engineerId!));

  invoices = computed(() => this._invoices());

  totals = computed(() => {
    const list = this._invoices();
    return {
      paid:        list.filter(i => i.status === 'paid').reduce((s, i) => s + i.total, 0),
      outstanding: list.filter(i => i.status === 'sent' || i.status === 'overdue').reduce((s, i) => s + i.total, 0),
    };
  });

  draft: {
    customerName: string; customerEmail: string; jobRef: string;
    dueAt: string; items: InvoiceItem[]; subtotal: number; vatAmount: number; total: number; notes: string;
  } = this.emptyDraft();

  startCreate() {
    this.draft = this.emptyDraft();
    this.creating.set(true);
    this.viewing.set(null);
  }

  viewInvoice(inv: Invoice) {
    this.viewing.set(inv);
    this.creating.set(false);
  }

  sendInvoice(id: number) {
    updateInvoiceStatus(id, 'sent');
    this._invoices.set(getMockInvoices(this.auth.currentUser()!.engineerId!));
    const updated = this._invoices().find(i => i.id === id) ?? null;
    this.viewing.set(updated);
  }

  printInvoice() {
    window.print();
  }

  addItem() {
    this.draft.items.push({ description: '', quantity: 1, unitPrice: 0 });
  }

  removeItem(i: number) {
    this.draft.items.splice(i, 1);
    this.recalc();
  }

  recalc() {
    this.draft.subtotal  = this.draft.items.reduce((s, it) => s + it.quantity * it.unitPrice, 0);
    this.draft.vatAmount = Math.round(this.draft.subtotal * 0.2 * 100) / 100;
    this.draft.total     = Math.round((this.draft.subtotal + this.draft.vatAmount) * 100) / 100;
  }

  lineTotal(item: InvoiceItem): number {
    return item.quantity * item.unitPrice;
  }

  saveInvoice(status: InvoiceStatus) {
    if (!this.draft.customerName || !this.draft.customerEmail) {
      this.createError.set('Customer name and email are required.');
      return;
    }
    if (this.draft.items.length === 0 || this.draft.items.every(i => !i.description)) {
      this.createError.set('Add at least one line item.');
      return;
    }
    this.recalc();
    createMockInvoice({
      engineerId:    this.auth.currentUser()!.engineerId!,
      customerName:  this.draft.customerName,
      customerEmail: this.draft.customerEmail,
      jobRef:        this.draft.jobRef || null,
      items:         [...this.draft.items],
      subtotal:      this.draft.subtotal,
      vatAmount:     this.draft.vatAmount,
      total:         this.draft.total,
      status,
      issuedAt:      new Date().toISOString(),
      dueAt:         new Date(this.draft.dueAt).toISOString(),
      notes:         this.draft.notes || null,
    });
    this._invoices.set(getMockInvoices(this.auth.currentUser()!.engineerId!));
    this.creating.set(false);
  }

  markPaid(id: number) {
    updateInvoiceStatus(id, 'paid');
    this._invoices.set(getMockInvoices(this.auth.currentUser()!.engineerId!));
    if (this.viewing()?.id === id) {
      this.viewing.set(this._invoices().find(i => i.id === id) ?? null);
    }
  }

  isOverdue(inv: Invoice): boolean {
    return inv.status === 'sent' && new Date(inv.dueAt) < new Date();
  }

  private emptyDraft() {
    const due = new Date(); due.setDate(due.getDate() + 14);
    return {
      customerName: '', customerEmail: '', jobRef: '',
      dueAt: due.toISOString().split('T')[0],
      items: [{ description: '', quantity: 1, unitPrice: 0 }],
      subtotal: 0, vatAmount: 0, total: 0, notes: ''
    };
  }
}
