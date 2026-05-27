import { Component, inject, signal, OnInit, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BookingService } from '../../core/services/booking.service';
import { QuoteService } from '../../core/services/quote.service';
import { QuoteResult, BookingResult } from '../../core/models/models';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page-container">
      <div class="booking-wrap">

        @if (!confirmed()) {
          <div class="booking-header">
            <a routerLink="/engineers" class="back-link">← Back</a>
            <h1>Book a specialist</h1>
            @if (quote()) {
              <div class="quote-summary">
                <span>{{ quote()!.jobType | titlecase }}</span>
                <span>£{{ quote()!.totalLow }} – £{{ quote()!.totalHigh }}</span>
              </div>
            }
          </div>

          <form (ngSubmit)="submit()">
            <div class="form-grid">
              <div class="form-group form-full">
                <label>Full name *</label>
                <input type="text" [(ngModel)]="form.customerName" name="customerName" required />
              </div>
              <div class="form-group">
                <label>Email *</label>
                <input type="email" [(ngModel)]="form.customerEmail" name="customerEmail" required />
              </div>
              <div class="form-group">
                <label>Phone *</label>
                <input type="tel" [(ngModel)]="form.customerPhone" name="customerPhone" required />
              </div>
              <div class="form-group form-full">
                <label>Installation address *</label>
                <input type="text" [(ngModel)]="form.address" name="address" required />
              </div>
              <div class="form-group">
                <label>Postcode *</label>
                <input type="text" [(ngModel)]="form.postcode" name="postcode" required />
              </div>
              <div class="form-group">
                <label>Preferred date *</label>
                <input type="date" [(ngModel)]="form.preferredDate" name="preferredDate"
                  [min]="minDate" required />
              </div>
              <div class="form-group form-full">
                <label>Any notes for the engineer?</label>
                <textarea [(ngModel)]="form.notes" name="notes" rows="3"
                  placeholder="e.g. access instructions, parking, specific requirements"></textarea>
              </div>
            </div>

            @if (error()) {
              <p class="error-msg">{{ error() }}</p>
            }

            <button type="submit" class="btn-primary full-width" [disabled]="loading()">
              {{ loading() ? 'Confirming...' : 'Confirm booking request' }}
            </button>
            <p class="form-note">No payment taken now - we'll confirm availability first.</p>
          </form>
        }

        @if (confirmed() && booking()) {
          <div class="success-state">
            <div class="success-icon">✓</div>
            <h2>Booking request received</h2>
            <p>We'll match you with a verified engineer and confirm within a few hours.</p>
            <div class="booking-ref">
              Reference: <strong>#ACT-{{ booking()!.id }}</strong>
            </div>
            <p class="booking-email">A confirmation will be sent to {{ booking()!.customerEmail }}</p>
            <a routerLink="/" class="btn-primary">Back to home</a>
          </div>
        }

      </div>
    </div>
  `
})
export class BookingComponent implements OnInit {
  quoteId = input.required<string>();

  private bookingService = inject(BookingService);
  private quoteService = inject(QuoteService);

  quote = signal<QuoteResult | null>(null);
  booking = signal<BookingResult | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);
  confirmed = signal(false);

  minDate = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  form = {
    customerName: '', customerEmail: '', customerPhone: '',
    address: '', postcode: '', preferredDate: '', notes: ''
  };

  ngOnInit() {
    this.quoteService.getById(+this.quoteId()).subscribe({
      next: (q) => this.quote.set(q),
      error: () => {} // non-fatal if quote not found
    });
  }

  submit() {
    this.loading.set(true);
    this.error.set(null);
    this.bookingService.create({
      quoteId: +this.quoteId(),
      customerName: this.form.customerName,
      customerEmail: this.form.customerEmail,
      customerPhone: this.form.customerPhone,
      address: this.form.address,
      postcode: this.form.postcode,
      preferredDate: this.form.preferredDate,
      notes: this.form.notes || undefined
    }).subscribe({
      next: (result) => {
        this.loading.set(false);
        this.booking.set(result);
        this.confirmed.set(true);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.message);
      }
    });
  }
}
