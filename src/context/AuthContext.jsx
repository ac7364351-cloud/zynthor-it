import { createContext, useContext, useState, useEffect, useCallback } from "react";

const AuthContext = createContext();

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:8000").replace(/\/+$/, "");

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("zynthor_token"));
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("zynthor_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [business, setBusiness] = useState(() => {
    try {
      const saved = localStorage.getItem("zynthor_business");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch available demo businesses
  const loadBusinesses = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/businesses`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.businesses) {
          setBusinesses(data.businesses);
          // If no active business, default to first business
          if (!business && data.businesses.length > 0) {
            setBusiness(data.businesses[0]);
            localStorage.setItem("zynthor_business", JSON.stringify(data.businesses[0]));
          }
        }
      }
    } catch (e) {
      console.warn("Could not load businesses:", e.message);
    }
  }, [business]);

  // Check auth session
  useEffect(() => {
    async function initAuth() {
      try {
        await loadBusinesses();
        if (token) {
          const res = await fetch(`${API_BASE}/api/auth/me`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "X-Business-Id": business ? String(business.id) : "1",
            },
          });
          if (res.ok) {
            const data = await res.json();
            if (data.success) {
              if (data.user) setUser(data.user);
              if (data.business) setBusiness(data.business);
            }
          }
        }
      } catch (err) {
        console.warn("Auth initialization error:", err.message);
      } finally {
        setLoading(false);
      }
    }
    initAuth();
  }, [token, loadBusinesses]);

  const login = async (email, password) => {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || "Failed to log in");
    }

    setToken(data.token);
    setUser(data.user);
    setBusiness(data.business);
    localStorage.setItem("zynthor_token", data.token);
    localStorage.setItem("zynthor_user", JSON.stringify(data.user));
    localStorage.setItem("zynthor_business", JSON.stringify(data.business));
    return data;
  };

  const register = async (regData) => {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(regData),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || "Registration failed");
    }

    setToken(data.token);
    setUser(data.user);
    setBusiness(data.business);
    localStorage.setItem("zynthor_token", data.token);
    localStorage.setItem("zynthor_user", JSON.stringify(data.user));
    localStorage.setItem("zynthor_business", JSON.stringify(data.business));
    await loadBusinesses();
    return data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("zynthor_token");
    localStorage.removeItem("zynthor_user");
  };

  const switchBusiness = (bId) => {
    const target = businesses.find((b) => b.id === Number(bId));
    if (target) {
      setBusiness(target);
      localStorage.setItem("zynthor_business", JSON.stringify(target));
      window.dispatchEvent(new CustomEvent("zynthor:business-switched", { detail: target }));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        business,
        businesses,
        loading,
        isAuthenticated: Boolean(token || business),
        login,
        register,
        logout,
        switchBusiness,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
