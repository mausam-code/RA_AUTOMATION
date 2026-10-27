import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { performPassportOcr, SAMPLE_PASSPORT_PRESETS } from '../services/ocrService_example';
import {
  Smartphone,
  ScanLine,
  MessageSquare,
  Users,
  CheckCircle2,
  AlertTriangle,
  PlaneTakeoff,
  Camera,
  Send,
  RefreshCw,
  Clock,
  Sparkles,
} from 'lucide-react';

export const MobileCompanionView: React.FC = () => {
  const {
    currentStaff,
    whatsappMessages,
    sendCustomWhatsAppMessage,
    candidates,
    demands,
    activeLotId,
    resubmitCandidateDocument,
    recordFlightDetails,
  } = useApp();

  const [mobileTab, setMobileTab] = useState<'scan' | 'whatsapp' | 'candidates'>('whatsapp');
  const [scannedFeedback, setScannedFeedback] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState('');

  const currentLot = demands.find((d) => d.id === activeLotId) || demands[0];
  const lotCandidates = candidates.filter((c) => c.lotId === currentLot.id);

  const handleQuickPresetScan = async (sampleId: string) => {
    setScannedFeedback('Scanning Passport with MRZ Engine...');
    const res = await performPassportOcr({ sampleId });
    setTimeout(() => {
      setScannedFeedback(
        `Scanned: ${res.details.fullName} (PP: ${res.details.passportNumber}, CTZ: ${res.details.citizenshipNumber})`
      );
    }, 600);
  };

  const handleSendMobileChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    sendCustomWhatsAppMessage('staff_group', chatInput.trim());
    setChatInput('');
  };

  return (
    <div className="max-w-md mx-auto my-4 bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col min-h-[640px]">
      {/* Mobile Top App Bar */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white text-xs font-bold">
            FE
          </div>
          <div>
            <div className="text-xs font-bold text-white leading-tight">DFFEMS Mobile Staff</div>
            <div className="text-[10px] text-emerald-400 leading-tight">
              {currentStaff.name} ({currentStaff.role})
            </div>
          </div>
        </div>

        <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
          {currentLot.lotNumber}
        </span>
      </div>

      {/* Main Mobile Screen Area */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Tab 1: Mobile WhatsApp Feed */}
        {mobileTab === 'whatsapp' && (
          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-300 flex items-center justify-between pb-1 border-b border-slate-800">
              <span className="flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                Staff WhatsApp Feed
              </span>
              <span className="text-[10px] text-emerald-400">Live 10am/5pm</span>
            </div>

            <div className="space-y-3">
              {whatsappMessages
                .filter((m) => m.group === 'staff_group')
                .slice(0, 5)
                .map((msg) => (
                  <div
                    key={msg.id}
                    className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs space-y-2 shadow-sm"
                  >
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
                      <span>{msg.sender}</span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="text-slate-200 whitespace-pre-line leading-relaxed text-[11px]">
                      {msg.content}
                    </div>

                    {msg.actionable && (
                      <button
                        type="button"
                        onClick={() => {
                          if (msg.actionable?.type === 'resubmit_pp' && msg.actionable.targetId) {
                            resubmitCandidateDocument(msg.actionable.targetId, 'Color QR Scan');
                            alert('Resubmitted document to DFFEMS!');
                          }
                        }}
                        className="w-full py-1.5 px-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>{msg.actionable.label}</span>
                      </button>
                    )}
                  </div>
                ))}
            </div>

            {/* Mobile Chat Input */}
            <form onSubmit={handleSendMobileChat} className="flex items-center gap-2 pt-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Reply to Staff Group..."
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
              />
              <button
                type="submit"
                className="p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}

        {/* Tab 2: Mobile OCR Camera Scanner */}
        {mobileTab === 'scan' && (
          <div className="space-y-4">
            <div className="text-xs font-bold text-slate-300 flex items-center justify-between pb-1 border-b border-slate-800">
              <span className="flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-emerald-400" />
                Mobile Passport Scanner
              </span>
              <span className="text-[10px] font-mono text-slate-400">OCR & MRZ</span>
            </div>

            <div className="border-2 border-dashed border-slate-700 rounded-2xl p-6 text-center space-y-3 bg-slate-900/60">
              <div className="w-12 h-12 rounded-full bg-emerald-950 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-800">
                <ScanLine className="w-6 h-6 animate-pulse" />
              </div>
              <div className="text-xs font-semibold text-white">Capture / Upload Passport</div>
              <p className="text-[11px] text-slate-400">
                Align passport MRZ zone in the camera frame to extract PP, CTZ, and full details.
              </p>
            </div>

            <div className="space-y-2">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                1-Tap Fast Presets:
              </div>
              {SAMPLE_PASSPORT_PRESETS.map((p) => (
                <button
                  key={p.details.passportNumber}
                  type="button"
                  onClick={() => handleQuickPresetScan(p.details.passportNumber)}
                  className="w-full p-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl text-left flex items-center justify-between cursor-pointer"
                >
                  <div>
                    <div className="text-xs font-bold text-white">{p.details.fullName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      PP: {p.details.passportNumber} · CTZ: {p.details.citizenshipNumber}
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">SCAN</span>
                </button>
              ))}
            </div>

            {scannedFeedback && (
              <div className="p-3 bg-emerald-950/70 border border-emerald-800 rounded-xl text-xs text-emerald-300 animate-fade-in flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{scannedFeedback}</span>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Candidates on Field */}
        {mobileTab === 'candidates' && (
          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-300 flex items-center justify-between pb-1 border-b border-slate-800">
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-400" />
                Candidate Pipeline ({lotCandidates.length})
              </span>
              <span className="text-[10px] text-slate-400">{currentLot.companyName}</span>
            </div>

            <div className="space-y-2">
              {lotCandidates.map((cand) => (
                <div
                  key={cand.id}
                  className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1.5 text-xs shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{cand.passport.fullName}</span>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">
                      {cand.passport.passportNumber}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center justify-between">
                    <span>{cand.trade}</span>
                    <span className="text-slate-300 font-mono">
                      Permit: {cand.laborPermitNumber ? 'Issued' : 'Pending'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[10px]">
                    <span className="text-slate-400">
                      Medical: <strong className="text-white">{cand.medicalStatus}</strong>
                    </span>
                    <span className="text-slate-400">
                      Flight: <strong className="text-emerald-400">{cand.flightSchedule?.flightDate || 'TBD'}</strong>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="bg-slate-900 border-t border-slate-800 px-4 py-2 flex items-center justify-around">
        <button
          type="button"
          onClick={() => setMobileTab('whatsapp')}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
            mobileTab === 'whatsapp' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <MessageSquare className="w-5 h-5" />
          <span>WhatsApp</span>
        </button>

        <button
          type="button"
          onClick={() => setMobileTab('scan')}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
            mobileTab === 'scan' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ScanLine className="w-5 h-5" />
          <span>OCR Scanner</span>
        </button>

        <button
          type="button"
          onClick={() => setMobileTab('candidates')}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
            mobileTab === 'candidates' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-5 h-5" />
          <span>Candidates</span>
        </button>
      </div>
    </div>
  );
};
