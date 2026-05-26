import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="dashboard-layout">

      <!-- Sidebar -->
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
              <span class="dash-nav-icon">🏠</span> Overview
            </a>
            <a routerLink="/dashboard/jobs"     routerLinkActive="active" (click)="sidebarOpen.set(false)">
              <span class="dash-nav-icon">📅</span> Jobs
            </a>
            <a routerLink="/dashboard/invoices" routerLinkActive="active" (click)="sidebarOpen.set(false)">
              <span class="dash-nav-icon">📄</span> Invoices
            </a>
            <a routerLink="/dashboard/profile"  routerLinkActive="active" (click)="sidebarOpen.set(false)">
              <span class="dash-nav-icon">👤</span> My profile
            </a>
          </nav>

          <div class="dash-sidebar-footer">
            <a routerLink="/engineers/1" class="dash-public-link">View public profile →</a>
            <button class="btn-text dash-signout" (click)="signOut()">Sign out</button>
          </div>
        </div>
      </aside>

      <!-- Main content -->
      <div class="dash-main">
        <div class="dash-topbar">
          <button class="dash-burger" (click)="toggleSidebar()">&#9776;</button>
          <span class="dash-topbar-title">Dashboard</span>
          <div class="dash-topbar-right">
            <span class="availability-toggle">
              <label class="toggle-switch">
                <input type="checkbox" [checked]="available()" (change)="toggleAvailable()" />
                <span class="toggle-slider"></span>
              </label>
              <span class="toggle-label">{{ available() ? 'Available' : 'Unavailable' }}</span>
            </span>
          </div>
        </div>

        <div class="dash-content">
          <router-outlet />
        </div>
      </div>

    </div>
  `,
  styles: [`
    :host { display: block; min-height: calc(100vh - 64px); }

    .dashboard-layout {
      display: flex;
      min-height: calc(100vh - 64px);
      background: #f9fafb;
    }

    .dash-sidebar {
      width: 240px;
      flex-shrink: 0;
      background: #0f172a;
      color: white;
      display: flex;
      flex-direction: column;
    }
    .dash-sidebar-inner {
      position: sticky;
      top: 64px;
      height: calc(100vh - 64px);
      display: flex;
      flex-direction: column;
      padding: 1.5rem 0;
      overflow-y: auto;
    }

    .dash-profile {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0 1.25rem 1.5rem;
      border-bottom: 1px solid rgba(255,255,255,0.1);
      margin-bottom: 1.25rem;
    }
    .dash-avatar {
      width: 40px; height: 40px;
      background: #1e3a5f; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.85rem; font-weight: 700; color: white;
      flex-shrink: 0;
    }
    .dash-profile-info strong { display: block; font-size: 0.88rem; }
    .dash-role { font-size: 0.75rem; color: rgba(255,255,255,0.5); }

    .dash-nav { display: flex; flex-direction: column; gap: 0.25rem; padding: 0 0.75rem; }
    .dash-nav a {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      padding: 0.65rem 0.75rem;
      border-radius: 8px;
      color: rgba(255,255,255,0.65);
      text-decoration: none;
      font-size: 0.9rem;
      font-weight: 500;
      transition: all 0.15s;
    }
    .dash-nav a:hover { background: rgba(255,255,255,0.08); color: white; }
    .dash-nav a.active { background: #1e3a5f; color: white; }
    .dash-nav-icon { font-size: 1rem; }

    .dash-sidebar-footer {
      margin-top: auto;
      padding: 1rem 1.25rem 0;
      border-top: 1px solid rgba(255,255,255,0.1);
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .dash-public-link { font-size: 0.8rem; color: rgba(255,255,255,0.5); text-decoration: none; }
    .dash-public-link:hover { color: white; }
    .dash-signout { color: rgba(255,255,255,0.5); font-size: 0.82rem; text-align: left; padding: 0; }
    .dash-signout:hover { color: white; }

    .dash-main { flex: 1; min-width: 0; display: flex; flex-direction: column; }

    .dash-topbar {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem 1.5rem;
      background: white;
      border-bottom: 1px solid #e5e7eb;
      position: sticky;
      top: 64px;
      z-index: 10;
    }
    .dash-burger { display: none; background: none; border: none; font-size: 1.25rem; cursor: pointer; }
    .dash-topbar-title { font-weight: 600; font-size: 1rem; color: #111827; }
    .dash-topbar-right { margin-left: auto; }

    .availability-toggle { display: flex; align-items: center; gap: 0.5rem; }
    .toggle-switch { position: relative; display: inline-block; width: 40px; height: 22px; }
    .toggle-switch input { opacity: 0; width: 0; height: 0; }
    .toggle-slider {
      position: absolute; cursor: pointer; inset: 0;
      background: #d1d5db; border-radius: 22px; transition: 0.2s;
    }
    .toggle-slider::before {
      content: ''; position: absolute;
      width: 16px; height: 16px; left: 3px; bottom: 3px;
      background: white; border-radius: 50%; transition: 0.2s;
    }
    .toggle-switch input:checked + .toggle-slider { background: #059669; }
    .toggle-switch input:checked + .toggle-slider::before { transform: translateX(18px); }
    .toggle-label { font-size: 0.82rem; color: #374151; font-weight: 500; }

    .dash-content { padding: 2rem 1.5rem; flex: 1; }

    @media (max-width: 768px) {
      .dash-sidebar {
        position: fixed; left: 0; top: 64px; bottom: 0; z-index: 200;
        transform: translateX(-100%); transition: transform 0.25s;
      }
      .dash-sidebar.open { transform: translateX(0); }
      .dash-burger { display: block; }
    }
  `]
})
export class DashboardShellComponent {
  auth      = inject(AuthService);
  sidebarOpen = signal(false);
  available   = signal(true);

  toggleSidebar()  { this.sidebarOpen.update(v => !v); }
  toggleAvailable() { this.available.update(v => !v); }

  signOut() {
    this.auth.logout();
    window.location.href = '/';
  }
}
