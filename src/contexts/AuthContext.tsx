"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface User {
  id: string;
  email?: string;
  is_anonymous: boolean;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAnonymous: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email?: string, password?: string) => Promise<void>;
  continueAnonymously: () => Promise<void>;
  logout: () => Promise<void>;
  token: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize auth from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem("solace_access_token");
    const storedUser = localStorage.getItem("solace_user");

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem("solace_access_token");
        localStorage.removeItem("solace_user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Invalid email or password");
      }

      const data = await response.json();
      const accessToken = data.access_token;
      
      const userData: User = {
        id: "user_active",
        email,
        is_anonymous: false,
        role: "user",
      };

      setToken(accessToken);
      setUser(userData);
      localStorage.setItem("solace_access_token", accessToken);
      localStorage.setItem("solace_refresh_token", data.refresh_token);
      localStorage.setItem("solace_user", JSON.stringify(userData));
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email?: string, password?: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, is_anonymous: false }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Registration failed");
      }

      const data = await response.json();
      const accessToken = data.access_token;

      const userData: User = {
        id: "user_registered",
        email,
        is_anonymous: false,
        role: "user",
      };

      setToken(accessToken);
      setUser(userData);
      localStorage.setItem("solace_access_token", accessToken);
      localStorage.setItem("solace_refresh_token", data.refresh_token);
      localStorage.setItem("solace_user", JSON.stringify(userData));
    } finally {
      setIsLoading(false);
    }
  };

  const continueAnonymously = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/anonymous`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Anonymous session creation failed");
      }

      const data = await response.json();
      const accessToken = data.access_token;

      const userData: User = {
        id: "anon_session",
        is_anonymous: true,
        role: "user",
      };

      setToken(accessToken);
      setUser(userData);
      localStorage.setItem("solace_access_token", accessToken);
      localStorage.setItem("solace_refresh_token", data.refresh_token);
      localStorage.setItem("solace_user", JSON.stringify(userData));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("solace_access_token");
    localStorage.removeItem("solace_refresh_token");
    localStorage.removeItem("solace_user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAnonymous: !!user?.is_anonymous,
        isLoading,
        login,
        register,
        continueAnonymously,
        logout,
        token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
