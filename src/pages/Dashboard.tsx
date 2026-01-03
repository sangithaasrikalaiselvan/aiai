import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import Layout from '../components/Layout';
import { Plus, MapPin, Calendar, TrendingUp } from 'lucide-react';

interface Trip {
  id: string;
  name: string;
  start_date: string | null;
  end_date: string | null;
  cover_photo_url: string | null;
}

interface City {
  id: string;
  name: string;
  country: string;
  image_url: string | null;
  popularity_score: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [popularCities, setPopularCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{ full_name: string | null }>({ full_name: null });

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    const [profileRes, tripsRes, citiesRes] = await Promise.all([
      supabase.from('profiles').select('full_name').eq('id', user!.id).maybeSingle(),
      supabase
        .from('trips')
        .select('id, name, start_date, end_date, cover_photo_url')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(3),
      supabase
        .from('cities')
        .select('id, name, country, image_url, popularity_score')
        .order('popularity_score', { ascending: false })
        .limit(6),
    ]);

    if (profileRes.data) setProfile(profileRes.data);
    if (tripsRes.data) setTrips(tripsRes.data);
    if (citiesRes.data) setPopularCities(citiesRes.data);
    setLoading(false);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {profile.full_name || 'Traveler'}
          </h1>
          <p className="text-gray-600">Plan your next adventure or continue where you left off</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Link
            to="/trips/new"
            className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-8 text-white hover:shadow-xl transition-all group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Plus className="w-6 h-6" />
              </div>
              <Calendar className="w-8 h-8 opacity-50" />
            </div>
            <h3 className="text-xl font-bold mb-2">Plan New Trip</h3>
            <p className="text-blue-100">Start creating your next adventure</p>
          </Link>

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <MapPin className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{trips.length}</h3>
            <p className="text-gray-600">Total Trips</p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Explore</h3>
            <p className="text-gray-600">Discover destinations</p>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Your Recent Trips</h2>
            <Link to="/trips" className="text-blue-600 hover:text-blue-700 font-medium">
              View all
            </Link>
          </div>
          {trips.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-200">
              <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No trips yet</h3>
              <p className="text-gray-600 mb-6">Start planning your first adventure!</p>
              <Link
                to="/trips/new"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Your First Trip
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {trips.map((trip) => (
                <Link
                  key={trip.id}
                  to={`/trips/${trip.id}`}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200 hover:shadow-lg transition-all group"
                >
                  <div className="h-48 bg-gradient-to-br from-blue-400 to-cyan-400 relative overflow-hidden">
                    {trip.cover_photo_url && (
                      <img
                        src={trip.cover_photo_url}
                        alt={trip.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{trip.name}</h3>
                    {trip.start_date && trip.end_date && (
                      <p className="text-sm text-gray-600">
                        {new Date(trip.start_date).toLocaleDateString()} -{' '}
                        {new Date(trip.end_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular Destinations</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {popularCities.map((city) => (
              <Link
                key={city.id}
                to={`/cities/${city.id}`}
                className="group relative rounded-xl overflow-hidden aspect-square hover:shadow-lg transition-all"
              >
                <img
                  src={city.image_url || 'https://images.pexels.com/photos/1371360/pexels-photo-1371360.jpeg'}
                  alt={city.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-white font-bold text-sm">{city.name}</h3>
                  <p className="text-white/80 text-xs">{city.country}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
