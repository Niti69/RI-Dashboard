import { useState } from "react";
import { useNavigate } from "react-router-dom";
// Removed: import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { z } from "zod";

// --- START: MOCK API FUNCTIONS AND DATA STRUCTURES (Unchanged) ---

// Utility to simulate an API request delay
const mockFetch = <T,>(data: T, delay = 1000): Promise<T> => {
    return new Promise((resolve) => {
        setTimeout(() => resolve(data), delay);
    });
};

interface MockUser {
    id: string;
    email: string;
}

// Mock function to simulate user sign-up
const mockSignUp = async (email: string, password: string, options: any): Promise<{ data: { user: MockUser | null }, error: any }> => {
    await mockFetch(null); // Simulate network delay

    if (email === "test@exists.com") {
        return { data: { user: null }, error: { message: "User already registered." } };
    }

    const mockUser: MockUser = {
        id: `user_${Date.now()}`,
        email: email,
    };

    // Simulate success
    return { data: { user: mockUser }, error: null };
};

// Mock function to simulate the database RPC for generating a reference ID
const mockGenerateReferenceId = async (): Promise<{ data: string | null, error: any }> => {
    await mockFetch(null, 500);
    const id = `RI${Date.now().toString().slice(-6)}`;
    return { data: id, error: null };
};

// Mock function to simulate inserting the application into the database
const mockInsertApplication = async (applicationData: any): Promise<{ error: any }> => {
    await mockFetch(null, 500);
    // In a real app, you'd insert this into Supabase. Here, we just log it.
    console.log("Mock Application Inserted:", applicationData);
    return { error: null };
};

// --- END: MOCK API FUNCTIONS AND DATA STRUCTURES ---


// **FIX 1: Adjusted Zod Schema for Optional Fields and Type Coercion**
const registrationSchema = z.object({
    fullName: z.string().trim().min(3, "Name must be at least 3 characters").max(100),
    email: z.string().trim().email("Invalid email address").max(255),
    mobile: z.string().trim().regex(/^\+?[1-9]\d{9,14}$/, "Invalid mobile number format (e.g., +919876543210)"),
    alternateMobile: z.string().trim().regex(/^\+?[1-9]\d{9,14}$/, "Invalid mobile number format").optional().or(z.literal("")),
    address: z.string().trim().min(10, "Address must be at least 10 characters").max(500),
    franchiseType: z.enum(["fleet_owner", "franchise_partner", "delivery_agent"], {
        errorMap: () => ({ message: "Please select a valid franchise type" }),
    }),
    businessName: z.string().trim().max(200).optional().or(z.literal("")),
    businessAddress: z.string().trim().max(500).optional().or(z.literal("")),
    // Use .pipe(z.number()) or .transform(Number) if you want string coercion
    yearsOfExperience: z.union([z.number().min(0, "Must be non-negative").max(50, "Max 50 years"), z.undefined()]).optional(),
    previousLogisticsExperience: z.boolean(),
    previousLogisticsDetails: z.string().trim().max(500).optional().or(z.literal("")),
    expectedMonthlyVolume: z.string().trim().max(200).optional().or(z.literal("")),
    serviceDescription: z.string().trim().max(1000).optional().or(z.literal("")),
    password: z.string().min(8, "Password must be at least 8 characters").max(100),
});

// Define the type for the form data state, ensuring yearsOfExperience is explicitly 'string' for the input field value
type FormData = z.infer<typeof registrationSchema> & {
    yearsOfExperience: string | number; // Must be string for the input field value
    // Fix: Allow franchiseType to be an empty string in the state for initial selection
    franchiseType: z.infer<typeof registrationSchema>['franchiseType'] | "";
};

