"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FileText,
  DollarSign,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Plus,
  RefreshCw,
  CalendarDays,
  Users,
  Wallet,
  LogIn,
  LogOut,
  UserCheck,
  Calendar,
} from "lucide-react";
import { getInvoices } from "@/lib/invoices";
import { getBookings } from "@/lib/bookings";
import { getGuests } from "@/lib/guests";
import { formatCurrency } from "@/lib/currency";
import { formatDateSL, todaySL } from "@/lib/date-sl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Invoice } from "@/types/invoice";
import { Booking } from "@/types/booking";
import { LiveClock } from "@/components/live-clock";

const RECENT_INVOICES_LIMIT = 5;
const RECENT_BOOKINGS_LIMIT = 5;
const RECENT_PAYMENTS_LIMIT = 5;

type RevenuePeriod = "all" | "this_month" | "last_month";

function calculateRemainingBalance(invoice: Invoice): number {
  const totalPaid = (invoice.payments || []).reduce((sum, p) => sum + p.amount, 0);
  return invoice.total - totalPaid;
}

function isDueInvoice(invoice: Invoice): boolean {
  const bal = calculateRemainingBalance(invoice);
  return bal > 0 && invoice.status !== "paid" && invoice.status !== "cancelled";
}

function isOverdueInvoice(invoice: Invoice, today: string): boolean {
  return isDueInvoice(invoice) && invoice.checkOut < today;
}

function getMonthBounds(today: string): { start: string; end: string } {
  const [y, m] = today.split("-").map(Number);
  const start = `${y}-${String(m).padStart(2, "0")}-01`;
  const last = new Date(y, m, 0);
  const end = `${y}-${String(m).padStart(2, "0")}-${String(last.getDate()).padStart(2, "0")}`;
  return { start, end };
}

function getLastMonthBounds(today: string): { start: string; end: string } {
  const [y, m] = today.split("-").map(Number);
  const prev = new Date(y, m - 2, 1);
  const py = prev.getFullYear();
  const pm = prev.getMonth() + 1;
  const start = `${py}-${String(pm).padStart(2, "0")}-01`;
  const last = new Date(py, pm, 0);
  const end = `${py}-${String(pm).padStart(2, "0")}-${String(last.getDate()).padStart(2, "0")}`;
  return { start, end };
}

function getNext7Days(today: string): string[] {
  const [y, m, d] = today.split("-").map(Number);
  const out: string[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(y, m - 1, d + i);
    out.push(date.toISOString().slice(0, 10));
  }
  return out;
}

