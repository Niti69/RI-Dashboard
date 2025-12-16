import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, MapPin, Camera, ExternalLink, X, CheckCircle2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

// ============= INTERFACES =============
interface Application {
    applicationNumber: string;
    id: string;
    _id: string;
    email:string;
    reference_id: string;
    fullName: string;
    business_address: string;
    address: string;
    mobile: string;
    franchise_type: string;
    applicationType: "FleetOwner" | "FranchisePartner";
}

interface Vehicle {
    registrationNumber: string;
    vehicleType: string;
    colorMake: string;
    photoFront: File | null;
    photoSide: File | null;
    photoRear: File | null;
    photoPlate: File | null;
    photoFrontPreview?: string;
    photoSidePreview?: string;
    photoRearPreview?: string;
    photoPlatePreview?: string;
    rcMatch: boolean | null;
    insuranceVerified: boolean | null;
    verificationStatus: string;
}

interface FormDataState {
    scheduledDate: string;
    scheduledTime: string;
    gpsLatitude: string;
    gpsLongitude: string;
    gpsAccuracy: string;
    addressExists: boolean | null;
    businessSignVisible: boolean | null;
    applicantPresent: boolean | null;
    personMetName: string;
    staffCount: number | "";
    businessOperatingStatus: string;
    operatingHours: string;
    counterDisplayArea: boolean | null;
    seatingForCustomers: boolean | null;
    itSetupComputer: boolean | null;
    itSetupInternet: boolean | null;
    signagePresent: boolean | null;
    warehouseSize: string;
    storageCapacity: string;
    parkingArea: boolean | null;
    safetyEquipment: boolean | null;
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
    photoExterior: File | null;
    photoInterior: File | null;
    photoWarehouse: File | null;
    photoVehicle1: File | null;
    photoVehicle2: File | null;
    photoLicense: File | null;
    photoExteriorPreview?: string;
    photoInteriorPreview?: string;
    photoWarehousePreview?: string;
    photoVehicle1Preview?: string;
    photoVehicle2Preview?: string;
    photoLicensePreview?: string;
}

interface FeeData {
    standardFee: number;
    amountCollected: string;
    paymentMode: string;
    paymentReference: string;
    receiptNumber: string;
    paymentEvidence: File | null;
    paymentEvidencePreview?: string;
    agreementSigned: boolean;
    applicantConfirmed: boolean;
    termsAccepted: boolean;
    staffSignature: string;
}

