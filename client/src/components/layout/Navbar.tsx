import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingCart, Bell, Menu, X, User, LogOut, ChevronDown, Store } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { useNotificationStore } from '../../store/notificationStore';
import { Avatar } from '../ui';
import toast from 'react-hot-toast';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { getTotalItems } = useCartStore();
  const { unreadCount } = useNotificationStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully.');
    navigate('/');
    setUserMenuOpen(false);
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    if (user.role === 'admin') return '/admin/dashboard';
    if (user.role === 'entrepreneur') return '/entrepreneur/dashboard';
    return '/customer/dashboard';
  };

  const navLinks = [
    { to: '/marketplace', label: 'Marketplace' },
    { to: '/artisans', label: 'Artisans' },
    { to: '/categories', label: 'Categories' },
    { to: '/about', label: 'About' },
  ];

  const cartCount = getTotalItems();

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm" role="navigation" aria-label="Main navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5" aria-label="HunarHub Home">
            <div className="w-8 h-8 hero-gradient rounded-lg flex items-center justify-center">
              <Store className="w-4.5 h-4.5 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-display font-bold text-xl text-gradient">HunarHub</span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? 'text-primary-700 bg-primary-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {isAuthenticated && user ? (
              <>
                {/* Cart (customers only) */}
                {user.role === 'customer' && (
                  <Link
                    to="/customer/cart"
                    className="relative p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                    aria-label={`Shopping cart, ${cartCount} items`}
                  >
                    <ShoppingCart className="w-5 h-5" />
                    {cartCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center">
                        {cartCount > 9 ? '9+' : cartCount}
                      </span>
                    )}
                  </Link>
                )}

                {/* Notifications */}
                <button
                  onClick={() => { setNotifOpen(!notifOpen); navigate('/notifications'); }}
                  className="relative p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                  aria-label={`Notifications, ${unreadCount} unread`}
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* User Menu */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                    aria-expanded={userMenuOpen}
                    aria-haspopup="menu"
                    id="user-menu-button"
                  >
                    <Avatar src={typeof user.avatar === 'string' ? user.avatar : user.avatar?.url} name={user.name} size="sm" />
                    <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-[120px] truncate">
                      {user.name.split(' ')[0]}
                    </span>
                    <ChevronDown className={`hidden sm:block w-4 h-4 text-gray-500 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {userMenuOpen && (
                    <div
                      className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-1 animate-fade-in"
                      role="menu"
                      aria-labelledby="user-menu-button"
                    >
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        <span className="badge badge-info mt-1 capitalize">{user.role}</span>
                      </div>

                      <div className="py-1">
                        <Link
                          to={getDashboardLink()}
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          role="menuitem"
                        >
                          <User className="w-4 h-4" />
                          Dashboard
                        </Link>
                        <Link
                          to="/profile"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          role="menuitem"
                        >
                          <User className="w-4 h-4" />
                          My Profile
                        </Link>
                      </div>

                      <div className="py-1 border-t border-gray-100">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full"
                          role="menuitem"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-secondary text-sm px-4 py-2 hidden sm:inline-flex">
                  Sign In
                </Link>
                <Link to="/register" className="btn-primary text-sm px-4 py-2">
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
              aria-label="Toggle mobile menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-100 py-3 animate-slide-up">
            {navLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `block px-3 py-2.5 rounded-lg text-sm font-medium mb-1 ${
                    isActive ? 'text-primary-700 bg-primary-50' : 'text-gray-600 hover:bg-gray-50'
                  }`
                }
                onClick={() => setMobileOpen(false)}
              >
                {label}
              </NavLink>
            ))}
            {!isAuthenticated && (
              <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                <Link to="/login" className="btn-secondary flex-1 text-center text-sm" onClick={() => setMobileOpen(false)}>Sign In</Link>
                <Link to="/register" className="btn-primary flex-1 text-center text-sm" onClick={() => setMobileOpen(false)}>Get Started</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
