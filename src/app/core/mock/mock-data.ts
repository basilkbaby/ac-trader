import { Engineer, EngineerDetail, QuoteResult, BookingResult, CreateQuoteRequest, CreateBookingRequest, AuthUser, JobRequest, Invoice, CustomerBooking, CustomerServicePlan, CustomerAcSystem } from '../models/models';

// ─── Toggle ──────────────────────────────────────────────────────────────────
// Set to false once your real API is connected.
export const USE_MOCK = true;

// ─── Engineers ───────────────────────────────────────────────────────────────

export const MOCK_ENGINEERS: Engineer[] = [
  {
    id: 1,
    fullName: 'James Mitchell',
    companyName: 'Mitchell Air Solutions',
    coveragePostcode: 'SW1, SW3, SW7, SW10',
    latitude: 51.4975,
    longitude: -0.1357,
    averageRating: 4.9,
    jobsCompleted: 312,
    isAvailable: true,
    isVerified: true,
    fGasCertNumber: 'FGC-2019-11042',
    specialisms: 'Installation, Replacement, Emergency repair',
    profileImageUrl: null,
    hourlyRate: 75,
    hasPublicLiability: true,
    hasDbsCheck: true,
    responseRatePercent: 98,
    avgResponseHours: 1,
    brandsSupported: 'Daikin, Mitsubishi Electric',
    memberSince: '2019-03-14',
  },
  {
    id: 2,
    fullName: 'Sarah Chen',
    companyName: 'CoolTech London Ltd',
    coveragePostcode: 'N1, N4, N5, N7, N16',
    latitude: 51.5462,
    longitude: -0.1027,
    averageRating: 4.8,
    jobsCompleted: 187,
    isAvailable: true,
    isVerified: true,
    fGasCertNumber: 'FGC-2020-28834',
    specialisms: 'Installation, Service / maintenance, Commercial',
    profileImageUrl: null,
    hourlyRate: 70,
    hasPublicLiability: true,
    hasDbsCheck: false,
    responseRatePercent: 96,
    avgResponseHours: 2,
    brandsSupported: 'Mitsubishi Electric, Panasonic, Fujitsu',
    memberSince: '2020-07-01',
  },
  {
    id: 3,
    fullName: 'Tom Bradley',
    companyName: 'Bradley Climate Systems',
    coveragePostcode: 'SE1, SE5, SE11, SE17',
    latitude: 51.5014,
    longitude: -0.0875,
    averageRating: 4.7,
    jobsCompleted: 254,
    isAvailable: false,
    isVerified: true,
    fGasCertNumber: 'FGC-2018-05521',
    specialisms: 'Replacement, Service / maintenance, Multi-split systems',
    profileImageUrl: null,
    hourlyRate: 68,
    hasPublicLiability: true,
    hasDbsCheck: true,
    responseRatePercent: 94,
    avgResponseHours: 4,
    brandsSupported: 'Samsung, LG, Toshiba',
    memberSince: '2018-11-20',
  },
  {
    id: 4,
    fullName: 'Priya Sharma',
    companyName: 'Sharma Commercial HVAC',
    coveragePostcode: 'E1, E2, E3, EC1, EC2',
    latitude: 51.5155,
    longitude: -0.0722,
    averageRating: 4.9,
    jobsCompleted: 421,
    isAvailable: true,
    isVerified: true,
    fGasCertNumber: 'FGC-2017-33109',
    specialisms: 'Commercial, VRF systems, Installation, Emergency repair',
    profileImageUrl: null,
    hourlyRate: 85,
    hasPublicLiability: true,
    hasDbsCheck: true,
    responseRatePercent: 99,
    avgResponseHours: 1,
    brandsSupported: 'Daikin, Mitsubishi Electric, Hitachi',
    memberSince: '2017-05-08',
  },
  {
    id: 5,
    fullName: 'Ryan O\'Connor',
    companyName: 'O\'Connor Rapid Response AC',
    coveragePostcode: 'W1, W2, W6, W8, W11',
    latitude: 51.5074,
    longitude: -0.1893,
    averageRating: 4.6,
    jobsCompleted: 138,
    isAvailable: true,
    isVerified: true,
    fGasCertNumber: 'FGC-2021-44821',
    specialisms: 'Emergency repair, Service / maintenance, Installation',
    profileImageUrl: null,
    hourlyRate: 80,
    hasPublicLiability: true,
    hasDbsCheck: false,
    responseRatePercent: 97,
    avgResponseHours: 1,
    brandsSupported: 'Daikin, Samsung, LG, Midea',
    memberSince: '2021-01-15',
  },
  {
    id: 6,
    fullName: 'Claire Davies',
    companyName: 'Davies Aire Ltd',
    coveragePostcode: 'EC1, EC2, EC3, EC4, WC1',
    latitude: 51.5196,
    longitude: -0.1006,
    averageRating: 4.8,
    jobsCompleted: 203,
    isAvailable: false,
    isVerified: true,
    fGasCertNumber: 'FGC-2020-61774',
    specialisms: 'Installation, Service / maintenance, Heat pumps',
    profileImageUrl: null,
    hourlyRate: 72,
    hasPublicLiability: true,
    hasDbsCheck: true,
    responseRatePercent: 95,
    avgResponseHours: 3,
    brandsSupported: 'Fujitsu, Panasonic, Toshiba',
    memberSince: '2020-02-28',
  },
  {
    id: 7,
    fullName: 'Marcus Webb',
    companyName: 'Webb Air & Refrigeration',
    coveragePostcode: 'NW1, NW3, NW6, NW8',
    latitude: 51.5390,
    longitude: -0.1425,
    averageRating: 4.5,
    jobsCompleted: 91,
    isAvailable: true,
    isVerified: false,
    fGasCertNumber: 'FGC-2022-80032',
    specialisms: 'Installation, Replacement',
    profileImageUrl: null,
    hourlyRate: 62,
    hasPublicLiability: true,
    hasDbsCheck: false,
    responseRatePercent: 88,
    avgResponseHours: 6,
    brandsSupported: 'LG, Samsung',
    memberSince: '2022-09-01',
  },
  {
    id: 8,
    fullName: 'Hamid Qureshi',
    companyName: 'QAir Services',
    coveragePostcode: 'IG1, IG2, IG3, E12, E6',
    latitude: 51.5580,
    longitude: 0.0716,
    averageRating: 4.7,
    jobsCompleted: 164,
    isAvailable: true,
    isVerified: true,
    fGasCertNumber: 'FGC-2019-55290',
    specialisms: 'Installation, Service / maintenance, Residential',
    profileImageUrl: null,
    hourlyRate: 65,
    hasPublicLiability: true,
    hasDbsCheck: true,
    responseRatePercent: 93,
    avgResponseHours: 3,
    brandsSupported: 'Mitsubishi Electric, Daikin, Hitachi',
    memberSince: '2019-06-12',
  },
];

