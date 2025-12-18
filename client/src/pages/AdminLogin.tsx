import { useState } from "react";
import { ShieldCheck, Lock, ArrowLeft } from "lucide-react";

const AdminLogin = () => {
  const [loading, setLoading] = useState(false);

  const handleAdminLogin = () => {
    setLoading(true);
    // Force the role to ADMIN
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
    window.location.href = `${apiUrl}/api/auth/google?role=ADMIN`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header Section */}
        <div className="bg-red-700 p-8 text-center relative">
          <div className="absolute top-4 left-4">
            <a
              href="/login"
              className="text-red-200 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </a>
          </div>
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-800 rounded-full mb-4 shadow-inner">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-wide">
            Admin Portal
          </h1>
          <p className="text-red-200 text-sm mt-1">Authorized Person Only</p>
        </div>

        {/* Login Body */}
        <div className="p-10">
          <div className="text-center mb-8">
            <p className="text-gray-500 text-sm">
              Please sign in to access the secure administrative dashboard.
            </p>
          </div>

          <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-8 flex items-start">
            <Lock className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
            <p className="text-xs text-red-700 leading-relaxed">
              Access to this area is monitored. All activities are logged for
              security purposes.
            </p>
          </div>

          <button
            onClick={handleAdminLogin}
            disabled={loading}
            className="w-full flex items-center justify-center py-4 bg-gray-900 hover:bg-black text-white rounded-xl font-bold text-lg shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <>
                <img
                  src="https://www.svgrepo.com/show/475656/google-color.svg"
                  className="w-5 h-5 mr-3 bg-white rounded-full p-0.5"
                  alt="G"
                />
                Sign in as Administrator
              </>
            )}
          </button>

          <div className="mt-8 text-center">
            <p className="text-xs text-gray-400">Platform Version v1.0.0</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
