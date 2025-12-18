import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  ShieldCheck,
  Users,
  Building2,
  CheckCircle,
  FileText,
  ExternalLink,
  ShieldAlert,
  TrendingUp,
  LogOut,
} from "lucide-react";

interface DashboardStats {
  totalUsers: number;
  totalBusinesses: number;
  verifiedBusinesses: number;
  pendingVerifications: number;
}

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [verifications, setVerifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const { logout } = useAuth();

  // Fetch Data
  const fetchData = async () => {
    try {
      const [statsRes, verifyRes] = await Promise.all([
        axios.get("/api/admin/stats"),
        axios.get("/api/admin/pending-verifications"),
      ]);

      setStats(statsRes.data);
      setVerifications(verifyRes.data);
      setIsAuthorized(true);
    } catch (error: any) {
      console.error("Dashboard Error:", error);

      // Handle the Secret Code Redirect
      if (
        error.response?.status === 403 &&
        (error.response?.data?.code === "SECRET_REQUIRED" ||
          error.response?.data?.requiresSecret)
      ) {
        navigate("/admin/verify");
        return;
      }

      setErrorMsg("Access Denied or Server Error.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Action Handlers
  const handleApprove = async (id: string, action: "APPROVED" | "REJECTED") => {
    if (!confirm(`Are you sure you want to ${action} this business?`)) return;
    try {
      await axios.post("/api/admin/approve-business", {
        profileId: id,
        action,
      });

      setVerifications((prev) => prev.filter((req) => req._id !== id));
      if (action === "APPROVED" && stats) {
        setStats({
          ...stats,
          verifiedBusinesses: stats.verifiedBusinesses + 1,
          pendingVerifications: stats.pendingVerifications - 1,
        });
      }
    } catch (err) {
      alert("Action failed");
    }
  };

  if (loading && !isAuthorized)
    return <div className="p-10 text-center">Loading Dashboard...</div>;
  if (!isAuthorized && errorMsg)
    return <div className="p-10 text-center text-red-600">{errorMsg}</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <div className="bg-gray-900 p-3 rounded-xl mr-4 text-white shadow-lg">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Admin Overview
              </h1>
              <p className="text-gray-500">
                Platform performance & pending actions
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-100 hover:text-red-600 transition font-medium shadow-sm"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>

        {/* --- STATS ROW --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex items-center justify-between hover:shadow-md transition">
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">
                Total Consumers
              </p>
              <h2 className="text-3xl font-bold text-gray-900">
                {stats?.totalUsers || 0}
              </h2>
            </div>
            <div className="bg-blue-50 p-3 rounded-full">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex items-center justify-between hover:shadow-md transition">
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">
                Total Businesses
              </p>
              <h2 className="text-3xl font-bold text-gray-900">
                {stats?.totalBusinesses || 0}
              </h2>
            </div>
            <div className="bg-indigo-50 p-3 rounded-full">
              <Building2 className="w-6 h-6 text-indigo-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex items-center justify-between hover:shadow-md transition">
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">
                Verified Businesses
              </p>
              <div className="flex items-end gap-2">
                <h2 className="text-3xl font-bold text-gray-900">
                  {stats?.verifiedBusinesses || 0}
                </h2>
                <span className="text-xs text-green-600 font-medium mb-1 bg-green-50 px-2 py-0.5 rounded-full flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" /> Live
                </span>
              </div>
            </div>
            <div className="bg-emerald-50 p-3 rounded-full">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>

        {/* --- PENDING ACTIONS SECTION --- */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <div className="flex items-center gap-3">
              <div className="bg-orange-100 p-2 rounded-lg">
                <ShieldAlert className="w-5 h-5 text-orange-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">
                Pending Verifications
              </h2>
            </div>
            <span className="text-sm font-bold bg-gray-900 text-white px-3 py-1 rounded-full">
              {verifications.length} Pending
            </span>
          </div>

          <div className="divide-y divide-gray-100">
            {verifications.length === 0 ? (
              <div className="p-12 text-center">
                <CheckCircle className="w-12 h-12 text-green-200 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">
                  All caught up! No pending requests.
                </p>
              </div>
            ) : (
              verifications.map((req) => (
                <div
                  key={req._id}
                  className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-gray-50 transition"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-lg text-gray-900">
                        {req.companyName}
                      </h3>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded border border-gray-200">
                        {req.industry}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-2">
                      {req.user?.email}
                    </p>

                    <a
                      href={req.documentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center text-sm text-indigo-600 font-medium hover:text-indigo-800 hover:underline"
                    >
                      <FileText className="w-4 h-4 mr-1.5" />
                      Review Submitted Document
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <button
                      onClick={() => handleApprove(req._id, "REJECTED")}
                      className="flex-1 md:flex-none px-5 py-2.5 border border-red-200 text-red-700 font-medium rounded-xl hover:bg-red-50 transition active:scale-95"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleApprove(req._id, "APPROVED")}
                      className="flex-1 md:flex-none px-5 py-2.5 bg-gray-900 text-white font-medium rounded-xl hover:bg-black shadow-lg shadow-gray-200 transition active:scale-95"
                    >
                      Approve
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
