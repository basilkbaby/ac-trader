import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay, map } from 'rxjs';
import { ApiResponse, CustomerBooking, CustomerServicePlan, CustomerAcSystem, CustomerProfile, UpdateCustomerProfileRequest } from '../models/models';
import { USE_MOCK, MOCK_CUSTOMER_BOOKINGS, MOCK_CUSTOMER_PLAN, MOCK_CUSTOMER_AC_SYSTEMS, getMockCustomerProfile, updateMockCustomerProfile } from '../mock/mock-data';

@Injectable({ providedIn: 'root' })
export class AccountService {
  private http = inject(HttpClient);

  bookings(email: string): Observable<CustomerBooking[]> {
    if (USE_MOCK) return of(MOCK_CUSTOMER_BOOKINGS).pipe(delay(200));
    return this.http.get<ApiResponse<CustomerBooking[]>>(`api/account/bookings?email=${encodeURIComponent(email)}`).pipe(map(r => r.data ?? []));
  }

  plan(email: string): Observable<CustomerServicePlan | null> {
    if (USE_MOCK) return of(MOCK_CUSTOMER_PLAN).pipe(delay(200));
    return this.http.get<ApiResponse<CustomerServicePlan | null>>(`api/account/plan?email=${encodeURIComponent(email)}`).pipe(map(r => r.data ?? null));
  }

  systems(email: string): Observable<CustomerAcSystem[]> {
    if (USE_MOCK) return of(MOCK_CUSTOMER_AC_SYSTEMS).pipe(delay(200));
    return this.http.get<ApiResponse<CustomerAcSystem[]>>(`api/account/systems?email=${encodeURIComponent(email)}`).pipe(map(r => r.data ?? []));
  }

  profile(email: string): Observable<CustomerProfile> {
    if (USE_MOCK) return of(getMockCustomerProfile()).pipe(delay(150));
    return this.http.get<ApiResponse<CustomerProfile>>(`api/account/profile?email=${encodeURIComponent(email)}`).pipe(map(r => r.data!));
  }

  updateProfile(email: string, update: UpdateCustomerProfileRequest): Observable<CustomerProfile> {
    if (USE_MOCK) return of(updateMockCustomerProfile(update)).pipe(delay(250));
    return this.http.put<ApiResponse<CustomerProfile>>(`api/account/profile?email=${encodeURIComponent(email)}`, update).pipe(map(r => r.data!));
  }
}
