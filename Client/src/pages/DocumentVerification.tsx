import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  FileText,
} from "lucide-react";

/* ======================================================
   CONSTANTS
====================================================== */

const API_BASE ='https://ri-dashboard-tl5e.onrender.com'

/* ======================================================
   TYPES
====================================================== */

type DocumentStatus =
  | "not_uploaded"
  | "uploaded"
  | "verified"
  | "requires_action"
  | "rejected";

interface BackendDocument {
  url: string | null;
  status: DocumentStatus;
  reason?: string;
}

interface Truck {
  photos?: string[];
}

interface ApplicationData {
  fullName: string;
  mobile: string;
  email: string;
  documents: Record<string, BackendDocument>;
  trucks?: Truck[];
}

interface ApplicationDetails {
  id: string;
  type: "Fleet Owner" | "Franchise Partner";
  data: ApplicationData;
}

interface DocumentItem {
  id: string;
  name: string;
  url: string | null;
  status: DocumentStatus;
  reason?: string;
  isTruck?: boolean;
}

/* ======================================================
   HELPERS
====================================================== */

const NAME_MAP: Record<string, string> = {
  aadhaarFile: "Aadhaar Card",
  panFile: "PAN Card",
  rcFile: "RC Book",
  insuranceFile: "Insurance Certificate",
  fitnessFile: "Fitness Certificate",
  applicantPhoto: "Applicant Photo",
  aadhaarCopy: "Aadhaar Copy",
  panCopy: "PAN Copy",
  gstCertificate: "GST Certificate",
  shopOwnershipDoc: "Shop Ownership Document",
};

const formatDocumentName = (key: string) =>
  NAME_MAP[key] || key.replace(/_/g, " ");

const renderStatus = (status: DocumentStatus) => {
  switch (status) {
    case "verified":
      return (
        <Badge className="bg-green-50 text-green-700 border-green-200">
          <CheckCircle className="h-3 w-3 mr-1" /> Verified
        </Badge>
      );
    case "requires_action":
      return (
        <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200">
          <AlertCircle className="h-3 w-3 mr-1" /> Needs Action
        </Badge>
      );
    case "rejected":
      return (
        <Badge className="bg-red-50 text-red-700 border-red-200">
          <XCircle className="h-3 w-3 mr-1" /> Rejected
        </Badge>
      );
    case "uploaded":
      return (
        <Badge className="bg-blue-50 text-blue-700 border-blue-200">
          <FileText className="h-3 w-3 mr-1" /> Uploaded
        </Badge>
      );
    default:
      return <Badge className="bg-gray-100 text-gray-600">Not Uploaded</Badge>;
  }
};

/* ======================================================
   COMPONENT
====================================================== */

