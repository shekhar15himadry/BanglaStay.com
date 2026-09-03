import { useState, useRef, useEffect } from 'react';
import { MapPin, Calendar, Users, Search, ChevronDown, Check, X } from 'lucide-react';
import { useRouter } from '@/lib/router';
import { todayStr, tomorrowStr } from '@/lib/utils';
import type { Destination } from '@/lib/supabase';

type SearchBarProps = {
  destinations: Destination[];
  initialDestination?: string;
  initialCheckIn?: string;
  initialCheckOut?: string;
  initialGuests?: number;
  variant?: 'hero' | 'compact';
};

export function SearchBar({
  destinations,
  initialDestination = '',
  initialCheckIn = '',
  initialCheckOut = '',
  initialGuests = 2,
  variant = 'hero',
}: SearchBarProps) {
  const { navigate } = useRouter();
  const [destination, setDestination] = useState(initialDestination);
  const [destinationQuery, setDestinationQuery] = useState('');
  const [checkIn, setCheckIn] = useState(initialCheckIn);
  const [checkOut, setCheckOut] = useState(initialCheckOut);
  const [guests, setGuests] = useState(initialGuests);
  const [openDropdown, setOpenDropdown] = useState<'destination' | 'checkin' | 'checkout' | 'guests' | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (destination) params.set('destination', destination);
    if (checkIn) params.set('checkin', checkIn);
    if (checkOut) params.set('checkout', checkOut);
    if (guests) params.set('guests', String(guests));
    navigate(`/search?${params.toString()}`);
  };

  const filteredDestinations = destinations.filter(
    (d) =>
      d.name.toLowerCase().includes(destinationQuery.toLowerCase()) ||
      d.region?.toLowerCase().includes(destinationQuery.toLowerCase())
  );

  const selectedDest = destinations.find((d) => d.slug === destination);

  const today = todayStr();
  const minCheckout = checkIn || today;

  const isHero = variant === 'hero';

  return (
    <div
      ref={containerRef}
      className={`bg-white rounded-2xl shadow-2xl ${isHero ? 'p-4 sm:p-5' : 'p-3 sm:p-4 border border-gray-100'}`}
    >
      <div className={`grid grid-cols-1 ${isHero ? 'md:grid-cols-4' : 'sm:grid-cols-2 lg:grid-cols-4'} gap-3`}>
        {/* Destination */}
        <div className="relative">
          <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Destination</label>
          <button
            onClick={() => setOpenDropdown(openDropdown === 'destination' ? null : 'destination')}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border border-gray-200 hover:border-emerald-400 transition-colors text-left"
          >
            <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className={`text-sm flex-1 truncate ${selectedDest ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
              {selectedDest ? selectedDest.name : 'Search destination'}
            </span>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${openDropdown === 'destination' ? 'rotate-180' : ''}`} />
          </button>

          {openDropdown === 'destination' && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-gray-100 z-50 max-h-72 overflow-y-auto animate-slide-up">
              <div className="p-2">
                <input
                  type="text"
                  value={destinationQuery}
                  onChange={(e) => setDestinationQuery(e.target.value)}
                  placeholder="Search destinations..."
                  autoFocus
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none"
                />
              </div>
              <div className="px-2 pb-2">
                <button
                  onClick={() => { setDestination(''); setOpenDropdown(null); }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <span className="text-sm text-gray-700">All destinations</span>
                  {destination === '' && <Check className="w-4 h-4 text-emerald-600" />}
                </button>
                {filteredDestinations.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => { setDestination(d.slug); setDestinationQuery(''); setOpenDropdown(null); }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
                  >
                    <div>
                      <span className="text-sm font-medium text-gray-900">{d.name}</span>
                      <span className="text-xs text-gray-400 ml-2">{d.region}</span>
                    </div>
                    {destination === d.slug && <Check className="w-4 h-4 text-emerald-600" />}
                  </button>
                ))}
                {filteredDestinations.length === 0 && (
                  <p className="px-3 py-4 text-sm text-gray-400 text-center">No destinations found</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Check-in */}
        <div className="relative">
          <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Check-in</label>
          <button
            onClick={() => setOpenDropdown(openDropdown === 'checkin' ? null : 'checkin')}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border border-gray-200 hover:border-emerald-400 transition-colors text-left"
          >
            <Calendar className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className={`text-sm flex-1 ${checkIn ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
              {checkIn ? new Date(checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Add date'}
            </span>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${openDropdown === 'checkin' ? 'rotate-180' : ''}`} />
          </button>

          {openDropdown === 'checkin' && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-gray-100 z-50 p-3 animate-slide-up">
              <input
                type="date"
                value={checkIn}
                min={today}
                onChange={(e) => { setCheckIn(e.target.value); setOpenDropdown(null); }}
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none"
              />
              {checkIn && (
                <button
                  onClick={() => { setCheckIn(''); setOpenDropdown(null); }}
                  className="mt-2 flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700"
                >
                  <X className="w-3 h-3" /> Clear date
                </button>
              )}
            </div>
          )}
        </div>

        {/* Check-out */}
        <div className="relative">
          <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Check-out</label>
          <button
            onClick={() => setOpenDropdown(openDropdown === 'checkout' ? null : 'checkout')}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border border-gray-200 hover:border-emerald-400 transition-colors text-left"
          >
            <Calendar className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className={`text-sm flex-1 ${checkOut ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
              {checkOut ? new Date(checkOut).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Add date'}
            </span>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${openDropdown === 'checkout' ? 'rotate-180' : ''}`} />
          </button>

          {openDropdown === 'checkout' && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-gray-100 z-50 p-3 animate-slide-up">
              <input
                type="date"
                value={checkOut}
                min={minCheckout}
                onChange={(e) => { setCheckOut(e.target.value); setOpenDropdown(null); }}
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none"
              />
              {checkOut && (
                <button
                  onClick={() => { setCheckOut(''); setOpenDropdown(null); }}
                  className="mt-2 flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700"
                >
                  <X className="w-3 h-3" /> Clear date
                </button>
              )}
            </div>
          )}
        </div>

        {/* Guests */}
        <div className="relative">
          <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Guests</label>
          <button
            onClick={() => setOpenDropdown(openDropdown === 'guests' ? null : 'guests')}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border border-gray-200 hover:border-emerald-400 transition-colors text-left"
          >
            <Users className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className="text-sm flex-1 text-gray-900 font-medium">
              {guests} {guests === 1 ? 'Guest' : 'Guests'}
            </span>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${openDropdown === 'guests' ? 'rotate-180' : ''}`} />
          </button>

          {openDropdown === 'guests' && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-gray-100 z-50 p-4 animate-slide-up">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Guests</p>
                  <p className="text-xs text-gray-400">Adults & children</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setGuests(Math.max(1, guests - 1))}
                    className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:border-emerald-500 hover:text-emerald-600 transition-colors disabled:opacity-30"
                    disabled={guests <= 1}
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-semibold text-gray-900">{guests}</span>
                  <button
                    onClick={() => setGuests(Math.min(20, guests + 1))}
                    className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:border-emerald-500 hover:text-emerald-600 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 flex justify-center">
        <button
          onClick={handleSearch}
          className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-semibold hover:from-emerald-700 hover:to-teal-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
        >
          <Search className="w-5 h-5" />
          Search Hotels
        </button>
      </div>
    </div>
  );
}
