import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IndianRupee } from "lucide-react";

const feeData = [
  { period: "Today", amount: "₹45,000", change: "+12%" },
  { period: "This Week", amount: "₹2,85,000", change: "+8%" },
  { period: "This Month", amount: "₹8,50,000", change: "+15%" },
];

const partnerTypes = [
  { type: "Fleet Owner", amount: "₹3,20,000", percentage: 38 },
  { type: "Franchise Partner", amount: "₹4,10,000", percentage: 48 },
  { type: "Booking Partner", amount: "₹1,20,000", percentage: 14 },
];

export const FeeCollectionCard = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IndianRupee className="h-5 w-5" />
          Fee Collection Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            {feeData.map((item, index) => (
              <div key={index} className="space-y-1">
                <p className="text-xs text-muted-foreground">{item.period}</p>
                <p className="text-lg font-bold">{item.amount}</p>
                <p className="text-xs text-success">{item.change}</p>
              </div>
            ))}
          </div>
          <div className="space-y-3 border-t border-border pt-4">
            <p className="text-sm font-medium">Breakdown by Partner Type</p>
            {partnerTypes.map((partner, index) => (
              <div key={index} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{partner.type}</span>
                  <span className="font-semibold">{partner.amount}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${partner.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
