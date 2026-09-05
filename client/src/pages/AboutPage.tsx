import React from 'react';
import { Store, ShieldCheck, Heart, Users, Award, Sparkles } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 font-black text-xs uppercase tracking-wider rounded-full">
          Empowering Local Craftsmanship
        </span>
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">
          About HunarHub
        </h1>
        <p className="text-gray-600 text-lg leading-relaxed">
          HunarHub is a digital marketplace bridging rural and urban micro-entrepreneurs directly with conscious consumers. We empower local artisans, tailors, weavers, and craftsmen to showcase their skills, sell authentic products, and book skilled services.
        </p>
      </div>

      {/* Core Values */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm text-center space-y-4">
          <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto">
            <Heart size={32} />
          </div>
          <h3 className="font-black text-xl text-gray-900">Direct Economic Growth</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            Eliminating middleman margins so 100% of earned value goes directly into the hands of local creators.
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm text-center space-y-4">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
            <ShieldCheck size={32} />
          </div>
          <h3 className="font-black text-xl text-gray-900">Verified Artisan Badges</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            Rigorous admin auditing ensures every listed micro-entrepreneur represents authentic handmade quality.
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm text-center space-y-4">
          <div className="w-16 h-16 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center mx-auto">
            <Sparkles size={32} />
          </div>
          <h3 className="font-black text-xl text-gray-900">On-Demand Skill Hiring</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            Not just physical goods — customers can book custom alterations, workshops, and repair services easily.
          </p>
        </div>
      </div>
    </div>
  );
};
