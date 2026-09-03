import { useEffect, useState, useCallback } from 'react';
import {
  Star, MapPin, Heart, Check, ChevronLeft, ChevronRight,
  Wifi, Waves, Flower, Dumbbell, Utensils, Wine, Car, Plane,
  Bell, ConciergeBell, Umbrella, Sailboat, Trees, Map as MapIcon,
  Flame, Fish, Shirt, Briefcase, Footprints, BedDouble, Calendar,
  Users, Loader2, ArrowLeft, Share2,
} from 'lucide-react';
import { supabase, type Hotel, type Room, type Review } from '@/lib/supabase';
import { useRouter } from '@/lib/router';
import { useAuth } from '@/lib/auth';
import { formatBDT, formatDate, daysBetween, todayStr, tomorrowStr } from '@/lib/utils';
import { Modal, ConfirmModal } from '@/components/Modal';

const amenityIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'Free WiFi': Wifi,
  'Swimming Pool': Waves,
  'Spa': Flower,
  'Fitness Center': Dumbbell,
  'Restaurant': Utensils,
  'Bar': Wine,
  'Business Center': Briefcase,
  'Parking': Car,
  'Airport Shuttle': Plane,
  'Room Service': Bell,
  'Concierge': ConciergeBell,
  'Beach Access': Umbrella,
  'Water Sports': Sailboat,
  'Garden': Trees,
  'Tour Desk': MapIcon,
  'Campfire': Flame,
  'Boat Tours': Sailboat,
  'Nature Walks': Footprints,
  'Snorkeling': Fish,
  'Seafood': Fish,
  'Laundry': Shirt,
};

type Props = { slug: string; onAuthClick: (mode: 'signin') => void };

