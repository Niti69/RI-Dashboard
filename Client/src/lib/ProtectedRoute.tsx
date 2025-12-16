import { Navigate, useLocation } from "react-router-dom";
import { useStaffAuth } from "@/context/StaffAuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { staff, token } = useStaffAuth();
  const location = useLocation();

  // 🔒 Not logged in
  if (!token || !staff) {
    return (
      <Navigate
        to="/auth"
        replace
        state={{ from: location }}
      />
    );
  }

  // 🟢 ADMIN & SUPER_ADMIN → FULL ACCESS (NO CHECKS)
  if (staff.role === "ADMIN" || staff.role === "SUPER_ADMIN") {
    return <>{children}</>;
  }

  // 🟡 Other staff → role-based check
  if (allowedRoles && !allowedRoles.includes(staff.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;