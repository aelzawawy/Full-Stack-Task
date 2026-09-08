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
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent shadow-[0_0_20px_rgba(99,102,241,0.5)]"></div>
        <p className="mt-4 text-sm font-medium text-slate-400">Initializing session...</p>
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
        <div className="w-9 h-9 rounded-xl neu-raised flex items-center justify-center text-indigo-400 font-bold text-base border border-white/10 shadow-[0_0_15px_rgba(99,102,241,0.3)] group-hover:scale-105 transition-transform">
          A
        </div>
        <div>
          <h1 className="text-base font-bold text-white tracking-tight leading-tight flex items-center gap-2">
            AuthCore
          </h1>
          <p className="text-[11px] text-slate-400 font-medium">React 19 + NestJS + MongoDB</p>
        </div>
      </div>
    </header>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider>
        <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col justify-between relative overflow-x-hidden selection:bg-indigo-500/30 selection:text-indigo-200">
          {/* Ambient Glowing Background Orbs for Glass Refraction */}
          <div className="fixed top-12 left-[-5%] w-[420px] h-[420px] bg-indigo-600/15 rounded-full blur-[110px] pointer-events-none animate-float-slow -z-10" />
          <div className="fixed top-1/3 right-[-5%] w-[400px] h-[400px] bg-purple-600/15 rounded-full blur-[110px] pointer-events-none animate-float-reverse -z-10" />
          <div className="fixed bottom-[-5%] left-1/3 w-[450px] h-[450px] bg-cyan-600/10 rounded-full blur-[130px] pointer-events-none -z-10" />

          {/* Top Navbar */}
          <HeaderBar />

          {/* Main Content Area */}
          <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-14 relative z-10">
            <MainContent />
          </main>

          {/* Footer */}
          <footer className="w-full py-4 text-center text-xs text-slate-500 glass-footer">
            Production-Ready Full Stack Authentication • Built with React 19, TypeScript, and NestJS
          </footer>
        </div>
      </RouterProvider>
    </AuthProvider>
  );
}
