import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from "@/components/ui/table";

// ----------- Types -----------
interface Application {
  id: string;
  name: string;
  mobile: string;
  type: string;
  status: string;
  createdDate: string;
  sla: "green" | "orange" | "red";
}

const TeleQueue = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<Application[]>([]);

  useEffect(() => {
    fetchApplications();
  }, []);

  // Fetch all applications, filter only those in Tele Verification stage
  const fetchApplications = async () => {
    try {
      const res = await fetch("http://localhost:5001/api/application");
      const data: Application[] = await res.json();
      
      // Only show applications where status = Tele Verification
        const filtered = data.filter(
        (app) => app.status.toLowerCase() === "tele verification"
        );

      setApplications(filtered);
    } catch (err) {
      console.error("API Error:", err);
    }
    setLoading(false);
  };

  // Status badge styling (consistent style)
  const getStatusBadge = (status: string) => {
    const map: Record<
      string,
      { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
    > = {
      "tele verification": { label: "Tele Verification", variant: "default" },
      "tele verified": { label: "Tele Verified", variant: "secondary" },
      "tele failed": { label: "Tele Failed", variant: "destructive" },
    };

    const info = map[status.toLowerCase()] || { label: status, variant: "outline" };

    return <Badge variant={info.variant}>{info.label}</Badge>;
  };

  const handleAction = (app: Application) => {
    console.log(app.id)
    navigate(`/tele-verification/${app.id}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Tele-Verification Queue</h1>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Application ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Submitted</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {applications.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-6 text-gray-500">
                No pending tele-verification applications.
              </TableCell>
            </TableRow>
          ) : (
            applications.map((app) => (
              <TableRow key={app.id}>
                <TableCell className="font-mono">{app.id}</TableCell>
                <TableCell>{app.name}</TableCell>
                <TableCell className="capitalize">{app.type}</TableCell>

                <TableCell>{getStatusBadge(app.status)}</TableCell>

                <TableCell>{app.createdDate}</TableCell>

                <TableCell>
                  <Button size="sm" onClick={() => handleAction(app)}>
                    Start Call
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default TeleQueue;