import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ isAuthenticated, userRole, allowedRoles, children }) {
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(userRole)) return <Navigate to="/" />;
  return children;
}
