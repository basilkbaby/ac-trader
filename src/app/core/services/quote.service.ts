import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of, delay } from 'rxjs';
import { ApiResponse, CreateQuoteRequest, QuoteResult } from '../models/models';
import { USE_MOCK, saveMockQuote, getMockQuoteById } from '../mock/mock-data';

@Injectable({ providedIn: 'root' })
export class QuoteService {
  private http = inject(HttpClient);

  preview(request: CreateQuoteRequest): Observable<QuoteResult> {
    if (USE_MOCK) {
      return of(saveMockQuote(request)).pipe(delay(400));
    }
    return this.http.post<ApiResponse<QuoteResult>>('api/quotes/preview', request).pipe(
      map(r => r.data!)
    );
  }

  save(request: CreateQuoteRequest): Observable<QuoteResult> {
    if (USE_MOCK) {
      return of(saveMockQuote(request)).pipe(delay(500));
    }
    return this.http.post<ApiResponse<QuoteResult>>('api/quotes', request).pipe(
      map(r => r.data!)
    );
  }

  getById(id: number): Observable<QuoteResult> {
    if (USE_MOCK) {
      const q = getMockQuoteById(id);
      if (!q) {
        // Return a plausible fallback so the booking page still renders
        return of(saveMockQuote({ jobType: 'install', propertyType: 'flat', roomSizeM2: 25 })).pipe(delay(300));
      }
      return of(q).pipe(delay(300));
    }
    return this.http.get<ApiResponse<QuoteResult>>(`api/quotes/${id}`).pipe(
      map(r => r.data!)
    );
  }
}
