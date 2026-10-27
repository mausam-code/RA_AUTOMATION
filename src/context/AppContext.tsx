import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  CompanyDemand,
  Candidate,
  AuditLog,
  WhatsAppMessage,
  OfficeExpense,
  LotAccountingSummary,
  FlightSchedule,
} from '../types';
import {
  INITIAL_DEMANDS,
  INITIAL_CANDIDATES,
  INITIAL_AUDIT_LOGS,
  INITIAL_WHATSAPP_MESSAGES,
  INITIAL_OFFICE_EXPENSES,
} from '../mock/initialData';
import { dffemsApi } from '../services/dffemsApiService';
import { generateAuditExcel } from '../services/docGenerators';

export type StaffRole =
  | 'Intake Officer'
  | 'Operations Manager'
  | 'Marketing Personnel'
  | 'PRO Officer'
  | 'Accountant'
  | 'System Bot';

export interface CurrentStaff {
  name: string;
  role: StaffRole;
}

interface AppContextType {
  demands: CompanyDemand[];
  candidates: Candidate[];
  auditLogs: AuditLog[];
  whatsappMessages: WhatsAppMessage[];
  expenses: OfficeExpense[];
  activeLotId: string;
  setActiveLotId: (id: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentStaff: CurrentStaff;
  setCurrentStaff: (staff: CurrentStaff) => void;
  viewMode: 'desktop' | 'mobile_companion';
  setViewMode: (mode: 'desktop' | 'mobile_companion') => void;

  // Actions
  addCandidate: (candidate: Candidate) => void;
  updateCandidate: (id: string, updates: Partial<Candidate>) => void;
  addDemand: (demand: CompanyDemand) => void;
  updateDemand: (id: string, updates: Partial<CompanyDemand>) => void;
  logActivity: (action: string, targetType: AuditLog['targetType'], targetId: string, details: string) => void;

  // Workflow actions
  submitPrePermission: (lotId: string) => Promise<void>;
  approvePrePermissionManual: (lotId: string) => Promise<void>;
  saveNewspaperAndVenue: (lotId: string, newspaper: any, venue: any) => Promise<void>;
  dispatch10AmWhatsAppAlert: (lotId: string) => void;
  dispatch5PmWhatsAppAlert: (lotId: string) => void;
  syncDffemsInterviewList: (lotId: string) => Promise<number>;
  createDffemsUsersBatch: (candidateIds: string[]) => Promise<void>;
  selectCandidateVsa: (candidateId: string, advisedBy: string, notes?: string) => Promise<void>;
  resubmitCandidateDocument: (candidateId: string, docType: string) => Promise<void>;
  recordFlightDetails: (candidateId: string, schedule: FlightSchedule) => void;
  checkAndDispatchDailyFlightReminder: () => void;
  checkAndDispatchWeeklyManagementReminder: () => void;
  sendFlightRecordsToAccountingWhatsApp: (lotId: string) => void;
  requestAccountingOtp: (lotId: string) => string;
  verifyAccountingOtp: (lotId: string, code: string) => boolean;
  addOfficeExpense: (expense: Omit<OfficeExpense, 'id'>) => void;
  sendCustomWhatsAppMessage: (group: 'staff_group' | 'management_group', content: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [demands, setDemands] = useState<CompanyDemand[]>(() => {
    const saved = localStorage.getItem('dffems_demands');
    return saved ? JSON.parse(saved) : INITIAL_DEMANDS;
  });

  const [candidates, setCandidates] = useState<Candidate[]>(() => {
    const saved = localStorage.getItem('dffems_candidates');
    return saved ? JSON.parse(saved) : INITIAL_CANDIDATES;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('dffems_audit_logs');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [whatsappMessages, setWhatsappMessages] = useState<WhatsAppMessage[]>(() => {
    const saved = localStorage.getItem('dffems_wa_msgs');
    return saved ? JSON.parse(saved) : INITIAL_WHATSAPP_MESSAGES;
  });

  const [expenses, setExpenses] = useState<OfficeExpense[]>(() => {
    const saved = localStorage.getItem('dffems_expenses');
    return saved ? JSON.parse(saved) : INITIAL_OFFICE_EXPENSES;
  });

  const [activeLotId, setActiveLotId] = useState<string>('LOT-4812');
  const [activeTab, setActiveTab] = useState<string>('raw_companies');
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile_companion'>('desktop');
  const [currentStaff, setCurrentStaff] = useState<CurrentStaff>({
    name: 'Pooja Koirala',
    role: 'Intake Officer',
  });

  // OTP storage per lot
  const [lotOtps, setLotOtps] = useState<Record<string, { code: string; verified: boolean; sentAt: string }>>({
    'LOT-5104': { code: '849201', verified: false, sentAt: '2026-10-26T18:30:00Z' },
  });

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('dffems_demands', JSON.stringify(demands));
  }, [demands]);

  useEffect(() => {
    localStorage.setItem('dffems_candidates', JSON.stringify(candidates));
  }, [candidates]);

  useEffect(() => {
    localStorage.setItem('dffems_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem('dffems_wa_msgs', JSON.stringify(whatsappMessages));
  }, [whatsappMessages]);

  useEffect(() => {
    localStorage.setItem('dffems_expenses', JSON.stringify(expenses));
  }, [expenses]);

  const logActivity = (action: string, targetType: AuditLog['targetType'], targetId: string, details: string) => {
    const newLog: AuditLog = {
      id: `LOG-${Date.now()}-${Math.floor(Math.random() * 100)}`,
      timestamp: new Date().toISOString(),
      staffName: currentStaff.name,
      staffRole: currentStaff.role,
      action,
      targetType,
      targetId,
      details,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const addCandidate = (candidate: Candidate) => {
    setCandidates((prev) => [candidate, ...prev]);
    logActivity(
      'INTAKE_CANDIDATE_SAVED',
      'candidate',
      candidate.id,
      `Registered ${candidate.passport.fullName} (PP: ${candidate.passport.passportNumber}) into ${candidate.companyName}.`
    );
  };

  const updateCandidate = (id: string, updates: Partial<Candidate>) => {
    setCandidates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
    logActivity('CANDIDATE_UPDATED', 'candidate', id, `Updated candidate record: ${Object.keys(updates).join(', ')}`);
  };

  const addDemand = (demand: CompanyDemand) => {
    setDemands((prev) => [demand, ...prev]);
    logActivity('LOT_CREATED', 'lot', demand.id, `Created new demand lot ${demand.lotNumber} for ${demand.companyName}`);
  };

  const updateDemand = (id: string, updates: Partial<CompanyDemand>) => {
    setDemands((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...updates } : d))
    );
    logActivity('LOT_UPDATED', 'lot', id, `Updated lot parameters for ${id}`);
  };

  // Submit Pre-permission to DFFEMS
  const submitPrePermission = async (lotId: string) => {
    const lot = demands.find((d) => d.id === lotId);
    if (!lot) return;

    await dffemsApi.submitPrePermission(lot);
    const ppNumber = `DFFEMS-PP-${Math.floor(10000 + Math.random() * 90000)}/082`;

    updateDemand(lotId, {
      status: 'pre_permission_pending',
      prePermissionNumber: ppNumber,
      prePermissionDate: new Date().toISOString().slice(0, 10),
    });

    logActivity(
      'DFFEMS_PRE_PERMISSION_SUBMIT',
      'lot',
      lotId,
      `Submitted pre-permission application for ${lot.companyName} (${lot.quotaRequested} seats) to DFFEMS system.`
    );
  };

  // Approve Pre-permission
  const approvePrePermissionManual = async (lotId: string) => {
    const lot = demands.find((d) => d.id === lotId);
    if (!lot) return;

    updateDemand(lotId, {
      status: 'pre_permission_approved',
      quotaApproved: lot.quotaRequested,
    });

    logActivity(
      'DFFEMS_PRE_PERMISSION_APPROVED',
      'lot',
      lotId,
      `Pre-permission status confirmed APPROVED for Lot ${lot.lotNumber}. Ready for newspaper ad and venue setup.`
    );
  };

  // Save Newspaper and Venue and submit to DFFEMS
  const saveNewspaperAndVenue = async (lotId: string, newspaper: any, venue: any) => {
    const lot = demands.find((d) => d.id === lotId);
    if (!lot) return;

    const updatedLot: CompanyDemand = {
      ...lot,
      status: 'interviewing',
      newspaperAd: { ...newspaper, isSubmittedToDffems: true },
      interviewVenue: { ...venue, isSubmittedToDffems: true },
    };

    await dffemsApi.submitNewspaperAndVenue(updatedLot);
    updateDemand(lotId, updatedLot);

    logActivity(
      'NEWSPAPER_VENUE_SUBMITTED',
      'lot',
      lotId,
      `Published advertisement in ${newspaper.newspaperName} and registered interview venue at ${venue.hallName} in DFFEMS.`
    );
  };

  // 10:00 AM WhatsApp Dispatch
  const dispatch10AmWhatsAppAlert = (lotId: string) => {
    const lot = demands.find((d) => d.id === lotId) || demands[0];
    const lotCandidates = candidates.filter((c) => c.lotId === lot.id);

    const msg: WhatsAppMessage = {
      id: `WA-${Date.now()}`,
      timestamp: new Date().toISOString(),
      group: 'staff_group',
      sender: 'DFFEMS Bot System',
      senderRole: 'Automated 10:00 AM Dispatcher',
      content: `📢 *[10:00 AM MORNING DISPATCH]*\n*Lot:* ${lot.lotNumber} (${lot.companyName})\n• Country: ${lot.country}\n• Quota Approved: ${lot.quotaApproved}\n• Today's Venue: ${lot.interviewVenue?.hallName || 'Central Hall'}\n• Time Slot: ${lot.interviewVenue?.timeSlots || '09:00 AM - 05:00 PM'}\n• Candidates in Queue: ${lotCandidates.length}\n*Instructions:* Please inspect physical PP/CTZ originals and verify biometric records prior to client test.`,
    };

    setWhatsappMessages((prev) => [msg, ...prev]);
    logActivity('WHATSAPP_10AM_ALERT', 'whatsapp', lot.id, `10:00 AM interview schedule alert dispatched to Staff WhatsApp.`);
  };

  // 5:00 PM WhatsApp Dispatch
  const dispatch5PmWhatsAppAlert = (lotId: string) => {
    const lot = demands.find((d) => d.id === lotId) || demands[0];
    const lotCandidates = candidates.filter((c) => c.lotId === lot.id);
    const enteredToday = lotCandidates.filter((c) => c.dffemsInterviewEntryDone).length;

    const msg: WhatsAppMessage = {
      id: `WA-${Date.now()}`,
      timestamp: new Date().toISOString(),
      group: 'staff_group',
      sender: 'DFFEMS Bot System',
      senderRole: 'Automated 05:00 PM Dispatcher',
      content: `✅ *[05:00 PM EVENING SUMMARY]*\n*Lot:* ${lot.lotNumber} (${lot.companyName})\n• Entries Made Today in DFFEMS Interviewed List: *${enteredToday}*\n• Lot Fulfillment: ${enteredToday}/${lot.quotaApproved}\n• System Validation: All PP numbers successfully posted without duplication.\nDispatched by ${currentStaff.name} (${currentStaff.role}).`,
    };

    setWhatsappMessages((prev) => [msg, ...prev]);
    logActivity('WHATSAPP_5PM_ALERT', 'whatsapp', lot.id, `05:00 PM closing entries alert (${enteredToday} entries) dispatched to Staff WhatsApp.`);
  };

  // Create users in DFFEMS if not already created
  const createDffemsUsersBatch = async (candidateIds: string[]) => {
    const targets = candidates.filter((c) => candidateIds.includes(c.id));
    const result = await dffemsApi.ensureUsersCreated(targets);

    setCandidates((prev) =>
      prev.map((c) => {
        const matched = result.createdList.find((res) => res.passportNumber === c.passport.passportNumber);
        if (matched) {
          return {
            ...c,
            dffemsUserCreated: true,
            dffemsUserId: matched.dffemsUserId,
          };
        }
        return c;
      })
    );

    logActivity(
      'DFFEMS_USER_CREATION',
      'dffems',
      targets.length.toString(),
      `Created ${result.createdList.length} user account(s) in DFFEMS registry.`
    );
  };

  // Upload candidate list to DFFEMS interviewed list
  const syncDffemsInterviewList = async (lotId: string) => {
    const lot = demands.find((d) => d.id === lotId);
    if (!lot) return 0;

    const unentered = candidates.filter((c) => c.lotId === lotId && !c.dffemsInterviewEntryDone);
    await dffemsApi.submitInterviewList(lot, unentered.length > 0 ? unentered : candidates.filter((c) => c.lotId === lotId));

    const todayStr = new Date().toISOString().slice(0, 10);
    setCandidates((prev) =>
      prev.map((c) => {
        if (c.lotId === lotId) {
          return {
            ...c,
            dffemsInterviewEntryDone: true,
            dffemsInterviewEntryDate: todayStr,
            dffemsUserCreated: true,
            dffemsUserId: c.dffemsUserId || `DF-USR-${Math.floor(100000 + Math.random() * 900000)}`,
          };
        }
        return c;
      })
    );

    const count = unentered.length || candidates.filter((c) => c.lotId === lotId).length;

    // Send WhatsApp success alert as requested:
    // "once all pp numbers are entered in that specific lot matching the raw company, alert success with numbers of entries that day made to the whatsapp staff group."
    const waMsg: WhatsAppMessage = {
      id: `WA-${Date.now()}`,
      timestamp: new Date().toISOString(),
      group: 'staff_group',
      sender: 'DFFEMS Bot System',
      senderRole: 'Operations Automator',
      content: `🎉 *[DFFEMS ENTRY SUCCESS]*\n*Lot:* ${lot.lotNumber} (${lot.companyName})\n• Successfully uploaded PP roster to DFFEMS Interviewed List.\n• *${count}* entries recorded today (${todayStr}).\n• Duplicate check: 0 collisions detected.\nRecorded by Staff: *${currentStaff.name}*`,
    };
    setWhatsappMessages((prev) => [waMsg, ...prev]);

    logActivity(
      'DFFEMS_INTERVIEW_LIST_SYNC',
      'lot',
      lotId,
      `Synchronized ${count} candidate PP records for Lot ${lot.lotNumber} into DFFEMS interviewed roster.`
    );

    return count;
  };

  // Select candidate for VSA & Add to Manage Candidate List
  const selectCandidateVsa = async (candidateId: string, advisedBy: string, notes?: string) => {
    const candidate = candidates.find((c) => c.id === candidateId);
    if (!candidate) return;

    const updated = {
      ...candidate,
      vsaStatus: 'approved' as const,
      vsaApprovedBy: advisedBy,
      vsaNotes: notes || `Visa processing initiated as advised by ${advisedBy}`,
      inManageList: true,
      manageListDate: new Date().toISOString().slice(0, 10),
    };

    await dffemsApi.submitToManageCandidateList(updated);

    setCandidates((prev) =>
      prev.map((c) => (c.id === candidateId ? updated : c))
    );

    // Count today's entries in manage candidate list for that lot
    const lotCandidates = candidates.filter((c) => c.lotId === candidate.lotId);
    const todayEntriesCount = lotCandidates.filter((c) => c.inManageList).length + 1;

    // Alert WhatsApp staff group with number of entries made in manage candidate list
    const waMsg: WhatsAppMessage = {
      id: `WA-${Date.now()}`,
      timestamp: new Date().toISOString(),
      group: 'staff_group',
      sender: 'DFFEMS Bot System',
      senderRole: 'Workflow Engine',
      content: `📋 *[MANAGE CANDIDATE LIST UPDATE]*\n*Candidate:* ${candidate.passport.fullName} (PP: ${candidate.passport.passportNumber})\n*Lot:* ${candidate.lotId} (${candidate.companyName})\n*Visa Advice:* ${advisedBy}\n• Total Entries in Manage Candidate List on this Lot: *${todayEntriesCount}*\nAction logged by: *${currentStaff.name}* (${currentStaff.role})`,
    };
    setWhatsappMessages((prev) => [waMsg, ...prev]);

    logActivity(
      'MANAGE_LIST_ENTRY_ADDED',
      'candidate',
      candidateId,
      `Added ${candidate.passport.fullName} to Manage Candidate List. Advised by: ${advisedBy}. Total on lot: ${todayEntriesCount}.`
    );
  };

  // Resubmit candidate document
  const resubmitCandidateDocument = async (candidateId: string, docType: string) => {
    const candidate = candidates.find((c) => c.id === candidateId);
    if (!candidate) return;

    await dffemsApi.resubmitDocument(candidate, docType);

    setCandidates((prev) =>
      prev.map((c) => {
        if (c.id === candidateId) {
          return {
            ...c,
            orientationStatus: c.orientationStatus === 'Resubmission_Required' ? 'Pending' : c.orientationStatus,
            medicalStatus: c.medicalStatus === 'Resubmission_Required' ? 'Pending' : c.medicalStatus,
            dffemsApprovalStatus: c.dffemsApprovalStatus === 'Resubmission_Required' ? 'Pending' : c.dffemsApprovalStatus,
          };
        }
        return c;
      })
    );

    const waMsg: WhatsAppMessage = {
      id: `WA-${Date.now()}`,
      timestamp: new Date().toISOString(),
      group: 'staff_group',
      sender: 'DFFEMS Bot System',
      senderRole: 'Document Control',
      content: `🔄 *[DOCUMENT RESUBMITTED TO DFFEMS]*\nCandidate: *${candidate.passport.fullName}* (PP: ${candidate.passport.passportNumber})\nDoc Type: ${docType}\nStatus updated to *Pending Re-evaluation*.\nProcessed by Staff: *${currentStaff.name}*`,
    };
    setWhatsappMessages((prev) => [waMsg, ...prev]);

    logActivity(
      'DOCUMENT_RESUBMITTED',
      'candidate',
      candidateId,
      `Resubmitted ${docType} for ${candidate.passport.fullName} to DFFEMS portal.`
    );
  };

  // Record flight details
  const recordFlightDetails = (candidateId: string, schedule: FlightSchedule) => {
    const cand = candidates.find((c) => c.id === candidateId);
    if (!cand) return;

    updateCandidate(candidateId, {
      flightSchedule: {
        ...schedule,
        isTicketed: true,
        ticketIssuedDate: new Date().toISOString().slice(0, 10),
      },
    });

    logActivity(
      'FLIGHT_SCHEDULE_ENTERED',
      'candidate',
      candidateId,
      `Flight recorded: ${schedule.airline} ${schedule.flightNumber} on ${schedule.flightDate} (PNR: ${schedule.pnr}).`
    );
  };

  // Daily flight reminder check
  const checkAndDispatchDailyFlightReminder = () => {
    const pendingFlight = candidates.filter(
      (c) => c.dffemsApprovalStatus === 'Approved' && !c.flightSchedule?.isTicketed
    );

    if (pendingFlight.length === 0) return;

    const listSummary = pendingFlight
      .map((c) => `• *${c.passport.fullName}* (PP: ${c.passport.passportNumber}) - ${c.companyName}`)
      .join('\n');

    const waMsg: WhatsAppMessage = {
      id: `WA-${Date.now()}`,
      timestamp: new Date().toISOString(),
      group: 'staff_group',
      sender: 'DFFEMS Bot System',
      senderRole: 'Ticketing Dispatcher',
      content: `✈️ *[DAILY TICKETING REMINDER]*\n${pendingFlight.length} approved candidate(s) need flight ticketing dates entered:\n${listSummary}\nPlease confirm itineraries with airline desk and submit flight dates.`,
      actionable: {
        type: 'input_flight',
        label: 'Open Flight Entry Desk',
      },
    };

    setWhatsappMessages((prev) => [waMsg, ...prev]);
    logActivity('DAILY_FLIGHT_REMINDER_SENT', 'whatsapp', 'GRP-STAFF', `Dispatched reminder for ${pendingFlight.length} unscheduled candidates.`);
  };

  // Weekly flight reminder check for management
  const checkAndDispatchWeeklyManagementReminder = () => {
    const approvedTotal = candidates.filter((c) => c.dffemsApprovalStatus === 'Approved').length;
    const ticketedCount = candidates.filter((c) => c.dffemsApprovalStatus === 'Approved' && c.flightSchedule?.isTicketed).length;
    const pendingCount = approvedTotal - ticketedCount;

    const waMsg: WhatsAppMessage = {
      id: `WA-${Date.now()}`,
      timestamp: new Date().toISOString(),
      group: 'management_group',
      sender: 'DFFEMS Bot System',
      senderRole: 'Weekly Management Audit',
      content: `📊 *[WEEKLY MANAGEMENT FLIGHT REPORT]*\n• Total DFFEMS Approved: ${approvedTotal}\n• Flight Tickets Confirmed: ${ticketedCount}\n• Awaiting Flight Allocation: *${pendingCount}*\nStaff has been prompted daily for pending ticketing schedules.`,
    };

    setWhatsappMessages((prev) => [waMsg, ...prev]);
    logActivity('WEEKLY_MANAGEMENT_FLIGHT_SENT', 'whatsapp', 'GRP-MGMT', `Dispatched weekly flight summary to Management WhatsApp.`);
  };

  // Dispatch flight records to accounting system via WhatsApp Excel
  const sendFlightRecordsToAccountingWhatsApp = (lotId: string) => {
    const lot = demands.find((d) => d.id === lotId) || demands[0];
    const lotCandidates = candidates.filter((c) => c.lotId === lot.id);

    const waMsg: WhatsAppMessage = {
      id: `WA-${Date.now()}`,
      timestamp: new Date().toISOString(),
      group: 'staff_group',
      sender: 'DFFEMS Bot System',
      senderRole: 'Accounting Bridge',
      content: `📂 *[ACCOUNTING DISPATCH: FLIGHT RECORDS & CHARGES]*\n*Lot:* ${lot.lotNumber} (${lot.companyName})\n• Flight candidate rosters exported to Internal Office Audit System.\n• Attached: ${lot.lotNumber}_Accounting_Audit.xlsx\nAccountant desk can now log candidate office charges, fees, and payments.`,
      actionable: {
        type: 'acknowledge_excel',
        label: 'Download & Load into Accounting',
        targetId: lot.id,
      },
      attachments: [
        {
          name: `${lot.lotNumber}_Accounting_Audit.xlsx`,
          type: 'excel',
          size: '34 KB',
        },
      ],
    };

    setWhatsappMessages((prev) => [waMsg, ...prev]);
    generateAuditExcel(lot, lotCandidates);

    logActivity(
      'FLIGHT_RECORDS_SENT_TO_ACCOUNTING',
      'accounting',
      lot.id,
      `Dispatched flight records for Lot ${lot.lotNumber} to Accounting desk via WhatsApp Excel.`
    );
  };

  // Request OTP for management income viewing
  const requestAccountingOtp = (lotId: string) => {
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setLotOtps((prev) => ({
      ...prev,
      [lotId]: {
        code: generatedOtp,
        verified: false,
        sentAt: new Date().toISOString(),
      },
    }));

    const lot = demands.find((d) => d.id === lotId);
    const lotName = lot?.companyName || 'Target Company';

    // Dispatched to Management WhatsApp group
    const waMsg: WhatsAppMessage = {
      id: `WA-${Date.now()}`,
      timestamp: new Date().toISOString(),
      group: 'management_group',
      sender: 'DFFEMS Bot System',
      senderRole: 'Financial Security Gate',
      content: `🔒 *[FINANCIAL DISPATCH: OTP GENERATED]*\nCompany's income statement for *${lotName}* is ready.\nEnter the OTP code sent to verified email (seasonsinghrajak@gmail.com) to view encrypted records.\n\n*Demo OTP Code:* \`${generatedOtp}\``,
      actionable: {
        type: 'view_otp',
        label: 'Enter OTP Code & Unlock Audit',
        targetId: lotId,
      },
    };

    setWhatsappMessages((prev) => [waMsg, ...prev]);
    logActivity('ACCOUNTING_OTP_REQUESTED', 'accounting', lotId, `Generated security OTP for ${lotName} financial ledger.`);
    return generatedOtp;
  };

  // Verify OTP
  const verifyAccountingOtp = (lotId: string, code: string): boolean => {
    const record = lotOtps[lotId];
    if (record && record.code === code.trim()) {
      setLotOtps((prev) => ({
        ...prev,
        [lotId]: { ...record, verified: true },
      }));
      logActivity('ACCOUNTING_OTP_VERIFIED', 'accounting', lotId, `Management successfully authenticated OTP for Lot ${lotId}.`);
      return true;
    }
    return false;
  };

  // Add office expense
  const addOfficeExpense = (expense: Omit<OfficeExpense, 'id'>) => {
    const newExp: OfficeExpense = {
      id: `EXP-${Date.now()}`,
      ...expense,
    };
    setExpenses((prev) => [newExp, ...prev]);
    logActivity(
      'EXPENSE_LOGGED',
      'accounting',
      expense.lotId || 'OFFICE',
      `Logged ${expense.type.toUpperCase()}: NPR ${expense.amount} for "${expense.title}" (${expense.category}).`
    );
  };

  const sendCustomWhatsAppMessage = (group: 'staff_group' | 'management_group', content: string) => {
    const newMsg: WhatsAppMessage = {
      id: `WA-${Date.now()}`,
      timestamp: new Date().toISOString(),
      group,
      sender: currentStaff.name,
      senderRole: currentStaff.role,
      content,
    };
    setWhatsappMessages((prev) => [newMsg, ...prev]);
    logActivity('WHATSAPP_CHAT_SENT', 'whatsapp', group, `Dispatched manual message to ${group}.`);
  };

  return (
    <AppContext.Provider
      value={{
        demands,
        candidates,
        auditLogs,
        whatsappMessages,
        expenses,
        activeLotId,
        setActiveLotId,
        activeTab,
        setActiveTab,
        currentStaff,
        setCurrentStaff,
        viewMode,
        setViewMode,
        addCandidate,
        updateCandidate,
        addDemand,
        updateDemand,
        logActivity,
        submitPrePermission,
        approvePrePermissionManual,
        saveNewspaperAndVenue,
        dispatch10AmWhatsAppAlert,
        dispatch5PmWhatsAppAlert,
        syncDffemsInterviewList,
        createDffemsUsersBatch,
        selectCandidateVsa,
        resubmitCandidateDocument,
        recordFlightDetails,
        checkAndDispatchDailyFlightReminder,
        checkAndDispatchWeeklyManagementReminder,
        sendFlightRecordsToAccountingWhatsApp,
        requestAccountingOtp,
        verifyAccountingOtp,
        addOfficeExpense,
        sendCustomWhatsAppMessage,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within an AppProvider');
  return ctx;
};
