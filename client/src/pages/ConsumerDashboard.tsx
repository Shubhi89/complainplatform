import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import {
  PlusCircle,
  MessageSquare,
  Clock,
  ArrowRight,
  LogOut,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Complaint {
  _id: string;
  complaintId: string;
  title: string;
  description: string;
  status: "PENDING" | "OPEN" | "RESOLVED" | "CLOSED";
  createdAt: string;
}

const ConsumerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const res = await axios.get("/api/complaints/my-complaints");
        setComplaints(res.data);
      } catch (error) {
        console.error("Error fetching complaints:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "OPEN":
        return "bg-blue-100 text-blue-800";
      case "RESOLVED":
        return "bg-green-100 text-green-800";
      case "CLOSED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      {" "}
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              My Complaints
            </h1>
            <p className="text-gray-500 mt-1">
              Welcome back, {user?.displayName}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium shadow-sm"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>

            <button
              onClick={() => navigate("/complaint/new")}
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-sm shadow-blue-200"
            >
              <PlusCircle className="w-4 h-4" />
              New Complaint
            </button>
          </div>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-500">Loading your history...</p>
          </div>
        ) : complaints.length === 0 ? (
          <div className="text-center py-12 sm:py-20 bg-white rounded-2xl shadow-sm border border-gray-100 px-4">
            <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-medium text-gray-900">
              No complaints found
            </h3>
            <p className="text-gray-500 mt-2 max-w-sm mx-auto">
              Ready to resolve an issue? Start your first complaint today.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {complaints.map((complaint) => (
              <div
                key={complaint._id}
                className="bg-white p-5 sm:p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition cursor-pointer"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="w-full">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                      <span className="font-mono text-xs sm:text-sm text-gray-400">
                        #{complaint.complaintId}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${getStatusColor(
                          complaint.status
                        )}`}
                      >
                        {complaint.status}
                      </span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-1">
                      {complaint.title}
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 line-clamp-2">
                      {complaint.description}
                    </p>
                  </div>

                  <div className="w-full sm:w-auto text-left sm:text-right text-xs sm:text-sm text-gray-400 flex sm:flex-col items-center sm:items-end justify-between sm:justify-start pt-2 sm:pt-0 border-t sm:border-0 border-gray-100 mt-2 sm:mt-0">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(complaint.createdAt).toLocaleDateString()}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/complaint/${complaint._id}`);
                      }}
                      className="w-full mt-5 sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold rounded-lg transition-colors flex items-center justify-center sm:justify-end gap-2"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsumerDashboard;
