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
  feeCollected: boolean;
  amount: string;
  createdDate: string;
  sla: "green" | "orange" | "red";
}

const KycQueue = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<Application[]>([]);

  useEffect(() => {
    fetchApplications();
  }, []);

  // Fetch from your Node API
  const fetchApplications = async () => {
    try {
      const res = await fetch("https://ri-dashboard-tl5e.onrender.com/api/application");
      const data: Application[] = await res.json();

      // ONLY show the statuses you want in KYC Queue
      const filtered = data.filter((app) =>
        ["new", "pending", "kyc completed", "under admin review"].includes(
          app.status.toLowerCase()
        )
      );

      setApplications(filtered);
    } catch (err) {
      console.error("API Error:", err);
    }
    setLoading(false);
  };

  // Same badge logic but aligned to your API statuses
  const getStatusBadge = (status: string) => {
    const map: Record<
      string,
      { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
    > = {
      new: { label: "New", variant: "secondary" },
      pending: { label: "Pending", variant: "default" },
      "kyc completed": { label: "KYC Completed", variant: "default" },
      "under admin review": { label: "Admin Review", variant: "destructive" },
    };

    const info = map[status.toLowerCase()] || { label: status, variant: "outline" };

    return <Badge variant={info.variant}>{info.label}</Badge>;
  };

  const handleAction = (app: Application) => {
    navigate(`/document-verification/${app.id}`);
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
      <h1 className="text-3xl font-bold">KYC Queue</h1>

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
          {applications.map((app) => (
            <TableRow key={app.id}>
              <TableCell className="font-mono">{app.id}</TableCell>
              <TableCell>{app.name}</TableCell>
              <TableCell className="capitalize">{app.type}</TableCell>

              <TableCell>{getStatusBadge(app.status)}</TableCell>

              <TableCell>{app.createdDate}</TableCell>

              <TableCell>
                <Button size="sm" onClick={() => handleAction(app)}>
                  Review
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default KycQueue;
