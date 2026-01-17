"use client";

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
} from "lucide-react";
import { hotelInfo } from "@/lib/hotel-info";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Invoices", href: "/invoices", icon: FileText },
  { name: "Create Invoice", href: "/invoices/new", icon: PlusCircle },
  { name: "Payments", href: "/payments", icon: CreditCard },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Guests", href: "/settings/guests", icon: Users },
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Bank Accounts", href: "/settings/bank-accounts", icon: Building2 },
  { name: "Users", href: "/settings/users", icon: Users },
];

export function Sidebar() {
  const pathname = usePathname();

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
