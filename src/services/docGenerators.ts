import * as XLSX from 'xlsx';
import { Candidate, CompanyDemand } from '../types';

/**
 * Generates an Excel spreadsheet (.xlsx) for raw company candidates
 * matching DFFEMS / FEIMS government upload structure.
 */
export function generateCandidateExcel(lot: CompanyDemand, candidates: Candidate[]): void {
  const wb = XLSX.utils.book_new();

  // 1. Candidate Roster Sheet
  const rosterData = candidates.map((cand, idx) => ({
    'S.N.': idx + 1,
    'Lot Number': lot.lotNumber,
    'Company Name': lot.companyName,
    'Passport Number (PP)': cand.passport.passportNumber,
    'Full Name': cand.passport.fullName,
    'Surname': cand.passport.surname,
    'Given Names': cand.passport.givenNames,
    'Gender': cand.passport.gender,
    'Date of Birth': cand.passport.dob,
    'Citizenship No (CTZ)': cand.passport.citizenshipNumber,
    'National ID (ND)': cand.passport.nationalIdNumber,
    'Permanent District': cand.passport.district,
    'Contact Number': cand.phone,
    'Trade / Applied Role': cand.trade,
    'Basic Salary': `${cand.lotId === lot.id ? lot.salary : 2000} ${lot.currency}`,
    'Interview Status': cand.interviewStatus.toUpperCase(),
    'Interview Score': cand.interviewScore ? `${cand.interviewScore}/100` : 'N/A',
    'VSA Status': cand.vsaStatus,
    'Medical Status': cand.medicalStatus,
    'Orientation Status': cand.orientationStatus,
    'DFFEMS System User ID': cand.dffemsUserId || 'PENDING',
    'DFFEMS Approval Status': cand.dffemsApprovalStatus,
    'Labor Permit No': cand.laborPermitNumber || 'AWAITING_APPROVAL',
    'Flight Date': cand.flightSchedule?.flightDate || 'NOT_SCHEDULED',
  }));

  const wsRoster = XLSX.utils.json_to_sheet(rosterData);
  XLSX.utils.book_append_sheet(wb, wsRoster, 'DFFEMS_Interviewed_List');

  // 2. Lot & Pre-Permission Summary Sheet
  const summaryData = [
    { Parameter: 'Company Name', Value: lot.companyName },
    { Parameter: 'Country', Value: lot.country },
    { Parameter: 'Lot Number', Value: lot.lotNumber },
    { Parameter: 'Job Title / Category', Value: `${lot.title} (${lot.category})` },
    { Parameter: 'Quota Requested', Value: lot.quotaRequested },
    { Parameter: 'Quota Approved (DoFE)', Value: lot.quotaApproved },
    { Parameter: 'Pre-Permission Number', Value: lot.prePermissionNumber || 'Under Review' },
    { Parameter: 'Pre-Permission Date', Value: lot.prePermissionDate || 'Pending' },
    { Parameter: 'Newspaper Ad Publication', Value: lot.newspaperAd?.newspaperName || 'Not Published' },
    { Parameter: 'Interview Venue', Value: lot.interviewVenue?.hallName || 'TBD' },
    { Parameter: 'Generated On', Value: new Date().toISOString() },
  ];
  const wsSummary = XLSX.utils.json_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Lot_Specification');

  // Trigger browser download
  const filename = `${lot.lotNumber.replace(/[^a-zA-Z0-9_-]/g, '_')}_Candidates_DFFEMS.xlsx`;
  XLSX.writeFile(wb, filename);
}

/**
 * Generates an Excel spreadsheet for internal office auditing
 */
