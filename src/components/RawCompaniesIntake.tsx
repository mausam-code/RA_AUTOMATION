import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Candidate, CandidatePassportDetails } from '../types';
import { performPassportOcr, SAMPLE_PASSPORT_PRESETS, OcrResult } from '../services/ocrService';
import { generateCandidateExcel } from '../services/docGenerators';
import {
  ScanLine,
  Upload,
  CheckCircle2,
  FileSpreadsheet,
  FileText,
  Mail,
  UserPlus,
  Sparkles,
  Building2,
  RefreshCw,
  Eye,
  AlertCircle,
  FileCheck,
} from 'lucide-react';

export const RawCompaniesIntake: React.FC<{
  onOpenCvModal: (candidate: Candidate) => void;
  onOpenEmailModal: (lot: any, candidates: Candidate[]) => void;
}> = ({ onOpenCvModal, onOpenEmailModal }) => {
  const { demands, activeLotId, candidates, addCandidate, currentStaff } = useApp();

  const currentLot = demands.find((d) => d.id === activeLotId) || demands[0];
  const lotCandidates = candidates.filter((c) => c.lotId === currentLot.id);

  // OCR state
  const [isScanning, setIsScanning] = useState(false);
  const [ocrResult, setOcrResult] = useState<OcrResult | null>(null);
  const [passportPhotoPreview, setPassportPhotoPreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Candidate Finalize Form state
  const [formData, setFormData] = useState<CandidatePassportDetails>({
    passportNumber: '',
    citizenshipNumber: '',
    nationalIdNumber: '',
    surname: '',
    givenNames: '',
    fullName: '',
    gender: 'MALE',
    dob: '1996-01-01',
    nationality: 'NEPALESE',
    placeOfBirth: '',
    issueDate: '2022-01-01',
    expiryDate: '2032-01-01',
    issuingAuthority: 'Department of Passports, Nepal',
    permanentAddress: '',
    district: '',
    rawMrz: '',
  });

  const [trade, setTrade] = useState<string>('Heavy Trailer Driver');
  const [phone, setPhone] = useState<string>('+977-98');
  const [email, setEmail] = useState<string>('');
  const [experienceYears, setExperienceYears] = useState<number>(4);
  const [education, setEducation] = useState<string>('Secondary Education (SEE / 10th)');
  const [skillsInput, setSkillsInput] = useState<string>('Heavy Articulated Truck, Defensive Driving');

  // Handle OCR trigger
  // const handleTriggerOcr = async (source: { file?: File; base64?: string; sampleId?: string }) => {
  //   setIsScanning(true);
  //   try {
  //     const res = await performPassportOcr(source);
  //     setOcrResult(res);
  //     setFormData({ ...res.details });
  //     setPhone(`+977-98${Math.floor(10000000 + Math.random() * 90000000)}`);
  //     setEmail(`${res.details.givenNames.toLowerCase()}.${res.details.surname.toLowerCase()}@gmail.com`);

  //     if (source.sampleId) {
  //       const preset = SAMPLE_PASSPORT_PRESETS.find((p) => p.details.passportNumber === source.sampleId);
  //       if (preset) setPassportPhotoPreview(preset.previewUrl);
  //     }
  //   } catch (err) {
  //     console.error('OCR Error:', err);
  //   } finally {
  //     setIsScanning(false);
  //   }
  // };
  
const [ocrError, setOcrError] = useState<string | null>(null);

const handleTriggerOcr = async (
  source: {
    file?: File;
    base64?: string;
    sampleId?: string;
  }
) => {
  setIsScanning(true);
  setOcrError(null);
  setOcrResult(null);

  try {
    const result = await performPassportOcr(source);

    setOcrResult(result);
    setFormData({ ...result.details });

    // Contact details must be provided by the candidate.
    setPhone('');
    setEmail('');

    console.log('Passport OCR completed:', result);
  } catch (error) {
    console.error('Passport OCR error:', error);

    setOcrError(
      error instanceof Error
        ? error.message
        : 'Unable to recognize passport'
    );
  } finally {
    setIsScanning(false);
  }
};


  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setPassportPhotoPreview(base64);
      handleTriggerOcr({ file, base64 });
    };
    reader.readAsDataURL(file);
  };

  const handleSaveCandidate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.passportNumber || !formData.fullName) {
      alert('Please complete Passport Number and Full Name');
      return;
    }

    const newCandidate: Candidate = {
      id: `CAND-${Date.now()}`,
      lotId: currentLot.id,
      companyName: currentLot.companyName,
      passport: { ...formData },
      photoUrl:
        passportPhotoPreview ||
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      phone,
      email,
      trade,
      experienceYears: Number(experienceYears),
      education,
      skills: skillsInput.split(',').map((s) => s.trim()).filter(Boolean),
      cvGenerated: true,
      dossierMerged: true,
      interviewStatus: 'selected',
      interviewDate: new Date().toISOString().slice(0, 10),
      interviewScore: 85,
      dffemsUserCreated: false,
      dffemsInterviewEntryDone: false,
      vsaStatus: 'in_process',
      inManageList: false,
      orientationStatus: 'Pending',
      medicalStatus: 'Fit',
      medicalCenterName: 'GAMCA Accredited Medical Diagnostic Center',
      medicalReportDate: new Date().toISOString().slice(0, 10),
      dffemsApprovalStatus: 'Pending',
      flightSchedule: { isTicketed: false },
      accounting: {
        officeCharge: 45000,
        governmentFees: 15000,
        candidatePaid: 30000,
        balanceDue: 30000,
        paymentStatus: 'partial',
        lastPaymentDate: new Date().toISOString().slice(0, 10),
        paymentReceiptNo: `REC-${Math.floor(1000 + Math.random() * 9000)}`,
        paymentMode: 'Cash',
      },
      createdAt: new Date().toISOString(),
    };

    addCandidate(newCandidate);

    // Reset OCR for next candidate
    setOcrResult(null);
    setPassportPhotoPreview('');
    setFormData({
      passportNumber: '',
      citizenshipNumber: '',
      nationalIdNumber: '',
      surname: '',
      givenNames: '',
      fullName: '',
      gender: 'MALE',
      dob: '1996-01-01',
      nationality: 'NEPALESE',
      placeOfBirth: '',
      issueDate: '2022-01-01',
      expiryDate: '2032-01-01',
      issuingAuthority: 'Department of Passports, Nepal',
      permanentAddress: '',
      district: '',
      rawMrz: '',
    });
  };

  return (
    <div className="space-y-6">
      {/* Company Demand Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-white">{currentLot.companyName}</span>
              <span className="text-lg">{currentLot.countryFlag}</span>
              <span className="text-xs text-slate-400 font-mono">({currentLot.country})</span>
            </div>
            <div className="text-sm font-semibold text-emerald-400 mt-1 flex items-center gap-2">
              <span>{currentLot.title}</span>
              <span className="text-slate-500">·</span>
              <span className="text-xs text-slate-300 font-mono">Lot #{currentLot.lotNumber}</span>
            </div>
            <div className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-3">
              <span>Quota: {lotCandidates.length} / {currentLot.quotaApproved}</span>
              <span>·</span>
              <span>Salary: {currentLot.salary} {currentLot.currency}/mo</span>
              <span>·</span>
              <span>Food & Accomm: {currentLot.foodAndAccommodation}</span>
            </div>
          </div>

          {/* Action Bar: CV Generator, Excel Generator, Email Generator */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => generateCandidateExcel(currentLot, lotCandidates)}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors cursor-pointer"
              title="Download Excel formatted for JK & FEIMS"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Excel Generator (.xlsx)</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenEmailModal(currentLot, lotCandidates)}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold shadow-sm transition-colors cursor-pointer"
              title="Generate customized email to employer with prompt and attachments"
            >
              <Mail className="w-4 h-4 text-blue-400" />
              <span>Email Generator & Prompt</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: OCR Scanner on Left, Finalize Form on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: OCR Scanner (PP / CTZ / ND) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ScanLine className="w-5 h-5 text-emerald-400" />
                <h3 className="font-semibold text-sm text-white">Biometric OCR Scanner</h3>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded">
                PP / CTZ / ND
              </span>
            </div>

            <p className="text-xs text-slate-400 mt-2">
              Upload physical passport copy or select sample credentials. The engine extracts MRZ lines, Passport Number, Citizenship Number, National ID, and personal demographics.
            </p>

            {/* Upload Zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="mt-4 border-2 border-dashed border-slate-700 hover:border-emerald-500 bg-slate-800/40 hover:bg-slate-800/80 transition-all rounded-xl p-6 text-center cursor-pointer group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              {passportPhotoPreview ? (
                <div className="flex flex-col items-center gap-2">
                  <img
                    src={passportPhotoPreview}
                    alt="Passport Preview"
                    className="w-32 h-24 object-cover rounded-lg border border-slate-600 shadow-md"
                  />
                  <div className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Passport Image Scanned
                  </div>
                  <span className="text-[11px] text-slate-400">Click to scan a different document</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-emerald-400 group-hover:scale-105 transition-all">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div className="text-xs font-semibold text-slate-200">
                    Drop Passport / CTZ / ND Image here
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Supports JPG, PNG, WEBP with high-res MRZ recognition
                  </div>
                </div>
              )}
            </div>
            {isScanning && (
  <div className="mt-3 text-sm text-emerald-400">
    Scanning passport... Please wait.
  </div>
)}

{ocrError && (
  <div
    role="alert"
    className="mt-3 rounded-lg border border-red-700 bg-red-950/40 p-3 text-sm text-red-300"
  >
    {ocrError}
  </div>
)}

            {/* Quick 1-Click Passport Presets */}
            <div className="mt-4">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Or Load Real Passport Samples:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {SAMPLE_PASSPORT_PRESETS.map((preset) => (
                  <button
                    key={preset.details.passportNumber}
                    type="button"
                    onClick={() => handleTriggerOcr({ sampleId: preset.details.passportNumber })}
                    className="p-2 bg-slate-800/70 hover:bg-slate-800 border border-slate-700 hover:border-emerald-500 rounded-lg text-left transition-colors cursor-pointer group"
                  >
                    <div className="text-xs font-semibold text-slate-200 group-hover:text-emerald-400 truncate">
                      {preset.details.fullName}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      PP: {preset.details.passportNumber}
                    </div>
                    <div className="text-[10px] text-emerald-400">
                      CTZ: {preset.details.citizenshipNumber}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* OCR Live Extraction Telemetry */}
            {ocrResult && (
              <div className="mt-4 p-3 bg-slate-950 border border-emerald-900/50 rounded-lg text-xs space-y-2">
                <div className="flex items-center justify-between text-emerald-400 font-medium">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    {/* OCR Extracted Successfully ({Math.round(ocrResult.confidence * 100)}% match) */}
                    MRZ Read ({Math.round(ocrResult.confidence * 100)}% OCR confidence)
                  </span>
                  <span className="text-[10px] uppercase font-mono bg-emerald-900/40 px-1.5 py-0.5 rounded text-emerald-300">
                    {ocrResult.extractedFrom}
                  </span>
                </div>
                {ocrResult.details.rawMrz && (
                  <div className="font-mono text-[10px] bg-slate-900 p-2 rounded text-emerald-300 overflow-x-auto whitespace-pre border border-slate-800">
                    {ocrResult.details.rawMrz}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Editable Form to Finalize Details & Save */}
        <div className="lg:col-span-7">
          <form
            onSubmit={handleSaveCandidate}
            className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="font-semibold text-sm text-white">Finalize Candidate & Save</h3>
                <p className="text-xs text-slate-400">
                  Review and edit data parsed from PP, CTZ, and ND prior to official database commit.
                </p>
              </div>
              <span className="text-xs text-slate-400">
                Staff: <span className="text-emerald-400 font-medium">{currentStaff.name}</span>
              </span>
            </div>

            {/* Tri-Credential Row (PP, CTZ, ND) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Passport Number (PP) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.passportNumber}
                  onChange={(e) => setFormData({ ...formData, passportNumber: e.target.value.toUpperCase() })}
                  placeholder="e.g. PA0829142"
                  className="w-full bg-slate-800 border border-slate-700 focus:border-emerald-500 rounded-lg px-3 py-2 text-xs font-mono font-bold text-white focus:outline-none uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Citizenship Number (CTZ) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.citizenshipNumber}
                  onChange={(e) => setFormData({ ...formData, citizenshipNumber: e.target.value })}
                  placeholder="e.g. 27-01-78-01923"
                  className="w-full bg-slate-800 border border-slate-700 focus:border-emerald-500 rounded-lg px-3 py-2 text-xs font-mono font-medium text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  National ID (ND)
                </label>
                <input
                  type="text"
                  value={formData.nationalIdNumber}
                  onChange={(e) => setFormData({ ...formData, nationalIdNumber: e.target.value })}
                  placeholder="e.g. 892-129-4402"
                  className="w-full bg-slate-800 border border-slate-700 focus:border-emerald-500 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none"
                />
              </div>
            </div>

            {/* Name & Demographics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Surname</label>
                <input
                  type="text"
                  value={formData.surname}
                  onChange={(e) => setFormData({ ...formData, surname: e.target.value.toUpperCase() })}
                  placeholder="THAPA"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Given Names</label>
                <input
                  type="text"
                  value={formData.givenNames}
                  onChange={(e) => setFormData({ ...formData, givenNames: e.target.value.toUpperCase() })}
                  placeholder="BIKASH"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Bikash Thapa"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-medium focus:outline-none"
                />
              </div>
            </div>

            {/* Gender, DOB, Nationality */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                >
                  <option value="MALE">MALE</option>
                  <option value="FEMALE">FEMALE</option>
                  <option value="OTHER">OTHER</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Nationality</label>
                <input
                  type="text"
                  value={formData.nationality}
                  onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>
            </div>

            {/* Passport Issue & Expiry */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Issue Date</label>
                <input
                  type="date"
                  value={formData.issueDate}
                  onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Expiry Date</label>
                <input
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Permanent District</label>
                <input
                  type="text"
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  placeholder="e.g. Kaski, Morang, Jhapa"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>
            </div>

            {/* Permanent Address */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Permanent Address</label>
              <input
                type="text"
                value={formData.permanentAddress}
                onChange={(e) => setFormData({ ...formData, permanentAddress: e.target.value })}
                placeholder="Pokhara-14, Majheripatan, Kaski"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>

            {/* Trade & Professional Details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Trade / Role *</label>
                <input
                  type="text"
                  value={trade}
                  onChange={(e) => setTrade(e.target.value)}
                  placeholder="Heavy Trailer Driver"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-emerald-400 font-semibold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Experience (Years)</label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>
            </div>

            {/* Save & Submit */}
            <div className="pt-3 flex items-center justify-end gap-3">
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-md transition-colors cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Save Candidate to {currentLot.companyName}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Candidate List for this raw company lot */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm text-white">
              Raw Candidate Intake Roster ({lotCandidates.length})
            </h3>
            <span className="text-xs text-slate-400">· {currentLot.companyName}</span>
          </div>

          <div className="text-xs text-slate-400">
            Click <span className="text-emerald-400 font-medium">CV</span> to preview overseas bio-data
          </div>
        </div>

        {lotCandidates.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            No candidates enrolled yet in this company lot. Use the OCR scanner above to scan PP/CTZ/ND details.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Photo & Name</th>
                  <th className="px-4 py-3">Passport (PP)</th>
                  <th className="px-4 py-3">Citizenship (CTZ)</th>
                  <th className="px-4 py-3">Trade & Exp</th>
                  <th className="px-4 py-3">District</th>
                  <th className="px-4 py-3">FEIMS Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {lotCandidates.map((cand) => (
                  <tr key={cand.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={cand.photoUrl}
                          alt={cand.passport.fullName}
                          className="w-9 h-9 rounded-full object-cover border border-slate-700"
                        />
                        <div>
                          <div className="font-semibold text-white">{cand.passport.fullName}</div>
                          <div className="text-[11px] text-slate-400">{cand.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-emerald-400">
                      {cand.passport.passportNumber}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-300">
                      {cand.passport.citizenshipNumber}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-white font-medium">{cand.trade}</div>
                      <div className="text-[11px] text-slate-400">{cand.experienceYears} Years Exp</div>
                    </td>
                    <td className="px-4 py-3 text-slate-300">{cand.passport.district}</td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
                        {cand.dffemsInterviewEntryDone ? 'SYNCED TO LOT' : 'PENDING SYNC'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => onOpenCvModal(cand)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-md text-[11px] font-medium transition-colors cursor-pointer"
                        title="View & Print Overseas Employment CV"
                      >
                        <FileText className="w-3.5 h-3.5 text-blue-400" />
                        <span>CV</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
