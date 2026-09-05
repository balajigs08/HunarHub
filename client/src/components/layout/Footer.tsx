import React from 'react';
import { Link } from 'react-router-dom';
import { Store, Facebook, Instagram, MessageSquare, Mail, Phone, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const links = {
    platform: [
      { label: 'Marketplace', to: '/marketplace' },
      { label: 'Browse Artisans', to: '/artisans' },
      { label: 'Categories', to: '/categories' },
      { label: 'How It Works', to: '/about' },
    ],
    forEntrepreneurs: [
      { label: 'Register as Artisan', to: '/register/entrepreneur' },
      { label: 'Entrepreneur Dashboard', to: '/entrepreneur/dashboard' },
      { label: 'Manage Services', to: '/entrepreneur/services' },
      { label: 'Manage Products', to: '/entrepreneur/products' },
    ],
    support: [
      { label: 'Contact Us', to: '/contact' },
      { label: 'File a Complaint', to: '/customer/complaints/new' },
      { label: 'Privacy Policy', to: '/privacy' },
      { label: 'Terms of Service', to: '/terms' },
    ],
  };

  return (
    <footer className="bg-gray-900 text-white" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 hero-gradient rounded-lg flex items-center justify-center">
                <Store className="w-4 h-4 text-white" strokeWidth={2.5} />
              </div>
              <span className="font-display font-bold text-xl text-white">HunarHub</span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs mb-6">
              India's digital marketplace connecting local artisans, craftspeople, and micro-entrepreneurs with customers who value handmade, authentic products and services.
            </p>

            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2.5 text-sm text-gray-400">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span>Serving communities across India</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm text-gray-400">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <a href="mailto:support@hunarhub.in" className="hover:text-white transition-colors">support@hunarhub.in</a>
              </div>
              <div className="flex items-center gap-2.5 text-sm text-gray-400">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span>+91 98000 00000</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {[
                { icon: Facebook, label: 'Facebook', href: '#' },
                { icon: Instagram, label: 'Instagram', href: '#' },
                { icon: MessageSquare, label: 'WhatsApp', href: '#' },
              ].map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  className="w-9 h-9 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-primary-600 transition-all"
                  aria-label={label}
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          {[
            { title: 'Platform', links: links.platform },
            { title: 'For Entrepreneurs', links: links.forEntrepreneurs },
            { title: 'Support', links: links.support },
          ].map(({ title, links }) => (
            <div key={title}>
              <h3 className="font-semibold text-white text-sm uppercase tracking-wider mb-4">{title}</h3>
              <ul className="space-y-2.5">
                {links.map(({ label, to }) => (
                  <li key={to}>
                    <Link
                      to={to}
                      className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8 border-y border-gray-800 mb-8">
          {[
            { value: '500+', label: 'Local Artisans' },
            { value: '5,000+', label: 'Products Listed' },
            { value: '12,000+', label: 'Happy Customers' },
            { value: '50+', label: 'Cities Covered' },
          ].map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="text-2xl font-bold text-white">{value}</p>
              <p className="text-xs text-gray-400 mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <p>© {currentYear} HunarHub. Made with ❤️ for local artisans of India.</p>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="hover:text-gray-300 transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-gray-300 transition-colors">Terms</Link>
            <Link to="/admin/dashboard" className="hover:text-gray-300 transition-colors">Admin</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
