import React from 'react';
import { useApp } from '../context/AppContext';
import {
  FileText,
  FileCheck2,
  Newspaper,
  UserCheck2,
  ListTodo,
  PlaneTakeoff,
  Calculator,
  MessageSquare,
  ArrowRight,
} from 'lucide-react';

export const StageNavigation: React.FC = () => {
  const { activeTab, setActiveTab, candidates, demands, activeLotId } = useApp();

  const activeLot = demands.find((d) => d.id === activeLotId) || demands[0];
  const lotCandidates = candidates.filter((c) => c.lotId === activeLot.id);

  const tabs = [
    {
      id: 'raw_companies',
      label: '1. Raw Intake & OCR',
      kicker: 'PP/CTZ/ND Scanner',
      icon: FileText,
      count: lotCandidates.length,
    },
    {
      id: 'pre_permission',
      label: '2. Pre-Permission',
      kicker: 'Docs & DoFE Submit',
      icon: FileCheck2,
      badge: activeLot.prePermissionNumber ? 'Filed' : 'Pending',
    },
    {
      id: 'pre_permission_approved',
      label: '3. Ad & Venue',
      kicker: 'Newspaper & 10am/5pm',
      icon: Newspaper,
      badge: activeLot.newspaperAd?.isSubmittedToDffems ? 'Active' : 'Draft',
    },
    {
      id: 'dffems_interview',
      label: '4. DFFEMS Sync & VSA',
      kicker: 'User Create & Manage List',
      icon: UserCheck2,
      count: lotCandidates.filter((c) => c.dffemsInterviewEntryDone).length,
    },
    {
      id: 'manage_candidate_list',
      label: '5. Medical & Status',
      kicker: 'Orientation & Resubmits',
      icon: ListTodo,
      alertCount: lotCandidates.filter(
        (c) => c.orientationStatus === 'Resubmission_Required' || c.medicalStatus === 'Resubmission_Required'
      ).length,
    },
    {
      id: 'ticketing',
      label: '6. Flight Schedule',
      kicker: 'Ticketing Reminders',
      icon: PlaneTakeoff,
      alertCount: lotCandidates.filter((c) => c.dffemsApprovalStatus === 'Approved' && !c.flightSchedule?.isTicketed)
        .length,
    },
    {
      id: 'auditing_accounting',
      label: '7. Auditing & Ledger',
      kicker: 'OTP Gate & Debit/Credit',
      icon: Calculator,
      count: lotCandidates.filter((c) => c.accounting.candidatePaid > 0).length,
    },
    {
      id: 'whatsapp_hub',
      label: 'WhatsApp Command',
      kicker: 'Staff & Mgmt Bot',
      icon: MessageSquare,
      isPillSpecial: true,
    },
  ];

  return (
    <div className="bg-slate-900/60 backdrop-blur border-b border-slate-800 px-4 py-2">
      <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto scrollbar-thin gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-2 text-left rounded-lg transition-all whitespace-nowrap text-xs font-medium cursor-pointer border ${
                isActive
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                  : 'bg-slate-800/60 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <div>
                <div className="leading-tight font-semibold flex items-center gap-1.5">
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold ${
                        isActive ? 'bg-emerald-800 text-emerald-100' : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                  {tab.alertCount !== undefined && tab.alertCount > 0 && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-bold bg-amber-500 text-slate-900 animate-pulse">
                      {tab.alertCount}!
                    </span>
                  )}
                </div>
                <div className={`text-[10px] leading-tight ${isActive ? 'text-emerald-100' : 'text-slate-400'}`}>
                  {tab.kicker}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
