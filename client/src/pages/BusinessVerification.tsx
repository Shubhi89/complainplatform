import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { UploadCloud, Building, FileText, ArrowRight } from "lucide-react";

const BusinessVerification = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    companyName: "",
    industry: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      alert("Please upload a verification document");
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      data.append("document", file);
      data.append("companyName", formData.companyName);
      data.append("industry", formData.industry);
      data.append("description", formData.description);

      await axios.post("/api/business/verification", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Verification Submitted! Waiting for Admin approval.");
      navigate("/dashboard/business");
    } catch (error: any) {
      console.error("Upload failed", error);
      alert(error.response?.data?.message || "Verification upload failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">
        {/* Left Side */}
        <div className="bg-emerald-600 p-8 text-white md:w-1/3 flex flex-col justify-between">
          <div>
            <Building className="w-10 h-10 mb-4 opacity-80" />
            <h2 className="text-2xl font-bold mb-2">Verify Your Business</h2>
            <p className="text-emerald-100 text-sm">
              To build trust with consumers, we require valid business
              documentation.
            </p>
          </div>
          <div className="text-xs text-emerald-200 mt-8">
            Accepted: PDF, JPG, PNG <br />
            Max Size: 5MB
          </div>
        </div>

        {/* Right Side */}
        <div className="p-8 md:w-2/3">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company Name
              </label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                value={formData.companyName}
                onChange={(e) =>
                  setFormData({ ...formData, companyName: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Industry
              </label>
              <select
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                value={formData.industry}
                onChange={(e) =>
                  setFormData({ ...formData, industry: e.target.value })
                }
              >
                <option value="">Select Industry</option>
                <option value="Retail">Retail</option>
                <option value="Tech">Technology</option>
                <option value="Service">Service</option>
                <option value="Finance">Finance</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Business Description
              </label>
              <textarea
                required
                rows={3}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            {/* File Upload */}
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 transition cursor-pointer relative">
              <input
                type="file"
                accept=".pdf,.jpg,.png,.jpeg"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <UploadCloud className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 font-medium">
                {file ? file.name : "Click to upload Registration Document"}
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition flex items-center justify-center disabled:opacity-50"
            >
              {loading ? (
                "Uploading..."
              ) : (
                <span className="flex items-center">
                  Submit Verification <ArrowRight className="w-4 h-4 ml-2" />
                </span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BusinessVerification;
