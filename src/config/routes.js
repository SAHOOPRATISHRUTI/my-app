import React from "react";
import { Route, BrowserRouter as Router, Routes, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Login from "../components/Login";
import AdminPage from "../components/AdminPage";
import UserPage from "../components/UserPage";
import SubscriptionMaster from "../components/SubscriptionMaster";
import CouponPage from "../components/CouponPage";
import ClientRegistration from "../components/ClientRegistration"
import SubscriptionManagement from "../components/SubscriptionManagement"
import ClientList from "../components/ClientList"
const ProtectedRoute = ({ children, role }) => {
  const storedRole = localStorage.getItem("role");

  if (!storedRole) {
    return <Navigate to="/" replace />; // Redirect to login if no role
  }

  if (storedRole !== role) {
    return <Navigate to="/" replace />; // Redirect if role does not match
  }

  return children;
};

const Mainroute = () => {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/clientList" element={<ClientList />} />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute role="admin">
                <AdminPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/products"
            element={
              <ProtectedRoute role="admin">
                <SubscriptionMaster />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/coupons"
            element={
              <ProtectedRoute role="admin">
                <CouponPage />
              </ProtectedRoute>
            }
          />

          {/* User Routes */}
          <Route
            path="/user"
            element={
              <ProtectedRoute role="user">
                <UserPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/client-registration"
            element={
              <ProtectedRoute role="user">
                <ClientRegistration />
              </ProtectedRoute>
            }
          />
            <Route
            path="/SubscriptionManagement"
            element={
              <ProtectedRoute role="admin">
                <SubscriptionManagement />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
      <ToastContainer />
    </>
  );
};

export default Mainroute;
