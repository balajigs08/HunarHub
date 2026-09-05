import React, { useEffect, useState } from 'react';
import { AlertCircle, Plus, CheckCircle2, Clock, ShieldAlert } from 'lucide-react';
import api from '../services/api';
import { Complaint } from '../types';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Modal } from '../components/ui/Modal';

export const ComplaintsPage: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Complaint state
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [targetType, setTargetType] = useState<'order' | 'service_request' | 'general'>('general');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await api.get('/complaints/my-complaints');
      setComplaints(res.data.data || res.data || []);
    } catch (err) {
      console.error('Error fetching complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/complaints', {
        subject,
        description,
        targetType,
      });
      setIsModalOpen(false);
      setSubject('');
      setDescription('');
      fetchComplaints();
    } catch (err) {
      console.error('Error creating complaint:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <AlertCircle className="text-rose-600" size={24} /> Support & Grievances
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Need help with an order, service booking, or platform issue? Raise a ticket.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-rose-600 text-white rounded-xl font-bold text-xs hover:bg-rose-700 shadow-md flex items-center gap-1.5"
        >
          <Plus size={16} /> Raise Ticket
        </button>
      </div>

      {loading ? (
        <LoadingSpinner message="Fetching support tickets..." />
      ) : complaints.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl text-center border border-gray-100 shadow-sm">
          <CheckCircle2 size={48} className="mx-auto text-emerald-500 mb-2" />
          <h3 className="font-bold text-gray-800">No active grievances</h3>
          <p className="text-xs text-gray-500 mt-1">You have no pending or past support tickets.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {complaints.map((c) => (
            <div key={c._id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-900 text-sm">Ticket #{c._id?.slice(-8)}</span>
                <span
                  className={`px-3 py-1 text-xs font-black rounded-full uppercase ${
                    c.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {c.status}
                </span>
              </div>
              <h4 className="font-bold text-gray-900 text-base">{c.subject}</h4>
              <p className="text-xs text-gray-600 bg-gray-50 p-4 rounded-2xl">{c.description}</p>
              {c.resolutionNotes && (
                <div className="p-3 bg-emerald-50 text-emerald-900 rounded-xl text-xs font-medium border border-emerald-100">
                  <span className="font-bold block">Resolution Note:</span>
                  {c.resolutionNotes}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal: Create Complaint */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Raise Support Ticket">
        <form onSubmit={handleCreateComplaint} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Issue Category</label>
            <select
              value={targetType}
              onChange={(e: any) => setTargetType(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none"
            >
              <option value="general">General Query / Account Help</option>
              <option value="order">Product Order Issue</option>
              <option value="service_request">Service Request Issue</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Subject</label>
            <input
              type="text"
              required
              placeholder="e.g. Delayed Delivery / Quality Dispute"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Detailed Description</label>
            <textarea
              rows={4}
              required
              placeholder="Provide exact details so our admin team can assist promptly..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 rounded-xl border border-gray-200 text-sm outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-rose-600 text-white rounded-xl font-bold text-sm hover:bg-rose-700 shadow-md disabled:opacity-50"
          >
            {submitting ? 'Submitting Ticket...' : 'Submit Support Ticket'}
          </button>
        </form>
      </Modal>
    </div>
  );
};
