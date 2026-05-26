import { Injectable, signal, computed } from '@angular/core';
import { Observable, of, delay, throwError } from 'rxjs';
import { AuthUser } from '../models/models';
import { USE_MOCK, DEMO_ACCOUNTS } from '../mock/mock-data';

const STORAGE_KEY = 'act_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
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
        setTimeout(() => {
          this.setUser(entry.user);
          sub.next(entry.user);
          sub.complete();
        }, 500);
      });
    }
    // TODO: replace with real HTTP call
    return throwError(() => new Error('Real auth not yet connected.'));
  }

  logout(): void {
    this._user.set(null);
    sessionStorage.removeItem(STORAGE_KEY);
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