export function generateAuditExcel(lot: CompanyDemand, candidates: Candidate[]): void {
  const wb = XLSX.utils.book_new();

  const auditData = candidates.map((cand, idx) => ({
    'S.N.': idx + 1,
    'Candidate Name': cand.passport.fullName,
    'Passport No': cand.passport.passportNumber,
    'Trade': cand.trade,
    'Labor Permit No': cand.laborPermitNumber || 'Approved',
    'Flight Date': cand.flightSchedule?.flightDate || 'Pending',
    'Airline & PNR': cand.flightSchedule?.airline ? `${cand.flightSchedule.airline} (${cand.flightSchedule.pnr || 'N/A'})` : 'TBD',
    'Office Charge (NPR)': cand.accounting.officeCharge,
    'Govt / Welfare Fees (NPR)': cand.accounting.governmentFees,
    'Total Payable (NPR)': cand.accounting.officeCharge + cand.accounting.governmentFees,
    'Candidate Paid (NPR)': cand.accounting.candidatePaid,
    'Balance Due (NPR)': cand.accounting.balanceDue,
    'Payment Status': cand.accounting.paymentStatus.toUpperCase(),
    'Receipt No': cand.accounting.paymentReceiptNo || 'N/A',
    'Payment Mode': cand.accounting.paymentMode || 'N/A',
  }));

  const ws = XLSX.utils.json_to_sheet(auditData);
  XLSX.utils.book_append_sheet(wb, ws, 'Accounting_Audit_Ledger');

  const filename = `${lot.lotNumber}_Accounting_Audit_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, filename);
}

/**
 * Generates email content with tailored prompt and attachment manifest
 */
export function generateEmployerEmail(lot: CompanyDemand, candidates: Candidate[], customPrompt?: string) {
  const selectedCount = candidates.filter((c) => c.interviewStatus === 'selected').length;
  const totalCount = candidates.length;

  const tradeCounts = candidates.reduce<Record<string, number>>((acc, cand) => {
    acc[cand.trade] = (acc[cand.trade] || 0) + 1;
    return acc;
  }, {});

  const tradeBreakdown = Object.entries(tradeCounts)
    .map(([trade, count]) => `  • ${trade}: ${count} candidate(s)`)
    .join('\n');

  const subject = `[SUBMISSION] Candidate Dossiers & Interview Lineup - Lot #${lot.lotNumber} | ${lot.companyName} (${lot.country})`;

  const emailBody = `Dear Hiring Team / Human Resources Directorate,
${lot.companyName}
${lot.country}

Ref: Demand Lot No. ${lot.lotNumber} - ${lot.title}

Greetings from the Recruitment & Overseas Mobilization Operations Team.

We are pleased to submit the finalized candidate lineup for your review and visa approval. Our trade testing officers and verification department have completed primary passport verification (PP/CTZ/ND), technical evaluation, and pre-departure medical assessments.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LOT OVERVIEW & CANDIDATE MANIFEST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Company Name: ${lot.companyName}
• Target Country: ${lot.country}
• Category: ${lot.category}
• Pre-Permission Number: ${lot.prePermissionNumber || 'DFFEMS-PP-ACTIVE'}
• Total Screened Candidates: ${totalCount}
• Recommended / Selected: ${selectedCount}
• Monthly Base Salary: ${lot.salary} ${lot.currency}
• Accommodation & Food: ${lot.foodAndAccommodation}

TRADE BREAKDOWN:
${tradeBreakdown}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ATTACHED ENCLOSURES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. [EXCEL] ${lot.lotNumber}_Candidate_Roster_DFFEMS.xlsx (Complete biometric and passport details)
2. [CV PACK] Individual Overseas Employment Bio-Data Dossiers (All ${totalCount} candidates with photo)
3. [DOCS] Merged Passport Copies, Driving Licenses & Technical Trade Certificates
4. [GOVERNMENT] Pre-Permission Endorsement & Newspaper Vacancy Publication Clipping

${customPrompt ? `\nADDITIONAL OPERATIONAL NOTE:\n${customPrompt}\n` : ''}

Kindly issue the electronic employment visas / entry permits at your earliest convenience so our liaison desk can finalize the Foreign Employment Information Management System (FEIMS/DFFEMS) final labor approvals and book the outbound flight itinerary.

Yours faithfully,

Overseas Operations Directorate
Manpower Recruitment & Mobility Services
Email: operations@manpoweragency.gov.np | Direct: +977-1-4491200`;

  return { subject, body: emailBody };
}

/**
 * Standard pre-permission document templates
 */
export function getPrePermissionDocs(lot: CompanyDemand) {
  return {
    demandLetter: `DEMAND LETTER
Date: ${new Date().toLocaleDateString()}
To:
M/S Manpower Agency Nepal Pvt. Ltd.
Kathmandu, Nepal

Dear Sir/Madam,
We hereby authorize your agency to recruit and mobilize Nepalese manpower on our behalf for employment with ${lot.companyName}, located in ${lot.country}, in accordance with the terms below:

1. Lot Number: ${lot.lotNumber}
2. Category / Job Title: ${lot.title}
3. Required Quota: ${lot.quotaRequested} Persons
4. Approved Quota: ${lot.quotaApproved} Persons
5. Monthly Salary: ${lot.salary} ${lot.currency}
6. Working Hours: 8 Hours/Day, 6 Days/Week (Overtime as per labor law)
7. Accommodation: ${lot.foodAndAccommodation}
8. Contract Period: ${lot.contractPeriodYears} Years (Renewable)
9. Round-Trip Air Passage: Provided by the Employer
10. Medical & Insurance: Free coverage under company policy

We certify that all workers recruited will be treated in accordance with international labor standards and local labor laws of ${lot.country}.

Authorized Signatory
Director of Human Resources
${lot.companyName}`,

    powerOfAttorney: `SPECIAL POWER OF ATTORNEY
KNOW ALL MEN BY THESE PRESENTS:
We, ${lot.companyName}, duly incorporated and operating under the laws of ${lot.country}, do hereby appoint and constitute:
M/S Manpower Agency Nepal Pvt. Ltd., License No. 1290/078/079, Kathmandu, Nepal,
as our true and lawful Attorney-in-Fact to act for us and in our name to:
1. Obtain Pre-Permission and Final Labor Approval from the Department of Foreign Employment (DoFE/DFFEMS), Government of Nepal.
2. Publish newspaper vacancy notices, conduct trade interviews, and select qualified candidates.
3. Sign employment contracts on our behalf and process consular visa endorsements.

IN WITNESS WHEREOF, we have executed this Power of Attorney with our corporate seal.`,

    guaranteeLetter: `AGENCY GUARANTEE LETTER
To:
The Director General,
Department of Foreign Employment (DoFE), DFFEMS System,
Tahachal, Kathmandu, Nepal.

Sub: Guarantee regarding recruitment under Lot #${lot.lotNumber}

We solemnly guarantee that:
1. Workers mobilized for ${lot.companyName} (${lot.country}) will be deployed strictly into the designated positions and company.
2. The company will provide ${lot.salary} ${lot.currency} as basic wage without unlawful deductions.
3. In case of any dispute or grievance, our agency accepts full legal accountability as per the Foreign Employment Act of Nepal.`,
  };
}
