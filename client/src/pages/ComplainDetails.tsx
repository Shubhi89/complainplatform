import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Send,
  User,
  Building2,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";

interface Reply {
  _id: string;
  userId: string;
  userName: string;
  role: string;
  content: string;
  timestamp: string;
}

interface Complaint {
  _id: string;
  complaintId: string;
  title: string;
  description: string;
  status: "PENDING" | "OPEN" | "RESOLVED" | "CLOSED";
  consumer: { displayName: string };
  business: {
    displayName: string;
    companyName?: string; // <--- Add this field
  };
  thread: Reply[];
  createdAt: string;
}

const ComplaintDetails = () => {
  const { id } = useParams(); // Get ID from URL
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isLocked =
    complaint && ["RESOLVED", "CLOSED"].includes(complaint.status);

  // 1. Fetch Complaint Data
  const fetchComplaint = async () => {
    try {
      const res = await axios.get(`/api/complaints/${id}`);
      setComplaint(res.data);
      scrollToBottom();
    } catch (error) {
      console.error("Error fetching complaint", error);
      alert("Failed to load complaint. You may not be authorized.");
      navigate(-1); // Go back
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaint();
  }, [id]);

  // Scroll to bottom of chat
  const scrollToBottom = () => {
    setTimeout(() => {
      scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  // 2. Send Reply
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      // Optimistic UI update (optional, but let's stick to simple refresh first)
      await axios.post(`/api/complaints/${id}/reply`, { content: newMessage });
      setNewMessage("");
      fetchComplaint(); // Refresh chat
    } catch (error) {
      alert("Failed to send message");
    }
  };

  // 3. Status Badge Helper
  const getStatusBadge = (status: string) => {
    const styles = {
      PENDING: "bg-yellow-100 text-yellow-800",
      OPEN: "bg-blue-100 text-blue-800",
      RESOLVED: "bg-green-100 text-green-800",
      CLOSED: "bg-gray-100 text-gray-800",
    };
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
          styles[status as keyof typeof styles]
        }`}
      >
        {status === "RESOLVED" ? (
          <CheckCircle className="w-3 h-3" />
        ) : (
          <Clock className="w-3 h-3" />
        )}
        {status}
      </span>
    );
  };

  if (loading)
    return <div className="p-10 text-center">Loading conversation...</div>;
  if (!complaint) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-sm font-mono text-gray-400">
                #{complaint.complaintId}
              </span>
              {getStatusBadge(complaint.status)}
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              {complaint.title}
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Between{" "}
              <span className="font-semibold text-gray-700">
                {complaint.consumer.displayName}
              </span>{" "}
              and{" "}
              <span className="font-semibold text-gray-700">
                {complaint.business.companyName || complaint.business.displayName}
              </span>
            </p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-gray-800 text-md"
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6 pb-20">
          {/* Original Complaint Description */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-3 text-sm text-gray-500">
              <AlertCircle className="w-4 h-4 text-indigo-500" />
              Original Complaint
            </div>
            <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
              {complaint.description}
            </p>
          </div>

          {/* Messages Thread */}
          {complaint.thread.map((msg) => {
            const isBusiness = msg.role === "BUSINESS";
            return (
              <div
                key={msg._id}
                className={`flex gap-4 ${isBusiness ? "flex-row-reverse" : ""}`}
              >
                {/* Avatar */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isBusiness
                      ? "bg-emerald-100 text-emerald-600"
                      : "bg-blue-100 text-blue-600"
                  }`}
                >
                  {isBusiness ? (
                    <Building2 className="w-5 h-5" />
                  ) : (
                    <User className="w-5 h-5" />
                  )}
                </div>

                {/* Bubble */}
                <div
                  className={`max-w-[80%] rounded-2xl p-4 ${
                    isBusiness
                      ? "bg-emerald-50 border border-emerald-100 rounded-tr-none"
                      : "bg-white border border-gray-200 rounded-tl-none shadow-sm"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-xs font-bold ${
                        isBusiness ? "text-emerald-700" : "text-blue-700"
                      }`}
                    >
                      {isBusiness
                        ? complaint.business.companyName || msg.userName
                        : msg.userName}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="text-gray-700 text-sm whitespace-pre-wrap">
                    {msg.content}
                  </p>
                </div>
              </div>
            );
          })}

          {/* Invisible element to auto-scroll to */}
          <div ref={scrollRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-4 sticky bottom-0">
        <div className="max-w-4xl mx-auto">
          {isLocked ? (
            // 🔒 LOCKED STATE UI
            <div className="flex items-center justify-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200 text-gray-500">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-medium">
                This complaint is marked as{" "}
                <span className="font-bold text-gray-700">
                  {complaint.status}
                </span>
                . The conversation is now read-only.
              </span>
            </div>
          ) : (
            // ✍️ ACTIVE STATE UI (Your existing form)
            <form
              onSubmit={handleSend}
              className="relative flex items-center gap-2"
            >
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your reply here..."
                disabled={loading}
                className="w-full bg-gray-100 text-gray-900 rounded-xl px-5 py-4 pr-12 outline-none focus:ring-2 focus:ring-indigo-500 transition disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!newMessage.trim() || loading}
                className="absolute right-2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComplaintDetails;
