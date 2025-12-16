import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, LogOut } from "lucide-react";
import { toast } from "sonner";

const ApplicantDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [application, setApplication] = useState<any>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  // ✅ Replace Supabase session check with your backend auth
  const checkAuth = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/me", {
        credentials: "include",
      });

      if (!res.ok) {
        navigate("/auth");
        return;
      }

      const data = await res.json();
      setUser(data.user);

      await fetchApplication(data.user.id);
      setLoading(false);
    } catch (err) {
      console.error(err);
      navigate("/auth");
    }
  };

  // ✅ Replace Supabase DB fetch with your Node API
  const fetchApplication = async (userId: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/applications/${userId}`);

      if (!res.ok) {
        toast.error("Failed to load application");
        return;
      }

      const data = await res.json();
      setApplication(data);
    } catch (err) {
      console.error("Error fetching application:", err);
      toast.error("Failed to load application");
    }
  };

  // ✅ Replace Supabase logout with your backend logout
  const handleLogout = async () => {
    await fetch("http://localhost:5000/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    navigate("/auth");
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<
      string,
      { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
    > = {
      new_pending_kyc: { label: "New - Pending KYC", variant: "secondary" },
      document_verification: { label: "Document Verification", variant: "default" },
      pending_applicant_action: { label: "Action Required", variant: "destructive" },
      tele_verification: { label: "Tele-Verification", variant: "default" },
      approved: { label: "Approved", variant: "default" },
      rejected: { label: "Rejected", variant: "destructive" },
    };

    const statusInfo = statusMap[status] || { label: status, variant: "outline" as const };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary">Application Dashboard</h1>
            <p className="text-muted-foreground">Welcome, {user?.full_name}</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>

        {application ? (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Application Status</CardTitle>
                  <CardDescription>Reference ID: {application.reference_id}</CardDescription>
                </div>
                {getStatusBadge(application.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Your existing UI unchanged */}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>No Application Found</CardTitle>
              <CardDescription>You haven't submitted an application yet.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate("/register")}>Submit Application</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ApplicantDashboard;