import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of, delay } from 'rxjs';
import { ApiResponse, CreateBookingRequest, BookingResult } from '../models/models';
import { USE_MOCK, createMockBooking, getMockBookingById } from '../mock/mock-data';

@Injectable({ providedIn: 'root' })
export class BookingService {
  private http = inject(HttpClient);

  create(request: CreateBookingRequest): Observable<BookingResult> {
    if (USE_MOCK) {
      return of(createMockBooking(request)).pipe(delay(600));
    }
    return this.http.post<ApiResponse<BookingResult>>('api/bookings', request).pipe(
      map(r => r.data!)
    );
  }

  getById(id: number): Observable<BookingResult> {
    if (USE_MOCK) {
      const b = getMockBookingById(id);
      if (!b) {
        return of(createMockBooking({
          quoteId: id, customerName: 'Guest', customerEmail: 'guest@example.com',
          customerPhone: '', address: '', postcode: '', preferredDate: ''
        })).pipe(delay(300));
      }
      return of(b).pipe(delay(300));
    }
    return this.http.get<ApiResponse<BookingResult>>(`api/bookings/${id}`).pipe(
      map(r => r.data!)
    );
  }
}
