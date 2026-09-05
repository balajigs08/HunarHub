import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingBag, Heart, MessageSquare, Bell, User, FileText,
  Package, Wrench, BarChart3, Users, Settings, Tag, AlertCircle, X,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { Avatar } from '../ui';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const customerLinks = [
  { to: '/customer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/customer/orders', label: 'My Orders', icon: ShoppingBag },
  { to: '/customer/service-requests', label: 'Service Requests', icon: Wrench },
  { to: '/customer/cart', label: 'My Cart', icon: Package },
  { to: '/customer/complaints', label: 'Complaints', icon: AlertCircle },
  { to: '/notifications', label: 'Notifications', icon: Bell },
  { to: '/profile', label: 'Profile', icon: User },
];

const entrepreneurLinks = [
  { to: '/entrepreneur/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/entrepreneur/services', label: 'My Services', icon: Wrench },
  { to: '/entrepreneur/products', label: 'My Products', icon: Package },
  { to: '/entrepreneur/orders', label: 'Orders', icon: ShoppingBag },
  { to: '/entrepreneur/service-requests', label: 'Service Requests', icon: MessageSquare },
  { to: '/entrepreneur/earnings', label: 'Earnings', icon: BarChart3 },
  { to: '/notifications', label: 'Notifications', icon: Bell },
  { to: '/profile', label: 'Profile', icon: User },
];

const adminLinks = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/entrepreneurs', label: 'Entrepreneurs', icon: Users },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { to: '/admin/service-requests', label: 'Service Requests', icon: Wrench },
  { to: '/admin/categories', label: 'Categories', icon: Tag },
  { to: '/admin/complaints', label: 'Complaints', icon: AlertCircle },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/notifications', label: 'Notifications', icon: Bell },
];

const DashboardSidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, profile } = useAuthStore();

  if (!user) return null;

  const links = user.role === 'admin' ? adminLinks : user.role === 'entrepreneur' ? entrepreneurLinks : customerLinks;
  const avatarSrc = typeof profile?.profileImage === 'string'
    ? profile.profileImage
    : profile?.profileImage?.url || (typeof user.avatar === 'string' ? user.avatar : user.avatar?.url);


  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-100 shadow-lg z-40 flex flex-col transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:static lg:shadow-none lg:z-auto`}
        aria-label="Sidebar navigation"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar src={avatarSrc} name={user.name} size="md" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user.role}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 overflow-y-auto sidebar scrollbar-thin">
          <ul className="space-y-1" role="list">
            {links.map(({ to, label, icon: Icon }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={to.endsWith('dashboard')}
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
                  }
                  onClick={() => window.innerWidth < 1024 && onClose()}
                >
                  <Icon className="w-4.5 h-4.5 flex-shrink-0" />
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer section */}
        <div className="p-4 border-t border-gray-100">
          <NavLink
            to="/profile"
            className={({ isActive }) => `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}
            onClick={() => window.innerWidth < 1024 && onClose()}
          >
            <Settings className="w-4.5 h-4.5" />
            Settings
          </NavLink>
        </div>
      </aside>
    </>
  );
};

export default DashboardSidebar;
