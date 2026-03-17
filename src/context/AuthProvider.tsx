// src/context/AuthContext.tsx (Corrected)
import { createContext, useState, useEffect, ReactNode } from 'react';

// --- Interfaces ---
interface User {
  id: string;
  name: string;
  email: string;
  // Add other properties as needed
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isLoading: boolean;
}

// --- Context Definition ---
export const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  isLoading: true,
});


// --- Provider Component ---
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start as true

  useEffect(() => {
    const validateSession = async () => {
      try {
        // The browser automatically sends the HttpOnly cookie with this request
        const response = await fetch('/api/v1/auth/me');

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          // Cookie is invalid or expired
          setUser(null);
        }
      } catch (error) {
        // ✅ Log the error to use the variable and aid in debugging
        console.error("Session validation failed:", error);
        setUser(null);
      } finally {
        setIsLoading(false); // Stop loading once the check is complete
      }
    };

    validateSession();
  }, []); // Empty array ensures this runs only once on mount

  const value = { user, setUser, isLoading };

  // This was also missing a return statement
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};