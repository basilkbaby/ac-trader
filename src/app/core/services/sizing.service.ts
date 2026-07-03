import { Injectable, signal } from '@angular/core';

export interface SizingRecommendation {
  totalBtu: number;
  kw: number;
  recommendedBtu: number;
  recommendedKw: number;
  roomAreaM2: number;
  multiUnit: boolean;
  label: string;        // e.g. "Café / commercial kitchen"
}

/** Carries a heat-load result from the calculator to the Quote Builder. */
@Injectable({ providedIn: 'root' })
export class SizingService {
  recommendation = signal<SizingRecommendation | null>(null);

  set(rec: SizingRecommendation) { this.recommendation.set(rec); }
  consume(): SizingRecommendation | null {
    const r = this.recommendation();
    this.recommendation.set(null);
    return r;
  }
}
