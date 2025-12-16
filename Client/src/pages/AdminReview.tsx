import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, CheckCircle, XCircle, AlertCircle, Phone, MapPin, FileText, User, Truck, Building } from "lucide-react";
import { toast } from "sonner";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
interface ApplicationData {
  applicationNumber: string;
  fullName?: string;
  mobile?: string;
  email?: string;
  // Fleet Owner fields
  fleetOwnerName?: string;
  rcNumber?: string;
  vehicleCount?: number;
  // Franchise Partner fields
  shopAddress?: string;
  businessType?: string;
  [key: string]: any;
}

interface Document {
  url: string | null;
  status: string;
  reason: string;
}

interface TeleVerificationLog {
  applicationNumber: string;
  applicantType: "FleetOwner" | "FranchisePartner";
  staffId: string;
  handledByName: string;
  callDate: string;
  callStatus: "not_called" | "verified" | "mismatch" | "cannot_reach";
  durationMinutes?: number;
  nameVerified: boolean;
  addressVerified: boolean;
  ageVerified: boolean;
  employmentStatus: string;
  businessTypeVerified: boolean;
  businessAddressVerified: boolean;
  natureOfOperation: string;
  yearsExperience: string;
  previousLogistics: boolean;
  serviceExpectationsNotes: string;
  expectedVolume: string;
  applicantQuestions: string;
  infoInconsistent: boolean;
  suspiciousResponses: boolean;
  communicationBarrier: boolean;
  incompleteInfo: boolean;
  decision: "" | "approve" | "reject" | "on_hold";
  decisionReason: string;
  detailedNotes: string;
}

interface VehicleData {
  registrationNumber: string;
  vehicleType: string;
  colorMake: string;
  photoFront: string;
  photoSide: string;
  photoRear: string;
  photoPlate: string;
  rcMatch: boolean | null;
  insuranceVerified: boolean | null;
  verificationStatus: "verified" | "not_verified" | "";
}

interface FeeData {
  standardFee: number;
  amountCollected: string;
  paymentMode: string;
  paymentReference: string;
  receiptNumber: string;
  paymentEvidenceUrl: string;
  agreementSigned: boolean;
  applicantConfirmed: boolean;
  termsAccepted: boolean;
  staffSignature: string;
}

interface FieldVerification {
  applicationNumber: string;
  staffId: string;
  scheduledDate: string;
  scheduledTime: string;
  gpsLocation: {
    latitude: string;
    longitude: string;
    accuracy: string;
    capturedAt: string;
  };
  addressExists: boolean;
  businessSignVisible: boolean;
  applicantPresent: boolean;
  personMetName: string;
  staffCount: number;
  businessOperatingStatus: string;
  operatingHours: string;
  counterDisplayArea: boolean;
  seatingForCustomers: boolean;
  itSetupComputer: boolean;
  itSetupInternet: boolean;
  signagePresent: boolean;
  warehouseSize: string;
  storageCapacity: string;
  parkingArea: boolean;
  safetyEquipment: boolean;
  cleanlinessRating: string;
  interviewSummary: string;
  applicantDemeanor: string;
  businessClarity: string;
  addressAuthenticity: string;
  businessLegitimacy: string;
  applicantCredibility: string;
  neighborhoodSafety: string;
  unlicensedOperation: boolean;
  cashHeavyOperations: boolean;
  illegalActivitySigns: boolean;
  redFlags: string[];
  redFlagDetails: string;
  verificationResult: string;
  resultNotes: string;
  photoExterior: string;
  photoInterior: string;
  photoWarehouse: string;
  photoVehicle1: string;
  photoVehicle2: string;
  photoLicense: string;
  vehicleData: VehicleData[];
  feeData: FeeData;
  applicationStatus: string;
}

interface ApiResponse {
  success: boolean;
  applicationNumber: string;
  type: "Fleet Owner" | "Franchise Partner";
  application: ApplicationData;
  teleVerification: TeleVerificationLog | null;
  fieldVerificationData: FieldVerification | null;
  documents: Record<string, Document>;
}

