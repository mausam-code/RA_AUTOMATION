import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AuditLog } from '../types';
import {
  Activity,
  UserCheck,
  Search,
  Filter,
  Calendar,
  Clock,
  ShieldCheck,
  Download,
} from 'lucide-react';
import * as XLSX from 'xlsx';

export const AuditLogModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const { auditLogs } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  if (!isOpen) return null;

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.staffName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || log.staffRole === roleFilter;
    return matchesSearch && matchesRole;
  });

  const exportAuditLogsExcel = () => {
    const wb = XLSX.utils.book_new();
    const rows = filteredLogs.map((log) => ({
      'Log ID': log.id,
      'Timestamp': log.timestamp,
      'Staff Name': log.staffName,
      'Staff Role': log.staffRole,
      'Action Type': log.action,
      'Target Type': log.targetType,
      'Target ID': log.targetId,
      'Operation Details': log.details,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, 'Staff_Audit_Trail');
    XLSX.writeFile(wb, `Management_Staff_Audit_Trail_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-950 text-amber-400 border border-amber-800 rounded-lg">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Traceable Activity & Staff Audit Log
              </h3>
              <p className="text-xs text-slate-400">
                Management review log tracking which staff executed each recruitment and DFFEMS task.
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

        {/* Filter Controls */}
        <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative flex-1 w-full sm:max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search staff, action, or details..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
            >
              <option value="all">All Staff Roles</option>
              <option value="Intake Officer">Intake Officer</option>
              <option value="Operations Manager">Operations Manager</option>
              <option value="Marketing Personnel">Marketing Personnel</option>
              <option value="PRO Officer">PRO Officer</option>
              <option value="Accountant">Accountant</option>
              <option value="System Bot">System Bot</option>
            </select>

            <button
              type="button"
              onClick={exportAuditLogsExcel}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export Audit Excel</span>
            </button>
          </div>
        </div>

        {/* Audit Log Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredLogs.map((log) => (
            <div
              key={log.id}
              className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl hover:border-slate-700 transition-colors flex flex-col sm:flex-row sm:items-start justify-between gap-3 text-xs"
            >
              <div className="space-y-1 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-white">{log.staffName}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-emerald-400 border border-slate-700">
                    {log.staffRole}
                  </span>
                  <span className="text-[10px] font-mono text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-900">
                    {log.action}
                  </span>
                </div>
                <div className="text-slate-300 leading-relaxed">{log.details}</div>
              </div>

              <div className="text-[11px] font-mono text-slate-500 whitespace-nowrap sm:text-right">
                {new Date(log.timestamp).toLocaleString()}
              </div>
            </div>
          ))}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Total Records: {filteredLogs.length}</span>
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
