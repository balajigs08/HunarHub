import React from 'react';
import { Package, Users, Search, ShoppingBag, MessageSquare, FileText } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: 'package' | 'users' | 'search' | 'cart' | 'chat' | 'document';
  action?: { label: string; onClick: () => void };
}

const iconMap = {
  package: Package,
  users: Users,
  search: Search,
  cart: ShoppingBag,
  chat: MessageSquare,
  document: FileText,
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'Nothing here yet', description = 'There is no data to display.', icon = 'package', action
}) => {
  const Icon = iconMap[icon];
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-700 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 max-w-sm mb-6">{description}</p>
      {action && (
        <button onClick={action.onClick} className="btn-primary">
          {action.label}
        </button>
      )}
    </div>
  );
};

export const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizeMap = { sm: 'w-4 h-4 border-2', md: 'w-8 h-8 border-3', lg: 'w-12 h-12 border-4' };
  return (
    <div
      className={`${sizeMap[size]} border-primary-200 border-t-primary-600 rounded-full animate-spin`}
      role="status"
      aria-label="Loading"
    />
  );
};

export const PageLoader: React.FC = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="text-center">
      <LoadingSpinner size="lg" />
      <p className="mt-4 text-sm text-gray-500">Loading...</p>
    </div>
  </div>
);

export const SkeletonCard: React.FC = () => (
  <div className="card p-4 animate-pulse">
    <div className="skeleton h-48 rounded-lg mb-4" />
    <div className="skeleton h-4 w-3/4 mb-2" />
    <div className="skeleton h-3 w-1/2 mb-4" />
    <div className="skeleton h-8 w-full" />
  </div>
);

export const ErrorState: React.FC<{ message?: string; onRetry?: () => void }> = ({
  message = 'Something went wrong.', onRetry
}) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
      <span className="text-2xl">⚠️</span>
    </div>
    <h3 className="text-lg font-semibold text-gray-700 mb-2">Oops! Something went wrong</h3>
    <p className="text-sm text-gray-500 max-w-sm mb-6">{message}</p>
    {onRetry && (
      <button onClick={onRetry} className="btn-primary">Try Again</button>
    )}
  </div>
);

export const Badge: React.FC<{
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'gray';
  size?: 'sm' | 'md';
}> = ({ children, variant = 'gray', size = 'md' }) => {
  const variantMap = {
    success: 'badge-success',
    warning: 'badge-warning',
    danger: 'badge-danger',
    info: 'badge-info',
    gray: 'badge-gray',
  };
  return (
    <span className={`badge ${variantMap[variant]} ${size === 'sm' ? 'text-xs px-2 py-0.5' : ''}`}>
      {children}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const config: Record<string, { variant: 'success' | 'warning' | 'danger' | 'info' | 'gray'; label: string }> = {
    pending: { variant: 'warning', label: 'Pending' },
    accepted: { variant: 'info', label: 'Accepted' },
    confirmed: { variant: 'info', label: 'Confirmed' },
    in_progress: { variant: 'info', label: 'In Progress' },
    processing: { variant: 'info', label: 'Processing' },
    ready: { variant: 'success', label: 'Ready' },
    completed: { variant: 'success', label: 'Completed' },
    rejected: { variant: 'danger', label: 'Rejected' },
    cancelled: { variant: 'danger', label: 'Cancelled' },
    active: { variant: 'success', label: 'Active' },
    inactive: { variant: 'gray', label: 'Inactive' },
    approved: { variant: 'success', label: 'Approved' },
    suspended: { variant: 'danger', label: 'Suspended' },
    open: { variant: 'warning', label: 'Open' },
    in_review: { variant: 'info', label: 'In Review' },
    resolved: { variant: 'success', label: 'Resolved' },
    closed: { variant: 'gray', label: 'Closed' },
    paid: { variant: 'success', label: 'Paid' },
    failed: { variant: 'danger', label: 'Failed' },
  };

  const cfg = config[status] || { variant: 'gray' as const, label: status };
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
};

export const Avatar: React.FC<{ src?: string; name?: string; size?: 'sm' | 'md' | 'lg' | 'xl' }> = ({
  src, name = 'User', size = 'md'
}) => {
  const sizeMap = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-14 h-14 text-base', xl: 'w-20 h-20 text-xl' };
  const safeName = name || 'User';
  const initials = safeName.split(' ').filter(Boolean).slice(0, 2).map((n) => n[0]).join('').toUpperCase() || 'U';

  return (
    <div className={`${sizeMap[size]} rounded-full overflow-hidden flex items-center justify-center bg-primary-100 text-primary-700 font-semibold flex-shrink-0`}>
      {src ? (
        <img src={src} alt={safeName} className="w-full h-full object-cover" loading="lazy" />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
};
