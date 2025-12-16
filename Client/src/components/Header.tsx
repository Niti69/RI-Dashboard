import { Bell, User, LogIn, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";

export const Header = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("staffToken");
    const staffRole = localStorage.getItem("staffRole");

    setIsLoggedIn(!!token);
    setRole(staffRole);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:5001/api/auth/logout", {
        method: "POST",
      });
    } catch (err) {
      // ignore backend logout errors
    }

    localStorage.removeItem("staffToken");
    localStorage.removeItem("staffRole");

    setIsLoggedIn(false);
    navigate("/auth", { replace: true });
  };

  const handleLogin = () => {
    navigate("/auth");
  };

  const handleMyProfile = () => {
    const id = localStorage.getItem("staffId");
    if (!id) {
      toast.error("Session invalid. Please login again.");
      navigate("/auth");
      return;
    }
    navigate(`/profile/${id}`);
  };


  return (
    <header
      className="fixed right-0 top-0 z-10 h-16 border-b border-border bg-card"
      style={{ left: "280px" }}
    >
      <div className="flex h-full items-center justify-between px-6">
        <div>
          <h2 className="text-lg font-semibold">Staff Admin Panel</h2>
          {isLoggedIn && (
            <p className="text-sm text-muted-foreground">
              Logged in as {role}
            </p>
          )}
        </div>

        <div className="flex items-center gap-4">
          {isLoggedIn && (
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {/* <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-destructive" /> */}
            </Button>
          )}

          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleMyProfile}>
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={handleLogin}>
              <LogIn className="mr-2 h-4 w-4" />
              Login
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};