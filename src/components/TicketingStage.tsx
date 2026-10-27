import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Candidate, FlightSchedule } from '../types';
import {
  PlaneTakeoff,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Send,
  FileSpreadsheet,
  Clock,
  Building,
  BellRing,
  Ticket,
} from 'lucide-react';

export const TicketingStage: React.FC = () => {
  const {
    candidates,
    demands,
    activeLotId,
    recordFlightDetails,
    checkAndDispatchDailyFlightReminder,
    checkAndDispatchWeeklyManagementReminder,
    sendFlightRecordsToAccountingWhatsApp,
    currentStaff,
  } = useApp();

  const currentLot = demands.find((d) => d.id === activeLotId) || demands[0];
  const approvedCandidates = candidates.filter((c) => c.dffemsApprovalStatus === 'Approved');
  const pendingFlight = approvedCandidates.filter((c) => !c.flightSchedule?.isTicketed);
  const ticketedList = approvedCandidates.filter((c) => c.flightSchedule?.isTicketed);

  // Flight schedule form state
  const [selectedCandId, setSelectedCandId] = useState<string>(
    pendingFlight[0]?.id || approvedCandidates[0]?.id || ''
  );
  const [flightDate, setFlightDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [airline, setAirline] = useState<string>('FlyDubai');
  const [flightNumber, setFlightNumber] = useState<string>('FZ-576');
  const [pnr, setPnr] = useState<string>('FD89201X');
  const [departureAirport, setDepartureAirport] = useState<string>('Tribhuvan International Airport (KTM)');
  const [destinationAirport, setDestinationAirport] = useState<string>('King Khalid International Airport (RUH)');

  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveFlight = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCandId) return;

    recordFlightDetails(selectedCandId, {
      flightDate,
      airline,
      flightNumber,
      pnr,
      departureAirport,
      destinationAirport,
      isTicketed: true,
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const selectedCandidateObj = candidates.find((c) => c.id === selectedCandId);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-mono font-bold px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800">
                Stage 6: Flight Scheduling & Ticketing
              </span>
              <span className="text-xs text-slate-400">· WhatsApp Reminders & Accounting Handoff</span>
            </div>
            <h2 className="text-lg font-bold text-white mt-1">
              Flight Schedule Verification & Daily Reminders
            </h2>
            <div className="text-xs text-slate-400 flex flex-wrap items-center gap-3 mt-1">
              <span>Total Approved: <span className="text-white font-bold">{approvedCandidates.length}</span></span>
              <span>·</span>
              <span>
                Ticketed & Ready:{' '}
                <span className="text-emerald-400 font-bold">{ticketedList.length}</span>
              </span>
              <span>·</span>
              <span>
                Pending Flight Date:{' '}
                <span className="text-amber-400 font-bold">{pendingFlight.length}</span>
              </span>
            </div>
          </div>

          {/* Action to dispatch flight records to accounting */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => sendFlightRecordsToAccountingWhatsApp(currentLot.id)}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-md transition-colors cursor-pointer"
              title="Send flight records to accounting system through Excel in WhatsApp group"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Send Flight Records to Accounting via WhatsApp</span>
            </button>
          </div>
        </div>
      </div>

      {/* Daily & Weekly WhatsApp Reminder Triggers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Daily Staff Group Reminder */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <BellRing className="w-4 h-4 text-amber-400" />
                Daily WhatsApp Staff Group Reminder
              </span>
              <span className="text-[10px] font-mono text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800">
                DAILY PROMPT
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Automatically scans for approved candidates lacking flight schedules and posts a prompt into the WhatsApp Staff Group to request the ticketing date.
            </p>
            <div className="mt-3 text-xs text-slate-300">
              Current Unscheduled Approved:{' '}
              <span className="text-amber-400 font-bold font-mono">{pendingFlight.length} Candidates</span>
            </div>
          </div>

          <button
            type="button"
            onClick={checkAndDispatchDailyFlightReminder}
            className="mt-4 flex items-center justify-center gap-1.5 w-full py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Ask for Ticketing Date in Staff WhatsApp Group</span>
          </button>
        </div>

        {/* Weekly Management Reminder */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-purple-400" />
                Weekly Management WhatsApp Flight Audit
              </span>
              <span className="text-[10px] font-mono text-purple-400 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800">
                ONCE A WEEK
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Summarizes candidate deployment velocity and flags bottlenecked candidates without tickets to the Executive WhatsApp Group.
            </p>
            <div className="mt-3 text-xs text-slate-300">
              Deployment Readiness:{' '}
              <span className="text-emerald-400 font-bold font-mono">
                {ticketedList.length}/{approvedCandidates.length} Ticketed
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={checkAndDispatchWeeklyManagementReminder}
            className="mt-4 flex items-center justify-center gap-1.5 w-full py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Dispatch Weekly Flight Report to Management</span>
          </button>
        </div>
      </div>

      {/* Manual Flight Entry Form & Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form on Left */}
        <div className="lg:col-span-5">
          <form
            onSubmit={handleSaveFlight}
            className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Ticket className="w-4 h-4 text-emerald-400" />
                Final Step: Flight Schedule Entry Form
              </h3>
              {saveSuccess && (
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Saved!
                </span>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Select Approved Candidate *
              </label>
              <select
                value={selectedCandId}
                onChange={(e) => setSelectedCandId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
              >
                {approvedCandidates.map((cand) => (
                  <option key={cand.id} value={cand.id}>
                    {cand.passport.fullName} ({cand.passport.passportNumber}) -{' '}
                    {cand.flightSchedule?.isTicketed ? 'Ticketed' : 'Awaiting Flight'}
                  </option>
                ))}
              </select>
            </div>

            {selectedCandidateObj && (
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs space-y-1">
                <div className="font-semibold text-white">{selectedCandidateObj.passport.fullName}</div>
                <div className="text-[11px] text-slate-400">
                  Labor Permit: {selectedCandidateObj.laborPermitNumber || 'Approved'} · Company: {selectedCandidateObj.companyName}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Flight Date *</label>
                <input
                  type="date"
                  required
                  value={flightDate}
                  onChange={(e) => setFlightDate(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Airline *</label>
                <input
                  type="text"
                  required
                  value={airline}
                  onChange={(e) => setAirline(e.target.value)}
                  placeholder="FlyDubai / Qatar Airways"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Flight Number</label>
                <input
                  type="text"
                  value={flightNumber}
                  onChange={(e) => setFlightNumber(e.target.value)}
                  placeholder="FZ-576"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">PNR Booking Ref</label>
                <input
                  type="text"
                  value={pnr}
                  onChange={(e) => setPnr(e.target.value.toUpperCase())}
                  placeholder="FD89201X"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono uppercase focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Departure Airport</label>
                <input
                  type="text"
                  value={departureAirport}
                  onChange={(e) => setDepartureAirport(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Destination</label>
                <input
                  type="text"
                  value={destinationAirport}
                  onChange={(e) => setDestinationAirport(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-md flex items-center justify-center gap-2"
              >
                <PlaneTakeoff className="w-4 h-4" />
                <span>Save Flight Schedule Details</span>
              </button>
            </div>
          </form>
        </div>

        {/* Table on Right */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="font-semibold text-sm text-white">
              Approved Flight Manifest ({approvedCandidates.length})
            </h3>
            <span className="text-xs text-slate-400">
              Staff: <span className="text-emerald-400 font-medium">{currentStaff.name}</span>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Candidate</th>
                  <th className="px-4 py-3">Passport</th>
                  <th className="px-4 py-3">Flight Date</th>
                  <th className="px-4 py-3">Airline & PNR</th>
                  <th className="px-4 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {approvedCandidates.map((cand) => (
                  <tr key={cand.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-white">{cand.passport.fullName}</div>
                      <div className="text-[11px] text-slate-400">{cand.companyName}</div>
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-slate-300">
                      {cand.passport.passportNumber}
                    </td>
                    <td className="px-4 py-3 font-mono">
                      {cand.flightSchedule?.flightDate ? (
                        <span className="text-emerald-400 font-semibold">{cand.flightSchedule.flightDate}</span>
                      ) : (
                        <span className="text-amber-400 font-semibold italic">Pending Flight Date</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {cand.flightSchedule?.airline ? (
                        <div>
                          <div className="text-white font-medium">
                            {cand.flightSchedule.airline} {cand.flightSchedule.flightNumber}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">PNR: {cand.flightSchedule.pnr}</div>
                        </div>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {cand.flightSchedule?.isTicketed ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 border border-emerald-900 text-emerald-400">
                          TICKET ISSUED
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setSelectedCandId(cand.id)}
                          className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded text-[11px] font-semibold transition-colors cursor-pointer"
                        >
                          Enter Flight
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
