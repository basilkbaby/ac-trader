import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <header class="site-header">
      <nav class="nav-inner">
        <a routerLink="/" class="logo" (click)="closeAll()">
          <span class="logo-mark" aria-hidden="true">&#10052;</span><span class="logo-ac">Cool</span><span class="logo-trader">HQ</span>
        </a>

        <!-- Desktop nav -->
        <ul class="nav-links nav-desktop">
          <li><a routerLink="/quote"         routerLinkActive="active">Get a quote</a></li>
          <li><a routerLink="/engineers"     routerLinkActive="active">Find engineers</a></li>
          <li><a routerLink="/service-plans" routerLinkActive="active">Service plans</a></li>
          <li><a routerLink="/health-check"  routerLinkActive="active">Health check</a></li>

          @if (!auth.isLoggedIn()) {
            <li><a routerLink="/join"  class="btn-join">Join as engineer</a></li>
            <li><a routerLink="/login" class="btn-signin">Sign in</a></li>
          }

          @if (auth.isLoggedIn()) {
            <li class="user-menu-wrap">
              <button class="user-chip" (click)="toggleUserMenu()">
                <span class="user-chip-avatar">{{ auth.currentUser()!.avatarInitials }}</span>
                <span class="user-chip-name">{{ auth.currentUser()!.fullName.split(' ')[0] }}</span>
                <span class="user-chip-chevron">&#9660;</span>
              </button>
              @if (userMenuOpen()) {
                <div class="user-dropdown">
                  <div class="user-dropdown-header">
                    <strong>{{ auth.currentUser()!.fullName }}</strong>
                    <span>{{ auth.currentUser()!.email }}</span>
                  </div>
                  @if (auth.isEngineer()) {
                    <a routerLink="/dashboard/jobs"     class="user-dropdown-link" (click)="closeAll()">📅 Jobs</a>
                    <a routerLink="/dashboard/invoices" class="user-dropdown-link" (click)="closeAll()">📄 Invoices</a>
                    <a routerLink="/dashboard/profile"  class="user-dropdown-link" (click)="closeAll()">👤 Profile</a>
                  }
                  @if (auth.isCustomer()) {
                    <a routerLink="/account" class="user-dropdown-link" (click)="closeAll()">👤 My account</a>
                  }
                  <div class="user-dropdown-divider"></div>
                  <button class="user-dropdown-signout" (click)="signOut()">Sign out</button>
                </div>
              }
            </li>
          }
        </ul>

        <!-- Mobile hamburger -->
        <button class="nav-burger" (click)="toggleMenu()" [attr.aria-expanded]="menuOpen()">
          <span class="burger-bar"></span>
          <span class="burger-bar"></span>
          <span class="burger-bar"></span>
        </button>
      </nav>

      <!-- Mobile dropdown -->
      @if (menuOpen()) {
        <div class="nav-mobile-menu">
          <a routerLink="/quote"         routerLinkActive="active" (click)="closeAll()">Get a quote</a>
          <a routerLink="/engineers"     routerLinkActive="active" (click)="closeAll()">Find engineers</a>
          <a routerLink="/service-plans" routerLinkActive="active" (click)="closeAll()">Service plans</a>
          <a routerLink="/health-check"  routerLinkActive="active" (click)="closeAll()">Health check</a>

          @if (!auth.isLoggedIn()) {
            <div class="nav-mobile-divider"></div>
            <a routerLink="/join"  class="nav-mobile-join"   (click)="closeAll()">Join as engineer</a>
            <a routerLink="/login" class="nav-mobile-signin" (click)="closeAll()">Sign in</a>
          }

          @if (auth.isEngineer()) {
            <div class="nav-mobile-divider"></div>
            <a routerLink="/dashboard/jobs"     (click)="closeAll()">Jobs dashboard</a>
            <a routerLink="/dashboard/invoices" (click)="closeAll()">Invoices</a>
            <a routerLink="/dashboard/profile"  (click)="closeAll()">My profile</a>
            <button class="nav-mobile-signout" (click)="signOut()">Sign out</button>
          }

          @if (auth.isCustomer()) {
            <div class="nav-mobile-divider"></div>
            <a routerLink="/account" (click)="closeAll()">My account</a>
            <button class="nav-mobile-signout" (click)="signOut()">Sign out</button>
          }
        </div>
      }
    </header>

    <main class="main-content">
      <router-outlet />
    </main>

    @if (!isDashboard()) {
      <footer class="site-footer">
        <div class="footer-inner">
          <span class="logo"><span class="logo-mark" aria-hidden="true">&#10052;</span><span class="logo-ac">Cool</span><span class="logo-trader">HQ</span></span>
          <p class="footer-tagline">The UK's Professional Air Conditioning Network.</p>
          <p>Connecting homeowners, businesses and qualified F-Gas certified engineers across the UK - one trusted network.</p>
          <div class="footer-links">
            <a routerLink="/quote">Get a quote</a>
            <a routerLink="/engineers">Find engineers</a>
            <a routerLink="/service-plans">Service plans</a>
            <a routerLink="/health-check">Health check</a>
            <a routerLink="/join">Join as engineer</a>
          </div>
          <div class="footer-divider"></div>
          <p class="footer-small">© 2026 Cool HQ Ltd · coolhq.co.uk · Verified · Insured · F-Gas certified</p>
        </div>
      </footer>
    }
  `,
  styles: [`
    .btn-signin {
      background: transparent;
      border: 1.5px solid var(--border);
      border-radius: 8px;
      padding: 0.35rem 0.85rem;
      font-size: 0.88rem;
      font-weight: 500;
      color: var(--text-secondary);
      transition: all 0.15s;
    }
    .btn-signin:hover { border-color: var(--brand); color: var(--brand); text-decoration: none; }

    .user-menu-wrap { position: relative; }

    .user-chip {
      display: flex; align-items: center; gap: 0.4rem;
      background: var(--bg);
      border: 1.5px solid var(--border);
      border-radius: 999px;
      padding: 0.25rem 0.75rem 0.25rem 0.35rem;
      cursor: pointer; color: var(--text-primary);
      font-size: 0.85rem; font-weight: 500;
      transition: all 0.15s;
    }
    .user-chip:hover { border-color: var(--brand); background: var(--brand-light); }
    .user-chip-avatar {
      width: 26px; height: 26px; border-radius: 50%;
      background: var(--brand);
      color: white;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.7rem; font-weight: 700;
    }
    .user-chip-chevron { font-size: 0.6rem; color: var(--text-muted); }

    .user-dropdown {
      position: absolute; right: 0; top: calc(100% + 0.5rem);
      background: white; border: 1px solid #e5e7eb; border-radius: 12px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.12);
      min-width: 200px; z-index: 100;
      overflow: hidden;
    }
    .user-dropdown-header {
      padding: 0.85rem 1rem;
      background: #f9fafb;
      border-bottom: 1px solid #f3f4f6;
      display: flex; flex-direction: column; gap: 0.15rem;
    }
    .user-dropdown-header strong { font-size: 0.88rem; color: #111827; }
    .user-dropdown-header span { font-size: 0.78rem; color: #9ca3af; }
    .user-dropdown-link {
      display: flex; align-items: center; gap: 0.5rem;
      padding: 0.65rem 1rem;
      font-size: 0.88rem; color: #374151; text-decoration: none;
      transition: background 0.1s;
    }
    .user-dropdown-link:hover { background: #f9fafb; }
    .user-dropdown-divider { height: 1px; background: #f3f4f6; margin: 0.25rem 0; }
    .user-dropdown-signout {
      width: 100%; text-align: left;
      padding: 0.65rem 1rem;
      background: none; border: none;
      font-size: 0.88rem; color: #dc2626; cursor: pointer;
    }
    .user-dropdown-signout:hover { background: #fef2f2; }

    .nav-mobile-divider { height: 1px; background: rgba(255,255,255,0.15); margin: 0.25rem 0; }
    .nav-mobile-signin {
      color: var(--brand) !important;
      font-weight: 600 !important;
    }
    .nav-mobile-signout {
      width: 100%; text-align: left;
      padding: 0.85rem 1.25rem;
      background: none; border: none;
      color: #dc2626; font-size: 1rem; cursor: pointer;
      border-bottom: 1px solid var(--border);
    }

.footer-tagline { color: #fff !important; font-weight: 600; font-size: 1rem !important; margin-bottom: 0.5rem !important; }
    .footer-links {
      display: flex; gap: 1.5rem; flex-wrap: wrap; justify-content: center;
      margin: 1.25rem 0 0;
    }
    .footer-links a { font-size: 0.85rem; color: rgba(255,255,255,0.7); text-decoration: none; transition: color 0.15s; }
    .footer-links a:hover { color: white; }
  `]
})
export class AppComponent {
  auth         = inject(AuthService);
  menuOpen     = signal(false);
  userMenuOpen = signal(false);

  toggleMenu()     { this.menuOpen.update(v => !v); }
  toggleUserMenu() { this.userMenuOpen.update(v => !v); }

  isDashboard(): boolean {
    return window.location.pathname.startsWith('/dashboard');
  }

  closeAll() {
    this.menuOpen.set(false);
    this.userMenuOpen.set(false);
  }

  signOut() {
    this.auth.logout();
    this.closeAll();
    window.location.href = '/';
  }
}
