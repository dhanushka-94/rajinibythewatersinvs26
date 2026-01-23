"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, DollarSign, Clock, CheckCircle, AlertCircle, Send, Edit, XCircle, TrendingUp, Plus } from "lucide-react";
import { getInvoices } from "@/lib/invoices";
import { formatCurrency } from "@/lib/currency";
import { formatDateSL } from "@/lib/date-sl";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Invoice } from "@/types/invoice";
import { LiveClock } from "@/components/live-clock";

export default function Dashboard() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    const loadInvoices = async () => {
      const data = await getInvoices();
      setInvoices(data);
    };
    loadInvoices();
  }, []);

  const totalInvoices = invoices.length;
  const paidInvoices = invoices.filter((inv) => inv.status === "paid").length;
  const partiallyPaidInvoices = invoices.filter((inv) => inv.status === "partially_paid").length;
  const pendingInvoices = invoices.filter((inv) => inv.status === "pending").length;
  const sentInvoices = invoices.filter((inv) => inv.status === "sent").length;
  const draftInvoices = invoices.filter((inv) => inv.status === "draft").length;
  const cancelledInvoices = invoices.filter((inv) => inv.status === "cancelled").length;
  const paidInvoicesList = invoices.filter((inv) => inv.status === "paid");
  
  // Calculate due invoices
  const calculateRemainingBalance = (invoice: Invoice): number => {
    const totalPaid = (invoice.payments || []).reduce((sum, p) => sum + p.amount, 0);
    return invoice.total - totalPaid;
  };
  
  const dueInvoices = invoices.filter((inv) => {
    const remainingBalance = calculateRemainingBalance(inv);
    return remainingBalance > 0 && inv.status !== "paid" && inv.status !== "cancelled";
  });
  
  const usdDueAmount = dueInvoices
    .filter((inv) => inv.currency === "USD")
    .reduce((sum, inv) => sum + calculateRemainingBalance(inv), 0);
  const lkrDueAmount = dueInvoices
    .filter((inv) => inv.currency === "LKR")
    .reduce((sum, inv) => sum + calculateRemainingBalance(inv), 0);
  
  // Calculate revenue by currency
  const usdRevenue = paidInvoicesList
    .filter((inv) => inv.currency === "USD")
    .reduce((sum, inv) => sum + inv.total, 0);
  const lkrRevenue = paidInvoicesList
    .filter((inv) => inv.currency === "LKR")
    .reduce((sum, inv) => sum + inv.total, 0);

  const stats = [
    {
      title: "Total Invoices",
      value: totalInvoices.toString(),
      icon: FileText,
      description: "All time invoices",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Paid Invoices",
      value: paidInvoices.toString(),
      icon: CheckCircle,
      description: "Successfully paid",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Due Invoices",
      value: dueInvoices.length.toString(),
      icon: AlertCircle,
      description: "Outstanding balance",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Total Revenue",
      value: formatCurrency(usdRevenue + lkrRevenue, "USD"),
      icon: TrendingUp,
      description: "USD + LKR combined",
      color: "text-[#D4AF37]",
      bgColor: "bg-yellow-50",
    },
  ];

  const recentInvoices = invoices.slice(0, 5);

  const getStatusBadge = (status: string) => {
    const statusStyles: Record<string, string> = {
      paid: "bg-green-100 text-green-800 border-green-200",
      partially_paid: "bg-amber-100 text-amber-800 border-amber-200",
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      sent: "bg-blue-100 text-blue-800 border-blue-200",
      draft: "bg-gray-100 text-gray-800 border-gray-200",
      cancelled: "bg-red-100 text-red-800 border-red-200",
    };
    
    const statusLabels: Record<string, string> = {
      partially_paid: "Partially Paid",
    };

    return (
      <Badge variant="outline" className={statusStyles[status] || "bg-gray-100 text-gray-800"}>
        {statusLabels[status] || status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ')}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of invoice management for Rajini by The Waters
          </p>
        </div>
        <div className="flex items-center gap-4">
          <LiveClock />
          <Link href="/invoices/new">
            <Button style={{ backgroundColor: "#D4AF37", color: "#000" }}>
              <Plus className="mr-2 h-4 w-4" />
              Create New Invoice
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-l-4" style={{ borderLeftColor: stat.color.replace('text-', '').includes('blue') ? '#3b82f6' : stat.color.replace('text-', '').includes('green') ? '#16a34a' : stat.color.replace('text-', '').includes('orange') ? '#ea580c' : '#D4AF37' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue and Status Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" style={{ color: "#D4AF37" }} />
              Revenue by Currency
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-sm font-medium">USD Revenue</span>
                <span className="text-lg font-bold text-green-700">{formatCurrency(usdRevenue, "USD")}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium">LKR Revenue</span>
                <span className="text-lg font-bold text-blue-700">{formatCurrency(lkrRevenue, "LKR")}</span>
              </div>
              <div className="pt-2 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total Paid Invoices</span>
                  <span className="text-sm font-semibold">{paidInvoices}</span>
                </div>
                <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                  <span>USD: {paidInvoicesList.filter((inv) => inv.currency === "USD").length}</span>
                  <span>LKR: {paidInvoicesList.filter((inv) => inv.currency === "LKR").length}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {dueInvoices.length > 0 && (
          <Card className="border-orange-200 bg-orange-50/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-900">
                <AlertCircle className="h-5 w-5" />
                Due Invoices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="text-3xl font-bold text-orange-900">{dueInvoices.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">Invoices with outstanding balance</p>
                </div>
                <div className="pt-2 border-t border-orange-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">USD Due</span>
                    <span className="text-sm font-bold text-orange-900">{formatCurrency(usdDueAmount, "USD")}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">LKR Due</span>
                    <span className="text-sm font-bold text-orange-900">{formatCurrency(lkrDueAmount, "LKR")}</span>
                  </div>
                </div>
                <Link href="/invoices?status=due">
                  <Button variant="outline" size="sm" className="w-full mt-2">
                    View Due Invoices
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" style={{ color: "#D4AF37" }} />
              Status Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Paid</span>
                <span className="text-sm font-semibold text-green-600">{paidInvoices}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Partially Paid</span>
                <span className="text-sm font-semibold text-amber-600">{partiallyPaidInvoices}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Pending</span>
                <span className="text-sm font-semibold text-yellow-600">{pendingInvoices}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Sent</span>
                <span className="text-sm font-semibold text-blue-600">{sentInvoices}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Draft</span>
                <span className="text-sm font-semibold text-gray-600">{draftInvoices}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Cancelled</span>
                <span className="text-sm font-semibold text-red-600">{cancelledInvoices}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Invoices</CardTitle>
              <Link href="/invoices">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentInvoices.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No invoices yet</p>
              ) : (
                recentInvoices.map((invoice) => (
                  <Link key={invoice.id} href={`/invoices/${invoice.id}`}>
                    <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors cursor-pointer">
                      <div className="space-y-1 flex-1">
                        <div className="font-medium">{invoice.invoiceNumber}</div>
                        <div className="text-sm text-muted-foreground">
                          {invoice.guest.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatDateSL(invoice.checkIn)} - {formatDateSL(invoice.checkOut)}
                        </div>
                      </div>
                      <div className="text-right space-y-1 ml-4">
                        <div className="font-semibold">{formatCurrency(invoice.total, invoice.currency)}</div>
                        <div>{getStatusBadge(invoice.status)}</div>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/invoices/new">
                <Button className="w-full" style={{ backgroundColor: "#D4AF37", color: "#000" }}>
                  <Plus className="mr-2 h-4 w-4" />
                  New Invoice
                </Button>
              </Link>
              <Link href="/invoices">
                <Button variant="outline" className="w-full">
                  <FileText className="mr-2 h-4 w-4" />
                  All Invoices
                </Button>
              </Link>
              <Link href="/reports">
                <Button variant="outline" className="w-full">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Reports
                </Button>
              </Link>
              <Link href="/payments">
                <Button variant="outline" className="w-full">
                  <DollarSign className="mr-2 h-4 w-4" />
                  Payments
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
