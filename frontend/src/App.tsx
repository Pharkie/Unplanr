import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DarkModeProvider } from './contexts/DarkModeContext';
import { LoginPage } from './components/LoginPage';
import { Dashboard } from './components/Dashboard';
import { SpeedInsights } from '@vercel/speed-insights/react';

function AppContent() {
  const { authenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent dark:border-blue-400"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return authenticated ? <Dashboard /> : <LoginPage />;
}

function App() {
  return (
    <DarkModeProvider>
      <AuthProvider>
        <AppContent />
        <SpeedInsights />
      </AuthProvider>
    </DarkModeProvider>
  );
}

export default App;
