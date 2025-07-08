import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from './store/auth';
import { useThemeStore } from './store/theme';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import { ToastProvider } from './contexts/ToastContext';

// Auth Pages
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';

// Main Pages
import Dashboard from './pages/Dashboard/Dashboard';
import Tasks from './pages/Tasks/Tasks';
import Interview from './pages/Interview/Interview';
import Progress from './pages/Progress/Progress';
import Ranking from './pages/Ranking/Ranking';
import Community from './pages/Community/Community';
import { AI } from './pages/AI/AI';

// Profile Pages
import { Profile as ViewProfile } from './pages/Profile/Profile';
import { EditProfile } from './pages/Profile/EditProfile';

// Settings Pages
import NotificationSettings from './pages/Settings/NotificationSettings';

// Finance Pages
import FinanceDashboard from './pages/Finance/FinanceDashboard';
import WalletPage from './pages/Finance/WalletPage';
import PaymentMethodsPage from './pages/Finance/PaymentMethodsPage';
import GoalsPage from './pages/Finance/GoalsPage';
import BudgetsPage from './pages/Finance/BudgetsPage';

function App() {
  const { isAuthenticated } = useAuthStore();
  const { theme } = useThemeStore();

  React.useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return (
    <ToastProvider>
      <div className={`min-h-screen transition-colors duration-200 ${
        theme === 'dark' ? 'dark' : ''
      }`}>
        <Routes>
            {/* Public Routes */}
            <Route 
              path="/login" 
              element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} 
            />
            <Route 
              path="/register" 
              element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />} 
            />

            {/* Protected Routes */}
            <Route path="/" element={<ProtectedRoute><Layout><Outlet /></Layout></ProtectedRoute>}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="tasks" element={<Tasks />} />
              <Route path="interview" element={<Interview />} />
              <Route path="progress" element={<Progress />} />
              <Route path="ranking" element={<Ranking />} />
              <Route path="community" element={<Community />} />
              <Route path="ai" element={<AI />} />
              <Route path="finance" element={<FinanceDashboard />} />
              <Route path="wallet" element={<WalletPage />} />
              <Route path="payment-methods" element={<PaymentMethodsPage />} />
              <Route path="goals" element={<GoalsPage />} />
              <Route path="budgets" element={<BudgetsPage />} />
              
              {/* Profile Routes */}
              <Route path="profile">
                <Route index element={<ViewProfile />} />
                <Route path="edit" element={<EditProfile />} />
              </Route>
              
              {/* Settings Routes */}
              <Route path="settings">
                <Route path="notifications" element={<NotificationSettings />} />
              </Route>
            </Route>

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
    </ToastProvider>
  );
}

export default App; 
