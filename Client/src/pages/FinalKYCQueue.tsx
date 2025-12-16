import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
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
  type: string;
  status: string;
  createdDate: string;
}

const FinalKYCQueue = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<Application[]>([]);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await fetch("https://ri-dashboard-tl5e.onrender.com/api/application");
      const data = await res.json();

      // Only Step 3 pending: status === "Under Review"
      const filtered = data.filter(
        (app: Application) => app.status.toLowerCase() === "under review"
      );

      setApplications(filtered);
    } catch (err) {
      console.error("API Error:", err);
    }
    setLoading(false);
  };

  // Badge styling identical to TeleQueue
  const getStatusBadge = (status: string) => {
    const map: Record<
      string,
      { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
    > = {
      "under review": { label: "Ready for Final Approval", variant: "default" },
      approved: { label: "Approved", variant: "secondary" },
      rejected: { label: "Rejected", variant: "destructive" },
    };

    const info = map[status.toLowerCase()] || {
      label: status,
      variant: "outline",
    };

    return <Badge variant={info.variant}>{info.label}</Badge>;
  };

  const handleReview = (app: Application) => {
    navigate(`/kyc-approval/${app.id}`);
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
      <h1 className="text-3xl font-bold">Digital KYC Approval Queue</h1>

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
                No applications awaiting final KYC approval.
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
                  <Button size="sm" onClick={() => handleReview(app)}>
                    Review KYC
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

export default FinalKYCQueue;
