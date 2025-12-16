import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, CheckCircle2, XCircle, AlertCircle, ArrowLeft } from "lucide-react";

/**
 * KYC Approval Component
 * 
 * This component handles the Digital KYC Approval step where KYC staff:
 * 1. Reviews document check (passed) and tele-verification (passed) summaries
 * 2. Completes final KYC verification checklist
 * 3. Checks for fraud/duplicate/blacklist matches
 * 4. Approves and forwards to Field Verification Staff
 * 
 * Key Features:
 * - Fetches applications with status "Under Review"
 * - Comprehensive verification checklist
 * - Risk assessment
 * - Approve/Reject/On Hold decisions
 * - Auto-generates KYC reference number on approval
 * 
 * API Endpoints Required:
 * - GET /api/application/:id - Fetch application details (filter by status="Under Review")
 * - GET /api/kyc/log/:id - Load existing KYC approval log
 * - POST /api/kyc/submit - Submit KYC approval decision
 */

interface ApplicationResponse {
  success: boolean;
  id: string; // applicationNumber
  type: "Fleet Owner" | "Franchise Partner";
  data: any;
}

interface Application {
  id: string;
  type: string;
  fullName: string;
  mobile: string;
  email: string;
  status: string;
  address?: string;
  state?: string;
  city?: string;
  pinCode?: string;
  businessName?: string;
  documentCheckStatus?: string;
  teleVerificationStatus?: string;
  
  // Document URLs
  applicantPhoto?: string;
  aadhaarCopy?: string;
  panCopy?: string;
  gstCertificate?: string;
  shopOwnershipDoc?: string;
  
  // Bank Details
  bankName?: string;
  bankBranch?: string;
  ifsc?: string;
  accountHolder?: string;
  accountNumber?: string;
  
  // Franchise specific
  franchiseType?: string;
  shopSize?: string;
  locationType?: string;
  facilities?: string[];
  investmentCapacity?: string;
  staffCount?: string;
  priorExperience?: string;
}

interface UserProfile {
  id: string;
  role: string;
}

interface KYCApprovalData {
  // Verification checkpoints
  identityProofMatch: boolean;
  addressProofVerified: boolean;
  businessLegitimacy: boolean;
  fleetDetailsVerified: boolean;
  bankDetailsVerified: boolean;
  blacklistCheck: boolean;
  consentDeclarations: boolean;
  
  // Assessment
  riskAssessment: string; // "low" | "medium" | "high"
  
  // Decision
  decision: string; // "approve" | "reject" | "on_hold"
  decisionReason: string;
  kycNotes: string;
}

// Mock authentication function - replace with real auth
const mockCheckAuth = async (): Promise<UserProfile | null> => {
  const mockUser: UserProfile = {
    id: "kyc_staff_002",
    role: "kyc_staff",
  };

  await new Promise((res) => setTimeout(res, 300));

  if (!mockUser || !["kyc_staff", "admin"].includes(mockUser.role)) {
    toast.error("Unauthorized access");
    return null;
  }
  return mockUser;
};

// Props interface for React Router integration
interface KYCApprovalProps {
  applicationId: string; // Pass from React Router params
  onBack: () => void; // Navigation handler
  onSuccess: () => void; // Success navigation handler
}

