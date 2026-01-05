import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bell, UserCircle } from "lucide-react";
import api from "../services/api";

import UserProfileModal from "./UserProfileModal";

export default function Navbar({ setIsAuthenticated }) {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const username = localStorage.getItem("username") || "Usuario";

  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [modalType, setModalType] = useState(null);

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  const notifRef = useRef(null);
  const userMenuRef = useRef(null);

  const handleLogout = () => {
    localStorage.clear();
    setIsAuthenticated(false);
    navigate("/login");
  };

  const fetchNotifications = async () => {
    try {
      setLoadingNotifications(true);
      const res = await api.get("notifications/");
      const sorted = res.data.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      setNotifications(sorted);
    } catch (err) {
      console.error("Error al traer notificaciones", err);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.post(`notifications/${id}/mark-read/`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (err) {
      console.error("Error al marcar notificación", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await Promise.all(
        notifications.filter(n => !n.is_read).map(n => api.post(`notifications/${n.id}/mark-read/`))
      );
      setNotifications((prev) => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error("Error al marcar todas las notificaciones", err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotificationsOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  return (
    <>
      <nav className="bg-gradient-to-r from-orange-400 via-orange-300 to-orange-200 shadow-lg p-3 px-6 flex items-center justify-between rounded-b-xl relative z-30">
        {/* LOGO */}
        <Link to="/" className="text-xl font-bold tracking-tight text-orange-800">
          TASK<span className="text-orange-500">RVJ7</span>
        </Link>

        {/* DESKTOP LINKS */}
        <div className="hidden md:flex gap-6 text-sm">
          {role === "admin" && (
            <>
              <Link className="nav-item" to="/">Dashboard</Link>
              <Link className="nav-item" to="/tasks">Tareas</Link>
              <Link className="nav-item" to="/users-overview">Usuarios</Link>
            </>
          )}
          {role === "admin_general" && (
            <Link className="nav-item" to="/users">Gestión de usuarios</Link>
          )}
          {role === "empleado" && (
            <Link className="nav-item" to="/employee">Mis tareas</Link>
          )}
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-4">
          {/* NOTIFICACIONES */}
          {!(role === "admin_general" && window.location.pathname === "/users") && (
            <div ref={notifRef}>
              <button
                className="relative p-2 hover:bg-white/20 rounded-full"
                onClick={() => {
                  setNotificationsOpen((v) => !v);
                  setMobileMenuOpen(false);
                  setMenuOpen(false);
                  fetchNotifications();
                }}
              >
                <Bell className="w-6 h-6 text-orange-800" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[10px] rounded-full px-1.5">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div
                  className={`${
                    window.innerWidth < 768
                      ? "fixed top-16 right-2 w-[90vw] max-w-xs"
                      : "absolute right-0 mt-2 w-96"
                  } bg-orange-50 shadow-lg border border-orange-200 rounded-2xl z-50`}
                >
                  {/* Header */}
                  <div className="p-3 border-b border-orange-200 text-sm font-semibold text-orange-900 bg-orange-100 rounded-t-2xl flex justify-between items-center">
                    <span>Notificaciones</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-orange-700 hover:text-orange-900 font-medium"
                      >
                        Marcar todas como leídas
                      </button>
                    )}
                  </div>

                  {/* Contenido */}
                  <div className="max-h-80 overflow-y-auto scrollbar-thin p-2">
                    {loadingNotifications ? (
                      <p className="p-4 text-sm text-orange-600">Cargando...</p>
                    ) : notifications.length === 0 ? (
                      <p className="p-4 text-sm text-orange-600">No hay notificaciones</p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => markAsRead(n.id)}
                          className={`px-4 py-3 text-sm cursor-pointer border-b last:border-b-0 transition
                            ${n.is_read
                              ? "bg-orange-50 hover:bg-orange-100"
                              : "bg-orange-100 hover:bg-orange-200 shadow-inner"
                            } rounded-lg mb-1`}
                        >
                          <p className="text-orange-900 font-medium">{n.message || "Notificación"}</p>
                          <span className="text-xs text-orange-700">
                            {new Date(n.created_at).toLocaleString("es-AR")}
                          </span>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Botón cerrar */}
                  <button
                    onClick={() => setNotificationsOpen(false)}
                    className="w-full text-sm py-2 hover:bg-orange-100 border-t border-orange-200 font-medium rounded-b-2xl transition"
                  >
                    Cerrar
                  </button>
                </div>
              )}
            </div>
          )}

          {/* USER MENU */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => {
                setMenuOpen((v) => !v);
                setMobileMenuOpen(false);
                setNotificationsOpen(false);
              }}
              className="p-1 hover:bg-white/20 rounded-full flex items-center gap-2"
            >
              <UserCircle className="w-8 h-8 text-orange-800" />
              <span className="font-semibold text-orange-800 text-sm md:text-base">
                {username}
              </span>
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-white/95 border border-orange-200 shadow-lg rounded-xl py-2">
                <button
                  className="dropdown-item"
                  onClick={() => {
                    setModalType("profile");
                    setMenuOpen(false);
                  }}
                >
                  Mi perfil
                </button>

                <button
                  className="dropdown-item text-red-500 hover:bg-red-100"
                  onClick={handleLogout}
                >
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>

          {/* MOBILE MENU BUTTON */}
          <div className="md:hidden relative">
            <button
              onClick={() => {
                setMobileMenuOpen((v) => !v);
                setNotificationsOpen(false);
                setMenuOpen(false);
              }}
              className="p-2 rounded-md hover:bg-white/20"
            >
              <svg
                className="w-6 h-6 text-orange-800"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                />
              </svg>
            </button>

            {mobileMenuOpen && (
              <div className="fixed top-20 left-1/2 -translate-x-1/2 w-[92%] max-w-sm bg-white border border-orange-200 shadow-2xl rounded-2xl py-3 px-2 flex flex-col gap-1 z-50 animate-slideDown">
                {role === "admin" && (
                  <>
                    <Link className="dropdown-item" to="/" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
                    <Link className="dropdown-item" to="/tasks" onClick={() => setMobileMenuOpen(false)}>Tareas</Link>
                    <Link className="dropdown-item" to="/users-overview" onClick={() => setMobileMenuOpen(false)}>Usuarios</Link>
                  </>
                )}
                {role === "admin_general" && (
                  <Link className="dropdown-item" to="/users" onClick={() => setMobileMenuOpen(false)}>Gestión de usuarios</Link>
                )}
                {role === "empleado" && (
                  <Link className="dropdown-item" to="/employee" onClick={() => setMobileMenuOpen(false)}>Mis tareas</Link>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* MODALES */}
      <UserProfileModal
        open={modalType === "profile"}
        onClose={() => setModalType(null)}
      />

      <style>{`
        .nav-item {
          position: relative;
          font-weight: 600;
          color: #7c2d12;
          transition: all 0.3s ease;
        }
        .nav-item::after {
          content: '';
          position: absolute;
          left: 0;
          bottom: -2px;
          width: 0%;
          height: 2px;
          background: #d97706;
          transition: 0.3s;
          border-radius: 2px;
        }
        .nav-item:hover::after {
          width: 100%;
        }
        .dropdown-item {
          width: 100%;
          padding: 8px 14px;
          text-align: left;
          font-size: 0.875rem;
          color: #444;
          border-radius: 0.375rem;
          transition: 0.2s;
        }
        .dropdown-item:hover {
          background: #ffedd5;
        }
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #d97706;
          border-radius: 999px;
        }
      `}</style>
    </>
  );
}