export function HotelDetailPage({ slug, onAuthClick }: Props) {
  const { navigate } = useRouter();
  const { user } = useAuth();
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [bookingRoom, setBookingRoom] = useState<Room | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  // Review form state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  const loadData = useCallback(async () => {
    const { data: hotelData } = await supabase
      .from('hotels')
      .select('*, destination:destinations(*)')
      .eq('slug', slug)
      .maybeSingle();

    if (!hotelData) {
      setLoading(false);
      return;
    }

    setHotel(hotelData as unknown as Hotel);

    const [roomsRes, reviewsRes] = await Promise.all([
      supabase.from('rooms').select('*').eq('hotel_id', (hotelData as Hotel).id).order('price_per_night'),
      supabase.from('reviews').select('*').eq('hotel_id', (hotelData as Hotel).id).order('created_at', { ascending: false }),
    ]);

    setRooms(roomsRes.data ?? []);
    setReviews(reviewsRes.data ?? []);

    if (user) {
      const { data: fav } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('hotel_id', (hotelData as Hotel).id)
        .maybeSingle();
      setIsFavorite(!!fav);
    }

    setLoading(false);
  }, [slug, user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleFavorite = async () => {
    if (!user) {
      onAuthClick('signin');
      return;
    }
    if (!hotel) return;
    if (isFavorite) {
      await supabase.from('favorites').delete().eq('user_id', user.id).eq('hotel_id', hotel.id);
      setIsFavorite(false);
    } else {
      await supabase.from('favorites').insert({ user_id: user.id, hotel_id: hotel.id });
      setIsFavorite(true);
    }
  };

  const openBooking = (room: Room) => {
    if (!user) {
      onAuthClick('signin');
      return;
    }
    setBookingRoom(room);
    setCheckIn(todayStr());
    setCheckOut(tomorrowStr());
    setBookingError(null);
  };

  const handleBooking = async () => {
    if (!bookingRoom || !hotel || !user) return;
    setBookingError(null);

    if (!checkIn || !checkOut) {
      setBookingError('Please select check-in and check-out dates.');
      return;
    }
    if (new Date(checkOut) <= new Date(checkIn)) {
      setBookingError('Check-out date must be after check-in date.');
      return;
    }

    setBookingLoading(true);
    const nights = daysBetween(checkIn, checkOut);
    const total = nights * bookingRoom.price_per_night;

    const { error } = await supabase.from('bookings').insert({
      user_id: user.id,
      hotel_id: hotel.id,
      room_id: bookingRoom.id,
      check_in: checkIn,
      check_out: checkOut,
      guests,
      total_price: total,
      status: 'confirmed',
    });

    setBookingLoading(false);

    if (error) {
      setBookingError(error.message);
    } else {
      setBookingSuccess(true);
    }
  };

  const handleReviewSubmit = async () => {
    if (!hotel || !user) return;
    setReviewLoading(true);
    const name = (user.user_metadata?.full_name as string) ?? user.email ?? 'Anonymous';
    const { error } = await supabase.from('reviews').insert({
      hotel_id: hotel.id,
      user_id: user.id,
      author_name: name,
      rating: reviewRating,
      title: reviewTitle,
      comment: reviewComment,
    });
    setReviewLoading(false);
    if (!error) {
      setShowReviewForm(false);
      setReviewTitle('');
      setReviewComment('');
      setReviewRating(5);
      loadData();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Hotel not found</h1>
        <p className="text-gray-500 mb-4">The hotel you're looking for doesn't exist.</p>
        <button onClick={() => navigate('/search')} className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700">
          Browse Hotels
        </button>
      </div>
    );
  }

  const gallery = hotel.gallery?.length ? hotel.gallery : [hotel.image_url ?? ''];

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Gallery */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <button
            onClick={() => navigate('/search')}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-emerald-600 mb-3"
          >
            <ArrowLeft className="w-4 h-4" /> Back to search
          </button>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-2 rounded-2xl overflow-hidden h-[280px] sm:h-[400px]">
            <div className="lg:col-span-2 relative h-full">
              <img src={gallery[activeImage]} alt={hotel.name} className="w-full h-full object-cover" />
            </div>
            <div className="hidden lg:grid grid-rows-2 gap-2 h-full">
              {gallery.slice(1, 3).map((img, i) => (
                <img key={i} src={img} alt="" className="w-full h-full object-cover cursor-pointer" onClick={() => setActiveImage(i + 1)} />
              ))}
            </div>
            <div className="hidden lg:grid grid-rows-2 gap-2 h-full">
              {gallery.slice(3, 5).map((img, i) => (
                <img key={i} src={img} alt="" className="w-full h-full object-cover cursor-pointer" onClick={() => setActiveImage(i + 3)} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hotel info */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {Array.from({ length: hotel.star_rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                    <span className="text-sm text-gray-400">{hotel.property_type}</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{hotel.name}</h1>
                  <div className="flex items-center gap-1 text-gray-500 mt-1">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{hotel.address}, {hotel.destination?.name}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleFavorite} className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:border-rose-300 transition-colors">
                    <Heart className={`w-5 h-5 ${isFavorite ? 'fill-rose-500 text-rose-500' : 'text-gray-400'}`} />
                  </button>
                  <button className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:border-emerald-300 transition-colors">
                    <Share2 className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-4 py-3 border-y border-gray-50 my-4">
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 text-white">
                    <span className="text-sm font-bold">{hotel.rating.toFixed(1)}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {hotel.rating >= 4.5 ? 'Excellent' : hotel.rating >= 4 ? 'Very Good' : hotel.rating >= 3 ? 'Good' : 'Fair'}
                    </p>
                    <p className="text-xs text-gray-500">{hotel.reviews_count} reviews</p>
                  </div>
                </div>
              </div>

              <p className="text-gray-600 leading-relaxed">{hotel.description}</p>

              {/* Amenities */}
              <div className="mt-5">
                <h3 className="font-semibold text-gray-900 mb-3">Amenities</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {hotel.amenities.map((a) => {
                    const Icon = amenityIconMap[a] ?? Check;
                    return (
                      <div key={a} className="flex items-center gap-2 text-sm text-gray-600">
                        <Icon className="w-4 h-4 text-emerald-600" />
                        {a}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Rooms */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Available Rooms</h2>
              <div className="space-y-4">
                {rooms.map((room) => (
                  <div key={room.id} className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl border border-gray-100 hover:border-emerald-200 hover:shadow-sm transition-all">
                    <div className="sm:w-48 h-32 sm:h-32 rounded-lg overflow-hidden flex-shrink-0">
                      <img src={room.image_url ?? ''} alt={room.name} className="w-full h-full object-cover" loading="lazy" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900">{room.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">{room.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center gap-1"><BedDouble className="w-4 h-4" /> {room.bed_type}</span>
                        <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {room.max_guests} guests</span>
                      </div>
                    </div>
                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2">
                      <div className="text-right">
                        <p className="text-xs text-gray-400">per night</p>
                        <p className="text-xl font-bold text-gray-900">{formatBDT(room.price_per_night)}</p>
                      </div>
                      <button
                        onClick={() => openBooking(room)}
                        className="px-5 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                ))}
                {rooms.length === 0 && (
                  <p className="text-gray-500 text-sm">No rooms available.</p>
                )}
              </div>
            </div>

            {/* Reviews */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Guest Reviews</h2>
                {user && (
                  <button
                    onClick={() => setShowReviewForm(true)}
                    className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:border-emerald-400 hover:text-emerald-600 transition-colors"
                  >
                    Write a Review
                  </button>
                )}
              </div>

              {reviews.length === 0 ? (
                <p className="text-gray-500 text-sm">No reviews yet. Be the first to review!</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="p-4 rounded-xl bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-sm font-semibold">
                            {review.author_name[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{review.author_name}</p>
                            <p className="text-xs text-gray-400">{formatDate(review.created_at)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-600 text-white">
                          <span className="text-xs font-bold">{review.rating}</span>
                          <Star className="w-3 h-3 fill-white" />
                        </div>
                      </div>
                      {review.title && <p className="font-semibold text-gray-800 text-sm mb-1">{review.title}</p>}
                      <p className="text-sm text-gray-600">{review.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Booking sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm sticky top-20">
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-2xl font-bold text-gray-900">{formatBDT(hotel.price_per_night)}</span>
                <span className="text-sm text-gray-400">/ night</span>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  Check-in: {hotel.check_in_time}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  Check-out: {hotel.check_out_time}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 mb-4">
                <p className="text-sm text-emerald-700">
                  <Check className="w-4 h-4 inline mr-1" />
                  Free cancellation up to 24 hours before check-in
                </p>
              </div>

              <button
                onClick={() => rooms[0] && openBooking(rooms[0])}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-semibold hover:from-emerald-700 hover:to-teal-800 transition-all shadow-lg shadow-emerald-600/20"
              >
                Reserve Now
              </button>
              <p className="text-center text-xs text-gray-400 mt-2">You won't be charged yet</p>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <Modal open={!!bookingRoom} onClose={() => setBookingRoom(null)} title="Book Your Stay">
        {bookingSuccess ? (
          <div className="p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Booking Confirmed!</h3>
            <p className="text-gray-500 text-sm mb-4">
              Your reservation at {hotel.name} has been confirmed. You can view it in your dashboard.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => { setBookingRoom(null); setBookingSuccess(false); navigate('/dashboard'); }}
                className="flex-1 py-2.5 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors"
              >
                Go to Dashboard
              </button>
              <button
                onClick={() => { setBookingRoom(null); setBookingSuccess(false); }}
                className="flex-1 py-2.5 rounded-lg border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6">
            {bookingRoom && (
              <>
                <div className="flex gap-3 mb-5 pb-5 border-b border-gray-100">
                  <img src={bookingRoom.image_url ?? ''} alt="" className="w-20 h-20 rounded-lg object-cover" />
                  <div>
                    <h3 className="font-bold text-gray-900">{hotel.name}</h3>
                    <p className="text-sm text-gray-500">{bookingRoom.name}</p>
                    <p className="text-sm font-semibold text-emerald-600 mt-1">{formatBDT(bookingRoom.price_per_night)} / night</p>
                  </div>
                </div>

                {bookingError && (
                  <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-sm text-rose-700">
                    {bookingError}
                  </div>
                )}

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Check-in</label>
                      <input
                        type="date"
                        value={checkIn}
                        min={todayStr()}
                        onChange={(e) => setCheckIn(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Check-out</label>
                      <input
                        type="date"
                        value={checkOut}
                        min={checkIn || todayStr()}
                        onChange={(e) => setCheckOut(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Guests</label>
                    <select
                      value={guests}
                      onChange={(e) => setGuests(Number(e.target.value))}
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none"
                    >
                      {Array.from({ length: bookingRoom.max_guests }).map((_, i) => (
                        <option key={i} value={i + 1}>{i + 1} {i === 0 ? 'Guest' : 'Guests'}</option>
                      ))}
                    </select>
                  </div>

                  {checkIn && checkOut && new Date(checkOut) > new Date(checkIn) && (
                    <div className="p-4 rounded-xl bg-gray-50 space-y-2">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>{formatBDT(bookingRoom.price_per_night)} x {daysBetween(checkIn, checkOut)} nights</span>
                        <span>{formatBDT(bookingRoom.price_per_night * daysBetween(checkIn, checkOut))}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Service fee</span>
                        <span>{formatBDT(Math.round(bookingRoom.price_per_night * daysBetween(checkIn, checkOut) * 0.05))}</span>
                      </div>
                      <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-200">
                        <span>Total</span>
                        <span>{formatBDT(Math.round(bookingRoom.price_per_night * daysBetween(checkIn, checkOut) * 1.05))}</span>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleBooking}
                    disabled={bookingLoading}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-semibold hover:from-emerald-700 hover:to-teal-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {bookingLoading && <Loader2 className="w-5 h-5 animate-spin" />}
                    Confirm Booking
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </Modal>

      {/* Review Form Modal */}
      <Modal open={showReviewForm} onClose={() => setShowReviewForm(false)} title="Write a Review">
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((r) => (
                <button key={r} onClick={() => setReviewRating(r)}>
                  <Star className={`w-7 h-7 ${r <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={reviewTitle}
              onChange={(e) => setReviewTitle(e.target.value)}
              placeholder="Summarize your experience"
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
            <textarea
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              rows={4}
              placeholder="Tell others about your stay..."
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none resize-none"
            />
          </div>
          <button
            onClick={handleReviewSubmit}
            disabled={reviewLoading || !reviewComment}
            className="w-full py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {reviewLoading && <Loader2 className="w-5 h-5 animate-spin" />}
            Submit Review
          </button>
        </div>
      </Modal>
    </div>
  );
}
