import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Plane, MapPin, Calendar, DollarSign, Clock, Copy, Check } from 'lucide-react';

interface Trip {
  id: string;
  name: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
}

interface TripStop {
  id: string;
  city: {
    id: string;
    name: string;
    country: string;
    image_url: string | null;
  };
  arrival_date: string | null;
  departure_date: string | null;
  activities: StopActivity[];
}

interface StopActivity {
  id: string;
  activity: {
    name: string;
    category: string;
    estimated_cost: number;
    estimated_duration_hours: number;
  };
}

export default function SharedTrip() {
  const { id } = useParams<{ id: string }>();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [stops, setStops] = useState<TripStop[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (id) {
      loadTrip();
    }
  }, [id]);

  const loadTrip = async () => {
    const { data: tripData } = await supabase
      .from('trips')
      .select('*')
      .eq('id', id!)
      .eq('is_public', true)
      .maybeSingle();

    if (tripData) {
      setTrip(tripData);

      const { data: stopsData } = await supabase
        .from('trip_stops')
        .select(
          `
          id,
          arrival_date,
          departure_date,
          city:cities(id, name, country, image_url)
        `
        )
        .eq('trip_id', id!)
        .order('order_index', { ascending: true });

      if (stopsData) {
        const stopsWithActivities = await Promise.all(
          stopsData.map(async (stop: any) => {
            const { data: activitiesData } = await supabase
              .from('stop_activities')
              .select(
                `
                id,
                activity:activities(name, category, estimated_cost, estimated_duration_hours)
              `
              )
              .eq('stop_id', stop.id);

            return {
              ...stop,
              activities: activitiesData || [],
            };
          })
        );

        setStops(stopsWithActivities);
      }
    }

    setLoading(false);
  };

  const calculateTotalBudget = () => {
    let total = 0;
    stops.forEach((stop) => {
      stop.activities.forEach((activity) => {
        total += activity.activity.estimated_cost;
      });
    });
    return total;
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Trip not found or not public</h2>
          <Link to="/login" className="text-blue-600 hover:text-blue-700">
            Sign in to GlobeTrotter
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/login" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <Plane className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">GlobeTrotter</span>
            </Link>
            <div className="flex items-center space-x-4">
              <button
                onClick={copyLink}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied!' : 'Share'}</span>
              </button>
              <Link
                to="/login"
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 mb-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">{trip.name}</h1>
            {trip.description && <p className="text-xl text-gray-600 mb-6">{trip.description}</p>}
            <div className="flex flex-wrap items-center justify-center gap-6 text-gray-600">
              {trip.start_date && trip.end_date && (
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  <span>
                    {new Date(trip.start_date).toLocaleDateString()} -{' '}
                    {new Date(trip.end_date).toLocaleDateString()}
                  </span>
                </div>
              )}
              <div className="flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                <span>
                  {stops.length} {stops.length === 1 ? 'destination' : 'destinations'}
                </span>
              </div>
              <div className="flex items-center">
                <DollarSign className="w-5 h-5 mr-2" />
                <span>${calculateTotalBudget().toFixed(2)} estimated</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {stops.map((stop, index) => (
            <div key={stop.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="md:flex">
                <div className="md:w-80 h-64 md:h-auto bg-gray-200 flex-shrink-0">
                  {stop.city.image_url && (
                    <img
                      src={stop.city.image_url}
                      alt={stop.city.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1 p-8">
                  <div className="flex items-start mb-4">
                    <span className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-4 flex-shrink-0">
                      {index + 1}
                    </span>
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900 mb-1">{stop.city.name}</h2>
                      <p className="text-lg text-gray-600">{stop.city.country}</p>
                      {stop.arrival_date && stop.departure_date && (
                        <div className="flex items-center text-sm text-gray-600 mt-2">
                          <Calendar className="w-4 h-4 mr-2" />
                          {new Date(stop.arrival_date).toLocaleDateString()} -{' '}
                          {new Date(stop.departure_date).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>

                  {stop.activities.length > 0 && (
                    <div className="mt-6">
                      <h3 className="font-semibold text-gray-900 mb-4">Activities</h3>
                      <div className="space-y-3">
                        {stop.activities.map((activity) => (
                          <div
                            key={activity.id}
                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Clock className="w-6 h-6 text-blue-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{activity.activity.name}</p>
                                <p className="text-sm text-gray-600">
                                  {activity.activity.category} • {activity.activity.estimated_duration_hours}h
                                </p>
                              </div>
                            </div>
                            <p className="font-semibold text-gray-900 text-lg">
                              ${activity.activity.estimated_cost.toFixed(2)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">Inspired by this trip?</p>
          <Link
            to="/signup"
            className="inline-flex items-center px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl font-semibold text-lg"
          >
            <Plane className="w-6 h-6 mr-3" />
            Create Your Own Trip on GlobeTrotter
          </Link>
        </div>
      </div>
    </div>
  );
}
