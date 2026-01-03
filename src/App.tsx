import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { isSupabaseConfigured } from './lib/supabase';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Trips from './pages/Trips';
import NewTrip from './pages/NewTrip';
import TripDetail from './pages/TripDetail';
import AddStop from './pages/AddStop';
import AddActivity from './pages/AddActivity';
import Profile from './pages/Profile';
import SharedTrip from './pages/SharedTrip';

function App() {
  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="max-w-xl w-full bg-white rounded-lg border border-gray-200 p-6">
          <h1 className="text-xl font-semibold text-gray-900">Configuration required</h1>
          <p className="mt-2 text-gray-600">
            This app needs Supabase environment variables to run.
          </p>
          <div className="mt-4 text-sm text-gray-700">
            <p className="font-medium">Add these to a <code className="font-mono">.env</code> file in the project root:</p>
            <pre className="mt-2 overflow-auto rounded bg-gray-50 border border-gray-200 p-3">
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
            </pre>
            <p className="mt-3">Then restart the dev server.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/shared/:id" element={<SharedTrip />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trips"
            element={
              <ProtectedRoute>
                <Trips />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trips/new"
            element={
              <ProtectedRoute>
                <NewTrip />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trips/:id"
            element={
              <ProtectedRoute>
                <TripDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trips/:id/add-stop"
            element={
              <ProtectedRoute>
                <AddStop />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trips/:id/stops/:stopId/add-activity"
            element={
              <ProtectedRoute>
                <AddActivity />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
