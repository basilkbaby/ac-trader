import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay, map } from 'rxjs';
import { ApiResponse, JobRequest, JobStatus } from '../models/models';
import { USE_MOCK, getMockJobRequests, updateJobStatus } from '../mock/mock-data';

@Injectable({ providedIn: 'root' })
export class JobService {
  private http = inject(HttpClient);

  getJobs(engineerId: number): Observable<JobRequest[]> {
    if (USE_MOCK) return of(getMockJobRequests(engineerId)).pipe(delay(200));
    return this.http.get<ApiResponse<JobRequest[]>>(`api/jobs?engineerId=${engineerId}`).pipe(map(r => r.data ?? []));
  }

  setStatus(id: number, status: JobStatus): Observable<void> {
    if (USE_MOCK) { updateJobStatus(id, status); return of(void 0).pipe(delay(150)); }
    return this.http.patch<void>(`api/jobs/${id}/status`, { status });
  }
}
