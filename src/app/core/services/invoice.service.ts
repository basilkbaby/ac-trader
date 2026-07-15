import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay, map } from 'rxjs';
import { ApiResponse, Invoice, InvoiceStatus } from '../models/models';
import { USE_MOCK, getMockInvoices, createMockInvoice, updateInvoiceStatus } from '../mock/mock-data';

@Injectable({ providedIn: 'root' })
export class InvoiceService {
  private http = inject(HttpClient);

  getInvoices(engineerId: number): Observable<Invoice[]> {
    if (USE_MOCK) return of(getMockInvoices(engineerId)).pipe(delay(200));
    return this.http.get<ApiResponse<Invoice[]>>(`api/invoices?engineerId=${engineerId}`).pipe(map(r => r.data ?? []));
  }

  create(engineerId: number, inv: Omit<Invoice, 'id' | 'invoiceNumber'>): Observable<Invoice> {
    if (USE_MOCK) return of(createMockInvoice(inv)).pipe(delay(300));
    const body = {
      customerName: inv.customerName, customerEmail: inv.customerEmail, jobRef: inv.jobRef,
      items: inv.items, subtotal: inv.subtotal, vatAmount: inv.vatAmount, total: inv.total,
      status: inv.status, dueAt: inv.dueAt, notes: inv.notes,
    };
    return this.http.post<ApiResponse<Invoice>>(`api/invoices?engineerId=${engineerId}`, body).pipe(map(r => r.data!));
  }

  setStatus(id: number, status: InvoiceStatus): Observable<void> {
    if (USE_MOCK) { updateInvoiceStatus(id, status); return of(void 0).pipe(delay(150)); }
    return this.http.patch<void>(`api/invoices/${id}/status`, { status });
  }
}
