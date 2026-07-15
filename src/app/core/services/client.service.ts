import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay, map } from 'rxjs';
import { ApiResponse, Client } from '../models/models';
import { USE_MOCK, getClients, getClientById, updateClientNotes } from '../mock/mock-data';

@Injectable({ providedIn: 'root' })
export class ClientService {
  private http = inject(HttpClient);

  list(engineerId: number): Observable<Client[]> {
    if (USE_MOCK) return of(getClients(engineerId)).pipe(delay(200));
    return this.http.get<ApiResponse<Client[]>>(`api/clients?engineerId=${engineerId}`).pipe(map(r => r.data ?? []));
  }

  getById(id: number): Observable<Client | null> {
    if (USE_MOCK) return of(getClientById(id)).pipe(delay(150));
    return this.http.get<ApiResponse<Client>>(`api/clients/${id}`).pipe(map(r => r.data ?? null));
  }

  setNotes(id: number, notes: string): Observable<void> {
    if (USE_MOCK) { updateClientNotes(id, notes); return of(void 0).pipe(delay(120)); }
    return this.http.patch<void>(`api/clients/${id}/notes`, { notes });
  }
}
