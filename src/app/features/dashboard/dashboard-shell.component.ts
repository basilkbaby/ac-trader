import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
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
              <span class="nav-icon">🏠</span> Overview
            </a>
            <a routerLink="/dashboard/jobs" routerLinkActive="active" (click)="sidebarOpen.set(false)">
              <span class="nav-icon">📅</span> Jobs
            </a>
            <a routerLink="/dashboard/invoices" routerLinkActive="active" (click)="sidebarOpen.set(false)">
              <span class="nav-icon">📄</span> Invoices
            </a>
            <a routerLink="/dashboard/profile" routerLinkActive="active" (click)="sidebarOpen.set(false)">
              <span class="nav-icon">👤</span> My profile
            </a>
          </nav>

          <div class="dash-sidebar-footer">
            <a routerLink="/engineers/1" class="footer-link">↗ View public profile</a>
            <button class="footer-btn" (click)="signOut()">Sign out</button>
          </div>

        </div>
      </aside>

      <!-- Main -->
      <div class="dash-main">
        <div class="dash-topbar">
          <button class="dash-burger" (click)="toggleSidebar()">☰</button>
          <span class="dash-topbar-title">Dashboard</span>
          <div class="dash-topbar-right">
            <label class="avail-toggle">
              <input type="checkbox" [checked]="available()" (change)="toggleAvailable()" />
              <span class="avail-slider"></span>
            </label>
            <span class="avail-lbl" [class.on]="available()">{{ available() ? 'Available' : 'Unavailable' }}</span>
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
      background: #f3f4f6;
    }

    .dash-sidebar {
      width: 220px; flex-shrink: 0;
      background: #0f172a; color: white;
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
      background: #1e3a5f; display: flex; align-items: center; justify-content: center;
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
    .nav-icon { font-size: 0.95rem; width: 18px; text-align: center; flex-shrink: 0; }

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
      padding: 0.65rem 1.5rem;
      background: white; border-bottom: 1px solid #e5e7eb;
      position: sticky; top: 64px; z-index: 10;
    }
    .dash-burger { display: none; background: none; border: none; font-size: 1.1rem; cursor: pointer; }
    .dash-topbar-title { font-size: 0.88rem; font-weight: 600; color: #374151; }
    .dash-topbar-right { margin-left: auto; display: flex; align-items: center; gap: 0.5rem; }

    .avail-toggle { position: relative; display: inline-block; width: 36px; height: 20px; cursor: pointer; }
    .avail-toggle input { opacity: 0; width: 0; height: 0; }
    .avail-slider { position: absolute; inset: 0; background: #d1d5db; border-radius: 20px; transition: 0.2s; }
    .avail-slider::before { content: ''; position: absolute; width: 14px; height: 14px; left: 3px; bottom: 3px; background: white; border-radius: 50%; transition: 0.2s; }
    .avail-toggle input:checked + .avail-slider { background: #059669; }
    .avail-toggle input:checked + .avail-slider::before { transform: translateX(16px); }
    .avail-lbl { font-size: 0.78rem; font-weight: 500; color: #9ca3af; }
    .avail-lbl.on { color: #059669; }

    .dash-content { padding: 1.5rem; flex: 1; }

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
  sidebarOpen = signal(false);
  available   = signal(true);

  toggleSidebar()   { this.sidebarOpen.update(v => !v); }
  toggleAvailable() { this.available.update(v => !v); }

  signOut() { this.auth.logout(); window.location.href = '/'; }
}
