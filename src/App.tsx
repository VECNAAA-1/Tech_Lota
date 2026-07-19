import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { ToastContainer } from './components/Toast';
import type { ToastMessage } from './components/Toast';
import { Sparkles, Mail, Lock, User, Sparkle } from 'lucide-react';


// Pages
import { Dashboard } from './pages/Dashboard';
import { ResumeScreening } from './pages/ResumeScreening';
import { Candidates } from './pages/Candidates';
import { Scheduler } from './pages/Scheduler';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SettingsPage } from './pages/SettingsPage';

const AppContent: React.FC = () => {
  const { activeTab, isAuthenticated, loginUser, registerUser, forgotPassword } = useApp();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Auth screen state
  const [authView, setAuthView] = useState<'login' | 'register' | 'forgot'>('login');
  
  // Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // Register fields
  const [regName, setRegName] = useState('');
  const [regCompany, setRegCompany] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // Forgot password fields
  const [forgotEmail, setForgotEmail] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  const addToast = (title: string, description?: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, type, title, description }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await loginUser(loginEmail, loginPassword, rememberMe);
      addToast('Welcome Back!', 'Login successful.', 'success');
    } catch (err: any) {
      addToast('Login Failed', err.message || 'Check credentials.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await registerUser(regName, regCompany, regEmail, regPassword);
      addToast('Registered Successfully', 'Your account has been created.', 'success');
    } catch (err: any) {
      addToast('Registration Failed', err.message || 'Try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const msg = await forgotPassword(forgotEmail);
      addToast('Reset Link Sent', msg, 'success');
      setAuthView('login');
    } catch (err: any) {
      addToast('Reset Failed', err.message || 'Check email.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const renderActivePage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'screening':
        return <ResumeScreening addToast={addToast} />;
      case 'candidates':
        return <Candidates addToast={addToast} />;
      case 'scheduler':
        return <Scheduler />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'settings':
        return <SettingsPage addToast={addToast} />;
      default:
        return <Dashboard />;
    }
  };

  // 1. Unauthenticated Login/Register Layout
  if (!isAuthenticated) {
    return (
      <div className="auth-wrapper">
        <div className="auth-card glass-card">
          <div className="auth-header">
            <Sparkles className="logo-icon-auth" size={32} />
            <h2>TalentAI <span className="accent">Recruiter</span></h2>
            <p>Enterprise applicant tracking intelligence</p>
          </div>

          {authView === 'login' && (
            <form onSubmit={handleLogin} className="auth-form">
              <div className="form-group">
                <label>Email Address</label>
                <div className="input-with-icon">
                  <Mail size={16} className="input-icon" />
                  <input 
                    type="email" 
                    className="input-field" 
                    placeholder="name@company.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required 
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Password</label>
                <div className="input-with-icon">
                  <Lock size={16} className="input-icon" />
                  <input 
                    type="password" 
                    className="input-field" 
                    placeholder="Enter password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required 
                  />
                </div>
              </div>

              <div className="form-options">
                <label className="remember-me">
                  <input 
                    type="checkbox" 
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>Remember Me</span>
                </label>
                <button type="button" className="forgot-btn" onClick={() => setAuthView('forgot')}>
                  Forgot Password?
                </button>
              </div>

              <button type="submit" className="btn btn-primary auth-submit" disabled={isLoading}>
                {isLoading ? 'Verifying...' : 'Sign In'}
              </button>

              <div className="auth-footer">
                <span>New to TalentAI? </span>
                <button type="button" onClick={() => setAuthView('register')}>Create account</button>
              </div>
            </form>
          )}

          {authView === 'register' && (
            <form onSubmit={handleRegister} className="auth-form">
              <div className="form-group">
                <label>Full Name</label>
                <div className="input-with-icon">
                  <User size={16} className="input-icon" />
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="Saurav Gautam"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    required 
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Company Name</label>
                <div className="input-with-icon">
                  <Sparkle size={16} className="input-icon" />
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="Company Name"
                    value={regCompany}
                    onChange={(e) => setRegCompany(e.target.value)}
                    required 
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Work Email</label>
                <div className="input-with-icon">
                  <Mail size={16} className="input-icon" />
                  <input 
                    type="email" 
                    className="input-field" 
                    placeholder="recruiter@company.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    required 
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Password</label>
                <div className="input-with-icon">
                  <Lock size={16} className="input-icon" />
                  <input 
                    type="password" 
                    className="input-field" 
                    placeholder="Create Password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    required 
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary auth-submit" disabled={isLoading}>
                {isLoading ? 'Creating account...' : 'Create Account'}
              </button>

              <div className="auth-footer">
                <span>Already have an account? </span>
                <button type="button" onClick={() => setAuthView('login')}>Sign In</button>
              </div>
            </form>
          )}

          {authView === 'forgot' && (
            <form onSubmit={handleForgot} className="auth-form">
              <div className="form-group">
                <label>Enter Registered Email</label>
                <div className="input-with-icon">
                  <Mail size={16} className="input-icon" />
                  <input 
                    type="email" 
                    className="input-field" 
                    placeholder="name@company.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required 
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary auth-submit" disabled={isLoading}>
                {isLoading ? 'Sending...' : 'Send Reset Instructions'}
              </button>

              <div className="auth-footer">
                <button type="button" onClick={() => setAuthView('login')}>Back to Sign In</button>
              </div>
            </form>
          )}
        </div>
        <ToastContainer toasts={toasts} onClose={removeToast} />

        <style>{`
          .auth-wrapper {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background-color: var(--bg-primary);
            padding: 24px;
            animation: fadeIn 0.4s ease-out;
          }

          .auth-card {
            max-width: 440px;
            width: 100%;
            padding: 40px 32px;
          }

          .auth-header {
            text-align: center;
            margin-bottom: 32px;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
          }

          .logo-icon-auth {
            color: var(--primary);
            animation: pulse 2s infinite;
          }

          .auth-header h2 {
            font-size: 1.6rem;
            font-weight: 700;
          }

          .auth-header h2 .accent {
            color: var(--primary);
          }

          .auth-header p {
            font-size: 0.82rem;
            color: var(--text-muted);
          }

          .auth-form {
            display: flex;
            flex-direction: column;
            gap: 20px;
          }

          .input-with-icon {
            position: relative;
            display: flex;
            align-items: center;
          }

          .input-icon {
            position: absolute;
            left: 16px;
            color: var(--text-muted);
          }

          .input-with-icon .input-field {
            padding-left: 48px;
          }

          .form-options {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 0.8rem;
          }

          .remember-me {
            display: flex;
            align-items: center;
            gap: 8px;
            color: var(--text-secondary);
            cursor: pointer;
          }

          .forgot-btn {
            background: none;
            border: none;
            color: var(--primary);
            font-weight: 600;
            cursor: pointer;
          }

          .forgot-btn:hover {
            text-decoration: underline;
          }

          .auth-submit {
            width: 100%;
            padding: 14px;
          }

          .auth-footer {
            text-align: center;
            font-size: 0.8rem;
            color: var(--text-secondary);
            margin-top: 10px;
          }

          .auth-footer button {
            background: none;
            border: none;
            color: var(--primary);
            font-weight: 600;
            cursor: pointer;
          }

          .auth-footer button:hover {
            text-decoration: underline;
          }
        `}</style>
      </div>
    );
  }

  // 2. Protected Dashboard Layout (for logged-in users only)
  return (
    <div className="app-container">
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      
      <main className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="page-container">
          <Navbar />
          {renderActivePage()}
        </div>
      </main>

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
};

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