// ─── Engineer details (extends base with reviews + rating breakdown + bio) ───

export const MOCK_ENGINEER_DETAILS: Record<number, EngineerDetail> = {
  1: {
    ...MOCK_ENGINEERS[0],
    email: 'james@mitchellair.co.uk',
    phone: '07700 900 142',
    bio: "I've been installing and servicing air conditioning systems across South West London for over 8 years. I specialise in Daikin and Mitsubishi Electric residential systems and take real pride in clean, tidy installations with no mess left behind. Every job gets a full written report and I'm always happy to explain what I've done in plain English.",
    createdAt: '2019-03-14T09:00:00Z',
    ratingBreakdown: { professionalism: 5.0, punctuality: 4.9, quality: 4.9, value: 4.8 },
    reviews: [
      {
        id: 101,
        rating: 5,
        comment: "James installed a Daikin split unit in our master bedroom. Arrived exactly on time, covered the floors, ran the pipes neatly through the cavity wall and left everything spotless. Cold in 30 minutes, couldn't be happier.",
        customerName: 'Fiona H.',
        isVerified: true,
        createdAt: '2024-11-14T14:22:00Z',
        jobType: 'Installation'
      },
      {
        id: 102,
        rating: 5,
        comment: "Annual service done quickly and professionally. James found a small refrigerant leak we had no idea about - caught it early and fixed it on the same visit. Brilliant.",
        customerName: 'Richard T.',
        isVerified: true,
        createdAt: '2024-09-03T10:15:00Z',
        jobType: 'Service / maintenance'
      },
      {
        id: 103,
        rating: 5,
        comment: "Emergency call on a Saturday - unit stopped working in the heat wave. James was there within 2 hours. Diagnosed a faulty capacitor, had the part in the van, fixed it within the hour. Absolute legend.",
        customerName: 'Olga M.',
        isVerified: true,
        createdAt: '2024-07-19T16:50:00Z',
        jobType: 'Emergency repair'
      },
      {
        id: 104,
        rating: 4,
        comment: "Great work replacing our old unit. Took a bit longer than expected but the finish was excellent and James explained everything clearly.",
        customerName: 'Ben K.',
        isVerified: true,
        createdAt: '2024-05-08T11:00:00Z',
        jobType: 'Replacement'
      },
    ]
  },
  2: {
    ...MOCK_ENGINEERS[1],
    email: 'sarah@cooltechlondon.co.uk',
    phone: '07700 900 387',
    bio: "I run CoolTech London from North London, covering residential and light commercial AC installation and servicing. I'm a certified Mitsubishi Electric and Panasonic specialist with a strong focus on energy efficiency - I'll always tell you honestly whether a repair or replacement makes more financial sense. No upselling, just good advice.",
    createdAt: '2020-07-01T09:00:00Z',
    ratingBreakdown: { professionalism: 4.9, punctuality: 4.7, quality: 4.9, value: 4.8 },
    reviews: [
      {
        id: 201,
        rating: 5,
        comment: "Sarah serviced our three-year-old Mitsubishi and found the drain line was partially blocked. Cleared it, cleaned the filters, and the system is running noticeably quieter. Very thorough.",
        customerName: 'Alexei P.',
        isVerified: true,
        createdAt: '2024-10-22T13:30:00Z',
        jobType: 'Service / maintenance'
      },
      {
        id: 202,
        rating: 5,
        comment: "Installed a Panasonic unit in our home office. Sarah was on time, respectful of the space, and the pipework is hidden beautifully. Recommended to two neighbours already.",
        customerName: 'Nadia W.',
        isVerified: true,
        createdAt: '2024-08-05T09:45:00Z',
        jobType: 'Installation'
      },
      {
        id: 203,
        rating: 4,
        comment: "Good service overall. Came back to adjust the angle of the indoor unit which was blowing air too directly - no fuss, sorted it quickly.",
        customerName: 'Joe F.',
        isVerified: true,
        createdAt: '2024-06-14T16:20:00Z',
        jobType: 'Installation'
      },
    ]
  },
  3: {
    ...MOCK_ENGINEERS[2],
    email: 'tom@bradleyclimate.co.uk',
    phone: '07700 900 514',
    bio: "Bradley Climate Systems has been operating in South East London since 2015. I handle everything from single-room splits to multi-room systems for larger properties. I'm particularly experienced with Samsung and LG systems and carry a wide range of common parts to minimise return visits.",
    createdAt: '2018-11-20T09:00:00Z',
    ratingBreakdown: { professionalism: 4.8, punctuality: 4.6, quality: 4.8, value: 4.7 },
    reviews: [
      {
        id: 301,
        rating: 5,
        comment: "Replaced our ageing Samsung unit with a new model. Tom handled the removal and install in a single day and the new unit is whisper quiet. Really knowledgeable.",
        customerName: 'Marcus A.',
        isVerified: true,
        createdAt: '2024-09-30T14:00:00Z',
        jobType: 'Replacement'
      },
      {
        id: 302,
        rating: 4,
        comment: "Decent annual service. Explained what he was checking at each step which I appreciated. Would book again.",
        customerName: 'Leila J.',
        isVerified: true,
        createdAt: '2024-07-11T10:00:00Z',
        jobType: 'Service / maintenance'
      },
      {
        id: 303,
        rating: 5,
        comment: "Installed a 3-head multi-split for our house. A 2-day job done tidily and professionally. The pipework routing through the loft is neat. Really impressed.",
        customerName: 'Simon G.',
        isVerified: true,
        createdAt: '2024-04-18T09:30:00Z',
        jobType: 'Installation'
      },
    ]
  },
  4: {
    ...MOCK_ENGINEERS[3],
    email: 'priya@sharmacommercial.co.uk',
    phone: '07700 900 621',
    bio: "With 9 years in the industry and over 420 completed jobs, Sharma Commercial HVAC handles everything from small offices to large commercial fit-outs. I'm a Daikin D1 Installer and Mitsubishi Diamond contractor. If you have a multi-zone or VRF system, I've almost certainly worked on it.",
    createdAt: '2017-05-08T09:00:00Z',
    ratingBreakdown: { professionalism: 5.0, punctuality: 5.0, quality: 4.9, value: 4.8 },
    reviews: [
      {
        id: 401,
        rating: 5,
        comment: "Priya designed and installed a 6-zone Daikin VRF system across our 3,000 sq ft office. On budget, on time, and the commissioning was flawless. Our energy bills are already down.",
        customerName: 'David L. (Office Manager)',
        isVerified: true,
        createdAt: '2024-10-08T11:00:00Z',
        jobType: 'Commercial installation'
      },
      {
        id: 402,
        rating: 5,
        comment: "Service contract for our 8-unit commercial space. Priya's team come twice a year - detailed reports every time and problems always spotted before they become expensive.",
        customerName: 'Carly N. (Facilities)',
        isVerified: true,
        createdAt: '2024-08-22T14:15:00Z',
        jobType: 'Service / maintenance'
      },
      {
        id: 403,
        rating: 5,
        comment: "Emergency breakdown on a Friday afternoon - Priya was there in under 2 hours and had us back up by 5pm. Saved the weekend for our restaurant.",
        customerName: 'Ahmed R.',
        isVerified: true,
        createdAt: '2024-06-28T17:30:00Z',
        jobType: 'Emergency repair'
      },
    ]
  },
  5: {
    ...MOCK_ENGINEERS[4],
    email: 'ryan@oconnorrapid.co.uk',
    phone: '07700 900 733',
    bio: "I started O'Connor Rapid Response AC because I was tired of customers waiting days for an engineer. I cover West and Central London with same-day availability most days. I'm not the cheapest option but I'm there when you need me - and I fix it first time.",
    createdAt: '2021-01-15T09:00:00Z',
    ratingBreakdown: { professionalism: 4.7, punctuality: 4.9, quality: 4.6, value: 4.3 },
    reviews: [
      {
        id: 501,
        rating: 5,
        comment: "Our Daikin packed in on the hottest day of the year. Ryan arrived within 90 minutes and diagnosed a blocked condenser coil. Cleaned and tested - all sorted by midday.",
        customerName: 'Tasha E.',
        isVerified: true,
        createdAt: '2024-07-22T12:45:00Z',
        jobType: 'Emergency repair'
      },
      {
        id: 502,
        rating: 4,
        comment: "Fast response and fixed the problem. A bit pricier than expected but given he came out same day I think it's fair.",
        customerName: 'Phil D.',
        isVerified: true,
        createdAt: '2024-05-30T16:00:00Z',
        jobType: 'Emergency repair'
      },
    ]
  },
  6: {
    ...MOCK_ENGINEERS[5],
    email: 'claire@daviesaire.co.uk',
    phone: '07700 900 891',
    bio: "Davies Aire specialises in Fujitsu and Panasonic systems for the City and WC postcodes. I work across residential and commercial clients and have a particular interest in heat pump and hybrid systems. All my work is covered by a 12-month workmanship guarantee.",
    createdAt: '2020-02-28T09:00:00Z',
    ratingBreakdown: { professionalism: 4.9, punctuality: 4.8, quality: 4.9, value: 4.7 },
    reviews: [
      {
        id: 601,
        rating: 5,
        comment: "Claire installed a Fujitsu multi-split in our flat. Incredibly tidy work - the pipes are hidden behind trunking that actually matches our skirting boards. Shows real care.",
        customerName: 'Yuki T.',
        isVerified: true,
        createdAt: '2024-11-01T13:00:00Z',
        jobType: 'Installation'
      },
      {
        id: 602,
        rating: 5,
        comment: "Annual service on our office units - thorough, quick, and detailed report afterwards. Claire noticed the outdoor unit was partially blocked by new signage we'd installed. Fixed on the spot.",
        customerName: 'Graham B.',
        isVerified: true,
        createdAt: '2024-08-14T10:30:00Z',
        jobType: 'Service / maintenance'
      },
    ]
  },
  7: {
    ...MOCK_ENGINEERS[6],
    email: 'marcus@webbair.co.uk',
    phone: '07700 900 944',
    bio: "Based in North West London, I cover NW1 through NW8. I'm a newer engineer on the platform but already have 90+ jobs under my belt. Competitive rates for straightforward installs and replacements.",
    createdAt: '2022-09-01T09:00:00Z',
    ratingBreakdown: { professionalism: 4.6, punctuality: 4.5, quality: 4.5, value: 4.7 },
    reviews: [
      {
        id: 701,
        rating: 5,
        comment: "Marcus installed an LG unit in our living room. Good clean job, explained the controls thoroughly. Would recommend.",
        customerName: 'Petra N.',
        isVerified: true,
        createdAt: '2024-10-19T11:45:00Z',
        jobType: 'Installation'
      },
      {
        id: 702,
        rating: 4,
        comment: "Solid work replacing an old unit. Ran slightly late but communicated well and the install itself was neat.",
        customerName: 'Callum R.',
        isVerified: false,
        createdAt: '2024-07-02T15:00:00Z',
        jobType: 'Replacement'
      },
    ]
  },
  8: {
    ...MOCK_ENGINEERS[7],
    email: 'hamid@qairservices.co.uk',
    phone: '07700 901 002',
    bio: "QAir Services covers East London and the IG postcodes. I've been working on residential AC systems since 2016, mainly Mitsubishi Electric and Daikin. Fair prices, reliable service, and I always call ahead if I'm running early or late.",
    createdAt: '2019-06-12T09:00:00Z',
    ratingBreakdown: { professionalism: 4.8, punctuality: 4.7, quality: 4.7, value: 4.8 },
    reviews: [
      {
        id: 801,
        rating: 5,
        comment: "Hamid has serviced our Mitsubishi every year for 3 years now. Reliable, thorough, and reasonably priced. The reports he provides are very detailed.",
        customerName: 'Layla A.',
        isVerified: true,
        createdAt: '2024-09-10T09:00:00Z',
        jobType: 'Service / maintenance'
      },
      {
        id: 802,
        rating: 4,
        comment: "Good installation of a Daikin in our bedroom. Took care to discuss optimal placement before starting.",
        customerName: 'Dan C.',
        isVerified: true,
        createdAt: '2024-06-05T14:30:00Z',
        jobType: 'Installation'
      },
    ]
  },
};

