import { useState } from "react";
import { User, Building2, ShieldCheck } from "lucide-react";

const Login = () => {
  const [role, setRole] = useState<"CONSUMER" | "BUSINESS">("CONSUMER");

  const handleGoogleLogin = () => {
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
    window.location.href = `${apiUrl}/auth/google?role=${role}`;
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Left Side */}
      <div className="hidden lg:flex w-1/2 bg-slate-800 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 opacity-90" />
        <div className="relative z-10 text-center px-10">
          <h1 className="text-5xl font-bold text-white mb-6">
            Bridge the Gap.
          </h1>
          <p className="text-xl text-slate-300 max-w-md mx-auto">
            The modern platform for resolving commercial disputes with speed and
            transparency.
          </p>
        </div>
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      {/* Right Side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-10 border border-gray-100">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              Welcome to complain platform
            </h2>
            <p className="text-gray-500 mt-2">
              Please select your role to continue
            </p>
          </div>

          {/* Role Toggle Switch */}
          <div className="grid grid-cols-2 gap-4 mb-8 p-1 bg-gray-100 rounded-xl">
            <button
              onClick={() => setRole("CONSUMER")}
              className={`flex items-center justify-center py-3 rounded-lg font-medium transition-all duration-200 ${
                role === "CONSUMER"
                  ? "bg-white text-blue-600 shadow-md"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <User className="w-5 h-5 mr-2" />
              Consumer
            </button>
            <button
              onClick={() => setRole("BUSINESS")}
              className={`flex items-center justify-center py-3 rounded-lg font-medium transition-all duration-200 ${
                role === "BUSINESS"
                  ? "bg-white text-emerald-600 shadow-md"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Building2 className="w-5 h-5 mr-2" />
              Business
            </button>
          </div>

          <div
            className={`h-1 w-full rounded-full mb-8 transition-colors duration-300 ${
              role === "CONSUMER" ? "bg-blue-500" : "bg-emerald-500"
            }`}
          />

          {/* Google Login Button */}
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center px-6 py-4 border-2 border-gray-200 rounded-xl text-gray-700 font-semibold hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 group"
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform"
              alt="Google Logo"
            />
            Sign in with Google
          </button>

          {/* Admin Link Footer */}
          <div className="mt-8 text-center border-t border-gray-100 pt-6">
            <a
              href="/admin/login"
              className="inline-flex items-center text-sm text-gray-600 hover:text-red-500 transition-colors"
            >
              <ShieldCheck className="w-4 h-4 mr-1" />
              Administrator Access? Click here
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
