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
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold bg-[#8f5774]/20 text-[#f5b6c7] border border-[#8f5774]/40 shadow-[0_0_12px_rgba(143,87,116,0.25)] mb-5">
        <span className="w-2 h-2 rounded-full bg-[#e0829d] animate-pulse"></span>
        HTTP 404 • ROUTE NOT FOUND
      </div>

      <div className="my-3">
        <div className="text-6xl sm:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-[#dac4d0] to-[#8f5774] tracking-tight">
          404
        </div>
        <p className="text-sm text-[#dac4d0]/80 mt-2 max-w-sm mx-auto leading-relaxed">
          The requested path <code className="px-2 py-0.5 rounded bg-[#0b1c18] border border-[#dac4d0]/15 text-[#e0829d] text-xs font-mono break-all">{pathname}</code> does not exist on this application.
        </p>
      </div>

      <div className="mt-8 pt-6 border-t border-[#dac4d0]/10 flex flex-col sm:flex-row items-center justify-center gap-3">
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
