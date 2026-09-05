import React from 'react';
import { User, Mail, Phone, ShieldCheck, MapPin, Briefcase } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export const ProfilePage: React.FC = () => {
  const { user } = useAuthStore();

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="bg-white p-8 sm:p-10 rounded-3xl border border-gray-100 shadow-sm space-y-6">
        <div className="flex items-center gap-6 pb-6 border-b border-gray-100">
          <div className="w-20 h-20 bg-indigo-600 text-white font-black text-2xl rounded-3xl flex items-center justify-center shadow-lg">
            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold uppercase mb-1">
              {user.role} Account
            </span>
            <h1 className="text-2xl font-black text-gray-900">{user.name}</h1>
            <p className="text-gray-500 text-sm">{user.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
          <div className="p-4 bg-gray-50 rounded-2xl flex items-center gap-3">
            <Mail className="w-5 h-5 text-gray-400" />
            <div>
              <span className="text-xs text-gray-400 font-bold block">Email Address</span>
              <span className="font-semibold text-gray-800">{user.email}</span>
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-2xl flex items-center gap-3">
            <Phone className="w-5 h-5 text-gray-400" />
            <div>
              <span className="text-xs text-gray-400 font-bold block">Phone Number</span>
              <span className="font-semibold text-gray-800">{user.phone || 'Not provided'}</span>
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-2xl flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-green-500" />
            <div>
              <span className="text-xs text-gray-400 font-bold block">Verification Status</span>
              <span className="font-semibold text-green-700 capitalize">{user.isVerified ? 'Verified' : 'Standard User'}</span>
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-2xl flex items-center gap-3">
            <Briefcase className="w-5 h-5 text-gray-400" />
            <div>
              <span className="text-xs text-gray-400 font-bold block">Account Type</span>
              <span className="font-semibold text-gray-800 capitalize">{user.role}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
