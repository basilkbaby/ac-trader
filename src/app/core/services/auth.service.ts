import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError, map, tap } from 'rxjs';
import { ApiResponse, AuthUser } from '../models/models';
import { USE_MOCK, DEMO_ACCOUNTS } from '../mock/mock-data';

const STORAGE_KEY = 'act_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private _user = signal<AuthUser | null>(this.loadStored());

  readonly currentUser  = this._user.asReadonly();
  readonly isLoggedIn   = computed(() => this._user() !== null);
  readonly isEngineer   = computed(() => this._user()?.role === 'engineer');
  readonly isCustomer   = computed(() => this._user()?.role === 'customer');

  login(email: string, password: string): Observable<AuthUser> {
    if (USE_MOCK) {
      const entry = DEMO_ACCOUNTS[email.toLowerCase().trim()];
      if (!entry || entry.password !== password) {
        return throwError(() => new Error('Invalid email or password.'));
      }
      return new Observable(sub => {
        setTimeout(() => { this.setUser(entry.user); sub.next(entry.user); sub.complete(); }, 400);
      });
    }
    return this.http.post<ApiResponse<AuthUser>>('api/auth/login', { email, password }).pipe(
      map(r => r.data!),
      tap(user => this.setUser(user))
    );
  }

  logout(): void {
    this._user.set(null);
    sessionStorage.removeItem(STORAGE_KEY);
  }

  /** Patch fields on the signed-in user (e.g. after a profile edit) and re-persist the session. */
  patchCurrentUser(fields: Partial<AuthUser>): void {
    const current = this._user();
    if (!current) return;
    this.setUser({ ...current, ...fields });
  }

  private setUser(user: AuthUser): void {
    this._user.set(user);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  }

  private loadStored(): AuthUser | null {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
}
