import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Candidate } from '../types';
import {
  UploadCloud,
  UserCheck,
  CheckCircle2,
  FileSpreadsheet,
  AlertCircle,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Search,
  Filter,
} from 'lucide-react';

export const InterviewDffemsStage: React.FC = () => {
  const {
    demands,
    activeLotId,
    candidates,
    currentStaff,
    syncDffemsInterviewList,
    createDffemsUsersBatch,
    selectCandidateVsa,
  } = useApp();

  const currentLot = demands.find((d) => d.id === activeLotId) || demands[0];
  const lotCandidates = candidates.filter((c) => c.lotId === currentLot.id);

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);
  const [selectedCandidateForVsa, setSelectedCandidateForVsa] = useState<Candidate | null>(null);
  const [vsaAdviser, setVsaAdviser] = useState<string>('Advised by Marketing Director Sharma');
  const [vsaNotes, setVsaNotes] = useState<string>('Candidate passed practical trade test with 85+ score. Client approved quota assignment.');
  const [searchQuery, setSearchQuery] = useState('');

  const advisersList = [
    'Advised by Marketing Director Sharma',
    'Advised by Operations Manager Gurung',
    'Advised by Managing Director Karki',
    'Advised by Riyadh Client Delegation Head',
    'Advised by Dubai Facility HR Manager',
    'Advised by Recruitment Officer Adhikari',
  ];

  // Candidates requiring user creation
  const uncreatedUsers = lotCandidates.filter((c) => !c.dffemsUserCreated);
  // Candidates requiring interview entry sync
  const pendingSyncEntries = lotCandidates.filter((c) => !c.dffemsInterviewEntryDone);

  const handleSyncInterviewList = async () => {
    setIsSyncing(true);
    try {
      // Step 1: Create users in DFFEMS if not created
      if (uncreatedUsers.length > 0) {
        await createDffemsUsersBatch(uncreatedUsers.map((c) => c.id));
      }
      // Step 2: Sync interview roster & dispatch WhatsApp success alert
      const count = await syncDffemsInterviewList(currentLot.id);
      setSyncFeedback(
        `Success: Uploaded ${count} candidate PP entries to DFFEMS Interviewed List. WhatsApp Staff Group alerted!`
      );
      setTimeout(() => setSyncFeedback(null), 5000);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleConfirmVsaSelection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCandidateForVsa) return;

    await selectCandidateVsa(selectedCandidateForVsa.id, vsaAdviser, vsaNotes);
    setSelectedCandidateForVsa(null);
  };

  const filteredCandidates = lotCandidates.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      c.passport.fullName.toLowerCase().includes(q) ||
      c.passport.passportNumber.toLowerCase().includes(q) ||
      c.trade.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-mono font-bold px-2 py-0.5 rounded bg-purple-950 text-purple-400 border border-purple-800">
                Stage 4: DFFEMS Interview List & VSA Processing
              </span>
              <span className="text-xs text-slate-400">· DoFE Worker Portal Sync</span>
            </div>
            <h2 className="text-lg font-bold text-white mt-1">
              Synchronize Excel Roster & Manage Candidate Selection
            </h2>
            <div className="text-xs text-slate-400 flex flex-wrap items-center gap-3 mt-1">
              <span>Lot: <span className="text-white font-mono">{currentLot.lotNumber}</span></span>
              <span>·</span>
              <span>Total Screened: <span className="text-white font-bold">{lotCandidates.length}</span></span>
              <span>·</span>
              <span>
                Synced to DFFEMS:{' '}
                <span className="text-emerald-400 font-bold font-mono">
                  {lotCandidates.filter((c) => c.dffemsInterviewEntryDone).length} / {lotCandidates.length}
                </span>
              </span>
              <span>·</span>
              <span>
                In Manage Candidate List:{' '}
                <span className="text-blue-400 font-bold font-mono">
                  {lotCandidates.filter((c) => c.inManageList).length}
                </span>
              </span>
            </div>
          </div>

          {/* Sync Button */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleSyncInterviewList}
              disabled={isSyncing}
              className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold shadow-md transition-colors cursor-pointer"
            >
              <UploadCloud className="w-4 h-4" />
              <span>
                {isSyncing
                  ? 'Synchronizing to DFFEMS...'
                  : `Upload Excel to DFFEMS (${pendingSyncEntries.length} Pending)`}
              </span>
            </button>
          </div>
        </div>

        {syncFeedback && (
          <div className="mt-4 p-3 bg-emerald-950/80 border border-emerald-800 rounded-lg text-xs text-emerald-300 flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{syncFeedback}</span>
            </div>
          </div>
        )}
      </div>

      {/* Progress & Rules Indicator */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>DFFEMS User Accounts</span>
            <span className="font-mono text-emerald-400">
              {lotCandidates.filter((c) => c.dffemsUserCreated).length}/{lotCandidates.length} Created
            </span>
          </div>
          <div className="text-sm font-semibold text-white">Automated User Registration</div>
          <p className="text-[11px] text-slate-400 mt-1">
            If a candidate does not have a DFFEMS system ID, one is auto-registered using PP/CTZ details.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Daily Entry Check</span>
            <span className="font-mono text-blue-400">Till Last Interview Day</span>
          </div>
          <div className="text-sm font-semibold text-white">Zero Duplicate Guarantee</div>
          <p className="text-[11px] text-slate-400 mt-1">
            Validates PP numbers in lot batch and alerts success count to WhatsApp Staff Group.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>VSA Advice Gate</span>
            <span className="font-mono text-purple-400">Management Mandate</span>
          </div>
          <div className="text-sm font-semibold text-white">Manual VSA Selection</div>
          <p className="text-[11px] text-slate-400 mt-1">
            Staff selects candidate as advised by management/marketing personnel.
          </p>
        </div>
      </div>

      {/* Search & Filter Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search candidate name, PP number, or trade..."
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none"
          />
        </div>
        <div className="text-xs text-slate-400">
          Showing <span className="text-white font-medium">{filteredCandidates.length}</span> candidate(s)
        </div>
      </div>

      {/* Candidate Table with VSA Selection and Manage List Action */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-semibold text-sm text-white">
            Candidate Pipeline & VSA Management ({lotCandidates.length})
          </h3>
          <span className="text-xs text-slate-400">
            Active Staff: <span className="text-emerald-400 font-medium">{currentStaff.name}</span>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Candidate</th>
                <th className="px-4 py-3">Passport (PP)</th>
                <th className="px-4 py-3">DFFEMS User ID</th>
                <th className="px-4 py-3">Interview Sync</th>
                <th className="px-4 py-3">VSA Processing Advice</th>
                <th className="px-4 py-3">Manage List Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredCandidates.map((cand) => (
                <tr key={cand.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={cand.photoUrl}
                        alt={cand.passport.fullName}
                        className="w-8 h-8 rounded-full object-cover border border-slate-700"
                      />
                      <div>
                        <div className="font-semibold text-white">{cand.passport.fullName}</div>
                        <div className="text-[11px] text-emerald-400">{cand.trade}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono font-bold text-slate-200">
                    {cand.passport.passportNumber}
                  </td>
                  <td className="px-4 py-3 font-mono text-[11px]">
                    {cand.dffemsUserId ? (
                      <span className="text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-900">
                        {cand.dffemsUserId}
                      </span>
                    ) : (
                      <span className="text-slate-500 italic">Auto on sync</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {cand.dffemsInterviewEntryDone ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Synced ({cand.dffemsInterviewEntryDate})
                      </span>
                    ) : (
                      <span className="text-[11px] text-amber-400 font-medium">
                        Pending Upload
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {cand.vsaApprovedBy ? (
                      <div>
                        <div className="text-[11px] text-purple-300 font-medium">{cand.vsaApprovedBy}</div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[180px]">{cand.vsaNotes}</div>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-500 italic">Awaiting Management Advice</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {cand.inManageList ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-blue-950 border border-blue-800 text-blue-300">
                        IN MANAGE LIST
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono text-slate-400 bg-slate-800 border border-slate-700">
                        NOT ADDED
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {!cand.inManageList ? (
                      <button
                        type="button"
                        onClick={() => setSelectedCandidateForVsa(cand)}
                        className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded text-[11px] font-semibold transition-colors cursor-pointer"
                      >
                        Select for VSA & Manage List
                      </button>
                    ) : (
                      <span className="text-[11px] text-emerald-400 font-medium">
                        Active in Pipeline
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* VSA Selection & Manage List Assignment Modal */}
      {selectedCandidateForVsa && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-4 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-purple-400" />
                Select Candidate for VSA Processing
              </h3>
              <button
                type="button"
                onClick={() => setSelectedCandidateForVsa(null)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs flex items-center gap-3">
              <img
                src={selectedCandidateForVsa.photoUrl}
                alt=""
                className="w-12 h-12 rounded-lg object-cover border border-slate-700"
              />
              <div>
                <div className="font-bold text-white text-sm">
                  {selectedCandidateForVsa.passport.fullName}
                </div>
                <div className="text-slate-400 font-mono">
                  PP: {selectedCandidateForVsa.passport.passportNumber} · CTZ: {selectedCandidateForVsa.passport.citizenshipNumber}
                </div>
                <div className="text-emerald-400 font-medium">
                  {selectedCandidateForVsa.trade} · Lot #{currentLot.lotNumber}
                </div>
              </div>
            </div>

            <form onSubmit={handleConfirmVsaSelection} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Management / Marketing Adviser *
                </label>
                <select
                  value={vsaAdviser}
                  onChange={(e) => setVsaAdviser(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                >
                  {advisersList.map((adv) => (
                    <option key={adv} value={adv}>
                      {adv}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  Required by protocol: candidate is manually selected as per executive instruction.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Operational Notes & Quota Allocation
                </label>
                <textarea
                  rows={2}
                  value={vsaNotes}
                  onChange={(e) => setVsaNotes(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="p-3 bg-purple-950/40 border border-purple-800/80 rounded-lg text-[11px] text-purple-200">
                ⚡ Upon saving, this candidate will be added to the <strong>Manage Candidate List</strong>, an entry alert with today's count will be dispatched to the <strong>WhatsApp Staff Group</strong>, and the action will be traceably logged under <strong>{currentStaff.name}</strong>.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedCandidateForVsa(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold shadow-md cursor-pointer"
                >
                  Confirm VSA & Add to Manage List
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
