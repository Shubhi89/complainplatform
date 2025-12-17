import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import {
  Building2,
  Copy,
  CheckCircle,
  Clock,
  AlertCircle,
  Filter,
  MessageSquare,
  Lock,
  ShieldAlert,
  LogOut,
} from "lucide-react";

interface Complaint {
  _id: string;
  complaintId: string;
  title: string;
  description: string;
  status: "PENDING" | "OPEN" | "RESOLVED" | "CLOSED";
  consumer: {
    displayName: string;
  };
  createdAt: string;
}

interface BusinessProfile {
  companyName: string;
  industry: string;
  status: string;
}

const BusinessDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [copySuccess, setCopySuccess] = useState("");
  const [isVerified, setIsVerified] = useState(false);

  // Fetch Complaints
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch Profile First
        const profileRes = await axios.get("/api/business/me");
        const userProfile = profileRes.data;
        setProfile(userProfile);

        // 2. Check Verification
        if (userProfile.status === "APPROVED") {
          setIsVerified(true);
          // Only fetch complaints if verified
          const complaintsRes = await axios.get("/api/complaints/tagged");
          setComplaints(complaintsRes.data);
        } else {
          setIsVerified(false);
        }
      } catch (error: any) {
        // Handle 403 (Not Verified) gracefully if it comes from the complaints route
        if (error.response?.data?.code === "NOT_VERIFIED") {
          setIsVerified(false);
        }
        console.error("Dashboard Sync Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle Status Update
  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      await axios.patch(`/api/complaints/${id}/status`, { status: newStatus });
      // Refresh list locally to show change immediately
      setComplaints((prev) =>
        prev.map((c) => (c._id === id ? { ...c, status: newStatus as any } : c))
      );
    } catch (error) {
      console.error("Failed to update status", error);
      alert("Failed to update status");
    }
  };

  // Helper to Copy Business ID

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "OPEN":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "RESOLVED":
        return "bg-green-100 text-green-800 border-green-200";
      case "CLOSED":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Responsive Header Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-100 rounded-xl">
              <Building2 className="w-8 h-8 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {profile?.companyName || user?.displayName}
              </h1>
            </div>
          </div>

          <div className="w-full md:w-auto flex items-center gap-3">
            <button
              onClick={logout}
              className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-2 transition"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
            {user?.isVerified ? (
              <div className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium border border-emerald-100 flex items-center">
                <CheckCircle className="w-4 h-4 mr-2" />
                Verified Business
              </div>
            ) : (
              <button
                onClick={() => navigate("/business/verify")}
                className="px-4 py-2 bg-orange-50 text-orange-700 border border-orange-200 rounded-lg text-sm font-medium flex items-center hover:bg-orange-100 transition"
              >
                <AlertCircle className="w-4 h-4 mr-2" />
                Verify Account
              </button>
            )}
          </div>
        </div>

        {/* Filters / Toolbar (Visual only for now) */}
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-500">Syncing business data...</p>
          </div>
        ) : !isVerified ? (
          /* 🔒 LOCKED STATE (Not Verified) */
          <div className="bg-white rounded-2xl shadow-sm border border-orange-200 p-10 text-center max-w-2xl mx-auto mt-10">
            <div className="bg-orange-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock className="w-10 h-10 text-orange-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Access to Complaints is Locked
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              To ensure trust and safety, you must verify your business identity
              before you can view and respond to consumer complaints.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {profile?.status === "PENDING" ? (
                <div className="px-6 py-3 bg-blue-50 text-blue-700 rounded-xl font-medium flex items-center border border-blue-200">
                  <Clock className="w-5 h-5 mr-2" />
                  Verification Pending Review
                </div>
              ) : (
                <button
                  onClick={() => navigate("/business/verify")}
                  className="px-8 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition shadow-lg shadow-gray-200 flex items-center justify-center"
                >
                  <ShieldAlert className="w-5 h-5 mr-2" />
                  Submit Verification
                </button>
              )}
            </div>
          </div>
        ) : (
          /* ✅ UNLOCKED STATE (Verified) */
          <>
            {/* Filters */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                Incoming Complaints
              </h2>
              <button className="p-2 text-gray-500 hover:bg-white hover:shadow-sm rounded-lg transition-all">
                <Filter className="w-5 h-5" />
              </button>
            </div>

            {/* Complaints Grid */}
            {complaints.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100 border-dashed">
                <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-medium text-gray-900">
                  All caught up!
                </h3>
                <p className="text-gray-500 mt-2">
                  No active complaints found for your business ID.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {complaints.map((complaint) => (
                  <div
                    key={complaint._id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col"
                  >
                    <div className="p-6 border-b border-gray-50 flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-1 rounded">
                            #{complaint.complaintId}
                          </span>
                          <span className="text-xs text-gray-400 flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {new Date(complaint.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                          {complaint.title}
                        </h3>
                        <p className="text-sm text-gray-500">
                          From:{" "}
                          <span className="font-medium text-gray-700">
                            {complaint.consumer?.displayName || "Anonymous"}
                          </span>
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(
                          complaint.status
                        )}`}
                      >
                        {complaint.status}
                      </span>
                    </div>

                    <div className="p-6 bg-gray-50/50 flex-grow">
                      <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                        {complaint.description}
                      </p>
                    </div>

                    <div className="p-4 bg-white border-t border-gray-100 flex gap-3">
                      {complaint.status !== "RESOLVED" && (
                        <button
                          onClick={() =>
                            handleStatusUpdate(complaint._id, "RESOLVED")
                          }
                          className="flex-1 bg-emerald-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
                        >
                          Resolve
                        </button>
                      )}
                      {complaint.status === "PENDING" && (
                        <button
                          onClick={() =>
                            handleStatusUpdate(complaint._id, "OPEN")
                          }
                          className="flex-1 bg-white border border-gray-200 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                        >
                          Accept
                        </button>
                      )}
                      <button
                        onClick={() => navigate(`/complaint/${complaint._id}`)}
                        className="flex-1 bg-indigo-50 border border-indigo-100 text-indigo-700 py-2 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors"
                      >
                        View Thread
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BusinessDashboard;