const Register = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    
    // Initialize form data with correct types
    const [formData, setFormData] = useState<FormData>({
        fullName: "",
        email: "",
        mobile: "",
        alternateMobile: "",
        address: "",
        // Fix: Use an empty string for the initial state of the Select component
        franchiseType: "", 
        businessName: "",
        businessAddress: "",
        // Fix: Use an empty string for the initial state of the number Input field
        yearsOfExperience: "", 
        previousLogisticsExperience: false,
        previousLogisticsDetails: "",
        expectedMonthlyVolume: "",
        serviceDescription: "",
        password: "",
    });

    // Helper to handle form data changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value, type, checked } = e.target as HTMLInputElement;

        setFormData(prev => ({
            ...prev,
            [id]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSelectChange = (value: string) => {
        setFormData(prev => ({
            ...prev,
            // The value is guaranteed to be one of the enum values, so the cast is safe
            franchiseType: value as z.infer<typeof registrationSchema>['franchiseType'],
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // **FIX 2: Data Preparation for Zod Validation**
            // Convert 'yearsOfExperience' string to a number OR undefined for optional field
            const years = formData.yearsOfExperience === "" ? undefined : parseInt(formData.yearsOfExperience as string);

            const dataToValidate = {
                ...formData,
                // Only pass if it's not undefined (i.e., not an empty string)
                yearsOfExperience: years,
                // Ensure optional empty strings are null for the DB/backend later on
                alternateMobile: formData.alternateMobile || undefined,
                businessName: formData.businessName || undefined,
                businessAddress: formData.businessAddress || undefined,
                previousLogisticsDetails: formData.previousLogisticsDetails || undefined,
                expectedMonthlyVolume: formData.expectedMonthlyVolume || undefined,
                serviceDescription: formData.serviceDescription || undefined,
            };

            // Validate form data
            const validatedData = registrationSchema.parse(dataToValidate);

            // 1. Create user account (Mock Supabase Auth)
            const { data: authData, error: authError } = await mockSignUp(
                validatedData.email,
                validatedData.password,
                {
                    data: {
                        full_name: validatedData.fullName,
                        mobile: validatedData.mobile,
                        role: "applicant",
                    },
                    emailRedirectTo: `${window.location.origin}/`,
                }
            );

            if (authError) throw authError;
            if (!authData.user) throw new Error("Failed to create user during authentication.");

            // 2. Generate reference ID (Mock Supabase RPC)
            const { data: refData, error: refError } = await mockGenerateReferenceId();
            if (refError) throw refError;

            // 3. Create application (Mock Supabase Database Insert)
            const SLA_DEADLINE_MS = 48 * 60 * 60 * 1000; // 48 hours
            // Use validatedData directly, replacing undefined fields with null for the database insert
            const { error: appError } = await mockInsertApplication({
                reference_id: refData,
                applicant_id: authData.user.id,
                full_name: validatedData.fullName,
                mobile: validatedData.mobile,
                email: validatedData.email,
                address: validatedData.address,
                alternate_mobile: validatedData.alternateMobile ?? null, // Use nullish coalescing for cleaner conversion
                franchise_type: validatedData.franchiseType,
                business_name: validatedData.businessName ?? null,
                business_address: validatedData.businessAddress ?? null,
                years_of_experience: validatedData.yearsOfExperience ?? null,
                previous_logistics_experience: validatedData.previousLogisticsExperience,
                previous_logistics_details: validatedData.previousLogisticsDetails ?? null,
                expected_monthly_volume: validatedData.expectedMonthlyVolume ?? null,
                service_description: validatedData.serviceDescription ?? null,
                status: "new_pending_kyc",
                // Simulate setting the SLA deadline 48 hours from now
                sla_deadline: new Date(Date.now() + SLA_DEADLINE_MS).toISOString(),
            });

            if (appError) throw appError;

            toast.success(
                `Application submitted successfully! Your reference ID is ${refData}. Verification will begin shortly.`,
                { duration: 10000 }
            );

            // Redirect after a slight delay
            setTimeout(() => {
                navigate("/applicant-dashboard");
            }, 2000);
        } catch (error: any) {
            console.error("Registration error:", error);
            if (error.name === "ZodError") {
                // Display the first validation error
                toast.error(`Validation Failed: ${error.errors[0].message}`);
            } else {
                toast.error(error.message || "Registration failed. Please check your details and try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-primary mb-2">RILogistics 🚚</h1>
                    <p className="text-xl text-muted-foreground">Franchise Partner Registration</p>
                </div>
                {/*  */}
                <Card>
                    <CardHeader>
                        <CardTitle>Application Form</CardTitle>
                        <CardDescription>
                            Fill in your details to apply for a RILogistics partnership
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Personal Information */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold border-b pb-2">Personal & Account Information</h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="fullName">Full Name *</Label>
                                        <Input
                                            id="fullName"
                                            value={formData.fullName}
                                            onChange={handleInputChange}
                                            required
                                            maxLength={100}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="email">Email *</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            required
                                            maxLength={255}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="mobile">Mobile Number *</Label>
                                        <Input
                                            id="mobile"
                                            type="tel"
                                            value={formData.mobile}
                                            onChange={handleInputChange}
                                            placeholder="+919876543210"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="alternateMobile">Alternate Mobile</Label>
                                        <Input
                                            id="alternateMobile"
                                            type="tel"
                                            value={formData.alternateMobile}
                                            onChange={handleInputChange}
                                            placeholder="+919876543211"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <Label htmlFor="address">Residential Address *</Label>
                                        <Textarea
                                            id="address"
                                            value={formData.address}
                                            onChange={handleInputChange}
                                            required
                                            maxLength={500}
                                            rows={3}
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <Label htmlFor="password">Create Password *</Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            required
                                            minLength={8}
                                            maxLength={100}
                                        />
                                    </div>
                                </div>
                            </div>

                            <hr className="my-6"/>

                            {/* Business Details */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold border-b pb-2">Business Details</h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="franchiseType">Franchise Type *</Label>
                                        <Select
                                            value={formData.franchiseType}
                                            onValueChange={handleSelectChange}
                                            required
                                        >
                                            <SelectTrigger>
                                                {/* Fix: Display placeholder when value is an empty string */}
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="fleet_owner">Fleet Owner Partner</SelectItem>
                                                <SelectItem value="franchise_partner">Franchise Partner</SelectItem>
                                                <SelectItem value="delivery_agent">Delivery Agent</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="businessName">Business Name</Label>
                                        <Input
                                            id="businessName"
                                            value={formData.businessName}
                                            onChange={handleInputChange}
                                            maxLength={200}
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <Label htmlFor="businessAddress">Business Address</Label>
                                        <Textarea
                                            id="businessAddress"
                                            value={formData.businessAddress}
                                            onChange={handleInputChange}
                                            maxLength={500}
                                            rows={2}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="yearsOfExperience">Years of Logistics Experience</Label>
                                        <Input
                                            id="yearsOfExperience"
                                            type="number"
                                            min="0"
                                            max="50"
                                            // Fix: Input field must use the string state value
                                            value={formData.yearsOfExperience} 
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="flex items-center space-x-2 pt-8">
                                        <input
                                            type="checkbox"
                                            id="previousLogisticsExperience"
                                            checked={formData.previousLogisticsExperience}
                                            onChange={handleInputChange}
                                            className="h-4 w-4"
                                        />
                                        <Label htmlFor="previousLogisticsExperience">Worked with a logistics company before?</Label>
                                    </div>
                                    {formData.previousLogisticsExperience && (
                                        <div className="md:col-span-2">
                                            <Label htmlFor="previousLogisticsDetails">Previous Experience Details</Label>
                                            <Textarea
                                                id="previousLogisticsDetails"
                                                value={formData.previousLogisticsDetails}
                                                onChange={handleInputChange}
                                                maxLength={500}
                                                rows={2}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <hr className="my-6"/>

                            {/* Service Expectations */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold border-b pb-2">Service Expectations</h3>
                                <div className="grid gap-4">
                                    <div>
                                        <Label htmlFor="expectedMonthlyVolume">Expected Monthly Volume/Bookings</Label>
                                        <Input
                                            id="expectedMonthlyVolume"
                                            value={formData.expectedMonthlyVolume}
                                            onChange={handleInputChange}
                                            placeholder="e.g., 50 shipments per month"
                                            maxLength={200}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="serviceDescription">How will you use the RILogistics platform?</Label>
                                        <Textarea
                                            id="serviceDescription"
                                            value={formData.serviceDescription}
                                            onChange={handleInputChange}
                                            placeholder="Describe the services you plan to provide, e.g., 'Last-mile delivery in South Delhi'..."
                                            maxLength={1000}
                                            rows={3}
                                        />
                                    </div>
                                </div>
                            </div>

                            <Button type="submit" className="w-full" size="lg" disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Submit Application
                            </Button>

                            <p className="text-sm text-center text-muted-foreground">
                                Already have an account?{" "}
                                <Button
                                    variant="link"
                                    className="p-0"
                                    onClick={() => navigate("/auth")}
                                    type="button"
                                >
                                    Sign In
                                </Button>
                            </p>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Register;