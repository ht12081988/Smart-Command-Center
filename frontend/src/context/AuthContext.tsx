"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export type UserRole = "Administrator" | "SBAExecutive" | "Presenter" | "Producer" | "CaseManager" | "ExternalLiaison";

export interface UserSession {
  username: string;
  fullName: string;
  email: string;
  role: UserRole;
  type?: "Internal" | "External";
  entity?: string;
  department?: string;
  mobile?: string;
}

interface AuthContextType {
  user: UserSession | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  changeRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Default mock users credentials matching roles
export const MOCK_USERS: Record<string, UserSession & { passwordHash: string }> = {
  admin: {
    username: "admin",
    fullName: "Hardik T.",
    email: "hardik@sba.gov.ae",
    role: "Administrator",
    type: "Internal",
    department: "IT & Administration",
    mobile: "+971-50-9876543",
    passwordHash: "admin123"
  },
  executive: {
    username: "executive",
    fullName: "Layla Al-Mansoori",
    email: "layla.mansoori@sba.gov.ae",
    role: "SBAExecutive",
    type: "Internal",
    department: "Executive Command Center",
    mobile: "+971-50-5555555",
    passwordHash: "exec123"
  },
  host: {
    username: "host",
    fullName: "Mohammed Al-Sowaidi",
    email: "m.sowaidi@sba.gov.ae",
    role: "Presenter",
    type: "Internal",
    department: "Direct Line Presenter",
    mobile: "+971-50-1111111",
    passwordHash: "host123"
  },
  producer: {
    username: "producer",
    fullName: "Fatima Al-Suwaidi",
    email: "f.suwaidi@sba.gov.ae",
    role: "Producer",
    type: "Internal",
    department: "Direct Line Show Production",
    mobile: "+971-50-2222222",
    passwordHash: "producer123"
  },
  officer: {
    username: "officer",
    fullName: "Maryam Al-Ali",
    email: "maryam.ali@sba.gov.ae",
    role: "CaseManager",
    type: "Internal",
    department: "Humanitarian Operations Center",
    mobile: "+971-50-3333333",
    passwordHash: "officer123"
  },
  liaison: {
    username: "liaison",
    fullName: "Dr. Khalid Al-Qasimi",
    email: "k.qasimi@housing.shj.ae",
    role: "ExternalLiaison",
    type: "External",
    entity: "Sharjah Housing Directorate",
    department: "Citizen Grants",
    mobile: "+971-50-4444444",
    passwordHash: "liaison123"
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
    const storedUser = localStorage.getItem("scc_session");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem("scc_session");
      }
    }
  }, []);

  const login = (username: string, passwordHash: string): boolean => {
    const userMatch = MOCK_USERS[username.toLowerCase()];
    if (userMatch && userMatch.passwordHash === passwordHash) {
      const sessionData: UserSession = {
        username: userMatch.username,
        fullName: userMatch.fullName,
        email: userMatch.email,
        role: userMatch.role,
        type: userMatch.type,
        entity: userMatch.entity,
        department: userMatch.department,
        mobile: userMatch.mobile
      };
      setUser(sessionData);
      localStorage.setItem("scc_session", JSON.stringify(sessionData));
      
      // Route based on role default dashboard
      if (userMatch.role === "Administrator") {
        router.push("/admin/users");
      } else if (userMatch.role === "SBAExecutive") {
        router.push("/executive");
      } else {
        router.push("/");
      }
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("scc_session");
    router.push("/login");
  };

  const changeRole = (role: UserRole) => {
    if (!user) return;
    const updatedUser = { ...user, role };
    setUser(updatedUser);
    localStorage.setItem("scc_session", JSON.stringify(updatedUser));
  };

  if (!isMounted) {
    return null; // Prevent SSR Hydration mismatches
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, changeRole }}>
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
