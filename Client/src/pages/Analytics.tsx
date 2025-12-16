import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Download, TrendingUp, TrendingDown } from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const applicationTrendData = [
  { date: "Nov 20", applications: 12, approved: 8, rejected: 2 },
  { date: "Nov 21", applications: 15, approved: 10, rejected: 3 },
  { date: "Nov 22", applications: 18, approved: 12, rejected: 4 },
  { date: "Nov 23", applications: 14, approved: 9, rejected: 3 },
  { date: "Nov 24", applications: 20, approved: 15, rejected: 2 },
  { date: "Nov 25", applications: 22, approved: 16, rejected: 4 },
  { date: "Nov 26", applications: 19, approved: 14, rejected: 3 },
];

const partnerTypeData = [
  { name: "Fleet Owner", value: 45, color: "#6366f1" },
  { name: "Franchise Partner", value: 35, color: "#8b5cf6" },
  { name: "Booking Partner", value: 20, color: "#a855f7" },
];

const rejectionReasonsData = [
  { reason: "Incomplete Documents", count: 15 },
  { reason: "Address Mismatch", count: 12 },
  { reason: "Failed Verification", count: 8 },
  { reason: "Duplicate Application", count: 5 },
  { reason: "Other", count: 3 },
];

const staffPerformanceData = [
  { name: "Priya Sharma", handled: 45, approved: 38, avgTime: "2.3" },
  { name: "Rajesh Kumar", handled: 42, approved: 35, avgTime: "2.8" },
  { name: "Amit Patel", handled: 38, approved: 32, avgTime: "3.1" },
  { name: "Neha Singh", handled: 35, approved: 30, avgTime: "2.5" },
];

const feeCollectionData = [
  { date: "Nov 20", amount: 45000 },
  { date: "Nov 21", amount: 52000 },
  { date: "Nov 22", amount: 48000 },
  { date: "Nov 23", amount: 60000 },
  { date: "Nov 24", amount: 75000 },
  { date: "Nov 25", amount: 68000 },
  { date: "Nov 26", amount: 82000 },
];

const Analytics = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics & Reports</h1>
          <p className="text-muted-foreground">Comprehensive insights and performance metrics</p>
        </div>
        <div className="flex gap-2">
          <Select defaultValue="7days">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Time Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Applications</CardDescription>
            <CardTitle className="text-3xl">120</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-success">
              <TrendingUp className="mr-1 h-4 w-4" />
              <span>+12% from last week</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Approval Rate</CardDescription>
            <CardTitle className="text-3xl">73.5%</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-success">
              <TrendingUp className="mr-1 h-4 w-4" />
              <span>+5% from last week</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Avg. Processing Time</CardDescription>
            <CardTitle className="text-3xl">2.8d</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-destructive">
              <TrendingDown className="mr-1 h-4 w-4" />
              <span>+0.3d from last week</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Fee Collection</CardDescription>
            <CardTitle className="text-3xl">₹4.3L</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-success">
              <TrendingUp className="mr-1 h-4 w-4" />
              <span>+18% from last week</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="funnel">Funnel Analysis</TabsTrigger>
          <TabsTrigger value="staff">Staff Performance</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Application Trends</CardTitle>
                <CardDescription>Daily application submissions and outcomes</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={applicationTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="applications" stroke="#6366f1" strokeWidth={2} />
                    <Line type="monotone" dataKey="approved" stroke="#10b981" strokeWidth={2} />
                    <Line type="monotone" dataKey="rejected" stroke="#ef4444" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Partner Type Distribution</CardTitle>
                <CardDescription>Breakdown by partner category</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={partnerTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {partnerTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Rejection Reasons</CardTitle>
                <CardDescription>Common reasons for application rejection</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={rejectionReasonsData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="reason" type="category" width={150} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Fee Collection Trend</CardTitle>
                <CardDescription>Daily fee collection over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={feeCollectionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                    <Bar dataKey="amount" fill="#6366f1" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="funnel" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Application Funnel</CardTitle>
              <CardDescription>Step-by-step conversion rates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { step: "Applications Submitted", count: 120, percent: 100 },
                  { step: "KYC Completed", count: 98, percent: 82 },
                  { step: "Field Verification Done", count: 85, percent: 71 },
                  { step: "Admin Review Completed", count: 75, percent: 63 },
                  { step: "Approved & Activated", count: 68, percent: 57 },
                ].map((item, index) => (
                  <div key={index}>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">{item.step}</span>
                      <span className="text-muted-foreground">
                        {item.count} ({item.percent}%)
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3">
                      <div
                        className="bg-primary rounded-full h-3 transition-all"
                        style={{ width: `${item.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="staff" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Staff Performance Metrics</CardTitle>
              <CardDescription>Individual staff productivity and efficiency</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {staffPerformanceData.map((staff, index) => (
                  <div key={index} className="p-4 rounded-lg border border-border bg-muted/50">
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-semibold">{staff.name}</div>
                      <div className="text-sm text-muted-foreground">
                        Avg. Time: {staff.avgTime} days
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Total Handled</div>
                        <div className="text-xl font-bold mt-1">{staff.handled}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Approved</div>
                        <div className="text-xl font-bold mt-1 text-success">{staff.approved}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Approval Rate</div>
                        <div className="text-xl font-bold mt-1">
                          {((staff.approved / staff.handled) * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardDescription>Today's Collection</CardDescription>
                <CardTitle className="text-2xl">₹82,000</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">16 payments received</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardDescription>This Week</CardDescription>
                <CardTitle className="text-2xl">₹4,30,000</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">86 payments received</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardDescription>This Month</CardDescription>
                <CardTitle className="text-2xl">₹16,50,000</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">330 payments received</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Collection by Partner Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { type: "Fleet Owner", amount: 225000, count: 45, fee: 5000 },
                  { type: "Franchise Partner", amount: 350000, count: 35, fee: 10000 },
                  { type: "Booking Partner", amount: 75000, count: 25, fee: 3000 },
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/50">
                    <div>
                      <div className="font-semibold">{item.type}</div>
                      <div className="text-sm text-muted-foreground">
                        {item.count} applications × ₹{item.fee.toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-xl">₹{item.amount.toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;
