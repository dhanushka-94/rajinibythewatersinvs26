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
  Users,
  BarChart3,
  CreditCard,
  Briefcase,
  History,
  Mail,
  Package,
  Calendar,
  CalendarDays,
  BedDouble,
  Tag,
  Wallet,
} from "lucide-react";
import { getHotelInfo, type HotelInfo } from "@/lib/hotel-info";
import { User as UserType } from "@/types/user";

type NavLinkItem = {
  type: "link";
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: string[];
};

type NavItem = NavLinkItem;

type NavGroup = {
  label: string;
  items: NavItem[];
};

const allNavigation: NavGroup[] = [
  {
    label: "Front Desk & Operations",
    items: [
      { type: "link", name: "Room Status", href: "/rooms", icon: BedDouble, roles: ["admin", "super_admin", "manager", "staff", "viewer"] },
      { type: "link", name: "Booking Calendar", href: "/bookings/calendar", icon: CalendarDays, roles: ["admin", "super_admin", "manager", "staff", "viewer"] },
      { type: "link", name: "Bookings", href: "/bookings", icon: Calendar, roles: ["admin", "super_admin", "manager", "staff", "viewer"] },
      { type: "link", name: "Guests", href: "/settings/guests", icon: Users, roles: ["admin", "super_admin", "manager", "staff", "viewer"] },
      { type: "link", name: "Travel Companies", href: "/settings/travel-companies", icon: Briefcase, roles: ["admin", "super_admin", "manager", "staff", "viewer"] },
    ],
  },
  {
    label: "Billing & Finance",
    items: [
      { type: "link", name: "Invoices", href: "/invoices", icon: FileText, roles: ["admin", "super_admin", "manager", "staff", "viewer"] },
      { type: "link", name: "Create Invoice", href: "/invoices/new", icon: PlusCircle, roles: ["admin", "super_admin", "manager", "staff"] },
      { type: "link", name: "Payments", href: "/payments", icon: CreditCard, roles: ["admin", "super_admin", "manager", "viewer"] },
      { type: "link", name: "Invoice Items", href: "/settings/invoice-items", icon: Package, roles: ["admin", "super_admin", "manager", "staff", "viewer"] },
      { type: "link", name: "Bank Accounts", href: "/settings/bank-accounts", icon: Wallet, roles: ["admin", "super_admin"] },
    ],
  },
  {
    label: "Offers & Promotions",
    items: [
      { type: "link", name: "Offers", href: "/promotions/offers", icon: Tag, roles: ["admin", "super_admin", "manager"] },
      { type: "link", name: "Discounts", href: "/promotions/discounts", icon: Tag, roles: ["admin", "super_admin", "manager"] },
      { type: "link", name: "Coupon Codes", href: "/promotions/coupon-codes", icon: Tag, roles: ["admin", "super_admin", "manager"] },
    ],
  },
  {
    label: "Reports & Logs",
    items: [
      { type: "link", name: "Reports", href: "/reports", icon: BarChart3, roles: ["admin", "super_admin", "manager", "viewer"] },
      { type: "link", name: "Activity Logs", href: "/settings/activity-logs", icon: History, roles: ["admin", "super_admin"] },
      { type: "link", name: "Email Log", href: "/settings/email-logs", icon: Mail, roles: ["admin", "super_admin"] },
    ],
  },
  {
    label: "Hotel Setup & System",
    items: [
      { type: "link", name: "Hotel Info", href: "/settings", icon: Settings, roles: ["admin", "super_admin"] },
      { type: "link", name: "Hotel Rooms", href: "/settings/hotel-rooms", icon: Settings, roles: ["admin", "super_admin"] },
      { type: "link", name: "Users", href: "/settings/users", icon: Users, roles: ["admin", "super_admin"] },
      { type: "link", name: "Secure Edit PINs", href: "/settings/secure-edit-pins", icon: Settings, roles: ["admin", "super_admin"] },
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

  const visibleGroups = allNavigation.map((group) => ({
    ...group,
    items: group.items.filter((item) => currentUser && item.roles.includes(currentUser.role)),
  })).filter((group) => group.items.length > 0);

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
        {currentUser && (
          <Link
            href="/"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              pathname === "/"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <LayoutDashboard className="h-5 w-5" />
            Dashboard
          </Link>
        )}
        {visibleGroups.map((group) => (
          <div key={group.label} className="mt-5 first:mt-0 pt-4 first:pt-0 border-t border-border/60 first:border-t-0">
            <div className="mb-2 px-3 py-2 rounded-md bg-muted/60 border-l-2 border-[#D4AF37] text-xs font-bold uppercase tracking-wider text-foreground/90">
              {group.label}
            </div>
            <div className="space-y-0.5">
              {group.items.map((item) => {
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
            </div>
          </div>
        ))}
      </nav>
    </div>
  );
}
