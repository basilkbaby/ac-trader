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
              <button class="user-chip" (click)="toggleUserMenu()" [attr.aria-expanded]="userMenuOpen()">
                <span class="user-chip-avatar">{{ auth.currentUser()!.avatarInitials }}</span>
                <span class="user-chip-name">{{ auth.currentUser()!.fullName.split(' ')[0] }}</span>
                <span class="user-chip-chevron" [class.open]="userMenuOpen()">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>
                </span>
              </button>
              @if (userMenuOpen()) {
                <div class="user-dropdown-backdrop" (click)="closeAll()"></div>
                <div class="user-dropdown">
                  <div class="user-dropdown-header">
                    <span class="user-dropdown-avatar">{{ auth.currentUser()!.avatarInitials }}</span>
                    <div class="user-dropdown-id">
                      <strong>{{ auth.currentUser()!.fullName }}</strong>
                      <span>{{ auth.currentUser()!.email }}</span>
                    </div>
                    <span class="user-role-badge" [class.role-engineer]="auth.isEngineer()">{{ auth.isEngineer() ? 'Engineer' : 'Customer' }}</span>
                  </div>

                  @if (auth.isEngineer()) {
                    <div class="user-dropdown-group">
                      <a routerLink="/dashboard/overview" routerLinkActive="udl-active" class="user-dropdown-link" (click)="closeAll()">
                        <span class="udl-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/></svg></span>
                        Business Hub
                      </a>
                      <a routerLink="/dashboard/jobs" routerLinkActive="udl-active" class="user-dropdown-link" (click)="closeAll()">
                        <span class="udl-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></svg></span>
                        Jobs
                      </a>
                      <a routerLink="/dashboard/quotes" routerLinkActive="udl-active" class="user-dropdown-link" (click)="closeAll()">
                        <span class="udl-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 7h8M8 11h2M8 15h2M14 11h2M14 15h2"/></svg></span>
                        Quotations
                      </a>
                      <a routerLink="/dashboard/clients" routerLinkActive="udl-active" class="user-dropdown-link" (click)="closeAll()">
                        <span class="udl-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.5"/><path d="M3 20a6 6 0 0 1 12 0"/><path d="M16 5a3 3 0 0 1 0 6M21 20a6 6 0 0 0-5-5.9"/></svg></span>
                        Clients
                      </a>
                      <a routerLink="/dashboard/invoices" routerLinkActive="udl-active" class="user-dropdown-link" (click)="closeAll()">
                        <span class="udl-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2h8l4 4v16H6z"/><path d="M14 2v4h4M9 13h6M9 17h6"/></svg></span>
                        Invoices
                      </a>
                      <a routerLink="/dashboard/heat-load" routerLinkActive="udl-active" class="user-dropdown-link" (click)="closeAll()">
                        <span class="udl-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M2 12h20M5 5l14 14M5 19 19 5"/></svg></span>
                        Heat load calc
                      </a>
                    </div>
                    <div class="user-dropdown-divider"></div>
                    <div class="user-dropdown-group">
                      <a routerLink="/dashboard/profile" routerLinkActive="udl-active" class="user-dropdown-link" (click)="closeAll()">
                        <span class="udl-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg></span>
                        My profile
                      </a>
                      @if (auth.currentUser()!.engineerId) {
                        <a [routerLink]="['/engineers', auth.currentUser()!.engineerId]" class="user-dropdown-link" (click)="closeAll()">
                          <span class="udl-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg></span>
                          View public profile
                        </a>
                      }
                    </div>
                  }

                  @if (auth.isCustomer()) {
                    <div class="user-dropdown-group">
                      <a routerLink="/account" [queryParams]="{ tab: 'bookings' }" class="user-dropdown-link" (click)="closeAll()">
                        <span class="udl-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V3h6v1M9 10h6M9 14h6"/></svg></span>
                        Bookings
                      </a>
                      <a routerLink="/account" [queryParams]="{ tab: 'plan' }" class="user-dropdown-link" (click)="closeAll()">
                        <span class="udl-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l7 3v6c0 4-3 7-7 9-4-2-7-5-7-9V6z"/><path d="M9 12l2 2 4-4"/></svg></span>
                        Service plan
                      </a>
                      <a routerLink="/account" [queryParams]="{ tab: 'systems' }" class="user-dropdown-link" (click)="closeAll()">
                        <span class="udl-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M2 12h20M5 5l14 14M5 19 19 5"/></svg></span>
                        My AC systems
                      </a>
                      <a routerLink="/account" [queryParams]="{ tab: 'profile' }" class="user-dropdown-link" (click)="closeAll()">
                        <span class="udl-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg></span>
                        Profile
                      </a>
                    </div>
                  }

                  <div class="user-dropdown-divider"></div>
                  <button class="user-dropdown-signout" (click)="signOut()">
                    <span class="udl-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></svg></span>
                    Sign out
                  </button>
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
            <a routerLink="/dashboard/overview"  (click)="closeAll()">Business Hub</a>
            <a routerLink="/dashboard/jobs"       (click)="closeAll()">Jobs</a>
            <a routerLink="/dashboard/quotes"     (click)="closeAll()">Quotations</a>
            <a routerLink="/dashboard/clients"    (click)="closeAll()">Clients</a>
            <a routerLink="/dashboard/invoices"   (click)="closeAll()">Invoices</a>
            <a routerLink="/dashboard/heat-load"  (click)="closeAll()">Heat load calc</a>
            <a routerLink="/dashboard/profile"    (click)="closeAll()">My profile</a>
            <button class="nav-mobile-signout" (click)="signOut()">Sign out</button>
          }

          @if (auth.isCustomer()) {
            <div class="nav-mobile-divider"></div>
            <a routerLink="/account" [queryParams]="{ tab: 'bookings' }" (click)="closeAll()">Bookings</a>
            <a routerLink="/account" [queryParams]="{ tab: 'plan' }"     (click)="closeAll()">Service plan</a>
            <a routerLink="/account" [queryParams]="{ tab: 'systems' }"  (click)="closeAll()">My AC systems</a>
            <a routerLink="/account" [queryParams]="{ tab: 'profile' }" (click)="closeAll()">Profile</a>
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
    .user-chip-chevron { display: inline-flex; color: var(--text-muted); transition: transform 0.15s; }
    .user-chip-chevron svg { width: 13px; height: 13px; }
    .user-chip-chevron.open { transform: rotate(180deg); }

    .user-dropdown-backdrop { position: fixed; inset: 0; z-index: 99; background: transparent; }

    .user-dropdown {
      position: absolute; right: 0; top: calc(100% + 0.6rem);
      background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
      width: 260px; z-index: 100;
      overflow: hidden;
      animation: udDrop 0.15s ease;
    }
    @keyframes udDrop { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }

    .user-dropdown-header {
      padding: 1rem; background: var(--bg); border-bottom: 1px solid var(--border);
      display: flex; align-items: center; gap: 0.7rem;
    }
    .user-dropdown-avatar {
      width: 38px; height: 38px; flex-shrink: 0; border-radius: 50%;
      background: var(--grad-hero); color: #fff;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.82rem; font-weight: 700;
    }
    .user-dropdown-id { min-width: 0; flex: 1; display: flex; flex-direction: column; gap: 0.1rem; }
    .user-dropdown-id strong { font-size: 0.87rem; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .user-dropdown-id span { font-size: 0.74rem; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .user-role-badge {
      flex-shrink: 0; font-size: 0.64rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em;
      padding: 0.2rem 0.5rem; border-radius: 999px;
      background: var(--success-bg); color: var(--success);
    }
    .user-role-badge.role-engineer { background: var(--brand-light); color: var(--brand); }

    .user-dropdown-group { padding: 0.4rem; display: flex; flex-direction: column; gap: 0.05rem; }
    .user-dropdown-link {
      display: flex; align-items: center; gap: 0.65rem;
      padding: 0.55rem 0.6rem; border-radius: var(--radius-sm);
      font-size: 0.86rem; font-weight: 500; color: var(--text-secondary); text-decoration: none;
      transition: background 0.1s, color 0.1s;
    }
    .user-dropdown-link:hover { background: var(--bg); color: var(--text-primary); text-decoration: none; }
    .user-dropdown-link.udl-active { background: var(--brand-light); color: var(--brand); font-weight: 600; }
    .user-dropdown-link.udl-active .udl-ico { color: var(--brand); }
    .udl-ico { width: 22px; height: 22px; flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; color: var(--text-muted); }
    .udl-ico svg { width: 17px; height: 17px; }

    .user-dropdown-divider { height: 1px; background: var(--border); margin: 0; }
    .user-dropdown-signout {
      width: 100%; display: flex; align-items: center; gap: 0.65rem; text-align: left;
      padding: 0.7rem 0.85rem; margin: 0.4rem;
      background: none; border: none; border-radius: var(--radius-sm);
      font-size: 0.86rem; font-weight: 600; color: var(--danger); cursor: pointer;
      width: calc(100% - 0.8rem);
    }
    .user-dropdown-signout:hover { background: var(--danger-bg); }
    .user-dropdown-signout .udl-ico { color: var(--danger); }

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
