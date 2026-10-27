import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { WhatsAppMessage } from '../types';
import {
  MessageSquare,
  Send,
  Users,
  ShieldCheck,
  CheckCheck,
  FileSpreadsheet,
  FileText,
  AlertCircle,
  Clock,
  Sparkles,
  Paperclip,
  Check,
} from 'lucide-react';

export const WhatsAppHub: React.FC<{
  onOpenFlightModal?: (candidateId?: string) => void;
  onOpenResubmitModal?: (candidateId?: string) => void;
}> = () => {
  const {
    whatsappMessages,
    sendCustomWhatsAppMessage,
    currentStaff,
    setActiveTab,
    resubmitCandidateDocument,
    candidates,
    demands,
    activeLotId,
  } = useApp();

  const [activeGroup, setActiveGroup] = useState<'staff_group' | 'management_group'>('staff_group');
  const [chatInput, setChatInput] = useState('');

  const groupMessages = whatsappMessages.filter((m) => m.group === activeGroup);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    sendCustomWhatsAppMessage(activeGroup, chatInput.trim());
    setChatInput('');
  };

  const handleActionClick = async (action: WhatsAppMessage['actionable']) => {
    if (!action) return;
    if (action.type === 'resubmit_pp' && action.targetId) {
      await resubmitCandidateDocument(action.targetId, 'Orientation QR Color Scan');
    } else if (action.type === 'input_flight') {
      setActiveTab('ticketing');
    } else if (action.type === 'view_otp' || action.type === 'acknowledge_excel') {
      setActiveTab('auditing_accounting');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                WhatsApp Operations Hub
              </span>
              <span className="text-xs text-slate-400">· Automated Dispatch & Action Trigger Engine</span>
            </div>
            <h2 className="text-lg font-bold text-white mt-1">
              Live WhatsApp Group Chat & Two-Way Automation
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              "Most of the automation or action shall be made from WhatsApp chat and the log which user has done what activity shall be logged too."
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-300">
              Active Sender Persona: <span className="text-emerald-400 font-bold">{currentStaff.name}</span> ({currentStaff.role})
            </span>
          </div>
        </div>
      </div>

      {/* Main WhatsApp Window */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg grid grid-cols-1 md:grid-cols-12 min-h-[580px]">
        {/* Left Sidebar: Group Switcher */}
        <div className="md:col-span-4 bg-slate-950 border-r border-slate-800 p-3 space-y-2">
          <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            WhatsApp Operational Channels
          </div>

          {/* Channel 1: Staff Group */}
          <button
            type="button"
            onClick={() => setActiveGroup('staff_group')}
            className={`w-full text-left p-3 rounded-xl transition-all flex items-start gap-3 cursor-pointer ${
              activeGroup === 'staff_group'
                ? 'bg-slate-800/90 border border-emerald-600/60 shadow-sm'
                : 'hover:bg-slate-900/80 border border-transparent'
            }`}
          >
            <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold flex-shrink-0 shadow-sm">
              SG
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white truncate">Staff Operations Group</span>
                <span className="text-[10px] text-emerald-400 font-mono">10am/5pm</span>
              </div>
              <div className="text-[11px] text-slate-400 truncate mt-0.5">
                Interview line, daily DFFEMS entry counts, resubmits & flights
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded font-mono">
                  {whatsappMessages.filter((m) => m.group === 'staff_group').length} msgs
                </span>
              </div>
            </div>
          </button>

          {/* Channel 2: Management Group */}
          <button
            type="button"
            onClick={() => setActiveGroup('management_group')}
            className={`w-full text-left p-3 rounded-xl transition-all flex items-start gap-3 cursor-pointer ${
              activeGroup === 'management_group'
                ? 'bg-slate-800/90 border border-purple-600/60 shadow-sm'
                : 'hover:bg-slate-900/80 border border-transparent'
            }`}
          >
            <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0 shadow-sm">
              MG
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white truncate">Management Board Group</span>
                <span className="text-[10px] text-purple-400 font-mono">Weekly</span>
              </div>
              <div className="text-[11px] text-slate-400 truncate mt-0.5">
                Financial OTP dispatches, weekly flight audits, revenue alerts
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded font-mono">
                  {whatsappMessages.filter((m) => m.group === 'management_group').length} msgs
                </span>
              </div>
            </div>
          </button>

          {/* Quick Info Box */}
          <div className="mt-4 p-3 bg-slate-900/70 border border-slate-800 rounded-lg text-[11px] text-slate-400 space-y-1">
            <div className="text-slate-300 font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              Automated Bot Schedule:
            </div>
            <div>• 10:00 AM: Morning interview lineup alert</div>
            <div>• 05:00 PM: Evening DFFEMS entries report</div>
            <div>• Real-time: Resubmission & Flight alerts</div>
            <div>• Once a week: Management flight summary</div>
          </div>
        </div>

        {/* Right Chat Area */}
        <div className="md:col-span-8 flex flex-col justify-between bg-slate-950/60">
          {/* Group Header */}
          <div className="px-5 py-3.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                  activeGroup === 'staff_group' ? 'bg-emerald-600' : 'bg-purple-600'
                }`}
              >
                {activeGroup === 'staff_group' ? 'SG' : 'MG'}
              </div>
              <div>
                <div className="text-xs font-bold text-white">
                  {activeGroup === 'staff_group' ? 'WhatsApp Staff Operations Group' : 'Management Executive WhatsApp'}
                </div>
                <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Active Bot Automation Engine Connected
                </div>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 font-mono">
              Role: <span className="text-white">{currentStaff.role}</span>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="p-4 overflow-y-auto space-y-4 max-h-[460px]">
            {groupMessages.map((msg) => {
              const isBot = msg.sender.includes('Bot');
              const isCurrentUser = msg.sender === currentStaff.name;

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'} animate-fade-in`}
                >
                  <div className="flex items-center gap-1.5 mb-1 px-1">
                    <span className="text-[11px] font-bold text-slate-300">{msg.sender}</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div
                    className={`max-w-lg rounded-2xl p-3.5 text-xs shadow-md space-y-2.5 ${
                      isCurrentUser
                        ? 'bg-emerald-700 text-white rounded-tr-none'
                        : isBot
                        ? 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                        : 'bg-slate-800 text-slate-200 rounded-tl-none'
                    }`}
                  >
                    <div className="whitespace-pre-line leading-relaxed">{msg.content}</div>

                    {/* Attachments (e.g. Excel) */}
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="space-y-1 pt-1 border-t border-slate-800/80">
                        {msg.attachments.map((att, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-2 p-2 bg-slate-950/80 rounded-lg border border-slate-800 text-[11px] text-emerald-400 font-mono"
                          >
                            <FileSpreadsheet className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                            <span className="flex-1 truncate">{att.name}</span>
                            <span className="text-[10px] text-slate-400">{att.size}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* In-Chat Actionable Button as specified:
                        "most of the automation or action shall be made from whatsapp chat and the log which user has done what activity shall be logged too." */}
                    {msg.actionable && (
                      <div className="pt-1.5 border-t border-slate-800">
                        <button
                          type="button"
                          onClick={() => handleActionClick(msg.actionable)}
                          className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>{msg.actionable.label}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Chat Message Input Bar */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder={`Message #${activeGroup === 'staff_group' ? 'Staff-Operations' : 'Management'} as ${currentStaff.name}...`}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none"
            />
            <button
              type="submit"
              className="p-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors cursor-pointer"
              title="Send to WhatsApp Group"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