// ─── Demo auth accounts ───────────────────────────────────────────────────────

export const DEMO_ACCOUNTS: Record<string, { password: string; user: AuthUser }> = {
  'engineer@demo.com': {
    password: 'demo',
    user: { id: 1, email: 'engineer@demo.com', fullName: 'James Mitchell', role: 'engineer', engineerId: 1, avatarInitials: 'JM' }
  },
  'customer@demo.com': {
    password: 'demo',
    user: { id: 101, email: 'customer@demo.com', fullName: 'Alex Thompson', role: 'customer', avatarInitials: 'AT' }
  },
};

// ─── Engineer job requests (demo engineer id 1) ───────────────────────────────

let _jobRequests: JobRequest[] = [
  { id: 5001, bookingRef: '#ACT-5001', customerName: 'Sophie Walker', customerPhone: '07700 902 111', address: '14 Eaton Square, London', postcode: 'SW1W 9BE', jobType: 'Installation', propertyType: 'flat', roomSizeM2: 28, preferredDate: '2026-06-10', notes: 'Fourth floor flat, lift available.', quoteRange: '£1,440 – £2,520', status: 'pending', createdAt: '2026-05-24T09:15:00Z' },
  { id: 5002, bookingRef: '#ACT-5002', customerName: 'Gareth Evans', customerPhone: '07700 902 222', address: '87 Chelsea Embankment, London', postcode: 'SW3 4LW', jobType: 'Replacement', propertyType: 'terr', roomSizeM2: 35, preferredDate: '2026-06-12', notes: 'Existing Mitsubishi from 2014. Happy to go Daikin.', quoteRange: '£1,320 – £2,280', status: 'pending', createdAt: '2026-05-25T14:30:00Z' },
  { id: 5003, bookingRef: '#ACT-5003', customerName: 'Nina Patel', customerPhone: '07700 902 333', address: '22 Sloane Gardens, London', postcode: 'SW1W 8DP', jobType: 'Service / maintenance', propertyType: 'flat', roomSizeM2: 20, preferredDate: '2026-06-08', notes: null, quoteRange: '£96 – £144', status: 'accepted', createdAt: '2026-05-20T11:00:00Z' },
  { id: 5004, bookingRef: '#ACT-5004', customerName: 'Thomas Hardy', customerPhone: '07700 902 444', address: '5 Cadogan Square, London', postcode: 'SW1X 0HT', jobType: 'Emergency repair', propertyType: 'semi', roomSizeM2: 40, preferredDate: '2026-05-23', notes: 'Unit making loud grinding noise and not cooling properly.', quoteRange: '£144 – £264', status: 'active', createdAt: '2026-05-22T16:45:00Z' },
  { id: 5005, bookingRef: '#ACT-5005', customerName: 'Fiona Harrison', customerPhone: '07700 902 555', address: "38 King's Road, London", postcode: 'SW3 5UR', jobType: 'Installation', propertyType: 'terr', roomSizeM2: 25, preferredDate: '2026-05-15', notes: 'New build kitchen extension.', quoteRange: '£1,284 – £2,220', status: 'completed', createdAt: '2026-05-10T08:30:00Z' },
  { id: 5006, bookingRef: '#ACT-5006', customerName: 'Marco Rossi', customerPhone: '07700 902 666', address: '11 Pont Street, London', postcode: 'SW1X 9EH', jobType: 'Service / maintenance', propertyType: 'flat', roomSizeM2: 30, preferredDate: '2026-05-08', notes: null, quoteRange: '£96 – £144', status: 'completed', createdAt: '2026-05-04T10:00:00Z' },
];

