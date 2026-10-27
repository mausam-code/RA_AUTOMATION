import React from 'react';
import { Candidate } from '../types';
import { Printer, Download, FileText, CheckCircle2 } from 'lucide-react';

export const CvPreviewModal: React.FC<{
  candidate: Candidate | null;
  onClose: () => void;
}> = ({ candidate, onClose }) => {
  if (!candidate) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="px-6 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">
              Overseas Employment Bio-Data / CV: {candidate.passport.fullName}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Bio-Data</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white text-lg font-bold p-1 cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Printable CV Container (Clean white/light sheet layout for embassy & client compliance) */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-800/40">
          <div className="bg-white text-slate-900 rounded-xl p-8 max-w-2xl mx-auto shadow-xl font-sans text-xs space-y-6 print:m-0 print:p-0 print:shadow-none">
            {/* Header section with photo */}
            <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-700">
                  Overseas Employment Curriculum Vitae
                </span>
                <h1 className="text-2xl font-black tracking-tight text-slate-950">
                  {candidate.passport.fullName.toUpperCase()}
                </h1>
                <div className="text-sm font-bold text-slate-700">{candidate.trade}</div>
                <div className="text-xs text-slate-600">
                  Applied for: <span className="font-semibold">{candidate.companyName}</span>
                </div>
              </div>

              <img
                src={candidate.photoUrl}
                alt={candidate.passport.fullName}
                className="w-24 h-28 object-cover rounded border-2 border-slate-900 shadow-sm"
              />
            </div>

            {/* Passport & Identity Information */}
            <div>
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-950 bg-slate-100 p-1.5 rounded mb-3 border-l-4 border-emerald-600">
                1. Biometric & Passport Details
              </h2>
              <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
                <div>
                  <span className="text-slate-500 block">Passport Number (PP):</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">
                    {candidate.passport.passportNumber}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Citizenship No (CTZ):</span>
                  <span className="font-mono font-bold text-slate-900">
                    {candidate.passport.citizenshipNumber}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">National ID (ND):</span>
                  <span className="font-mono font-medium text-slate-800">
                    {candidate.passport.nationalIdNumber}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Nationality:</span>
                  <span className="font-semibold text-slate-900">{candidate.passport.nationality}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Date of Birth:</span>
                  <span className="font-medium text-slate-900">{candidate.passport.dob}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Gender:</span>
                  <span className="font-medium text-slate-900">{candidate.passport.gender}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Date of Issue:</span>
                  <span className="font-medium text-slate-900">{candidate.passport.issueDate}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Date of Expiry:</span>
                  <span className="font-medium text-slate-900">{candidate.passport.expiryDate}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500 block">Permanent Address:</span>
                  <span className="font-medium text-slate-900">
                    {candidate.passport.permanentAddress}, District: {candidate.passport.district}
                  </span>
                </div>
              </div>
            </div>

            {/* Experience & Skills */}
            <div>
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-950 bg-slate-100 p-1.5 rounded mb-3 border-l-4 border-emerald-600">
                2. Professional Experience & Skills
              </h2>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{candidate.trade}</span>
                  <span className="font-semibold text-emerald-800 font-mono">
                    {candidate.experienceYears} Years Verified Experience
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-1">Core Competencies:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {candidate.skills.map((skill, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 bg-slate-100 border border-slate-300 rounded text-[11px] font-medium text-slate-800"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Education & Contact */}
            <div>
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-950 bg-slate-100 p-1.5 rounded mb-3 border-l-4 border-emerald-600">
                3. Education & Contact Details
              </h2>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-500 block">Academic Qualification:</span>
                  <span className="font-medium text-slate-900">{candidate.education}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Contact Phone:</span>
                  <span className="font-mono font-medium text-slate-900">{candidate.phone}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500 block">Email Address:</span>
                  <span className="font-medium text-slate-900">{candidate.email}</span>
                </div>
              </div>
            </div>

            {/* Declaration & Signatures */}
            <div className="pt-6 border-t border-slate-300 text-[11px] text-slate-500 space-y-4">
              <p>
                I hereby declare that all information given above is true and correct to the best of my knowledge and belief. I agree to abide by the terms and employment laws of the host nation.
              </p>
              <div className="flex items-end justify-between pt-6">
                <div>
                  <div className="font-bold text-slate-900">Candidate Signature</div>
                  <div className="text-[10px] text-slate-400">Date: {new Date().toLocaleDateString()}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-slate-900">Authorized Agency Officer</div>
                  <div className="text-[10px] text-slate-400">Overseas Operations Desk</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Ready for embassy submission and employer review.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
