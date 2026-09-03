import { useEffect, useState, useCallback } from 'react';
import { SlidersHorizontal, X, Star, MapPin, Loader2 } from 'lucide-react';
import { supabase, type Hotel, type Destination } from '@/lib/supabase';
import { SearchBar } from '@/components/SearchBar';
import { HotelCard } from '@/components/HotelCard';
import { useRouter } from '@/lib/router';
import { useAuth } from '@/lib/auth';
import { formatBDT } from '@/lib/utils';

type SortOption = 'recommended' | 'price-low' | 'price-high' | 'rating';

export function SearchPage() {
  const { query, navigate } = useRouter();
  const { user } = useAuth();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<Set<string>>(new Set([]));
  const [showFilters, setShowFilters] = useState(false);

  const [priceRange, setPriceRange] = useState<[number, number]>([0, 30000]);
  const [minRating, setMinRating] = useState(0);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [selectedDestinations, setSelectedDestinations] = useState<string[]>([]);
  const [sort, setSort] = useState<SortOption>('recommended');

  const allAmenities = [
    'Free WiFi', 'Swimming Pool', 'Spa', 'Fitness Center', 'Restaurant',
    'Bar', 'Parking', 'Airport Shuttle', 'Room Service', 'Beach Access',
  ];

  const refreshFavorites = useCallback(async () => {
    if (!user) return;
    const { data: favs } = await supabase.from('favorites').select('hotel_id').eq('user_id', user.id);
    setFavorites(new Set((favs ?? []).map((f) => f.hotel_id)));
  }, [user]);

  useEffect(() => {
    (async () => {
      const { data: dests } = await supabase.from('destinations').select('*').order('name');
      setDestinations(dests ?? []);

      const destSlug = query.destination;
      let hotelQuery = supabase.from('hotels').select('*, destination:destinations(*)');

      if (destSlug) {
        hotelQuery = hotelQuery.eq('destination_id', (await supabase.from('destinations').select('id').eq('slug', destSlug).maybeSingle()).data?.id ?? '');
      }

      const { data: hotelData } = await hotelQuery.order('rating', { ascending: false });
      setHotels((hotelData as unknown as Hotel[]) ?? []);
      setLoading(false);

      if (destSlug) {
        setSelectedDestinations([destSlug]);
      }

      refreshFavorites();
    })();
  }, [query.destination, refreshFavorites]);

  const filtered = hotels
    .filter((h) => h.price_per_night >= priceRange[0] && h.price_per_night <= priceRange[1])
    .filter((h) => h.rating >= minRating)
    .filter((h) => selectedAmenities.every((a) => h.amenities.includes(a)))
    .filter((h) => selectedDestinations.length === 0 || selectedDestinations.includes(h.destination?.slug ?? ''));

  const sorted = [...filtered].sort((a, b) => {
    switch (sort) {
      case 'price-low': return a.price_per_night - b.price_per_night;
      case 'price-high': return b.price_per_night - a.price_per_night;
      case 'rating': return b.rating - a.rating;
      default: return b.reviews_count - a.reviews_count;
    }
  });

  const toggleAmenity = (a: string) => {
    setSelectedAmenities((prev) => prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]);
  };

  const toggleDestination = (slug: string) => {
    setSelectedDestinations((prev) => prev.includes(slug) ? prev.filter((x) => x !== slug) : [...prev, slug]);
  };

  const clearFilters = () => {
    setPriceRange([0, 30000]);
    setMinRating(0);
    setSelectedAmenities([]);
    setSelectedDestinations([]);
    setSort('recommended');
  };

  const activeFilterCount =
    (priceRange[0] > 0 || priceRange[1] < 30000 ? 1 : 0) +
    (minRating > 0 ? 1 : 0) +
    selectedAmenities.length +
    (selectedDestinations.length > 0 ? 1 : 0);

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Search bar section */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <SearchBar destinations={destinations} variant="compact" initialDestination={query.destination} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {loading ? 'Searching...' : `${sorted.length} hotels found`}
            </h1>
            {query.destination && (
              <p className="text-gray-500 text-sm mt-0.5">
                in {destinations.find((d) => d.slug === query.destination)?.name ?? 'Bangladesh'}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 bg-white outline-none focus:border-emerald-500"
            >
              <option value="recommended">Recommended</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>

            <button
              onClick={() => setShowFilters(true)}
              className="lg:hidden flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 bg-white"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Filter sidebar - desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <FilterPanel
              destinations={destinations}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              minRating={minRating}
              setMinRating={setMinRating}
              selectedAmenities={selectedAmenities}
              toggleAmenity={toggleAmenity}
              selectedDestinations={selectedDestinations}
              toggleDestination={toggleDestination}
              clearFilters={clearFilters}
              allAmenities={allAmenities}
            />
          </aside>

          {/* Results */}
          <div className="flex-1">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
              </div>
            ) : sorted.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center">
                <p className="text-gray-500 text-lg mb-2">No hotels match your filters</p>
                <p className="text-gray-400 text-sm mb-4">Try adjusting your search criteria</p>
                <button onClick={clearFilters} className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors">
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {sorted.map((hotel) => (
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
        </div>
      </div>

      {/* Mobile filter drawer */}
      {showFilters && (
        <div className="fixed inset-0 z-[90] lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowFilters(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-80 max-w-full bg-white overflow-y-auto animate-slide-in-right">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
              <h3 className="font-bold text-gray-900">Filters</h3>
              <button onClick={() => setShowFilters(false)} className="p-1.5 rounded-full hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <FilterPanel
                destinations={destinations}
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                minRating={minRating}
                setMinRating={setMinRating}
                selectedAmenities={selectedAmenities}
                toggleAmenity={toggleAmenity}
                selectedDestinations={selectedDestinations}
                toggleDestination={toggleDestination}
                clearFilters={clearFilters}
                allAmenities={allAmenities}
              />
              <button
                onClick={() => setShowFilters(false)}
                className="w-full mt-4 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors"
              >
                Show {sorted.length} results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterPanel({
  destinations,
  priceRange,
  setPriceRange,
  minRating,
  setMinRating,
  selectedAmenities,
  toggleAmenity,
  selectedDestinations,
  toggleDestination,
  clearFilters,
  allAmenities,
}: {
  destinations: Destination[];
  priceRange: [number, number];
  setPriceRange: (r: [number, number]) => void;
  minRating: number;
  setMinRating: (r: number) => void;
  selectedAmenities: string[];
  toggleAmenity: (a: string) => void;
  selectedDestinations: string[];
  toggleDestination: (slug: string) => void;
  clearFilters: () => void;
  allAmenities: string[];
}) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-bold text-gray-900">Filters</h3>
        <button onClick={clearFilters} className="text-xs text-rose-600 hover:text-rose-700 font-medium">
          Clear all
        </button>
      </div>

      {/* Price range */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Price Range</h4>
        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
          <span>{formatBDT(priceRange[0])}</span>
          <span>{formatBDT(priceRange[1])}</span>
        </div>
        <input
          type="range"
          min={0}
          max={30000}
          step={500}
          value={priceRange[1]}
          onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
          className="w-full accent-emerald-600"
        />
        <div className="grid grid-cols-2 gap-2 mt-3">
          <input
            type="number"
            value={priceRange[0]}
            onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
            className="px-2 py-1.5 text-sm rounded-lg border border-gray-200 outline-none focus:border-emerald-500"
            placeholder="Min"
          />
          <input
            type="number"
            value={priceRange[1]}
            onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
            className="px-2 py-1.5 text-sm rounded-lg border border-gray-200 outline-none focus:border-emerald-500"
            placeholder="Max"
          />
        </div>
      </div>

      {/* Rating */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Minimum Rating</h4>
        <div className="space-y-1">
          {[0, 3, 4, 4.5].map((r) => (
            <button
              key={r}
              onClick={() => setMinRating(r)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                minRating === r ? 'bg-emerald-50 text-emerald-700 font-medium' : 'hover:bg-gray-50 text-gray-600'
              }`}
            >
              {r === 0 ? 'All ratings' : (
                <>
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  {r}+ stars
                </>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Destinations */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Destinations</h4>
        <div className="space-y-1 max-h-44 overflow-y-auto">
          {destinations.map((d) => (
            <label key={d.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedDestinations.includes(d.slug)}
                onChange={() => toggleDestination(d.slug)}
                className="w-4 h-4 rounded accent-emerald-600"
              />
              <span className="text-sm text-gray-700 flex-1">{d.name}</span>
              <span className="text-xs text-gray-400">{d.hotels_count}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Amenities */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Amenities</h4>
        <div className="space-y-1">
          {allAmenities.map((a) => (
            <label key={a} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedAmenities.includes(a)}
                onChange={() => toggleAmenity(a)}
                className="w-4 h-4 rounded accent-emerald-600"
              />
              <span className="text-sm text-gray-700">{a}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
