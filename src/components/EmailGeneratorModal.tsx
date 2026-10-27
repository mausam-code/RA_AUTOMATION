import React, { useState } from 'react';
import { Candidate, CompanyDemand } from '../types';
import { generateEmployerEmail } from '../services/docGenerators';
import { Mail, Copy, Check, Sparkles, Send, Paperclip } from 'lucide-react';

export const EmailGeneratorModal: React.FC<{
  isOpen: boolean;
  lot: CompanyDemand | null;
  candidates: Candidate[];
  onClose: () => void;
}> = ({ isOpen, lot, candidates, onClose }) => {
  if (!isOpen || !lot) return null;

  const [customPrompt, setCustomPrompt] = useState(
    'Please expedite visa processing for the GCC license holders. All candidates are medically certified fit by GAMCA.'
  );
  const [copied, setCopied] = useState(false);

  const { subject, body } = generateEmployerEmail(lot, candidates, customPrompt);

  const handleCopy = () => {
    navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenMailClient = () => {
    const mailto = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-950 text-blue-400 border border-blue-800 rounded-lg">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Employer Submission Email & AI Prompt Generator
              </h3>
              <p className="text-xs text-slate-400">
                Generate formatted email with Excel candidate roster, CV packs, and merged dossier attachments.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white text-lg font-bold p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Prompt Box */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Prompt / Specific Operational Instructions:
              </label>
              <span className="text-[10px] text-slate-400 font-mono">Dynamic Body Interpolation</span>
            </div>
            <textarea
              rows={2}
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Enter special remarks, urgent flight requirements, or salary clarifications..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none"
            />
          </div>

          {/* Subject Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Generated Subject</label>
            <div className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-semibold text-white font-mono">
              {subject}
            </div>
          </div>

          {/* Body Field */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-300">Email Body & Attachment Manifest</label>
              <span className="text-[11px] text-slate-400">Formatted for HR / Consular review</span>
            </div>
            <pre className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-slate-300 whitespace-pre-wrap font-mono leading-relaxed max-h-[300px] overflow-y-auto">
              {body}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={handleOpenMailClient}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Open in Default Mail Client</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-md"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied with Attachments!' : 'Copy Email & Subject'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
