import { Candidate, CompanyDemand, DffemsApiRecord } from '../types';

export interface DffemsConfig {
  baseUrl: string;
  agencyCode: string;
  apiKey: string;
  environment: 'MOCK_SANDBOX' | 'PRODUCTION_GATEWAY';
}

export const DEFAULT_DFFEMS_CONFIG: DffemsConfig = {
  baseUrl: 'https://api.dffems.gov.np/v2/agency-gateway',
  agencyCode: 'AGN-1290-NEP',
  apiKey: 'df_live_sec_7891234900192',
  environment: 'MOCK_SANDBOX',
};

class DffemsApiService {
  private config: DffemsConfig = { ...DEFAULT_DFFEMS_CONFIG };
  private logs: DffemsApiRecord[] = [];
  private listeners: Array<(log: DffemsApiRecord) => void> = [];

  public setConfig(newConfig: Partial<DffemsConfig>) {
    this.config = { ...this.config, ...newConfig };
  }

  public getConfig(): DffemsConfig {
    return { ...this.config };
  }

  public getLogs(): DffemsApiRecord[] {
    return [...this.logs];
  }

  public onLog(cb: (log: DffemsApiRecord) => void) {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }

  private recordLog(record: Omit<DffemsApiRecord, 'id' | 'timestamp'>): DffemsApiRecord {
    const log: DffemsApiRecord = {
      id: `DF-LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      ...record,
    };
    this.logs.unshift(log);
    this.listeners.forEach((cb) => cb(log));
    return log;
  }

  /**
   * Generic success response factory as instructed:
   * "for now for each success response do as generic."
   */
  private makeGenericResponse(endpoint: string, actionName: string, customData?: any) {
    return {
      status: 'GENERIC_SUCCESS',
      statusCode: 200,
      system: 'DFFEMS_CENTRAL_GATEWAY',
      agencyCode: this.config.agencyCode,
      action: actionName,
      referenceTrackingNumber: `DFFEMS-${Math.floor(100000 + Math.random() * 900000)}/082`,
      acknowledgedAt: new Date().toISOString(),
      genericMessage: `Request to ${endpoint} successfully acknowledged and queued by DFFEMS system.`,
      payload: customData || null,
    };
  }

  // 1. Pre-permission submission
  async submitPrePermission(lot: CompanyDemand) {
    const endpoint = '/pre-permission/submit';
    const requestPayload = {
      agencyLicenseNo: this.config.agencyCode,
      lotNumber: lot.lotNumber,
      companyName: lot.companyName,
      country: lot.country,
      quotaRequested: lot.quotaRequested,
      basicSalary: lot.salary,
      currency: lot.currency,
      category: lot.category,
      jobTitle: lot.title,
      contractYears: lot.contractPeriodYears,
      documentsEnclosed: ['Demand_Letter.pdf', 'Power_Of_Attorney.pdf', 'Agency_Guarantee.pdf'],
    };

    const responseData = this.makeGenericResponse(endpoint, 'PRE_PERMISSION_SUBMISSION', {
      prePermissionNumber: `DFFEMS-PP-${Math.floor(10000 + Math.random() * 90000)}/082`,
      allottedQuota: lot.quotaRequested,
      validityDays: 180,
    });

    this.recordLog({
      endpoint: `${this.config.baseUrl}${endpoint}`,
      method: 'POST',
      requestPayload,
      responseStatus: 200,
      responseData,
      acknowledged: true,
    });

    return responseData;
  }

  // 2. Submit Newspaper Ad & Interview Venue
  async submitNewspaperAndVenue(lot: CompanyDemand) {
    const endpoint = `/lots/${lot.lotNumber}/publish-details`;
    const requestPayload = {
      lotNumber: lot.lotNumber,
      newspaperDetails: lot.newspaperAd,
      venueDetails: lot.interviewVenue,
      publishedDate: lot.newspaperAd?.publicationDate,
      venueAddress: lot.interviewVenue?.streetAddress,
    };

    const responseData = this.makeGenericResponse(endpoint, 'NEWSPAPER_VENUE_REGISTRATION', {
      publicationApproved: true,
      dffemsPublicNoticeId: `DF-PUB-${Math.floor(100000 + Math.random() * 900000)}`,
    });

    this.recordLog({
      endpoint: `${this.config.baseUrl}${endpoint}`,
      method: 'POST',
      requestPayload,
      responseStatus: 200,
      responseData,
      acknowledged: true,
    });

    return responseData;
  }

  // 3. User Creation in DFFEMS if not created
  async ensureUsersCreated(candidates: Candidate[]) {
    const uncreated = candidates.filter((c) => !c.dffemsUserCreated);
    const endpoint = '/users/bulk-register';
    const requestPayload = {
      totalCandidates: uncreated.length,
      users: uncreated.map((c) => ({
        passportNumber: c.passport.passportNumber,
        citizenshipNumber: c.passport.citizenshipNumber,
        nationalIdNumber: c.passport.nationalIdNumber,
        fullName: c.passport.fullName,
        dob: c.passport.dob,
        gender: c.passport.gender,
        district: c.passport.district,
      })),
    };

    const createdList = uncreated.map((c) => ({
      passportNumber: c.passport.passportNumber,
      dffemsUserId: `DF-USR-${Math.floor(100000 + Math.random() * 900000)}`,
      registeredStatus: 'ACTIVE',
    }));

    const responseData = this.makeGenericResponse(endpoint, 'BULK_USER_CREATION', {
      createdCount: uncreated.length,
      results: createdList,
    });

    this.recordLog({
      endpoint: `${this.config.baseUrl}${endpoint}`,
      method: 'POST',
      requestPayload,
      responseStatus: 200,
      responseData,
      acknowledged: true,
    });

    return { responseData, createdList };
  }

  // 4. Submit Interview List to DFFEMS
  async submitInterviewList(lot: CompanyDemand, candidates: Candidate[]) {
    const endpoint = `/lots/${lot.lotNumber}/interview-entries`;
    const requestPayload = {
      lotNumber: lot.lotNumber,
      companyName: lot.companyName,
      entryDate: new Date().toISOString().slice(0, 10),
      candidates: candidates.map((c) => ({
        passportNumber: c.passport.passportNumber,
        fullName: c.passport.fullName,
        trade: c.trade,
        interviewStatus: c.interviewStatus,
        interviewScore: c.interviewScore || 80,
      })),
    };

    const responseData = this.makeGenericResponse(endpoint, 'INTERVIEW_LIST_ENTRY', {
      lotNumber: lot.lotNumber,
      entriesRecordedToday: candidates.length,
      status: 'SYNCHRONIZED',
    });

    this.recordLog({
      endpoint: `${this.config.baseUrl}${endpoint}`,
      method: 'POST',
      requestPayload,
      responseStatus: 200,
      responseData,
      acknowledged: true,
    });

    return responseData;
  }

  // 5. Submit to Manage Candidate List
  async submitToManageCandidateList(candidate: Candidate) {
    const endpoint = '/candidates/manage-list/add';
    const requestPayload = {
      passportNumber: candidate.passport.passportNumber,
      lotId: candidate.lotId,
      vsaStatus: candidate.vsaStatus,
      advisedBy: candidate.vsaApprovedBy || 'Operations Desk',
      submissionDate: new Date().toISOString().slice(0, 10),
    };

    const responseData = this.makeGenericResponse(endpoint, 'MANAGE_CANDIDATE_ENTRY', {
      passportNumber: candidate.passport.passportNumber,
      queueNumber: Math.floor(100 + Math.random() * 900),
      manageListEntryApproved: true,
    });

    this.recordLog({
      endpoint: `${this.config.baseUrl}${endpoint}`,
      method: 'POST',
      requestPayload,
      responseStatus: 200,
      responseData,
      acknowledged: true,
    });

    return responseData;
  }

  // 6. Resubmit document
  async resubmitDocument(candidate: Candidate, docType: string) {
    const endpoint = `/candidates/${candidate.passport.passportNumber}/resubmit-document`;
    const requestPayload = {
      passportNumber: candidate.passport.passportNumber,
      documentType: docType,
      resubmissionNotes: 'High-resolution scan and verified certificate uploaded by staff.',
      timestamp: new Date().toISOString(),
    };

    const responseData = this.makeGenericResponse(endpoint, 'DOCUMENT_RESUBMISSION', {
      passportNumber: candidate.passport.passportNumber,
      reviewStatus: 'UNDER_RE_EVALUATION',
      expectedClearanceHours: 24,
    });

    this.recordLog({
      endpoint: `${this.config.baseUrl}${endpoint}`,
      method: 'POST',
      requestPayload,
      responseStatus: 200,
      responseData,
      acknowledged: true,
    });

    return responseData;
  }

  // 7. Fetch Annual Approved records
  async fetchAnnualApprovalRecords(fiscalYear: string, candidates: Candidate[]) {
    const endpoint = `/approvals/annual?fiscalYear=${encodeURIComponent(fiscalYear)}`;
    const approvedCandidates = candidates.filter(
      (c) => c.dffemsApprovalStatus === 'Approved' && (!c.approvalFiscalYear || c.approvalFiscalYear === fiscalYear)
    );

    // Filter duplicates by passport number to ensure zero duplicacy
    const seenPps = new Set<string>();
    const uniqueApproved = approvedCandidates.filter((c) => {
      if (seenPps.has(c.passport.passportNumber)) return false;
      seenPps.add(c.passport.passportNumber);
      return true;
    });

    const responseData = this.makeGenericResponse(endpoint, 'FETCH_ANNUAL_APPROVALS', {
      fiscalYear,
      totalApprovedUnique: uniqueApproved.length,
      records: uniqueApproved.map((c) => ({
        passportNumber: c.passport.passportNumber,
        fullName: c.passport.fullName,
        companyName: c.companyName,
        trade: c.trade,
        laborPermitNumber: c.laborPermitNumber || `LP-${Math.floor(100000 + Math.random() * 900000)}`,
        approvedDate: c.dffemsApprovalDate || '2026-10-26',
      })),
    });

    this.recordLog({
      endpoint: `${this.config.baseUrl}${endpoint}`,
      method: 'GET',
      requestPayload: { fiscalYear },
      responseStatus: 200,
      responseData,
      acknowledged: true,
    });

    return { responseData, uniqueApproved };
  }
}

export const dffemsApi = new DffemsApiService();
