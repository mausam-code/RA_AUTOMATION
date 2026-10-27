import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Candidate, OfficeExpense } from '../types';
import {
  Calculator,
  Lock,
  Unlock,
  KeyRound,
  MailCheck,
  Send,
  PlusCircle,
  Receipt,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Building2,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowRight,
} from 'lucide-react';

export const AuditingAccountingStage: React.FC = () => {
  const {
    demands,
    activeLotId,
    candidates,
    updateCandidate,
    expenses,
    addOfficeExpense,
    requestAccountingOtp,
    verifyAccountingOtp,
    currentStaff,
  } = useApp();

  const currentLot = demands.find((d) => d.id === activeLotId) || demands[0];
  const lotCandidates = candidates.filter((c) => c.lotId === currentLot.id);

  // OTP State
  const [otpInput, setOtpInput] = useState('');
  const [isOtpUnlocked, setIsOtpUnlocked] = useState(false);
  const [otpFeedback, setOtpFeedback] = useState<string | null>(null);
  const [generatedDemoOtp, setGeneratedDemoOtp] = useState<string | null>(null);

  // Expense form state
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseCategory, setExpenseCategory] = useState<OfficeExpense['category']>('Medical Center');
  const [expenseAmount, setExpenseAmount] = useState<number>(15000);
  const [expenseType, setExpenseType] = useState<'debit' | 'credit'>('debit');
  const [paidTo, setPaidTo] = useState('');
  const [invoiceNo, setInvoiceNo] = useState(`INV-${Math.floor(1000 + Math.random() * 9000)}`);

  // Candidate fee editing
  const [editingCandidateId, setEditingCandidateId] = useState<string | null>(null);
  const [editOfficeCharge, setEditOfficeCharge] = useState<number>(45000);
  const [editCandidatePaid, setEditCandidatePaid] = useState<number>(45000);
  const [editPaymentMode, setEditPaymentMode] = useState<any>('Bank Transfer');
  const [editReceiptNo, setEditReceiptNo] = useState(`REC-${Math.floor(1000 + Math.random() * 9000)}`);

  // Financial calculations
  const totalOfficeCharges = lotCandidates.reduce((acc, c) => acc + (c.accounting.officeCharge || 0), 0);
  const totalCandidatePaid = lotCandidates.reduce((acc, c) => acc + (c.accounting.candidatePaid || 0), 0);
  const totalBalanceDue = lotCandidates.reduce((acc, c) => acc + (c.accounting.balanceDue || 0), 0);

  const lotExpenses = expenses.filter((e) => !e.lotId || e.lotId === currentLot.id);
  const totalDebits = lotExpenses
    .filter((e) => e.type === 'debit')
    .reduce((acc, e) => acc + e.amount, 0);
  const totalCredits = lotExpenses
    .filter((e) => e.type === 'credit')
    .reduce((acc, e) => acc + e.amount, 0);

  const netOfficeEarnings = totalCandidatePaid - totalDebits + totalCredits;

  const handleRequestOtp = () => {
    const code = requestAccountingOtp(currentLot.id);
    setGeneratedDemoOtp(code);
    setOtpFeedback(`OTP sent to seasonsinghrajak@gmail.com and WhatsApp Management Group!`);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const success = verifyAccountingOtp(currentLot.id, otpInput);
    if (success) {
      setIsOtpUnlocked(true);
      setOtpFeedback('OTP Verified Successfully! Management financial ledger unlocked.');
    } else {
      setOtpFeedback('Invalid OTP. Please check the code dispatched to email.');
    }
  };

  const handleSaveCandidateFees = (candId: string) => {
    const cand = candidates.find((c) => c.id === candId);
    if (!cand) return;

    const charge = Number(editOfficeCharge);
    const paid = Number(editCandidatePaid);
    const balance = Math.max(0, charge + cand.accounting.governmentFees - paid);

    updateCandidate(candId, {
      accounting: {
        ...cand.accounting,
        officeCharge: charge,
        candidatePaid: paid,
        balanceDue: balance,
        paymentStatus: balance <= 0 ? 'paid' : paid > 0 ? 'partial' : 'unpaid',
        paymentMode: editPaymentMode,
        paymentReceiptNo: editReceiptNo,
        lastPaymentDate: new Date().toISOString().slice(0, 10),
      },
    });

    setEditingCandidateId(null);
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseTitle || !expenseAmount) return;

    addOfficeExpense({
      title: expenseTitle,
      lotId: currentLot.id,
      category: expenseCategory,
      amount: Number(expenseAmount),
      type: expenseType,
      date: new Date().toISOString().slice(0, 10),
      invoiceNo,
      paidTo: paidTo || 'Vendor / Government',
    });

    setExpenseTitle('');
    setPaidTo('');
    setInvoiceNo(`INV-${Math.floor(1000 + Math.random() * 9000)}`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                Stage 7: Internal Office Auditing & Accounting
              </span>
              <span className="text-xs text-slate-400">· Double-Entry Ledger & Secure OTP Gate</span>
            </div>
            <h2 className="text-lg font-bold text-white mt-1">
              Candidate Payments, Debit/Credit Ledger & Company Settlement
            </h2>
            <div className="text-xs text-slate-400 flex flex-wrap items-center gap-3 mt-1">
              <span>Lot: <span className="text-white font-mono">{currentLot.lotNumber}</span></span>
              <span>·</span>
              <span>Company: <span className="text-white font-semibold">{currentLot.companyName}</span></span>
              <span>·</span>
              <span>Accountant: <span className="text-emerald-400 font-semibold">{currentStaff.name}</span></span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isOtpUnlocked ? (
              <button
                type="button"
                onClick={handleRequestOtp}
                className="flex items-center gap-1.5 px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-md"
              >
                <KeyRound className="w-4 h-4" />
                <span>Send Income OTP to Management</span>
              </button>
            ) : (
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-950 border border-emerald-800 text-emerald-300 rounded-lg text-xs font-bold font-mono">
                <Unlock className="w-4 h-4 text-emerald-400" />
                OTP Authenticated (Unlocked)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* OTP Security Modal / Banner for Company Total Received */}
      <div className="bg-gradient-to-r from-purple-950/50 via-slate-900 to-slate-900 border border-purple-800/60 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-purple-400" />
              <h3 className="font-bold text-sm text-white">
                Company Monthly Income & Management Acknowledgment (OTP Gate)
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              "Company's October income is ready, enter the OTP code to view the records. OTP only available after email verification."
            </p>
          </div>

          <span className="text-[11px] font-mono text-purple-300 bg-purple-950 px-2 py-0.5 rounded border border-purple-800">
            Target: seasonsinghrajak@gmail.com
          </span>
        </div>

        {!isOtpUnlocked ? (
          <form onSubmit={handleVerifyOtp} className="mt-4 flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full max-w-sm">
              <input
                type="text"
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value)}
                placeholder="Enter 6-digit OTP code (e.g. 849201)"
                className="w-full bg-slate-950 border border-purple-700/80 rounded-lg px-3 py-2 text-xs font-mono font-bold text-white focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-md"
            >
              Verify OTP & View Company Statement
            </button>
            {generatedDemoOtp && (
              <span className="text-[11px] font-mono text-purple-300">
                (Simulated OTP: <strong className="text-white">{generatedDemoOtp}</strong>)
              </span>
            )}
          </form>
        ) : (
          <div className="mt-4 p-4 bg-slate-950/90 border border-emerald-900 rounded-xl grid grid-cols-1 sm:grid-cols-4 gap-4 animate-fade-in">
            <div>
              <div className="text-[11px] text-slate-400">Total Collected from Candidates</div>
              <div className="text-base font-bold text-emerald-400 font-mono mt-0.5">
                NPR {totalCandidatePaid.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-slate-400">Total Office Expenses (Debits)</div>
              <div className="text-base font-bold text-red-400 font-mono mt-0.5">
                NPR {totalDebits.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-slate-400">Net Company Profit</div>
              <div className="text-base font-bold text-white font-mono mt-0.5">
                NPR {netOfficeEarnings.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-slate-400">Outstanding Candidate Dues</div>
              <div className="text-base font-bold text-amber-400 font-mono mt-0.5">
                NPR {totalBalanceDue.toLocaleString()}
              </div>
            </div>
          </div>
        )}

        {otpFeedback && (
          <div className="mt-3 text-xs text-purple-300 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{otpFeedback}</span>
          </div>
        )}
      </div>

      {/* Candidate Records in Auditing System (Converted from WhatsApp Flight Excel) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-sm text-white">
              Candidate Account Ledger & Office Charges ({lotCandidates.length})
            </h3>
            <p className="text-xs text-slate-400">
              Accountant logs office charges, welfare fees, and paid amounts received from each candidate.
            </p>
          </div>

          <div className="text-xs font-mono text-emerald-400 bg-slate-800 px-2 py-1 rounded border border-slate-700">
            Total Inflow: NPR {totalCandidatePaid.toLocaleString()}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Candidate & PP</th>
                <th className="px-4 py-3">Flight / Labor Status</th>
                <th className="px-4 py-3">Office Charge</th>
                <th className="px-4 py-3">Govt / Welfare</th>
                <th className="px-4 py-3">Paid Amount</th>
                <th className="px-4 py-3">Balance Due</th>
                <th className="px-4 py-3">Receipt / Mode</th>
                <th className="px-4 py-3 text-right">Edit Entry</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {lotCandidates.map((cand) => {
                const isEditing = editingCandidateId === cand.id;

                return (
                  <tr key={cand.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-white">{cand.passport.fullName}</div>
                      <div className="text-[11px] font-mono text-slate-400">PP: {cand.passport.passportNumber}</div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="text-white font-medium">
                        {cand.flightSchedule?.flightDate ? `Flight: ${cand.flightSchedule.flightDate}` : 'Pending Flight'}
                      </div>
                      <div className="text-[10px] text-emerald-400 font-mono">
                        {cand.laborPermitNumber || 'Permit Approved'}
                      </div>
                    </td>

                    {/* Office charge */}
                    <td className="px-4 py-3 font-mono">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editOfficeCharge}
                          onChange={(e) => setEditOfficeCharge(Number(e.target.value))}
                          className="w-24 bg-slate-950 border border-slate-600 rounded px-2 py-1 text-xs text-white"
                        />
                      ) : (
                        `NPR ${cand.accounting.officeCharge.toLocaleString()}`
                      )}
                    </td>

                    {/* Govt fees */}
                    <td className="px-4 py-3 font-mono text-slate-400">
                      NPR {cand.accounting.governmentFees.toLocaleString()}
                    </td>

                    {/* Paid amount */}
                    <td className="px-4 py-3 font-mono font-bold text-emerald-400">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editCandidatePaid}
                          onChange={(e) => setEditCandidatePaid(Number(e.target.value))}
                          className="w-24 bg-slate-950 border border-emerald-600 rounded px-2 py-1 text-xs text-white"
                        />
                      ) : (
                        `NPR ${cand.accounting.candidatePaid.toLocaleString()}`
                      )}
                    </td>

                    {/* Balance due */}
                    <td className="px-4 py-3 font-mono font-bold">
                      {cand.accounting.balanceDue > 0 ? (
                        <span className="text-amber-400">NPR {cand.accounting.balanceDue.toLocaleString()}</span>
                      ) : (
                        <span className="text-emerald-400">Settled (0)</span>
                      )}
                    </td>

                    {/* Receipt & Mode */}
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <div className="flex flex-col gap-1">
                          <input
                            type="text"
                            value={editReceiptNo}
                            onChange={(e) => setEditReceiptNo(e.target.value)}
                            className="w-24 bg-slate-950 border border-slate-600 rounded px-1.5 py-0.5 text-[11px] text-white"
                          />
                          <select
                            value={editPaymentMode}
                            onChange={(e) => setEditPaymentMode(e.target.value)}
                            className="bg-slate-950 border border-slate-600 rounded text-[10px] text-white"
                          >
                            <option value="Bank Transfer">Bank Transfer</option>
                            <option value="Cash">Cash</option>
                            <option value="ConnectIPS">ConnectIPS</option>
                            <option value="eSewa">eSewa</option>
                          </select>
                        </div>
                      ) : (
                        <div>
                          <div className="font-mono text-[11px] text-slate-300">
                            {cand.accounting.paymentReceiptNo || 'N/A'}
                          </div>
                          <div className="text-[10px] text-slate-400">{cand.accounting.paymentMode || 'Cash'}</div>
                        </div>
                      )}
                    </td>

                    {/* Action */}
                    <td className="px-4 py-3 text-right">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleSaveCandidateFees(cand.id)}
                            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-bold"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingCandidateId(null)}
                            className="px-2 py-1 bg-slate-800 text-slate-300 rounded text-[11px]"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCandidateId(cand.id);
                            setEditOfficeCharge(cand.accounting.officeCharge);
                            setEditCandidatePaid(cand.accounting.candidatePaid);
                            setEditPaymentMode(cand.accounting.paymentMode || 'Bank Transfer');
                            setEditReceiptNo(cand.accounting.paymentReceiptNo || `REC-${Math.floor(1000 + Math.random() * 9000)}`);
                          }}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded text-[11px] font-medium"
                        >
                          Update Payment
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Double-Entry Debit/Credit & Expenses Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Record Expense Form */}
        <div className="lg:col-span-5">
          <form
            onSubmit={handleAddExpense}
            className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-400" />
                Record Office Expense / Debit
              </h3>
              <span className="text-xs text-slate-400 font-mono">Lot #{currentLot.lotNumber}</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Expense Title / Description *</label>
              <input
                type="text"
                required
                value={expenseTitle}
                onChange={(e) => setExpenseTitle(e.target.value)}
                placeholder="e.g. GAMCA Medical Clearance or Orientation Academy batch"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
                <select
                  value={expenseCategory}
                  onChange={(e) => setExpenseCategory(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                >
                  <option value="Medical Center">Medical Center</option>
                  <option value="Orientation Academy">Orientation Academy</option>
                  <option value="Insurance Premium">Insurance Premium</option>
                  <option value="Government Tax">Government Tax</option>
                  <option value="Visa Stamping">Visa Stamping</option>
                  <option value="Newspaper Ad">Newspaper Ad</option>
                  <option value="Miscellaneous">Miscellaneous</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Ledger Entry Type</label>
                <select
                  value={expenseType}
                  onChange={(e) => setExpenseType(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                >
                  <option value="debit">DEBIT (Expense)</option>
                  <option value="credit">CREDIT (Refund / Credit)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Amount (NPR) *</label>
                <input
                  type="number"
                  required
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono font-bold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Invoice / Ref No</label>
                <input
                  type="text"
                  value={invoiceNo}
                  onChange={(e) => setInvoiceNo(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Payee / Vendor</label>
              <input
                type="text"
                value={paidTo}
                onChange={(e) => setPaidTo(e.target.value)}
                placeholder="Star Health Care Clinic / DoFE"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-md flex items-center justify-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Record Ledger Entry</span>
            </button>
          </form>
        </div>

        {/* Expenses List */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="font-semibold text-sm text-white">
              Office Expenses & Disbursement Ledger ({lotExpenses.length})
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              Total Debited: NPR {totalDebits.toLocaleString()}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Date & Invoice</th>
                  <th className="px-4 py-3">Description & Payee</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3 text-right">Amount (NPR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {lotExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3 font-mono">
                      <div className="text-white font-medium">{exp.date}</div>
                      <div className="text-[10px] text-slate-400">{exp.invoiceNo}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-white font-medium">{exp.title}</div>
                      <div className="text-[11px] text-slate-400">{exp.paidTo}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                        {exp.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold">
                      <span className={exp.type === 'debit' ? 'text-red-400' : 'text-emerald-400'}>
                        {exp.type === 'debit' ? '-' : '+'} NPR {exp.amount.toLocaleString()}
                      </span>
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
