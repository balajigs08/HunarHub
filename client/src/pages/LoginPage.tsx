import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Store, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { useNotificationStore } from '../store/notificationStore';
import toast from 'react-hot-toast';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { fetchCart } = useCartStore();
  const { fetchNotifications } = useNotificationStore();
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    const { isAuthenticated, user } = useAuthStore.getState();
    if (isAuthenticated && user) {
      if (user.role === 'admin') navigate('/admin/dashboard', { replace: true });
      else if (user.role === 'entrepreneur') navigate('/entrepreneur/dashboard', { replace: true });
      else navigate('/customer/dashboard', { replace: true });
    }
  }, [navigate]);

  const onSubmit = async (data: LoginForm) => {
    try {
      await login(data.email, data.password);
      const user = useAuthStore.getState().user;
      toast.success(`Welcome back, ${user?.name?.split(' ')[0] || 'User'}!`);

      // Load user data
      if (user?.role === 'customer') {
        fetchCart().catch(() => {});
      }
      fetchNotifications().catch(() => {});

      // Redirect based on role
      if (user?.role === 'admin') navigate('/admin/dashboard');
      else if (user?.role === 'entrepreneur') navigate('/entrepreneur/dashboard');
      else navigate('/customer/dashboard');
    } catch (error: unknown) {
      const msg = (error as { displayMessage?: string })?.displayMessage || 'Login failed. Please check your credentials.';
      toast.error(msg);
    }
  };

  const fillDemo = (role: 'admin' | 'customer' | 'entrepreneur') => {
    const demos = {
      admin: { email: 'admin@hunarhub.local', password: 'Admin@12345' },
      customer: { email: 'customer@hunarhub.local', password: 'Customer@12345' },
      entrepreneur: { email: 'entrepreneur@hunarhub.local', password: 'Entrepreneur@12345' },
    };
    setValue('email', demos[role].email);
    setValue('password', demos[role].password);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left panel */}
      <div className="hero-gradient hidden lg:flex flex-col items-center justify-center p-12 text-white">
        <div className="max-w-md text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-10 group">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Store className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-2xl text-white">HunarHub</span>
          </Link>
          <h1 className="font-display text-4xl font-bold mb-4">Welcome Back!</h1>
          <p className="text-blue-100 text-lg leading-relaxed">
            India's marketplace connecting skilled artisans with customers who appreciate authentic handmade craftsmanship.
          </p>
          <div className="grid grid-cols-2 gap-4 mt-10">
            {[
              { emoji: '👟', label: 'Cobblers' },
              { emoji: '🏺', label: 'Potters' },
              { emoji: '🧵', label: 'Tailors' },
              { emoji: '🎨', label: 'Artisans' },
            ].map(({ emoji, label }) => (
              <div key={label} className="bg-white/10 rounded-xl p-4 text-center">
                <span className="text-2xl">{emoji}</span>
                <p className="text-sm font-medium mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex flex-col items-center justify-center p-6 lg:p-12 bg-white">
        <div className="w-full max-w-md">
          <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-8 text-sm transition-colors lg:hidden">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <div className="mb-8">
            <h2 className="font-display text-3xl font-bold text-gray-900 mb-2">Sign In</h2>
            <p className="text-gray-500">Don't have an account?{' '}
              <Link to="/register" className="text-primary-600 font-medium hover:underline">Register here</Link>
            </p>
          </div>

          {/* Demo account buttons */}
          <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <p className="text-xs font-semibold text-blue-700 mb-3">⚡ Quick Demo Login</p>
            <div className="grid grid-cols-3 gap-2">
              {(['admin', 'customer', 'entrepreneur'] as const).map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => fillDemo(role)}
                  className="py-1.5 px-2 text-xs font-medium bg-white rounded-lg border border-blue-200 text-blue-700 hover:bg-blue-100 transition-colors capitalize"
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                {...register('email')}
                className={`input-base ${errors.email ? 'input-error' : ''}`}
                placeholder="you@example.com"
                autoComplete="email"
              />
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-600" role="alert">{errors.email.message}</p>
              )}
            </div>

            <div>
              <div className="flex justify-between mb-1.5">
                <label htmlFor="password" className="text-sm font-medium text-gray-700">Password</label>
                <Link to="/forgot-password" className="text-sm text-primary-600 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  className={`input-base pr-10 ${errors.password ? 'input-error' : ''}`}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-600" role="alert">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full py-3 text-base"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Want to sell on HunarHub?{' '}
            <Link to="/register/entrepreneur" className="text-primary-600 font-medium hover:underline">
              Register as Artisan
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
