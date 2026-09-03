import { useEffect, useState, useCallback } from 'react';
import { Calendar, Heart, Trash2, MapPin, Star, Loader2, BedDouble, Users, CheckCircle2, XCircle } from 'lucide-react';
import { supabase, type Booking, type Hotel } from '@/lib/supabase';
import { useRouter } from '@/lib/router';
import { useAuth } from '@/lib/auth';
import { formatBDT, formatDate } from '@/lib/utils';
import { ConfirmModal } from '@/components/Modal';
import { HotelCard } from '@/components/HotelCard';

export function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { navigate, query } = useRouter();
  const [tab, setTab] = useState<'bookings' | 'favorites'>(query.tab === 'favorites' ? 'favorites' : 'bookings');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [favoriteHotels, setFavoriteHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelTarget, setCancelTarget] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const [bookingsRes, favsRes] = await Promise.all([
      supabase.from('bookings').select('*, hotel:hotels(*, destination:destinations(*)), room:rooms(*)').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('favorites').select('hotel:hotels(*, destination:destinations(*))').eq('user_id', user.id),
    ]);

    setBookings((bookingsRes.data as unknown as Booking[]) ?? []);
    setFavoriteHotels((favsRes.data?.map((f) => f.hotel).filter(Boolean) as unknown as Hotel[]) ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/');
      return;
    }
    loadData();
  }, [authLoading, user, navigate, loadData]);

  const handleCancel = async () => {
    if (!cancelTarget || !user) return;
    await supabase.from('bookings').delete().eq('id', cancelTarget).eq('user_id', user.id);
    setCancelTarget(null);
    loadData();
  };

  const refreshFavorites = async () => {
    if (!user) return;
    const { data: favs } = await supabase.from('favorites').select('hotel:hotels(*, destination:destinations(*))').eq('user_id', user.id);
    setFavoriteHotels((favs?.map((f) => f.hotel).filter(Boolean) as unknown as Hotel[]) ?? []);
  };

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back, {user?.user_metadata?.full_name ?? user?.email}</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white p-1 rounded-xl border border-gray-100 inline-flex">
          <button
            onClick={() => setTab('bookings')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              tab === 'bookings' ? 'bg-emerald-600 text-white' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Calendar className="w-4 h-4" /> Bookings
            <span className="px-1.5 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600">{bookings.length}</span>
          </button>
          <button
            onClick={() => setTab('favorites')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              tab === 'favorites' ? 'bg-emerald-600 text-white' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Heart className="w-4 h-4" /> Favorites
            <span className="px-1.5 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600">{favoriteHotels.length}</span>
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          </div>
        ) : tab === 'bookings' ? (
          <div className="space-y-4">
            {bookings.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-lg mb-2">No bookings yet</p>
                <p className="text-gray-400 text-sm mb-4">Start exploring and book your first stay!</p>
                <button onClick={() => navigate('/search')} className="px-4 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors">
                  Browse Hotels
                </button>
              </div>
            ) : (
              bookings.map((booking) => (
                <div key={booking.id} className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 flex flex-col sm:flex-row gap-4">
                  <img
                    src={booking.hotel?.image_url ?? ''}
                    alt={booking.hotel?.name ?? ''}
                    className="w-full sm:w-40 h-32 sm:h-28 rounded-lg object-cover cursor-pointer"
                    onClick={() => navigate(`/hotel/${booking.hotel?.slug}`)}
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-gray-900 cursor-pointer hover:text-emerald-600" onClick={() => navigate(`/hotel/${booking.hotel?.slug}`)}>
                          {booking.hotel?.name}
                        </h3>
                        <div className="flex items-center gap-1 text-sm text-gray-500 mt-0.5">
                          <MapPin className="w-3.5 h-3.5" /> {booking.hotel?.destination?.name}
                        </div>
                      </div>
                      <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                        booking.status === 'confirmed' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                      }`}>
                        {booking.status === 'confirmed' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        {booking.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-emerald-600" />
                        {formatDate(booking.check_in)} → {formatDate(booking.check_out)}
                      </span>
                      {booking.room && (
                        <span className="flex items-center gap-1.5">
                          <BedDouble className="w-4 h-4 text-emerald-600" /> {booking.room.name}
                        </span>
                      )}
                      <span className="flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-emerald-600" /> {booking.guests} guests
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                      <p className="text-lg font-bold text-gray-900">{formatBDT(Number(booking.total_price))}</p>
                      {booking.status === 'confirmed' && (
                        <button
                          onClick={() => setCancelTarget(booking.id)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" /> Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div>
            {favoriteHotels.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
                <Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-lg mb-2">No favorites yet</p>
                <p className="text-gray-400 text-sm mb-4">Tap the heart icon on any hotel to save it here.</p>
                <button onClick={() => navigate('/search')} className="px-4 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors">
                  Browse Hotels
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {favoriteHotels.map((hotel) => (
                  <HotelCard key={hotel.id} hotel={hotel} isFavorite onFavoriteToggle={refreshFavorites} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <ConfirmModal
        open={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleCancel}
        title="Cancel Booking"
        message="Are you sure you want to cancel this booking? This action cannot be undone."
        confirmLabel="Yes, Cancel"
      />
    </div>
  );
}
