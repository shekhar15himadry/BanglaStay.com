import { useState } from 'react';
import { Star, Heart, MapPin, ChevronRight } from 'lucide-react';
import type { Hotel } from '@/lib/supabase';
import { formatBDT } from '@/lib/utils';
import { useRouter } from '@/lib/router';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

type HotelCardProps = {
  hotel: Hotel;
  isFavorite?: boolean;
  onFavoriteToggle?: () => void;
};

export function HotelCard({ hotel, isFavorite, onFavoriteToggle }: HotelCardProps) {
  const { navigate } = useRouter();
  const { user } = useAuth();

  const handleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    if (isFavorite) {
      await supabase.from('favorites').delete().eq('user_id', user.id).eq('hotel_id', hotel.id);
    } else {
      await supabase.from('favorites').insert({ user_id: user.id, hotel_id: hotel.id });
    }
    onFavoriteToggle?.();
  };

  return (
    <div
      onClick={() => navigate(`/hotel/${hotel.slug}`)}
      className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 cursor-pointer hover:-translate-y-1"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={hotel.image_url ?? ''}
          alt={hotel.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-sm shadow-sm">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span className="text-xs font-bold text-gray-900">{hotel.rating.toFixed(1)}</span>
          <span className="text-xs text-gray-500">({hotel.reviews_count})</span>
        </div>
        {hotel.star_rating > 0 && (
          <div className="absolute bottom-3 left-3 flex gap-0.5 px-2 py-1 rounded-lg bg-black/50 backdrop-blur-sm">
            {Array.from({ length: hotel.star_rating }).map((_, i) => (
              <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
            ))}
          </div>
        )}
        {user && (
          <button
            onClick={handleFavorite}
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
            aria-label="Toggle favorite"
          >
            <Heart
              className={`w-5 h-5 ${isFavorite ? 'fill-rose-500 text-rose-500' : 'text-gray-400'}`}
            />
          </button>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-bold text-gray-900 text-lg leading-tight mb-1 group-hover:text-emerald-700 transition-colors">
          {hotel.name}
        </h3>
        <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
          <MapPin className="w-3.5 h-3.5" />
          <span>{hotel.destination?.name ?? hotel.address}</span>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {hotel.amenities.slice(0, 3).map((a) => (
            <span key={a} className="px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-medium">
              {a}
            </span>
          ))}
          {hotel.amenities.length > 3 && (
            <span className="px-2 py-1 text-xs text-gray-500">+{hotel.amenities.length - 3} more</span>
          )}
        </div>

        <div className="flex items-end justify-between pt-3 border-t border-gray-50">
          <div>
            <p className="text-xs text-gray-400">Starting from</p>
            <p className="text-xl font-bold text-gray-900">
              {formatBDT(hotel.price_per_night)}
              <span className="text-sm font-normal text-gray-400"> / night</span>
            </p>
          </div>
          <span className="flex items-center gap-0.5 text-sm font-semibold text-emerald-600 group-hover:gap-1.5 transition-all">
            View <ChevronRight className="w-4 h-4" />
          </span>
        </div>
      </div>
    </div>
  );
}
