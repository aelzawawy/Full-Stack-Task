import { useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { RouterProvider } from './context/RouterContext';
import { useAuth } from './hooks/useAuth';
import { useRouter } from './hooks/useRouter';
import { SignupPage } from './pages/SignupPage';
import { SigninPage } from './pages/SigninPage';
import { DashboardPage } from './pages/DashboardPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ProtectedRoute } from './components/ProtectedRoute';

function MainContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const { pathname, navigate } = useRouter();

  // Root redirect: '/' -> '/dashboard' if authenticated, else '/signin'
  useEffect(() => {
    if (!isLoading && pathname === '/') {
      navigate(isAuthenticated ? '/dashboard' : '/signin', true);
    }
  }, [isLoading, isAuthenticated, pathname, navigate]);

  // Guest guard: If already authenticated and trying to access /signin or /signup -> redirect to /dashboard
  useEffect(() => {
    if (!isLoading && isAuthenticated && (pathname === '/signin' || pathname === '/signup')) {
      navigate('/dashboard', true);
    }
  }, [isLoading, isAuthenticated, pathname, navigate]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-11 w-11 border-3 border-[#e0829d] border-t-transparent shadow-[0_0_20px_rgba(224,130,157,0.3)]"></div>
        <p className="mt-4 text-sm font-medium text-[#dac4d0]/80">Initializing session...</p>
      </div>
    );
  }

  // URL-driven Route Switcher
  switch (pathname) {
    case '/':
      return null;
    case '/signin':
      return (
        <SigninPage
          onNavigateToSignup={() => navigate('/signup')}
          onSigninSuccess={() => navigate('/dashboard')}
        />
      );
    case '/signup':
      return (
        <SignupPage
          onNavigateToSignin={() => navigate('/signin')}
          onSignupSuccess={() => navigate('/dashboard')}
        />
      );
    case '/dashboard':
      return (
        <ProtectedRoute>
          <DashboardPage onLogout={() => navigate('/signin')} />
        </ProtectedRoute>
      );
    default:
      return <NotFoundPage />;
  }
}

function HeaderBar() {
  const { isAuthenticated } = useAuth();
  const { navigate } = useRouter();

  return (
    <header className="w-full glass-header sticky top-0 z-20 px-4 sm:px-8 py-3.5 flex items-center justify-between">
      <div
        onClick={() => navigate(isAuthenticated ? '/dashboard' : '/signin')}
        className="flex items-center gap-3 cursor-pointer group"
      >
        <div className="w-9 h-9 rounded-xl bg-[#e0829d]/10 border border-[#e0829d]/30 flex items-center justify-center text-[#e0829d] font-bold text-base shadow-[0_0_12px_rgba(224,130,157,0.2)] group-hover:border-[#e0829d]/50 group-hover:scale-105 transition-all">
          A
        </div>
        <div>
          <h1 className="text-base font-bold text-white tracking-tight leading-tight flex items-center gap-2">
            AuthCore
          </h1>
          <p className="text-[11px] text-[#dac4d0]/80 font-medium">React 19 + NestJS + MongoDB</p>
        </div>
      </div>
    </header>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider>
        <div className="min-h-screen bg-[#0d1e1a] text-slate-100 flex flex-col justify-between relative overflow-x-hidden selection:bg-[#e0829d]/30 selection:text-[#f7eff4]">
          {/* Ambient Floating Blurred Orbs Behind Panel */}
          <div className="fixed top-[20%] left-[8%] w-[480px] h-[480px] bg-[#036264]/22 rounded-full blur-[130px] pointer-events-none animate-float-slow" />
          <div className="fixed top-[30%] right-[8%] w-[440px] h-[440px] bg-[#8f5774]/20 rounded-full blur-[130px] pointer-events-none animate-float-reverse" />
          <div className="fixed bottom-[12%] left-[28%] w-[420px] h-[420px] bg-[#e0829d]/14 rounded-full blur-[140px] pointer-events-none animate-float-gentle" />

          {/* Top Navbar */}
          <HeaderBar />

          {/* Main Content Area */}
          <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-14 relative z-10">
            <MainContent />
          </main>

          {/* Footer */}
          <footer className="w-full py-4 text-center text-xs text-[#dac4d0]/60 glass-footer">
            Production-Ready Full Stack Authentication • Built with React 19, TypeScript, and NestJS
          </footer>
        </div>
      </RouterProvider>
    </AuthProvider>
  );
}
