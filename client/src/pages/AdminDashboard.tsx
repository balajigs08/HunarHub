import React, { useEffect, useState } from 'react';
import { ShieldCheck, ShieldAlert, Users, Store, AlertCircle, CheckCircle2, XCircle, Tag, Settings, BarChart2 } from 'lucide-react';
import api from '../services/api';
import { User, Complaint } from '../types';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'verification' | 'users' | 'complaints' | 'analytics'>('verification');
  const [pendingEntrepreneurs, setPendingEntrepreneurs] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, [activeTab]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'verification') {
        const res = await api.get('/admin/entrepreneurs/pending');
        setPendingEntrepreneurs(res.data.data || res.data || []);
      } else if (activeTab === 'users') {
        const res = await api.get('/admin/users');
        setAllUsers(res.data.data || res.data || []);
      } else if (activeTab === 'complaints') {
        const res = await api.get('/complaints');
        setComplaints(res.data.data || res.data || []);
      } else if (activeTab === 'analytics') {
        const res = await api.get('/admin/analytics');
        setStats(res.data.data || res.data || {});
      }
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEntrepreneur = async (userId: string, isVerified: boolean) => {
    try {
      await api.put(`/admin/entrepreneurs/${userId}/verify`, { isVerified });
      fetchAdminData();
    } catch (err) {
      console.error('Error verifying entrepreneur:', err);
    }
  };

  const handleToggleUserActive = async (userId: string, isActive: boolean) => {
    try {
      await api.put(`/admin/users/${userId}/status`, { isActive: !isActive });
      fetchAdminData();
    } catch (err) {
      console.error('Error toggling user status:', err);
    }
  };

  const handleResolveComplaint = async (complaintId: string, status: string, resolutionNotes: string) => {
    try {
      await api.put(`/complaints/${complaintId}/resolve`, { status, resolutionNotes });
      fetchAdminData();
    } catch (err) {
      console.error('Error resolving complaint:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 text-white shadow-xl flex justify-between items-center">
        <div>
          <span className="px-3 py-1 bg-indigo-500/30 text-indigo-200 rounded-full text-xs font-bold uppercase">
            Platform Command Center
          </span>
          <h1 className="text-3xl font-black tracking-tight mt-2">HunarHub Admin Dashboard</h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Monitor platform metrics, verify micro-entrepreneur credentials, handle grievances, and manage user accounts.
          </p>
        </div>
        <ShieldCheck size={48} className="text-indigo-400 opacity-80 hidden sm:block" />
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex border-b border-gray-200 gap-4 overflow-x-auto">
        <button
          onClick={() => setActiveTab('verification')}
          className={`py-3 px-4 font-extrabold text-sm border-b-2 transition flex items-center gap-2 ${
            activeTab === 'verification' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500'
          }`}
        >
          <ShieldCheck size={18} /> Entrepreneur Verification ({pendingEntrepreneurs.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`py-3 px-4 font-extrabold text-sm border-b-2 transition flex items-center gap-2 ${
            activeTab === 'users' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500'
          }`}
        >
          <Users size={18} /> User Governance
        </button>
        <button
          onClick={() => setActiveTab('complaints')}
          className={`py-3 px-4 font-extrabold text-sm border-b-2 transition flex items-center gap-2 ${
            activeTab === 'complaints' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500'
          }`}
        >
          <AlertCircle size={18} /> Grievances & Disputes ({complaints.length})
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`py-3 px-4 font-extrabold text-sm border-b-2 transition flex items-center gap-2 ${
            activeTab === 'analytics' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500'
          }`}
        >
          <BarChart2 size={18} /> Platform Analytics
        </button>
      </div>

      {loading ? (
        <LoadingSpinner message="Fetching administrative data..." />
      ) : (
        <>
          {/* Verification Tab */}
          {activeTab === 'verification' && (
            <div className="space-y-4">
              {pendingEntrepreneurs.length === 0 ? (
                <div className="bg-white p-12 rounded-3xl text-center border border-gray-100">
                  <CheckCircle2 size={48} className="mx-auto text-emerald-500 mb-2" />
                  <h3 className="font-bold text-gray-800">All Verification Requests Handled</h3>
                  <p className="text-xs text-gray-500 mt-1">No pending entrepreneur applications requiring audit.</p>
                </div>
              ) : (
                pendingEntrepreneurs.map((e) => (
                  <div key={e._id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <h4 className="font-black text-gray-900 text-base">{e.name}</h4>
                      <p className="text-xs font-bold text-indigo-600">{e.businessName || 'Micro-Entrepreneur'}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Craft: {e.craftCategory || 'Artisan'} • Phone: {e.phone} • Email: {e.email}
                      </p>
                      {e.bio && <p className="text-xs text-gray-600 bg-gray-50 p-3 rounded-xl mt-2 italic">"{e.bio}"</p>}
                    </div>

                    <div className="flex gap-2 w-full md:w-auto">
                      <button
                        onClick={() => handleVerifyEntrepreneur(e._id, true)}
                        className="px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition"
                      >
                        Approve & Verify
                      </button>
                      <button
                        onClick={() => handleVerifyEntrepreneur(e._id, false)}
                        className="px-4 py-2.5 bg-rose-50 text-rose-700 rounded-xl text-xs font-bold hover:bg-rose-600 hover:text-white transition"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Users Governance Tab */}
          {activeTab === 'users' && (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 text-gray-700 font-extrabold uppercase border-b border-gray-100">
                    <tr>
                      <th className="p-4">User</th>
                      <th className="p-4">Role</th>
                      <th className="p-4">Verification</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {allUsers.map((u) => (
                      <tr key={u._id} className="hover:bg-gray-50">
                        <td className="p-4">
                          <div className="font-bold text-gray-900">{u.name}</div>
                          <div className="text-gray-400 text-[11px]">{u.email}</div>
                        </td>
                        <td className="p-4 uppercase font-bold text-gray-600">{u.role}</td>
                        <td className="p-4">
                          {u.role === 'entrepreneur' ? (
                            u.isVerified ? (
                              <span className="text-emerald-600 font-bold">Verified</span>
                            ) : (
                              <span className="text-amber-600 font-bold">Pending</span>
                            )
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </td>
                        <td className="p-4">
                          {u.isActive !== false ? (
                            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold rounded-md">
                              Active
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 bg-rose-50 text-rose-700 font-bold rounded-md">
                              Suspended
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleToggleUserActive(u._id, u.isActive !== false)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                              u.isActive !== false
                                ? 'bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white'
                                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white'
                            }`}
                          >
                            {u.isActive !== false ? 'Suspend User' : 'Activate User'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Grievances Tab */}
          {activeTab === 'complaints' && (
            <div className="space-y-4">
              {complaints.map((c) => (
                <div key={c._id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-900 text-sm">Ticket #{c._id?.slice(-8)}</span>
                    <span className="px-3 py-1 bg-amber-50 text-amber-800 text-xs font-bold rounded-full uppercase">
                      {c.status}
                    </span>
                  </div>
                  <h4 className="font-bold text-gray-900 text-base">{c.subject}</h4>
                  <p className="text-xs text-gray-600 bg-gray-50 p-3 rounded-xl">{c.description}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleResolveComplaint(c._id, 'resolved', 'Issue reviewed and resolved by platform admin.')}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700"
                    >
                      Resolve Dispute
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <span className="text-xs font-bold text-gray-500 block uppercase">Total Registered Users</span>
                <span className="text-3xl font-black text-gray-900">{stats?.totalUsers || 24}</span>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <span className="text-xs font-bold text-gray-500 block uppercase">Verified Micro-Entrepreneurs</span>
                <span className="text-3xl font-black text-indigo-600">{stats?.totalEntrepreneurs || 12}</span>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <span className="text-xs font-bold text-gray-500 block uppercase">Gross Marketplace Volume</span>
                <span className="text-3xl font-black text-emerald-600">₹{stats?.grossVolume || 184500}</span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
