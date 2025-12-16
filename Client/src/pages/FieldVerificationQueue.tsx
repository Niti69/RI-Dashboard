import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, MapPin, Clock, Users } from "lucide-react";
import { toast } from "sonner";

// ---------- Types ----------
interface Application {
  id: string;
  name: string;
  mobile: string;
  type: string;
  status: string;
  createdDate: string;
  address: string;
}

// ---------- Component ----------
export default function FieldVerificationQueue() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<Application[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadApplications();
  }, []);

  // Fetch Field Pending + In Progress Applications
  const loadApplications = async () => {
    try {
      setLoading(true);

      const res = await fetch("https://ri-dashboard-tl5e.onrender.com/api/application");
      const data: Application[] = await res.json();

      // Filter FIELD VERIFICATION QUEUE
      const filtered = data.filter((app) =>
        ["field pending", "field visit scheduled", "field verification in progress"].includes(
          app.status.toLowerCase()
        )
      );

      setApplications(filtered);
    } catch (err) {
      console.error("Field queue error:", err);
      toast.error("Failed to load field verification queue");
    } finally {
      setLoading(false);
    }
  };

  // Search Filter
  const filteredApplications = applications.filter((app) =>
    app.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Stats
  const stats = {
    pending: applications.filter(a => a.status.toLowerCase() === "field pending").length,
    inProgress: applications.filter(a => a.status.toLowerCase() === "field verification in progress").length,
    total: applications.length,
  };
  console.log(filteredApplications)
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
        <h1 className="text-3xl font-bold">Field Verification Queue</h1>
        <p className="text-muted-foreground">Manage field verification visits</p>
      </div>

      {/* ---- Stats ---- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Visits</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inProgress}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Cases</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
      </div>

      {/* ---- Search ---- */}
      <div className="flex gap-4">
        <Input
          placeholder="Search by application ID or name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* ---- Table ---- */}
      <Card>
        <CardHeader>
          <CardTitle>Queue List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>App ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredApplications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No applications found
                  </TableCell>
                </TableRow>
              ) : (
                filteredApplications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell className="font-mono">{app.id}</TableCell>
                    <TableCell>{app.name}</TableCell>
                    <TableCell className="capitalize">{app.type}</TableCell>
                    <TableCell className="max-w-xs truncate">{app.mobile}</TableCell>

                    <TableCell>
                      <Badge variant={app.status.toLowerCase() === "field pending" ? "default" : "secondary"}>
                        {app.status}
                      </Badge>
                    </TableCell>

                    <TableCell>{app.createdDate}</TableCell>

                    <TableCell>
                      <Button size="sm" onClick={() => navigate(`/field-verification/${app.id}`)}>
                        Start Visit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
