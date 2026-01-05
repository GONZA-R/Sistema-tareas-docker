import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import TasksManagement from "./pages/TasksManagement";
import UsersManagement from "./pages/UsersManagement";
import UsersOverview from "./pages/UsersOverview";
import EmployeeTasks from "./pages/EmployeeTasks";
import Navbar from "./components/Navbar";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("access");
    const savedRole = localStorage.getItem("role");

    setIsAuthenticated(!!token);
    setRole(savedRole);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      {isAuthenticated && <Navbar setIsAuthenticated={setIsAuthenticated} />}

      <Routes>
        {/* LOGIN */}
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/" />
            ) : (
              <Login
                setIsAuthenticated={setIsAuthenticated}
                setRole={setRole}
              />
            )
          }
        />

        {/* HOME SEGÚN ROL */}
        <Route
          path="/"
          element={
            !isAuthenticated ? (
              <Navigate to="/login" />
            ) : role === "admin_general" ? (
              <Navigate to="/users" />
            ) : role === "admin" ? (
              <Navigate to="/dashboard" />
            ) : role === "empleado" ? (
              <Navigate to="/employee" />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* DASHBOARD → ADMIN */}
        <Route
          path="/dashboard"
          element={
            isAuthenticated && role === "admin" ? (
              <Dashboard />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        {/* TASKS → ADMIN */}
        <Route
          path="/tasks"
          element={
            isAuthenticated && role === "admin" ? (
              <TasksManagement />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        {/* USERS MANAGEMENT → SOLO ADMIN_GENERAL */}
        <Route
          path="/users"
          element={
            isAuthenticated && role === "admin_general" ? (
              <UsersManagement />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        {/* USERS OVERVIEW → SOLO ADMIN */}
        <Route
          path="/users-overview"
          element={
            isAuthenticated && role === "admin" ? (
              <UsersOverview />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        {/* EMPLEADO */}
        <Route
          path="/employee"
          element={
            isAuthenticated && role === "empleado" ? (
              <EmployeeTasks />
            ) : (
              <Navigate to="/" />
            )
          }
        />
      </Routes>
    </div>
  );
}

export default App;
