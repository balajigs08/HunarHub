import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Tag, ArrowRight, Store, ShoppingBag, Scissors, Sparkles } from 'lucide-react';
import api from '../services/api';
import { Category } from '../types';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get('/categories');
      setCategories(res.data.data?.categories || res.data.data || res.data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-blue-900 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md text-amber-300 font-bold text-xs uppercase tracking-wider rounded-full">
            <Sparkles className="w-3.5 h-3.5" /> Handcrafted Heritage
          </span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            Explore Craft Categories
          </h1>
          <p className="text-indigo-100 text-sm sm:text-base leading-relaxed">
            Browse authentic local craftsmanship by category — from pottery and handloom textiles to custom tailoring and artisan leatherwork.
          </p>
        </div>
        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
          <Tag size={320} />
        </div>
      </div>

      {/* Categories Grid */}
      {loading ? (
        <LoadingSpinner message="Loading craft categories..." />
      ) : categories.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
          <Tag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-800">No categories found</h3>
          <p className="text-sm text-gray-500 mt-1">Check back soon for new craft categories.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category) => (
            <div
              key={category._id}
              className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">
                  {category.icon || '🏺'}
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                  {category.name}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-6">
                  {category.description || 'Discover unique handmade goods and specialized services from verified local micro-entrepreneurs.'}
                </p>
              </div>

              <div className="pt-6 border-t border-gray-100 flex flex-col gap-3">
                <Link
                  to={`/marketplace?category=${category._id}`}
                  className="flex items-center justify-between px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl text-xs transition"
                >
                  <span className="flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4" /> Browse Products
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to={`/artisans?category=${category._id}`}
                  className="flex items-center justify-between px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold rounded-xl text-xs transition"
                >
                  <span className="flex items-center gap-2">
                    <Store className="w-4 h-4" /> Find Artisans
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
