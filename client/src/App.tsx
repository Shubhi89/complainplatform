import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Placeholder components (We will build these next)
const Login = () => <div className="p-10 text-xl font-bold text-center">Login Page Coming Soon</div>;
const ConsumerDashboard = () => <div className="p-10 text-xl font-bold text-blue-600">Consumer Dashboard</div>;
const BusinessDashboard = () => <div className="p-10 text-xl font-bold text-green-600">Business Dashboard</div>;
const AdminDashboard = () => <div className="p-10 text-xl font-bold text-red-600">Admin Fortress</div>;

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />

        {/* Protected Routes (We will add security checks later) */}
        <Route path="/dashboard/consumer" element={<ConsumerDashboard />} />
        <Route path="/dashboard/business" element={<BusinessDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;