export default function AdminReview() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate()
  const params = useParams();
  const applicationId = params?.id as string;

  // Checklist state
  const [checklist, setChecklist] = useState({
    ageVerified: false,
    identityGenuine: false,
    addressAuthentic: false,
    businessLegitimate: false,
    noCriminalHistory: false,
    noDuplicateRegistration: false,
    documentsPresent: false,
    documentsAuthentic: false,
    noExpiredDocuments: false,
    signaturesProper: false,
    businessExists: false,
    businessOperating: false,
    ownerCredible: false,
    purposeRealistic: false,
    localCompliance: false,
    noFraudFlags: false,
    noUnlicensedOperations: false,
    noCriminalIndicators: false,
    noRestrictedPersons: false,
    noSuspiciousTransactions: false,
  });

  const [decision, setDecision] = useState<"approve" | "reject" | "hold" | null>(null);
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [complianceNotes, setComplianceNotes] = useState("");

  useEffect(() => {
    if (!applicationId) {
      setError("No application ID provided");
      setLoading(false);
      return;
    }

    fetchApplication();
  }, [applicationId]);

  const fetchApplication = async () => {
    try {
      setLoading(true);
      const response = await fetch(`https://ri-dashboard-tl5e.onrender.com/api/application/${applicationId}`);
      const result: ApiResponse = await response.json();

      if (result.success) {
        setData(result);
      } else {
        setError("Application not found");
      }
    } catch (err) {
      setError("Failed to fetch application data");
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };
    //Approve Function 
  const handleApprove = async () => {
    try {
      setSaving(true);

      const res = await fetch("https://ri-dashboard-tl5e.onrender.com/api/admin/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // important if admin auth uses cookies
        body: JSON.stringify({
          applicationNumber: data?.applicationNumber,
          complianceNotes,
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message);

      toast.success("Application approved & account created");
      fetchApplication();
      navigate('/admin-review-queue')
    } catch (err: any) {
      toast.error(err.message || "Failed to approve application");
    } finally {
      setSaving(false);
    }
  };

    // Reject
  const handleReject = async () => {
    if (!reason || !details) {
      toast.error("Please provide rejection reason and details");
      return;
    }

    try {
      setSaving(true);

      const res = await fetch("https://ri-dashboard-tl5e.onrender.com/api/admin/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          applicationNumber: data?.applicationNumber,
          reason,
          details,
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message);

      toast.success("Application rejected");
      fetchApplication();
      navigate('/admin-review-queue')
    } catch (err: any) {
      toast.error(err.message || "Failed to reject application");
    } finally {
      setSaving(false);
    }
  };
  //Hold Application
  const handleOnHold = async () => {
    if (!details) {
      toast.error("Please provide clarification reason");
      return;
    }

    try {
      setSaving(true);

      const res = await fetch("https://ri-dashboard-tl5e.onrender.com/api/admin/hold", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          applicationNumber: data?.applicationNumber,
          clarification: details,
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message);

      toast.success("Application put on hold");
      fetchApplication();
      navigate('/admin-review-queue')
    } catch (err: any) {
      toast.error(err.message || "Failed to put application on hold");
    } finally {
      setSaving(false);
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
              <h2 className="text-2xl font-bold mb-2">Application Not Found</h2>
              <p>{error || "No application data available"}</p>
              <Button onClick={fetchApplication} className="mt-4">
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const app = data.application;
  const documents = data.documents;
  const teleData = data.teleVerification;
  const fieldData = data.fieldVerificationData;
  const isFleetOwner = data.type === "Fleet Owner";

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Admin Review – {data.type} Application
          </h1>
          <p className="text-muted-foreground">
            Application: <span className="font-mono">{data.applicationNumber}</span>
          </p>
        </div>
        <Badge variant="default" className="text-lg px-4 py-2">
          {data.type}
        </Badge>
      </div>

      {/* Applicant Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Applicant Information
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-muted-foreground">Full Name</p>
            <p className="font-semibold text-lg">{app.fullName || app.fleetOwnerName || "N/A"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Mobile</p>
            <p className="font-mono">{app.mobile}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="font-medium">{app.email || "N/A"}</p>
          </div>
          {isFleetOwner && (
            <>
              <div>
                <p className="text-sm text-muted-foreground">RC Number</p>
                <p className="font-mono">{app.rcNumber || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Vehicle Count</p>
                <p>{app.vehicleCount || "N/A"}</p>
              </div>
            </>
          )}
          {!isFleetOwner && (
            <>
              <div>
                <p className="text-sm text-muted-foreground">Shop Address</p>
                <p>{app.shopAddress || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Business Type</p>
                <p>{app.businessType || "N/A"}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Verification Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Verification Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <span>1. Document Verification</span>
              <Badge variant="default">
                <CheckCircle className="mr-1 h-4 w-4" /> Passed
              </Badge>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <span>2. Tele-Verification</span>
              <Badge variant={teleData ? "default" : "secondary"}>
                {teleData ? (
                  <>
                    <CheckCircle className="mr-1 h-4 w-4" />
                    {teleData.callStatus === "verified" ? "Passed" : "Completed"}
                  </>
                ) : (
                  "Pending"
                )}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <span>3. Field Verification</span>
              <Badge variant={fieldData ? "default" : "secondary"}>
                {fieldData ? (
                  <>
                    <CheckCircle className="mr-1 h-4 w-4" /> {fieldData.applicationStatus}
                  </>
                ) : (
                  "Pending"
                )}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Tabs */}
      <Tabs defaultValue="documents" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="application">
            <FileText className="mr-1 h-4 w-4" />
            Application
          </TabsTrigger>
          <TabsTrigger value="documents">
            <FileText className="mr-1 h-4 w-4" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="tele">
            <Phone className="mr-1 h-4 w-4" />
            Tele-Verification
          </TabsTrigger>
          <TabsTrigger value="field">
            <MapPin className="mr-1 h-4 w-4" />
            Field Report
          </TabsTrigger>
          <TabsTrigger value="vehicles">
            <Truck className="mr-1 h-4 w-4" />
            Vehicles & Fee
          </TabsTrigger>
        </TabsList>

        {/* Application Details Tab */}
      <TabsContent value="application">
  <Card>
    <CardHeader>
      <CardTitle>Application Details</CardTitle>
    </CardHeader>

    <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      
      <div>
        <p className="text-sm text-muted-foreground">Full Name</p>
        <p className="font-medium">{app.fullName || "N/A"}</p>
      </div>

      <div>
        <p className="text-sm text-muted-foreground">Mobile</p>
        <p className="font-mono">{app.mobile || "N/A"}</p>
      </div>

      <div>
        <p className="text-sm text-muted-foreground">Email</p>
        <p>{app.email || "N/A"}</p>
      </div>

      <div>
        <p className="text-sm text-muted-foreground">Application Number</p>
        <p className="font-mono">{data.applicationNumber}</p>
      </div>

      <div>
        <p className="text-sm text-muted-foreground">Partner Type</p>
        <Badge>{data.type}</Badge>
      </div>

      {isFleetOwner ? (
        <>
          <div>
            <p className="text-sm text-muted-foreground">RC Number</p>
            <p className="font-mono">{app.rcNumber || "N/A"}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Vehicle Count</p>
            <p>{app.vehicleCount || "N/A"}</p>
          </div>
        </>
      ) : (
        <>
          <div>
            <p className="text-sm text-muted-foreground">Business Type</p>
            <p>{app.businessType || "N/A"}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Shop Address</p>
            <p>{app.shopAddress || "N/A"}</p>
          </div>
        </>
      )}

    </CardContent>
  </Card>
</TabsContent>


        {/* Documents Tab */}
        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Documents ({Object.keys(documents).length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {isFleetOwner ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
                    <div>
                      <p className="font-medium mb-1">Aadhaar File</p>
                      <Badge variant={documents.aadhaarFile?.status === "verified" ? "default" : "secondary"}>
                        {documents.aadhaarFile?.status || "N/A"}
                      </Badge>
                      {documents.aadhaarFile?.url && (
                        <Button variant="outline" size="sm" className="mt-1" asChild>
                          <a href={documents.aadhaarFile.url} target="_blank" rel="noopener noreferrer">
                            View Document
                          </a>
                        </Button>
                      )}
                    </div>
                    <div>
                      <p className="font-medium mb-1">PAN File</p>
                      <Badge variant={documents.panFile?.status === "verified" ? "default" : "secondary"}>
                        {documents.panFile?.status || "N/A"}
                      </Badge>
                      {documents.panFile?.url && (
                        <Button variant="outline" size="sm" className="mt-1" asChild>
                          <a href={documents.panFile.url} target="_blank" rel="noopener noreferrer">
                            View Document
                          </a>
                        </Button>
                      )}
                    </div>
                    <div>
                      <p className="font-medium mb-1">RC File</p>
                      <Badge variant={documents.rcFile?.status === "verified" ? "default" : "secondary"}>
                        {documents.rcFile?.status || "N/A"}
                      </Badge>
                      {documents.rcFile?.url && (
                        <Button variant="outline" size="sm" className="mt-1" asChild>
                          <a href={documents.rcFile.url} target="_blank" rel="noopener noreferrer">
                            View Document
                          </a>
                        </Button>
                      )}
                    </div>
                    <div>
                      <p className="font-medium mb-1">Insurance File</p>
                      <Badge variant={documents.insuranceFile?.status === "verified" ? "default" : "secondary"}>
                        {documents.insuranceFile?.status || "N/A"}
                      </Badge>
                      {documents.insuranceFile?.url && (
                        <Button variant="outline" size="sm" className="mt-1" asChild>
                          <a href={documents.insuranceFile.url} target="_blank" rel="noopener noreferrer">
                            View Document
                          </a>
                        </Button>
                      )}
                    </div>
                    <div>
                      <p className="font-medium mb-1">Fitness File</p>
                      <Badge variant={documents.fitnessFile?.status === "verified" ? "default" : "secondary"}>
                        {documents.fitnessFile?.status || "N/A"}
                      </Badge>
                      {documents.fitnessFile?.url && (
                        <Button variant="outline" size="sm" className="mt-1" asChild>
                          <a href={documents.fitnessFile.url} target="_blank" rel="noopener noreferrer">
                            View Document
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
                    <div>
                      <p className="font-medium mb-1">Applicant Photo</p>
                      <Badge variant={documents.applicantPhoto?.status === "verified" ? "default" : "secondary"}>
                        {documents.applicantPhoto?.status || "N/A"}
                      </Badge>
                      {documents.applicantPhoto?.url && (
                        <Button variant="outline" size="sm" className="mt-1" asChild>
                          <a href={documents.applicantPhoto.url} target="_blank" rel="noopener noreferrer">
                            View Photo
                          </a>
                        </Button>
                      )}
                    </div>
                    <div>
                      <p className="font-medium mb-1">Aadhaar Copy</p>
                      <Badge variant={documents.aadhaarCopy?.status === "verified" ? "default" : "secondary"}>
                        {documents.aadhaarCopy?.status || "N/A"}
                      </Badge>
                      {documents.aadhaarCopy?.url && (
                        <Button variant="outline" size="sm" className="mt-1" asChild>
                          <a href={documents.aadhaarCopy.url} target="_blank" rel="noopener noreferrer">
                            View Document
                          </a>
                        </Button>
                      )}
                    </div>
                    <div>
                      <p className="font-medium mb-1">PAN Copy</p>
                      <Badge variant={documents.panCopy?.status === "verified" ? "default" : "secondary"}>
                        {documents.panCopy?.status || "N/A"}
                      </Badge>
                      {documents.panCopy?.url && (
                        <Button variant="outline" size="sm" className="mt-1" asChild>
                          <a href={documents.panCopy.url} target="_blank" rel="noopener noreferrer">
                            View Document
                          </a>
                        </Button>
                      )}
                    </div>
                    <div>
                      <p className="font-medium mb-1">GST Certificate</p>
                      <Badge variant={documents.gstCertificate?.status === "verified" ? "default" : "secondary"}>
                        {documents.gstCertificate?.status || "N/A"}
                      </Badge>
                      {documents.gstCertificate?.url && (
                        <Button variant="outline" size="sm" className="mt-1" asChild>
                          <a href={documents.gstCertificate.url} target="_blank" rel="noopener noreferrer">
                            View Document
                          </a>
                        </Button>
                      )}
                    </div>
                    <div>
                      <p className="font-medium mb-1">Shop Ownership</p>
                      <Badge variant={documents.shopOwnershipDoc?.status === "verified" ? "default" : "secondary"}>
                        {documents.shopOwnershipDoc?.status || "N/A"}
                      </Badge>
                      {documents.shopOwnershipDoc?.url && (
                        <Button variant="outline" size="sm" className="mt-1" asChild>
                          <a href={documents.shopOwnershipDoc.url} target="_blank" rel="noopener noreferrer">
                            View Document
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tele-Verification Tab */}
        <TabsContent value="tele">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Tele-Verification Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {teleData ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold mb-3">Call Details</h3>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Status:</span>{' '}
                          <Badge variant={teleData.callStatus === "verified" ? "default" : "secondary"}>
                            {teleData.callStatus.replace(/_/g, " ").toUpperCase()}
                          </Badge>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Staff ID:</span> {teleData.staffId}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Handled By:</span> {teleData.handledByName}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Call Date:</span>{' '}
                          {new Date(teleData.callDate).toLocaleString()}
                        </div>
                        {teleData.durationMinutes && (
                          <div>
                            <span className="text-muted-foreground">Duration:</span> {teleData.durationMinutes} mins
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-3">Verification Results</h3>
                      <div className="space-y-2 text-sm">
                        <div>Name Verified: <Badge variant={teleData.nameVerified ? "default" : "destructive"}>{teleData.nameVerified ? "✓ Yes" : "✗ No"}</Badge></div>
                        <div>Address Verified: <Badge variant={teleData.addressVerified ? "default" : "destructive"}>{teleData.addressVerified ? "✓ Yes" : "✗ No"}</Badge></div>
                        <div>Age Verified: <Badge variant={teleData.ageVerified ? "default" : "destructive"}>{teleData.ageVerified ? "✓ Yes" : "✗ No"}</Badge></div>
                        <div>Business Type Verified: <Badge variant={teleData.businessTypeVerified ? "default" : "destructive"}>{teleData.businessTypeVerified ? "✓ Yes" : "✗ No"}</Badge></div>
                        <div>Business Address Verified: <Badge variant={teleData.businessAddressVerified ? "default" : "destructive"}>{teleData.businessAddressVerified ? "✓ Yes" : "✗ No"}</Badge></div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold mb-3">Business Details</h3>
                      <div className="space-y-2 text-sm">
                        <div><span className="font-medium">Nature of Operation:</span> {teleData.natureOfOperation || "N/A"}</div>
                        <div><span className="font-medium">Years Experience:</span> {teleData.yearsExperience || "N/A"}</div>
                        <div><span className="font-medium">Previous Logistics:</span> {teleData.previousLogistics ? "✓ Yes" : "✗ No"}</div>
                        <div><span className="font-medium">Expected Volume:</span> {teleData.expectedVolume || "N/A"}</div>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-3">Red Flags</h3>
                      <div className="space-y-2 text-sm">
                        <div>Info Inconsistent: <Badge variant={teleData.infoInconsistent ? "destructive" : "default"}>{teleData.infoInconsistent ? "⚠️ Yes" : "✅ No"}</Badge></div>
                        <div>Suspicious Responses: <Badge variant={teleData.suspiciousResponses ? "destructive" : "default"}>{teleData.suspiciousResponses ? "⚠️ Yes" : "✅ No"}</Badge></div>
                        <div>Communication Barrier: <Badge variant={teleData.communicationBarrier ? "destructive" : "default"}>{teleData.communicationBarrier ? "⚠️ Yes" : "✅ No"}</Badge></div>
                        <div>Incomplete Info: <Badge variant={teleData.incompleteInfo ? "destructive" : "default"}>{teleData.incompleteInfo ? "⚠️ Yes" : "✅ No"}</Badge></div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold mb-2">Decision</h3>
                      <Badge variant={teleData.decision === "approve" ? "default" : teleData.decision === "reject" ? "destructive" : "secondary"}>
                        {teleData.decision || "Pending"}
                      </Badge>
                      {teleData.decisionReason && (
                        <p className="text-sm mt-1">{teleData.decisionReason}</p>
                      )}
                    </div>
                    {teleData.serviceExpectationsNotes && (
                      <div>
                        <h3 className="font-semibold mb-2">Service Expectations</h3>
                        <p className="text-sm bg-muted p-3 rounded">{teleData.serviceExpectationsNotes}</p>
                      </div>
                    )}
                    {teleData.applicantQuestions && (
                      <div>
                        <h3 className="font-semibold mb-2">Applicant Questions</h3>
                        <p className="text-sm bg-muted p-3 rounded">{teleData.applicantQuestions}</p>
                      </div>
                    )}
                    {teleData.detailedNotes && (
                      <div>
                        <h3 className="font-semibold mb-2">Detailed Notes</h3>
                        <p className="text-sm bg-muted p-3 rounded">{teleData.detailedNotes}</p>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  No tele-verification record found
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Field Verification Tab */}
        <TabsContent value="field">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Field Verification Report
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {fieldData ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold mb-3">Visit Details</h3>
                      <div className="space-y-2 text-sm">
                        <div>Staff ID: {fieldData.staffId}</div>
                        <div>Scheduled: {fieldData.scheduledDate} at {fieldData.scheduledTime}</div>
                        {/* <div>GPS: {fieldData.gpsLocation.latitude}, {fieldData.gpsLocation.longitude}</div> */}
                        {/* <div>Accuracy: {fieldData.gpsLocation.accuracy}</div> */}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-3">Basic Checks</h3>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>Address Exists: <Badge variant={fieldData.addressExists ? "default" : "destructive"}>{fieldData.addressExists ? "✓" : "✗"}</Badge></div>
                        <div>Business Sign: <Badge variant={fieldData.businessSignVisible ? "default" : "destructive"}>{fieldData.businessSignVisible ? "✓" : "✗"}</Badge></div>
                        <div>Applicant Present: <Badge variant={fieldData.applicantPresent ? "default" : "destructive"}>{fieldData.applicantPresent ? "✓" : "✗"}</Badge></div>
                        <div>Person Met: {fieldData.personMetName || "N/A"}</div>
                        <div>Staff Count: {fieldData.staffCount}</div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold mb-3">Infrastructure</h3>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>Counter Area: <Badge variant={fieldData.counterDisplayArea ? "default" : "secondary"}>{fieldData.counterDisplayArea ? "✓" : "✗"}</Badge></div>
                        <div>Customer Seating: <Badge variant={fieldData.seatingForCustomers ? "default" : "secondary"}>{fieldData.seatingForCustomers ? "✓" : "✗"}</Badge></div>
                        <div>Computer: <Badge variant={fieldData.itSetupComputer ? "default" : "secondary"}>{fieldData.itSetupComputer ? "✓" : "✗"}</Badge></div>
                        <div>Internet: <Badge variant={fieldData.itSetupInternet ? "default" : "secondary"}>{fieldData.itSetupInternet ? "✓" : "✗"}</Badge></div>
                        <div>Signage: <Badge variant={fieldData.signagePresent ? "default" : "secondary"}>{fieldData.signagePresent ? "✓" : "✗"}</Badge></div>
                        <div>Parking: <Badge variant={fieldData.parkingArea ? "default" : "secondary"}>{fieldData.parkingArea ? "✓" : "✗"}</Badge></div>
                        <div>Safety Equip: <Badge variant={fieldData.safetyEquipment ? "default" : "secondary"}>{fieldData.safetyEquipment ? "✓" : "✗"}</Badge></div>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-3">Business Assessment</h3>
                      <div className="space-y-1 text-sm">
                        <div>Operating Status: {fieldData.businessOperatingStatus}</div>
                        <div>Hours: {fieldData.operatingHours}</div>
                        <div>Warehouse: {fieldData.warehouseSize} ({fieldData.storageCapacity})</div>
                        <div>Cleanliness: {fieldData.cleanlinessRating}</div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold mb-3">Risk Assessment</h3>
                      <div className="space-y-1 text-sm">
                        <div>Unlicensed Ops: <Badge variant={fieldData.unlicensedOperation ? "destructive" : "default"}>{fieldData.unlicensedOperation ? "⚠️" : "✅"}</Badge></div>
                        <div>Cash Heavy: <Badge variant={fieldData.cashHeavyOperations ? "destructive" : "default"}>{fieldData.cashHeavyOperations ? "⚠️" : "✅"}</Badge></div>
                        <div>Illegal Signs: <Badge variant={fieldData.illegalActivitySigns ? "destructive" : "default"}>{fieldData.illegalActivitySigns ? "⚠️" : "✅"}</Badge></div>
                        {fieldData.redFlags?.length > 0 && (
                          <div className="mt-2">
                            <span className="font-medium">Red Flags:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {fieldData.redFlags.map((flag, i) => (
                                <Badge key={i} variant="destructive" className="text-xs">{flag}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-3">Quality Scores</h3>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-muted-foreground text-xs">Address Authenticity</p>
                          <p>{fieldData.addressAuthenticity}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Business Legitimacy</p>
                          <p>{fieldData.businessLegitimacy}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Applicant Credibility</p>
                          <p>{fieldData.applicantCredibility}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Neighborhood Safety</p>
                          <p>{fieldData.neighborhoodSafety}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">Photos</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {[
                          { key: 'photoExterior', label: 'Exterior' },
                          { key: 'photoInterior', label: 'Interior' },
                          { key: 'photoWarehouse', label: 'Warehouse' },
                          { key: 'photoLicense', label: 'License' }
                        ].map(({ key, label }) => (
                          fieldData[key as keyof FieldVerification] && (
                            <Button
                              key={key}
                              variant="outline"
                              size="sm"
                              asChild
                            >
                              <a href={fieldData[key as keyof FieldVerification] as string} target="_blank" rel="noopener noreferrer">
                                {label}
                              </a>
                            </Button>
                          )
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Summary</h3>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium">Interview:</span> {fieldData.interviewSummary}</p>
                        <p><span className="font-medium">Demeanor:</span> {fieldData.applicantDemeanor}</p>
                        <p><span className="font-medium">Business Clarity:</span> {fieldData.businessClarity}</p>
                        <p className="pt-2 border-t">
                          <span className="font-semibold">Result:</span>{' '}
                          <Badge variant="default" className="ml-1">{fieldData.verificationResult}</Badge>
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  No field verification record found
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vehicles & Fee Tab */}
        <TabsContent value="vehicles">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Vehicles & Fee Collection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {fieldData?.vehicleData && fieldData.vehicleData.length > 0 ? (
                <div>
                  <h3 className="font-semibold mb-4 text-lg">Vehicle Verification ({fieldData.vehicleData.length})</h3>
                  <div className="space-y-3">
                    {fieldData.vehicleData.map((vehicle, index) => (
                      <Card key={vehicle.registrationNumber || index}>
                        <CardContent className="pt-6 pb-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="font-medium mb-1">Registration: {vehicle.registrationNumber}</p>
                              <p className="text-sm text-muted-foreground mb-2">Type: {vehicle.vehicleType} | Make: {vehicle.colorMake}</p>
                              <Badge variant={vehicle.verificationStatus === "verified" ? "default" : "secondary"}>
                                {vehicle.verificationStatus || "Pending"}
                              </Badge>
                              <div className="mt-2 grid grid-cols-2 gap-1 text-xs">
                                <div>RC Match: <Badge variant={vehicle.rcMatch ? "default" : "destructive"}>{vehicle.rcMatch ? "✓" : "✗"}</Badge></div>
                                <div>Insurance: <Badge variant={vehicle.insuranceVerified ? "default" : "destructive"}>{vehicle.insuranceVerified ? "✓" : "✗"}</Badge></div>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              {[
                                { key: 'photoFront', label: 'Front' },
                                { key: 'photoSide', label: 'Side' },
                                { key: 'photoRear', label: 'Rear' },
                                { key: 'photoPlate', label: 'Plate' }
                              ].map(({ key, label }) => (
                                vehicle[key as keyof VehicleData] && (
                                  <Button
                                    key={key}
                                    variant="outline"
                                    size="sm"
                                    asChild
                                  >
                                    <a href={vehicle[key as keyof VehicleData] as string} target="_blank" rel="noopener noreferrer">
                                      {label}
                                    </a>
                                  </Button>
                                )
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground col-span-full">
                  No vehicle data available
                </div>
              )}

              {fieldData?.feeData ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      Fee Collection Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-semibold mb-3">Payment Details</h3>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="font-medium">Standard Fee:</span> ₹{fieldData.feeData.standardFee}
                          </div>
                          <div>
                            <span className="font-medium">Amount Collected:</span> ₹{fieldData.feeData.amountCollected || "N/A"}
                          </div>
                          <div>
                            <span className="font-medium">Payment Mode:</span> {fieldData.feeData.paymentMode}
                          </div>
                          <div>
                            <span className="font-medium">Receipt:</span> {fieldData.feeData.receiptNumber}
                          </div>
                          {fieldData.feeData.paymentEvidenceUrl && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={fieldData.feeData.paymentEvidenceUrl} target="_blank" rel="noopener noreferrer">
                                View Payment Proof
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-3">Agreement Status</h3>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-muted-foreground text-xs mb-1">Agreement Signed</p>
                            <Badge variant={fieldData.feeData.agreementSigned ? "default" : "destructive"}>
                              {fieldData.feeData.agreementSigned ? "✓ Signed" : "✗ Pending"}
                            </Badge>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs mb-1">Applicant Confirmed</p>
                            <Badge variant={fieldData.feeData.applicantConfirmed ? "default" : "destructive"}>
                              {fieldData.feeData.applicantConfirmed ? "✓ Yes" : "✗ No"}
                            </Badge>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs mb-1">Terms Accepted</p>
                            <Badge variant={fieldData.feeData.termsAccepted ? "default" : "destructive"}>
                              {fieldData.feeData.termsAccepted ? "✓ Yes" : "✗ No"}
                            </Badge>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs mb-1">Staff Signature</p>
                            <p>{fieldData.feeData.staffSignature || "N/A"}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="pt-12 text-center text-muted-foreground">
                    No fee collection data available
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Admin Checklist & Decision */}
      <Card>
        <CardHeader>
          <CardTitle>Final Admin Review Checklist</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-3">Legal & Compliance</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-40 overflow-y-auto p-2 border rounded">
                {[
                  { key: 'ageVerified', label: 'Age verified (21+)' },
                  { key: 'identityGenuine', label: 'Identity genuine (no fraud)' },
                  { key: 'addressAuthentic', label: 'Address authentic' },
                  { key: 'businessLegitimate', label: 'Business legitimate & licensed' },
                  { key: 'noCriminalHistory', label: 'No criminal/fraud history' },
                  { key: 'noDuplicateRegistration', label: 'No duplicate registration' }
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center space-x-2">
                    <Checkbox 
                      checked={checklist[key as keyof typeof checklist] as boolean}
                      onCheckedChange={(checked) => setChecklist({
                        ...checklist, 
                        [key]: checked as boolean
                      })}
                    />
                    <Label className="text-sm">{label}</Label>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Document & Risk Assessment</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-40 overflow-y-auto p-2 border rounded">
                {[
                  { key: 'documentsPresent', label: 'All documents present' },
                  { key: 'documentsAuthentic', label: 'Documents authentic' },
                  { key: 'noExpiredDocuments', label: 'No expired documents' },
                  { key: 'noFraudFlags', label: 'No fraud red flags' },
                  { key: 'noUnlicensedOperations', label: 'No unlicensed operations' },
                  { key: 'noCriminalIndicators', label: 'No criminal indicators' }
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center space-x-2">
                    <Checkbox 
                      checked={checklist[key as keyof typeof checklist] as boolean}
                      onCheckedChange={(checked) => setChecklist({
                        ...checklist, 
                        [key]: checked as boolean
                      })}
                    />
                    <Label className="text-sm">{label}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div>
            <Label>Compliance Notes</Label>
            <Textarea 
              value={complianceNotes} 
              onChange={(e) => setComplianceNotes(e.target.value)}
              placeholder="Detailed compliance observations..."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Final Decision */}
      <Card>
        <CardHeader>
          <CardTitle>Final Decision</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!decision && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button onClick={() => setDecision("approve")} className="h-20" variant="default">
                <CheckCircle className="mr-2 h-5 w-5" />
                Approve & Create Account
              </Button>
              <Button onClick={() => setDecision("reject")} className="h-20" variant="destructive">
                <XCircle className="mr-2 h-5 w-5" />
                Reject Application
              </Button>
              <Button onClick={() => setDecision("hold")} className="h-20" variant="outline">
                <AlertCircle className="mr-2 h-5 w-5" />
                Put On Hold
              </Button>
            </div>
          )}

          {decision === "approve" && (
            <div className="space-y-4">
              <div className="p-6 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <h3 className="font-semibold text-lg">Approval Confirmation</h3>
                </div>
                <p className="text-sm text-green-800">
                  User account will be created. Partner receives credentials and app link automatically.
                </p>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleApprove} disabled={saving} className="flex-1">
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Confirm Approval
                </Button>
                <Button onClick={() => setDecision(null)} variant="outline">
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {decision === "reject" && (
            <div className="space-y-4">
              <div>
                <Label>Rejection Reason</Label>
                <select 
                  className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-primary"
                  value={reason} 
                  onChange={(e) => setReason(e.target.value)}
                >
                  <option value="">Select reason</option>
                  <option value="fraud_detected">Fraud detected</option>
                  <option value="duplicate_registration">Duplicate registration</option>
                  <option value="documents_failure">Document verification failure</option>
                  <option value="field_verification_failed">Field verification failed</option>
                  <option value="compliance_issue">Compliance issue</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <Label>Details</Label>
                <Textarea 
                  value={details} 
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Provide detailed rejection reason..."
                  rows={4}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleReject} disabled={saving} variant="destructive" className="flex-1">
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Confirm Rejection
                </Button>
                <Button onClick={() => setDecision(null)} variant="outline">
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {decision === "hold" && (
            <div className="space-y-4">
              <div>
                <Label>Hold Reason</Label>
                <Textarea 
                  value={details} 
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="What clarification is needed?..."
                  rows={4}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleOnHold} disabled={saving} variant="outline" className="flex-1">
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Confirm On Hold
                </Button>
                <Button onClick={() => setDecision(null)} variant="outline">
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
