export function formatBDT(amount: number): string {
  return new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency: 'BDT',
    maximumFractionDigits: 0,
  }).format(amount).replace('BDT', '৳');
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function daysBetween(checkIn: string, checkOut: string): number {
  const start = new Date(checkIn).getTime();
  const end = new Date(checkOut).getTime();
  return Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
}

export function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

export function tomorrowStr(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

export function amenityIcon(amenity: string): string {
  const map: Record<string, string> = {
    'Free WiFi': 'wifi',
    'Swimming Pool': 'waves',
    'Spa': 'flower',
    'Fitness Center': 'dumbbell',
    'Restaurant': 'utensils',
    'Bar': 'wine',
    'Business Center': 'briefcase',
    'Parking': 'car',
    'Airport Shuttle': 'plane',
    'Room Service': 'bell',
    'Concierge': 'bell-ring',
    'Beach Access': 'umbrella',
    'Water Sports': 'sailboat',
    'Garden': 'trees',
    'Tour Desk': 'map',
    'Campfire': 'flame',
    'Boat Tours': 'sailboat',
    'Nature Walks': 'footprints',
    'Snorkeling': 'fish',
    'Seafood': 'fish',
    'Laundry': 'shirt',
  };
  return map[amenity] ?? 'check';
}
