import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import { AvailabilityService } from '../../core/services/availability.service';
import { MOCK_ENGINEER_DETAILS } from '../../core/mock/mock-data';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="dash-layout">

      <!-- Left sidebar -->
      <aside class="dash-sidebar" [class.open]="sidebarOpen()">
        <div class="dash-sidebar-inner">

          <div class="dash-profile">
            <div class="dash-avatar">{{ auth.currentUser()!.avatarInitials }}</div>
            <div class="dash-profile-info">
              <strong>{{ auth.currentUser()!.fullName }}</strong>
              <span class="dash-role">AC Engineer</span>
            </div>
          </div>

          <nav class="dash-nav">
            <a routerLink="/dashboard/overview" routerLinkActive="active" (click)="sidebarOpen.set(false)">
              <span class="nav-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/></svg></span> Overview
            </a>
            <a routerLink="/dashboard/jobs" routerLinkActive="active" (click)="sidebarOpen.set(false)">
              <span class="nav-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></svg></span> Jobs
            </a>
            <a routerLink="/dashboard/clients" routerLinkActive="active" (click)="sidebarOpen.set(false)">
              <span class="nav-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.5"/><path d="M3 20a6 6 0 0 1 12 0"/><path d="M16 5a3 3 0 0 1 0 6M21 20a6 6 0 0 0-5-5.9"/></svg></span> Clients
            </a>
            <a routerLink="/dashboard/quotes" routerLinkActive="active" (click)="sidebarOpen.set(false)">
              <span class="nav-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 7h8M8 11h2M8 15h2M14 11h2M14 15h2"/></svg></span> Quotations
            </a>
            <a routerLink="/dashboard/heat-load" routerLinkActive="active" (click)="sidebarOpen.set(false)">
              <span class="nav-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M2 12h20M5 5l14 14M5 19 19 5"/></svg></span> Heat load
            </a>
            <a routerLink="/dashboard/invoices" routerLinkActive="active" (click)="sidebarOpen.set(false)">
              <span class="nav-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2h8l4 4v16H6z"/><path d="M14 2v4h4"/><path d="M9 13h6M9 17h6"/></svg></span> Invoices
            </a>
            <a routerLink="/dashboard/profile" routerLinkActive="active" (click)="sidebarOpen.set(false)">
              <span class="nav-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg></span> My profile
            </a>
          </nav>

          <div class="dash-sidebar-footer">
            <a routerLink="/engineers/1" class="footer-link">View public profile &#8599;</a>
            <button class="footer-btn" (click)="signOut()">Sign out</button>
          </div>

        </div>
      </aside>

      <!-- Main -->
      <div class="dash-main">
        <div class="dash-topbar">
          <button class="dash-burger" (click)="toggleSidebar()" aria-label="Menu">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
          </button>
          <span class="dash-topbar-title">{{ pageTitle() }}</span>
          <div class="dash-topbar-right">
            <a routerLink="/dashboard/profile" class="avail-pill" [class.on]="avail.available()"
               [title]="avail.available() ? 'Available for new jobs — change in profile' : 'Not taking new jobs — change in profile'">
              <span class="avail-dot"></span>
              <span class="avail-pill-text">{{ avail.available() ? 'Available' : 'Unavailable' }}</span>
            </a>
            <a routerLink="/dashboard/quotes/new" class="btn-primary btn-sm topbar-cta">New quote</a>
          </div>
        </div>

        <div class="dash-content">
          <router-outlet />
        </div>
      </div>

    </div>
  `,
  styles: [`
    :host { display: block; }

    .dash-layout {
      display: flex;
      min-height: calc(100vh - 64px);
      background: var(--border);
    }

    .dash-sidebar {
      width: 220px; flex-shrink: 0;
      background: var(--ink); color: white;
    }
    .dash-sidebar-inner {
      position: sticky; top: 64px;
      height: calc(100vh - 64px);
      display: flex; flex-direction: column;
      padding: 1.25rem 0; overflow-y: auto;
    }

    .dash-profile {
      display: flex; align-items: center; gap: 0.65rem;
      padding: 0 1rem 1.1rem;
      border-bottom: 1px solid rgba(255,255,255,0.08);
      margin-bottom: 1rem;
    }
    .dash-avatar {
      width: 36px; height: 36px; border-radius: 50%;
      background: var(--ink-2); display: flex; align-items: center; justify-content: center;
      font-size: 0.78rem; font-weight: 700; flex-shrink: 0;
    }
    .dash-profile-info strong { display: block; font-size: 0.82rem; }
    .dash-role { font-size: 0.72rem; color: rgba(255,255,255,0.4); }

    .dash-nav { display: flex; flex-direction: column; gap: 0.15rem; padding: 0 0.65rem; }
    .dash-nav a {
      display: flex; align-items: center; gap: 0.55rem;
      padding: 0.55rem 0.75rem; border-radius: 8px;
      color: rgba(255,255,255,0.6); text-decoration: none;
      font-size: 0.85rem; font-weight: 500; transition: all 0.12s;
    }
    .dash-nav a:hover  { background: rgba(255,255,255,0.07); color: white; }
    .dash-nav a.active { background: rgba(255,255,255,0.12); color: white; }
    .nav-icon { width: 18px; height: 18px; flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; }
    .nav-icon svg { width: 18px; height: 18px; }

    .dash-sidebar-footer {
      margin-top: auto; padding: 1rem 1rem 0;
      border-top: 1px solid rgba(255,255,255,0.08);
      display: flex; flex-direction: column; gap: 0.35rem;
    }
    .footer-link { font-size: 0.75rem; color: rgba(255,255,255,0.4); text-decoration: none; }
    .footer-link:hover { color: rgba(255,255,255,0.8); }
    .footer-btn { background: none; border: none; color: rgba(255,255,255,0.4); font-size: 0.75rem; text-align: left; cursor: pointer; padding: 0; }
    .footer-btn:hover { color: white; }

    .dash-main { flex: 1; min-width: 0; display: flex; flex-direction: column; }

    .dash-topbar {
      display: flex; align-items: center; gap: 0.85rem;
      padding: 0 1.5rem; height: 56px;
      background: var(--surface); border-bottom: 1px solid var(--border);
      position: sticky; top: 64px; z-index: 10;
    }
    .dash-burger { display: none; background: none; border: none; cursor: pointer; color: var(--text-secondary); padding: 0.25rem; }
    .dash-burger svg { width: 22px; height: 22px; display: block; }
    .dash-topbar-title { font-size: 1rem; font-weight: 700; color: var(--text-primary); letter-spacing: -0.01em; }
    .dash-topbar-right { margin-left: auto; display: flex; align-items: center; gap: 0.6rem; }

    .avail-pill {
      display: inline-flex; align-items: center; gap: 0.45rem;
      font-size: 0.78rem; font-weight: 600; text-decoration: none;
      color: var(--text-secondary); background: var(--bg);
      border: 1px solid var(--border); border-radius: 999px;
      padding: 0.3rem 0.75rem; transition: all 0.15s;
    }
    .avail-pill:hover { border-color: var(--brand); text-decoration: none; }
    .avail-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--text-muted); flex-shrink: 0; }
    .avail-pill.on { color: #065f46; background: #f0fdf4; border-color: #bbf7d0; }
    .avail-pill.on .avail-dot { background: #10b981; box-shadow: 0 0 0 3px rgba(16,185,129,0.18); }

    .dash-content { padding: 1.5rem; flex: 1; }

    @media (max-width: 560px) {
      .avail-pill-text { display: none; }
      .avail-pill { padding: 0.35rem; }
    }

    @media (max-width: 768px) {
      .dash-sidebar {
        position: fixed; left: 0; top: 64px; bottom: 0; z-index: 200;
        transform: translateX(-100%); transition: transform 0.25s;
      }
      .dash-sidebar.open { transform: translateX(0); }
      .dash-burger { display: block; }
      .dash-content { padding: 1rem; }
    }
  `]
})
export class DashboardShellComponent {
  auth        = inject(AuthService);
  avail       = inject(AvailabilityService);
  private router = inject(Router);
  sidebarOpen = signal(false);
  pageTitle   = signal('Business Hub');

  constructor() {
    // Seed availability from the engineer's saved status (single source of truth)
    const eng = MOCK_ENGINEER_DETAILS[this.auth.currentUser()?.engineerId ?? 0];
    if (eng) this.avail.set(eng.isAvailable);

    this.pageTitle.set(this.titleFor(this.router.url));
    this.router.events.pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => this.pageTitle.set(this.titleFor(this.router.url)));
  }

  private titleFor(url: string): string {
    if (url.includes('/quotes/new') || url.includes('/quotes/')) return 'Quote builder';
    if (url.includes('/quotes'))    return 'Quotations';
    if (url.includes('/clients'))   return 'Clients';
    if (url.includes('/heat-load')) return 'Heat load calculator';
    if (url.includes('/invoices'))  return 'Invoices';
    if (url.includes('/jobs'))      return 'Jobs';
    if (url.includes('/profile'))   return 'My profile';
    return 'Business Hub';
  }

  toggleSidebar() { this.sidebarOpen.update(v => !v); }

  signOut() { this.auth.logout(); window.location.href = '/'; }
}
