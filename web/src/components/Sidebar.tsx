import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  Layers,
  Settings,
  FileClock,
  LogOut,
  Calendar,
  ClipboardList
} from 'lucide-react';

interface SidebarProps {
  role: 'ADMIN' | 'DOCTOR';
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Sidebar({ role, activeTab, setActiveTab }: SidebarProps) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const adminNav = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', label: 'User Directory', icon: Users },
    { id: 'nurses', label: 'Nurse Verification', icon: CheckSquare },
    { id: 'doctors', label: 'Doctor Verification', icon: CheckSquare },
    { id: 'marketplace', label: 'Marketplace Monitor', icon: Layers },
    { id: 'config', label: 'Platform Config', icon: Settings },
    { id: 'audit', label: 'Audit Logs', icon: FileClock },
  ];

  const doctorNav = [
    { id: 'dashboard', label: 'Case Queue', icon: ClipboardList },
    { id: 'homevisits', label: 'Home Visits', icon: Calendar },
  ];

  const navItems = role === 'ADMIN' ? adminNav : doctorNav;

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">H</div>
        <div>
          <div className="sidebar-logo-text">Healix</div>
          <div className="sidebar-logo-sub">{role === 'ADMIN' ? 'Operations' : 'Doctor Portal'}</div>
        </div>
      </div>

      <div className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <Icon className="nav-icon" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className="sidebar-footer">
        <div className="user-card" style={{ marginBottom: '8px' }}>
          <div className="user-avatar">
            {user?.fullName?.slice(0, 2).toUpperCase() || 'U'}
          </div>
          <div>
            <div className="user-name">{user?.fullName || 'User'}</div>
            <div className="user-role">{user?.role}</div>
          </div>
        </div>
        <button className="nav-item" onClick={handleLogout} style={{ color: 'var(--red)' }}>
          <LogOut className="nav-icon" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}
