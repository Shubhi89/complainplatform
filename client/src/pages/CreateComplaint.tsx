import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Send, Search, Building2, CheckCircle, ChevronDown } from 'lucide-react';

interface Business {
  _id: string;        // Profile ID
  user: string;       // User ID (Target for the complaint)
  companyName: string;
  industry: string;
}

const CreateComplaint = () => {
  const navigate = useNavigate();
  
  // Form Data
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedBusinessId, setSelectedBusinessId] = useState('');

  // Search / Dropdown State
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 1. Fetch Verified Businesses on Mount
  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const res = await axios.get('/api/business/verified');
        setBusinesses(res.data);
      } catch (err) {
        console.error("Failed to fetch businesses");
      }
    };
    fetchBusinesses();

    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter Logic
  const filteredBusinesses = businesses.filter(b => 
    b.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.industry.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectBusiness = (business: Business) => {
    setSelectedBusinessId(business.user); // Save the User ID (for backend)
    setSearchTerm(business.companyName);  // Show Name in input
    setIsDropdownOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBusinessId) {
      setError("Please select a valid business from the list.");
      return;
    }

    setLoading(true);
    setError('');

    try {
      await axios.post('/api/complaints', {
        title,
        description,
        businessId: selectedBusinessId
      });
      navigate('/dashboard/consumer');
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to submit complaint');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-2xl mx-auto">
        
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-500 hover:text-gray-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Dashboard
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">File a Complaint</h1>
          <p className="text-gray-500 mb-8">Select a verified business and describe your issue.</p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100 flex items-center">
              <span className="mr-2">⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                placeholder="e.g., Damaged product received"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* SEARCHABLE DROPDOWN */}
            <div className="relative" ref={dropdownRef}>
              <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
              
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                   <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  required
                  className="w-full pl-10 pr-10 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                  placeholder="Search for a business..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setSelectedBusinessId(''); // Reset selection on type
                    setIsDropdownOpen(true);
                  }}
                  onFocus={() => setIsDropdownOpen(true)}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                   <ChevronDown className="h-4 w-4 text-gray-400" />
                </div>
              </div>

              {/* Dropdown List */}
              {isDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                   {filteredBusinesses.length === 0 ? (
                      <div className="p-4 text-center text-gray-500 text-sm">No verified businesses found.</div>
                   ) : (
                      filteredBusinesses.map((b) => (
                        <div
                          key={b._id}
                          onClick={() => handleSelectBusiness(b)}
                          className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center justify-between group transition-colors"
                        >
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 mr-3">
                               <Building2 className="w-4 h-4" />
                            </div>
                            <div>
                               <p className="font-medium text-gray-900">{b.companyName}</p>
                               <p className="text-xs text-gray-500">{b.industry}</p>
                            </div>
                          </div>
                          {/* Selection Indicator */}
                          {b.companyName === searchTerm && (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          )}
                        </div>
                      ))
                   )}
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                required
                rows={5}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all resize-none"
                placeholder="Describe what happened..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex items-center justify-center bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-all ${
                loading ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-lg'
              }`}
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Complaint
                </>
              )}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateComplaint;