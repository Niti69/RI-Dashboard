import { useEffect, useState } from "react";
// FIX: Added Loader2 import
import { FileText, CheckCircle, XCircle, Clock, AlertTriangle, Users, Loader2 } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
// Assuming these are separate components imported from the dashboard folder
import { FunnelChart } from "@/components/dashboard/FunnelChart";
import { FeeCollectionCard } from "@/components/dashboard/FeeCollectionCard"; 

// The original StatsResponse type, kept for consistency with the old API call structure
type StatsResponse = {
    fleet: {
        total: number;
        today: number;
        pending: number;
        verified: number;
        rejected: number;
    };
    franchise: {
        total: number;
        today: number;
        pending: number;
        verified: number;
        rejected: number;
    };
};

// State structure to hold all dashboard metrics
type DashboardMetrics = {
    // Top Row Metrics (New Frontend)
    newApplicationsToday: number;
    approvedToday: number;
    rejectedToday: number;
    pendingApplications: number;
    overSlaPending: number;
    
    // Overview Metrics (Old Frontend)
    totalApplications: number;
    inVerification: number;
    totalApproved: number;
};

const Dashboard = () => {
    // Initial state with a loading/default view
    const [metrics, setMetrics] = useState<DashboardMetrics>({
        newApplicationsToday: 0,
        approvedToday: 0,
        rejectedToday: 0,
        pendingApplications: 0,
        overSlaPending: 0,
        totalApplications: 0,
        inVerification: 0,
        totalApproved: 0,
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        setIsLoading(true);
        try {
            // **NOTE**: Keeping the original API call structure.
            const res = await fetch("https://ri-dashboard-tl5e.onrender.com/api/dashboard-stats");
            const json = await res.json();

            if (!json.success) {
                console.error("API call failed:", json.message);
                setIsLoading(false);
                return;
            }

            const data: StatsResponse = json.data;

            // **MOCKING NEW METRICS**: Calculates/mocks metrics using available data structure.
            const totalPending = data.fleet.pending + data.franchise.pending;
            const totalVerified = data.fleet.verified + data.franchise.verified;
            const totalRejected = data.fleet.rejected + data.franchise.rejected;
            const totalToday = data.fleet.today + data.franchise.today;
            const totalApplications = data.fleet.total + data.franchise.total;
            
            setMetrics({
                // New Metrics (Using total applications/today's apps for simulation)
                newApplicationsToday: totalToday,
                approvedToday: Math.floor(totalToday * 0.75), // Mock: 75% of today's apps approved
                rejectedToday: Math.floor(totalToday * 0.15), // Mock: 15% of today's apps rejected
                pendingApplications: totalPending,
                overSlaPending: Math.floor(totalPending * 0.15), // Mock: 15% of pending are over SLA
                
                // Old Metrics (Mapped from old API)
                totalApplications: totalApplications,
                inVerification: totalVerified,
                totalApproved: totalApplications - totalPending - totalVerified - totalRejected, // Mock Approved: Total - other states
            });
        } catch (error) {
            console.error("Error fetching dashboard stats:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Helper to render value or a dash if loading
    const displayValue = (value: number) => isLoading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
    ) : value.toLocaleString();


    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">Daily overview and key metrics</p>
            </div>

            {/* Application Flow Metrics (New Frontend) */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <StatCard
                    title="New Applications Today"
                    value={displayValue(metrics.newApplicationsToday)}
                    icon={FileText}
                    trend={{ value: "12%", isPositive: true }} // Trend data is hardcoded from new component
                    variant="default"
                    isLoading={isLoading}
                />
                <StatCard
                    title="Approved Today"
                    value={displayValue(metrics.approvedToday)}
                    icon={CheckCircle}
                    trend={{ value: "8%", isPositive: true }}
                    variant="success"
                    isLoading={isLoading}
                />
                <StatCard
                    title="Rejected Today"
                    value={displayValue(metrics.rejectedToday)}
                    icon={XCircle}
                    variant="destructive"
                    isLoading={isLoading}
                />
                <StatCard
                    title="Pending Applications"
                    value={displayValue(metrics.pendingApplications)}
                    icon={Clock}
                    variant="warning"
                    isLoading={isLoading}
                />
                <StatCard
                    title="Over-SLA Pending"
                    value={displayValue(metrics.overSlaPending)}
                    icon={AlertTriangle}
                    variant="destructive"
                    isLoading={isLoading}
                />
            </div>

            {/* --- */}

            {/* Total Applications Overview (Old Frontend) */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Total Applications" value={displayValue(metrics.totalApplications)} icon={FileText} variant="default" isLoading={isLoading} />
                <StatCard title="Pending KYC" value={displayValue(metrics.pendingApplications)} icon={Clock} variant="warning" isLoading={isLoading} />
                <StatCard title="In Verification" value={displayValue(metrics.inVerification)} icon={Users} variant="default" isLoading={isLoading} />
                <StatCard title="Total Approved" value={displayValue(metrics.totalApproved)} icon={CheckCircle} variant="success" isLoading={isLoading} />
            </div>

            {/* --- */}

            {/* Charts and Cards (New Frontend) */}
            <div className="grid gap-6 md:grid-cols-3">
                {/* These components are assumed to be complex and are left as placeholders */}
                <FunnelChart /> 
                <FeeCollectionCard />
            </div>
        </div>
    );
};

export default Dashboard;
