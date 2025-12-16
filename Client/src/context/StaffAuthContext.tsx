import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface Staff {
  id: string;
  role: string;
}

interface AuthContextType {
  staff: Staff | null;
  token: string | null;
  login: (data: { token: string; staff: Staff }) => void;
  logout: () => void;
}

const StaffAuthContext = createContext<AuthContextType | null>(null);

export const StaffAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();

  const [staff, setStaff] = useState<Staff | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem("staffToken");
    const staffId = localStorage.getItem("staffId");
    const staffRole = localStorage.getItem("staffRole");

    if (savedToken && staffId && staffRole) {
      setToken(savedToken);
      setStaff({ id: staffId, role: staffRole });
    }
  }, []);

  const login = ({ token, staff }: { token: string; staff: Staff }) => {
    localStorage.setItem("staffToken", token);
    localStorage.setItem("staffId", staff.id);
    localStorage.setItem("staffRole", staff.role);

    setToken(token);
    setStaff(staff);
  };

  const logout = () => {
    localStorage.clear();
    setToken(null);
    setStaff(null);
    navigate("/auth", { replace: true });
  };

  return (
    <StaffAuthContext.Provider value={{ staff, token, login, logout }}>
      {children}
    </StaffAuthContext.Provider>
  );
};

export const useStaffAuth = () => {
  const ctx = useContext(StaffAuthContext);
  if (!ctx) throw new Error("useStaffAuth must be used inside StaffAuthProvider");
  return ctx;
};