import { useEffect, useState } from 'react';
import { ChevronRight, TrendingUp, Award, Shield, Headphones } from 'lucide-react';
import { supabase, type Hotel, type Destination } from '@/lib/supabase';
import { SearchBar } from '@/components/SearchBar';
import { HotelCard } from '@/components/HotelCard';
import { useRouter } from '@/lib/router';
import { useAuth } from '@/lib/auth';

export function HomePage() {
  const { navigate } = useRouter();
  const { user } = useAuth();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [featuredHotels, setFeaturedHotels] = useState<Hotel[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [{ data: dests }, { data: hotels }] = await Promise.all([
        supabase.from('destinations').select('*').order('hotels_count', { ascending: false }),
        supabase.from('hotels').select('*, destination:destinations(*)').order('rating', { ascending: false }).limit(8),
      ]);
      setDestinations(dests ?? []);
      setFeaturedHotels((hotels as unknown as Hotel[]) ?? []);

      if (user) {
        const { data: favs } = await supabase.from('favorites').select('hotel_id').eq('user_id', user.id);
        setFavorites(new Set((favs ?? []).map((f) => f.hotel_id)));
      }
      setLoading(false);
    })();
  }, [user]);

  const refreshFavorites = async () => {
    if (!user) return;
    const { data: favs } = await supabase.from('favorites').select('hotel_id').eq('user_id', user.id);
    setFavorites(new Set((favs ?? []).map((f) => f.hotel_id)));
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/33948015/pexels-photo-33948015.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt="Bangladesh beach"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <div className="text-center mb-8 animate-fade-in">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
              Discover Bangladesh,
              <br />
              <span className="text-emerald-400">Stay in Comfort</span>
            </h1>
            <p className="text-lg text-white/90 max-w-2xl mx-auto">
              From the world's longest beach to misty hill tracts and lush tea gardens — book your perfect stay across Bangladesh.
            </p>
          </div>

          <div className="animate-slide-up">
            <SearchBar destinations={destinations} variant="hero" />
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Stat icon={<TrendingUp className="w-5 h-5" />} value="500+" label="Hotels nationwide" />
            <Stat icon={<Award className="w-5 h-5" />} value="7" label="Destinations" />
            <Stat icon={<Shield className="w-5 h-5" />} value="100%" label="Secure booking" />
            <Stat icon={<Headphones className="w-5 h-5" />} value="24/7" label="Customer support" />
          </div>
        </div>
      </section>

      {/* Destinations */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Popular Destinations</h2>
            <p className="text-gray-500 mt-1">Explore the beauty of Bangladesh</p>
          </div>
          <button
            onClick={() => navigate('/search')}
            className="hidden sm:flex items-center gap-1 text-sm font-semibold text-emerald-600 hover:text-emerald-700"
          >
            View all <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {destinations.map((dest) => (
            <button
              key={dest.id}
              onClick={() => navigate(`/search?destination=${dest.slug}`)}
              className="group relative h-44 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all"
            >
              <img
                src={dest.image_url ?? ''}
                alt={dest.name}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 text-left">
                <h3 className="text-lg font-bold text-white">{dest.name}</h3>
                <p className="text-xs text-white/80">{dest.hotels_count} hotels</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Featured Hotels */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Featured Hotels</h2>
              <p className="text-gray-500 mt-1">Top-rated stays loved by travelers</p>
            </div>
            <button
              onClick={() => navigate('/search')}
              className="hidden sm:flex items-center gap-1 text-sm font-semibold text-emerald-600 hover:text-emerald-700"
            >
              View all <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
                  <div className="h-48 bg-gray-200" />
                  <div className="p-4 space-y-3">
                    <div className="h-5 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                    <div className="h-4 bg-gray-200 rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {featuredHotels.map((hotel) => (
                <HotelCard
                  key={hotel.id}
                  hotel={hotel}
                  isFavorite={favorites.has(hotel.id)}
                  onFavoriteToggle={refreshFavorites}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA banner */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/38183292/pexels-photo-38183292.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt="Beach sunset"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/80 to-teal-900/80" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready for your next adventure?
          </h2>
          <p className="text-lg text-white/90 mb-8">
            Join thousands of travelers who trust BanglaStay for their hotel bookings across Bangladesh.
          </p>
          <button
            onClick={() => navigate('/search')}
            className="px-8 py-3.5 rounded-xl bg-white text-emerald-700 font-bold hover:bg-emerald-50 transition-colors shadow-lg"
          >
            Browse All Hotels
          </button>
        </div>
      </section>
    </div>
  );
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-lg font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </div>
  );
}
