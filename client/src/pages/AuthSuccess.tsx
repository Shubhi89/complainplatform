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
      const token = searchParams.get('token');
      console.log("1. AuthSuccess Loaded. Token found?", !!token);

      if (token) {
        localStorage.setItem('token', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        console.log("2. Token saved. Attempting checkAuth...");
        try {
          await checkAuth();
          console.log("3. checkAuth success! Redirecting to home...");
          navigate('/'); 
        } catch (err) {
          console.error("3. checkAuth FAILED:", err);
          navigate('/login');
        }
      } else {
        console.error("1. No token in URL. Redirecting to login.");
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