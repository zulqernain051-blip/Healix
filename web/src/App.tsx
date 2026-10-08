import Operations from './pages/admin/Operations';
import Analytics from './pages/Analytics';
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/auth';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import AccountSecurity from './pages/AccountSecurity';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import NurseVerification from './pages/admin/NurseVerification';
import DoctorVerification from './pages/admin/DoctorVerification';
import MarketplaceMonitor from './pages/admin/Marketplace';
import PlatformConfig from './pages/admin/Config';
import AuditLogs from './pages/admin/AuditLogs';

// Doctor Pages
import DoctorDashboard from './pages/doctor/Dashboard';
import HomeVisits from './pages/doctor/HomeVisits';
import CaseReview from './pages/doctor/CaseReview';
import EmergencyOperations from './pages/EmergencyOperations';

import './styles/index.css';

function ProtectedRoute({ children, role }: { children: React.ReactNode; role?: 'ADMIN' | 'DOCTOR' }) {
  const { token, user } = useAuthStore();
  if (!token || !user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AdminLayout() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="app-layout">
      <Sidebar role="ADMIN" activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="main-content">
        {activeTab === 'dashboard' && <AdminDashboard />}
        {activeTab === 'users' && <AdminUsers />}
        {activeTab === 'operations' && <Operations />}
        {activeTab === 'nurses' && <NurseVerification />}
        {activeTab === 'doctors' && <DoctorVerification />}
        {activeTab === 'marketplace' && <MarketplaceMonitor />}
        {activeTab === 'config' && <PlatformConfig />}
        {activeTab === 'audit' && <AuditLogs />}
        {activeTab === 'emergency' && <EmergencyOperations />}
        {activeTab === 'security' && <AccountSecurity />}
        {activeTab === 'analytics' && <Analytics />}
      </main>
    </div>
  );
}

function DoctorLayout() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);

  return (
    <div className="app-layout">
      <Sidebar role="DOCTOR" activeTab={activeTab} setActiveTab={tab => { setSelectedCaseId(null); setActiveTab(tab); }} />
      <main className="main-content">
        {selectedCaseId ? (
          <CaseReview caseId={selectedCaseId} onBack={() => setSelectedCaseId(null)} />
        ) : (
          <>
            {activeTab === 'dashboard' && <DoctorDashboard onSelectCase={setSelectedCaseId} />}
            {activeTab === 'homevisits' && <HomeVisits />}
            {activeTab === 'emergency' && <EmergencyOperations />}
        {activeTab === 'security' && <AccountSecurity />}
        {activeTab === 'analytics' && <Analytics />}
          </>
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="ADMIN">
              <AdminLayout />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor"
          element={
            <ProtectedRoute role="DOCTOR">
              <DoctorLayout />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
