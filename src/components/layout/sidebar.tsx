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
  Mail,
  Package,
  Calendar,
  CalendarDays,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { getHotelInfo, type HotelInfo } from "@/lib/hotel-info";
import { User as UserType } from "@/types/user";

type NavItem = {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: string[];
  children?: { name: string; href: string }[];
  /** Show a separator line before this item to visually group the menu */
  separatorBefore?: boolean;
};

const allNavigation: NavItem[] = [
  // Group 1: Dashboard, Bookings, Guests
  { name: "Dashboard", href: "/", icon: LayoutDashboard, roles: ["admin", "super_admin", "manager", "staff", "viewer"] },
  { name: "Bookings", href: "/bookings", icon: Calendar, roles: ["admin", "super_admin", "manager", "staff", "viewer"] },
  { name: "Booking Calendar", href: "/bookings/calendar", icon: CalendarDays, roles: ["admin", "super_admin", "manager", "staff", "viewer"] },
  { name: "Guests", href: "/settings/guests", icon: Users, roles: ["admin", "super_admin", "manager", "staff", "viewer"] },
  { name: "Travel Companies", href: "/settings/travel-companies", icon: Briefcase, roles: ["admin", "super_admin", "manager", "staff", "viewer"] },
  // Group 2: Invoices, Payments
  { name: "Invoices", href: "/invoices", icon: FileText, roles: ["admin", "super_admin", "manager", "staff", "viewer"], separatorBefore: true },
  { name: "Create Invoice", href: "/invoices/new", icon: PlusCircle, roles: ["admin", "super_admin", "manager", "staff"] },
  { name: "Payments", href: "/payments", icon: CreditCard, roles: ["admin", "super_admin", "manager", "viewer"] },
  { name: "Invoice Items", href: "/settings/invoice-items", icon: Package, roles: ["admin", "super_admin", "manager", "staff", "viewer"] },
  // Group 3: Reports, Activity Logs
  { name: "Reports", href: "/reports", icon: BarChart3, roles: ["admin", "super_admin", "manager", "viewer"], separatorBefore: true },
  { name: "Activity Logs", href: "/settings/activity-logs", icon: History, roles: ["admin", "super_admin"] },
  // Group 4: Settings (Hotel Info, Bank Accounts, Users, Email Log)
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
    roles: ["admin", "super_admin"],
    separatorBefore: true,
    children: [
      { name: "Hotel Info", href: "/settings" },
      { name: "Bank Accounts", href: "/settings/bank-accounts" },
      { name: "Users", href: "/settings/users" },
      { name: "Secure Edit PINs", href: "/settings/secure-edit-pins" },
      { name: "Email Log", href: "/settings/email-logs" },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [hotelInfo, setHotelInfo] = useState<HotelInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCurrentUser();
    loadHotelInfo();
  }, []);

  const loadHotelInfo = async () => {
    const info = await getHotelInfo();
    setHotelInfo(info);
  };

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

  const settingsChildPaths = ["/settings", "/settings/bank-accounts", "/settings/users", "/settings/secure-edit-pins", "/settings/email-logs"];
  const isSettingsPath = settingsChildPaths.includes(pathname);
  const [settingsOpen, setSettingsOpen] = useState(isSettingsPath);

  useEffect(() => {
    if (isSettingsPath) setSettingsOpen(true);
  }, [isSettingsPath]);

  return (
    <div className="flex h-full w-64 flex-col border-r bg-card">
      <div className="flex flex-col items-center justify-center border-b px-4 py-4">
        {hotelInfo && (
          <>
            <Image
              src={hotelInfo.logoPath || "/images/rajini-logo-flat-color.png"}
              alt={hotelInfo.name}
              width={120}
              height={50}
              className="h-auto mb-2"
              priority
            />
            <h1 className="text-sm font-bold text-center leading-tight">{hotelInfo.name}</h1>
          </>
        )}
        <p className="text-xs text-muted-foreground text-center mt-1">Invoice System</p>
        <p className="text-xs text-muted-foreground text-center mt-1">
          Powered by <span className="font-semibold">Phoenix Global Solutions</span>
        </p>
      </div>
      <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
        {navigation.map((item) => {
          const sep = item.separatorBefore ? (
            <div key={`sep-${item.name}`} className="my-2 border-t border-border" aria-hidden />
          ) : null;
          if (item.children) {
            const isParentActive = isSettingsPath;
            return (
              <div key={item.name} className="space-y-0.5">
                {sep}
                <button
                  type="button"
                  onClick={() => setSettingsOpen((o) => !o)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isParentActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  <span className="flex-1 text-left">{item.name}</span>
                  {settingsOpen ? (
                    <ChevronDown className="h-4 w-4 flex-shrink-0" />
                  ) : (
                    <ChevronRight className="h-4 w-4 flex-shrink-0" />
                  )}
                </button>
                {settingsOpen && (
                  <div className="ml-4 mt-0.5 space-y-0.5 border-l border-border pl-2">
                    {item.children.map((child) => {
                      const isChildActive = pathname === child.href;
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={cn(
                            "flex items-center rounded-md px-2 py-1.5 text-sm transition-colors",
                            isChildActive
                              ? "font-medium text-primary bg-primary/10"
                              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                          )}
                        >
                          {child.name}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }
          const isActive = pathname === item.href;
          return (
            <div key={item.name}>
              {sep}
              <Link
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
            </div>
          );
        })}
      </nav>
    </div>
  );
}
