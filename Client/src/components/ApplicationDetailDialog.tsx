import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  FileText, 
  CreditCard,
  CheckCircle2,
  XCircle,
  Clock
} from "lucide-react";

interface ApplicationDetailDialogProps {
  applicationId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Mock data - would come from backend in real app
const getApplicationDetails = (id: string | null) => {
  if (!id) return null;
  
  return {
    id: id,
    name: "Rahul Verma",
    mobile: "+91 98765 43210",
    email: "rahul.verma@example.com",
    type: "Fleet Owner",
    currentStep: "Step 3",
    status: "KYC Completed",
    createdDate: "2024-11-25",
    address: "Plot No. 123, Sector 15, Andheri West, Mumbai, Maharashtra - 400053",
    district: "Mumbai",
    state: "Maharashtra",
    pincode: "400053",
    feeCollected: true,
    feeAmount: "₹5,000",
    feeDate: "2024-11-26",
    documents: [
      { name: "Aadhaar Card", status: "verified", uploadDate: "2024-11-25" },
      { name: "PAN Card", status: "verified", uploadDate: "2024-11-25" },
      { name: "Address Proof", status: "verified", uploadDate: "2024-11-25" },
      { name: "Business Registration", status: "pending", uploadDate: "2024-11-25" },
    ],
    timeline: [
      { step: "Application Submitted", date: "2024-11-25 10:30 AM", status: "completed" },
      { step: "Document Verification", date: "2024-11-25 02:15 PM", status: "completed" },
      { step: "Tele-Verification", date: "2024-11-26 11:00 AM", status: "completed" },
      { step: "KYC Completed", date: "2024-11-26 04:30 PM", status: "completed" },
      { step: "Field Visit Pending", date: "Pending", status: "pending" },
      { step: "Admin Review", date: "Pending", status: "pending" },
    ],
    assignedStaff: {
      kyc: "Priya Sharma",
      field: "Not Assigned",
      admin: "Not Assigned",
    },
    notes: [
      { author: "Priya Sharma", date: "2024-11-26 02:00 PM", text: "All documents verified successfully. Applicant was cooperative during tele-verification." },
    ],
  };
};

export const ApplicationDetailDialog = ({
  applicationId,
  open,
  onOpenChange,
}: ApplicationDetailDialogProps) => {
  const data = getApplicationDetails(applicationId);

  if (!data) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl">{data.name}</DialogTitle>
              <DialogDescription className="font-mono text-sm mt-1">
                {data.id}
              </DialogDescription>
            </div>
            <Badge variant={data.status.includes("Completed") ? "default" : "secondary"}>
              {data.status}
            </Badge>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Applicant Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Full Name</div>
                      <div className="font-medium">{data.name}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Mobile</div>
                      <div className="font-medium">{data.mobile}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Email</div>
                      <div className="font-medium">{data.email}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                    <div>
                      <div className="text-sm text-muted-foreground">Address</div>
                      <div className="font-medium text-sm">{data.address}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Application Status</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Partner Type</div>
                      <div className="font-medium">{data.type}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Current Step</div>
                      <div className="font-medium">{data.currentStep}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Created Date</div>
                      <div className="font-medium">{data.createdDate}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Fee Status</div>
                      <div className="flex items-center gap-2">
                        <Badge variant={data.feeCollected ? "default" : "secondary"}>
                          {data.feeCollected ? "Collected" : "Pending"}
                        </Badge>
                        {data.feeCollected && (
                          <span className="font-medium">{data.feeAmount}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Assigned Staff</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-lg border border-border bg-muted/50 p-4">
                  <div className="text-sm text-muted-foreground mb-1">KYC Staff</div>
                  <div className="font-medium">{data.assignedStaff.kyc}</div>
                </div>
                <div className="rounded-lg border border-border bg-muted/50 p-4">
                  <div className="text-sm text-muted-foreground mb-1">Field Staff</div>
                  <div className="font-medium">{data.assignedStaff.field}</div>
                </div>
                <div className="rounded-lg border border-border bg-muted/50 p-4">
                  <div className="text-sm text-muted-foreground mb-1">Admin Reviewer</div>
                  <div className="font-medium">{data.assignedStaff.admin}</div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="documents" className="space-y-4">
            <h3 className="font-semibold text-lg">Uploaded Documents</h3>
            <div className="space-y-3">
              {data.documents.map((doc, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{doc.name}</div>
                      <div className="text-sm text-muted-foreground">
                        Uploaded: {doc.uploadDate}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {doc.status === "verified" ? (
                      <Badge variant="default" className="bg-success">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                      </Badge>
                    )}
                    <Button variant="outline" size="sm">View</Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="timeline" className="space-y-4">
            <h3 className="font-semibold text-lg">Application Timeline</h3>
            <div className="space-y-4">
              {data.timeline.map((item, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`rounded-full p-2 ${
                        item.status === "completed"
                          ? "bg-success text-white"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {item.status === "completed" ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <Clock className="h-4 w-4" />
                      )}
                    </div>
                    {index < data.timeline.length - 1 && (
                      <div className="w-0.5 h-12 bg-border" />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="font-medium">{item.step}</div>
                    <div className="text-sm text-muted-foreground">{item.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="notes" className="space-y-4">
            <h3 className="font-semibold text-lg">Staff Notes & Comments</h3>
            <div className="space-y-3">
              {data.notes.map((note, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg border border-border bg-muted/50"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium">{note.author}</div>
                    <div className="text-sm text-muted-foreground">{note.date}</div>
                  </div>
                  <p className="text-sm">{note.text}</p>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full">Add Note</Button>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t border-border">
          <Button variant="outline">Reassign Staff</Button>
          <Button variant="destructive">
            <XCircle className="mr-2 h-4 w-4" />
            Reject Application
          </Button>
          <Button>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Approve & Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