// ============= COMPONENT =============
export default function FieldVerificationForm(): JSX.Element {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [loading, setLoading] = useState<boolean>(true);
    const [saving, setSaving] = useState<boolean>(false);
    const [application, setApplication] = useState<Application | null>(null);
    const [activeTab, setActiveTab] = useState<string>("visit");

    const [formData, setFormData] = useState<FormDataState>({
        scheduledDate: "",
        scheduledTime: "",
        gpsLatitude: "",
        gpsLongitude: "",
        gpsAccuracy: "",
        addressExists: null,
        businessSignVisible: null,
        applicantPresent: null,
        personMetName: "",
        staffCount: "",
        businessOperatingStatus: "",
        operatingHours: "",
        counterDisplayArea: null,
        seatingForCustomers: null,
        itSetupComputer: null,
        itSetupInternet: null,
        signagePresent: null,
        warehouseSize: "",
        storageCapacity: "",
        parkingArea: null,
        safetyEquipment: null,
        cleanlinessRating: "",
        interviewSummary: "",
        applicantDemeanor: "",
        businessClarity: "",
        addressAuthenticity: "",
        businessLegitimacy: "",
        applicantCredibility: "",
        neighborhoodSafety: "",
        unlicensedOperation: false,
        cashHeavyOperations: false,
        illegalActivitySigns: false,
        redFlags: [],
        redFlagDetails: "",
        verificationResult: "",
        resultNotes: "",
        photoExterior: null,
        photoInterior: null,
        photoWarehouse: null,
        photoVehicle1: null,
        photoVehicle2: null,
        photoLicense: null,
    });

    const [vehicles, setVehicles] = useState<Vehicle[]>([{
        registrationNumber: "",
        vehicleType: "",
        colorMake: "",
        photoFront: null,
        photoSide: null,
        photoRear: null,
        photoPlate: null,
        rcMatch: null,
        insuranceVerified: null,
        verificationStatus: "",
    }]);

    const [feeData, setFeeData] = useState<FeeData>({
        standardFee: 5000,
        amountCollected: "",
        paymentMode: "",
        paymentReference: "",
        receiptNumber: "",
        paymentEvidence: null,
        agreementSigned: false,
        applicantConfirmed: false,
        termsAccepted: false,
        staffSignature: "",
    });

    useEffect(() => {
        loadApplication();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    useEffect(() => {
        return () => {
            const previewKeys = [
                "photoExteriorPreview","photoInteriorPreview","photoWarehousePreview",
                "photoVehicle1Preview","photoVehicle2Preview","photoLicensePreview"
            ] as (keyof FormDataState)[];
            previewKeys.forEach(pk => {
                const url = formData[pk] as unknown as string | undefined;
                if (url) URL.revokeObjectURL(url);
            });
            vehicles.forEach(v => {
                (["photoFrontPreview","photoSidePreview","photoRearPreview","photoPlatePreview"] as (keyof Vehicle)[]).forEach(p => {
                    const u = v[p] as unknown as string | undefined;
                    if (u) URL.revokeObjectURL(u);
                });
            });
            if (feeData.paymentEvidencePreview) URL.revokeObjectURL(feeData.paymentEvidencePreview);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadApplication = async () => {
        if (!id) {
            toast.error("Application ID is missing.");
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const res = await fetch(`http://localhost:5001/api/applications/${id}`);
            if (!res.ok) throw new Error("Failed to load application");
            const data = await res.json();
            setApplication(data.data || data);
            toast.success('Application loaded successfully');
        } catch (err) {
            console.error("Error loading application:", err);
            toast.error("Failed to load application");
        } finally {
            setLoading(false);
        }
    };

    const captureGPS = () => {
        if (navigator.geolocation) {
            toast.loading("Capturing GPS location...");
            navigator.geolocation.getCurrentPosition(
                (position: GeolocationPosition) => {
                    setFormData(prev => ({
                        ...prev,
                        gpsLatitude: position.coords.latitude.toFixed(8),
                        gpsLongitude: position.coords.longitude.toFixed(8),
                        gpsAccuracy: position.coords.accuracy.toFixed(2),
                    }));
                    toast.dismiss();
                    toast.success("GPS location captured!");
                },
                (error: GeolocationPositionError) => {
                    toast.dismiss();
                    toast.error("Failed to capture GPS: " + error.message);
                }
            );
        } else {
            toast.error("GPS not supported in this browser");
        }
    };
    //
    const scheduledVisit = async () => {
  if (!formData.scheduledDate || !formData.scheduledTime) {
    toast.error("Please select date & time");
    return;
  }

  try {
    const res = await fetch(
      "http://localhost:5001/api/field-verification/schedule",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationNumber: application.applicationNumber,
          scheduledDate: formData.scheduledDate,
          scheduledTime: formData.scheduledTime,
          staffId: "Staff-123", // whoever logged in
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) throw new Error(data.msg || "Failed");

    toast.success("Visit scheduled & email sent");
  } catch (err: any) {
    toast.error(err.message || "Something went wrong");
  }
};

    const handleFileChange = (field: keyof FormDataState, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            toast.error("File size must be < 5MB");
            return;
        }
        const preview = URL.createObjectURL(file);
        setFormData(prev => ({
            ...prev,
            [field]: file,
            [`${String(field)}Preview`]: preview
        } as unknown as FormDataState));
        toast.success("Photo uploaded");
    };

    const removeFile = (field: keyof FormDataState) => {
        const previewKey = `${String(field)}Preview` as keyof FormDataState;
        const preview = formData[previewKey] as unknown as string | undefined;
        if (preview) URL.revokeObjectURL(preview);
        setFormData(prev => ({
            ...prev,
            [field]: null,
            [previewKey]: undefined
        } as unknown as FormDataState));
    };

    const handleVehicleFileChange = (index: number, field: keyof Vehicle, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            toast.error("File size must be < 5MB");
            return;
        }
        const preview = URL.createObjectURL(file);
        setVehicles(prev => {
            const copy = [...prev];
            copy[index] = {
                ...copy[index],
                [field]: file,
                [`${String(field)}Preview`]: preview
            } as Vehicle;
            return copy;
        });
        toast.success("Vehicle photo uploaded");
    };

    const removeVehicleFile = (index: number, field: keyof Vehicle) => {
        setVehicles(prev => {
            const copy = [...prev];
            const previewKey = `${String(field)}Preview` as keyof Vehicle;
            const prevUrl = copy[index][previewKey] as unknown as string | undefined;
            if (prevUrl) URL.revokeObjectURL(prevUrl);
            copy[index] = {
                ...copy[index],
                [field]: null,
                [previewKey]: undefined
            } as Vehicle;
            return copy;
        });
    };

    const addVehicle = () => {
        setVehicles(prev => ([...prev, {
            registrationNumber: "",
            vehicleType: "",
            colorMake: "",
            photoFront: null,
            photoSide: null,
            photoRear: null,
            photoPlate: null,
            rcMatch: null,
            insuranceVerified: null,
            verificationStatus: "",
        }]));
        toast.success("Vehicle added");
    };

    const removeVehicle = (index: number) => {
        if (vehicles.length === 1) {
            toast.error("At least one vehicle is required");
            return;
        }
        const v = vehicles[index];
        (["photoFrontPreview","photoSidePreview","photoRearPreview","photoPlatePreview"] as (keyof Vehicle)[]).forEach(pk => {
            const url = v[pk] as unknown as string | undefined;
            if (url) URL.revokeObjectURL(url);
        });
        setVehicles(prev => prev.filter((_, i) => i !== index));
        toast.success("Vehicle removed");
    };

    const handleRedFlagToggle = (flagKey: "unlicensedOperation" | "cashHeavyOperations" | "illegalActivitySigns") => {
        setFormData(prev => {
            const newVal = !prev[flagKey];
            const newRedFlags = new Set(prev.redFlags || []);
            const flagLabel = flagKey === "unlicensedOperation" ? "Unlicensed operation"
                : flagKey === "cashHeavyOperations" ? "Cash heavy operations" : "Signs of illegal activity";
            if (newVal) newRedFlags.add(flagLabel);
            else newRedFlags.delete(flagLabel);
            return {
                ...prev,
                [flagKey]: newVal,
                redFlags: Array.from(newRedFlags),
            } as FormDataState;
        });
    };

    const handleFeeFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            toast.error("File size must be < 5MB");
            return;
        }
        const preview = URL.createObjectURL(file);
        setFeeData(prev => ({ ...prev, paymentEvidence: file, paymentEvidencePreview: preview }));
        toast.success("Payment evidence uploaded");
    };

    const removeFeeFile = () => {
        if (feeData.paymentEvidencePreview) URL.revokeObjectURL(feeData.paymentEvidencePreview);
        setFeeData(prev => ({ ...prev, paymentEvidence: null, paymentEvidencePreview: undefined }));
    };

    const handleSubmit = async () => {
        if (!formData.verificationResult) {
            toast.error("Please select verification result");
            setActiveTab("verification");
            return;
        }
        if (!formData.gpsLatitude || !formData.gpsLongitude) {
            toast.error("Please capture GPS coordinates");
            setActiveTab("visit");
            return;
        }
        if (!application) {
            toast.error("Application not loaded");
            return;
        }

        try {
            setSaving(true);
            const submitForm = new window.FormData();

            // FIXED: Use reference_id as applicationNumber (string)
            submitForm.append("applicationNumber",application.applicationNumber);
            submitForm.append("applicationType", application.applicationType);
            submitForm.append("staffId", "current-staff-id"); // TODO: replace with actual staff ID
            // Visit details
            submitForm.append("scheduledDate", formData.scheduledDate);
            submitForm.append("scheduledTime", formData.scheduledTime);

            // GPS Location (nested object in schema)
            submitForm.append("gpsLocation[latitude]", formData.gpsLatitude);
            submitForm.append("gpsLocation[longitude]", formData.gpsLongitude);
            submitForm.append("gpsLocation[accuracy]", formData.gpsAccuracy);
            submitForm.append("gpsLocation[capturedAt]", new Date().toISOString());

            // Boolean fields - convert null to false or empty string
            const booleanFields: (keyof FormDataState)[] = [
                "addressExists", "businessSignVisible", "applicantPresent",
                "counterDisplayArea", "seatingForCustomers", "itSetupComputer",
                "itSetupInternet", "signagePresent", "parkingArea", "safetyEquipment",
                "unlicensedOperation", "cashHeavyOperations", "illegalActivitySigns"
            ];
            
            booleanFields.forEach(field => {
                const value = formData[field];
                if (value !== null && value !== undefined) {
                    submitForm.append(String(field), String(value));
                }
            });

            // String fields
            const stringFields: (keyof FormDataState)[] = [
                "personMetName", "businessOperatingStatus", "operatingHours",
                "warehouseSize", "storageCapacity", "cleanlinessRating",
                "interviewSummary", "applicantDemeanor", "businessClarity",
                "addressAuthenticity", "businessLegitimacy", "applicantCredibility",
                "neighborhoodSafety", "redFlagDetails", "verificationResult", "resultNotes"
            ];

            stringFields.forEach(field => {
                const value = formData[field];
                if (value && value !== "") {
                    submitForm.append(String(field), String(value));
                }
            });

            // Staff count
            if (formData.staffCount !== "" && formData.staffCount !== null) {
                submitForm.append("staffCount", String(formData.staffCount));
            }

            // Red flags array
            if (formData.redFlags && formData.redFlags.length > 0) {
                submitForm.append("redFlags", JSON.stringify(formData.redFlags));
            }

            // Photo files
            const photoFields: (keyof FormDataState)[] = [
                "photoExterior", "photoInterior", "photoWarehouse",
                "photoVehicle1", "photoVehicle2", "photoLicense"
            ];

            photoFields.forEach(field => {
                const file = formData[field];
                if (file instanceof File) {
                    submitForm.append(String(field), file);
                }
            });

            // Fee data - use nested structure matching schema
            submitForm.append("feeData[standardFee]", String(feeData.standardFee));
            submitForm.append("feeData[amountCollected]", feeData.amountCollected);
            submitForm.append("feeData[paymentMode]", feeData.paymentMode);
            submitForm.append("feeData[paymentReference]", feeData.paymentReference);
            submitForm.append("feeData[receiptNumber]", feeData.receiptNumber);
            submitForm.append("feeData[agreementSigned]", String(feeData.agreementSigned));
            submitForm.append("feeData[applicantConfirmed]", String(feeData.applicantConfirmed));
            submitForm.append("feeData[termsAccepted]", String(feeData.termsAccepted));
            submitForm.append("feeData[staffSignature]", feeData.staffSignature);

            if (feeData.paymentEvidence instanceof File) {
                submitForm.append("paymentEvidence", feeData.paymentEvidence);
            }

            // Vehicles - use vehicleData to match schema
            submitForm.append("vehicleCount", String(vehicles.length));
            vehicles.forEach((v, idx) => {
                submitForm.append(`vehicleData[${idx}][registrationNumber]`, v.registrationNumber || "");
                submitForm.append(`vehicleData[${idx}][vehicleType]`, v.vehicleType || "");
                submitForm.append(`vehicleData[${idx}][colorMake]`, v.colorMake || "");
                submitForm.append(`vehicleData[${idx}][verificationStatus]`, v.verificationStatus || "");
                
                if (v.rcMatch !== null) {
                    submitForm.append(`vehicleData[${idx}][rcMatch]`, String(v.rcMatch));
                }
                if (v.insuranceVerified !== null) {
                    submitForm.append(`vehicleData[${idx}][insuranceVerified]`, String(v.insuranceVerified));
                }

                // Vehicle photos
                if (v.photoFront) submitForm.append(`vehicleData[${idx}][photoFront]`, v.photoFront);
                if (v.photoSide) submitForm.append(`vehicleData[${idx}][photoSide]`, v.photoSide);
                if (v.photoRear) submitForm.append(`vehicleData[${idx}][photoRear]`, v.photoRear);
                if (v.photoPlate) submitForm.append(`vehicleData[${idx}][photoPlate]`, v.photoPlate);
            });

            const res = await fetch("http://localhost:5001/api/field-verification/submit", {
                method: "POST",
                body: submitForm,
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({ message: "Submission failed" }));
                throw new Error(err.message || "Submission failed");
            }
            const result = await res.json();
            toast.success("Field verification submitted successfully!");
            navigate("/field-verification-queue");
        } catch (err) {
            console.error("Submission error:", err);
            toast.error(err instanceof Error ? err.message : "Failed to submit");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }
 //   console.log(application)
    if (!application) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <p className="text-lg text-muted-foreground">Application not found</p>
                <Button onClick={() => navigate(-1)} className="mt-4">Go Back</Button>
            </div>
        );
    }

    // ==== Rendered UI ====
    return (
        <div className="container mx-auto p-6 space-y-6 max-w-7xl">
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-lg shadow-lg">
                <h1 className="text-3xl font-bold mb-2">Field Verification Form</h1>
                <p className="text-blue-100">
                    Case: <span className="font-semibold">{application.applicationNumber}</span> — {application.fullName}
                </p>
                <p className="text-sm text-blue-200 mt-1">Type: {application.applicationType}</p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-6 h-auto">
                    <TabsTrigger value="visit" className="py-3">
                        <MapPin className="h-4 w-4 mr-2" />
                        Visit
                    </TabsTrigger>
                    <TabsTrigger value="photos" className="py-3">
                        <Camera className="h-4 w-4 mr-2" />
                        Photos
                    </TabsTrigger>
                    <TabsTrigger value="verification" className="py-3">Verification</TabsTrigger>
                    <TabsTrigger value="facility" className="py-3">Facility</TabsTrigger>
                    <TabsTrigger value="vehicle" className="py-3">Vehicle</TabsTrigger>
                    <TabsTrigger value="fee" className="py-3">Fee</TabsTrigger>
                </TabsList>

                {/* VISIT TAB */}
                <TabsContent value="visit" className="space-y-4 mt-6">
                    <Card>
                        <CardHeader><CardTitle>Visit Planning & GPS Capture</CardTitle></CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <Label className="text-sm font-semibold">Business Address</Label>
                                    <p className="text-sm bg-slate-50 p-3 rounded border">{application.business_address || application.address}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-semibold">Contact Number</Label>
                                    <p className="text-sm bg-slate-50 p-3 rounded border">{application.mobile}</p>
                                </div>
                                 <div>
                                    <Label className="text-sm font-semibold">Email</Label>
                                    <p className="text-sm bg-slate-50 p-3 rounded border">{application.email}</p>
                                </div>
                            </div>

                            <div>
                                <Label className="text-sm font-semibold mb-2 block">Google Maps Link</Label>
                                <Button variant="outline" size="sm" asChild>
                                    <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(application.business_address || application.address)}`} target="_blank" rel="noopener noreferrer">
                                        <ExternalLink className="h-4 w-4 mr-2" />
                                        Open in Google Maps
                                    </a>
                                </Button>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="scheduledDate">Scheduled Date</Label>
                                    <Input id="scheduledDate" type="date" value={formData.scheduledDate} onChange={(e) => setFormData({...formData, scheduledDate: e.target.value})} />
                                </div>
                                <div>
                                    <Label htmlFor="scheduledTime">Scheduled Time</Label>
                                    <Input id="scheduledTime" type="time" value={formData.scheduledTime} onChange={(e) => setFormData({...formData, scheduledTime: e.target.value})} />
                                </div>
                            </div>

                            <Card className="border-2 border-dashed border-blue-200 bg-blue-50">
                                <CardHeader>
                                    <CardTitle className="text-base flex items-center gap-2 text-blue-900">
                                        <MapPin className="h-5 w-5" />
                                        GPS Location Tracking
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <Button onClick={captureGPS} variant="default" className="w-full md:w-auto">
                                        <MapPin className="h-4 w-4 mr-2" />
                                        Capture GPS Location
                                    </Button>
                                    {formData.gpsLatitude && (
                                        <div className="bg-white p-4 rounded-lg border border-green-200 space-y-2">
                                            <div className="flex items-center gap-2 text-green-700 mb-2">
                                                <CheckCircle2 className="h-5 w-5" />
                                                <span className="font-semibold">Location Captured</span>
                                            </div>
                                            <div className="text-sm space-y-1">
                                                <p><span className="font-medium">Latitude:</span> {formData.gpsLatitude}</p>
                                                <p><span className="font-medium">Longitude:</span> {formData.gpsLongitude}</p>
                                                <p><span className="font-medium">Accuracy:</span> {formData.gpsAccuracy} meters</p>
                                            </div>
                                        </div>
                                        
                                    )}
                                </CardContent>
                                
                            </Card>
                            <Button onClick={scheduledVisit} variant="default" className="w-full md:w-auto">
                                        <MapPin className="h-4 w-4 mr-2" />
                                        Schedule Visit
                                    </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* PHOTOS TAB */}
                <TabsContent value="photos" className="space-y-4 mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Camera className="h-5 w-5" /> Photo Documentation</CardTitle>
                            <p className="text-sm text-muted-foreground">Upload clear photos of the business premises and documentation</p>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {[
                                { key: "photoExterior" as keyof FormDataState, label: "Business Exterior (Board clearly visible)", required: true },
                                { key: "photoInterior" as keyof FormDataState, label: "Business Interior (Setup, storage)", required: true },
                                { key: "photoWarehouse" as keyof FormDataState, label: "Warehouse/Storage Area", required: false },
                                { key: "photoVehicle1" as keyof FormDataState, label: "Fleet Vehicles - Photo 1 (if applicable)", required: false },
                                { key: "photoVehicle2" as keyof FormDataState, label: "Fleet Vehicles - Photo 2 (if applicable)", required: false },
                                { key: "photoLicense" as keyof FormDataState, label: "Business License / Board Display", required: true }
                            ].map(({ key, label, required }) => (
                                <div key={String(key)} className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        {label}
                                        {required && <span className="text-red-500">*</span>}
                                    </Label>
                                    <div className="flex gap-3 items-start">
                                        <div className="flex-1">
                                            <Input type="file" id={String(key)} accept="image/*" onChange={(e) => handleFileChange(key, e)} className="cursor-pointer" />
                                        </div>
                                        {formData[`${String(key)}Preview` as keyof FormDataState] && (
                                            <div className="relative w-48 h-36 border-2 border-green-200 rounded-lg overflow-hidden">
                                                <img src={formData[`${String(key)}Preview` as keyof FormDataState] as unknown as string} alt={label} className="w-full h-full object-cover" />
                                                <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full">
                                                    <CheckCircle2 className="h-4 w-4" />
                                                </div>
                                                <Button variant="ghost" size="sm" className="absolute top-2 left-2" onClick={() => removeFile(key)}>
                                                    <X className="h-4 w-4 text-red-600" />
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* VERIFICATION TAB */}
                <TabsContent value="verification" className="space-y-4 mt-6">
                    <Card>
                        <CardHeader><CardTitle>Address & Business Verification</CardTitle></CardHeader>
                        <CardContent className="space-y-6">
                            {[
                                { key: "addressExists" as keyof FormDataState, label: "Address Exists & Active" },
                                { key: "businessSignVisible" as keyof FormDataState, label: "Business Sign/Board Visible" },
                                { key: "applicantPresent" as keyof FormDataState, label: "Applicant Present at Location" }
                            ].map(({ key, label }) => (
                                <div key={String(key)} className="space-y-2">
                                    <Label className="font-semibold">{label}</Label>
                                    <RadioGroup value={String(formData[key] ?? "")} onValueChange={(value) => setFormData({...formData, [key]: value === "true"})}>
                                        <div className="flex gap-6">
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="true" id={`${String(key)}-yes`} />
                                                <Label htmlFor={`${String(key)}-yes`} className="font-normal cursor-pointer">YES</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="false" id={`${String(key)}-no`} />
                                                <Label htmlFor={`${String(key)}-no`} className="font-normal cursor-pointer">NO</Label>
                                            </div>
                                        </div>
                                    </RadioGroup>
                                </div>
                            ))}

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="personMetName">Name of Person Met</Label>
                                    <Input id="personMetName" value={formData.personMetName} onChange={(e) => setFormData({...formData, personMetName: e.target.value})} placeholder="Full name" />
                                </div>
                                <div>
                                    <Label htmlFor="staffCount">Number of Staff Observed</Label>
                                    <Input id="staffCount" type="number" value={formData.staffCount === "" ? "" : String(formData.staffCount)} onChange={(e) => setFormData({...formData, staffCount: e.target.value === "" ? "" : Number(e.target.value)})} min={0} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="font-semibold">Business Operating Status</Label>
                                <RadioGroup value={formData.businessOperatingStatus} onValueChange={(v) => setFormData({...formData, businessOperatingStatus: v})}>
                                    <div className="space-y-2">
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="active_operating" id="status-active" />
                                            <Label htmlFor="status-active" className="font-normal cursor-pointer">Active & Operating</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="closed" id="status-closed" />
                                            <Label htmlFor="status-closed" className="font-normal cursor-pointer">Closed</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="under_construction" id="status-construction" />
                                            <Label htmlFor="status-construction" className="font-normal cursor-pointer">Under Construction</Label>
                                        </div>
                                    </div>
                                </RadioGroup>
                            </div>

                            <div>
                                <Label htmlFor="operatingHours">Operating Hours</Label>
                                <Input id="operatingHours" placeholder="e.g., 9 AM - 6 PM" value={formData.operatingHours} onChange={(e) => setFormData({...formData, operatingHours: e.target.value})} />
                            </div>

                            <div>
                                <Label htmlFor="interviewSummary">Interview Summary</Label>
                                <Textarea id="interviewSummary" rows={8} value={formData.interviewSummary} onChange={(e) => setFormData({...formData, interviewSummary: e.target.value})} />
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <Label>Applicant's Demeanor</Label>
                                    <Select value={formData.applicantDemeanor} onValueChange={(v) => setFormData({...formData, applicantDemeanor: v})}>
                                        <SelectTrigger><SelectValue placeholder="Select demeanor" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="confident">Confident</SelectItem>
                                            <SelectItem value="hesitant">Hesitant</SelectItem>
                                            <SelectItem value="unclear">Unclear</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Clarity on Business Model</Label>
                                    <Select value={formData.businessClarity} onValueChange={(v) => setFormData({...formData, businessClarity: v})}>
                                        <SelectTrigger><SelectValue placeholder="Select clarity" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="clear">Clear</SelectItem>
                                            <SelectItem value="vague">Vague</SelectItem>
                                            <SelectItem value="inconsistent">Inconsistent</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4 mt-4">
                                <div>
                                    <Label>Address Authenticity</Label>
                                    <Select value={formData.addressAuthenticity} onValueChange={(v) => setFormData({...formData, addressAuthenticity: v})}>
                                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="verified">VERIFIED</SelectItem>
                                            <SelectItem value="suspicious">SUSPICIOUS</SelectItem>
                                            <SelectItem value="false">FALSE</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Business Legitimacy</Label>
                                    <Select value={formData.businessLegitimacy} onValueChange={(v) => setFormData({...formData, businessLegitimacy: v})}>
                                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="verified">VERIFIED</SelectItem>
                                            <SelectItem value="questionable">QUESTIONABLE</SelectItem>
                                            <SelectItem value="fraud_indicators">FRAUD INDICATORS</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4 mt-4">
                                <div>
                                    <Label>Applicant Credibility</Label>
                                    <Select value={formData.applicantCredibility} onValueChange={(v) => setFormData({...formData, applicantCredibility: v})}>
                                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="high">HIGH</SelectItem>
                                            <SelectItem value="medium">MEDIUM</SelectItem>
                                            <SelectItem value="low">LOW</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Neighborhood Safety</Label>
                                    <Select value={formData.neighborhoodSafety} onValueChange={(v) => setFormData({...formData, neighborhoodSafety: v})}>
                                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="safe">SAFE</SelectItem>
                                            <SelectItem value="neutral">NEUTRAL</SelectItem>
                                            <SelectItem value="unsafe">UNSAFE</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="mt-4 space-y-3">
                                <Label className="font-semibold">Red Flags Detected</Label>
                                <div className="flex gap-4">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox checked={formData.unlicensedOperation} onCheckedChange={() => handleRedFlagToggle("unlicensedOperation")} id="flag-unlicensed" />
                                        <Label htmlFor="flag-unlicensed" className="font-normal">Unlicensed operation detected</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox checked={formData.cashHeavyOperations} onCheckedChange={() => handleRedFlagToggle("cashHeavyOperations")} id="flag-cash" />
                                        <Label htmlFor="flag-cash" className="font-normal">Cash-heavy / informal operations</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox checked={formData.illegalActivitySigns} onCheckedChange={() => handleRedFlagToggle("illegalActivitySigns")} id="flag-illegal" />
                                        <Label htmlFor="flag-illegal" className="font-normal">Signs of illegal activity</Label>
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="redFlagDetails">Red Flag Details (if any)</Label>
                                    <Textarea id="redFlagDetails" rows={3} value={formData.redFlagDetails} onChange={(e) => setFormData({...formData, redFlagDetails: e.target.value})} />
                                </div>
                            </div>

                            <div className="mt-4">
                                <Label className="font-semibold">Verification Result</Label>
                                <RadioGroup value={formData.verificationResult} onValueChange={(v) => setFormData({...formData, verificationResult: v})}>
                                    <div className="space-y-2 mt-2">
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="verified_ok" id="result-ok" />
                                            <Label htmlFor="result-ok" className="font-normal">✓ FIELD VERIFIED – OK</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="verified_issues" id="result-issues" />
                                            <Label htmlFor="result-issues" className="font-normal">⚠ FIELD VERIFIED – ISSUES FOUND</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="not_verified" id="result-not" />
                                            <Label htmlFor="result-not" className="font-normal">✗ NOT VERIFIED</Label>
                                        </div>
                                    </div>
                                </RadioGroup>
                            </div>

                            <div className="mt-4">
                                <Label htmlFor="resultNotes">Result Notes / Reason</Label>
                                <Textarea id="resultNotes" rows={4} value={formData.resultNotes} onChange={(e) => setFormData({...formData, resultNotes: e.target.value})} />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* FACILITY TAB */}
                <TabsContent value="facility" className="space-y-4 mt-6">
                    <Card>
                        <CardHeader><CardTitle>Facility Verification</CardTitle><p className="text-sm text-muted-foreground">Verify office / counter / warehouse setup</p></CardHeader>
                        <CardContent className="space-y-4">
                            <h3 className="font-semibold">For Courier Booking Counter</h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <Label>Counter / Display Area</Label>
                                    <RadioGroup value={String(formData.counterDisplayArea ?? "")} onValueChange={(v) => setFormData({...formData, counterDisplayArea: v === "true"})}>
                                        <div className="flex gap-4">
                                            <div className="flex items-center"><RadioGroupItem value="true" id="counter-yes" /><Label htmlFor="counter-yes">YES</Label></div>
                                            <div className="flex items-center"><RadioGroupItem value="false" id="counter-no" /><Label htmlFor="counter-no">NO</Label></div>
                                        </div>
                                    </RadioGroup>
                                </div>
                                <div>
                                    <Label>Seating for customers</Label>
                                    <RadioGroup value={String(formData.seatingForCustomers ?? "")} onValueChange={(v) => setFormData({...formData, seatingForCustomers: v === "true"})}>
                                        <div className="flex gap-4">
                                            <div className="flex items-center"><RadioGroupItem value="true" id="seat-yes" /><Label htmlFor="seat-yes">YES</Label></div>
                                            <div className="flex items-center"><RadioGroupItem value="false" id="seat-no" /><Label htmlFor="seat-no">NO</Label></div>
                                        </div>
                                    </RadioGroup>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4 mt-4">
                                <div>
                                    <Label>IT Setup - Computer</Label>
                                    <RadioGroup value={String(formData.itSetupComputer ?? "")} onValueChange={(v) => setFormData({...formData, itSetupComputer: v === "true"})}>
                                        <div className="flex gap-4">
                                            <div className="flex items-center"><RadioGroupItem value="true" id="itcomp-yes" /><Label htmlFor="itcomp-yes">YES</Label></div>
                                            <div className="flex items-center"><RadioGroupItem value="false" id="itcomp-no" /><Label htmlFor="itcomp-no">NO</Label></div>
                                        </div>
                                    </RadioGroup>
                                </div>
                                <div>
                                    <Label>IT Setup - Internet</Label>
                                    <RadioGroup value={String(formData.itSetupInternet ?? "")} onValueChange={(v) => setFormData({...formData, itSetupInternet: v === "true"})}>
                                        <div className="flex gap-4">
                                            <div className="flex items-center"><RadioGroupItem value="true" id="itnet-yes" /><Label htmlFor="itnet-yes">YES</Label></div>
                                            <div className="flex items-center"><RadioGroupItem value="false" id="itnet-no" /><Label htmlFor="itnet-no">NO</Label></div>
                                        </div>
                                    </RadioGroup>
                                </div>
                            </div>

                            <div className="mt-4">
                                <Label>Signage Present</Label>
                                <RadioGroup value={String(formData.signagePresent ?? "")} onValueChange={(v) => setFormData({...formData, signagePresent: v === "true"})}>
                                    <div className="flex gap-4">
                                        <div className="flex items-center"><RadioGroupItem value="true" id="signage-yes" /><Label htmlFor="signage-yes">YES</Label></div>
                                        <div className="flex items-center"><RadioGroupItem value="false" id="signage-no" /><Label htmlFor="signage-no">NO</Label></div>
                                    </div>
                                </RadioGroup>
                            </div>

                            <h3 className="font-semibold mt-6">For Fleet / Warehouse</h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <Label>Warehouse Size (sqft)</Label>
                                    <Input type="number" value={formData.warehouseSize} onChange={(e) => setFormData({...formData, warehouseSize: e.target.value})} placeholder="e.g., 1200" />
                                </div>
                                <div>
                                    <Label>Storage Capacity</Label>
                                    <Input value={formData.storageCapacity} onChange={(e) => setFormData({...formData, storageCapacity: e.target.value})} placeholder="e.g., 50 CBM" />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4 mt-4">
                                <div>
                                    <Label>Adequate Parking Area</Label>
                                    <RadioGroup value={String(formData.parkingArea ?? "")} onValueChange={(v) => setFormData({...formData, parkingArea: v === "true"})}>
                                        <div className="flex gap-4">
                                            <div className="flex items-center"><RadioGroupItem value="true" id="park-yes" /><Label htmlFor="park-yes">YES</Label></div>
                                            <div className="flex items-center"><RadioGroupItem value="false" id="park-no" /><Label htmlFor="park-no">NO</Label></div>
                                        </div>
                                    </RadioGroup>
                                </div>
                                <div>
                                    <Label>Safety Equipment Available</Label>
                                    <RadioGroup value={String(formData.safetyEquipment ?? "")} onValueChange={(v) => setFormData({...formData, safetyEquipment: v === "true"})}>
                                        <div className="flex gap-4">
                                            <div className="flex items-center"><RadioGroupItem value="true" id="safe-yes" /><Label htmlFor="safe-yes">YES</Label></div>
                                            <div className="flex items-center"><RadioGroupItem value="false" id="safe-no" /><Label htmlFor="safe-no">NO</Label></div>
                                        </div>
                                    </RadioGroup>
                                </div>
                            </div>

                            <div className="mt-4">
                                <Label>Cleanliness Rating</Label>
                                <Select value={formData.cleanlinessRating} onValueChange={(v) => setFormData({...formData, cleanlinessRating: v})}>
                                    <SelectTrigger><SelectValue placeholder="Select cleanliness" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="good">Good</SelectItem>
                                        <SelectItem value="average">Average</SelectItem>
                                        <SelectItem value="poor">Poor</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* VEHICLE TAB (Option 1: card per vehicle) */}
                <TabsContent value="vehicle" className="space-y-4 mt-6">
                    <Card>
                        <CardHeader><CardTitle>Vehicle Verification</CardTitle><p className="text-sm text-muted-foreground">Add vehicles, upload photos and verify RC/insurance</p></CardHeader>
                        <CardContent className="space-y-6">
                            {vehicles.map((v, idx) => (
                                <Card key={idx} className="p-4 border">
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="font-semibold">Vehicle #{idx + 1}</h4>
                                        <div className="flex items-center gap-2">
                                            <Button variant="ghost" size="sm" onClick={() => removeVehicle(idx)}><Trash2 className="h-4 w-4 text-red-600" /></Button>
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-3 gap-4">
                                        <div>
                                            <Label>Registration Number</Label>
                                            <Input value={v.registrationNumber} onChange={(e) => setVehicles(prev => {
                                                const c = [...prev]; c[idx].registrationNumber = e.target.value; return c;
                                            })} />
                                        </div>
                                        <div>
                                            <Label>Vehicle Type</Label>
                                            <Input value={v.vehicleType} onChange={(e) => setVehicles(prev => {
                                                const c = [...prev]; c[idx].vehicleType = e.target.value; return c;
                                            })} />
                                        </div>
                                        <div>
                                            <Label>Color / Make</Label>
                                            <Input value={v.colorMake} onChange={(e) => setVehicles(prev => {
                                                const c = [...prev]; c[idx].colorMake = e.target.value; return c;
                                            })} />
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-4 gap-4 mt-4">
                                        {([
                                            { key: "photoFront" as keyof Vehicle, label: "Front View" },
                                            { key: "photoSide" as keyof Vehicle, label: "Side View" },
                                            { key: "photoRear" as keyof Vehicle, label: "Rear View" },
                                            { key: "photoPlate" as keyof Vehicle, label: "Number Plate (close-up)" },
                                        ]).map(({ key, label }) => (
                                            <div key={String(key)}>
                                                <Label>{label}</Label>
                                                <Input type="file" accept="image/*" onChange={(e) => handleVehicleFileChange(idx, key, e)} />
                                                {v[`${String(key)}Preview` as keyof Vehicle] && (
                                                    <div className="relative w-40 h-28 mt-2 rounded overflow-hidden border">
                                                        <img src={v[`${String(key)}Preview` as keyof Vehicle] as unknown as string} alt={label} className="w-full h-full object-cover" />
                                                        <Button variant="ghost" size="sm" className="absolute top-1 right-1" onClick={() => removeVehicleFile(idx, key)}>
                                                            <X className="h-4 w-4 text-red-600" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="grid md:grid-cols-3 gap-4 mt-4">
                                        <div>
                                            <Label>RC Match</Label>
                                            <RadioGroup value={String(v.rcMatch ?? "")} onValueChange={(val) => setVehicles(prev => { const c = [...prev]; c[idx].rcMatch = val === "true"; return c; })}>
                                                <div className="flex gap-3">
                                                    <div className="flex items-center"><RadioGroupItem value="true" id={`rc-${idx}-yes`} /><Label htmlFor={`rc-${idx}-yes`}>YES</Label></div>
                                                    <div className="flex items-center"><RadioGroupItem value="false" id={`rc-${idx}-no`} /><Label htmlFor={`rc-${idx}-no`}>NO</Label></div>
                                                </div>
                                            </RadioGroup>
                                        </div>

                                        <div>
                                            <Label>Insurance Verified</Label>
                                            <RadioGroup value={String(v.insuranceVerified ?? "")} onValueChange={(val) => setVehicles(prev => { const c = [...prev]; c[idx].insuranceVerified = val === "true"; return c; })}>
                                                <div className="flex gap-3">
                                                    <div className="flex items-center"><RadioGroupItem value="true" id={`ins-${idx}-yes`} /><Label htmlFor={`ins-${idx}-yes`}>YES</Label></div>
                                                    <div className="flex items-center"><RadioGroupItem value="false" id={`ins-${idx}-no`} /><Label htmlFor={`ins-${idx}-no`}>NO</Label></div>
                                                </div>
                                            </RadioGroup>
                                        </div>

                                        <div>
                                            <Label>Verification Status</Label>
                                            <Select value={v.verificationStatus}
                                                onValueChange={(val) => setVehicles(prev => {
                                                    const c = [...prev];
                                                    c[idx].verificationStatus = val;
                                                    return c;
                                                })}>
                                                <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="verified">Verified</SelectItem>
                                                    <SelectItem value="not_verified">Not Verified</SelectItem>
                                                    <SelectItem value="pending">Pending</SelectItem> {/* fixed */}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </Card>
                            ))}

                            <div className="flex justify-end">
                                <Button onClick={addVehicle} variant="outline" className="mt-2">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Vehicle
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* FEE TAB */}
                <TabsContent value="fee" className="space-y-4 mt-6">
                    <Card>
                        <CardHeader><CardTitle>Office / Vehicle Verification & Fee Collection</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <Label>Standard Fee (₹)</Label>
                                    <Input type="number" value={feeData.standardFee} onChange={(e) => setFeeData({...feeData, standardFee: Number(e.target.value)})} />
                                </div>
                                <div>
                                    <Label>Amount Collected (₹)</Label>
                                    <Input value={feeData.amountCollected} onChange={(e) => setFeeData({...feeData, amountCollected: e.target.value})} />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4 mt-4">
                                <div>
                                    <Label>Payment Mode</Label>
                                    <Select value={feeData.paymentMode} onValueChange={(v) => setFeeData({...feeData, paymentMode: v})}>
                                        <SelectTrigger><SelectValue placeholder="Select payment mode" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="cash">Cash</SelectItem>
                                            <SelectItem value="upi">UPI</SelectItem>
                                            <SelectItem value="bank">Bank Transfer</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Payment Reference / UPI Txn ID</Label>
                                    <Input value={feeData.paymentReference} onChange={(e) => setFeeData({...feeData, paymentReference: e.target.value})} />
                                </div>
                            </div>

                            <div className="mt-4">
                                <Label>Receipt Number (if any)</Label>
                                <Input value={feeData.receiptNumber} onChange={(e) => setFeeData({...feeData, receiptNumber: e.target.value})} />
                            </div>

                            <div className="mt-4">
                                <Label>Payment Evidence (screenshot/photo)</Label>
                                <div className="flex gap-3 items-start">
                                    <div className="flex-1">
                                        <Input type="file" accept="image/*" onChange={handleFeeFileChange} />
                                    </div>
                                    {feeData.paymentEvidencePreview && (
                                        <div className="relative w-48 h-36 border rounded overflow-hidden">
                                            <img src={feeData.paymentEvidencePreview} alt="payment" className="w-full h-full object-cover" />
                                            <Button variant="ghost" size="sm" className="absolute top-2 right-2" onClick={removeFeeFile}><X className="h-4 w-4 text-red-600" /></Button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid md:grid-cols-3 gap-4 mt-4">
                                <div className="flex items-center space-x-2"><Checkbox checked={feeData.agreementSigned} onCheckedChange={(v) => setFeeData({...feeData, agreementSigned: Boolean(v)})} id="agreement-signed" /><Label htmlFor="agreement-signed">Applicant signed agreement</Label></div>
                                <div className="flex items-center space-x-2"><Checkbox checked={feeData.applicantConfirmed} onCheckedChange={(v) => setFeeData({...feeData, applicantConfirmed: Boolean(v)})} id="app-confirmed" /><Label htmlFor="app-confirmed">Applicant confirmed receipt</Label></div>
                                <div className="flex items-center space-x-2"><Checkbox checked={feeData.termsAccepted} onCheckedChange={(v) => setFeeData({...feeData, termsAccepted: Boolean(v)})} id="terms-accepted" /><Label htmlFor="terms-accepted">Terms accepted</Label></div>
                            </div>

                            <div className="mt-4">
                                <Label>Staff Signature / Name</Label>
                                <Input value={feeData.staffSignature} onChange={(e) => setFeeData({...feeData, staffSignature: e.target.value})} />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <div className="pt-6 border-t flex justify-end">
                <Button onClick={handleSubmit} disabled={saving} className="flex items-center gap-2">
                    {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                    {saving ? "Submitting..." : "Submit Verification Report"}
                </Button>
            </div>
        </div>
    );
}