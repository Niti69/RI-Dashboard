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

// ------------ Types ------------
interface FieldApp {
  applicationNumber: string;
  fullName: string;
  mobile: string;
  partnerType: string;
  fieldVisitStatus: string;
  submittedAt: string;
}

const FieldQueue = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<FieldApp[]>([]);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await fetch("https://ri-dashboard-tl5e.onrender.com/api/applications"); // << combined list route
      const data = await res.json();

      if (!data.success) throw new Error("API returned error");

      // Filter only applications that require field verification
      const filtered = data.data.filter((a: any) =>
        ["Field Pending", "Field Visit Scheduled", "Field Verification In Progress"].includes(
          a.fieldVisitStatus
        )
      );

      setApplications(filtered);
    } catch (err) {
      console.error("API Error:", err);
    }
    setLoading(false);
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, { label: string; variant: any }> = {
      "Field Pending": { label: "Pending", variant: "secondary" },
      "Field Visit Scheduled": { label: "Scheduled", variant: "default" },
      "Field Verification In Progress": { label: "In Progress", variant: "outline" },
      "Field Verified": { label: "Verified", variant: "success" },
    };

    const info = map[status] || { label: status, variant: "outline" };
    return <Badge variant={info.variant}>{info.label}</Badge>;
  };

  const handleOpenVerification = (app: FieldApp) => {
    navigate(`/field-verification/${app.applicationNumber}`);
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
      <h1 className="text-3xl font-bold">Field Verification Queue</h1>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Application ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Partner Type</TableHead>
            <TableHead>Mobile</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Submitted</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {applications.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-6 text-gray-500">
                No applications requiring field verification.
              </TableCell>
            </TableRow>
          ) : (
            applications.map((app) => (
              <TableRow key={app.applicationNumber}>
                <TableCell className="font-mono">{app.applicationNumber}</TableCell>

                <TableCell>{app.fullName}</TableCell>

                <TableCell>{app.partnerType}</TableCell>

                <TableCell>{app.mobile}</TableCell>

                <TableCell>{getStatusBadge(app.fieldVisitStatus)}</TableCell>

                <TableCell>
                  {new Date(app.submittedAt).toLocaleDateString("en-IN")}
                </TableCell>

                <TableCell>
                  <Button size="sm" onClick={() => handleOpenVerification(app)}>
                    Start Verification
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

export default FieldQueue;