export function getMockJobRequests(_engineerId: number): JobRequest[] { return _jobRequests; }

export function updateJobStatus(jobId: number, status: JobRequest['status']): void {
  _jobRequests = _jobRequests.map(j => j.id === jobId ? { ...j, status } : j);
}

// ─── Invoices (demo engineer id 1) ────────────────────────────────────────────

let nextInvoiceId = 7004;

let _invoices: Invoice[] = [
  {
    id: 7001, invoiceNumber: 'INV-0001', engineerId: 1,
    customerName: 'Fiona Harrison', customerEmail: 'fiona.harrison@email.com', jobRef: '#ACT-5005',
    items: [
      { description: 'Daikin FTXM25R supply & installation', quantity: 1, unitPrice: 1850 },
      { description: 'Pipework & fittings (5m run)', quantity: 1, unitPrice: 220 },
      { description: 'Commissioning & test', quantity: 1, unitPrice: 80 },
    ],
    subtotal: 2150, vatAmount: 430, total: 2580,
    status: 'paid', issuedAt: '2026-05-15T17:00:00Z', dueAt: '2026-05-29T17:00:00Z', notes: 'Thank you for your business.',
  },
  {
    id: 7002, invoiceNumber: 'INV-0002', engineerId: 1,
    customerName: 'Marco Rossi', customerEmail: 'marco.rossi@email.com', jobRef: '#ACT-5006',
    items: [
      { description: 'Annual AC service - Daikin FTXM30R', quantity: 1, unitPrice: 110 },
      { description: 'Filter replacement (set of 2)', quantity: 1, unitPrice: 18 },
    ],
    subtotal: 128, vatAmount: 25.6, total: 153.6,
    status: 'paid', issuedAt: '2026-05-08T16:00:00Z', dueAt: '2026-05-22T16:00:00Z', notes: null,
  },
  {
    id: 7003, invoiceNumber: 'INV-0003', engineerId: 1,
    customerName: 'Thomas Hardy', customerEmail: 'thomas.hardy@email.com', jobRef: '#ACT-5004',
    items: [
      { description: 'Emergency call-out fee', quantity: 1, unitPrice: 120 },
      { description: 'Capacitor replacement (compressor)', quantity: 1, unitPrice: 85 },
      { description: 'Refrigerant top-up (150g R32)', quantity: 1, unitPrice: 45 },
    ],
    subtotal: 250, vatAmount: 50, total: 300,
    status: 'sent', issuedAt: '2026-05-23T18:30:00Z', dueAt: '2026-06-06T18:30:00Z', notes: 'Payment due within 14 days. BACS preferred.',
  },
];

