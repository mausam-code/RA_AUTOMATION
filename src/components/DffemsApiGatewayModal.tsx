import React, { useState, useEffect } from 'react';
import { dffemsApi, DffemsConfig } from '../services/dffemsApiService';
import { DffemsApiRecord } from '../types';
import {
  Globe2,
  Server,
  Code2,
  CheckCircle2,
  Copy,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

export const DffemsApiGatewayModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const [config, setConfig] = useState<DffemsConfig>(dffemsApi.getConfig());
  const [logs, setLogs] = useState<DffemsApiRecord[]>(dffemsApi.getLogs());
  const [selectedLog, setSelectedLog] = useState<DffemsApiRecord | null>(logs[0] || null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setLogs(dffemsApi.getLogs());
    const unsubscribe = dffemsApi.onLog(() => {
      setLogs(dffemsApi.getLogs());
    });
    return unsubscribe;
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopyPayload = (payload: any) => {
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    dffemsApi.setConfig(config);
    alert('DFFEMS Gateway configuration updated successfully!');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-scale-in">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-950 text-blue-400 border border-blue-800 rounded-lg">
              <Globe2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">DFFEMS API Gateway & Mock Engine</h3>
                <span className="px-2 py-0.5 text-[10px] font-mono uppercase bg-emerald-950 text-emerald-400 border border-emerald-800 rounded">
                  Generic Mode
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Inspect outbound government payloads and generic acknowledged responses ready for live API integration.
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

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Gateway Endpoint Configuration */}
          <form
            onSubmit={handleSaveConfig}
            className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3"
          >
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
              <span className="flex items-center gap-1.5">
                <Server className="w-4 h-4 text-emerald-400" />
                DFFEMS Server Endpoint Configuration
              </span>
              <span className="text-[11px] text-slate-500">Easily swap for live ministry endpoint</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[11px] text-slate-400 mb-1">Base URL</label>
                <input
                  type="text"
                  value={config.baseUrl}
                  onChange={(e) => setConfig({ ...config, baseUrl: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Agency License Code</label>
                <input
                  type="text"
                  value={config.agencyCode}
                  onChange={(e) => setConfig({ ...config, agencyCode: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400">Environment:</span>
                <select
                  value={config.environment}
                  onChange={(e) => setConfig({ ...config, environment: e.target.value as any })}
                  className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                >
                  <option value="MOCK_SANDBOX">MOCK_SANDBOX (Generic Success Simulator)</option>
                  <option value="PRODUCTION_GATEWAY">PRODUCTION_GATEWAY (Live Webhook)</option>
                </select>
              </div>

              <button
                type="submit"
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold"
              >
                Save Settings
              </button>
            </div>
          </form>

          {/* Transaction History & Inspector */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Logs List */}
            <div className="md:col-span-5 bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-2 max-h-[340px] overflow-y-auto">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
                API Calls Dispatched ({logs.length})
              </div>
              {logs.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500">No API calls recorded yet.</div>
              ) : (
                logs.map((log) => (
                  <button
                    key={log.id}
                    type="button"
                    onClick={() => setSelectedLog(log)}
                    className={`w-full text-left p-2.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                      selectedLog?.id === log.id
                        ? 'bg-slate-800 border-blue-500 text-white'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-850'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] text-emerald-400 font-bold">{log.method}</span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="font-medium text-white truncate mt-0.5">
                      {log.endpoint.replace(config.baseUrl, '')}
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center justify-between mt-1">
                      <span>Status: {log.responseStatus} OK</span>
                      <span className="text-emerald-400 font-mono">ACKNOWLEDGED</span>
                    </div>
                  </button>
                ))
              )}
            </div>

            {/* Payload Inspector on Right */}
            <div className="md:col-span-7 bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
              {selectedLog ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="text-xs font-bold text-white font-mono">
                      Payload: {selectedLog.endpoint}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyPayload(selectedLog.requestPayload)}
                      className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copied ? 'Copied!' : 'Copy JSON'}</span>
                    </button>
                  </div>

                  <div>
                    <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Request Payload (Outbound to DFFEMS):
                    </div>
                    <pre className="text-[11px] font-mono text-emerald-300 bg-slate-900 p-2.5 rounded-lg max-h-[120px] overflow-y-auto whitespace-pre-wrap border border-slate-800">
                      {JSON.stringify(selectedLog.requestPayload, null, 2)}
                    </pre>
                  </div>

                  <div>
                    <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Generic Acknowledged Response:
                    </div>
                    <pre className="text-[11px] font-mono text-blue-300 bg-slate-900 p-2.5 rounded-lg max-h-[120px] overflow-y-auto whitespace-pre-wrap border border-slate-800">
                      {JSON.stringify(selectedLog.responseData, null, 2)}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-slate-500">
                  Select an API call on the left to inspect outbound payloads and responses.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Generic DFFEMS integration simulator ready for live deployment.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
