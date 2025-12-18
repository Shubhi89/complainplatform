import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Login.tsx";
import AdminLogin from "./pages/AdminLogin.tsx";
import AuthSuccess from "./pages/AuthSuccess";
import { RootRedirect, RoleRoute } from "./components/RoleRoute";
import ConsumerDashboard from "./pages/ConsumerDashboard.tsx";
import CreateComplaint from "./pages/CreateComplaint.tsx";
import BusinessDashboard from "./pages/BusinessDashboard.tsx";
import BusinessVerification from "./pages/BusinessVerification.tsx";
import AdminDashboard from "./pages/AdminDashboard.tsx";
import AdminVerify from "./pages/AdminVerify";
import ComplaintDetails from "./pages/ComplainDetails.tsx";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/google-callback" element={<AuthSuccess />} />

        <Route path="/" element={<RootRedirect />} />
        {/* Protected Routes */}
        <Route
          path="/dashboard/consumer"
          element={
            <RoleRoute allowedRoles={["CONSUMER"]}>
              <ConsumerDashboard />
            </RoleRoute>
          }
        />

        <Route
          path="/complaint/new"
          element={
            <RoleRoute allowedRoles={["CONSUMER"]}>
              <CreateComplaint />
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
          path="/business/verify"
          element={
            <RoleRoute allowedRoles={["BUSINESS"]}>
              <BusinessVerification />
            </RoleRoute>
          }
        />

        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Protected Verification Screen */}
        <Route
          path="/admin/verify"
          element={
            <RoleRoute allowedRoles={["ADMIN"]}>
              <AdminVerify />
            </RoleRoute>
          }
        />

        {/* Protected Dashboard */}
        <Route
          path="/admin"
          element={
            <RoleRoute allowedRoles={["ADMIN"]}>
              <AdminDashboard />
            </RoleRoute>
          }
        />

        <Route
          path="/complaint/:id"
          element={
            <RoleRoute allowedRoles={["CONSUMER", "BUSINESS", "ADMIN"]}>
              <ComplaintDetails />
            </RoleRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
