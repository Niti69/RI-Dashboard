import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// ----------- Types -----------
interface Application {
  id: string;
  name: string;
  mobile: string;
  email?: string;
  type: string;
  status: string;
  feeCollected: boolean;
  amount: string;
  createdDate: string;
  sla: "green" | "orange" | "red";
  kyc_reference_id?: string;
  reference_id?: string;
}

export default function AdminReviewQueue() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<Application[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  useEffect(() => {
    fetchApplications();
  }, []);

  // Fetch applications from API
  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5001/api/application");
      
      if (!res.ok) {
        throw new Error("Failed to fetch applications");
      }

      const data: Application[] = await res.json();

      // Filter for applications with status "Field Verified — Under Admin Review"
      const filtered = data.filter((app) => {
        const status = app.status.toLowerCase();
        return (
          status === "field verified — under admin review" ||
          status === "field verified - under admin review" ||
          status === "under admin review" ||
          status.includes("admin review")
        );
      });

      setApplications(filtered);

      // Calculate stats (you can modify this based on your needs)
      setStats({
        pending: filtered.length,
        approved: 0, // You'll need to track this separately or fetch from another endpoint
        rejected: 0, // You'll need to track this separately or fetch from another endpoint
      });
    } catch (err) {
      console.error("Error fetching applications:", err);
      // You might want to show a toast notification here
    } finally {
      setLoading(false);
    }
  };

  const handleReviewClick = (appId: string) => {
    // Navigate to the review/detail page
    navigate(`/admin-review/${appId}`);
  };

  // Filter applications based on search term
  const filteredApplications = applications.filter((app) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      app.id.toLowerCase().includes(searchLower) ||
      app.name.toLowerCase().includes(searchLower) ||
      (app.reference_id && app.reference_id.toLowerCase().includes(searchLower)) ||
      (app.mobile && app.mobile.includes(searchTerm))
    );
  });

  // Get status badge
  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase();
    
    if (statusLower.includes("admin review") || statusLower.includes("field verified")) {
      return <Badge variant="default">Ready for Review</Badge>;
    }
    
    return <Badge variant="outline">{status}</Badge>;
  };

  // Get SLA badge color
  const getSLABadge = (sla: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      green: "default",
      orange: "secondary",
      red: "destructive",
    };

    return (
      <Badge variant={variants[sla] || "outline"}>
        {sla.toUpperCase()}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Administration Review Queue</h1>
        <p className="text-muted-foreground">
          Final approval for field-verified applications
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Awaiting final approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Approved Today</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approved}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Successfully approved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Rejected Today</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.rejected}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Required clarification
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <Input
          placeholder="Search by ID, name, or mobile..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Button variant="outline" onClick={fetchApplications}>
          Refresh
        </Button>
      </div>

      {/* Applications List */}
      <Card>
        <CardHeader>
          <CardTitle>Applications Pending Final Review</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Application ID</TableHead>
                  <TableHead>Applicant</TableHead>
                  <TableHead>Mobile</TableHead>
                  <TableHead>Franchise Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>SLA</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center p-8 text-muted-foreground">
                      {searchTerm
                        ? "No applications match your search"
                        : "No applications pending admin review"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredApplications.map((app) => (
                    <TableRow key={app.id} className="hover:bg-gray-50">
                      <TableCell className="font-mono text-sm">
                        {app.reference_id || app.id}
                      </TableCell>
                      <TableCell className="font-medium">{app.name}</TableCell>
                      <TableCell className="text-sm">{app.mobile}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {app.type.replace(/_/g, " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(app.status)}</TableCell>
                      <TableCell>{getSLABadge(app.sla)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(app.createdDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button size="sm" onClick={() => handleReviewClick(app.id)}>
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}