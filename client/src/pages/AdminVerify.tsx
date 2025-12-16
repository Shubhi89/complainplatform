import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShieldAlert, KeyRound, ArrowRight } from 'lucide-react';

const AdminVerify = () => {
  const navigate = useNavigate();
  const [secret, setSecret] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Send code to backend
      // Note: Proxy handles /api/admin -> /admin
      await axios.post('/api/admin/verify-secret', { secret });
      console.log(secret);
      
      // If successful, go to Dashboard
      navigate('/admin');
    } catch (err: any) {
      setError('Invalid Access Code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-700">
        
        <div className="p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-900/30 rounded-full mb-6 ring-1 ring-red-500/50">
            <ShieldAlert className="w-8 h-8 text-red-500" />
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2">Security Check</h2>
          <p className="text-gray-400 text-sm">
            Please enter the Master Administrator Key to proceed.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 pt-0 space-y-4">
          <div className="relative">
            <KeyRound className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
            <input
              type="password"
              placeholder="Enter Secret Key"
              className="w-full bg-gray-900 text-white pl-10 pr-4 py-3 rounded-xl border border-gray-700 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all placeholder-gray-600"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              autoFocus
            />
          </div>

          {error && (
            <div className="text-red-400 text-sm text-center bg-red-900/20 py-2 rounded-lg border border-red-900/50">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-red-900/20 flex items-center justify-center"
          >
            {loading ? 'Verifying...' : <>Unlock Dashboard <ArrowRight className="w-4 h-4 ml-2" /></>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminVerify;