import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const AuthSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { checkAuth } = useAuth();
  const [status, setStatus] = useState("Processing...");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const handleLogin = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        setStatus("Error: No token found in URL");
        return;
      }

      setStatus("Token found. Verifying...");
      
      // 1. Store Token
      localStorage.setItem('token', token);
      
      // 2. Set Header for Axios
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      try {
        // 3. Verify with Backend
        console.log("Sending request to /api/auth/current_user...");
        await checkAuth();
        
        setStatus("Success! Redirecting...");
        // Wait 1 second so you can see the success message before moving
        setTimeout(() => navigate('/'), 1000); 

      } catch (err: any) {
        console.error("Login Failed:", err);
        // CRITICAL: We do NOT redirect to login here so you can read the error
        setStatus("Verification Failed.");
        setErrorMsg(err.response?.data?.message || err.message || "Unknown Error");
      }
    };

    handleLogin();
  }, [searchParams, navigate, checkAuth]);

  return (
    <div className="p-10 text-center">
      <h2 className="text-2xl font-bold mb-4">{status}</h2>
      {errorMsg && (
        <div className="bg-red-100 text-red-700 p-4 rounded text-left mx-auto max-w-lg">
          <p className="font-bold">Error Details:</p>
          <pre>{errorMsg}</pre>
          <p className="mt-4 text-sm">Check the Console (F12) for more info.</p>
        </div>
      )}
    </div>
  );
};

export default AuthSuccess;