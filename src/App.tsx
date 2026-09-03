import { useState } from 'react';
import { AuthProvider } from '@/lib/auth';
import { RouterProvider, useRouter, matchRoute } from '@/lib/router';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { AuthModal } from '@/components/AuthModal';
import { HomePage } from '@/pages/HomePage';
import { SearchPage } from '@/pages/SearchPage';
import { HotelDetailPage } from '@/pages/HotelDetailPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { AboutPage } from '@/pages/AboutPage';

function AppContent() {
  const { path, navigate } = useRouter();
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  const openAuth = (mode: 'signin' | 'signup') => {
    setAuthMode(mode);
    setAuthOpen(true);
  };

  const renderPage = () => {
    if (path === '/') return <HomePage />;
    if (path === '/search') return <SearchPage />;
    if (path === '/about') return <AboutPage />;
    if (path === '/dashboard') return <DashboardPage />;

    const hotelMatch = matchRoute('/hotel/:slug', path);
    if (hotelMatch) return <HotelDetailPage slug={hotelMatch.slug} onAuthClick={openAuth} />;

    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Page Not Found</h1>
        <p className="text-gray-500 mb-4">The page you're looking for doesn't exist.</p>
        <button
          onClick={() => navigate('/')}
          className="px-5 py-2.5 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors"
        >
          Go Home
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header onAuthClick={openAuth} />
      <main className="flex-1">{renderPage()}</main>
      <Footer />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} initialMode={authMode} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider>
        <AppContent />
      </RouterProvider>
    </AuthProvider>
  );
}
