export type DemandStatus = 
  | 'pre_permission_pending'
  | 'pre_permission_approved'
  | 'interviewing'
  | 'interview_completed'
  | 'visa_processing'
  | 'approved'
  | 'ticketed'
  | 'audited';

export interface NewspaperAd {
  newspaperName: string;
  publicationDate: string;
  pageNumber: string;
  clippingRef: string;
  isSubmittedToDffems: boolean;
  dffemsRefNumber?: string;
}

export interface InterviewVenue {
  hallName: string;
  streetAddress: string;
  city: string;
  interviewDates: string[]; // e.g. ['2026-10-28', '2026-10-29']
  timeSlots: string; // e.g. "09:00 AM - 05:00 PM"
  isSubmittedToDffems: boolean;
}

export interface CompanyDemand {
  id: string;
  companyName: string;
  country: string;
  countryFlag: string;
  lotNumber: string;
  title: string;
  category: string;
  quotaRequested: number;
  quotaApproved: number;
  salary: number;
  currency: string;
  foodAndAccommodation: string;
  contractPeriodYears: number;
  status: DemandStatus;
  prePermissionNumber?: string;
  prePermissionDate?: string;
  newspaperAd?: NewspaperAd;
  interviewVenue?: InterviewVenue;
  createdAt: string;
}

export interface CandidatePassportDetails {
  passportNumber: string; // PP
  citizenshipNumber: string; // CTZ
  nationalIdNumber: string; // ND
  surname: string;
  givenNames: string;
  fullName: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  dob: string; // YYYY-MM-DD
  nationality: string;
  placeOfBirth: string;
  issueDate: string; // YYYY-MM-DD
  expiryDate: string; // YYYY-MM-DD
  issuingAuthority: string;
  permanentAddress: string;
  district: string;
  rawMrz?: string;
}

export type OrientationStatus = 'N/A' | 'Pending' | 'Done' | 'Resubmission_Required';
export type MedicalStatus = 'N/A' | 'Pending' | 'Fit' | 'Unfit' | 'Resubmission_Required';
export type DffemsApprovalStatus = 'Pending' | 'Approved' | 'Rejected' | 'Resubmission_Required';
export type VsaStatus = 'not_started' | 'in_process' | 'approved' | 'rejected';

export interface FlightSchedule {
  flightDate?: string;
  airline?: string;
  flightNumber?: string;
  pnr?: string;
  departureAirport?: string;
  destinationAirport?: string;
  isTicketed: boolean;
  ticketIssuedDate?: string;
}

export interface CandidateAccounting {
  officeCharge: number;
  governmentFees: number;
  candidatePaid: number;
  balanceDue: number;
  paymentStatus: 'unpaid' | 'partial' | 'paid';
  lastPaymentDate?: string;
  paymentReceiptNo?: string;
  paymentMode?: 'Cash' | 'Bank Transfer' | 'ConnectIPS' | 'eSewa';
}

export interface Candidate {
  id: string;
  lotId: string;
  companyName: string;
  passport: CandidatePassportDetails;
  photoUrl: string;
  phone: string;
  email: string;
  trade: string; // e.g. "Heavy Driver", "Mason", "Electrician", "General Helper"
  experienceYears: number;
  education: string;
  skills: string[];
  
  // Intake & Docs
  cvGenerated: boolean;
  dossierMerged: boolean;
  
  // Interview Phase
  interviewStatus: 'pending' | 'interviewed' | 'selected' | 'rejected';
  interviewDate?: string;
  interviewScore?: number;
  interviewRemarks?: string;
  
  // DFFEMS System Status
  dffemsUserCreated: boolean;
  dffemsUserId?: string;
  dffemsInterviewEntryDone: boolean;
  dffemsInterviewEntryDate?: string;
  
  // Visa (VSA) & Manage Candidate List
  vsaStatus: VsaStatus;
  vsaApprovedBy?: string; // "Advised by Marketing Director Sharma"
  vsaNotes?: string;
  inManageList: boolean;
  manageListDate?: string;
  
  // Medical & Orientation
  orientationStatus: OrientationStatus;
  orientationNotes?: string;
  medicalStatus: MedicalStatus;
  medicalCenterName?: string;
  medicalReportDate?: string;
  medicalNotes?: string;
  
  // Final DFFEMS Labor Approval (Shram Swikriti)
  dffemsApprovalStatus: DffemsApprovalStatus;
  dffemsApprovalDate?: string;
  approvalFiscalYear?: string; // e.g. "2082/2083" or "2026/2027"
  laborPermitNumber?: string;
  
  // Flight & Deployment
  flightSchedule: FlightSchedule;
  
  // Internal Auditing
  accounting: CandidateAccounting;
  
  createdAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  staffName: string;
  staffRole: 'Intake Officer' | 'Operations Manager' | 'Marketing Personnel' | 'PRO Officer' | 'Accountant' | 'System Bot';
  action: string;
  targetType: 'candidate' | 'lot' | 'dffems' | 'whatsapp' | 'accounting';
  targetId: string;
  details: string;
}

export interface WhatsAppMessage {
  id: string;
  timestamp: string;
  group: 'staff_group' | 'management_group';
  sender: string;
  senderRole: string;
  avatar?: string;
  content: string;
  actionable?: {
    type: 'upload_document' | 'resubmit_pp' | 'input_flight' | 'view_otp' | 'acknowledge_excel';
    label: string;
    targetId?: string;
  };
  attachments?: {
    name: string;
    type: 'excel' | 'pdf' | 'doc';
    size: string;
  }[];
}

export interface DffemsApiRecord {
  id: string;
  timestamp: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT';
  requestPayload: any;
  responseStatus: number;
  responseData: any;
  acknowledged: boolean;
}

export interface OfficeExpense {
  id: string;
  title: string;
  lotId?: string;
  category: 'Medical Center' | 'Orientation Academy' | 'Insurance Premium' | 'Government Tax' | 'Visa Stamping' | 'Staff Travel' | 'Newspaper Ad' | 'Miscellaneous';
  amount: number;
  type: 'debit' | 'credit';
  date: string;
  invoiceNo: string;
  paidTo: string;
}

export interface LotAccountingSummary {
  lotId: string;
  companyName: string;
  fiscalMonth: string;
  totalCandidates: number;
  totalOfficeCharges: number;
  totalReceivedFromCandidates: number;
  totalExpenses: number;
  netCompanyIncome: number;
  outstandingBalance: number;
  otpVerified: boolean;
  otpCode: string;
  otpSentAt?: string;
  lastAcknowledgedWhatsApp?: string;
}
