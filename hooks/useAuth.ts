"use client";
import { useEffect, useState } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  isKycVerified: boolean;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Here you will connect to the actual API
    // We are currently using fake data
    const mockUser = {
      id: "1",
      name: "Al Marwan",
      email: "trader@mazal.com",
      isKycVerified: true,
    };

    // Fake delay to simulate server request
    setTimeout(() => {
      setUser(mockUser);
      setIsLoading(false);
    }, 500);
  }, []);

  const login = async (email: string, password: string) => {
    // The true logic of Login
    setIsLoading(true);
    // ...Connecting to the API...
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
  };

  return { user, isLoading, login, logout, isAuthenticated: !!user };
}
