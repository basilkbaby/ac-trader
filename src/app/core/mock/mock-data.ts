import { Engineer, EngineerDetail, QuoteResult, BookingResult, CreateQuoteRequest, CreateBookingRequest, AuthUser, JobRequest, Invoice, InvoiceItem, SavedQuote, Client, CustomerBooking, CustomerServicePlan, CustomerAcSystem, CustomerProfile, UpdateCustomerProfileRequest, PortfolioGroup } from '../models/models';

// ─── Toggle ──────────────────────────────────────────────────────────────────
// true  = run entirely on in-memory mock data (offline demo)
// false = call the real ASP.NET Core API (environment.apiUrl)
export const USE_MOCK = true;

// ─── Engineers ───────────────────────────────────────────────────────────────

export const MOCK_ENGINEERS: Engineer[] = [
  {
    id: 1,
    fullName: 'Tinto Thomas',
    companyName: 'Quality Tech Engineering Limited',
    coveragePostcode: 'CM17, CM18, CM19, CM20',
    latitude: 51.7671,
    longitude: 0.1026,
    averageRating: 4.9,
    jobsCompleted: 264,
    isAvailable: true,
    isVerified: true,
    fGasCertNumber: 'FGC-2016-33107',
    specialisms: 'Installation, Multi-split systems, Commercial, HVAC Maintenance, AHU Cleaning, Facilities Engineering',
    profileImageUrl: null,
    hourlyRate: 78,
    hasPublicLiability: true,
    hasDbsCheck: true,
    responseRatePercent: 98,
    avgResponseHours: 1,
    brandsSupported: 'Fujitsu, Daikin, Mitsubishi Electric, Toshiba',
    memberSince: '2016-06-01',
  },
  {
    id: 2,
    fullName: 'Nitin Sunil',
    companyName: 'Blue Peak Cooling',
    coveragePostcode: 'RM11, RM12, RM3, RM14',
    latitude: 51.5540,
    longitude: 0.2190,
    averageRating: 4.7,
    jobsCompleted: 96,
    isAvailable: true,
    isVerified: true,
    fGasCertNumber: 'FGC-2019-48822',
    specialisms: 'Installation, Residential, Commercial, Service / maintenance, Multi-split systems',
    profileImageUrl: null,
    hourlyRate: 68,
    hasPublicLiability: true,
    hasDbsCheck: false,
    responseRatePercent: 95,
    avgResponseHours: 2,
    brandsSupported: 'Daikin, Samsung, LG',
    memberSince: '2019-03-01',
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
    email: 'tinto@qualitytecheng.co.uk',
    phone: '07521 244986',
    bio: "Quality Tech Engineering Limited install and maintain air conditioning systems across Essex and East London. We specialise in Fujitsu multi-split systems, HVAC maintenance, AHU cleaning and facilities engineering for commercial and residential clients. Every job comes with a full written quotation and handover report.",
    createdAt: '2016-06-01T09:00:00Z',
    companyAddress: 'Unit 4, Edinburgh Avenue\nHarlow\nEssex\nCM20 2DP',
    companyRegNumber: '11223344',
    vatNumber: null,
    companyLogoUrl: 'https://eventmanagementimages.blob.core.windows.net/coolhq/engineers/qualitytech.jpg',
    ratingBreakdown: { professionalism: 5.0, punctuality: 4.9, quality: 4.9, value: 4.8 },
    reviews: [
      {
        id: 101,
        rating: 5,
        comment: "Tinto and the team installed a Fujitsu multi-split system across our house. Arrived exactly on time, covered the floors, ran the pipes neatly through the cavity wall and left everything spotless. Cold in 30 minutes, couldn't be happier.",
        customerName: 'Fiona H.',
        isVerified: true,
        createdAt: '2024-11-14T14:22:00Z',
        jobType: 'Installation'
      },
      {
        id: 102,
        rating: 5,
        comment: "Annual service done quickly and professionally. Quality Tech found a small refrigerant leak we had no idea about - caught it early and fixed it on the same visit. Brilliant.",
        customerName: 'Richard T.',
        isVerified: true,
        createdAt: '2024-09-03T10:15:00Z',
        jobType: 'Service / maintenance'
      },
      {
        id: 103,
        rating: 5,
        comment: "Emergency call on a Saturday - unit stopped working in the heat wave. Tinto was there within 2 hours. Diagnosed a faulty capacitor, had the part in the van, fixed it within the hour. Absolute legend.",
        customerName: 'Olga M.',
        isVerified: true,
        createdAt: '2024-07-19T16:50:00Z',
        jobType: 'Emergency repair'
      },
      {
        id: 104,
        rating: 4,
        comment: "Great work replacing our old unit. Took a bit longer than expected but the finish was excellent and everything was explained clearly.",
        customerName: 'Ben K.',
        isVerified: true,
        createdAt: '2024-05-08T11:00:00Z',
        jobType: 'Replacement'
      },
    ]
  },
  2: {
    ...MOCK_ENGINEERS[1],
    email: 'nitin@bluepeakcooling.co.uk',
    phone: '07700 900 321',
    bio: "Blue Peak Cooling provides residential and commercial air conditioning installation and servicing across Hornchurch, Romford and the surrounding areas. We're known for reliable, tidy installations and honest advice - I'll always tell you whether a repair or replacement makes more financial sense. No upselling, just good advice.",
    createdAt: '2019-03-01T09:00:00Z',
    companyAddress: '12 High Street\nHornchurch\nEssex\nRM12 1SS',
    companyRegNumber: null,
    vatNumber: null,
    companyLogoUrl: 'https://eventmanagementimages.blob.core.windows.net/coolhq/engineers/bluepeak.jpg',
    ratingBreakdown: { professionalism: 4.9, punctuality: 4.7, quality: 4.9, value: 4.8 },
    reviews: [
      {
        id: 201,
        rating: 5,
        comment: "Nitin serviced our three-year-old Daikin and found the drain line was partially blocked. Cleared it, cleaned the filters, and the system is running noticeably quieter. Very thorough.",
        customerName: 'Alexei P.',
        isVerified: true,
        createdAt: '2024-10-22T13:30:00Z',
        jobType: 'Service / maintenance'
      },
      {
        id: 202,
        rating: 5,
        comment: "Installed a Samsung unit in our home office. Nitin was on time, respectful of the space, and the pipework is hidden beautifully. Recommended to two neighbours already.",
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

// ─── Portfolio groups (previous work stories) ────────────────────────────────

export const MOCK_PORTFOLIO_GROUPS: PortfolioGroup[] = [
  {
    id: 1, engineerId: 1, title: 'Installations',
    coverColor: '#1e3a5f', coverAccent: '#3b82f6',
    images: [
      { id: 101, caption: 'Fujitsu 3-head multi-split install, Harlow townhouse', jobType: 'Installation', color: '#1e3a5f', accentColor: '#3b82f6', postedAt: '2025-04-12' },
      { id: 102, caption: 'Daikin wall unit - master bedroom, Bishop\'s Stortford', jobType: 'Installation', color: '#1d4ed8', accentColor: '#60a5fa', postedAt: '2025-03-28' },
      { id: 103, caption: 'Mitsubishi ceiling cassette, open-plan living space', jobType: 'Installation', color: '#0f172a', accentColor: '#818cf8', postedAt: '2025-02-14' },
      { id: 104, caption: 'LG dual-zone installation, period conversion flat', jobType: 'Installation', color: '#172554', accentColor: '#93c5fd', postedAt: '2025-01-09' },
    ]
  },
  {
    id: 2, engineerId: 1, title: 'Service & Repair',
    coverColor: '#064e3b', coverAccent: '#10b981',
    images: [
      { id: 201, caption: 'Annual service + full gas recharge completed', jobType: 'Service', color: '#064e3b', accentColor: '#10b981', postedAt: '2025-05-02' },
      { id: 202, caption: 'Refrigerant leak traced and repaired, Old Harlow', jobType: 'Repair', color: '#065f46', accentColor: '#34d399', postedAt: '2025-04-18' },
      { id: 203, caption: 'PCB board replacement - same-day turnaround', jobType: 'Repair', color: '#047857', accentColor: '#6ee7b7', postedAt: '2025-03-05' },
    ]
  },
  {
    id: 3, engineerId: 1, title: 'Commercial',
    coverColor: '#4c1d95', coverAccent: '#a78bfa',
    images: [
      { id: 301, caption: '6-zone VRF system, Harlow office building', jobType: 'Commercial', color: '#4c1d95', accentColor: '#a78bfa', postedAt: '2025-05-10' },
      { id: 302, caption: 'Retail unit - 2 ceiling cassettes installed overnight', jobType: 'Commercial', color: '#5b21b6', accentColor: '#c4b5fd', postedAt: '2025-04-01' },
      { id: 303, caption: 'Restaurant kitchen extract + cool air system', jobType: 'Commercial', color: '#6d28d9', accentColor: '#ddd6fe', postedAt: '2025-02-20' },
    ]
  },

  // Nitin Sunil / Blue Peak Cooling (engineer id 2)
  {
    id: 4, engineerId: 2, title: 'Installations',
    coverColor: '#0c4a6e', coverAccent: '#38bdf8',
    images: [
      { id: 401, caption: 'LG dual-zone install, Hornchurch extension', jobType: 'Installation', color: '#0c4a6e', accentColor: '#38bdf8', postedAt: '2025-05-16' },
      { id: 402, caption: 'Daikin multi-split, Hornchurch semi-detached', jobType: 'Installation', color: '#075985', accentColor: '#7dd3fc', postedAt: '2025-04-02' },
      { id: 403, caption: 'Samsung wall unit - home office, Emerson Park', jobType: 'Installation', color: '#0e7490', accentColor: '#67e8f9', postedAt: '2025-02-27' },
    ]
  },
  {
    id: 5, engineerId: 2, title: 'Service & Repair',
    coverColor: '#78350f', coverAccent: '#f59e0b',
    images: [
      { id: 501, caption: 'Annual service + filter clean, Upminster Road', jobType: 'Service', color: '#78350f', accentColor: '#f59e0b', postedAt: '2025-05-06' },
      { id: 502, caption: 'Breaker fault traced and fixed, Station Lane', jobType: 'Repair', color: '#92400e', accentColor: '#fbbf24', postedAt: '2025-05-24' },
    ]
  },
];

// ─── Demo auth accounts ───────────────────────────────────────────────────────

export const DEMO_ACCOUNTS: Record<string, { password: string; user: AuthUser }> = {
  'engineer@demo.com': {
    password: 'demo',
    user: { id: 1, email: 'engineer@demo.com', fullName: 'Tinto Thomas', role: 'engineer', engineerId: 1, avatarInitials: 'TT' }
  },
  'nitin@demo.com': {
    password: 'demo',
    user: { id: 2, email: 'nitin@demo.com', fullName: 'Nitin Sunil', role: 'engineer', engineerId: 2, avatarInitials: 'NS' }
  },
  'customer@demo.com': {
    password: 'demo',
    user: { id: 101, email: 'customer@demo.com', fullName: 'Alex Thompson', role: 'customer', avatarInitials: 'AT' }
  },
};

// ─── Engineer job requests (demo engineer id 1) ───────────────────────────────

let _jobRequests: JobRequest[] = [
  { id: 5001, engineerId: 1, bookingRef: '#ACT-5001', customerName: 'Sophie Walker', customerPhone: '07700 902 111', address: '14 Eaton Square, London', postcode: 'SW1W 9BE', jobType: 'Installation', propertyType: 'flat', roomSizeM2: 28, preferredDate: '2026-06-10', notes: 'Fourth floor flat, lift available.', quoteRange: '£1,440 – £2,520', status: 'pending', createdAt: '2026-05-24T09:15:00Z' },
  { id: 5002, engineerId: 1, bookingRef: '#ACT-5002', customerName: 'Gareth Evans', customerPhone: '07700 902 222', address: '87 Chelsea Embankment, London', postcode: 'SW3 4LW', jobType: 'Replacement', propertyType: 'terr', roomSizeM2: 35, preferredDate: '2026-06-12', notes: 'Existing Mitsubishi from 2014. Happy to go Daikin.', quoteRange: '£1,320 – £2,280', status: 'pending', createdAt: '2026-05-25T14:30:00Z' },
  { id: 5003, engineerId: 1, bookingRef: '#ACT-5003', customerName: 'Nina Patel', customerPhone: '07700 902 333', address: '22 Sloane Gardens, London', postcode: 'SW1W 8DP', jobType: 'Service / maintenance', propertyType: 'flat', roomSizeM2: 20, preferredDate: '2026-06-08', notes: null, quoteRange: '£96 – £144', status: 'accepted', createdAt: '2026-05-20T11:00:00Z' },
  { id: 5004, engineerId: 1, bookingRef: '#ACT-5004', customerName: 'Thomas Hardy', customerPhone: '07700 902 444', address: '5 Cadogan Square, London', postcode: 'SW1X 0HT', jobType: 'Emergency repair', propertyType: 'semi', roomSizeM2: 40, preferredDate: '2026-05-23', notes: 'Unit making loud grinding noise and not cooling properly.', quoteRange: '£144 – £264', status: 'active', createdAt: '2026-05-22T16:45:00Z' },
  { id: 5005, engineerId: 1, bookingRef: '#ACT-5005', customerName: 'Fiona Harrison', customerPhone: '07700 902 555', address: "38 King's Road, London", postcode: 'SW3 5UR', jobType: 'Installation', propertyType: 'terr', roomSizeM2: 25, preferredDate: '2026-05-15', notes: 'New build kitchen extension.', quoteRange: '£1,284 – £2,220', status: 'completed', createdAt: '2026-05-10T08:30:00Z' },
  { id: 5006, engineerId: 1, bookingRef: '#ACT-5006', customerName: 'Marco Rossi', customerPhone: '07700 902 666', address: '11 Pont Street, London', postcode: 'SW1X 9EH', jobType: 'Service / maintenance', propertyType: 'flat', roomSizeM2: 30, preferredDate: '2026-05-08', notes: null, quoteRange: '£96 – £144', status: 'completed', createdAt: '2026-05-04T10:00:00Z' },

  // Nitin Sunil / Blue Peak Cooling (engineer id 2) — Hornchurch / Romford
  { id: 5101, engineerId: 2, bookingRef: '#ACT-5101', customerName: 'Sanjay Kapoor', customerPhone: '07700 903 111', address: '9 Hylands Road, Hornchurch', postcode: 'RM11 2SL', jobType: 'Installation', propertyType: 'semi', roomSizeM2: 26, preferredDate: '2026-06-14', notes: 'Wants a Daikin multi-split, 2 rooms.', quoteRange: '£1,980 – £3,120', status: 'pending', createdAt: '2026-05-26T09:40:00Z' },
  { id: 5102, engineerId: 2, bookingRef: '#ACT-5102', customerName: 'Louise Baxter', customerPhone: '07700 903 222', address: '46 Butts Green Road, Hornchurch', postcode: 'RM11 2JT', jobType: 'Service / maintenance', propertyType: 'detached', roomSizeM2: 32, preferredDate: '2026-06-09', notes: null, quoteRange: '£96 – £144', status: 'accepted', createdAt: '2026-05-21T13:10:00Z' },
  { id: 5103, engineerId: 2, bookingRef: '#ACT-5103', customerName: 'Robert Kelly', customerPhone: '07700 903 333', address: '3 Station Lane, Hornchurch', postcode: 'RM12 6JL', jobType: 'Emergency repair', propertyType: 'flat', roomSizeM2: 22, preferredDate: '2026-05-24', notes: 'Samsung unit tripping the breaker.', quoteRange: '£144 – £264', status: 'active', createdAt: '2026-05-23T15:20:00Z' },
  { id: 5104, engineerId: 2, bookingRef: '#ACT-5104', customerName: 'Priya Chandra', customerPhone: '07700 903 444', address: '21 Wingletye Lane, Hornchurch', postcode: 'RM11 3AY', jobType: 'Installation', propertyType: 'detached', roomSizeM2: 40, preferredDate: '2026-05-16', notes: 'New extension, wants LG throughout.', quoteRange: '£2,340 – £3,780', status: 'completed', createdAt: '2026-05-11T09:00:00Z' },
  { id: 5105, engineerId: 2, bookingRef: '#ACT-5105', customerName: 'Colin Marsh', customerPhone: '07700 903 555', address: '58 Upminster Road, Hornchurch', postcode: 'RM12 4AA', jobType: 'Service / maintenance', propertyType: 'semi', roomSizeM2: 24, preferredDate: '2026-05-06', notes: null, quoteRange: '£96 – £144', status: 'completed', createdAt: '2026-05-02T11:30:00Z' },
];

export function getMockJobRequests(engineerId: number): JobRequest[] {
  return _jobRequests.filter(j => j.engineerId === engineerId);
}

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

  // Nitin Sunil / Blue Peak Cooling (engineer id 2)
  {
    id: 7101, invoiceNumber: 'INV-2001', engineerId: 2,
    customerName: 'Priya Chandra', customerEmail: 'priya.chandra@email.com', jobRef: '#ACT-5104',
    items: [
      { description: 'LG dual-zone system - supply & installation', quantity: 1, unitPrice: 2650 },
      { description: 'Pipework & fittings (8m run)', quantity: 1, unitPrice: 260 },
      { description: 'Commissioning & test', quantity: 1, unitPrice: 90 },
    ],
    subtotal: 3000, vatAmount: 0, total: 3000,
    status: 'paid', issuedAt: '2026-05-16T16:00:00Z', dueAt: '2026-05-30T16:00:00Z', notes: 'Thank you for your business.',
  },
  {
    id: 7102, invoiceNumber: 'INV-2002', engineerId: 2,
    customerName: 'Colin Marsh', customerEmail: 'colin.marsh@email.com', jobRef: '#ACT-5105',
    items: [
      { description: 'Annual AC service - Daikin FTXF25D', quantity: 1, unitPrice: 100 },
      { description: 'Filter replacement (set of 2)', quantity: 1, unitPrice: 16 },
    ],
    subtotal: 116, vatAmount: 0, total: 116,
    status: 'paid', issuedAt: '2026-05-06T15:30:00Z', dueAt: '2026-05-20T15:30:00Z', notes: null,
  },
  {
    id: 7103, invoiceNumber: 'INV-2003', engineerId: 2,
    customerName: 'Robert Kelly', customerEmail: 'robert.kelly@email.com', jobRef: '#ACT-5103',
    items: [
      { description: 'Emergency call-out fee', quantity: 1, unitPrice: 110 },
      { description: 'Breaker/RCD diagnostic & fault fix', quantity: 1, unitPrice: 70 },
    ],
    subtotal: 180, vatAmount: 0, total: 180,
    status: 'sent', issuedAt: '2026-05-24T17:45:00Z', dueAt: '2026-06-07T17:45:00Z', notes: 'Payment due within 14 days. Bank transfer preferred.',
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

// ─── Engineer saved quotations ────────────────────────────────────────────────

const _DEF_EXCL = [
  'Any unforeseen site-specific requirements',
  'Structural or building works',
  'Decorative making good (plastering / painting)',
  'Electrical supply upgrades beyond those stated above',
].join('\n');
const _DEF_NOTES = [
  'All works will be carried out in accordance with current UK regulations and industry standards.',
  'Installation date to be agreed upon acceptance of this quotation.',
  "Manufacturer's warranty applies to all supplied equipment.",
  'This quotation is valid for 30 days from the date above.',
].join('\n');

let nextSavedQuoteId = 8004;

let _savedQuotes: SavedQuote[] = [
  {
    id: 8001, engineerId: 1, ref: 'QTE-412/2026', createdAt: '2026-06-28T10:00:00Z', status: 'sent',
    customerName: 'Sophie Walker', customerEmail: 'sophie.walker@email.com',
    customerAddress: '14 Eaton Square\nLondon SW1W 9BE',
    title: 'Quotation – Supply & Installation of Air Conditioning System',
    summary: 'New installation · 1 unit · mid-range · flat', recommendedBtu: '12,000 BTU', estimatedDuration: '1 day',
    scopeText: [
      'Supply and installation of mid-range single-split air conditioning system',
      'Installation of 1 indoor wall-mounted unit',
      'Installation of outdoor condenser unit mounted on external wall brackets',
      'Installation of refrigerant pipework with insulation (lagging)',
      'Full system testing, commissioning and client handover',
    ].join('\n'),
    exclusionsText: _DEF_EXCL, notesText: _DEF_NOTES,
    equipment: [
      { qty: 1, model: '', description: 'Outdoor condenser unit' },
      { qty: 1, model: '', description: 'Wall-mounted indoor unit - 12,000 BTU' },
    ],
    items: [
      { description: 'Mid-range wall-mounted AC unit - 12,000 BTU (medium room)', quantity: 1, unitPrice: 875 },
      { description: 'Installation labour, mounting & bracketry', quantity: 1, unitPrice: 300 },
      { description: 'Pipework, cabling & fittings', quantity: 1, unitPrice: 140 },
      { description: 'Commissioning, F-Gas sign-off & handover', quantity: 1, unitPrice: 80 },
      { description: 'Waste removal & consumables', quantity: 1, unitPrice: 45 },
    ],
    addWorks: false, addWorksDesc: '', addWorksCost: 0, vat: false,
    subtotal: 1440, vatAmount: 0, total: 1440,
  },
  {
    id: 8002, engineerId: 1, ref: 'QTE-408/2026', createdAt: '2026-06-24T14:30:00Z', status: 'accepted',
    customerName: 'Gareth Evans', customerEmail: 'gareth.evans@email.com',
    customerAddress: '87 Chelsea Embankment\nLondon SW3 4LW',
    title: 'Quotation – Supply & Installation of Air Conditioning System',
    summary: 'New installation · 3 units · premium · terraced house', recommendedBtu: '24,000 BTU', estimatedDuration: '2–3 days',
    scopeText: [
      'Supply and installation of premium multi-split air conditioning system',
      'Installation of 3 indoor wall-mounted units',
      'Installation of 1 outdoor condenser unit mounted on external wall brackets',
      'Installation of refrigerant pipework with insulation (lagging)',
      'Installation of condensate drainage system',
      'Electrical interconnection between indoor and outdoor units',
      'Installation of trunking to ensure a neat and professional finish',
      'Full system testing, commissioning and client handover',
    ].join('\n'),
    exclusionsText: _DEF_EXCL, notesText: _DEF_NOTES,
    equipment: [
      { qty: 1, model: 'AOEG36KBTA5', description: 'Multi-split outdoor condenser (3:1)' },
      { qty: 3, model: '', description: 'Wall-mounted indoor unit - 24,000 BTU' },
    ],
    items: [
      { description: 'Premium wall-mounted AC unit - 24,000 BTU (large room)', quantity: 3, unitPrice: 1700 },
      { description: 'Multi-split outdoor condenser (3 zones)', quantity: 1, unitPrice: 650 },
      { description: 'Installation labour, mounting & bracketry', quantity: 1, unitPrice: 700 },
      { description: 'Pipework, cabling & fittings', quantity: 3, unitPrice: 150 },
      { description: 'Commissioning, F-Gas sign-off & handover', quantity: 1, unitPrice: 80 },
      { description: 'Waste removal & consumables', quantity: 1, unitPrice: 45 },
    ],
    addWorks: true, addWorksDesc: 'Provision of a new power supply from the distribution board to the outdoor unit, including 32A RCBO, 32A isolator, containment, conduits and associated cabling.', addWorksCost: 150, vat: false,
    subtotal: 7025, vatAmount: 0, total: 7175,
  },
  {
    id: 8003, engineerId: 1, ref: 'QTE-401/2026', createdAt: '2026-06-19T09:15:00Z', status: 'draft',
    customerName: 'Nina Patel', customerEmail: 'nina.patel@email.com',
    customerAddress: '22 Sloane Gardens\nLondon SW1W 8DP',
    title: 'Quotation – Air Conditioning Service',
    summary: 'Service · flat', recommendedBtu: '', estimatedDuration: '2–3 hours',
    scopeText: [
      'Full service and performance check of the existing system',
      'Filter clean and condensate drainage check',
      'Refrigerant pressure and level check',
      'Electrical safety check',
      'Written service report and handover',
    ].join('\n'),
    exclusionsText: _DEF_EXCL, notesText: _DEF_NOTES,
    equipment: [],
    items: [
      { description: 'Annual service & performance check', quantity: 1, unitPrice: 105 },
      { description: 'Filters, consumables & refrigerant check', quantity: 1, unitPrice: 24 },
    ],
    addWorks: false, addWorksDesc: '', addWorksCost: 0, vat: false,
    subtotal: 129, vatAmount: 0, total: 129,
  },

  // Nitin Sunil / Blue Peak Cooling (engineer id 2)
  {
    id: 8101, engineerId: 2, ref: 'QTE-BP-114/2026', createdAt: '2026-06-27T11:20:00Z', status: 'sent',
    customerName: 'Sanjay Kapoor', customerEmail: 'sanjay.kapoor@email.com',
    customerAddress: '9 Hylands Road\nHornchurch RM11 2SL',
    title: 'Quotation – Supply & Installation of Air Conditioning System',
    summary: 'New installation · 2 units · mid-range · semi-detached', recommendedBtu: '18,000 BTU', estimatedDuration: '1–2 days',
    scopeText: [
      'Supply and installation of mid-range multi-split air conditioning system',
      'Installation of 2 indoor wall-mounted units',
      'Installation of 1 outdoor condenser unit mounted on external wall brackets',
      'Installation of refrigerant pipework with insulation (lagging)',
      'Full system testing, commissioning and client handover',
    ].join('\n'),
    exclusionsText: _DEF_EXCL, notesText: _DEF_NOTES,
    equipment: [
      { qty: 1, model: 'AOE71K2', description: 'Multi-split outdoor condenser (2:1)' },
      { qty: 2, model: '', description: 'Wall-mounted indoor unit - 9,000 BTU' },
    ],
    items: [
      { description: 'Mid-range wall-mounted AC unit - 9,000 BTU', quantity: 2, unitPrice: 780 },
      { description: 'Multi-split outdoor condenser (2 zones)', quantity: 1, unitPrice: 520 },
      { description: 'Installation labour, mounting & bracketry', quantity: 1, unitPrice: 480 },
      { description: 'Pipework, cabling & fittings', quantity: 2, unitPrice: 130 },
      { description: 'Commissioning, F-Gas sign-off & handover', quantity: 1, unitPrice: 80 },
    ],
    addWorks: false, addWorksDesc: '', addWorksCost: 0, vat: false,
    subtotal: 2790, vatAmount: 0, total: 2790,
  },
  {
    id: 8102, engineerId: 2, ref: 'QTE-BP-109/2026', createdAt: '2026-06-20T09:50:00Z', status: 'accepted',
    customerName: 'Priya Chandra', customerEmail: 'priya.chandra@email.com',
    customerAddress: '21 Wingletye Lane\nHornchurch RM11 3AY',
    title: 'Quotation – Supply & Installation of Air Conditioning System',
    summary: 'New installation · 2 units · premium · detached extension', recommendedBtu: '20,000 BTU', estimatedDuration: '2 days',
    scopeText: [
      'Supply and installation of premium dual-zone air conditioning system',
      'Installation of 2 indoor wall-mounted units',
      'Installation of 1 outdoor condenser unit mounted on external wall brackets',
      'Installation of refrigerant pipework with insulation (lagging)',
      'Installation of condensate drainage system',
      'Full system testing, commissioning and client handover',
    ].join('\n'),
    exclusionsText: _DEF_EXCL, notesText: _DEF_NOTES,
    equipment: [
      { qty: 1, model: 'MU2R17', description: 'Dual-split outdoor condenser' },
      { qty: 2, model: '', description: 'Wall-mounted indoor unit - 12,000 BTU' },
    ],
    items: [
      { description: 'Premium wall-mounted AC unit - 12,000 BTU', quantity: 2, unitPrice: 1050 },
      { description: 'Dual-split outdoor condenser', quantity: 1, unitPrice: 550 },
      { description: 'Installation labour, mounting & bracketry', quantity: 1, unitPrice: 500 },
      { description: 'Pipework, cabling & fittings', quantity: 2, unitPrice: 140 },
      { description: 'Commissioning, F-Gas sign-off & handover', quantity: 1, unitPrice: 90 },
    ],
    addWorks: false, addWorksDesc: '', addWorksCost: 0, vat: false,
    subtotal: 3520, vatAmount: 0, total: 3520,
  },
  {
    id: 8103, engineerId: 2, ref: 'QTE-BP-102/2026', createdAt: '2026-06-15T14:05:00Z', status: 'draft',
    customerName: 'Louise Baxter', customerEmail: 'louise.baxter@email.com',
    customerAddress: '46 Butts Green Road\nHornchurch RM11 2JT',
    title: 'Quotation – Air Conditioning Service',
    summary: 'Service · detached house', recommendedBtu: '', estimatedDuration: '2–3 hours',
    scopeText: [
      'Full service and performance check of the existing system',
      'Filter clean and condensate drainage check',
      'Refrigerant pressure and level check',
      'Electrical safety check',
      'Written service report and handover',
    ].join('\n'),
    exclusionsText: _DEF_EXCL, notesText: _DEF_NOTES,
    equipment: [],
    items: [
      { description: 'Annual service & performance check', quantity: 1, unitPrice: 100 },
      { description: 'Filters, consumables & refrigerant check', quantity: 1, unitPrice: 22 },
    ],
    addWorks: false, addWorksDesc: '', addWorksCost: 0, vat: false,
    subtotal: 122, vatAmount: 0, total: 122,
  },
];

export function getSavedQuotes(engineerId: number): SavedQuote[] {
  return _savedQuotes
    .filter(q => q.engineerId === engineerId)
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
}

export function getSavedQuoteById(id: number): SavedQuote | null {
  return _savedQuotes.find(q => q.id === id) ?? null;
}

export function saveEngineerQuote(q: Omit<SavedQuote, 'id'>): SavedQuote {
  const full: SavedQuote = { ...q, id: nextSavedQuoteId++ };
  _savedQuotes = [full, ..._savedQuotes];
  return full;
}

export function updateEngineerQuote(id: number, patch: Partial<SavedQuote>): void {
  _savedQuotes = _savedQuotes.map(q => q.id === id ? { ...q, ...patch } : q);
}

export function updateSavedQuoteStatus(id: number, status: SavedQuote['status']): void {
  _savedQuotes = _savedQuotes.map(q => q.id === id ? { ...q, status } : q);
}

// ─── Engineer clients (CRM) ────────────────────────────────────────────────────

let _clients: Client[] = [
  {
    id: 6001, engineerId: 1, name: 'Fiona Harrison', email: 'fiona.harrison@email.com', phone: '07700 902 555',
    address: "38 King's Road", postcode: 'SW3 5UR', since: '2024-05-10',
    jobsCount: 3, totalSpent: 4180, lastJobDate: '2026-05-15', nextServiceDue: '2026-06-10', onServicePlan: true,
    systems: [
      { brand: 'Daikin', model: 'FTXM25R', installedDate: '2024-05-15', lastServicedDate: '2025-06-10', nextServiceDue: '2026-06-10' },
    ],
    notes: 'Prefers morning appointments. Cat in the property — keep doors closed.', tags: ['Repeat', 'Service plan'],
  },
  {
    id: 6002, engineerId: 1, name: 'Marco Rossi', email: 'marco.rossi@email.com', phone: '07700 902 666',
    address: '11 Pont Street', postcode: 'SW1X 9EH', since: '2023-08-04',
    jobsCount: 4, totalSpent: 5920, lastJobDate: '2026-05-08', nextServiceDue: '2026-07-20', onServicePlan: true,
    systems: [
      { brand: 'Daikin', model: 'FTXM30R', installedDate: '2023-08-04', lastServicedDate: '2025-07-20', nextServiceDue: '2026-07-20' },
      { brand: 'Mitsubishi Electric', model: 'MSZ-AP20VG', installedDate: '2023-08-04', lastServicedDate: '2025-07-20', nextServiceDue: '2026-07-20' },
    ],
    notes: 'Restaurant — avoid lunch service 12–3pm.', tags: ['Repeat', 'Commercial', 'Service plan'],
  },
  {
    id: 6003, engineerId: 1, name: 'Sophie Walker', email: 'sophie.walker@email.com', phone: '07700 902 111',
    address: '14 Eaton Square', postcode: 'SW1W 9BE', since: '2026-06-10',
    jobsCount: 1, totalSpent: 0, lastJobDate: null, nextServiceDue: '2027-06-15', onServicePlan: false,
    systems: [
      { brand: 'Mitsubishi Electric', model: 'MSZ-AP25VG', installedDate: '2026-06-15', lastServicedDate: null, nextServiceDue: '2027-06-15' },
    ],
    notes: 'Quote QTE-412 sent, awaiting decision.', tags: ['New lead'],
  },
  {
    id: 6004, engineerId: 1, name: 'David Lin', email: 'david.lin@officeco.uk', phone: '07700 902 777',
    address: '2 Mayfair Place', postcode: 'W1J 8AA', since: '2022-03-18',
    jobsCount: 6, totalSpent: 18450, lastJobDate: '2026-04-02', nextServiceDue: '2026-10-02', onServicePlan: true,
    systems: [
      { brand: 'Daikin', model: 'VRV IV S', installedDate: '2022-03-18', lastServicedDate: '2026-04-02', nextServiceDue: '2026-10-02' },
    ],
    notes: '6-zone VRF, office building. Facilities contact: Carly (07700 902 780).', tags: ['Repeat', 'Commercial', 'Service plan'],
  },
  {
    id: 6005, engineerId: 1, name: 'Nina Patel', email: 'nina.patel@email.com', phone: '07700 902 333',
    address: '22 Sloane Gardens', postcode: 'SW1W 8DP', since: '2025-01-22',
    jobsCount: 2, totalSpent: 1360, lastJobDate: '2026-01-22', nextServiceDue: '2026-06-22', onServicePlan: false,
    systems: [
      { brand: 'Samsung', model: 'AR12', installedDate: '2025-01-22', lastServicedDate: '2025-06-22', nextServiceDue: '2026-06-22' },
    ],
    notes: 'Service overdue — chase for annual.', tags: ['Repeat'],
  },
  {
    id: 6006, engineerId: 1, name: 'Thomas Hardy', email: 'thomas.hardy@email.com', phone: '07700 902 444',
    address: '5 Cadogan Square', postcode: 'SW1X 0HT', since: '2025-05-22',
    jobsCount: 1, totalSpent: 300, lastJobDate: '2026-05-23', nextServiceDue: null, onServicePlan: false,
    systems: [
      { brand: 'LG', model: 'Standard Plus', installedDate: '2021-06-01', lastServicedDate: '2026-05-23', nextServiceDue: null },
    ],
    notes: 'Emergency repair only so far — offer a service plan.', tags: ['New lead'],
  },

  // Nitin Sunil / Blue Peak Cooling (engineer id 2)
  {
    id: 6101, engineerId: 2, name: 'Priya Chandra', email: 'priya.chandra@email.com', phone: '07700 903 444',
    address: '21 Wingletye Lane', postcode: 'RM11 3AY', since: '2026-05-11',
    jobsCount: 1, totalSpent: 3000, lastJobDate: '2026-05-16', nextServiceDue: '2027-05-16', onServicePlan: true,
    systems: [
      { brand: 'LG', model: 'Dual-zone 12,000 BTU x2', installedDate: '2026-05-16', lastServicedDate: null, nextServiceDue: '2027-05-16' },
    ],
    notes: 'New extension build — very happy with the finish.', tags: ['Repeat', 'Service plan'],
  },
  {
    id: 6102, engineerId: 2, name: 'Colin Marsh', email: 'colin.marsh@email.com', phone: '07700 903 555',
    address: '58 Upminster Road', postcode: 'RM12 4AA', since: '2024-05-06',
    jobsCount: 3, totalSpent: 2540, lastJobDate: '2026-05-06', nextServiceDue: '2027-05-06', onServicePlan: true,
    systems: [
      { brand: 'Daikin', model: 'FTXF25D', installedDate: '2024-05-06', lastServicedDate: '2026-05-06', nextServiceDue: '2027-05-06' },
    ],
    notes: 'Long-standing customer, always books the annual service on time.', tags: ['Repeat', 'Service plan'],
  },
  {
    id: 6103, engineerId: 2, name: 'Robert Kelly', email: 'robert.kelly@email.com', phone: '07700 903 333',
    address: '3 Station Lane', postcode: 'RM12 6JL', since: '2026-05-23',
    jobsCount: 1, totalSpent: 180, lastJobDate: '2026-05-24', nextServiceDue: null, onServicePlan: false,
    systems: [
      { brand: 'Samsung', model: 'AR09', installedDate: '2023-03-10', lastServicedDate: '2026-05-24', nextServiceDue: null },
    ],
    notes: 'Emergency repair (tripping breaker) — offer a service plan next visit.', tags: ['New lead'],
  },
  {
    id: 6104, engineerId: 2, name: 'Louise Baxter', email: 'louise.baxter@email.com', phone: '07700 903 222',
    address: '46 Butts Green Road', postcode: 'RM11 2JT', since: '2025-06-09',
    jobsCount: 1, totalSpent: 0, lastJobDate: null, nextServiceDue: '2026-06-09', onServicePlan: false,
    systems: [
      { brand: 'Daikin', model: 'FTXF20D', installedDate: '2022-06-09', lastServicedDate: '2025-06-09', nextServiceDue: '2026-06-09' },
    ],
    notes: 'Service quote QTE-BP-102 in draft, awaiting confirmation.', tags: ['Repeat'],
  },
  {
    id: 6105, engineerId: 2, name: 'Sanjay Kapoor', email: 'sanjay.kapoor@email.com', phone: '07700 903 111',
    address: '9 Hylands Road', postcode: 'RM11 2SL', since: '2026-05-26',
    jobsCount: 0, totalSpent: 0, lastJobDate: null, nextServiceDue: null, onServicePlan: false,
    systems: [],
    notes: 'Quote QTE-BP-114 sent, awaiting decision.', tags: ['New lead'],
  },
];

export function getClients(engineerId: number): Client[] {
  return _clients
    .filter(c => c.engineerId === engineerId)
    .sort((a, b) => (a.name).localeCompare(b.name));
}

export function getClientById(id: number): Client | null {
  return _clients.find(c => c.id === id) ?? null;
}

export function updateClientNotes(id: number, notes: string): void {
  _clients = _clients.map(c => c.id === id ? { ...c, notes } : c);
}

/** Days until a client's next service (negative = overdue, null = none scheduled). */
export function daysUntil(dateIso: string | null): number | null {
  if (!dateIso) return null;
  return Math.ceil((new Date(dateIso).getTime() - Date.now()) / 86400000);
}

// ─── Customer portal data ─────────────────────────────────────────────────────

export const MOCK_CUSTOMER_BOOKINGS: CustomerBooking[] = [
  { id: 4001, bookingRef: '#ACT-4001', jobType: 'Installation', address: '12 Maple Avenue, London', preferredDate: '2026-06-15', engineerName: 'Tinto Thomas', quoteRange: '£1,440 – £2,520', status: 'confirmed', createdAt: '2026-05-20T10:30:00Z' },
  { id: 4002, bookingRef: '#ACT-4002', jobType: 'Service / maintenance', address: '12 Maple Avenue, London', preferredDate: '2025-08-10', engineerName: 'Tinto Thomas', quoteRange: '£96 – £144', status: 'completed', createdAt: '2025-07-28T09:00:00Z' },
];

export const MOCK_CUSTOMER_PLAN: CustomerServicePlan = {
  tier: 'premium', tierName: 'Premium', startDate: '2026-01-15',
  nextServiceDate: '2027-01-15', engineerName: 'Tinto Thomas', status: 'active',
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

let mockCustomerProfile: CustomerProfile = {
  fullName: 'Alex Thompson', email: 'customer@demo.com',
  phone: '07700 900 555', address: '12 Maple Avenue, London, SW4 7AB',
};

export function getMockCustomerProfile(): CustomerProfile {
  return { ...mockCustomerProfile };
}

export function updateMockCustomerProfile(update: UpdateCustomerProfileRequest): CustomerProfile {
  mockCustomerProfile = { ...mockCustomerProfile, fullName: update.fullName, phone: update.phone, address: update.address };
  return { ...mockCustomerProfile };
}

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

// ─── Shared property / construction taxonomies ───────────────────────────────
// Used by both the Quote Builder and the Heat Load Calculator so the two tools
// speak the same language (and a heat-load result can hand off cleanly).

export const PROPERTY_TYPES: { value: string; label: string }[] = [
  { value: 'flat', label: 'Flat / apartment' },
  { value: 'terr', label: 'Terraced house' },
  { value: 'semi', label: 'Semi-detached' },
  { value: 'det',  label: 'Detached house' },
  { value: 'comm', label: 'Commercial / office' },
];

export const WALL_TYPES: { value: string; label: string; factor: number }[] = [
  { value: 'solid',     label: 'Solid wall (older, less insulated)', factor: 1.15 },
  { value: 'cavity',    label: 'Cavity wall (standard)',             factor: 1.0 },
  { value: 'insulated', label: 'Insulated / new-build',              factor: 0.9 },
  { value: 'glazed',    label: 'Glass partition / large glazing',    factor: 1.25 },
];

// ─── Engineer quote generator ─────────────────────────────────────────────────
// Produces itemised, editable line items with point prices (mid-band), using the
// same cost tables as the customer estimate so quotes stay consistent.

export interface QuoteGenParams {
  jobType: string;          // install | replace | service | emergency
  unitCount: number;
  roomSizeM2: number;
  propertyType: string;     // flat | terr | semi | det | comm
  brandTier: string;        // budget | mid | premium
  serviceJobType?: string;  // annual | strip | repair
  wallType?: string;        // solid | cavity | insulated | glazed — affects pipework/drilling cost
  recommendedBtu?: number;  // optional override from the heat-load calculator
}

export interface QuoteGenResult {
  items: InvoiceItem[];
  recommendedBtu: string;
  estimatedDuration: string;
  summary: string;
}

export function generateQuoteItems(p: QuoteGenParams): QuoteGenResult {
  const mid   = (a: number, b: number) => Math.round((a + b) / 2 / 5) * 5; // round to nearest £5
  const units = Math.max(1, Number(p.unitCount) || 1);
  const tier  = p.brandTier || 'mid';
  const isIR  = p.jobType === 'install' || p.jobType === 'replace';
  const isService = p.jobType === 'service';
  const btuNum = p.recommendedBtu && p.recommendedBtu > 0 ? p.recommendedBtu : null;
  const btu   = btuNum ? `${btuNum.toLocaleString()} BTU` : getBtu(p.roomSizeM2);

  const sizeBracket = btuNum
    ? (btuNum <= 9000 ? 'small' : btuNum <= 12000 ? 'medium' : btuNum <= 18000 ? 'large' : 'xlarge')
    : (p.roomSizeM2 <= 20 ? 'small'
      : p.roomSizeM2 <= 35 ? 'medium'
      : p.roomSizeM2 <= 60 ? 'large' : 'xlarge');

  const unitCostByTier: Record<string, Record<string, [number, number]>> = {
    budget:  { small: [350,550],  medium: [450,700],  large: [600,950],  xlarge: [800,1200]  },
    mid:     { small: [550,800],  medium: [700,1050], large: [950,1400], xlarge: [1200,1800] },
    premium: { small: [850,1200], medium: [1100,1600],large: [1400,2000],xlarge: [1800,2600] },
  };
  const multiSplitUplift: Record<number, [number, number]> = { 2:[300,500], 3:[500,800], 4:[700,1100] };
  const labourFirst: [number, number] = [220, 380];
  const labourExtra: [number, number] = [150, 250];
  const pipeByProp: Record<string, [number, number]> = {
    flat: [80,140], terr: [100,180], semi: [130,220], det: [160,260], comm: [220,380],
  };
  const svcCosts: Record<string, [number, number]> = { annual: [80,130], strip: [140,220], repair: [95,160] };

  const tierName = tier === 'budget' ? 'Budget-range' : tier === 'premium' ? 'Premium' : 'Mid-range';
  const sizeName = sizeBracket === 'small' ? 'small room' : sizeBracket === 'medium' ? 'medium room'
    : sizeBracket === 'large' ? 'large room' : 'very large space';
  const propName: Record<string, string> = { flat: 'flat', terr: 'terraced house', semi: 'semi-detached', det: 'detached house', comm: 'commercial premises' };

  const items: InvoiceItem[] = [];
  let duration = '';

  if (isIR) {
    const [uL, uH] = unitCostByTier[tier][sizeBracket];
    items.push({ description: `${tierName} wall-mounted AC unit - ${btu} (${sizeName})`, quantity: units, unitPrice: mid(uL, uH) });
    if (units >= 2) {
      const key = Math.min(units, 4) as 2 | 3 | 4;
      const [mL, mH] = multiSplitUplift[key];
      items.push({ description: `Multi-split outdoor condenser (${units} zones)`, quantity: 1, unitPrice: mid(mL, mH) });
    }
    const labL = labourFirst[0] + (units - 1) * labourExtra[0];
    const labH = labourFirst[1] + (units - 1) * labourExtra[1];
    items.push({ description: `Installation labour, mounting & bracketry`, quantity: 1, unitPrice: mid(labL, labH) });
    const [pL, pH] = pipeByProp[p.propertyType] ?? [100, 180];
    const wallType = p.wallType ?? 'cavity';
    const wallFactor = WALL_TYPES.find(w => w.value === wallType)?.factor ?? 1.0;
    const pipeDesc = wallType === 'solid'
      ? `Pipework, cabling & fittings (solid wall - additional drilling & making good)`
      : `Pipework, cabling & fittings`;
    items.push({ description: pipeDesc, quantity: units, unitPrice: Math.round(mid(pL, pH) * wallFactor / 5) * 5 });
    items.push({ description: `Commissioning, F-Gas sign-off & handover`, quantity: 1, unitPrice: 80 });
    items.push({ description: `Waste removal & consumables`, quantity: 1, unitPrice: 45 });
    duration = units === 1 ? '1 day' : units <= 2 ? '1–2 days' : '2–3 days';
  } else if (isService) {
    const svc = p.serviceJobType || 'annual';
    const [sL, sH] = svcCosts[svc] ?? svcCosts['annual'];
    const label = svc === 'strip' ? 'Deep clean & full chemical strip'
      : svc === 'repair' ? 'Non-urgent repair labour'
      : 'Annual service & performance check';
    items.push({ description: label, quantity: units, unitPrice: mid(sL, sH) });
    items.push({ description: `Filters, consumables & refrigerant check`, quantity: 1, unitPrice: 24 });
    duration = svc === 'strip' ? '3–4 hours' : '2–3 hours';
  } else {
    items.push({ description: `Emergency call-out (includes first hour on site)`, quantity: 1, unitPrice: 120 });
    items.push({ description: `Diagnostic & written fault report`, quantity: 1, unitPrice: 45 });
    duration = '1–3 hours (same/next day)';
  }

  const jobName: Record<string, string> = { install: 'New installation', replace: 'Replacement', service: 'Service', emergency: 'Emergency repair' };
  const summary = isIR
    ? `${jobName[p.jobType]} · ${units} ${units === 1 ? 'unit' : 'units'} · ${tierName.toLowerCase()} · ${propName[p.propertyType] ?? 'property'}`
    : `${jobName[p.jobType]} · ${propName[p.propertyType] ?? 'property'}`;

  return { items, recommendedBtu: btu, estimatedDuration: duration, summary };
}