export function getMockInvoices(engineerId: number): Invoice[] {
  return _invoices.filter(i => i.engineerId === engineerId);
}

export function addMockInvoice(invoice: Invoice): void {
  _invoices = [invoice, ..._invoices];
}

export function nextMockInvoiceNumber(): string {
  return `INV-${String(nextInvoiceId - 7000).padStart(4, '0')}`;
}

export function createMockInvoice(inv: Omit<Invoice, 'id' | 'invoiceNumber'>): Invoice {
  const full: Invoice = { ...inv, id: nextInvoiceId++, invoiceNumber: nextMockInvoiceNumber() };
  _invoices = [full, ..._invoices];
  return full;
}

export function updateInvoiceStatus(invoiceId: number, status: Invoice['status']): void {
  _invoices = _invoices.map(i => i.id === invoiceId ? { ...i, status } : i);
}

// ─── Customer portal data ─────────────────────────────────────────────────────

export const MOCK_CUSTOMER_BOOKINGS: CustomerBooking[] = [
  { id: 4001, bookingRef: '#ACT-4001', jobType: 'Installation', address: '12 Maple Avenue, London', preferredDate: '2026-06-15', engineerName: 'James Mitchell', quoteRange: '£1,440 – £2,520', status: 'confirmed', createdAt: '2026-05-20T10:30:00Z' },
  { id: 4002, bookingRef: '#ACT-4002', jobType: 'Service / maintenance', address: '12 Maple Avenue, London', preferredDate: '2025-08-10', engineerName: 'James Mitchell', quoteRange: '£96 – £144', status: 'completed', createdAt: '2025-07-28T09:00:00Z' },
];

