import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export type Destination = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  region: string | null;
  hotels_count: number;
};

export type Hotel = {
  id: string;
  name: string;
  slug: string;
  destination_id: string;
  description: string | null;
  address: string | null;
  star_rating: number;
  price_per_night: number;
  currency: string;
  image_url: string | null;
  gallery: string[];
  amenities: string[];
  latitude: number | null;
  longitude: number | null;
  rating: number;
  reviews_count: number;
  property_type: string;
  check_in_time: string;
  check_out_time: string;
  destination?: Destination;
};

export type Room = {
  id: string;
  hotel_id: string;
  name: string;
  description: string | null;
  max_guests: number;
  bed_type: string;
  price_per_night: number;
  image_url: string | null;
  total_rooms: number;
};

export type Review = {
  id: string;
  hotel_id: string;
  user_id: string | null;
  author_name: string;
  rating: number;
  title: string | null;
  comment: string | null;
  created_at: string;
};

export type Booking = {
  id: string;
  user_id: string;
  hotel_id: string;
  room_id: string | null;
  check_in: string;
  check_out: string;
  guests: number;
  total_price: number;
  status: string;
  created_at: string;
  hotel?: Hotel;
  room?: Room;
};

export type Favorite = {
  id: string;
  user_id: string;
  hotel_id: string;
  hotel?: Hotel;
};
