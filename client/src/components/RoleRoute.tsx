import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { JSX } from 'react/jsx-runtime';

// This component checks if the user has the correct role
export const RoleRoute = ({ children, allowedRoles }: { children: JSX.Element, allowedRoles: string[] }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) return <div className="p-10">Loading Route...</div>;

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// --- DEBUG VERSION OF ROOT REDIRECT ---
export const RootRedirect = () => {
  const { user, loading, isAuthenticated } = useAuth();

  // 1. Check if stuck loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-yellow-50">
        <div className="text-xl font-bold text-yellow-700">
          ⚠️ App is stuck in "Loading" state. 
          <br/>
          <span className="text-sm font-normal text-black">
            This usually means the Backend connection (checkAuth) is hanging.
          </span>
        </div>
      </div>
    );
  }

  // 2. Check if not authenticated (but didn't redirect)
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 p-10">
        <h2 className="text-2xl font-bold text-red-600 mb-2">Not Authenticated</h2>
        <p>The app thinks you are NOT logged in.</p>
        <button 
          onClick={() => window.location.href = '/login'}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded"
        >
          Go to Login
        </button>
      </div>
    );
  }

  // 3. Show User Data (If authenticated)
  return (
    <div className="min-h-screen p-10 bg-gray-50">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">🕵️‍♂️ Auth Debugger</h1>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 max-w-lg">
        <h2 className="text-lg font-semibold border-b pb-2 mb-4">Current User Data</h2>
        
        <div className="space-y-3">
          <p><strong>ID:</strong> <span className="font-mono text-gray-600">{user._id}</span></p>
          <p><strong>Email:</strong> {user.email}</p>
          <p>
            <strong>Role (Raw DB Value):</strong> 
            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm font-bold">
              "{user.role}"
            </span>
          </p>
        </div>

        <div className="mt-6 pt-4 border-t">
          <p className="font-semibold mb-2">Where should I go?</p>
          {user.role === 'CONSUMER' && <p className="text-green-600">✅ Should go to Consumer Dashboard</p>}
          {user.role === 'BUSINESS' && <p className="text-green-600">✅ Should go to Business Dashboard</p>}
          {user.role === 'ADMIN' && <p className="text-green-600">✅ Should go to Admin Dashboard</p>}
          
          {/* Check for mismatch */}
          {user.role !== 'CONSUMER' && user.role !== 'BUSINESS' && user.role !== 'ADMIN' && (
            <p className="text-red-600 font-bold">
              ❌ ERROR: Role "{user.role}" does not match known roles!
            </p>
          )}
        </div>

        <button 
          onClick={() => {
             if(user.role === 'CONSUMER') window.location.href = '/dashboard/consumer';
             if(user.role === 'BUSINESS') window.location.href = '/dashboard/business';
          }}
          className="mt-6 w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Manually Force Redirect
        </button>
      </div>
    </div>
  );
};