export const MOCK_CUSTOMER_PLAN: CustomerServicePlan = {
  tier: 'premium', tierName: 'Premium', startDate: '2026-01-15',
  nextServiceDate: '2027-01-15', engineerName: 'James Mitchell', status: 'active',
};

export const MOCK_CUSTOMER_AC_SYSTEMS: CustomerAcSystem[] = [
  {
    id: 1,
    nickname: 'Living room',
    brand: 'Daikin',
    model: 'FTXB25C',
    installDate: '2023-06-15',
    lastServicedDate: '2025-08-10',
    warrantyExpiry: '2028-06-15',
    unitCount: 1,
    roomLabel: '25m² living room',
    serviceStatus: 'ok',
  },
  {
    id: 2,
    nickname: 'Master bedroom',
    brand: 'Mitsubishi Electric',
    model: 'MSZ-AP20VG',
    installDate: '2022-04-03',
    lastServicedDate: '2024-03-20',
    warrantyExpiry: '2027-04-03',
    unitCount: 1,
    roomLabel: '18m² bedroom',
    serviceStatus: 'due-soon',
  },
];

export const MOCK_MONTHLY_EARNINGS: { month: string; amount: number }[] = [
  { month: 'Dec', amount: 2840 },
  { month: 'Jan', amount: 3120 },
  { month: 'Feb', amount: 2650 },
  { month: 'Mar', amount: 3480 },
  { month: 'Apr', amount: 4210 },
  { month: 'May', amount: 3960 },
];

