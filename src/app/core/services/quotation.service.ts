import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay, map } from 'rxjs';
import { ApiResponse, SavedQuote, SavedQuoteStatus } from '../models/models';
import { USE_MOCK, getSavedQuotes, getSavedQuoteById, saveEngineerQuote, updateEngineerQuote, updateSavedQuoteStatus } from '../mock/mock-data';

export type SaveQuotePayload = Omit<SavedQuote, 'id' | 'engineerId' | 'createdAt'> & { status?: SavedQuoteStatus };

@Injectable({ providedIn: 'root' })
export class QuotationService {
  private http = inject(HttpClient);

  list(engineerId: number): Observable<SavedQuote[]> {
    if (USE_MOCK) return of(getSavedQuotes(engineerId)).pipe(delay(200));
    return this.http.get<ApiResponse<SavedQuote[]>>(`api/quotations?engineerId=${engineerId}`).pipe(map(r => r.data ?? []));
  }

  getById(id: number): Observable<SavedQuote | null> {
    if (USE_MOCK) return of(getSavedQuoteById(id)).pipe(delay(150));
    return this.http.get<ApiResponse<SavedQuote>>(`api/quotations/${id}`).pipe(map(r => r.data ?? null));
  }

  create(engineerId: number, payload: SaveQuotePayload): Observable<SavedQuote> {
    if (USE_MOCK) return of(saveEngineerQuote({ ...(payload as any), engineerId, createdAt: new Date().toISOString(), status: payload.status ?? 'draft' })).pipe(delay(250));
    return this.http.post<ApiResponse<SavedQuote>>(`api/quotations?engineerId=${engineerId}`, { ...payload, status: payload.status ?? 'draft' }).pipe(map(r => r.data!));
  }

  update(id: number, payload: SaveQuotePayload): Observable<SavedQuote> {
    if (USE_MOCK) { updateEngineerQuote(id, payload as any); return of(getSavedQuoteById(id)!).pipe(delay(250)); }
    return this.http.put<ApiResponse<SavedQuote>>(`api/quotations/${id}`, { ...payload, status: payload.status ?? 'draft' }).pipe(map(r => r.data!));
  }

  setStatus(id: number, status: SavedQuoteStatus): Observable<void> {
    if (USE_MOCK) { updateSavedQuoteStatus(id, status); return of(void 0).pipe(delay(120)); }
    return this.http.patch<void>(`api/quotations/${id}/status`, { status });
  }
}
