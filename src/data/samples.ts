import { SampleDocument } from '../types';

export const SAMPLE_DOCUMENTS: SampleDocument[] = [
  {
    id: 'sample-phone-contract',
    title: 'Phone Contract',
    category: 'Contracts',
    icon: '📱',
    rawText: `WIRELESS SERVICE AND EQUIPMENT AGREEMENT (SECTION 4.2 & 12.1)
    1. TERM AND RENEWAL: This agreement shall commence on the activation date and continue for a minimum term of 24 months. UNLESS CUSTOMER PROVIDES WRITTEN NOTICE OF CANCELLATION AT LEAST 60 DAYS PRIOR TO EXPIRATION, THIS AGREEMENT SHALL AUTOMATICALLY RENEW FOR SUCCESSIVE 12-MONTH PERIODS AT THE PREVAILING NON-DISCOUNTED MONTHLY RATE.
    2. EARLY TERMINATION FEES: Customer agrees that in the event of termination prior to expiration of the initial or renewal term, Customer shall pay an Early Termination Fee (ETF) calculated as $350 minus $10 for each completed month of service, plus immediate payment of all unbilled device subsidies ($450 balance).
    3. DATA SPEED REDUCTIONS AND OVERAGE: Plan includes 15GB of High-Speed Data per billing cycle. Upon reaching 15GB, service provider reserves the right to throttle data bandwidth to 128kbps or charge overage fees of $15 per 1GB without prior notification.
    4. ARBITRATION AND CLASS ACTION WAIVER: ALL DISPUTES SHALL BE RESOLVED INDIVIDUALLY THROUGH BINDING ARBITRATION. CUSTOMER EXPRESSLY WAIVES ALL RIGHTS TO INITIATE OR PARTICIPATE IN CLASS ACTION LAWSUITS.`,
    sampleAnalysis: {
      title: 'Mobile Service & Device Contract',
      category: 'Contracts',
      verdict: 'This phone contract has several high-cost penalties and automatic renewal clauses to watch out for.',
      overallRisk: 'warning',
      takeaways: [
        'Includes 15GB high-speed monthly data before speeds are throttled.',
        'Payment is due on a monthly billing cycle with net-15 day grace period.',
        'You retain ownership of the device once subsidy is fully paid off.',
      ],
      redFlags: [
        {
          id: 'rf-phone-1',
          title: 'Auto-renewal clause',
          explanation: 'The contract automatically extends for another full year unless cancelled 60 days before expiration.',
          severity: 'high',
          sourceClause: 'UNLESS CUSTOMER PROVIDES WRITTEN NOTICE OF CANCELLATION AT LEAST 60 DAYS PRIOR TO EXPIRATION, THIS AGREEMENT SHALL AUTOMATICALLY RENEW FOR SUCCESSIVE 12-MONTH PERIODS.',
        },
        {
          id: 'rf-phone-2',
          title: 'Steep Early Termination Fee',
          explanation: 'Cancelling early incurs up to $350 fee plus immediate repayment of any remaining phone device subsidy balance.',
          severity: 'high',
          sourceClause: 'Customer shall pay an Early Termination Fee (ETF) calculated as $350 minus $10 for each completed month... plus immediate payment of all unbilled device subsidies.',
        },
        {
          id: 'rf-phone-3',
          title: 'Unannounced Data Throttling',
          explanation: 'Data speeds drop significantly to 128kbps after 15GB or auto-charge $15 per additional 1GB.',
          severity: 'medium',
          sourceClause: 'Service provider reserves the right to throttle data bandwidth to 128kbps or charge overage fees of $15 per 1GB without prior notification.',
        },
      ],
    },
  },
  {
    id: 'sample-lease-agreement',
    title: 'Lease Agreement',
    category: 'Leases',
    icon: '🏠',
    rawText: `APARTMENT RESIDENTIAL LEASE AGREEMENT
    1. LEASE TERM & RENEWAL (SECTION 4.2): The lease term begins October 1, 2024 and terminates September 30, 2025. Tenant must provide 60 days written notice prior to termination. Failure to notify results in automatic month-to-month renewal with a mandatory 25% rent surcharge increase.
    2. EARLY TERMINATION PENALTY (SECTION 7.1): Tenant breaking lease early for any reason shall forfeit the entire Security Deposit ($2,500) and remain liable for an early termination penalty equivalent to two (2) months base rent ($4,800).
    3. MAINTENANCE AND INDEMNIFICATION (SECTION 11.4): Tenant agrees to indemnify, defend, and hold harmless Landlord from any liability, injury, or damage occurring on the property, including landlord negligence or building system failures. Tenant is responsible for all repairs under $350.
    4. GUEST POLICY: Guests staying more than 3 consecutive nights require prior written approval and a $50 per night guest fee.`,
    sampleAnalysis: {
      title: 'Apartment Lease Agreement',
      category: 'Leases',
      verdict: 'This lease contains standard residential terms but includes strict penalty fees and an unusually broad landlord indemnity clause.',
      overallRisk: 'high',
      takeaways: [
        'Base monthly rent of $2,400 due on the 1st of every calendar month.',
        'You can cancel at the end of term with 60 days written notice.',
        'Utilities like water and trash removal are covered by the building landlord.',
      ],
      redFlags: [
        {
          id: 'rf-lease-1',
          title: 'Auto-renewal with 25% Rent Increase',
          explanation: 'The contract will automatically renew month-to-month with a 25% higher rent rate unless you notify 60 days in advance.',
          severity: 'high',
          sourceClause: 'Failure to notify results in automatic month-to-month renewal with a mandatory 25% rent surcharge increase.',
        },
        {
          id: 'rf-lease-2',
          title: 'Broad Landlord Indemnification',
          explanation: 'You are agreeing to cover the landlord\'s legal costs and liability even if damages are caused by landlord negligence.',
          severity: 'high',
          sourceClause: 'Tenant agrees to indemnify, defend, and hold harmless Landlord from any liability... including landlord negligence.',
        },
        {
          id: 'rf-lease-3',
          title: 'Harsh Early Termination Penalty',
          explanation: 'Breaking the lease early forfeits your $2,500 security deposit plus charges 2 months base rent as a penalty.',
          severity: 'high',
          sourceClause: 'Tenant breaking lease early... shall forfeit the entire Security Deposit ($2,500) and remain liable for two (2) months base rent.',
        },
      ],
    },
  },
  {
    id: 'sample-credit-card-terms',
    title: 'Credit Card Terms',
    category: 'Financial',
    icon: '💳',
    rawText: `CREDIT CARD CARDHOLDER AGREEMENT & DISCLOSURE
    1. INTEREST RATES & APR: Variable APR for Purchases: 24.99% to 29.99%, based on creditworthiness. Penalty APR of 34.99% applies if a minimum monthly payment is late by 1 day and remains in effect indefinitely.
    2. FEES & PENALTIES: Late Payment Fee up to $41. Annual Fee of $120 billed automatically on account anniversary date. Cash Advance Fee: 5% of transaction amount (minimum $10) plus immediate 31.99% cash advance interest without grace period.
    3. CHANGE IN TERMS: Issuer reserves the right to alter APRs, credit limits, fee schedules, and rewards terms at any time by mailing notice 15 days prior to effective date. Continued card usage constitutes agreement.`,
    sampleAnalysis: {
      title: 'Credit Card Cardholder Agreement',
      category: 'Financial',
      verdict: 'High variable interest rate with steep penalty APRs and short notice for interest rate hikes.',
      overallRisk: 'warning',
      takeaways: [
        'Standard 21-day grace period on new purchases if full balance is paid on time.',
        'Zero liability protection for verified fraudulent purchases.',
        'Online account management and monthly electronic statements provided free.',
      ],
      redFlags: [
        {
          id: 'rf-cc-1',
          title: '34.99% Indefinite Penalty APR',
          explanation: 'Missing a single payment by just 1 day can permanently spike your interest rate to 34.99%.',
          severity: 'high',
          sourceClause: 'Penalty APR of 34.99% applies if a minimum monthly payment is late by 1 day and remains in effect indefinitely.',
        },
        {
          id: 'rf-cc-2',
          title: 'Unilateral Terms Modification',
          explanation: 'The bank can change interest rates and fees with only 15 days notice.',
          severity: 'medium',
          sourceClause: 'Issuer reserves the right to alter APRs, credit limits, fee schedules at any time by mailing notice 15 days prior.',
        },
      ],
    },
  },
  {
    id: 'sample-insurance-policy',
    title: 'Insurance Policy',
    category: 'Insurance',
    icon: '⚕️',
    rawText: `HEALTH INSURANCE POLICY COVERAGE & BENEFIT SCHEDULE 2024
    1. DEDUCTIBLES & OUT OF POCKET: Individual In-Network Annual Deductible: $3,500. Maximum Out-of-Pocket: $7,000. Out-of-Network services subject to separate $10,000 deductible with 50% coinsurance.
    2. PRE-AUTHORIZATION & EXCLUSIONS: Inpatient stays, outpatient surgeries, and MRI/CT diagnostic imaging require prior authorization at least 7 business days prior. Failure to obtain pre-authorization results in 100% claim denial.
    3. PRE-EXISTING CONDITIONS & WAITING PERIOD: Specialized outpatient therapy (physical, occupational) carries a 6-month mandatory waiting period from policy inception date before coverage applies.`,
    sampleAnalysis: {
      title: 'Health Insurance Policy 2024',
      category: 'Insurance',
      verdict: 'Standard healthcare coverage for preventive care, but requires strict pre-authorizations to avoid 100% bill coverage.',
      overallRisk: 'clear',
      takeaways: [
        '100% coverage for routine annual checkups and preventative care visits.',
        'In-network prescription drugs covered with flat $15 copay for generics.',
        '$3,500 individual deductible applies before major hospital coverage begins.',
      ],
      redFlags: [
        {
          id: 'rf-ins-1',
          title: 'Strict Pre-Authorization Clause',
          explanation: 'Failing to get prior insurance approval 7 days before MRIs or surgeries causes a total claim denial.',
          severity: 'medium',
          sourceClause: 'Failure to obtain pre-authorization results in 100% claim denial.',
        },
      ],
    },
  },
];
