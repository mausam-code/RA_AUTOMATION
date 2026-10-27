import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getPrePermissionDocs } from '../services/docGenerators';
import {
  FileCheck2,
  Clock,
  Send,
  RotateCcw,
  CheckCircle2,
  FileText,
  Printer,
  Copy,
  AlertCircle,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';

export const PrePermissionStage: React.FC = () => {
  const { demands, activeLotId, submitPrePermission, approvePrePermissionManual, currentStaff } = useApp();

  const currentLot = demands.find((d) => d.id === activeLotId) || demands[0];
  const [activeDocTab, setActiveDocTab] = useState<'demand' | 'poa' | 'guarantee'>('demand');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);

  const docs = getPrePermissionDocs(currentLot);

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  const handleSubmitToDffems = async () => {
    setIsSubmitting(true);
    try {
      await submitPrePermission(currentLot.id);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApproveStatus = async () => {
    await approvePrePermissionManual(currentLot.id);
  };

  return (
    <div className="space-y-6">
      {/* Top Pre-permission Status Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-mono font-bold px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800">
                Stage 2: Pre-Permission Approval
              </span>
              <span className="text-xs text-slate-400">· DoFE & FEIMS System</span>
            </div>
            <h2 className="text-lg font-bold text-white mt-1">
              {currentLot.companyName} ({currentLot.country})
            </h2>
            <div className="text-xs text-slate-400 flex flex-wrap items-center gap-3 mt-1">
              <span>Lot No: <span className="text-white font-mono">{currentLot.lotNumber}</span></span>
              <span>·</span>
              <span>Quota Requested: <span className="text-emerald-400 font-bold">{currentLot.quotaRequested}</span></span>
              <span>·</span>
              <span>Salary: {currentLot.salary} {currentLot.currency}</span>
              <span>·</span>
              <span>
                Pre-Permission No:{' '}
                <span className="font-mono text-emerald-400 font-semibold">
                  {currentLot.prePermissionNumber || 'Under Application'}
                </span>
              </span>
            </div>
          </div>

          {/* Status & Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {currentLot.status === 'pre_permission_pending' ? (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-950/60 border border-amber-800 text-amber-400">
                  <Clock className="w-3.5 h-3.5 animate-spin" />
                  Pre-Permission Under Review
                </span>
                <button
                  type="button"
                  onClick={handleApproveStatus}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  title="Simulate government approval confirmation"
                >
                  Confirm Approved Status
                </button>
              </div>
            ) : currentLot.status === 'pre_permission_approved' || currentLot.status === 'interviewing' ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-950/60 border border-emerald-800 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Pre-Permission Approved (Quota: {currentLot.quotaApproved})
              </div>
            ) : (
              <button
                type="button"
                onClick={handleSubmitToDffems}
                disabled={isSubmitting}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow-md transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Submitting to DFFEMS...' : 'Submit Pre-Permission to DFFEMS'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Scheduler & DFFEMS Integration Status Checker */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-medium">Scheduler Polling</span>
            <span className="text-emerald-400 flex items-center gap-1 text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Every 30m
            </span>
          </div>
          <div className="text-sm font-semibold text-white">Automated Status Listener</div>
          <p className="text-[11px] text-slate-400 mt-1">
            Listens to Department of Foreign Employment (DoFE) pre-permission webhook callbacks.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-medium">Assigned Quota</span>
            <span className="text-white font-mono">{currentLot.quotaApproved} Seats</span>
          </div>
          <div className="text-sm font-semibold text-white">DoFE Endorsed Quota</div>
          <p className="text-[11px] text-slate-400 mt-1">
            Requested: {currentLot.quotaRequested} | Approved: {currentLot.quotaApproved}
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-medium">Active Staff Handling</span>
            <span className="text-emerald-400 font-mono text-[11px]">{currentStaff.role}</span>
          </div>
          <div className="text-sm font-semibold text-white">{currentStaff.name}</div>
          <p className="text-[11px] text-slate-400 mt-1">
            Authorized to sign legal pre-permission declarations.
          </p>
        </div>
      </div>

      {/* Predefined Documents Generator */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              Predefined Pre-Permission Document Suite
            </h3>
            <p className="text-xs text-slate-400">
              Official legal formats mandated by Foreign Employment Regulations for DoFE approval.
            </p>
          </div>

          {/* Doc Switcher Tabs */}
          <div className="flex items-center bg-slate-800 p-1 rounded-lg border border-slate-700 text-xs">
            <button
              type="button"
              onClick={() => setActiveDocTab('demand')}
              className={`px-3 py-1 font-medium rounded-md transition-colors ${
                activeDocTab === 'demand' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Demand Letter
            </button>
            <button
              type="button"
              onClick={() => setActiveDocTab('poa')}
              className={`px-3 py-1 font-medium rounded-md transition-colors ${
                activeDocTab === 'poa' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Power of Attorney
            </button>
            <button
              type="button"
              onClick={() => setActiveDocTab('guarantee')}
              className={`px-3 py-1 font-medium rounded-md transition-colors ${
                activeDocTab === 'guarantee' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Guarantee Letter
            </button>
          </div>
        </div>

        {/* Document Content Preview */}
        <div className="relative bg-slate-950 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80">
            <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider font-semibold">
              Predefined Specimen: {activeDocTab.toUpperCase()}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  handleCopyText(
                    activeDocTab === 'demand'
                      ? docs.demandLetter
                      : activeDocTab === 'poa'
                      ? docs.powerOfAttorney
                      : docs.guaranteeLetter
                  )
                }
                className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs transition-colors cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copyFeedback ? 'Copied!' : 'Copy Text'}</span>
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Specimen</span>
              </button>
            </div>
          </div>

          <pre className="text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed max-h-[380px] overflow-y-auto pr-2">
            {activeDocTab === 'demand' && docs.demandLetter}
            {activeDocTab === 'poa' && docs.powerOfAttorney}
            {activeDocTab === 'guarantee' && docs.guaranteeLetter}
          </pre>
        </div>

        {/* Submission / Resubmission actions */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-blue-400" />
            <span>
              All submissions pass through the simulated DFFEMS central agency gateway.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSubmitToDffems}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>Resubmit / Refresh DFFEMS Status</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