export default function Dashboard() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [guests, setGuests] = useState<{ id?: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<RevenuePeriod>("all");

  const loadData = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const [invData, bookData, guestData] = await Promise.all([
        getInvoices(),
        getBookings(),
        getGuests(),
      ]);
      setInvoices(invData);
      setBookings(bookData);
      setGuests(guestData);
    } catch (e) {
      console.error("Dashboard load error:", e);
      setError("Failed to load dashboard. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (
        (e.target as HTMLElement)?.closest("input") ||
        (e.target as HTMLElement)?.closest("button") ||
        (e.target as HTMLElement)?.closest("a")
      )
        return;
      if (e.key === "n" || e.key === "N") {
        e.preventDefault();
        router.push("/invoices/new");
      } else if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        loadData();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router, loadData]);

  const today = todaySL();
  const paidList = useMemo(() => invoices.filter((i) => i.status === "paid"), [invoices]);
  const dueList = useMemo(() => invoices.filter(isDueInvoice), [invoices]);
  const overdueList = useMemo(() => invoices.filter((i) => isOverdueInvoice(i, today)), [invoices, today]);

  const { start: monthStart, end: monthEnd } = getMonthBounds(today);
  const { start: lastMonthStart, end: lastMonthEnd } = getLastMonthBounds(today);

  const paidThisMonth = useMemo(
    () =>
      paidList.filter((i) => i.checkIn >= monthStart && i.checkIn <= monthEnd),
    [paidList, monthStart, monthEnd]
  );
  const paidLastMonth = useMemo(
    () =>
      paidList.filter((i) => i.checkIn >= lastMonthStart && i.checkIn <= lastMonthEnd),
    [paidList, lastMonthStart, lastMonthEnd]
  );

  const usdRevenue = useMemo(() => {
    const list = period === "this_month" ? paidThisMonth : period === "last_month" ? paidLastMonth : paidList;
    return list.filter((i) => i.currency === "USD").reduce((s, i) => s + i.total, 0);
  }, [period, paidList, paidThisMonth, paidLastMonth]);
  const lkrRevenue = useMemo(() => {
    const list = period === "this_month" ? paidThisMonth : period === "last_month" ? paidLastMonth : paidList;
    return list.filter((i) => i.currency === "LKR").reduce((s, i) => s + i.total, 0);
  }, [period, paidList, paidThisMonth, paidLastMonth]);

  const usdDue = useMemo(
    () => dueList.filter((i) => i.currency === "USD").reduce((s, i) => s + calculateRemainingBalance(i), 0),
    [dueList]
  );
  const lkrDue = useMemo(
    () => dueList.filter((i) => i.currency === "LKR").reduce((s, i) => s + calculateRemainingBalance(i), 0),
    [dueList]
  );

  const arrivalsToday = useMemo(() => bookings.filter((b) => b.checkIn === today).length, [bookings, today]);
  const departuresToday = useMemo(() => bookings.filter((b) => b.checkOut === today).length, [bookings, today]);
  const checkedInNow = useMemo(() => bookings.filter((b) => b.status === "checked_in").length, [bookings]);
  const next7 = useMemo(() => getNext7Days(today), [today]);
  const upcomingCheckIns = useMemo(
    () =>
      bookings.filter(
        (b) =>
          b.status !== "checked_out" &&
          b.status !== "cancelled" &&
          next7.includes(b.checkIn)
      ).length,
    [bookings, next7]
  );

  const recentInvoices = useMemo(
    () => [...invoices].sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || "")).slice(0, RECENT_INVOICES_LIMIT),
    [invoices]
  );
  const recentBookings = useMemo(
    () =>
      [...bookings]
        .filter((b) => b.status !== "cancelled")
        .sort((a, b) => b.checkIn.localeCompare(a.checkIn))
        .slice(0, RECENT_BOOKINGS_LIMIT),
    [bookings]
  );
  const recentPayments = useMemo(() => {
    const flat: { payment: { date: string; amount: number }; invoiceId: string; invoiceNumber: string; currency: string }[] = [];
    invoices.forEach((inv) => {
      (inv.payments || []).forEach((p) => {
        flat.push({
          payment: { date: p.date, amount: p.amount },
          invoiceId: inv.id,
          invoiceNumber: inv.invoiceNumber,
          currency: inv.currency,
        });
      });
    });
    return flat.sort((a, b) => b.payment.date.localeCompare(a.payment.date)).slice(0, RECENT_PAYMENTS_LIMIT);
  }, [invoices]);

  const dueThisWeek = useMemo(() => {
    return invoices.filter((inv) => {
      if (inv.status === "paid" || inv.status === "cancelled") return false;
      const bal = calculateRemainingBalance(inv);
      if (bal <= 0) return false;
      return next7.includes(inv.checkOut);
    }).length;
  }, [invoices, next7]);

  const statusCounts = useMemo(
    () => ({
      paid: invoices.filter((i) => i.status === "paid").length,
      partially_paid: invoices.filter((i) => i.status === "partially_paid").length,
      pending: invoices.filter((i) => i.status === "pending").length,
      sent: invoices.filter((i) => i.status === "sent").length,
      draft: invoices.filter((i) => i.status === "draft").length,
      cancelled: invoices.filter((i) => i.status === "cancelled").length,
    }),
    [invoices]
  );

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      paid: "bg-green-100 text-green-800 border-green-200",
      partially_paid: "bg-amber-100 text-amber-800 border-amber-200",
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      sent: "bg-blue-100 text-blue-800 border-blue-200",
      draft: "bg-gray-100 text-gray-800 border-gray-200",
      cancelled: "bg-red-100 text-red-800 border-red-200",
    };
    const labels: Record<string, string> = { partially_paid: "Partially Paid" };
    return (
      <Badge variant="outline" className={styles[status] || "bg-gray-100 text-gray-800"}>
        {labels[status] || status.replace("_", " ")}
      </Badge>
    );
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">Overview for Rajini by The Waters</p>
          </div>
        </div>
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <AlertCircle className="h-12 w-12 text-destructive" />
              <p className="font-medium">{error}</p>
              <Button onClick={loadData}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Overview of invoice & booking management for Rajini by The Waters</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={loadData} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <LiveClock />
          <Link href="/invoices/new">
            <Button style={{ backgroundColor: "#D4AF37", color: "#000" }}>
              <Plus className="mr-2 h-4 w-4" />
              Create Invoice
            </Button>
          </Link>
        </div>
      </div>

      {/* Banners */}
      {overdueList.length > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-800 flex items-center justify-between flex-wrap gap-2">
          <span>{overdueList.length} overdue invoice{overdueList.length !== 1 ? "s" : ""}</span>
          <Link href="/invoices?status=overdue">
            <Button variant="outline" size="sm">View overdue</Button>
          </Link>
        </div>
      )}
      {(arrivalsToday > 0 || departuresToday > 0) && (
        <div className="flex flex-wrap gap-4">
          {arrivalsToday > 0 && (
            <Link href="/bookings?arrivals_today">
              <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-800 hover:bg-blue-100 transition-colors">
                {arrivalsToday} arrival{arrivalsToday !== 1 ? "s" : ""} today
              </div>
            </Link>
          )}
          {departuresToday > 0 && (
            <Link href="/bookings?departures_today">
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-800 hover:bg-amber-100 transition-colors">
                {departuresToday} departure{departuresToday !== 1 ? "s" : ""} today
              </div>
            </Link>
          )}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="h-80 rounded-lg bg-muted animate-pulse" />
            <div className="h-80 rounded-lg bg-muted animate-pulse" />
          </div>
        </div>
      ) : (
        <>
          {/* Stat cards - clickable */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Link href="/invoices">
              <Card className="border-l-4 border-l-blue-500 hover:bg-accent/50 transition-colors cursor-pointer h-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
                  <div className="p-2 rounded-lg bg-blue-50">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{invoices.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">All time</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/invoices?status=paid">
              <Card className="border-l-4 border-l-green-500 hover:bg-accent/50 transition-colors cursor-pointer h-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Paid</CardTitle>
                  <div className="p-2 rounded-lg bg-green-50">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{statusCounts.paid}</div>
                  <p className="text-xs text-muted-foreground mt-1">Successfully paid</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/invoices?status=due">
              <Card className="border-l-4 border-l-orange-500 hover:bg-accent/50 transition-colors cursor-pointer h-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Due</CardTitle>
                  <div className="p-2 rounded-lg bg-orange-50">
                    <AlertCircle className="h-5 w-5 text-orange-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">{dueList.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatCurrency(usdDue, "USD")} + {formatCurrency(lkrDue, "LKR")} outstanding
                  </p>
                </CardContent>
              </Card>
            </Link>
            <Card className="border-l-4 border-l-[#D4AF37] h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                <div className="p-2 rounded-lg bg-yellow-50">
                  <TrendingUp className="h-5 w-5 text-[#D4AF37]" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#D4AF37]">
                  {formatCurrency(usdRevenue + lkrRevenue, "USD")}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {period === "all" ? "All time" : period === "this_month" ? "This month" : "Last month"}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Revenue by currency + period */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-[#D4AF37]" />
                    Revenue by Currency
                  </CardTitle>
                  <div className="flex gap-1">
                    {(["all", "this_month", "last_month"] as const).map((p) => (
                      <Button
                        key={p}
                        variant={period === p ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setPeriod(p)}
                      >
                        {p === "all" ? "All" : p === "this_month" ? "Month" : "Last"}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="text-sm font-medium">USD</span>
                    <span className="text-lg font-bold text-green-700">{formatCurrency(usdRevenue, "USD")}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm font-medium">LKR</span>
                    <span className="text-lg font-bold text-blue-700">{formatCurrency(lkrRevenue, "LKR")}</span>
                  </div>
                  <div className="pt-2 border-t flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Paid invoices</span>
                    <span className="font-semibold">
                      {period === "all"
                        ? paidList.length
                        : period === "this_month"
                          ? paidThisMonth.length
                          : paidLastMonth.length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Due card - always visible */}
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
                    <div className="text-3xl font-bold text-orange-900">{dueList.length}</div>
                    <p className="text-xs text-muted-foreground mt-1">Outstanding balance</p>
                  </div>
                  <div className="pt-2 border-t border-orange-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">USD Due</span>
                      <span className="text-sm font-bold text-orange-900">{formatCurrency(usdDue, "USD")}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">LKR Due</span>
                      <span className="text-sm font-bold text-orange-900">{formatCurrency(lkrDue, "LKR")}</span>
                    </div>
                  </div>
                  {dueThisWeek > 0 && (
                    <p className="text-xs text-amber-700">{dueThisWeek} due (check-out) this week</p>
                  )}
                  <Link href="/invoices?status=due">
                    <Button variant="outline" size="sm" className="w-full mt-2">
                      View Due Invoices
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Today widget */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-[#D4AF37]" />
                  Today
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm font-medium flex items-center gap-2">
                      <LogIn className="h-4 w-4" /> Arrivals
                    </span>
                    <span className="font-bold text-blue-700">{arrivalsToday}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                    <span className="text-sm font-medium flex items-center gap-2">
                      <LogOut className="h-4 w-4" /> Departures
                    </span>
                    <span className="font-bold text-amber-700">{departuresToday}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="text-sm font-medium flex items-center gap-2">
                      <UserCheck className="h-4 w-4" /> Checked in
                    </span>
                    <span className="font-bold text-green-700">{checkedInNow}</span>
                  </div>
                  {upcomingCheckIns > 0 && (
                    <p className="text-xs text-muted-foreground">{upcomingCheckIns} check-ins in next 7 days</p>
                  )}
                  <Link href="/settings/guests">
                    <div className="flex items-center justify-between pt-2 border-t hover:bg-muted/50 -mx-2 px-2 py-1 rounded">
                      <span className="text-sm text-muted-foreground">Guests</span>
                      <span className="text-sm font-semibold">{guests.length}</span>
                    </div>
                  </Link>
                  <Link href="/bookings/calendar">
                    <Button variant="outline" size="sm" className="w-full mt-2">
                      <CalendarDays className="mr-2 h-4 w-4" />
                      View Calendar
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Status breakdown - clickable */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#D4AF37]" />
                Status Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {(
                  [
                    ["paid", "Paid", "green", "/invoices?status=paid"],
                    ["partially_paid", "Partially Paid", "amber", "/invoices?status=partially_paid"],
                    ["pending", "Pending", "yellow", "/invoices?status=pending"],
                    ["sent", "Sent", "blue", "/invoices?status=sent"],
                    ["draft", "Draft", "gray", "/invoices?status=draft"],
                    ["cancelled", "Cancelled", "red", "/invoices?status=cancelled"],
                  ] as const
                ).map(([key, label, , href]) => (
                  <Link key={key} href={href}>
                    <div className="flex items-center justify-between p-2 rounded-lg border hover:bg-accent transition-colors">
                      <span className="text-sm">{label}</span>
                      <span className="text-sm font-semibold">{statusCounts[key]}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Recent invoices */}
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
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="h-10 w-10 mx-auto mb-2 opacity-50" />
                      <p>No invoices yet</p>
                      <Link href="/invoices/new">
                        <Button size="sm" className="mt-2" style={{ backgroundColor: "#D4AF37", color: "#000" }}>
                          Create invoice
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    recentInvoices.map((inv) => {
                      const bal = calculateRemainingBalance(inv);
                      const guestLabel = [inv.guest.title ? `${inv.guest.title} ` : "", inv.guest.name || "-"].join("");
                      return (
                        <Link key={inv.id} href={`/invoices/${inv.id}`}>
                          <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors">
                            <div className="space-y-1 flex-1 min-w-0">
                              <div className="font-medium truncate">{inv.invoiceNumber}</div>
                              <div className="text-sm text-muted-foreground truncate">{guestLabel}</div>
                              <div className="text-xs text-muted-foreground">
                                {formatDateSL(inv.checkIn)} – {formatDateSL(inv.checkOut)}
                              </div>
                            </div>
                            <div className="text-right space-y-1 ml-3 flex-shrink-0">
                              <div className="font-semibold">{formatCurrency(inv.total, inv.currency)}</div>
                              {bal > 0 ? (
                                <div className="text-xs text-orange-600">Balance {formatCurrency(bal, inv.currency)}</div>
                              ) : (
                                <div className="text-xs text-green-600">Paid</div>
                              )}
                              <div>{getStatusBadge(inv.status)}</div>
                            </div>
                          </div>
                        </Link>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent bookings */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Bookings</CardTitle>
                  <Link href="/bookings">
                    <Button variant="ghost" size="sm">View All</Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentBookings.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <CalendarDays className="h-10 w-10 mx-auto mb-2 opacity-50" />
                      <p>No bookings yet</p>
                      <Link href="/bookings/new">
                        <Button size="sm" className="mt-2" style={{ backgroundColor: "#D4AF37", color: "#000" }}>
                          New booking
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    recentBookings.map((b) => (
                      <Link key={b.id} href={`/bookings/${b.id}`}>
                        <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors">
                          <div className="space-y-1 flex-1 min-w-0">
                            <div className="font-medium truncate">{b.bookingNumber}</div>
                            <div className="text-sm text-muted-foreground truncate">
                              {b.guest.title ? `${b.guest.title} ` : ""}{b.guest.name || "-"}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {formatDateSL(b.checkIn)} – {formatDateSL(b.checkOut)}
                            </div>
                          </div>
                          <div className="text-right ml-3 flex-shrink-0">
                            <Badge variant="outline">{b.status.replace("_", " ")}</Badge>
                          </div>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent payments */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Payments</CardTitle>
                  <Link href="/payments">
                    <Button variant="ghost" size="sm">View All</Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentPayments.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Wallet className="h-10 w-10 mx-auto mb-2 opacity-50" />
                      <p>No payments yet</p>
                      <Link href="/payments">
                        <Button variant="outline" size="sm" className="mt-2">Payments</Button>
                      </Link>
                    </div>
                  ) : (
                    recentPayments.map((item, idx) => (
                      <Link key={idx} href={`/invoices/${item.invoiceId}`}>
                        <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors">
                          <div className="space-y-1 flex-1 min-w-0">
                            <div className="font-medium truncate">{item.invoiceNumber}</div>
                            <div className="text-xs text-muted-foreground">{formatDateSL(item.payment.date)}</div>
                          </div>
                          <div className="font-semibold ml-3 flex-shrink-0">
                            {formatCurrency(item.payment.amount, item.currency)}
                          </div>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                <Link href="/invoices/new">
                  <Button className="w-full" style={{ backgroundColor: "#D4AF37", color: "#000" }}>
                    <Plus className="mr-2 h-4 w-4" />
                    New Invoice
                  </Button>
                </Link>
                <Link href="/bookings/new">
                  <Button variant="outline" className="w-full">
                    <CalendarDays className="mr-2 h-4 w-4" />
                    New Booking
                  </Button>
                </Link>
                <Link href="/invoices">
                  <Button variant="outline" className="w-full">
                    <FileText className="mr-2 h-4 w-4" />
                    Invoices
                  </Button>
                </Link>
                <Link href="/bookings">
                  <Button variant="outline" className="w-full">
                    <Calendar className="mr-2 h-4 w-4" />
                    Bookings
                  </Button>
                </Link>
                <Link href="/bookings/calendar">
                  <Button variant="outline" className="w-full">
                    <CalendarDays className="mr-2 h-4 w-4" />
                    Calendar
                  </Button>
                </Link>
                <Link href="/settings/guests">
                  <Button variant="outline" className="w-full">
                    <Users className="mr-2 h-4 w-4" />
                    Guests
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
        </>
      )}

      <p className="text-xs text-muted-foreground">Shortcuts: N = New invoice, R = Refresh</p>
    </div>
  );
}
