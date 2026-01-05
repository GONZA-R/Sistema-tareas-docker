import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Login({ setIsAuthenticated, setRole }) {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Ingrese un correo válido");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/token/email/", { email, password });

      localStorage.setItem("access", response.data.access);
      localStorage.setItem("refresh", response.data.refresh);

      api.defaults.headers.common["Authorization"] =
        "Bearer " + response.data.access;

      const userRole = response.data.role;
      localStorage.setItem("role", userRole);
      setRole(userRole);

      localStorage.setItem("username", response.data.username);
      localStorage.setItem("email", response.data.email);

      setIsAuthenticated(true);

      toast.success("Inicio de sesión exitoso");
      navigate("/");
    } catch (err) {
      if (err.response) {
        toast.error(err.response.data.detail || "Correo o contraseña incorrectos");
      } else {
        toast.error("Error de conexión. Intenta nuevamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-r from-orange-500 to-yellow-400 p-6">
      {/* LADO IZQUIERDO — Branding */}
      <div className="hidden md:flex flex-col justify-center w-1/2 text-white px-16 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-black/30 to-black/5 backdrop-blur-sm"></div>
        <div className="relative z-10 max-w-xl">
          <h1 className="text-5xl font-extrabold mb-4 tracking-tight drop-shadow-lg">
  TASK <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-orange-500 to-red-600">RVJ7</span>
</h1>

          <p className="text-xl mb-10 opacity-90 leading-relaxed">
            Sistema avanzado de gestión de tareas.
          </p>
          <div className="space-y-5 text-lg">
            <div className="flex gap-4 items-start">
              <span className="text-2xl opacity-90">✨</span>
              <p className="opacity-90">
                Organiza tareas, asigna responsables y cumple objetivos.
              </p>
            </div>
            <div className="flex gap-4 items-start">
              <span className="text-2xl opacity-90">📊</span>
              <p className="opacity-90">
                Múltiples vistas: Dashboard, Lista, Kanban.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* LADO DERECHO — FORM */}
      <div className="flex items-center justify-center w-full md:w-1/2">
        <form
          onSubmit={handleLogin}
          className="bg-white w-full max-w-md rounded-3xl shadow-xl p-10"
        >
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            Bienvenido
          </h2>

          {/* Email */}
          <div className="mb-4">
            <label className="block text-gray-600 mb-1">Correo electrónico</label>
            <div className="flex items-center bg-gray-100 rounded-lg p-3">
              <Mail className="text-gray-500 w-5 h-5 mr-2" />
              <input
                type="email"
                placeholder="tu@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-transparent outline-none w-full"
              />
            </div>
          </div>

          {/* Contraseña con ojo */}
          <div className="mb-4">
            <label className="block text-gray-600 mb-1">Contraseña</label>
            <div className="flex items-center bg-gray-100 rounded-lg p-3">
              <Lock className="text-gray-500 w-5 h-5 mr-2" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-transparent outline-none w-full"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="ml-2 text-gray-500"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Recuperación */}
          <div className="text-right mb-4">
            <button
              type="button"
              className="text-orange-600 hover:underline text-sm"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          {/* Botón */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-orange-500 hover:bg-orange-600 transition text-white p-3 rounded-lg font-semibold shadow-md ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Cargando..." : "Iniciar Sesión"}
          </button>
        </form>
      </div>

      {/* Toast */}
      <ToastContainer position="top-right" autoClose={4000} />
    </div>
  );
}
