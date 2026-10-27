import React, { useState } from 'react';
import { useApp, StaffRole } from '../context/AppContext';
import {
  Building2,
  Smartphone,
  Monitor,
  UserCheck,
  ShieldCheck,
  MessageSquare,
  Activity,
  Globe2,
  Clock,
  Sparkles,
  Database,
} from 'lucide-react';

export const Header: React.FC<{
  onOpenAuditLogs: () => void;
  onOpenDffemsGateway: () => void;
  onOpenDeploymentHub: () => void;
}> = ({ onOpenAuditLogs, onOpenDffemsGateway, onOpenDeploymentHub }) => {
  const {
    demands,
    activeLotId,
    setActiveLotId,
    currentStaff,
    setCurrentStaff,
    viewMode,
    setViewMode,
    whatsappMessages,
    setActiveTab,
  } = useApp();

  const [isStaffMenuOpen, setIsStaffMenuOpen] = useState(false);

  const staffOptions: Array<{ name: string; role: StaffRole }> = [
    { name: 'Pooja Koirala', role: 'Intake Officer' },
    { name: 'Sanjay Subedi', role: 'Operations Manager' },
    { name: 'Deepak Sharma', role: 'Marketing Personnel' },
    { name: 'Birendra Shrestha', role: 'PRO Officer' },
    { name: 'Rita Adhikari', role: 'Accountant' },
    { name: 'System Bot', role: 'System Bot' },
  ];

  const activeLot = demands.find((d) => d.id === activeLotId) || demands[0];

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-slate-100 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Agency Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-sm font-bold text-lg tracking-wider">
              JK
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-base text-white tracking-tight">
                  J.K. OVERSEAS PVT. LTD.
                </span>
                {/* <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] uppercase font-mono tracking-wider bg-slate-800 text-emerald-400 border border-slate-700 rounded">
                  FEIMS
                </span> */}
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                 FEIMS SYSTEM
              </p>
            </div>
          </div>

          {/* Active Demand / Lot Switcher */}
          <div className="hidden md:flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
            <Building2 className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-slate-400 font-medium">Active Lot:</span>
            <select
              value={activeLotId}
              onChange={(e) => setActiveLotId(e.target.value)}
              className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer max-w-[200px] truncate"
            >
              {demands.map((lot) => (
                <option key={lot.id} value={lot.id} className="bg-slate-900 text-slate-200">
                  {lot.lotNumber} - {lot.companyName} ({lot.country})
                </option>
              ))}
            </select>
          </div>

          {/* Right Action Tools & Staff Persona */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* View Mode Switcher: Desktop vs Mobile Companion */}
            <div className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700">
              <button
                type="button"
                onClick={() => setViewMode('desktop')}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                  viewMode === 'desktop'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Desktop Operations Hub"
              >
                <Monitor className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Web Hub</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('mobile_companion')}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                  viewMode === 'mobile_companion'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Mobile Staff App View"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Mobile App</span>
              </button>
            </div>

            {/* DB & Deployment Hub Button */}
            <button
              type="button"
              onClick={onOpenDeploymentHub}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-800/80 rounded-lg text-xs font-medium transition-colors shadow-sm"
              title="PostgreSQL, Internal Server & Play Store Hub"
            >
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">DB &amp; Play Store Hub</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            </button>

            {/* DFFEMS API Gateway Button */}
            <button
              type="button"
              onClick={onOpenDffemsGateway}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition-colors"
              title="Inspect DFFEMS API Gateway & Payloads"
            >
              <Globe2 className="w-3.5 h-3.5 text-blue-400" />
              <span>DFFEMS API</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </button>

            {/* Audit Log Trigger */}
            <button
              type="button"
              onClick={onOpenAuditLogs}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition-colors"
              title="Traceable Staff Activity Log"
            >
              <Activity className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Audit Log</span>
            </button>

            {/* WhatsApp Hub Quick Pill */}
            <button
              type="button"
              onClick={() => setActiveTab('whatsapp_hub')}
              className="relative p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors"
              title="Open WhatsApp Group Automations"
            >
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              {whatsappMessages.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-emerald-500 text-slate-900 text-[10px] font-bold px-1.5 py-0.2 rounded-full ring-2 ring-slate-900">
                  {whatsappMessages.length}
                </span>
              )}
            </button>

            {/* Staff Role Switcher */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsStaffMenuOpen(!isStaffMenuOpen)}
                className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors text-left"
              >
                <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs font-semibold text-emerald-400">
                  {currentStaff.name.charAt(0)}
                </div>
                <div className="hidden sm:block text-xs">
                  <div className="font-medium text-white leading-tight">{currentStaff.name}</div>
                  <div className="text-[10px] text-emerald-400 leading-tight">{currentStaff.role}</div>
                </div>
              </button>

              {isStaffMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-xl py-2 z-50">
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                    Switch Active Staff Member
                  </div>
                  {staffOptions.map((opt) => (
                    <button
                      key={opt.name}
                      type="button"
                      onClick={() => {
                        setCurrentStaff(opt);
                        setIsStaffMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-800 transition-colors ${
                        currentStaff.name === opt.name ? 'bg-slate-800/80 text-emerald-400 font-medium' : 'text-slate-300'
                      }`}
                    >
                      <div>
                        <div className="text-white font-medium">{opt.name}</div>
                        <div className="text-[11px] text-slate-400">{opt.role}</div>
                      </div>
                      {currentStaff.name === opt.name && <UserCheck className="w-4 h-4 text-emerald-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
