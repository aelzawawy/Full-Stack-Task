import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/common/Button';
import { apiClient } from '../services/apiClient';

interface DashboardPageProps {
  onLogout: () => void;
}

export const DashboardPage = ({ onLogout }: DashboardPageProps) => {
  const { user, logout } = useAuth();
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isTestingApi, setIsTestingApi] = useState(false);

  const handleLogout = () => {
    logout();
    onLogout();
  };

  const handleTestProtectedEndpoint = async () => {
    setIsTestingApi(true);
    setTestResult(null);
    try {
      const response = await apiClient.get<unknown>('/auth/profile');
      setTestResult(JSON.stringify(response, null, 2));
    } catch (err: unknown) {
      let message = err instanceof Error ? err.message : 'Unknown error';
      if (
        message.toLowerCase().includes('failed to fetch') ||
        message.toLowerCase().includes('networkerror') ||
        message.toLowerCase().includes('load failed')
      ) {
        message = 'Unable to connect to the server. Please verify the backend is running.';
      }
      setTestResult(`Error: ${message}`);
    } finally {
      setIsTestingApi(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-7 sm:p-10 glass-panel rounded-3xl relative overflow-hidden transition-all duration-300">
      {/* Top subtle glow accent line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent"></div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 pb-7 border-b border-white/10">
        <div>
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/50 text-emerald-400 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Authenticated Session
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-3 tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Signed in as <span className="font-semibold text-slate-200">{user?.name}</span>
          </p>
        </div>

        <Button
          onClick={handleLogout}
          variant="danger"
          className="text-xs py-2 px-4 shadow-md"
        >
          Sign Out
        </Button>
      </div>

      {/* User Information Card */}
      <div className="mt-7 neu-raised rounded-2xl p-6 border border-white/5">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
          <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          User Identity & Credentials
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="neu-inset rounded-xl p-3.5 border border-white/5">
            <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold block mb-1">Full Name</span>
            <span className="font-medium text-slate-100">{user?.name || 'N/A'}</span>
          </div>
          <div className="neu-inset rounded-xl p-3.5 border border-white/5">
            <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold block mb-1">Email Address</span>
            <span className="font-medium text-slate-100">{user?.email || 'N/A'}</span>
          </div>
          <div className="neu-inset rounded-xl p-3.5 border border-white/5">
            <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold block mb-1">User ID</span>
            <span className="font-mono text-xs text-indigo-300 break-all">{user?.id || 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Live Protected Endpoint Test Section */}
      <div className="mt-7 p-6 rounded-2xl glass-panel border border-indigo-500/20 bg-indigo-950/20 shadow-[0_4px_24px_rgba(99,102,241,0.08)]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.8)]"></span>
              Verify Protected Route (<code className="text-xs text-indigo-300 font-mono">GET /auth/profile</code>)
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Sends an authenticated HTTP request with JWT Bearer authorization header.
            </p>
          </div>
          <Button
            onClick={handleTestProtectedEndpoint}
            isLoading={isTestingApi}
            className="text-xs py-2 px-4 shrink-0"
          >
            Test Endpoint
          </Button>
        </div>

        {testResult && (
          <div className="mt-5 animate-fadeIn">
            <div className="flex items-center justify-between px-3 py-1.5 bg-slate-950/80 rounded-t-xl border border-b-0 border-white/10 text-[11px] text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/70 inline-block"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70 inline-block"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70 inline-block"></span>
                <span className="ml-2 font-mono text-[11px]">response.json</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-semibold uppercase">200 OK</span>
            </div>
            <pre className="p-4 neu-inset rounded-b-xl text-emerald-400 text-xs font-mono overflow-x-auto border border-white/10">
              {testResult}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
