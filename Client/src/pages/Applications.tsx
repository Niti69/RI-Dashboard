import { useEffect, useState } from "react";
import { Search, Filter, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ----------- Types -----------
interface Application {
  id: string;
  name: string;
  mobile: string;
  type: string;
  step?: string;
  status: string;
  feeCollected: boolean;
  amount: string;
  createdDate: string;
  sla: "green" | "orange" | "red";
}

const Applications = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApps, setFilteredApps] = useState<Application[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all-type");

  // Fetch data from backend
  useEffect(() => {
    fetch("http://localhost:5001/api/application")
      .then((res) => res.json())
      .then((data: Application[]) => {
        setApplications(data);
        setFilteredApps(data);
      })
      .catch((err) => console.error(err));
  }, []);

  // Apply filters when search or dropdowns change
  useEffect(() => {
    let result = [...applications];

    // Search filter
    if (search.trim()) {
      result = result.filter(
        (app) =>
          app.id.toLowerCase().includes(search.toLowerCase()) ||
          app.name.toLowerCase().includes(search.toLowerCase()) ||
          app.mobile.includes(search)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter(
        (app) => app.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // Partner type filter
    if (typeFilter !== "all-type") {
      result = result.filter((app) =>
        app.type.toLowerCase().includes(typeFilter.toLowerCase())
      );
    }

    setFilteredApps(result);
  }, [search, statusFilter, typeFilter, applications]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Applications Monitoring</h1>
        <p className="text-muted-foreground">
          Track and manage all applications
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by ID, name, or mobile..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Status Filter */}
        <Select onValueChange={setStatusFilter} defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="kyc completed">KYC Completed</SelectItem>
            <SelectItem value="under admin review">
              Under Admin Review
            </SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>

        {/* Partner Type Filter */}
        <Select onValueChange={setTypeFilter} defaultValue="all-type">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Partner Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-type">All Types</SelectItem>
            <SelectItem value="fleet owner">Fleet Owner</SelectItem>
            <SelectItem value="franchise partner">
              Franchise Partner
            </SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          More Filters
        </Button>

        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Application ID</TableHead>
              <TableHead>Applicant Details</TableHead>
              <TableHead>Partner Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Fee Status</TableHead>
              <TableHead>Created Date</TableHead>
              <TableHead>SLA</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredApps.map((app) => (
              <TableRow
                key={app.id}
                className="cursor-pointer hover:bg-muted/50"
              >
                <TableCell className="font-mono">{app.id}</TableCell>

                <TableCell>
                  <div className="font-medium">{app.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {app.mobile}
                  </div>
                </TableCell>

                <TableCell>{app.type}</TableCell>

                <TableCell>
                  <Badge variant="outline">{app.status}</Badge>
                </TableCell>

                <TableCell>
                  <Badge
                    variant={app.feeCollected ? "default" : "secondary"}
                  >
                    {app.feeCollected ? "Collected" : "Pending"}
                  </Badge>
                  <div className="text-sm mt-1">{app.amount}</div>
                </TableCell>

                <TableCell className="text-muted-foreground">
                  {app.createdDate}
                </TableCell>

                <TableCell>
                  <div
                    className={`h-3 w-3 rounded-full ${
                      app.sla === "green"
                        ? "bg-green-500"
                        : app.sla === "orange"
                        ? "bg-orange-500"
                        : "bg-red-500"
                    }`}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Applications;