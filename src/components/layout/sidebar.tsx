"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import Image from "next/image";
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  Settings,
  Building2,
  Users,
  BarChart3,
  CreditCard,
  Briefcase,
  History,
  Package,
} from "lucide-react";
import { hotelInfo } from "@/lib/hotel-info";
import { User as UserType } from "@/types/user";

const allNavigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard, roles: ["admin", "manager", "staff", "viewer"] },
  { name: "Invoices", href: "/invoices", icon: FileText, roles: ["admin", "manager", "staff", "viewer"] },
  { name: "Create Invoice", href: "/invoices/new", icon: PlusCircle, roles: ["admin", "manager", "staff"] },
  { name: "Payments", href: "/payments", icon: CreditCard, roles: ["admin", "manager", "viewer"] },
  { name: "Reports", href: "/reports", icon: BarChart3, roles: ["admin", "manager", "viewer"] },
  { name: "Guests", href: "/settings/guests", icon: Users, roles: ["admin", "manager", "staff", "viewer"] },
  { name: "Travel Companies", href: "/settings/travel-companies", icon: Briefcase, roles: ["admin", "manager", "staff", "viewer"] },
  { name: "Invoice Items", href: "/settings/invoice-items", icon: Package, roles: ["admin", "manager", "staff", "viewer"] },
  { name: "Activity Logs", href: "/settings/activity-logs", icon: History, roles: ["admin"] },
  { name: "Settings", href: "/settings", icon: Settings, roles: ["admin"] },
  { name: "Bank Accounts", href: "/settings/bank-accounts", icon: Building2, roles: ["admin", "manager", "staff", "viewer"] },
  { name: "Users", href: "/settings/users", icon: Users, roles: ["admin"] },
];

export function Sidebar() {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const response = await fetch("/api/auth/me");
      const data = await response.json();
      if (data.success) {
        setCurrentUser(data.user);
      }
    } catch (error) {
      console.error("Error loading current user:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter navigation based on user role
  const navigation = allNavigation.filter((item) => {
    if (!currentUser) return false;
    return item.roles.includes(currentUser.role);
  });

  return (
    <div className="flex h-full w-64 flex-col border-r bg-card">
      <div className="flex flex-col items-center justify-center border-b px-4 py-4">
        <Image
          src={hotelInfo.logoPath}
          alt={hotelInfo.name}
          width={120}
          height={50}
          className="h-auto mb-2"
          priority
        />
        <h1 className="text-sm font-bold text-center leading-tight">{hotelInfo.name}</h1>
        <p className="text-xs text-muted-foreground text-center mt-1">Invoice System</p>
        <p className="text-xs text-muted-foreground text-center mt-1">
          Powered by <span className="font-semibold">Phoenix Global Solutions</span>
        </p>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
