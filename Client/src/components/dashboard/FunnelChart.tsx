import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const funnelData = [
  { step: "Step 1", label: "Document Verification Pending", count: 45, color: "bg-primary" },
  { step: "Step 2", label: "Tele-Verification Pending", count: 38, color: "bg-primary" },
  { step: "Step 3", label: "KYC Completed (Field Pending)", count: 32, color: "bg-primary" },
  { step: "Step 4/5", label: "Field Verification Running", count: 28, color: "bg-warning" },
  { step: "Step 6", label: "Under Admin Review", count: 22, color: "bg-warning" },
  { step: "Step 7", label: "Activated Users", count: 156, color: "bg-success" },
];

export const FunnelChart = () => {
  const maxCount = Math.max(...funnelData.map(d => d.count));

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Application Pipeline - Step-wise Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {funnelData.map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">{item.step}</span>
                  <span className="text-muted-foreground">{item.label}</span>
                </div>
                <span className="font-semibold">{item.count}</span>
              </div>
              <div className="h-8 w-full overflow-hidden rounded-lg bg-muted">
                <div
                  className={`h-full ${item.color} transition-all duration-500`}
                  style={{ width: `${(item.count / maxCount) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
