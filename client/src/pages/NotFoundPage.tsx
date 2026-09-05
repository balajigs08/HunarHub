import React from 'react';
import { Link } from 'react-router-dom';
import { Store, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-4">
        <Store size={40} />
      </div>
      <h1 className="text-6xl font-black text-gray-900">404</h1>
      <h2 className="text-2xl font-bold text-gray-800 mt-2">Page Not Found</h2>
      <p className="text-sm text-gray-500 max-w-sm mt-2">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg hover:bg-indigo-700 transition"
      >
        <ArrowLeft size={18} /> Return Home
      </Link>
    </div>
  );
};