// ─── Quote calculation ────────────────────────────────────────────────────────

let nextQuoteId = 1001;

export function computeMockQuote(req: CreateQuoteRequest): QuoteResult {
  const btu        = getBtu(req.roomSizeM2);
  const unitCount  = req.unitCount  ?? 1;
  const brandTier  = req.brandTier  ?? 'mid';
  const isIR       = req.jobType === 'install' || req.jobType === 'replace';
  const isService  = req.jobType === 'service';
  const isEmerg    = req.jobType === 'emergency';

  type Range = [number, number];

  // Unit supply cost per unit - by brand tier and room size bracket
  const sizeBracket = req.roomSizeM2 <= 20 ? 'small'
    : req.roomSizeM2 <= 35 ? 'medium'
    : req.roomSizeM2 <= 60 ? 'large' : 'xlarge';

  const unitCostByTier: Record<string, Record<string, Range>> = {
    budget:  { small: [350,550],  medium: [450,700],  large: [600,950],  xlarge: [800,1200]  },
    mid:     { small: [550,800],  medium: [700,1050], large: [950,1400], xlarge: [1200,1800] },
    premium: { small: [850,1200], medium: [1100,1600],large: [1400,2000],xlarge: [1800,2600] },
  };

  // Multi-split outdoor unit uplift when ≥ 2 indoor units
  const multiSplitUplift: Record<number, Range> = { 2:[300,500], 3:[500,800], 4:[700,1100] };

  // Labour: first unit + per additional unit
  const labourFirst: Range    = [220, 380];
  const labourExtra: Range    = [150, 250];

  // Pipework per unit by property type
  const pipeByProp: Record<string, Range> = {
    flat: [80,140], terr: [100,180], semi: [130,220], det: [160,260], comm: [220,380],
  };

  // Service labour by service type
  const svcCosts: Record<string, Range> = {
    annual: [80,130], strip: [140,220], repair: [95,160],
  };

  let unitLow=0, unitHigh=0, labLow=0, labHigh=0;
  let pipeLow=0, pipeHigh=0, calloutLow=0, calloutHigh=0;
  let estimatedDuration='', inclusions: string[]=[];

  if (isIR) {
    const [uL, uH] = unitCostByTier[brandTier]?.[sizeBracket] ?? [500,800];
    unitLow  = uL * unitCount;
    unitHigh = uH * unitCount;

    labLow  = labourFirst[0] + (unitCount - 1) * labourExtra[0];
    labHigh = labourFirst[1] + (unitCount - 1) * labourExtra[1];

    const [pL, pH] = pipeByProp[req.propertyType] ?? [100,180];
    pipeLow  = pL * unitCount;
    pipeHigh = pH * unitCount;

    if (unitCount >= 2) {
      const key = Math.min(unitCount, 4) as 2|3|4;
      const [msL, msH] = multiSplitUplift[key] ?? multiSplitUplift[4];
      pipeLow  += msL;
      pipeHigh += msH;
    }

    estimatedDuration = unitCount === 1 ? '1 day' : unitCount <= 2 ? '1–2 days' : '2–3 days';
    inclusions = [
      'F-Gas certified installation',
      'Electrical connection & commissioning',
      'Full system test & customer handover',
      'Packaging removal & disposal',
      '1-year workmanship guarantee',
      ...(brandTier === 'premium' ? ['Manufacturer extended warranty registration'] : []),
    ];

  } else if (isService) {
    const svcType = req.serviceJobType ?? 'annual';
    const [sL, sH] = svcCosts[svcType] ?? svcCosts['annual'];
    labLow = sL; labHigh = sH;
    estimatedDuration = svcType === 'strip' ? '3–4 hours' : '2–3 hours';
    inclusions = [
      'Full system inspection',
      'Filter clean & condition check',
      'Refrigerant pressure & level check',
      'Electrical safety check',
      'Performance efficiency test',
      'Written service report',
    ];

  } else {
    // Emergency
    calloutLow = 120; calloutHigh = 200;
    estimatedDuration = '1–3 hours (same or next day)';
    inclusions = [
      'F-Gas certified engineer dispatch',
      'Call-out fee includes first hour\'s labour',
      'Full diagnosis & fault report',
      'Parts quoted separately on-site',
    ];
  }

  const totalLow  = Math.round((unitLow + labLow  + pipeLow  + calloutLow)  * 1.2);
  const totalHigh = Math.round((unitHigh + labHigh + pipeHigh + calloutHigh) * 1.2);

  return {
    id: nextQuoteId++,
    jobType: req.jobType,
    propertyType: req.propertyType,
    roomSizeM2: req.roomSizeM2,
    recommendedBtu: btu,
    unitCount,
    brandTier,
    unitCostLow:     unitLow,
    unitCostHigh:    unitHigh,
    labourCostLow:   labLow,
    labourCostHigh:  labHigh,
    pipeworkCostLow: pipeLow,
    pipeworkCostHigh: pipeHigh,
    calloutFeeLow:   calloutLow,
    calloutFeeHigh:  calloutHigh,
    totalLow,
    totalHigh,
    estimatedDuration,
    inclusions,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
}

const SAVED_QUOTES: Record<number, QuoteResult> = {};

export function saveMockQuote(req: CreateQuoteRequest): QuoteResult {
  const q = computeMockQuote(req);
  SAVED_QUOTES[q.id] = q;
  return q;
}

export function getMockQuoteById(id: number): QuoteResult | null {
  return SAVED_QUOTES[id] ?? null;
}

// ─── Booking ──────────────────────────────────────────────────────────────────

let nextBookingId = 3001;

const SAVED_BOOKINGS: Record<number, BookingResult> = {};

export function createMockBooking(req: CreateBookingRequest): BookingResult {
  const engineer = req.engineerId
    ? MOCK_ENGINEERS.find(e => e.id === req.engineerId) ?? null
    : null;

  const b: BookingResult = {
    id: nextBookingId++,
    quoteId: req.quoteId,
    engineerId: engineer?.id ?? null,
    engineerName: engineer?.fullName ?? null,
    customerName: req.customerName,
    customerEmail: req.customerEmail,
    address: req.address,
    postcode: req.postcode,
    preferredDate: req.preferredDate,
    status: 'pending',
    notes: req.notes ?? null,
    createdAt: new Date().toISOString(),
  };

  SAVED_BOOKINGS[b.id] = b;
  return b;
}

export function getMockBookingById(id: number): BookingResult | null {
  return SAVED_BOOKINGS[id] ?? null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getBtu(m2: number): string {
  if (m2 <= 15) return '7,000 BTU';
  if (m2 <= 25) return '9,000 BTU';
  if (m2 <= 40) return '12,000 BTU';
  if (m2 <= 55) return '18,000 BTU';
  return '24,000 BTU';
}