const DocumentVerification = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [application, setApplication] = useState<ApplicationDetails | null>(
    null
  );
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedDocs, setSelectedDocs] = useState<Set<string>>(new Set());
  const [actionReason, setActionReason] = useState("");

  /* ======================================================
     EXTRACT DOCUMENTS
  ====================================================== */

  const extractDocuments = (app: ApplicationDetails): DocumentItem[] => {
    const result: DocumentItem[] = [];
    const docs = app.data.documents || {};

    Object.keys(docs).forEach((key) => {
      const doc = docs[key];
      result.push({
        id: key,
        name: formatDocumentName(key),
        url: doc.url,
        status: doc.status || "uploaded",
        reason: doc.reason || "",
      });
    });

    if (app.type === "Fleet Owner" && app.data.trucks?.length) {
      app.data.trucks.forEach((truck, idx) => {
        result.push({
          id: `truck_${idx}`,
          name: `Vehicle Photo ${idx + 1}`,
          url: truck.photos?.[0] || null,
          status: truck.photos?.length ? "uploaded" : "not_uploaded",
          isTruck: true,
        });
      });
    }

    return result;
  };

  /* ======================================================
     LOAD APPLICATION
  ====================================================== */

  const loadApplication = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/kyc/application/${id}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json = await res.json();
      if (!json.success) {
        toast.error("Application not found");
        navigate("/kyc-queue");
        return;
      }

      const normalized: ApplicationDetails = {
        id: json.applicationNumber,
        type: json.type,
        data: {
          ...json.application,
          documents: json.documents,
        },
      };

      setApplication(normalized);
      setDocuments(extractDocuments(normalized));
    } catch (err) {
      console.error(err);
      toast.error("Failed to load application");
      navigate("/kyc-queue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadApplication();
  }, [id]);

  /* ======================================================
     UPDATE DOCUMENT STATUS
  ====================================================== */

  const updateDocumentStatus = async (
    docId: string,
    status: DocumentStatus
  ) => {
    if (docId.startsWith("truck_")) {
      return toast.error("Truck photos cannot be verified here.");
    }

    if (
      (status === "rejected" || status === "requires_action") &&
      !actionReason.trim()
    ) {
      return toast.error("Reason is required.");
    }

    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/kyc/document/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: id,
          documentId: docId,
          status,
          reason: actionReason,
        }),
      });

      if (!res.ok) throw new Error("Update failed");

      const result = await res.json();
      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success("Document updated");
      setActionReason("");
      setSelectedDocs(new Set());
      loadApplication();
    } catch (err) {
      toast.error("Update failed");
    } finally {
      setSaving(false);
    }
  };

  /* ======================================================
     REQUEST DOCUMENTS
  ====================================================== */

  const requestDocuments = async () => {
    if (!actionReason.trim())
      return toast.error("Reason is required");
    if (selectedDocs.size === 0)
      return toast.error("Select at least one document");

    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/kyc/document/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: id,
          documents: Array.from(selectedDocs),
          reason: actionReason,
        }),
      });

      if (!res.ok) throw new Error("Request failed");

      const result = await res.json();
      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success("Document request sent");
      navigate("/kyc-queue");
    } catch {
      toast.error("Request failed");
    } finally {
      setSaving(false);
    }
  };

  /* ======================================================
     COMPLETE STEP
  ====================================================== */

  const completeStep = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/kyc/step1/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId: id }),
      });

      if (!res.ok) throw new Error("Step failed");

      const result = await res.json();
      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success("Moved to Tele Verification");
      navigate("/kyc-queue");
    } catch {
      toast.error("Step completion failed");
    } finally {
      setSaving(false);
    }
  };

  /* ======================================================
     UI STATES
  ====================================================== */

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="animate-spin h-8 w-8" />
      </div>
    );
  }

  if (!application) {
    return <p className="text-center py-10">Application not found</p>;
  }

  /* ======================================================
     RENDER
  ====================================================== */

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Document Verification</h1>
        <Button variant="outline" onClick={() => navigate("/kyc-queue")}>
          Back
        </Button>
      </div>

      {/* Applicant Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Applicant Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p>{application.data.fullName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Mobile</p>
              <p>{application.data.mobile}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p>{application.data.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Type</p>
              <p>{application.type}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents */}
      <Card>
        <CardHeader>
          <CardTitle>Document Checklist ({documents.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between border p-4 rounded-lg"
            >
              <div className="flex items-center gap-4 flex-1">
                {!doc.isTruck && (
                  <input
                    type="checkbox"
                    checked={selectedDocs.has(doc.id)}
                    disabled={saving}
                    onChange={(e) => {
                      const s = new Set(selectedDocs);
                      e.target.checked ? s.add(doc.id) : s.delete(doc.id);
                      setSelectedDocs(s);
                    }}
                  />
                )}

                <div>
                  <p className="font-medium">{doc.name}</p>
                  {doc.reason && (
                    <p className="text-xs text-red-500">
                      Reason: {doc.reason}
                    </p>
                  )}
                </div>

                {renderStatus(doc.status)}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!doc.url}
                  onClick={() => doc.url && window.open(doc.url, "_blank")}
                >
                  <Eye className="h-4 w-4" />
                </Button>

                {!doc.isTruck && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={saving}
                      className="text-green-600"
                      onClick={() =>
                        updateDocumentStatus(doc.id, "verified")
                      }
                    >
                      ✓
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={saving}
                      className="text-yellow-600"
                      onClick={() =>
                        updateDocumentStatus(doc.id, "requires_action")
                      }
                    >
                      !
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={saving}
                      className="text-red-600"
                      onClick={() =>
                        updateDocumentStatus(doc.id, "rejected")
                      }
                    >
                      ✕
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Label>Reason / Comments</Label>
          <Textarea
            rows={4}
            value={actionReason}
            onChange={(e) => setActionReason(e.target.value)}
          />

          <div className="flex gap-4">
            <Button
              variant="outline"
              disabled={saving || selectedDocs.size === 0}
              onClick={requestDocuments}
            >
              Request Documents ({selectedDocs.size})
            </Button>
            <Button disabled={saving} onClick={completeStep}>
              Complete Step 1
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentVerification;
