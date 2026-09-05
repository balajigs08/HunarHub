import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Get in Touch</h1>
        <p className="text-gray-600 text-sm mt-2">
          Have questions about joining as an artisan or buying on HunarHub? We are here to support you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Contact Form */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          {submitted ? (
            <div className="p-8 text-center space-y-3">
              <CheckCircle2 size={48} className="mx-auto text-emerald-500" />
              <h3 className="text-xl font-bold text-gray-900">Message Received!</h3>
              <p className="text-xs text-gray-500">Our support team will get back to you within 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  placeholder="Sunita Sharma"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="sunita@example.com"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Message</label>
                <textarea
                  rows={4}
                  required
                  placeholder="How can we help you..."
                  className="w-full p-4 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>
              <button
                type="submit"
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition flex items-center justify-center gap-2"
              >
                <Send size={18} /> Send Message
              </button>
            </form>
          )}
        </div>

        {/* Contact Cards */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
              <Mail size={24} />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-sm">Email Support</h4>
              <p className="text-xs text-gray-600">support@hunarhub.org</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
              <Phone size={24} />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-sm">Helpline (Toll Free)</h4>
              <p className="text-xs text-gray-600">+91 1800-123-HUNAR (4862)</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-teal-50 text-teal-600 rounded-2xl">
              <MapPin size={24} />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-sm">Headquarters</h4>
              <p className="text-xs text-gray-600">Craft Innovation Hub, Johari Bazaar, Jaipur, Rajasthan 302003</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
