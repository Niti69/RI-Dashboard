import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, Phone } from "lucide-react";

interface ApplicationResponse {
  success: boolean;
  applicationNumber: string;
  type: "Fleet Owner" | "Franchise Partner";
  application: any;
}

interface Application {
  id: string;           // applicationNumber
  type: string;         // Fleet Owner | Franchise Partner
  fullName: string;
  mobile: string;
  alternateMobile?: string;
  email: string;
  status: string;
  address?: string;
}

interface UserProfile {
  id: string;
  role: string;
}

interface TeleLog {
  applicationNumber: string;
  staffId: string;
  callStatus: string;
  durationMinutes: number | null;
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
  decision: string;
  decisionReason: string;
  detailedNotes: string;
}

// Mock auth for now – you can swap with real auth later
const mockCheckAuth = async (navigate: Function): Promise<UserProfile | null> => {
  const mockUser: UserProfile = {
    id: "kyc_staff_001",
    role: "kyc_staff",
  };

  await new Promise((res) => setTimeout(res, 300));

  if (!mockUser || !["kyc_staff", "admin"].includes(mockUser.role)) {
    toast.error("Unauthorized access");
    navigate("/");
    return null;
  }
  return mockUser;
};

const TeleVerification = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [application, setApplication] = useState<Application | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const [formData, setFormData] = useState({
    callStatus: "not_called",
    durationMinutes: "",
    nameVerified: false,
    addressVerified: false,
    ageVerified: false,
    employmentStatus: "",
    businessTypeVerified: false,
    businessAddressVerified: false,
    natureOfOperation: "",
    yearsExperience: "",
    previousLogistics: false,
    serviceExpectationsNotes: "",
    expectedVolume: "",
    applicantQuestions: "",
    infoInconsistent: false,
    suspiciousResponses: false,
    communicationBarrier: false,
    incompleteInfo: false,
    decision: "",
    decisionReason: "",
    detailedNotes: "",
  });

  useEffect(() => {
    if (!id) return;
    checkAuthAndLoad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const checkAuthAndLoad = async () => {
    setLoading(true);
    const user = await mockCheckAuth(navigate);

    if (user) {
      setUserProfile(user);
      await loadApplication(id!);
      await loadTeleLog(id!);
    }
    setLoading(false);
  };

  const loadApplication = async (id: string) => {
    try {
      const res = await fetch(`https://ri-dashboard-tl5e.onrender.com/api/application/${id}`);
      const json: ApplicationResponse = await res.json();

      if (!json.success || !json.application) {
        toast.error("Application not found");
        navigate("/tele-queue");
        return;
      }

      const app = json.application;

      const mapped: Application = {
        id: json.applicationNumber,
        type: json.type,
        fullName: app.fullName ?? "",
        mobile: app.mobile ?? "",
        alternateMobile: app.alternateMobile ?? app.altMobile ?? "",
        email: app.email ?? "",
        status: app.status ?? "",
        address: app.address ?? "",
      };

      setApplication(mapped);
      console.log("Loaded application:", mapped);
    } catch (err) {
      console.error("Error loading application:", err);
      toast.error("Failed to load application details");
      navigate("/tele-queue");
    }
  };


  const loadTeleLog = async (applicationNumber: string) => {
    try {
      const res = await fetch(`https://ri-dashboard-tl5e.onrender.com/api/tele/log/${applicationNumber}`);
      const json = await res.json();

      if (json.success && json.log) {
        const log: TeleLog = json.log;

        setFormData((prev) => ({
          ...prev,
          callStatus: log.callStatus || prev.callStatus,
          durationMinutes: log.durationMinutes?.toString() || "",
          nameVerified: !!log.nameVerified,
          addressVerified: !!log.addressVerified,
          ageVerified: !!log.ageVerified,
          employmentStatus: log.employmentStatus || "",
          businessTypeVerified: !!log.businessTypeVerified,
          businessAddressVerified: !!log.businessAddressVerified,
          natureOfOperation: log.natureOfOperation || "",
          yearsExperience: log.yearsExperience || "",
          previousLogistics: !!log.previousLogistics,
          serviceExpectationsNotes: log.serviceExpectationsNotes || "",
          expectedVolume: log.expectedVolume || "",
          applicantQuestions: log.applicantQuestions || "",
          infoInconsistent: !!log.infoInconsistent,
          suspiciousResponses: !!log.suspiciousResponses,
          communicationBarrier: !!log.communicationBarrier,
          incompleteInfo: !!log.incompleteInfo,
          decision: log.decision || "",
          decisionReason: log.decisionReason || "",
          detailedNotes: log.detailedNotes || "",
        }));
      }
    } catch (err) {
      console.log("No tele log found yet or error loading log:", err);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const target = e.target as HTMLInputElement;
    const { id, value, type, checked } = target;

    setFormData((prev) => ({
      ...prev,
      [id]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!application || !userProfile) {
      toast.error("Missing application or user data.");
      return;
    }

    if (!formData.decision) {
      toast.error("Please select a final decision (Approve/Reject/On Hold).");
      return;
    }

    if (
      (formData.decision === "reject" || formData.decision === "on_hold") &&
      !formData.decisionReason.trim()
    ) {
      toast.error("Decision reason is mandatory for rejection or on hold.");
      return;
    }

    setSaving(true);

    try {
      const res = await fetch("https://ri-dashboard-tl5e.onrender.com/api/tele/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: application.id, // ✅ FIXED: Using application.id
          staffId: userProfile.id,
          formData,
        }),
      });

      const json = await res.json();

      if (!json.success) {
        toast.error(json.message || "Failed to save verification");
      } else {
        toast.success("Tele-verification completed successfully!");
        navigate("/tele-queue");
      }
    } catch (error: any) {
      console.error("Error saving verification:", error);
      toast.error(error.message || "Failed to save verification");
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Tele-Verification</h1>
          <p className="text-muted-foreground">
            Application ID: {application.id}
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate(-1)}>
          Back to Queue
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Applicant Contact Info */}
        <Card>
          <CardHeader>
            <CardTitle>Applicant Contact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Name</p>
              <p>{application.fullName}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Primary Mobile
              </p>
              <div className="flex items-center gap-2">
                <p>{application.mobile}</p>
                <Button size="sm" variant="outline" asChild>
                  <a href={`tel:${application.mobile}`}>
                    <Phone className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
            {application.alternateMobile && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Alternate Mobile
                </p>
                <div className="flex items-center gap-2">
                  <p>{application.alternateMobile}</p>
                  <Button size="sm" variant="outline" asChild>
                    <a href={`tel:${application.alternateMobile}`}>
                      <Phone className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="text-sm">{application.email}</p>
            </div>
            {application.address && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Address
                </p>
                <p className="text-sm">{application.address}</p>
              </div>
            )}
            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground font-medium mb-2">
                CALL SCRIPT GUIDE
              </p>
              <div className="text-xs space-y-2 text-muted-foreground">
                <p>
                  <strong>Opening:</strong> "Namaste{" "}
                 {application.fullName?.split(" ")?.[0] || "there"}, I'm calling from
                  RILogistics verification team. Is this a good time to speak
                  for 5-10 minutes?"
                </p>
                <p>
                  <strong>Identity Check:</strong> Confirm name, address,
                  Aadhaar digits
                </p>
                <p>
                  <strong>Business Check:</strong> Ask about business
                  experience, vehicles, routes
                </p>
                <p>
                  <strong>Intent Check:</strong> Why joining? Expected volume?
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Verification Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Verification Checklist</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Call Status */}
              <div>
                <Label htmlFor="callStatus">Call Status</Label>
                <select
                  id="callStatus"
                  value={formData.callStatus}
                  onChange={handleSelectChange}
                  className="w-full border rounded-md p-2"
                >
                  <option value="not_called">Not Yet Called</option>
                  <option value="verified">Called - Verified</option>
                  <option value="mismatch">Called - Mismatch</option>
                  <option value="cannot_reach">
                    Cannot Reach / Wrong Number
                  </option>
                </select>
              </div>

              <div>
                <Label htmlFor="durationMinutes">Call Duration (minutes)</Label>
                <Input
                  id="durationMinutes"
                  type="number"
                  value={formData.durationMinutes}
                  onChange={handleInputChange}
                  placeholder="5"
                />
              </div>

              {/* Personal Verification */}
              <div className="space-y-3">
                <h3 className="font-semibold">Personal Verification</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="nameVerified"
                      checked={formData.nameVerified}
                      onChange={handleInputChange}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="nameVerified">
                      Confirm Full Name (matches Aadhaar/PAN)
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="addressVerified"
                      checked={formData.addressVerified}
                      onChange={handleInputChange}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="addressVerified">
                      Confirm Residential Address
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="ageVerified"
                      checked={formData.ageVerified}
                      onChange={handleInputChange}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="ageVerified">
                      Confirm Age (21+)
                    </Label>
                  </div>
                  <div>
                    <Label htmlFor="employmentStatus">
                      Employment Status
                    </Label>
                    <Input
                      id="employmentStatus"
                      value={formData.employmentStatus}
                      onChange={handleInputChange}
                      placeholder="Self-employed / Employed / Business owner"
                    />
                  </div>
                </div>
              </div>

              {/* Business Verification */}
              <div className="space-y-3">
                <h3 className="font-semibold">Business Verification</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="businessTypeVerified"
                      checked={formData.businessTypeVerified}
                      onChange={handleInputChange}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="businessTypeVerified">
                      Confirm Business Type
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="businessAddressVerified"
                      checked={formData.businessAddressVerified}
                      onChange={handleInputChange}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="businessAddressVerified">
                      Confirm Business Address
                    </Label>
                  </div>
                  <div>
                    <Label htmlFor="natureOfOperation">
                      Nature of Operation
                    </Label>
                    <Input
                      id="natureOfOperation"
                      value={formData.natureOfOperation}
                      onChange={handleInputChange}
                      placeholder="What services will they provide?"
                    />
                  </div>
                  <div>
                    <Label htmlFor="yearsExperience">
                      Years of Business Experience
                    </Label>
                    <Input
                      id="yearsExperience"
                      type="number"
                      value={formData.yearsExperience}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="previousLogistics"
                      checked={formData.previousLogistics}
                      onChange={handleInputChange}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="previousLogistics">
                      Previous Experience in Logistics
                    </Label>
                  </div>
                </div>
              </div>

              {/* Service Expectations */}
              <div className="space-y-3">
                <h3 className="font-semibold">Service Expectations</h3>
                <div>
                  <Label htmlFor="serviceExpectationsNotes">
                    How will they use RILogistics platform?
                  </Label>
                  <Textarea
                    id="serviceExpectationsNotes"
                    value={formData.serviceExpectationsNotes}
                    onChange={handleInputChange}
                    rows={2}
                  />
                </div>
                <div>
                  <Label htmlFor="expectedVolume">
                    Expected Monthly Load Volume / Bookings
                  </Label>
                  <Input
                    id="expectedVolume"
                    value={formData.expectedVolume}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="applicantQuestions">
                    Additional Questions from Applicant
                  </Label>
                  <Textarea
                    id="applicantQuestions"
                    value={formData.applicantQuestions}
                    onChange={handleInputChange}
                    rows={2}
                  />
                </div>
              </div>

              {/* Red Flags Assessment */}
              <div className="space-y-3">
                <h3 className="font-semibold text-red-600">
                  Red Flags Assessment
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="infoInconsistent"
                      checked={formData.infoInconsistent}
                      onChange={handleInputChange}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="infoInconsistent">
                      Information inconsistent with documents
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="suspiciousResponses"
                      checked={formData.suspiciousResponses}
                      onChange={handleInputChange}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="suspiciousResponses">
                      Suspicious or evasive responses
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="communicationBarrier"
                      checked={formData.communicationBarrier}
                      onChange={handleInputChange}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="communicationBarrier">
                      Language / communication barrier
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="incompleteInfo"
                      checked={formData.incompleteInfo}
                      onChange={handleInputChange}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="incompleteInfo">
                      Incomplete or uncertain information
                    </Label>
                  </div>
                </div>
              </div>

              {/* Detailed Notes */}
              <div>
                <Label htmlFor="detailedNotes">Detailed Interview Notes</Label>
                <Textarea
                  id="detailedNotes"
                  value={formData.detailedNotes}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Enter detailed notes from the conversation..."
                />
              </div>

              {/* Decision */}
              <div className="space-y-3">
                <h3 className="font-semibold">Decision</h3>

                <div className="space-y-2">
                  {/* APPROVE */}
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="decision"
                      value="approve"
                      checked={formData.decision === "approve"}
                      onChange={() => setFormData(prev => ({ ...prev, decision: "approve" }))}
                      className="h-4 w-4"
                    />
                    <Label className="font-normal">
                      Approve Tele-Verification → Proceed to Field Verification
                    </Label>
                  </div>

                  {/* REJECT */}
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="decision"
                      value="reject"
                      checked={formData.decision === "reject"}
                      onChange={() => setFormData(prev => ({ ...prev, decision: "reject" }))}
                      className="h-4 w-4"
                    />
                    <Label className="font-normal">
                      Reject Application (reason mandatory)
                    </Label>
                  </div>

                  {/* ON HOLD */}
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="decision"
                      value="on_hold"
                      checked={formData.decision === "on_hold"}
                      onChange={() => setFormData(prev => ({ ...prev, decision: "on_hold" }))}
                      className="h-4 w-4"
                    />
                    <Label className="font-normal">
                      On Hold (Request clarification from applicant)
                    </Label>
                  </div>
                </div>

                {/* Show reason if reject or on_hold */}
                {(formData.decision === "reject" || formData.decision === "on_hold") && (
                  <div>
                    <Label htmlFor="decisionReason">Reason/Details *</Label>
                    <Textarea
                      id="decisionReason"
                      value={formData.decisionReason}
                      onChange={(e) =>
                        setFormData(prev => ({ ...prev, decisionReason: e.target.value }))
                      }
                      rows={2}
                      placeholder="Provide detailed reason for the decision..."
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button type="submit" disabled={saving || !formData.decision}>
                  {saving && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Submit Decision
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/tele-queue")}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TeleVerification;
