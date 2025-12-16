import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStaffAuth } from "@/context/StaffAuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { z } from "zod";

const API_BASE ="http://localhost:5001";


const loginSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  password: z.string().min(1, "Password is required"),
});


async function loginStaff(userId: string, password: string) {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userId, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Login failed");
  }

  return data;
}

const Auth = () => {
  const navigate = useNavigate();

  const { login } = useStaffAuth();
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");

  //   LOGIN HANDLER


  const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  try {
    const validated = loginSchema.parse({ userId, password });

    const data = await loginStaff(
      validated.userId.toUpperCase(),
      validated.password
    );

    // Store token & role
    login({
      token: data.token,
      staff: {
        id: data.staff.id,
        role: data.staff.role,
      },
    });

    toast.success("Login successful");

    // 🚨 Force password change on first login
    // if (data.staff.isFirstLogin) {
    //   navigate("/change-password", { replace: true });
    //   return;
    // }

    // ✅ ROLE BASED REDIRECTION
    switch (data.staff.role) {
      case "SUPER_ADMIN":
      case "ADMIN":
        navigate("/staff", { replace: true });
        break;

      case "KYC_STAFF":
        navigate("/kyc-queue", { replace: true });
        break;

      case "TELE_VERIFICATION":
        navigate("/tele-queue", { replace: true });
        break;

      case "FIELD_RM":
        navigate("/field-verification-queue", { replace: true });
        break;

      case "SUPPORT":
        navigate("/analytics", { replace: true });
        break;

      default:
        navigate("/", { replace: true });
    }
  } catch (error: any) {
    if (error.name === "ZodError") {
      toast.error(error.errors[0].message);
    } else {
      toast.error(error.message || "Login failed");
    }
  } finally {
    setLoading(false);
  }
};



  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">
            RILogistics
          </h1>
          <p className="text-muted-foreground">
            Staff Admin Portal
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Welcome</CardTitle>
            <CardDescription>
              Sign in to access the KYC verification system
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {/* USER ID */}
              <div>
                <Label htmlFor="userId">User ID</Label>
                <Input
                  id="userId"
                  type="text"
                  placeholder="ADMIN / KYC001"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  required
                />
              </div>

              {/* PASSWORD */}
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Sign In
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Staff accounts are created by Admin only
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
