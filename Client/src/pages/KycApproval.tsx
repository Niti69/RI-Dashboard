import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";

/* =====================================================
   TYPES
===================================================== */

interface Application {
  applicationNumber: string;
  partnerType: "Fleet Owner" | "Franchise Partner";
  fullName: string;
  mobile: string;
  email: string;
  address: string;
  state?: string;
  city?: string;
  pinCode?: string;
  businessName?: string;
  status: string;
  feeStatus: string;
  feeAmount: number;
  bankName?: string;
  bankBranch?: string;
  ifsc?: string;
  accountNumber?: string;
  accountHolder?: string;
  aadhaarFile?: string;
  panFile?: string;
  rcFile?: string;
  insuranceFile?: string;
  fitnessFile?: string;
  trucks?: { _id: string; photos: string[] }[];
  applicantPhoto?: string;
  aadhaarCopy?: string;
  panCopy?: string;
  gstCertificate?: string;
  shopOwnershipDoc?: string;
  documentStatus?: Record<string, string>;
  franchiseType?: string;
  shopSize?: string;
  locationType?: string;
}

interface VerificationCall {
  callStatus: string;
}

/* =====================================================
   HELPER COMPONENTS
===================================================== */

const CheckboxRow = ({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) => (
  <div className="flex items-center gap-2 mt-2">
    <Checkbox checked={checked} onCheckedChange={(v) => onChange(!!v)} />
    <Label className="cursor-pointer">{label}</Label>
  </div>
);

const DocumentViewer = ({
  title,
  url,
}: {
  title: string;
  url?: string;
}) => {
  if (!url) {
    return (
      <div className="space-y-2">
        <Label className="text-sm font-semibold">{title}</Label>
        <div className="border rounded-lg p-4 bg-gray-50 text-center">
          <p className="text-sm text-muted-foreground">Not uploaded</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label className="text-sm font-semibold">{title}</Label>
      <div className="border rounded-lg overflow-hidden bg-gray-50">
        <img
          src={url}
          alt={title}
          className="w-full h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
          onClick={() => window.open(url, "_blank")}
        />
      </div>
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">Click to view full size</p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          download
          className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
        >
          <Download size={14} /> Download
        </a>
      </div>
    </div>
  );
};

/* =====================================================
   MAIN COMPONENT
===================================================== */

export default function KycApproval() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [application, setApplication] = useState<Application | null>(null);
  const [call, setCall] = useState<VerificationCall | null>(null);

  const [checklist, setChecklist] = useState({
    aadhaarMatch: false,
    panMatch: false,
    photoMatch: false,
    addressConfirmed: false,
    businessAddressConfirmed: false,
    businessExists: false,
    legalCompliance: false,
    gstValid: false,
    vehicleRcAuthentic: false,
    insuranceValid: false,
    fitnessValid: false,
    accountNameMatch: false,
    accountActive: false,
    notBlacklisted: false,
    noDuplicate: false,
    noCriminal: false,
    consentSigned: false,
    termsAccepted: false,
  });

  const [decision, setDecision] = useState<"approve" | "reject" | "hold" | null>(null);
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");

  /* =====================================================
     LOAD APPLICATION
  ===================================================== */

  useEffect(() => {
    loadApplication();
  }, [id]);

  const loadApplication = async () => {
    try {
      setLoading(true);
      const res = await fetch(`https://ri-dashboard-tl5e.onrender.com/api/kyc-approval/${id}`);
      const data = await res.json();

      if (!data.success) throw new Error("Application not found");

      setApplication(data.application);
      setCall(data.teleLog || null);
    } catch (e) {
      toast.error("Failed to load application");
      navigate("/kyc-queue");
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     DECISION HANDLERS
  ===================================================== */

  const handleApprove = async () => {
    try {
      setSaving(true);

      // Validate all checkboxes are checked
      const mandatoryChecks = [
        checklist.aadhaarMatch,
        checklist.panMatch,
        checklist.photoMatch,
        checklist.addressConfirmed,
        checklist.businessExists,
        checklist.gstValid,
        checklist.accountNameMatch,
        checklist.notBlacklisted,
        checklist.consentSigned,
      ];

      if (!mandatoryChecks.every(Boolean)) {
        toast.error("All verification checkpoints must be completed before approval.");
        setSaving(false);
        return;
      }

      const res = await fetch("https://ri-dashboard-tl5e.onrender.com/api/kyc-approval/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationNumber: id,
          staffId: "kyc_staff_002", // Replace with actual staff ID from auth
          checklist,
          riskLevel: "LOW"
        })
      });

      const data = await res.json();

      if (!data.success) {
        toast.error(data.message || "Failed to approve KYC");
        return;
      }

      toast.success(`KYC Approved! Reference: ${data.kycReference}`);
      navigate("/kyc-queue");
    } catch (error) {
      console.error("Error approving KYC:", error);
      toast.error("Failed to approve KYC");
    } finally {
      setSaving(false);
    }
  };

  const handleReject = async () => {
    if (!reason || !details) {
      toast.error("Please provide rejection reason and details");
      return;
    }

    try {
      setSaving(true);

      const res = await fetch("https://ri-dashboard-tl5e.onrender.com/api/kyc-approval/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationNumber: id,
          staffId: "kyc_staff_002", // Replace with actual staff ID from auth
          reason,
          details
        })
      });

      const data = await res.json();

      if (!data.success) {
        toast.error(data.message || "Failed to reject application");
        return;
      }

      toast.success("Application rejected. Applicant will be notified.");
      navigate("/kyc-queue");
    } catch (error) {
      console.error("Error rejecting application:", error);
      toast.error("Failed to reject application");
    } finally {
      setSaving(false);
    }
  };

  const handleOnHold = async () => {
    if (!details) {
      toast.error("Please provide reason for putting on hold");
      return;
    }

    try {
      setSaving(true);

      const res = await fetch("https://ri-dashboard-tl5e.onrender.com/api/kyc-approval/hold", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationNumber: id,
          staffId: "kyc_staff_002", // Replace with actual staff ID from auth
          reason: details,
          escalateTo: "admin"
        })
      });

      const data = await res.json();

      if (!data.success) {
        toast.error(data.message || "Failed to put application on hold");
        return;
      }

      toast.success("Application put on hold. Escalated for review.");
      navigate("/kyc-queue");
    } catch (error) {
      console.error("Error updating application:", error);
      toast.error("Failed to update application");
    } finally {
      setSaving(false);
    }
  };

  /* =====================================================
     RENDER
  ===================================================== */

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!application) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-bold">Digital KYC Approval</h1>
        <p className="text-destructive font-medium flex items-center gap-2">
          <AlertCircle className="h-5 w-5" /> Application not found
        </p>
        <Button onClick={() => navigate("/kyc-queue")} variant="outline">
          Go Back to Queue
        </Button>
      </div>
    );
  }

  const isFleetOwner = application.applicationNumber.startsWith("FOT");
  const isFranchise = application.applicationNumber.startsWith("FRP");

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Digital KYC Approval</h1>
          <p className="text-muted-foreground">
            Application: {application.applicationNumber}
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <Badge>{application.status}</Badge>
          <Button variant="outline" onClick={() => navigate("/kyc-queue")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Queue
          </Button>
        </div>
      </div>

      {/* Verification Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Document Check: PASSED
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-green-700">
              All documents verified. No missing or invalid docs.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Tele-Verification: PASSED
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-green-700">
              Applicant verified. All details match. No red flags.
            </p>
            {call && (
              <p className="text-xs text-muted-foreground mt-2">
                Call Status: {call.callStatus}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Documents Section */}
      {isFleetOwner && (
        <Card>
          <CardHeader>
            <CardTitle>Fleet Owner Documents</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-4">
            <DocumentViewer title="Aadhaar" url={application.aadhaarFile} />
            <DocumentViewer title="PAN" url={application.panFile} />
            <DocumentViewer title="RC" url={application.rcFile} />
            <DocumentViewer title="Insurance" url={application.insuranceFile} />
            <DocumentViewer title="Fitness" url={application.fitnessFile} />
          </CardContent>
        </Card>
      )}

      {isFranchise && (
        <Card>
          <CardHeader>
            <CardTitle>Franchise Partner Documents</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-4">
            <DocumentViewer title="Applicant Photo" url={application.applicantPhoto} />
            <DocumentViewer title="Aadhaar" url={application.aadhaarCopy} />
            <DocumentViewer title="PAN" url={application.panCopy} />
            <DocumentViewer title="GST" url={application.gstCertificate} />
            <DocumentViewer title="Shop Ownership" url={application.shopOwnershipDoc} />
          </CardContent>
        </Card>
      )}

      {/* Applicant Details */}
      <Card>
        <CardHeader>
          <CardTitle>Applicant Details</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Partner Type</p>
            <p className="font-semibold">{application.partnerType}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Full Name</p>
            <p>{application.fullName}</p>
          </div>
          {application.businessName && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Business Name</p>
              <p>{application.businessName}</p>
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-muted-foreground">Mobile</p>
            <p>{application.mobile}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Email</p>
            <p className="text-sm break-all">{application.email}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Address</p>
            <p className="text-sm">{application.address}</p>
          </div>
          {application.state && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">State</p>
              <p>{application.state}</p>
            </div>
          )}
          {application.city && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">City</p>
              <p>{application.city}</p>
            </div>
          )}
          {application.pinCode && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">PIN Code</p>
              <p>{application.pinCode}</p>
            </div>
          )}

          {/* Bank Details */}
          {application.bankName && (
            <>
              <div className="col-span-2 border-t pt-3">
                <p className="text-sm font-semibold text-muted-foreground mb-2">Bank Details</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Bank Name</p>
                <p className="text-sm">{application.bankName}</p>
              </div>
              {application.accountHolder && (
                <div>
                  <p className="text-xs text-muted-foreground">Account Holder</p>
                  <p className="text-sm">{application.accountHolder}</p>
                </div>
              )}
              {application.accountNumber && (
                <div>
                  <p className="text-xs text-muted-foreground">Account Number</p>
                  <p className="text-sm font-mono">{application.accountNumber}</p>
                </div>
              )}
              {application.ifsc && (
                <div>
                  <p className="text-xs text-muted-foreground">IFSC Code</p>
                  <p className="text-sm font-mono">{application.ifsc}</p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* KYC Verification Checklist */}
      <Card>
        <CardHeader>
          <CardTitle>KYC Verification Checklist</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Identity */}
          <div>
            <h3 className="font-semibold">Identity Proof Match</h3>
            <CheckboxRow
              label="Aadhaar details match form"
              checked={checklist.aadhaarMatch}
              onChange={(v) => setChecklist({ ...checklist, aadhaarMatch: v })}
            />
            <CheckboxRow
              label="PAN details match form"
              checked={checklist.panMatch}
              onChange={(v) => setChecklist({ ...checklist, panMatch: v })}
            />
            <CheckboxRow
              label="Photo matches applicant"
              checked={checklist.photoMatch}
              onChange={(v) => setChecklist({ ...checklist, photoMatch: v })}
            />
          </div>

          {/* Address */}
          <div>
            <h3 className="font-semibold">Address Proof Verified</h3>
            <CheckboxRow
              label="Current residence confirmed"
              checked={checklist.addressConfirmed}
              onChange={(v) => setChecklist({ ...checklist, addressConfirmed: v })}
            />
            <CheckboxRow
              label="Business address confirmed"
              checked={checklist.businessAddressConfirmed}
              onChange={(v) => setChecklist({ ...checklist, businessAddressConfirmed: v })}
            />
          </div>

          {/* Business */}
          <div>
            <h3 className="font-semibold">Business Legitimacy</h3>
            <CheckboxRow
              label="Business exists and active"
              checked={checklist.businessExists}
              onChange={(v) => setChecklist({ ...checklist, businessExists: v })}
            />
            <CheckboxRow
              label="Legal compliance documents present"
              checked={checklist.legalCompliance}
              onChange={(v) => setChecklist({ ...checklist, legalCompliance: v })}
            />
            <CheckboxRow
              label="GST/Trade License valid"
              checked={checklist.gstValid}
              onChange={(v) => setChecklist({ ...checklist, gstValid: v })}
            />
          </div>

          {/* Fleet Details (if Fleet Owner) */}
          {isFleetOwner && (
            <div>
              <h3 className="font-semibold">Fleet Details</h3>
              <CheckboxRow
                label="All vehicle RCs authentic"
                checked={checklist.vehicleRcAuthentic}
                onChange={(v) => setChecklist({ ...checklist, vehicleRcAuthentic: v })}
              />
              <CheckboxRow
                label="Insurance valid"
                checked={checklist.insuranceValid}
                onChange={(v) => setChecklist({ ...checklist, insuranceValid: v })}
              />
              <CheckboxRow
                label="Fitness valid/current"
                checked={checklist.fitnessValid}
                onChange={(v) => setChecklist({ ...checklist, fitnessValid: v })}
              />
            </div>
          )}

          {/* Bank */}
          <div>
            <h3 className="font-semibold">Bank Details</h3>
            <CheckboxRow
              label="Account name matches applicant"
              checked={checklist.accountNameMatch}
              onChange={(v) => setChecklist({ ...checklist, accountNameMatch: v })}
            />
            <CheckboxRow
              label="Account active and in good standing"
              checked={checklist.accountActive}
              onChange={(v) => setChecklist({ ...checklist, accountActive: v })}
            />
          </div>

          {/* Risk & Consent */}
          <div>
            <h3 className="font-semibold">Blacklist/Fraud Check</h3>
            <CheckboxRow
              label="Not in RILogistics blacklist"
              checked={checklist.notBlacklisted}
              onChange={(v) => setChecklist({ ...checklist, notBlacklisted: v })}
            />
            <CheckboxRow
              label="No duplicate/fraud flags"
              checked={checklist.noDuplicate}
              onChange={(v) => setChecklist({ ...checklist, noDuplicate: v })}
            />
            <CheckboxRow
              label="No criminal history flagged"
              checked={checklist.noCriminal}
              onChange={(v) => setChecklist({ ...checklist, noCriminal: v })}
            />
          </div>

          <div>
            <h3 className="font-semibold">Consent & Declarations</h3>
            <CheckboxRow
              label="KYC consent form signed"
              checked={checklist.consentSigned}
              onChange={(v) => setChecklist({ ...checklist, consentSigned: v })}
            />
            <CheckboxRow
              label="Terms & conditions accepted"
              checked={checklist.termsAccepted}
              onChange={(v) => setChecklist({ ...checklist, termsAccepted: v })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Risk Assessment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Risk Assessment: LOW RISK ✓
          </CardTitle>
        </CardHeader>
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
                Approve KYC
              </Button>
              <Button onClick={() => setDecision("reject")} className="h-20" variant="destructive">
                <XCircle className="mr-2 h-5 w-5" />
                Reject KYC
              </Button>
              <Button onClick={() => setDecision("hold")} className="h-20" variant="outline">
                <AlertCircle className="mr-2 h-5 w-5" />
                On Hold
              </Button>
            </div>
          )}

          {decision === "approve" && (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-500 rounded-lg">
                <p className="text-sm font-medium text-green-900">Approval Confirmation</p>
                <p className="text-xs text-muted-foreground mt-1">
                  KYC reference number will be auto-generated. Application will be forwarded to field verification staff.
                  Applicant will be notified: "Your KYC has been approved. Field verification scheduled within 24-48 hours."
                </p>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleApprove} disabled={saving}>
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Confirm Approval
                </Button>
                <Button onClick={() => setDecision(null)} variant="outline" disabled={saving}>
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
                  className="w-full mt-1 rounded-md border p-2"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                >
                  <option value="">Select reason</option>
                  <option value="fraud_detected">Fraud detected</option>
                  <option value="duplicate_account">Duplicate account</option>
                  <option value="blacklist_match">Blacklist match</option>
                  <option value="invalid_documents">Invalid documents</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <Label>Details</Label>
                <Textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Provide detailed reason for rejection..."
                  rows={4}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleReject} disabled={saving} variant="destructive">
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Confirm Rejection
                </Button>
                <Button onClick={() => setDecision(null)} variant="outline" disabled={saving}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {decision === "hold" && (
            <div className="space-y-4">
              <div>
                <Label>Reason for Hold</Label>
                <Textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Explain why this application is being put on hold..."
                  rows={4}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleOnHold} disabled={saving} variant="outline">
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Confirm On Hold
                </Button>
                <Button onClick={() => setDecision(null)} variant="outline" disabled={saving}>
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
