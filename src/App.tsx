/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { StageNavigation } from './components/StageNavigation';
import { RawCompaniesIntake } from './components/RawCompaniesIntake';
import { PrePermissionStage } from './components/PrePermissionStage';
import { ApprovedPrePermissionStage } from './components/ApprovedPrePermissionStage';
import { InterviewDffemsStage } from './components/InterviewDffemsStage';
import { ManageListStage } from './components/ManageListStage';
import { TicketingStage } from './components/TicketingStage';
import { AuditingAccountingStage } from './components/AuditingAccountingStage';
import { WhatsAppHub } from './components/WhatsAppHub';
import { MobileCompanionView } from './components/MobileCompanionView';
import { CvPreviewModal } from './components/CvPreviewModal';
import { EmailGeneratorModal } from './components/EmailGeneratorModal';
import { AuditLogModal } from './components/AuditLogModal';
import { DffemsApiGatewayModal } from './components/DffemsApiGatewayModal';
import { DeploymentDbHubModal } from './components/DeploymentDbHubModal';
import { Candidate, CompanyDemand } from './types';

function MainAppContent() {
  const { activeTab, viewMode, demands, candidates, activeLotId } = useApp();

  // Modals state
  const [selectedCvCandidate, setSelectedCvCandidate] = useState<Candidate | null>(null);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailModalLot, setEmailModalLot] = useState<CompanyDemand | null>(null);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isDffemsGatewayOpen, setIsDffemsGatewayOpen] = useState(false);
  const [isDeploymentModalOpen, setIsDeploymentModalOpen] = useState(false);

  const currentLot = demands.find((d) => d.id === activeLotId) || demands[0];
  const lotCandidates = candidates.filter((c) => c.lotId === currentLot.id);

  const handleOpenEmailModal = (lot: CompanyDemand, cands: Candidate[]) => {
    setEmailModalLot(lot);
    setIsEmailModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-600 selection:text-white">
      {/* Top Application Bar */}
      <Header
        onOpenAuditLogs={() => setIsAuditModalOpen(true)}
        onOpenDffemsGateway={() => setIsDffemsGatewayOpen(true)}
        onOpenDeploymentHub={() => setIsDeploymentModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {viewMode === 'mobile_companion' ? (
          <div>
            <div className="text-center mb-4">
              <span className="text-xs uppercase font-mono tracking-wider text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-3 py-1 rounded-full">
                Mobile Field Staff App Mode Active
              </span>
            </div>
            <MobileCompanionView />
          </div>
        ) : (
          <>
            {/* Stage Navigation Bar */}
            <StageNavigation />

            {/* Dynamic Stage View */}
            {activeTab === 'raw_companies' && (
              <RawCompaniesIntake
                onOpenCvModal={(cand) => setSelectedCvCandidate(cand)}
                onOpenEmailModal={handleOpenEmailModal}
              />
            )}

            {activeTab === 'pre_permission' && <PrePermissionStage />}

            {activeTab === 'pre_permission_approved' && <ApprovedPrePermissionStage />}

            {activeTab === 'dffems_interview' && <InterviewDffemsStage />}

            {activeTab === 'manage_candidate_list' && <ManageListStage />}

            {activeTab === 'ticketing' && <TicketingStage />}

            {activeTab === 'auditing_accounting' && <AuditingAccountingStage />}

            {activeTab === 'whatsapp_hub' && <WhatsAppHub />}
          </>
        )}
      </main>

      {/* Footer info bar */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            Foreign Employment Information Management System (DFFEMS / FEIMS) Automation Suite
          </div>
          <div className="text-[11px] font-mono text-slate-400">
            Biometric OCR · WhatsApp Dispatch (10:00 AM & 5:00 PM) · Double-Entry Ledger · OTP Verified
          </div>
        </div>
      </footer>

      {/* Global Modals */}
      <CvPreviewModal
        candidate={selectedCvCandidate}
        onClose={() => setSelectedCvCandidate(null)}
      />

      <EmailGeneratorModal
        isOpen={isEmailModalOpen}
        lot={emailModalLot}
        candidates={lotCandidates}
        onClose={() => setIsEmailModalOpen(false)}
      />

      <AuditLogModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
      />

      <DeploymentDbHubModal
        isOpen={isDeploymentModalOpen}
        onClose={() => setIsDeploymentModalOpen(false)}
      />

      <DffemsApiGatewayModal
        isOpen={isDffemsGatewayOpen}
        onClose={() => setIsDffemsGatewayOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
