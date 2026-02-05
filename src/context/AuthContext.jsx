import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [apiKey, setApiKey] = useState("");

  useEffect(() => {
    // Check for stored auth on mount
    const storedUser = localStorage.getItem("honeyguard_user");
    const storedApiKey = localStorage.getItem("honeyguard_api_key");

    if (storedUser && storedApiKey) {
      setUser(JSON.parse(storedUser));
      setApiKey(storedApiKey);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    // Simulate API call - In production, replace with actual authentication
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email && password.length >= 6) {
          const userData = {
            id: "user_" + Math.random().toString(36).substr(2, 9),
            email,
            name: email.split("@")[0],
            createdAt: new Date().toISOString(),
          };
          const generatedApiKey =
            "hg_" + Math.random().toString(36).substr(2, 32);

          setUser(userData);
          setApiKey(generatedApiKey);
          localStorage.setItem("honeyguard_user", JSON.stringify(userData));
          localStorage.setItem("honeyguard_api_key", generatedApiKey);

          resolve({ user: userData, apiKey: generatedApiKey });
        } else {
          reject(new Error("Invalid credentials"));
        }
      }, 1000);
    });
  };

  const register = async (name, email, password) => {
    // Simulate API call - In production, replace with actual registration
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email && password.length >= 6 && name) {
          const userData = {
            id: "user_" + Math.random().toString(36).substr(2, 9),
            email,
            name,
            createdAt: new Date().toISOString(),
          };
          const generatedApiKey =
            "hg_" + Math.random().toString(36).substr(2, 32);

          setUser(userData);
          setApiKey(generatedApiKey);
          localStorage.setItem("honeyguard_user", JSON.stringify(userData));
          localStorage.setItem("honeyguard_api_key", generatedApiKey);

          resolve({ user: userData, apiKey: generatedApiKey });
        } else {
          reject(new Error("Invalid registration data"));
        }
      }, 1000);
    });
  };

  const logout = () => {
    setUser(null);
    setApiKey("");
    localStorage.removeItem("honeyguard_user");
    localStorage.removeItem("honeyguard_api_key");
  };

  const updateApiKey = (newKey) => {
    setApiKey(newKey);
    localStorage.setItem("honeyguard_api_key", newKey);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        apiKey,
        loading,
        login,
        register,
        logout,
        updateApiKey,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
