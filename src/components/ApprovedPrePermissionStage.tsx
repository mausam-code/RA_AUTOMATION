import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Newspaper,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  Calendar,
  Building,
  Upload,
  MessageSquare,
  FileCheck,
  BellRing,
  AlertCircle,
} from 'lucide-react';

export const ApprovedPrePermissionStage: React.FC = () => {
  const {
    demands,
    activeLotId,
    saveNewspaperAndVenue,
    dispatch10AmWhatsAppAlert,
    dispatch5PmWhatsAppAlert,
    currentStaff,
  } = useApp();

  const currentLot = demands.find((d) => d.id === activeLotId) || demands[0];

  // Form states
  const [newspaperName, setNewspaperName] = useState(
    currentLot.newspaperAd?.newspaperName || 'Kantipur National Daily'
  );
  const [publicationDate, setPublicationDate] = useState(
    currentLot.newspaperAd?.publicationDate || new Date().toISOString().slice(0, 10)
  );
  const [pageNumber, setPageNumber] = useState(
    currentLot.newspaperAd?.pageNumber || 'Page 5 (Overseas Vacancy Section)'
  );
  const [clippingRef, setClippingRef] = useState(
    currentLot.newspaperAd?.clippingRef || `PUB-${currentLot.lotNumber}.pdf`
  );

  const [hallName, setHallName] = useState(
    currentLot.interviewVenue?.hallName || 'Everest Trade Testing & Technical Academy, Hall 2'
  );
  const [streetAddress, setStreetAddress] = useState(
    currentLot.interviewVenue?.streetAddress || 'Ring Road, Balkumari'
  );
  const [city, setCity] = useState(currentLot.interviewVenue?.city || 'Lalitpur, Nepal');
  const [timeSlots, setTimeSlots] = useState(
    currentLot.interviewVenue?.timeSlots || '09:00 AM - 05:00 PM'
  );
  const [interviewDate, setInterviewDate] = useState(
    currentLot.interviewVenue?.interviewDates?.[0] || new Date().toISOString().slice(0, 10)
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmitAdAndVenue = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await saveNewspaperAndVenue(
        currentLot.id,
        {
          newspaperName,
          publicationDate,
          pageNumber,
          clippingRef,
        },
        {
          hallName,
          streetAddress,
          city,
          interviewDates: [interviewDate],
          timeSlots,
        }
      );
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Pre-permission Approval Status Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                Stage 3: Pre-Permission Approved
              </span>
              <span className="text-xs text-slate-400">· Newspaper Ad & Venue Setup</span>
            </div>
            <h2 className="text-lg font-bold text-white mt-1">
              Approval Letter Extraction & Publication
            </h2>
            <div className="text-xs text-slate-400 flex flex-wrap items-center gap-3 mt-1">
              <span>Lot: <span className="text-white font-mono">{currentLot.lotNumber}</span></span>
              <span>·</span>
              <span>Company: <span className="text-white font-semibold">{currentLot.companyName}</span></span>
              <span>·</span>
              <span>Pre-Permission No: <span className="font-mono text-emerald-400 font-bold">{currentLot.prePermissionNumber || 'DFFEMS-PP-ACTIVE'}</span></span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="p-3 bg-emerald-950/40 border border-emerald-800/80 rounded-lg text-xs text-emerald-300">
              <div className="font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Pre-Permission Verified
              </div>
              <div className="text-[11px] text-slate-300 mt-0.5">
                Approved Quota: <span className="font-bold text-white">{currentLot.quotaApproved} Candidates</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Automated WhatsApp Extraction Dispatchers (10:00 AM & 05:00 PM) */}
      <div className="bg-gradient-to-r from-emerald-950/50 via-slate-900 to-slate-900 border border-emerald-800/60 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <BellRing className="w-4 h-4 text-emerald-400 animate-pulse" />
              <h3 className="font-bold text-sm text-white">
                Daily WhatsApp Staff Group Dispatcher
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Extract interview details from company lot twice daily (at 10:00 AM and 5:00 PM) and send directly to WhatsApp Staff Group.
            </p>
          </div>
          <span className="text-xs text-slate-400">
            Current Operator: <span className="text-emerald-400 font-medium">{currentStaff.name}</span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          {/* 10:00 AM Morning Dispatch */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-900">
                  10:00 AM DISPATCH
                </span>
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  Scheduled Daily
                </span>
              </div>
              <div className="text-xs font-semibold text-white mt-2">
                Morning Interview Schedule & Candidate Roster
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Pushes venue, time slots, quota targets, and candidate queue to staff WhatsApp group for field team coordination.
              </p>
            </div>
            <button
              type="button"
              onClick={() => dispatch10AmWhatsAppAlert(currentLot.id)}
              className="mt-3 flex items-center justify-center gap-1.5 w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Trigger 10:00 AM WhatsApp Dispatch Now</span>
            </button>
          </div>

          {/* 05:00 PM Evening Summary Dispatch */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-blue-400 bg-blue-950 px-2 py-0.5 rounded border border-blue-900">
                  05:00 PM DISPATCH
                </span>
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  Scheduled Daily
                </span>
              </div>
              <div className="text-xs font-semibold text-white mt-2">
                Evening Closing Summary & DFFEMS Entry Count
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Tallies total candidate PP numbers entered that day in DFFEMS for this specific lot and reports closing metrics to staff.
              </p>
            </div>
            <button
              type="button"
              onClick={() => dispatch5PmWhatsAppAlert(currentLot.id)}
              className="mt-3 flex items-center justify-center gap-1.5 w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Trigger 05:00 PM WhatsApp Dispatch Now</span>
            </button>
          </div>
        </div>
      </div>

      {/* Newspaper & Venue Setup Form */}
      <form
        onSubmit={handleSubmitAdAndVenue}
        className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-5"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Newspaper className="w-4 h-4 text-emerald-400" />
              Newspaper Advertisement & Interview Venue Details
            </h3>
            <p className="text-xs text-slate-400">
              Mandatory submission required by DFFEMS before interview list synchronization.
            </p>
          </div>
          {savedSuccess && (
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-3 py-1 rounded-md animate-fade-in flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Submitted to DFFEMS System!
            </span>
          )}
        </div>

        {/* Section A: Newspaper Advertisement */}
        <div>
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            Part A: Newspaper Advertisement Info
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                National Daily Newspaper *
              </label>
              <input
                type="text"
                required
                value={newspaperName}
                onChange={(e) => setNewspaperName(e.target.value)}
                placeholder="Kantipur National Daily"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Publication Date *
              </label>
              <input
                type="date"
                required
                value={publicationDate}
                onChange={(e) => setPublicationDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Page Number / Section
              </label>
              <input
                type="text"
                value={pageNumber}
                onChange={(e) => setPageNumber(e.target.value)}
                placeholder="Page 7 (Classifieds)"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Clipping File Reference
              </label>
              <input
                type="text"
                value={clippingRef}
                onChange={(e) => setClippingRef(e.target.value)}
                placeholder="CLIPPING-LOT4812.pdf"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section B: Venue Details */}
        <div className="pt-3 border-t border-slate-800">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-400"></span>
            Part B: Interview Venue & Timing Details
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="lg:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Venue / Hall Name *
              </label>
              <input
                type="text"
                required
                value={hallName}
                onChange={(e) => setHallName(e.target.value)}
                placeholder="Everest International Trade Testing Center, Hall 2"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Street Address
              </label>
              <input
                type="text"
                value={streetAddress}
                onChange={(e) => setStreetAddress(e.target.value)}
                placeholder="Ring Road, Balkumari"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                City / Location
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Lalitpur, Nepal"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Interview Date *
              </label>
              <input
                type="date"
                required
                value={interviewDate}
                onChange={(e) => setInterviewDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Time Slots *
              </label>
              <input
                type="text"
                required
                value={timeSlots}
                onChange={(e) => setTimeSlots(e.target.value)}
                placeholder="09:00 AM - 05:00 PM"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Submit to DFFEMS Button */}
        <div className="pt-3 flex items-center justify-between border-t border-slate-800">
          <div className="text-xs text-slate-400">
            Status: {currentLot.newspaperAd?.isSubmittedToDffems ? (
              <span className="text-emerald-400 font-medium">Published & Registered in DFFEMS</span>
            ) : (
              <span className="text-amber-400 font-medium">Pending DFFEMS Registration</span>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-md transition-colors cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>{isSubmitting ? 'Submitting to DFFEMS...' : 'Submit Manually to System of DFFEMS'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
