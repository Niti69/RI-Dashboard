import { 
  LayoutDashboard,
  Users,
  FolderOpen,
  ClipboardCheck,
  PhoneCall,
  MapPinCheck,
  BarChart3,
  ShieldCheck,
  CheckCircle,       // ✅ Added icon for Final KYC Approval
} from "lucide-react";

import { NavLink } from "./NavLink";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },

  { name: "Applications", href: "/applications", icon: FolderOpen },

  { name: "KYC Queue", href: "/kyc-queue", icon: ClipboardCheck },

  { name: "Tele Verification", href: "/tele-queue", icon: PhoneCall },

  // ✅ NEW TAB ADDED HERE
  { name: "Final KYC Approval", href: "/kyc-approval", icon: CheckCircle },

  { name: "Field Verification", href: "/field-verification-queue", icon: MapPinCheck },

  { name: "Admin Review", href: "/admin-review-queue", icon: ShieldCheck },

  { name: "Staff Management", href: "/staff", icon: Users },

  { name: "Analytics", href: "/analytics", icon: BarChart3 },
];

export const Sidebar = () => {
  return (
    <aside className="fixed left-0 top-0 h-screen w-[280px] border-r border-border bg-card">
      <div className="flex h-16 items-center border-b border-border px-6">
        <h1 className="text-xl font-bold text-primary">RILogistics</h1>
      </div>

      <nav className="space-y-1 p-4">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            activeClassName="bg-accent text-accent-foreground"
          >
            <item.icon className="h-5 w-5" />
            {item.name}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};