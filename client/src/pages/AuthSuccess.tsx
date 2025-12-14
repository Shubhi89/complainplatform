import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const AuthSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { checkAuth } = useAuth();

  useEffect(() => {
    const handleLogin = async () => {
      // 1. Get Token from URL (if your backend sends it this way)
      const token = searchParams.get('token');

      if (token) {
        // Save token to LocalStorage (so axios can use it)
        localStorage.setItem('token', token);
        
        // Configure Axios to use this token for all future requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // 2. Force a check: "Who am I?"
        await checkAuth();

        // 3. We need to decide where to go. 
        // We will do this by fetching the user profile again or trusting checkAuth
        // For now, let's redirect to a temporary "router" page or root
        navigate('/'); 
      } else {
        // If no token, something went wrong. Back to login.
        navigate('/login');
      }
    };

    handleLogin();
  }, [searchParams, navigate, checkAuth]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-700">Verifying Login...</h2>
        <p className="text-gray-500">Please wait a moment.</p>
        <div className="mt-4 w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    </div>
  );
};

export default AuthSuccess;