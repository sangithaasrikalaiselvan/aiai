import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Layout from '../components/Layout';
import { ArrowLeft, Search, Clock, DollarSign, Tag } from 'lucide-react';

interface Activity {
  id: string;
  name: string;
  description: string | null;
  category: string;
  estimated_cost: number;
  estimated_duration_hours: number;
  image_url: string | null;
}

export default function AddActivity() {
  const { id: tripId, stopId } = useParams<{ id: string; stopId: string }>();
  const navigate = useNavigate();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [cityId, setCityId] = useState<string | null>(null);

  useEffect(() => {
    loadStopAndActivities();
  }, [stopId]);

  useEffect(() => {
    let filtered = activities;

    if (categoryFilter !== 'all') {
      filtered = filtered.filter((a) => a.category === categoryFilter);
    }

    if (searchQuery) {
      filtered = filtered.filter((a) =>
        a.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredActivities(filtered);
  }, [searchQuery, categoryFilter, activities]);

  const loadStopAndActivities = async () => {
    const { data: stopData } = await supabase
      .from('trip_stops')
      .select('city_id')
      .eq('id', stopId!)
      .maybeSingle();

    if (stopData) {
      setCityId(stopData.city_id);
      const { data: activitiesData } = await supabase
        .from('activities')
        .select('*')
        .eq('city_id', stopData.city_id);

      if (activitiesData) {
        setActivities(activitiesData);
        setFilteredActivities(activitiesData);
      }
    }
    setLoading(false);
  };

  const toggleActivity = (activityId: string) => {
    if (selectedActivities.includes(activityId)) {
      setSelectedActivities(selectedActivities.filter((id) => id !== activityId));
    } else {
      setSelectedActivities([...selectedActivities, activityId]);
    }
  };

  const handleAddActivities = async () => {
    if (selectedActivities.length === 0) {
      alert('Please select at least one activity');
      return;
    }

    setSubmitting(true);

    const inserts = selectedActivities.map((activityId) => ({
      stop_id: stopId!,
      activity_id: activityId,
    }));

    const { error } = await supabase.from('stop_activities').insert(inserts);

    if (!error) {
      navigate(`/trips/${tripId}`);
    } else {
      alert('Error adding activities. Please try again.');
      setSubmitting(false);
    }
  };

  const categories = Array.from(new Set(activities.map((a) => a.category)));

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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate(`/trips/${tripId}`)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to trip
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Add Activities</h1>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search activities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {filteredActivities.map((activity) => (
            <div
              key={activity.id}
              onClick={() => toggleActivity(activity.id)}
              className={`bg-white rounded-xl overflow-hidden cursor-pointer transition-all ${
                selectedActivities.includes(activity.id)
                  ? 'ring-2 ring-blue-600 shadow-lg'
                  : 'hover:shadow-md border border-gray-200'
              }`}
            >
              <div className="h-48 bg-gray-200 relative">
                {activity.image_url && (
                  <img src={activity.image_url} alt={activity.name} className="w-full h-full object-cover" />
                )}
                {selectedActivities.includes(activity.id) && (
                  <div className="absolute inset-0 bg-blue-600/20 flex items-center justify-center">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-bold text-gray-900 mb-2">{activity.name}</h3>
                {activity.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{activity.description}</p>
                )}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-gray-600">
                    <Clock className="w-4 h-4 mr-1" />
                    {activity.estimated_duration_hours}h
                  </div>
                  <div className="flex items-center text-gray-600">
                    <DollarSign className="w-4 h-4 mr-1" />
                    {activity.estimated_cost.toFixed(0)}
                  </div>
                </div>
                <div className="mt-2">
                  <span className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs font-medium">
                    <Tag className="w-3 h-3 mr-1" />
                    {activity.category}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {selectedActivities.length > 0 && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white rounded-xl shadow-2xl border border-gray-200 p-6 max-w-md w-full mx-4">
            <p className="text-gray-900 font-semibold mb-4">
              {selectedActivities.length} {selectedActivities.length === 1 ? 'activity' : 'activities'} selected
            </p>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleAddActivities}
                disabled={submitting}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
              >
                {submitting ? 'Adding...' : 'Add to Trip'}
              </button>
              <button
                onClick={() => setSelectedActivities([])}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
