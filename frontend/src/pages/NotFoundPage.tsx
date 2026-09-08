import { useRouter } from '../hooks/useRouter';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/common/Button';

export const NotFoundPage = () => {
  const { pathname, navigate } = useRouter();
  const { isAuthenticated } = useAuth();

  const handleReturnHome = () => {
    navigate(isAuthenticated ? '/dashboard' : '/signin');
  };

  return (
    <div className="w-full max-w-lg mx-auto p-8 sm:p-12 glass-panel rounded-3xl text-center relative overflow-hidden transition-all duration-300">
      {/* Top subtle glow accent line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"></div>

      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold bg-indigo-950/60 text-indigo-300 border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.25)] mb-5">
        <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse"></span>
        HTTP 404 • ROUTE NOT FOUND
      </div>

      <div className="my-3">
        <div className="text-6xl sm:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-200 to-slate-500 tracking-tight">
          404
        </div>
        <p className="text-sm text-slate-400 mt-2 max-w-sm mx-auto leading-relaxed">
          The requested path <code className="px-2 py-0.5 rounded bg-slate-950/80 border border-white/10 text-indigo-300 text-xs font-mono break-all">{pathname}</code> does not exist on this application.
        </p>
      </div>

      <div className="mt-8 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-center gap-3">
        <Button
          onClick={handleReturnHome}
          variant="primary"
          className="w-full sm:w-auto px-6 py-3 text-sm cursor-pointer shadow-lg"
        >
          {isAuthenticated ? 'Back to Dashboard' : 'Back to Sign In'}
        </Button>
      </div>
    </div>
  );
};
