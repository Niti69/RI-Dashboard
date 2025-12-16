import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Applications from "./pages/Applications";
import Staff from "./pages/Staff";
import KycQueue from "./pages/KycQueue";
import FieldQueue from "./pages/FieldQueue";
import Analytics from "./pages/Analytics";
import NotFound from "./pages/NotFound";
import Register from "./pages/Register";
import Auth from "./pages/Auth";
import DocumentVerification from "./pages/DocumentVerification";
import TeleVerification from "./pages/TeleVerification";
import KycApproval from "./pages/KycApproval";
import FieldVerificationQueue from "./pages/FieldVerificationQueue";
import FieldVerificationForm from "./pages/FieldVerificationForm";
import AdminReviewQueue from "./pages/AdminReviewQueue";
import AdminReview from "./pages/AdminReview";
import TeleQueue from "./pages/TeleQueue";
import FinalKYCQueue from "./pages/FinalKYCQueue";
import SetPassword from "./pages/SetPassword";
import Profile from "./pages/Profile";

import { StaffAuthProvider } from "@/context/StaffAuthContext";
import ProtectedRoute from "@/lib/ProtectedRoute";

const queryClient = new QueryClient();

// 👇 Roles that can access KYC / verification flows
const KYC_ALLOWED_ROLES = [
  "KYC_STAFF",
  "TELE_VERIFICATION",
  "FIELD_RM",
  "SUPPORT",
];

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />

      <BrowserRouter>
        <StaffAuthProvider>
          <Routes>

            {/* ===== PUBLIC ROUTES ===== */}
            <Route path="/auth" element={<Auth />} />
            <Route path="/register" element={<Register />} />
            <Route path="/set-password/:token" element={<SetPassword />} />

            {/* ===== PROTECTED ROOT ===== */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />

              <Route path="profile/:id" element={<Profile />} />

              {/* 🔐 ADMIN / SUPER_ADMIN ONLY (auto allowed) */}
              <Route path="staff" element={<Staff />} />          
              <Route path="admin-review-queue" element={<AdminReviewQueue />} />
              <Route path="admin-review/:id" element={<AdminReview />} />

              {/* 🟡 KYC + VERIFICATION ROUTES */}
              <Route
                path="kyc-queue"
                element={
                  <ProtectedRoute allowedRoles={KYC_ALLOWED_ROLES}>
                    <KycQueue />
                  </ProtectedRoute>
                }
              />

               <Route path="analytics"  element={
                  <ProtectedRoute allowedRoles={KYC_ALLOWED_ROLES}>
                    <Analytics/>
                  </ProtectedRoute>
                } />
                <Route path="applications"  element={
                  <ProtectedRoute allowedRoles={KYC_ALLOWED_ROLES}>
                    <Applications/>
                  </ProtectedRoute>
                } />
                
              <Route
                path="document-verification/:id"
                element={
                  <ProtectedRoute allowedRoles={KYC_ALLOWED_ROLES}>
                    <DocumentVerification />
                  </ProtectedRoute>
                }
              />

              <Route
                path="tele-queue"
                element={
                  <ProtectedRoute allowedRoles={KYC_ALLOWED_ROLES}>
                    <TeleQueue />
                  </ProtectedRoute>
                }
              />

              <Route
                path="tele-verification/:id"
                element={
                  <ProtectedRoute allowedRoles={KYC_ALLOWED_ROLES}>
                    <TeleVerification />
                  </ProtectedRoute>
                }
              />

              <Route
                path="kyc-approval"
                element={
                  <ProtectedRoute allowedRoles={KYC_ALLOWED_ROLES}>
                    <FinalKYCQueue />
                  </ProtectedRoute>
                }
              />

              <Route
                path="kyc-approval/:id"
                element={
                  <ProtectedRoute allowedRoles={KYC_ALLOWED_ROLES}>
                    <KycApproval />
                  </ProtectedRoute>
                }
              />

              <Route
                path="field-verification-queue"
                element={
                  <ProtectedRoute allowedRoles={KYC_ALLOWED_ROLES}>
                    <FieldVerificationQueue />
                  </ProtectedRoute>
                }
              />

              <Route
                path="field-verification/:id"
                element={
                  <ProtectedRoute allowedRoles={KYC_ALLOWED_ROLES}>
                    <FieldVerificationForm />
                  </ProtectedRoute>
                }
              />

              <Route
                path="field-queue"
                element={
                  <ProtectedRoute allowedRoles={KYC_ALLOWED_ROLES}>
                    <FieldQueue />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* ===== FALLBACK ===== */}
            <Route path="*" element={<NotFound />} />

          </Routes>
        </StaffAuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;