import { useState } from "react";
import { NavLink, useNavigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NAV = [
  {
    group: "Explore",
    items: [
      { label: "Map", path: "/map", icon: MapIcon },
      { label: "Quiz", path: "/quiz", icon: QuizIcon },
      { label: "Multiplayer", path: "/match", icon: MultiIcon },
    ],
  },
  {
    group: "Account",
    items: [
      { label: "Profile", path: "/profile", icon: ProfileIcon },
    ],
  },
];

function MapIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
      <line x1="9" y1="3" x2="9" y2="18" />
      <line x1="15" y1="6" x2="15" y2="21" />
    </svg>
  );
}
function QuizIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}
function MultiIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
function ProfileIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
function LogoutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

export default function AppLayout() {
  const { logout, username } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div style={{ display: "flex", height: "100vh", background: "#f9fafb" }}>
      <aside style={{
        width: 200, minWidth: 200, background: "#ffffff",
        borderRight: "1px solid #e8eaed", display: "flex",
        flexDirection: "column", padding: "0", zIndex: 10,
      }}>
        <div style={{ padding: "20px 16px 16px", borderBottom: "1px solid #e8eaed" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 8, background: "#7c3aed",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
            </div>
            <span style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: 15, color: "#1a1a2e" }}>
              GeoScale
            </span>
          </div>
        </div>

        <nav style={{ flex: 1, padding: "12px 10px", display: "flex", flexDirection: "column", gap: 20, overflowY: "auto" }}>
          {NAV.map((group) => (
            <div key={group.group}>
              <div style={{
                fontSize: 10, fontWeight: 700, letterSpacing: "0.1em",
                textTransform: "uppercase", color: "#9ca3af",
                padding: "0 8px", marginBottom: 4,
              }}>
                {group.group}
              </div>
              {group.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  style={({ isActive }) => ({
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "7px 10px", borderRadius: 8, marginBottom: 2,
                    fontSize: 13, fontWeight: isActive ? 600 : 500,
                    color: isActive ? "#7c3aed" : "#6b7280",
                    background: isActive ? "#ede9fe" : "transparent",
                    textDecoration: "none", transition: "all 0.15s",
                  })}
                >
                  <item.icon />
                  {item.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div style={{ padding: "12px 10px", borderTop: "1px solid #e8eaed" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", marginBottom: 4 }}>
            <div style={{
              width: 28, height: 28, borderRadius: "50%", background: "#ede9fe",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 700, color: "#7c3aed",
            }}>
              {(username || "U")[0].toUpperCase()}
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#1a1a2e", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {username || "Player"}
            </span>
          </div>
          <button
            onClick={handleLogout}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              width: "100%", padding: "7px 10px", borderRadius: 8,
              background: "transparent", border: "none", cursor: "pointer",
              fontSize: 13, fontWeight: 500, color: "#6b7280", transition: "all 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "#fef2f2"; e.currentTarget.style.color = "#dc2626"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#6b7280"; }}
          >
            <LogoutIcon />
            Logout
          </button>
        </div>
      </aside>

      <main style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", position: "relative" }}>
        <Outlet />
      </main>
    </div>
  );
}
