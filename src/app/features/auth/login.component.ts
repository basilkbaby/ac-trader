import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

type Tab = 'customer' | 'engineer';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page-container">
      <div class="login-wrap">

        <div class="login-header">
          <a routerLink="/" class="back-link">← Home</a>
          <h1>Sign in to Cool HQ</h1>
        </div>

        <div class="login-tabs">
          <button class="login-tab" [class.active]="tab() === 'customer'" (click)="tab.set('customer')">
            I'm a homeowner / customer
          </button>
          <button class="login-tab" [class.active]="tab() === 'engineer'" (click)="tab.set('engineer')">
            I'm an engineer
          </button>
        </div>

        <div class="demo-banner">
          <span class="demo-label">Demo credentials</span>
          <span>Email: <strong>{{ tab() === 'engineer' ? 'engineer@demo.com' : 'customer@demo.com' }}</strong></span>
          <span>Password: <strong>demo</strong></span>
          <button class="demo-fill-btn" (click)="fillDemo()">Fill in</button>
        </div>

        <form class="login-form" (ngSubmit)="submit()">
          <div class="form-group">
            <label>Email address</label>
            <input type="email" [(ngModel)]="email" name="email"
              placeholder="{{ tab() === 'engineer' ? 'engineer@demo.com' : 'customer@demo.com' }}"
              autocomplete="email" required />
          </div>
          <div class="form-group">
            <label>Password</label>
            <input [type]="showPassword() ? 'text' : 'password'" [(ngModel)]="password" name="password"
              placeholder="Enter your password" autocomplete="current-password" required />
            <button type="button" class="pw-toggle" (click)="togglePassword()">
              {{ showPassword() ? 'Hide' : 'Show' }}
            </button>
          </div>

          @if (error()) {
            <div class="login-error">{{ error() }}</div>
          }

          <button type="submit" class="btn-primary full-width" [disabled]="loading()">
            {{ loading() ? 'Signing in...' : 'Sign in' }}
          </button>
        </form>

        <div class="login-footer">
          @if (tab() === 'engineer') {
            <p>Not yet on the platform? <a routerLink="/join">Join as an engineer</a></p>
          } @else {
            <p>Need to book a job? <a routerLink="/quote">Get a quote</a></p>
          }
        </div>

      </div>
    </div>
  `,
  styles: [`
    .login-wrap {
      max-width: 440px;
      margin: 3rem auto;
      padding: 0 1.5rem 4rem;
    }
    .login-header { margin-bottom: 2rem; }
    .login-header h1 { font-size: 1.75rem; margin-top: 0.5rem; }

    .login-tabs {
      display: flex;
      border: 1px solid #e5e7eb;
      border-radius: 10px;
      overflow: hidden;
      margin-bottom: 1.5rem;
    }
    .login-tab {
      flex: 1;
      padding: 0.75rem 0.5rem;
      border: none;
      background: white;
      cursor: pointer;
      font-size: 0.85rem;
      font-weight: 500;
      color: #6b7280;
      transition: all 0.15s;
      line-height: 1.3;
    }
    .login-tab.active { background: var(--ink-2); color: white; }

    .demo-banner {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-wrap: wrap;
      background: #fffbeb;
      border: 1px solid #fcd34d;
      border-radius: 10px;
      padding: 0.75rem 1rem;
      font-size: 0.83rem;
      color: #78350f;
      margin-bottom: 1.5rem;
    }
    .demo-label {
      font-weight: 700;
      background: #fcd34d;
      color: #78350f;
      padding: 0.1rem 0.5rem;
      border-radius: 999px;
      font-size: 0.72rem;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .demo-fill-btn {
      margin-left: auto;
      padding: 0.25rem 0.75rem;
      border: 1px solid #f59e0b;
      border-radius: 6px;
      background: white;
      color: #92400e;
      font-size: 0.82rem;
      font-weight: 600;
      cursor: pointer;
    }

    .login-form { display: flex; flex-direction: column; gap: 1.1rem; }
    .form-group { position: relative; }
    .form-group label { display: block; font-size: 0.82rem; font-weight: 600; color: #374151; margin-bottom: 0.35rem; text-transform: uppercase; letter-spacing: 0.04em; }
    .form-group input {
      width: 100%;
      padding: 0.65rem 0.85rem;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      font-size: 0.95rem;
      box-sizing: border-box;
      transition: border-color 0.15s;
    }
    .form-group input:focus { outline: none; border-color: var(--ink-2); }
    .pw-toggle {
      position: absolute;
      right: 0.75rem;
      bottom: 0.65rem;
      background: none;
      border: none;
      font-size: 0.8rem;
      color: #6b7280;
      cursor: pointer;
      font-weight: 500;
    }

    .login-error {
      background: #fee2e2;
      color: #991b1b;
      border: 1px solid #fca5a5;
      border-radius: 8px;
      padding: 0.65rem 1rem;
      font-size: 0.88rem;
    }

    .btn-primary.full-width { margin-top: 0.25rem; }

    .login-footer { margin-top: 1.5rem; text-align: center; font-size: 0.88rem; color: #6b7280; }
    .login-footer a { color: var(--ink-2); font-weight: 500; }
  `]
})
export class LoginComponent {
  private auth   = inject(AuthService);
  private router = inject(Router);
  private route  = inject(ActivatedRoute);

  tab         = signal<Tab>('customer');
  email       = '';
  password    = '';
  loading     = signal(false);
  error       = signal<string | null>(null);
  showPassword = signal(false);

  togglePassword() { this.showPassword.update(v => !v); }

  fillDemo() {
    this.email    = this.tab() === 'engineer' ? 'engineer@demo.com' : 'customer@demo.com';
    this.password = 'demo';
  }

  submit() {
    this.loading.set(true);
    this.error.set(null);
    this.auth.login(this.email, this.password).subscribe({
      next: (user) => {
        this.loading.set(false);
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
        if (returnUrl) {
          this.router.navigateByUrl(returnUrl);
        } else {
          this.router.navigate([user.role === 'engineer' ? '/dashboard' : '/account']);
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.message);
      }
    });
  }
}
