import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, User } from "lucide-react";
import { toast } from "sonner";

interface StaffProfile {
  _id: string;
  staffCode: string;
  name: string;
  userId: string;
  email?: string;
  mobile?: string;
  role: string;
  district?: string;
  status: string;
  casesHandled: number;
  lastLogin?: string;
  createdAt: string;
}

const Profile = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState<StaffProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("staffToken");

        if (!token) {
          toast.error("Session expired. Please login again.");
          return;
        }

        const res = await fetch(
          `http://localhost:5001/api/staff/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to load profile");
        }

        setProfile(data.data);
      } catch (err: any) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl">{profile.name}</CardTitle>
            <p className="text-muted-foreground">{profile.role}</p>
          </div>
        </CardHeader>

        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Info label="Staff ID" value={profile.staffCode} />
          <Info label="User ID" value={profile.userId} />
          <Info label="Email" value={profile.email || "—"} />
          <Info label="Mobile" value={profile.mobile || "—"} />
          <Info label="District" value={profile.district || "—"} />
          <Info
            label="Status"
            value={
              <Badge
                className={
                  profile.status === "ACTIVE"
                    ? "bg-green-500"
                    : "bg-red-500"
                }
              >
                {profile.status}
              </Badge>
            }
          />
          <Info label="Cases Handled" value={profile.casesHandled} />
          <Info
            label="Last Login"
            value={profile.lastLogin ? profile.lastLogin : "Never"}
          />
          <Info
            label="Account Created"
            value={new Date(profile.createdAt).toLocaleDateString()}
          />
        </CardContent>
      </Card>
    </div>
  );
};

const Info = ({ label, value }: { label: string; value: any }) => (
  <div>
    <p className="text-sm text-muted-foreground">{label}</p>
    <p className="font-medium">{value}</p>
  </div>
);

export default Profile;