const KYCApprovalpage: React.FC<KYCApprovalProps> = ({ 
  applicationId, 
  onBack, 
  onSuccess 
}) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [application, setApplication] = useState<Application | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const [formData, setFormData] = useState<KYCApprovalData>({
    identityProofMatch: false,
    addressProofVerified: false,
    businessLegitimacy: false,
    fleetDetailsVerified: false,
    bankDetailsVerified: false,
    blacklistCheck: false,
    consentDeclarations: false,
    riskAssessment: "low",
    decision: "",
    decisionReason: "",
    kycNotes: "",
  });

  useEffect(() => {
    if (!applicationId) return;
    checkAuthAndLoad();
  }, [applicationId]);

  const checkAuthAndLoad = async () => {
    setLoading(true);
    const user = await mockCheckAuth();

    if (user) {
      setUserProfile(user);
      await loadApplication(applicationId);
      await loadKYCLog(applicationId);
    }
    setLoading(false);
  };

  /**
   * Load application details
   * IMPORTANT: Only fetch applications with status="Under Review"
   */
  const loadApplication = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:5001/api/application/${id}`);
      const json: ApplicationResponse = await res.json();

      if (!json.success) {
        toast.error("Application not found");
        onBack();
        return;
      }

      const data = json.data;
      console.log(data)
      // Critical check: status must be "Under Review"
      if (data.status !== "Under Review") {
        toast.error("This application is not ready for KYC approval");
        onBack();
        return;
      }

      const mapped: Application = {
        id: json.id,
        type: json.type,
        fullName: data.fullName || "",
        mobile: data.mobile || "",
        email: data.email || "",
        status: data.status || "",
        address: data.address || "",
        state: data.state || "",
        city: data.city || "",
        pinCode: data.pinCode || "",
        businessName: data.businessName || "",
        documentCheckStatus: data.documentCheckStatus || "pending",
        teleVerificationStatus: data.teleVerificationStatus || "pending",
        
        // Document URLs
        applicantPhoto: data.applicantPhoto || "",
        aadhaarCopy: data.aadhaarCopy || "",
        panCopy: data.panCopy || "",
        gstCertificate: data.gstCertificate || "",
        shopOwnershipDoc: data.shopOwnershipDoc || "",
        
        // Bank Details
        bankName: data.bankName || "",
        bankBranch: data.bankBranch || "",
        ifsc: data.ifsc || "",
        accountHolder: data.accountHolder || "",
        accountNumber: data.accountNumber || "",
        
        // Franchise specific
        franchiseType: data.franchiseType || "",
        shopSize: data.shopSize || "",
        locationType: data.locationType || "",
        facilities: data.facilities || [],
        investmentCapacity: data.investmentCapacity || "",
        staffCount: data.staffCount || "",
        priorExperience: data.priorExperience || "",
      };

      setApplication(mapped);
    } catch (err) {
      console.error("Error loading application:", err);
      toast.error("Failed to load application details");
      onBack();
    }
  };

  /**
   * Load existing KYC approval log if available
   */
  const loadKYCLog = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:5001/api/kyc/log/${id}`);
      const json = await res.json();

      if (json.success && json.log) {
        setFormData(json.log);
      }
    } catch (err) {
      console.log("No KYC log found yet:", err);
    }
  };

  const handleCheckboxChange = (field: keyof KYCApprovalData) => {
    setFormData((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  /**
   * Submit KYC approval decision
   * On approval, backend should:
   * 1. Generate KYC reference number (e.g., KYC-20251211-00123)
   * 2. Update application status to "KYC Completed - Ready for Field Verification"
   * 3. Auto-assign to Field Verification Staff queue (by district)
   * 4. Send SMS to applicant
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!application || !userProfile) {
      toast.error("Missing application or user data.");
      return;
    }

    if (!formData.decision) {
      toast.error("Please select a final decision.");
      return;
    }

    // Validation for reject/on_hold
    if (
      (formData.decision === "reject" || formData.decision === "on_hold") &&
      !formData.decisionReason.trim()
    ) {
      toast.error("Decision reason is mandatory for rejection or on hold.");
      return;
    }

    // Validation for approval - all checkboxes must be checked
    if (formData.decision === "approve") {
      const mandatoryChecks = [
        formData.identityProofMatch,
        formData.addressProofVerified,
        formData.businessLegitimacy,
        formData.bankDetailsVerified,
        formData.blacklistCheck,
        formData.consentDeclarations,
      ];

      // Add fleet check only for Fleet Owners
      if (application.type === "Fleet Owner") {
        mandatoryChecks.push(formData.fleetDetailsVerified);
      }

      if (!mandatoryChecks.every(Boolean)) {
        toast.error("All verification checkpoints must be completed before approval.");
        return;
      }
    }

    setSaving(true);

    try {
      const res = await fetch("http://localhost:5001/api/kyc/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: application.id,
          staffId: userProfile.id,
          formData,
        }),
      });

      const json = await res.json();

      if (!json.success) {
        toast.error(json.message || "Failed to save KYC approval");
      } else {
        if (formData.decision === "approve") {
          // Backend should return kycReference in response
          toast.success(
            `KYC Approved! Reference: ${json.kycReference}\n` +
            `Valid until: ${json.kycValidUntil}`
          );
        } else if (formData.decision === "reject") {
          toast.success("Application rejected. Applicant will be notified.");
        } else {
          toast.success("Application on hold. Escalated for review.");
        }
        onSuccess();
      }
    } catch (error: any) {
      console.error("Error saving KYC approval:", error);
      toast.error(error.message || "Failed to save KYC approval");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!application) return null;

  const allVerificationsPassed =
    application.documentCheckStatus === "passed" &&
    application.teleVerificationStatus === "passed";

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Digital KYC Approval</h1>
          <p className="text-muted-foreground">
            Application ID: {application.id} | Status: Ready for Final Approval
          </p>
        </div>
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Queue
        </Button>
      </div>

      {/* Verification Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>Verification Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-green-900">DOCUMENT CHECK: PASSED</p>
                <p className="text-sm text-green-700">
                  All documents verified. No missing or invalid docs.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-green-900">TELE-VERIFICATION: PASSED</p>
                <p className="text-sm text-green-700">
                  Applicant verified. All details match. No red flags.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Document Viewer Section */}
      <Card>
        <CardHeader>
          <CardTitle>Documents for Verification</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {/* Applicant Photo */}
            {application.applicantPhoto && (
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Applicant Photo</Label>
                <div className="border rounded-lg overflow-hidden bg-gray-50">
                  <img 
                    src={application.applicantPhoto} 
                    alt="Applicant" 
                    className="w-full h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => window.open(application.applicantPhoto, '_blank')}
                  />
                </div>
                <p className="text-xs text-muted-foreground">Click to view full size</p>
              </div>
            )}

            {/* Aadhaar Copy */}
            {application.aadhaarCopy && (
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Aadhaar Card</Label>
                <div className="border rounded-lg overflow-hidden bg-gray-50">
                  <img 
                    src={application.aadhaarCopy} 
                    alt="Aadhaar" 
                    className="w-full h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => window.open(application.aadhaarCopy, '_blank')}
                  />
                </div>
                <p className="text-xs text-muted-foreground">Click to view full size</p>
              </div>
            )}

            {/* PAN Copy */}
            {application.panCopy && (
              <div className="space-y-2">
                <Label className="text-sm font-semibold">PAN Card</Label>
                <div className="border rounded-lg overflow-hidden bg-gray-50">
                  <img 
                    src={application.panCopy} 
                    alt="PAN" 
                    className="w-full h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => window.open(application.panCopy, '_blank')}
                  />
                </div>
                <p className="text-xs text-muted-foreground">Click to view full size</p>
              </div>
            )}

            {/* GST Certificate */}
            {application.gstCertificate && (
              <div className="space-y-2">
                <Label className="text-sm font-semibold">GST Certificate</Label>
                <div className="border rounded-lg overflow-hidden bg-gray-50">
                  <img 
                    src={application.gstCertificate} 
                    alt="GST" 
                    className="w-full h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => window.open(application.gstCertificate, '_blank')}
                  />
                </div>
                <p className="text-xs text-muted-foreground">Click to view full size</p>
              </div>
            )}

            {/* Shop Ownership Document */}
            {application.shopOwnershipDoc && (
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Shop Ownership Document</Label>
                <div className="border rounded-lg overflow-hidden bg-gray-50">
                  <img 
                    src={application.shopOwnershipDoc} 
                    alt="Shop Ownership" 
                    className="w-full h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => window.open(application.shopOwnershipDoc, '_blank')}
                  />
                </div>
                <p className="text-xs text-muted-foreground">Click to view full size</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Sidebar - Applicant Details */}
        <Card>
          <CardHeader>
            <CardTitle>Applicant Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Application Type</p>
              <p className="font-semibold">{application.type}</p>
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
            {application.address && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Complete Address</p>
                <p className="text-sm">{application.address}</p>
              </div>
            )}
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
            <div className="pt-3 border-t">
              <p className="text-sm font-semibold text-muted-foreground mb-2">Bank Details</p>
              {application.bankName && (
                <div className="mb-2">
                  <p className="text-xs text-muted-foreground">Bank Name</p>
                  <p className="text-sm">{application.bankName}</p>
                </div>
              )}
              {application.accountHolder && (
                <div className="mb-2">
                  <p className="text-xs text-muted-foreground">Account Holder</p>
                  <p className="text-sm">{application.accountHolder}</p>
                </div>
              )}
              {application.accountNumber && (
                <div className="mb-2">
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
            </div>

            {/* Franchise Specific Details */}
            {application.type === "Franchise Partner" && (
              <div className="pt-3 border-t">
                <p className="text-sm font-semibold text-muted-foreground mb-2">Franchise Details</p>
                {application.franchiseType && (
                  <div className="mb-2">
                    <p className="text-xs text-muted-foreground">Franchise Type</p>
                    <p className="text-sm">{application.franchiseType}</p>
                  </div>
                )}
                {application.shopSize && (
                  <div className="mb-2">
                    <p className="text-xs text-muted-foreground">Shop Size</p>
                    <p className="text-sm">{application.shopSize}</p>
                  </div>
                )}
                {application.locationType && (
                  <div className="mb-2">
                    <p className="text-xs text-muted-foreground">Location Type</p>
                    <p className="text-sm">{application.locationType}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Main Content - KYC Verification Checklist */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>KYC Verification Checklist</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Identity Proof Match */}
              <div className="space-y-3 pb-4 border-b">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.identityProofMatch}
                    onChange={() => handleCheckboxChange("identityProofMatch")}
                    className="h-4 w-4"
                    id="identityProofMatch"
                  />
                  <Label htmlFor="identityProofMatch" className="font-semibold cursor-pointer">
                    Identity Proof Match
                  </Label>
                </div>
                <div className="ml-6 space-y-1 text-sm text-muted-foreground">
                  <p>✓ Aadhaar details match form</p>
                  <p>✓ PAN details match form</p>
                  <p>✓ Photo matches applicant</p>
                </div>
              </div>

              {/* Address Proof Verified */}
              <div className="space-y-3 pb-4 border-b">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.addressProofVerified}
                    onChange={() => handleCheckboxChange("addressProofVerified")}
                    className="h-4 w-4"
                    id="addressProofVerified"
                  />
                  <Label htmlFor="addressProofVerified" className="font-semibold cursor-pointer">
                    Address Proof Verified
                  </Label>
                </div>
                <div className="ml-6 space-y-1 text-sm text-muted-foreground">
                  <p>✓ Current residence confirmed</p>
                  <p>✓ Business address confirmed</p>
                </div>
              </div>

              {/* Business Legitimacy */}
              <div className="space-y-3 pb-4 border-b">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.businessLegitimacy}
                    onChange={() => handleCheckboxChange("businessLegitimacy")}
                    className="h-4 w-4"
                    id="businessLegitimacy"
                  />
                  <Label htmlFor="businessLegitimacy" className="font-semibold cursor-pointer">
                    Business Legitimacy
                  </Label>
                </div>
                <div className="ml-6 space-y-1 text-sm text-muted-foreground">
                  <p>✓ Business exists and active</p>
                  <p>✓ Legal compliance documents present</p>
                  <p>✓ GST/Trade License valid</p>
                </div>
              </div>

              {/* Fleet Details (Conditional for Fleet Owners) */}
              {application.type === "Fleet Owner" && (
                <div className="space-y-3 pb-4 border-b">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.fleetDetailsVerified}
                      onChange={() => handleCheckboxChange("fleetDetailsVerified")}
                      className="h-4 w-4"
                      id="fleetDetailsVerified"
                    />
                    <Label htmlFor="fleetDetailsVerified" className="font-semibold cursor-pointer">
                      Fleet Details
                    </Label>
                  </div>
                  <div className="ml-6 space-y-1 text-sm text-muted-foreground">
                    <p>✓ All vehicle RCs authentic</p>
                    <p>✓ Insurance valid</p>
                    <p>✓ Fitness valid/current</p>
                  </div>
                </div>
              )}

              {/* Bank Details */}
              <div className="space-y-3 pb-4 border-b">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.bankDetailsVerified}
                    onChange={() => handleCheckboxChange("bankDetailsVerified")}
                    className="h-4 w-4"
                    id="bankDetailsVerified"
                  />
                  <Label htmlFor="bankDetailsVerified" className="font-semibold cursor-pointer">
                    Bank Details
                  </Label>
                </div>
                <div className="ml-6 space-y-1 text-sm text-muted-foreground">
                  <p>✓ Account name matches applicant</p>
                  <p>✓ Account active and in good standing</p>
                </div>
              </div>

              {/* Blacklist/Fraud Check */}
              <div className="space-y-3 pb-4 border-b">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.blacklistCheck}
                    onChange={() => handleCheckboxChange("blacklistCheck")}
                    className="h-4 w-4"
                    id="blacklistCheck"
                  />
                  <Label htmlFor="blacklistCheck" className="font-semibold cursor-pointer">
                    Blacklist/Fraud Check
                  </Label>
                </div>
                <div className="ml-6 space-y-1 text-sm text-muted-foreground">
                  <p>✓ Not in RILogistics blacklist</p>
                  <p>✓ No duplicate/fraud flags</p>
                  <p>✓ No criminal history flagged</p>
                </div>
              </div>

              {/* Consent & Declarations */}
              <div className="space-y-3 pb-4 border-b">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.consentDeclarations}
                    onChange={() => handleCheckboxChange("consentDeclarations")}
                    className="h-4 w-4"
                    id="consentDeclarations"
                  />
                  <Label htmlFor="consentDeclarations" className="font-semibold cursor-pointer">
                    Consent & Declarations
                  </Label>
                </div>
                <div className="ml-6 space-y-1 text-sm text-muted-foreground">
                  <p>✓ KYC consent form signed</p>
                  <p>✓ Terms & conditions accepted</p>
                </div>
              </div>

              {/* Risk Assessment Badge */}
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <p className="font-semibold text-green-900">RISK ASSESSMENT: LOW RISK ✓</p>
                </div>
              </div>

              {/* Additional Notes */}
              <div>
                <Label htmlFor="kycNotes">Additional KYC Notes</Label>
                <Textarea
                  id="kycNotes"
                  value={formData.kycNotes}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, kycNotes: e.target.value }))
                  }
                  rows={3}
                  placeholder="Enter any additional observations, clarifications, or notes..."
                  className="mt-2"
                />
              </div>

              {/* Final Decision Section */}
              <div className="space-y-4 pt-6 border-t-2">
                <h3 className="font-semibold text-lg">FINAL DECISION</h3>

                <div className="space-y-3">
                  {/* Approve Option */}
                  <div className="flex items-start gap-3 p-4 border-2 rounded-lg hover:bg-green-50 transition-colors cursor-pointer">
                    <input
                      type="radio"
                      name="decision"
                      value="approve"
                      checked={formData.decision === "approve"}
                      onChange={() =>
                        setFormData((prev) => ({ ...prev, decision: "approve" }))
                      }
                      className="h-4 w-4 mt-1"
                      id="decision-approve"
                    />
                    <div className="flex-1">
                      <Label htmlFor="decision-approve" className="font-semibold text-green-700 cursor-pointer">
                        ✓ APPROVE KYC
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Click to approve and generate KYC reference number. Case will auto-forward 
                        to Field Verification Staff queue. Applicant will be notified: "Your KYC 
                        has been approved. Field verification scheduled within 24-48 hours."
                      </p>
                      <p className="text-xs text-muted-foreground mt-2 italic">
                        KYC Reference: KYC-YYYYMMDD-XXXXX (auto-generated)<br/>
                        KYC Valid Until: One year from approval date
                      </p>
                    </div>
                  </div>

                  {/* Reject Option */}
                  <div className="flex items-start gap-3 p-4 border-2 rounded-lg hover:bg-red-50 transition-colors cursor-pointer">
                    <input
                      type="radio"
                      name="decision"
                      value="reject"
                      checked={formData.decision === "reject"}
                      onChange={() =>
                        setFormData((prev) => ({ ...prev, decision: "reject" }))
                      }
                      className="h-4 w-4 mt-1"
                      id="decision-reject"
                    />
                    <div className="flex-1">
                      <Label htmlFor="decision-reject" className="font-semibold text-red-700 cursor-pointer">
                        ✗ REJECT KYC
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Reason mandatory: Fraud detected / Duplicate account / Blacklist match / 
                        Invalid documents / Other. Applicant will be notified with reapply/correction options.
                      </p>
                    </div>
                  </div>

                  {/* On Hold Option */}
                  <div className="flex items-start gap-3 p-4 border-2 rounded-lg hover:bg-yellow-50 transition-colors cursor-pointer">
                    <input
                      type="radio"
                      name="decision"
                      value="on_hold"
                      checked={formData.decision === "on_hold"}
                      onChange={() =>
                        setFormData((prev) => ({ ...prev, decision: "on_hold" }))
                      }
                      className="h-4 w-4 mt-1"
                      id="decision-onhold"
                    />
                    <div className="flex-1">
                      <Label htmlFor="decision-onhold" className="font-semibold text-yellow-700 cursor-pointer">
                        ⏸ ON HOLD
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Request clarification from applicant or escalate to admin review. 
                        Provide detailed reason for hold status.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Reason/Details Textarea (shown for reject or on_hold) */}
                {(formData.decision === "reject" || formData.decision === "on_hold") && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                    <Label htmlFor="decisionReason" className="text-base font-semibold">
                      Reason/Details * <span className="text-red-600">(Mandatory)</span>
                    </Label>
                    <Textarea
                      id="decisionReason"
                      value={formData.decisionReason}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          decisionReason: e.target.value,
                        }))
                      }
                      rows={4}
                      placeholder={
                        formData.decision === "reject"
                          ? "Example: Aadhaar number does not match PAN. Suspicious activity detected in blacklist check..."
                          : "Example: Need additional clarification on business address. Document quality is poor..."
                      }
                      className="mt-2"
                    />
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-6">
                <Button 
                  onClick={handleSubmit}
                  disabled={saving || !formData.decision} 
                  size="lg"
                  className="bg-green-600 hover:bg-green-700"
                >
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {formData.decision === "approve" && "Approve & Generate KYC Reference"}
                  {formData.decision === "reject" && "Reject Application"}
                  {formData.decision === "on_hold" && "Place On Hold"}
                  {!formData.decision && "Save & Submit Decision"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onBack}
                  size="lg"
                  disabled={saving}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default KYCApprovalpage;