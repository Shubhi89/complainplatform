import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Login.tsx";
import AuthSuccess from "./pages/AuthSuccess";
import { RootRedirect , RoleRoute } from "./components/RoleRoute";

// Placeholder components (We will build these next)
const ConsumerDashboard = () => (
  <div className="p-10 text-xl font-bold text-blue-600">Consumer Dashboard</div>
);
const BusinessDashboard = () => (
  <div className="p-10 text-xl font-bold text-green-600">
    Business Dashboard
  </div>
);
const AdminDashboard = () => (
  <div className="p-10 text-xl font-bold text-red-600">Admin Fortress</div>
);

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />

        <Route path="/google-callback" element={<AuthSuccess />} />

        <Route path="/" element={<RootRedirect />} />
        {/* Protected Routes (We will add security checks later) */}
        <Route
          path="/dashboard/consumer"
          element={
            <RoleRoute allowedRoles={["CONSUMER"]}>
              <ConsumerDashboard />
            </RoleRoute>
          }
        />

        <Route
          path="/dashboard/business"
          element={
            <RoleRoute allowedRoles={["BUSINESS"]}>
              <BusinessDashboard />
            </RoleRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <RoleRoute allowedRoles={["ADMIN"]}>
              <AdminDashboard />
            </RoleRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
