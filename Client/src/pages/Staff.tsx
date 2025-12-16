import { useState } from "react";
import { Plus, Search, MoreVertical, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AddStaff from "@/components/Modal/AddStaff";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

/* ============================
   TYPES
============================ */

interface StaffProfile {
  _id: string;
  staffCode: string;
  name: string;
  role: string;
  district?: string;
  status: "ACTIVE" | "INACTIVE" | "BLOCKED";
  casesHandled: number;
  lastLogin?: string;
  createdAt: string;
}

/* ============================
   API HELPERS
============================ */

const API_BASE = "https://ri-dashboard-tl5e.onrender.com/api";

const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("staffToken")}`,
});

const fetchStaff = async (): Promise<StaffProfile[]> => {
  const res = await fetch(`${API_BASE}/staff`, {
    headers: authHeader(),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch staff");

  return data.data;
};

const toggleStaffStatus = async (id: string) => {
  const res = await fetch(`${API_BASE}/staff/${id}/status`, {
    method: "PATCH",
    headers: authHeader(),
  });

  if (!res.ok) throw new Error("Failed to update status");
};

/* ============================
   COMPONENT
============================ */

const Staff = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [showAddStaff, setShowAddStaff] = useState(false);

  /* ===== FETCH STAFF ===== */
  const {
    data: staffData = [],
    isLoading,
  } = useQuery({
    queryKey: ["staff"],
    queryFn: fetchStaff,
  });

  /* ===== TOGGLE STATUS ===== */
  const toggleMutation = useMutation({
    mutationFn: toggleStaffStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      toast({ title: "Status updated successfully" });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update staff status",
        variant: "destructive",
      });
    },
  });

  /* ===== FILTER ===== */
  const filteredStaff = staffData.filter((staff) => {
    const q = searchTerm.toLowerCase();
    return (
      staff.name.toLowerCase().includes(q) ||
      staff.staffCode.toLowerCase().includes(q) ||
      staff.role.toLowerCase().includes(q)
    );
  });
const navigate = useNavigate()
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Staff Management
          </h1>
          <p className="text-muted-foreground">
            Manage your verification team
          </p>
        </div>

        <Button onClick={() => setShowAddStaff(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Staff
        </Button>
      </div>

      {/* SEARCH */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search staff by name, ID, or role..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline">Filter</Button>
      </div>

      {/* TABLE */}
      <div className="rounded-lg border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Staff ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>District</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Cases Handled</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="py-10 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                </TableCell>
              </TableRow>
            ) : filteredStaff.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center text-muted-foreground py-8"
                >
                  No staff found
                </TableCell>
              </TableRow>
            ) : (
              filteredStaff.map((staff) => (
                <TableRow key={staff._id}>
                  <TableCell className="font-mono">
                    {staff.staffCode}
                  </TableCell>
                  <TableCell className="font-medium">
                    {staff.name}
                  </TableCell>
                  <TableCell>
                    {staff.role.replace("_", " ")}
                  </TableCell>
                  <TableCell>
                    {staff.district || "—"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        staff.status === "ACTIVE"
                          ? "bg-green-500"
                          : "bg-red-500"
                      }
                    >
                      {staff.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {staff.casesHandled}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {staff.lastLogin
                      ? formatDistanceToNow(
                          new Date(staff.lastLogin),
                          { addSuffix: true }
                        )
                      : "Never"}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={toggleMutation.isPending}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                      onClick={() => navigate(`/profile/${staff._id}`)}
                                  >
                                      View Profile
                                  </DropdownMenuItem>

                        <DropdownMenuItem
                          className={
                            staff.status === "ACTIVE"
                              ? "text-destructive"
                              : "text-green-600"
                          }
                          onClick={() =>
                            toggleMutation.mutate(staff._id)
                          }
                        >
                          {staff.status === "ACTIVE"
                            ? "Deactivate"
                            : "Activate"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* ADD STAFF MODAL */}
      {showAddStaff && (
        <AddStaff
          onClose={() => setShowAddStaff(false)}
          onSuccess={() => {
            setShowAddStaff(false);
            queryClient.invalidateQueries({ queryKey: ["staff"] });
          }}
        />
      )}
    </div>
  );
};

export default Staff;
