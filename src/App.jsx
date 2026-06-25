import React, { useState, useEffect } from 'react';
import { useApp } from './context/AppContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import StudentDashboard from './pages/StudentDashboard';
import RecruiterDashboard from './pages/RecruiterDashboard';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  const { user, loading } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [authView, setAuthView] = useState('login'); 

  
  useEffect(() => {
    setActiveTab('dashboard');
  }, [user?.role]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
        <p className="mt-4 text-sm font-semibold text-slate-650 dark:text-slate-400">Loading Sky Portal...</p>
      </div>
    );
  }

  
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
        <Header />
        <main className="max-w-7xl mx-auto py-12">
          {authView === 'login' && (
            <Login
              onRegisterClick={() => setAuthView('register')}
              onForgotClick={() => setAuthView('forgot')}
            />
          )}
          {authView === 'register' && (
            <Register onLoginClick={() => setAuthView('login')} />
          )}
          {authView === 'forgot' && (
            <ForgotPassword onLoginClick={() => setAuthView('login')} />
          )}
        </main>
      </div>
    );
  }

  
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-200 text-slate-800 dark:text-slate-200">
      
      {}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {}
        <Header onMenuClick={() => setSidebarOpen(true)} />

        {}
        <main className="flex-1 overflow-y-auto p-6 focus:outline-none">
          <div className="max-w-7xl mx-auto">
            {user.role === 'student' && <StudentDashboard activeTab={activeTab} />}
            {user.role === 'recruiter' && (
              <RecruiterDashboard activeTab={activeTab} setActiveTab={setActiveTab} />
            )}
            {user.role === 'admin' && <AdminDashboard activeTab={activeTab} />}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
