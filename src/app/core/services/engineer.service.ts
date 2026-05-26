import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, of, delay } from 'rxjs';
import { ApiResponse, Engineer, EngineerDetail, CreateEngineerRequest } from '../models/models';
import { USE_MOCK, MOCK_ENGINEERS, MOCK_ENGINEER_DETAILS } from '../mock/mock-data';

@Injectable({ providedIn: 'root' })
export class EngineerService {
  private http = inject(HttpClient);

  getAll(postcode?: string, available?: boolean): Observable<Engineer[]> {
    if (USE_MOCK) {
      let results = [...MOCK_ENGINEERS];
      if (postcode) {
        const p = postcode.toUpperCase().replace(/\s/g, '');
        results = results.filter(e =>
          e.coveragePostcode.toUpperCase().replace(/\s/g, '').includes(p)
        );
      }
      if (available) {
        results = results.filter(e => e.isAvailable);
      }
      return of(results).pipe(delay(350));
    }

    let params = new HttpParams();
    if (postcode) params = params.set('postcode', postcode);
    if (available !== undefined) params = params.set('available', String(available));

    return this.http.get<ApiResponse<Engineer[]>>('api/engineers', { params }).pipe(
      map(r => r.data ?? [])
    );
  }

  getById(id: number): Observable<EngineerDetail> {
    if (USE_MOCK) {
      const detail = MOCK_ENGINEER_DETAILS[id];
      if (!detail) {
        return of(MOCK_ENGINEER_DETAILS[1]).pipe(delay(300));
      }
      return of(detail).pipe(delay(300));
    }

    return this.http.get<ApiResponse<EngineerDetail>>(`api/engineers/${id}`).pipe(
      map(r => r.data!)
    );
  }

  register(request: CreateEngineerRequest): Observable<Engineer> {
    if (USE_MOCK) {
      const newEngineer: Engineer = {
        id: 9000 + Math.floor(Math.random() * 999),
        fullName: request.fullName,
        companyName: request.companyName,
        coveragePostcode: request.coveragePostcode,
        latitude: request.latitude,
        longitude: request.longitude,
        averageRating: 0,
        jobsCompleted: 0,
        isAvailable: false,
        isVerified: false,
        fGasCertNumber: request.fGasCertNumber,
        specialisms: request.specialisms,
        profileImageUrl: null,
        hourlyRate: request.hourlyRate,
        hasPublicLiability: request.hasPublicLiability,
        hasDbsCheck: false,
        responseRatePercent: 0,
        avgResponseHours: 0,
        brandsSupported: request.brandsSupported,
        memberSince: new Date().toISOString(),
      };
      return of(newEngineer).pipe(delay(600));
    }

    return this.http.post<ApiResponse<Engineer>>('api/engineers', request).pipe(
      map(r => r.data!)
    );
  }
}
