import React from 'react';
import {
  Building2,
  LayoutDashboard,
  DoorClosed,
  Users,
  CreditCard,
  MessageSquareWarning,
  UserCheck,
  Megaphone,
  Mail,
  User,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ activeTab, setActiveTab, role = 'WARDEN' }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/select-role');
  };
  const isWarden = role === 'WARDEN' || role === 'ADMIN';

  const wardenNavItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'rooms', label: 'Room Management', icon: DoorClosed },
    { id: 'hostellers', label: 'Hostellers', icon: Users },
    { id: 'payments', label: 'Fee Management', icon: CreditCard },
    { id: 'complaints', label: 'Complaints', icon: MessageSquareWarning },
    { id: 'visitors', label: 'Visitor Passes', icon: UserCheck },
    { id: 'notices', label: 'Notices & Alerts', icon: Megaphone },
    { id: 'messages', label: 'Communication', icon: Mail },
  ];

  const studentNavItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'my-room', label: 'My Room', icon: DoorClosed },
    { id: 'payments', label: 'Fee & Payments', icon: CreditCard },
    { id: 'complaints', label: 'Complaints', icon: MessageSquareWarning },
    { id: 'visitors', label: 'Visitor Pass', icon: UserCheck },
    { id: 'notices', label: 'Notices', icon: Megaphone },
    { id: 'messages', label: 'Messages', icon: Mail },
    { id: 'profile', label: 'My Profile', icon: User },
  ];

  const navItems = isWarden ? wardenNavItems : studentNavItems;
  const themeClass = isWarden ? '' : 'teal';

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className={`logo-badge ${themeClass}`}>
          <Building2 size={22} />
        </div>
        <div className="brand-text">
          <h2>HostelHub</h2>
          <p>{isWarden ? 'Owner & Admin Portal' : 'Hosteller Portal'}</p>
        </div>
      </div>

      <div className="sidebar-nav">
        <div className="nav-section-title">Navigation</div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`nav-link ${isActive ? `active ${themeClass}` : ''}`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className="sidebar-footer">
        <div className="user-mini-card">
          <div className={`user-avatar ${themeClass}`}>
            {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="user-details">
            <div className="user-name">{user?.fullName || 'User'}</div>
            <div className="user-role-badge">{user?.role}</div>
          </div>
          <button
            onClick={handleLogout}
            className="btn-logout"
            title="Log out of system"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
