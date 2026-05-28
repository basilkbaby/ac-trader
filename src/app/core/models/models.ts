export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  message: string | null;
}

export interface Engineer {
  id: number;
  fullName: string;
  companyName: string;
  coveragePostcode: string;
  latitude: number;
  longitude: number;
  averageRating: number;
  jobsCompleted: number;
  isAvailable: boolean;
  isVerified: boolean;
  fGasCertNumber: string;
  specialisms: string;
  profileImageUrl: string | null;
  hourlyRate: number;
  // Extended trust fields
  hasPublicLiability: boolean;
  hasDbsCheck: boolean;
  responseRatePercent: number;
  avgResponseHours: number;
  brandsSupported: string;
  memberSince: string;
}

export interface EngineerDetail extends Engineer {
  email: string;
  phone: string;
  bio: string;
  createdAt: string;
  reviews: Review[];
  ratingBreakdown: RatingBreakdown;
}

export interface RatingBreakdown {
  professionalism: number;
  punctuality: number;
  quality: number;
  value: number;
}

export interface Review {
  id: number;
  rating: number;
  comment: string;
  customerName: string;
  isVerified: boolean;
  createdAt: string;
  jobType: string;
}

export interface CreateQuoteRequest {
  jobType: string;
  propertyType: string;
  roomSizeM2: number;
  unitCount?: number;
  brandTier?: string;
  serviceJobType?: string;
  faultType?: string;
  customerEmail?: string;
  customerPhone?: string;
  postcodeArea?: string;
}

export interface QuoteResult {
  id: number;
  jobType: string;
  propertyType: string;
  roomSizeM2: number;
  recommendedBtu: string;
  unitCount: number;
  brandTier: string;
  unitCostLow: number;
  unitCostHigh: number;
  labourCostLow: number;
  labourCostHigh: number;
  pipeworkCostLow: number;
  pipeworkCostHigh: number;
  calloutFeeLow: number;
  calloutFeeHigh: number;
  totalLow: number;
  totalHigh: number;
  estimatedDuration: string;
  inclusions: string[];
  status: string;
  createdAt: string;
}

export interface CreateBookingRequest {
  quoteId: number;
  engineerId?: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  postcode: string;
  preferredDate: string;
  notes?: string;
}

export interface BookingResult {
  id: number;
  quoteId: number;
  engineerId: number | null;
  engineerName: string | null;
  customerName: string;
  customerEmail: string;
  address: string;
  postcode: string;
  preferredDate: string;
  status: string;
  notes: string | null;
  createdAt: string;
}

export interface CreateEngineerRequest {
  fullName: string;
  email: string;
  phone: string;
  companyName: string;
  fGasCertNumber: string;
  coveragePostcode: string;
  latitude: number;
  longitude: number;
  hourlyRate: number;
  specialisms: string;
  brandsSupported: string;
  hasPublicLiability: boolean;
  publicLiabilityAmount: number;
  bio: string;
}

// Quote wizard state
export interface QuoteWizardState {
  step: number;
  jobType: string | null;
  unitCount: number;
  roomSize: string | null;
  roomSizeM2: number;
  propertyType: string | null;
  brandTier: string | null;
  serviceJobType: string | null;
  faultType: string | null;
  postcodeArea: string;
  customerEmail: string;
  customerPhone: string;
  result: QuoteResult | null;
}

// Auth
export type UserRole = 'customer' | 'engineer';

export interface AuthUser {
  id: number;
  email: string;
  fullName: string;
  role: UserRole;
  engineerId?: number;
  avatarInitials: string;
}

// Engineer-facing job request
export type JobStatus = 'pending' | 'accepted' | 'active' | 'completed' | 'declined';

export interface JobRequest {
  id: number;
  bookingRef: string;
  customerName: string;
  customerPhone: string;
  address: string;
  postcode: string;
  jobType: string;
  propertyType: string;
  roomSizeM2: number;
  preferredDate: string;
  notes: string | null;
  quoteRange: string;
  status: JobStatus;
  createdAt: string;
}

// Invoices
export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue';

export interface Invoice {
  id: number;
  invoiceNumber: string;
  engineerId: number;
  customerName: string;
  customerEmail: string;
  jobRef: string | null;
  items: InvoiceItem[];
  subtotal: number;
  vatAmount: number;
  total: number;
  status: InvoiceStatus;
  issuedAt: string;
  dueAt: string;
  notes: string | null;
}

// Customer booking summary (for account page)
export interface CustomerBooking {
  id: number;
  bookingRef: string;
  jobType: string;
  address: string;
  preferredDate: string;
  engineerName: string | null;
  quoteRange: string;
  status: string;
  createdAt: string;
}

export interface CustomerServicePlan {
  tier: 'essential' | 'premium' | 'elite';
  tierName: string;
  startDate: string;
  nextServiceDate: string;
  engineerName: string;
  status: 'active' | 'expired';
}

export interface CustomerAcSystem {
  id: number;
  nickname: string;
  brand: string;
  model: string;
  installDate: string;
  lastServicedDate: string | null;
  warrantyExpiry: string | null;
  unitCount: number;
  roomLabel: string;
  serviceStatus: 'ok' | 'due-soon' | 'overdue';
}

// Portfolio (previous work stories)
export interface PortfolioImage {
  id: number;
  caption: string;
  jobType: string;
  color: string;
  accentColor: string;
  postedAt: string;
}

export interface PortfolioGroup {
  id: number;
  engineerId: number;
  title: string;
  coverColor: string;
  coverAccent: string;
  images: PortfolioImage[];
}

// Service plans
export interface ServicePlanTier {
  id: 'essential' | 'premium' | 'elite';
  name: string;
  price: number;
  priceMonthly: number;
  highlight: boolean;
  badge: string | null;
  description: string;
  features: string[];
  notIncluded: string[];
}

// Health check wizard
export type SystemScore = 'good' | 'service-due' | 'urgent';

export interface HealthCheckState {
  step: number;
  systemAge: string | null;
  lastServiced: string | null;
  issues: string[];
  energyBillIncrease: string | null;
  result: HealthCheckResult | null;
}

export interface HealthCheckResult {
  score: SystemScore;
  scoreLabel: string;
  headline: string;
  detail: string;
  energySavingEstimate: string | null;
  suggestedAction: 'none' | 'book-service' | 'book-plan' | 'book-emergency';
  actionLabel: string;
}
