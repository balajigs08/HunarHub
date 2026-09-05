import React from 'react';
import { FileText, CheckCircle2, AlertCircle } from 'lucide-react';

export const TermsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="text-center space-y-4">
        <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto">
          <FileText size={32} />
        </div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Terms of Service</h1>
        <p className="text-gray-500 text-sm">Last updated: September 2026</p>
      </div>

      <div className="bg-white p-8 sm:p-10 rounded-3xl border border-gray-100 shadow-sm space-y-6 text-gray-700 leading-relaxed text-sm">
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-indigo-600" /> Platform Usage
          </h2>
          <p>
            By using HunarHub, users agree to provide accurate information and respect local micro-entrepreneurs and customers. Micro-entrepreneurs undergo manual verification prior to receiving verified status.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-indigo-600" /> Service & Product Orders
          </h2>
          <p>
            All custom service requests and product orders placed on HunarHub are subject to artisan availability and agreement. Payments and order statuses are tracked directly within the user dashboard.
          </p>
        </section>
      </div>
    </div>
  );
};
