import { Injectable, signal } from '@angular/core';

/** Single source of truth for the engineer's "available for new jobs" status.
 *  Controlled from the Profile page; reflected read-only in the dashboard top bar. */
@Injectable({ providedIn: 'root' })
export class AvailabilityService {
  available = signal(true);
  set(v: boolean) { this.available.set(v); }
  toggle() { this.available.update(v => !v); }
}
