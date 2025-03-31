import React from "react";
import { Route, BrowserRouter as Router, Routes, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Login from "../components/Login";
import AdminPage from "../components/AdminPage";
import UserPage from "../components/UserPage";
import ProductPage from "../components/ProductPage";
import CouponPage from "../components/CouponPage";
import CheckoutPage from "../components/CheckoutPage"
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
                <ProductPage />
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
            path="/cart/checkout"
            element={
              <ProtectedRoute role="user">
                <CheckoutPage />
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
