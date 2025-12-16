import { useEffect, useState } from 'react';
import axios from 'axios';
import { ShieldCheck, FileText, Check, X, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface BusinessRequest {
  _id: string;
  companyName: string;
  industry: string;
  description: string;
  documentUrl: string;
  submittedAt: string;
  user: {
    email: string;
    displayName: string;
  };
}

const AdminDashboard = () => {
  const [requests, setRequests] = useState<BusinessRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const navigate = useNavigate();

  // Fetch Pending Requests
  const fetchRequests = async () => {
  try {
    const res = await axios.get('/api/admin/pending-verifications');
    setRequests(res.data);
    setIsAuthorized(true);
  } catch (error: any) {
    // SECURITY CHECK:
    if (
        error.response?.status === 403 && 
        (error.response?.data?.code === 'SECRET_REQUIRED' || error.response?.data?.requiresSecret)
      ) {
        // Redirect to the secret entry page
        navigate('/admin/verify');
        return;
      }
    console.error("Error fetching requests", error);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchRequests();
  }, []);

  if (loading || !isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Verifying Admin Access...</p>
        </div>
      </div>
    );
  }

  // Handle Approval / Rejection
  const handleDecision = async (id: string, action: 'APPROVED' | 'REJECTED') => {
    if (!confirm(`Are you sure you want to ${action} this business?`)) return;

    try {
      await axios.post('/api/admin/approve-business', {
        profileId: id,
        action: action
      });
      
      // Remove from list
      setRequests(prev => prev.filter(req => req._id !== id));
      alert(`Business ${action} successfully`);
    } catch (error) {
      console.error("Action failed", error);
      alert("Failed to process request");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        
        <div className="flex items-center mb-8">
          <div className="bg-red-600 p-3 rounded-lg mr-4 text-white">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Control Center</h1>
            <p className="text-gray-500">Manage platform security and business verifications</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gray-50">
            <h2 className="text-xl font-bold text-gray-800">Pending Verifications ({requests.length})</h2>
          </div>

          {loading ? (
            <div className="p-10 text-center text-gray-500">Loading requests...</div>
          ) : requests.length === 0 ? (
            <div className="p-20 text-center">
              <ShieldCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">All Clear!</h3>
              <p className="text-gray-500">No pending business verifications at the moment.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {requests.map((req) => (
                <div key={req._id} className="p-6 flex flex-col lg:flex-row gap-6 hover:bg-gray-50 transition">
                  
                  {/* Info Section */}
                  <div className="flex-grow">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{req.companyName}</h3>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full">
                        {req.industry}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4">{req.description}</p>
                    
                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      <div>
                        <span className="font-semibold">Applicant:</span> {req.user.displayName}
                      </div>
                      <div>
                        <span className="font-semibold">Email:</span> {req.user.email}
                      </div>
                      <div>
                        <span className="font-semibold">Submitted:</span> {new Date(req.submittedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {/* Actions Section */}
                  <div className="flex flex-col gap-3 min-w-[200px]">
                    <a 
                      href={req.documentUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-full py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 text-sm font-medium transition"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      View Document <ExternalLink className="w-3 h-3 ml-1" />
                    </a>

                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleDecision(req._id, 'APPROVED')}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg text-sm font-medium flex items-center justify-center transition"
                      >
                        <Check className="w-4 h-4 mr-1" /> Approve
                      </button>
                      
                      <button 
                        onClick={() => handleDecision(req._id, 'REJECTED')}
                        className="flex-1 bg-white border border-red-200 text-red-600 hover:bg-red-50 py-2 rounded-lg text-sm font-medium flex items-center justify-center transition"
                      >
                        <X className="w-4 h-4 mr-1" /> Reject
                      </button>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;