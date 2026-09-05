import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Store, ArrowRight, UserCheck, ShieldCheck, MapPin, Briefcase } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().min(10, 'Valid mobile number required'),
  role: z.enum(['customer', 'entrepreneur']),
  // Entrepreneur fields
  businessName: z.string().optional(),
  craftCategory: z.string().optional(),
  bio: z.string().optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    pincode: z.string().optional(),
  }).optional(),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { register: registerUser, isLoading, error } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  
  const isArtisanRoute = location.pathname.includes('artisan') || location.pathname.includes('entrepreneur');
  const [selectedRole, setSelectedRole] = useState<'customer' | 'entrepreneur'>(
    isArtisanRoute ? 'entrepreneur' : 'customer'
  );

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: isArtisanRoute ? 'entrepreneur' : 'customer',
    },
  });

  useEffect(() => {
    if (isArtisanRoute) {
      setSelectedRole('entrepreneur');
      setValue('role', 'entrepreneur');
    }
  }, [isArtisanRoute, setValue]);

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser(data);
      if (data.role === 'entrepreneur') {
        navigate('/entrepreneur/dashboard');
      } else {
        navigate('/products');
      }
    } catch (err) {
      console.error('Registration error:', err);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/50">
      <div className="max-w-xl w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-gray-100">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 text-indigo-600 font-extrabold text-2xl mb-2">
            <Store className="w-8 h-8 text-indigo-600" />
            HunarHub
          </Link>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Create your account</h2>
          <p className="mt-2 text-sm text-gray-600">
            Join the community of micro-entrepreneurs and conscious buyers
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium">
            {error}
          </div>
        )}

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-2 gap-3 p-1.5 bg-gray-100 rounded-2xl">
          <button
            type="button"
            onClick={() => {
              setSelectedRole('customer');
              setValue('role', 'customer');
            }}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${
              selectedRole === 'customer'
                ? 'bg-white text-indigo-600 shadow-md'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <UserCheck size={18} />
            Customer / Buyer
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedRole('entrepreneur');
              setValue('role', 'entrepreneur');
            }}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${
              selectedRole === 'entrepreneur'
                ? 'bg-white text-indigo-600 shadow-md'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Briefcase size={18} />
            Micro-Entrepreneur
          </button>
        </div>

        <form className="mt-6 space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <input type="hidden" {...register('role')} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <input
                {...register('name')}
                type="text"
                placeholder="Rajesh Kumar"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              />
              {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Phone Number
              </label>
              <input
                {...register('phone')}
                type="tel"
                placeholder="9876543210"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              />
              {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <input
              {...register('email')}
              type="email"
              placeholder="you@example.com"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
            />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Password
            </label>
            <div className="relative">
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
          </div>

          {/* Entrepreneur Specific Fields */}
          {selectedRole === 'entrepreneur' && (
            <div className="space-y-4 pt-4 border-t border-gray-100 bg-indigo-50/40 p-4 rounded-2xl">
              <h3 className="text-sm font-bold text-indigo-900 flex items-center gap-2">
                <ShieldCheck size={16} /> Entrepreneur Profile Setup
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Business / Brand Name
                  </label>
                  <input
                    {...register('businessName')}
                    type="text"
                    placeholder="Jaipur Pottery House"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Craft / Skill Specialty
                  </label>
                  <select
                    {...register('craftCategory')}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="">Select Primary Craft</option>
                    <option value="Pottery & Ceramics">Pottery & Ceramics</option>
                    <option value="Handloom & Textiles">Handloom & Textiles</option>
                    <option value="Woodwork & Carving">Woodwork & Carving</option>
                    <option value="Leather Craft">Leather Craft</option>
                    <option value="Jewelry & Metalcraft">Jewelry & Metalcraft</option>
                    <option value="Home Services & Repair">Home Services & Repair</option>
                    <option value="Beauty & Tailoring">Beauty & Tailoring</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Short Bio / Artisan Story
                </label>
                <textarea
                  {...register('bio')}
                  rows={2}
                  placeholder="Tell buyers about your craft heritage, experience and passion..."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input
                  {...register('address.city')}
                  type="text"
                  placeholder="City (e.g. Jaipur)"
                  className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-xs"
                />
                <input
                  {...register('address.state')}
                  type="text"
                  placeholder="State (e.g. Rajasthan)"
                  className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-xs"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 transition flex items-center justify-center gap-2 group disabled:opacity-50"
          >
            {isLoading ? 'Creating Account...' : 'Register Account'}
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <p className="text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-indigo-600 hover:text-indigo-700">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};
