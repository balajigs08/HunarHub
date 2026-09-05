import React from 'react';
import { ShieldCheck, Lock, Eye, FileText } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="text-center space-y-4">
        <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
          <ShieldCheck size={32} />
        </div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Privacy Policy</h1>
        <p className="text-gray-500 text-sm">Last updated: September 2026</p>
      </div>

      <div className="bg-white p-8 sm:p-10 rounded-3xl border border-gray-100 shadow-sm space-y-6 text-gray-700 leading-relaxed text-sm">
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Lock className="w-5 h-5 text-indigo-600" /> Information We Collect
          </h2>
          <p>
            HunarHub collects essential user information such as name, email address, contact phone number, and location details required to connect local artisans with customers and fulfill orders & service requests.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Eye className="w-5 h-5 text-indigo-600" /> How We Use Information
          </h2>
          <p>
            Your information is strictly used to facilitate transaction processing, artisan verification, dispute resolution, and platform notifications. We do not sell your personal information to third parties.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" /> Security & Data Protection
          </h2>
          <p>
            We implement industry-standard encryption, JWT token authorization, and secure database practices to ensure customer and micro-entrepreneur data remains safe and confidential.
          </p>
        </section>
      </div>
    </div>
  );
};
