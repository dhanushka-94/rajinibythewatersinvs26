"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getInvoices } from "@/lib/invoices";
import { getBookings } from "@/lib/bookings";
import { getDiscounts } from "@/lib/discounts";
import { formatCurrency } from "@/lib/currency";
import { formatDateSL, todaySL } from "@/lib/date-sl";
import { Invoice } from "@/types/invoice";
import { Booking } from "@/types/booking";
import { Discount } from "@/types/discount";
import {
  FileText,
  DollarSign,
  Calendar,
  Download,
  Filter,
  BedDouble,
  Tag,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type ReportTab = "invoices" | "rooms" | "bookings" | "discounts";
type PeriodPreset = "today" | "week" | "month" | "last_month" | "custom";

function getPeriodBounds(preset: PeriodPreset): { start: string; end: string } {
  const today = todaySL();
  const [y, m, d] = today.split("-").map(Number);

  if (preset === "today") {
    return { start: today, end: today };
  }
  if (preset === "week") {
    const start = new Date(y, m - 1, d - 6);
    return {
      start: start.toISOString().slice(0, 10),
      end: today,
    };
  }
  if (preset === "month") {
    const start = `${y}-${String(m).padStart(2, "0")}-01`;
    const last = new Date(y, m, 0);
    const end = `${y}-${String(m).padStart(2, "0")}-${String(last.getDate()).padStart(2, "0")}`;
    return { start, end };
  }
  if (preset === "last_month") {
    const prev = new Date(y, m - 2, 1);
    const py = prev.getFullYear();
    const pm = prev.getMonth() + 1;
    const start = `${py}-${String(pm).padStart(2, "0")}-01`;
    const last = new Date(py, pm, 0);
    const end = `${py}-${String(pm).padStart(2, "0")}-${String(last.getDate()).padStart(2, "0")}`;
    return { start, end };
  }
  return { start: "", end: "" };
}

function getStatusBadge(status: string) {
  const styles: Record<string, string> = {
    paid: "bg-green-100 text-green-800 border-green-200",
    partially_paid: "bg-amber-100 text-amber-800 border-amber-200",
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    sent: "bg-blue-100 text-blue-800 border-blue-200",
    draft: "bg-gray-100 text-gray-800 border-gray-200",
    cancelled: "bg-red-100 text-red-800 border-red-200",
    booked: "bg-blue-100 text-blue-800 border-blue-200",
    confirmed: "bg-indigo-100 text-indigo-800 border-indigo-200",
    checked_in: "bg-green-100 text-green-800 border-green-200",
    checked_out: "bg-gray-100 text-gray-800 border-gray-200",
  };
  const labels: Record<string, string> = {
    partially_paid: "Partially Paid",
    checked_in: "Checked In",
    checked_out: "Checked Out",
  };
  return (
    <Badge variant="outline" className={styles[status] || "bg-gray-100 text-gray-800"}>
      {labels[status] || status.replace(/_/g, " ")}
    </Badge>
  );
}

function formatPaymentMethod(method: string): string {
  const map: Record<string, string> = {
    bank_account: "Bank Transfer",
    cheque: "Cheque",
    online: "Online",
    cash: "Cash",
    card: "Card",
  };
  return map[method] || method.replace("_", " ");
}

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<ReportTab>("invoices");
  const [periodPreset, setPeriodPreset] = useState<PeriodPreset>("month");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currencyFilter, setCurrencyFilter] = useState<string>("all");
  const [roomTypeFilter, setRoomTypeFilter] = useState<string>("all");
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [roomsWithStatus, setRoomsWithStatus] = useState<
    { operationalStatus: string; roomType?: string; id: string }[]
  >([]);
  const [discountUsage, setDiscountUsage] = useState<
    { discountName: string; couponCode?: string; usageCount: number; totalDiscountAmount: number; currency: string }[]
  >([]);
  const [loading, setLoading] = useState(true);

  const { start: periodStart, end: periodEnd } = useMemo(
    () => getPeriodBounds(periodPreset),
    [periodPreset]
  );

  const effectiveStart = startDate || periodStart;
  const effectiveEnd = endDate || periodEnd;

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [invData, bookData, discData, roomsRes, usageRes] = await Promise.all([
        getInvoices(),
        getBookings(),
        getDiscounts({ includeInactive: true }),
        fetch("/api/rooms/status"),
        fetch(
          effectiveStart && effectiveEnd
            ? `/api/reports/discount-usage?startDate=${effectiveStart}&endDate=${effectiveEnd}`
            : "/api/reports/discount-usage"
        ),
      ]);
      setInvoices(invData);
      setBookings(bookData);
      setDiscounts(discData);
      const roomsJson = await roomsRes.json();
      if (roomsJson.success) setRoomsWithStatus(roomsJson.rooms || []);
      const usageJson = await usageRes.json();
      if (usageJson.success) setDiscountUsage(usageJson.rows || []);
    } catch (e) {
      console.error("Reports load error:", e);
    } finally {
      setLoading(false);
    }
  }, [effectiveStart, effectiveEnd]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Apply filters to invoices
  const filteredInvoices = useMemo(() => {
    let f = [...invoices];
    if (effectiveStart) f = f.filter((i) => i.checkIn >= effectiveStart);
    if (effectiveEnd) f = f.filter((i) => i.checkOut <= effectiveEnd);
    if (statusFilter !== "all") f = f.filter((i) => i.status === statusFilter);
    if (currencyFilter !== "all") f = f.filter((i) => i.currency === currencyFilter);
    if (roomTypeFilter !== "all") f = f.filter((i) => (i.roomType || "-") === roomTypeFilter);
    return f;
  }, [invoices, effectiveStart, effectiveEnd, statusFilter, currencyFilter, roomTypeFilter]);

  // Filter bookings by period
  const filteredBookings = useMemo(() => {
    let f = bookings.filter((b) => b.status !== "cancelled");
    if (effectiveStart) f = f.filter((b) => b.checkOut >= effectiveStart);
    if (effectiveEnd) f = f.filter((b) => b.checkIn <= effectiveEnd);
    return f;
  }, [bookings, effectiveStart, effectiveEnd]);

  const paidInvoices = filteredInvoices.filter((i) => i.status === "paid");
  const usdRevenue = paidInvoices
    .filter((i) => i.currency === "USD")
    .reduce((s, i) => s + i.total, 0);
  const lkrRevenue = paidInvoices
    .filter((i) => i.currency === "LKR")
    .reduce((s, i) => s + i.total, 0);
  const totalDiscountAmount = filteredInvoices.reduce((s, i) => s + (i.discount || 0), 0);

  // Revenue by room type
  const revenueByRoomType = useMemo(() => {
    const map = new Map<string, { usd: number; lkr: number; count: number }>();
    for (const inv of paidInvoices) {
      const rt = inv.roomType || "Unknown";
      const cur = map.get(rt) || { usd: 0, lkr: 0, count: 0 };
      cur.count += 1;
      if (inv.currency === "USD") cur.usd += inv.total;
      else cur.lkr += inv.total;
      map.set(rt, cur);
    }
    return Array.from(map.entries()).map(([roomType, v]) => ({ roomType, ...v }));
  }, [paidInvoices]);

  const roomTypeOptions = useMemo(() => {
    const set = new Set(invoices.map((i) => i.roomType || "Unknown"));
    return Array.from(set).sort();
  }, [invoices]);

  // Room stats
  const roomStats = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const r of roomsWithStatus) {
      counts[r.operationalStatus] = (counts[r.operationalStatus] || 0) + 1;
    }
    const total = roomsWithStatus.length;
    const available = counts["available"] || 0;
    const occupied = (counts["checked_in"] || 0) + (counts["booked"] || 0);
    const occupancyPct = total > 0 ? Math.round((occupied / total) * 100) : 0;
    return { total, available, occupied, occupancyPct, counts };
  }, [roomsWithStatus]);

  // Booking stats
  const bookingStatusCounts = useMemo(() => {
    const m: Record<string, number> = {};
    for (const b of filteredBookings) {
      m[b.status] = (m[b.status] || 0) + 1;
    }
    return m;
  }, [filteredBookings]);

  const avgStayNights = useMemo(() => {
    if (filteredBookings.length === 0) return 0;
    const total = filteredBookings.reduce((s, b) => {
      const cin = new Date(b.checkIn).getTime();
      const cout = new Date(b.checkOut).getTime();
      return s + Math.round((cout - cin) / (24 * 60 * 60 * 1000));
    }, 0);
    return (total / filteredBookings.length).toFixed(1);
  }, [filteredBookings]);

  const cancellationRate = useMemo(() => {
    const total = bookings.length;
    const cancelled = bookings.filter((b) => b.status === "cancelled").length;
    return total > 0 ? ((cancelled / total) * 100).toFixed(1) : "0";
  }, [bookings]);

  const expiringDiscounts = useMemo(() => {
    const in7 = new Date();
    in7.setDate(in7.getDate() + 7);
    const cutoff = in7.toISOString().slice(0, 10);
    return discounts.filter(
      (d) => d.status === "active" && d.validUntil >= todaySL() && d.validUntil <= cutoff
    );
  }, [discounts]);

  const handleExportInvoices = () => {
    const headers = [
      "Invoice Number", "Guest", "Check-in", "Check-out", "Room Type", "Currency",
      "Subtotal", "Service Charge", "Tax", "Discount", "Total", "Status", "Payment Methods",
    ];
    const rows = filteredInvoices.map((i) => [
      i.invoiceNumber, i.guest?.name || "-", i.checkIn, i.checkOut, i.roomType || "-",
      i.currency, i.subtotal.toFixed(2), i.serviceCharge.toFixed(2), i.taxAmount.toFixed(2),
      i.discount.toFixed(2), i.total.toFixed(2), i.status,
      ((i.paymentMethods as string[] | undefined) || []).map(formatPaymentMethod).join(", "),
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${c}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `invoices-${effectiveStart || "all"}-${effectiveEnd || "all"}.csv`;
    a.click();
  };

  const handleExportDiscounts = () => {
    const headers = ["Discount", "Coupon Code", "Usage Count", "Total Discount Amount", "Currency"];
    const rows = discountUsage.map((r) => [
      r.discountName, r.couponCode || "-", r.usageCount, r.totalDiscountAmount.toFixed(2), r.currency,
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${c}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `discount-usage-${effectiveStart || "all"}-${effectiveEnd || "all"}.csv`;
    a.click();
  };

  const resetFilters = () => {
    setStartDate("");
    setEndDate("");
    setPeriodPreset("month");
    setStatusFilter("all");
    setCurrencyFilter("all");
    setRoomTypeFilter("all");
  };

  const tabs: { id: ReportTab; label: string; icon: React.ReactNode }[] = [
    { id: "invoices", label: "Invoices", icon: <FileText className="h-4 w-4" /> },
    { id: "rooms", label: "Rooms", icon: <BedDouble className="h-4 w-4" /> },
    { id: "bookings", label: "Bookings", icon: <Calendar className="h-4 w-4" /> },
    { id: "discounts", label: "Discounts", icon: <Tag className="h-4 w-4" /> },
  ];

  if (loading && invoices.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading reports...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">
            View and analyze data across invoices, rooms, bookings, and promotions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadData} disabled={loading}>
            <RefreshCw className={cn("mr-2 h-4 w-4", loading && "animate-spin")} />
            Refresh
          </Button>
          {activeTab === "invoices" && (
            <Button size="sm" onClick={handleExportInvoices} style={{ backgroundColor: "#D4AF37", color: "#000" }}>
              <Download className="mr-2 h-4 w-4" />
              Export Invoices
            </Button>
          )}
          {activeTab === "discounts" && (
            <Button size="sm" variant="outline" onClick={handleExportDiscounts}>
              <Download className="mr-2 h-4 w-4" />
              Export Discount Usage
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b">
        {tabs.map((t) => (
          <Button
            key={t.id}
            variant="ghost"
            className={cn(
              "rounded-b-none border-b-2",
              activeTab === t.id ? "border-primary" : "border-transparent"
            )}
            onClick={() => setActiveTab(t.id)}
          >
            {t.icon}
            <span className="ml-2">{t.label}</span>
          </Button>
        ))}
      </div>

      {/* Period & Filters (for tabs that use dates) */}
      {(activeTab === "invoices" || activeTab === "bookings" || activeTab === "discounts") && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Period & Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex gap-1">
                {(["today", "week", "month", "last_month", "custom"] as const).map((p) => (
                  <Button
                    key={p}
                    variant={periodPreset === p ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setPeriodPreset(p);
                      if (p !== "custom") {
                        const { start, end } = getPeriodBounds(p);
                        setStartDate("");
                        setEndDate("");
                      }
                    }}
                  >
                    {p === "today" ? "Today" : p === "week" ? "This Week" : p === "month" ? "This Month" : p === "last_month" ? "Last Month" : "Custom"}
                  </Button>
                ))}
              </div>
              {periodPreset === "custom" && (
                <>
                  <div className="space-y-1">
                    <Label className="text-xs">Start</Label>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-36"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">End</Label>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-36"
                    />
                  </div>
                </>
              )}
              {activeTab === "invoices" && (
                <>
                  <div className="space-y-1">
                    <Label className="text-xs">Status</Label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="partially_paid">Partially Paid</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="sent">Sent</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Currency</Label>
                    <Select value={currencyFilter} onValueChange={setCurrencyFilter}>
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="LKR">LKR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {roomTypeOptions.length > 0 && (
                    <div className="space-y-1">
                      <Label className="text-xs">Room Type</Label>
                      <Select value={roomTypeFilter} onValueChange={setRoomTypeFilter}>
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="All types" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          {roomTypeOptions.map((rt) => (
                            <SelectItem key={rt} value={rt}>{rt}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </>
              )}
              <Button variant="outline" size="sm" onClick={resetFilters}>
                <Filter className="mr-2 h-4 w-4" />
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab Content */}
      {activeTab === "invoices" && (
        <>
          <div className="text-sm text-muted-foreground">
            {effectiveStart && effectiveEnd
              ? `Showing data for ${formatDateSL(effectiveStart)} – ${formatDateSL(effectiveEnd)}`
              : "Showing all data"}
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{filteredInvoices.length}</div>
                <p className="text-xs text-muted-foreground">{invoices.length} in system</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">USD Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-700">{formatCurrency(usdRevenue, "USD")}</div>
                <p className="text-xs text-muted-foreground">{paidInvoices.filter((i) => i.currency === "USD").length} paid</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">LKR Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-700">{formatCurrency(lkrRevenue, "LKR")}</div>
                <p className="text-xs text-muted-foreground">{paidInvoices.filter((i) => i.currency === "LKR").length} paid</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Discounts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-700">{formatCurrency(totalDiscountAmount, "USD")}</div>
                <p className="text-xs text-muted-foreground">Applied in period</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{filteredInvoices.filter((i) => i.status === "pending").length}</div>
                <p className="text-xs text-muted-foreground">Awaiting payment</p>
              </CardContent>
            </Card>
          </div>
          {revenueByRoomType.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Room Type</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Room Type</TableHead>
                      <TableHead>Count</TableHead>
                      <TableHead>USD</TableHead>
                      <TableHead>LKR</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {revenueByRoomType.map((r) => (
                      <TableRow key={r.roomType}>
                        <TableCell>{r.roomType}</TableCell>
                        <TableCell>{r.count}</TableCell>
                        <TableCell>{formatCurrency(r.usd, "USD")}</TableCell>
                        <TableCell>{formatCurrency(r.lkr, "LKR")}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
          <Card>
            <CardHeader>
              <CardTitle>Status Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                {["paid", "partially_paid", "pending", "sent", "draft", "cancelled"].map((status) => {
                  const count = filteredInvoices.filter((i) => i.status === status).length;
                  return (
                    <Link key={status} href={`/invoices?status=${status}`}>
                      <div className="p-3 rounded-lg border hover:bg-muted/50">
                        <div className="text-lg font-bold">{count}</div>
                        <div className="text-xs text-muted-foreground">{status.replace("_", " ")}</div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Invoice Details ({filteredInvoices.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredInvoices.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">No invoices match the filters</div>
              ) : (
                <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice #</TableHead>
                        <TableHead>Guest</TableHead>
                        <TableHead>Check-in</TableHead>
                        <TableHead>Check-out</TableHead>
                        <TableHead>Room</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredInvoices.map((inv) => (
                        <TableRow key={inv.id}>
                          <TableCell className="font-medium">{inv.invoiceNumber}</TableCell>
                          <TableCell>{inv.guest?.name || "-"}</TableCell>
                          <TableCell>{formatDateSL(inv.checkIn)}</TableCell>
                          <TableCell>{formatDateSL(inv.checkOut)}</TableCell>
                          <TableCell>{inv.roomType || "-"}</TableCell>
                          <TableCell>{formatCurrency(inv.total, inv.currency)}</TableCell>
                          <TableCell>{getStatusBadge(inv.status)}</TableCell>
                          <TableCell className="text-right">
                            <Link href={`/invoices/${inv.id}`}>
                              <Button variant="ghost" size="sm">View</Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {activeTab === "rooms" && (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Rooms</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{roomStats.total}</div>
                <p className="text-xs text-muted-foreground">In property</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Available</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{roomStats.available}</div>
                <p className="text-xs text-muted-foreground">Ready for guests</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Occupied</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{roomStats.occupied}</div>
                <p className="text-xs text-muted-foreground">Booked or checked in</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Occupancy</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#D4AF37]">{roomStats.occupancyPct}%</div>
                <p className="text-xs text-muted-foreground">Current rate</p>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Room Status Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {[
                  { key: "available", label: "Available", color: "bg-green-100 text-green-800" },
                  { key: "booked", label: "Booked", color: "bg-blue-100 text-blue-800" },
                  { key: "checked_in", label: "Checked In", color: "bg-indigo-100 text-indigo-800" },
                  { key: "checked_out", label: "Checked Out", color: "bg-gray-100 text-gray-800" },
                  { key: "maintenance", label: "Maintenance", color: "bg-amber-100 text-amber-800" },
                  { key: "disabled", label: "Disabled", color: "bg-red-100 text-red-800" },
                ].map(({ key, label, color }) => (
                  <div key={key} className="p-4 rounded-lg border">
                    <div className={`text-2xl font-bold ${color}`}>{roomStats.counts[key] || 0}</div>
                    <div className="text-sm text-muted-foreground">{label}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Link href="/rooms">
            <Button variant="outline">
              <BedDouble className="mr-2 h-4 w-4" />
              View Room Status Page
            </Button>
          </Link>
        </>
      )}

      {activeTab === "bookings" && (
        <>
          <div className="text-sm text-muted-foreground">
            {effectiveStart && effectiveEnd
              ? `Bookings overlapping ${formatDateSL(effectiveStart)} – ${formatDateSL(effectiveEnd)}`
              : "Showing all bookings"}
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{filteredBookings.length}</div>
                <p className="text-xs text-muted-foreground">In period (excl. cancelled)</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Avg Stay</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{avgStayNights} nights</div>
                <p className="text-xs text-muted-foreground">Per booking</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Cancellation Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{cancellationRate}%</div>
                <p className="text-xs text-muted-foreground">Of all bookings</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Checked In</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{bookingStatusCounts["checked_in"] || 0}</div>
                <p className="text-xs text-muted-foreground">Currently in house</p>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Status Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {["confirmed", "booked", "checked_in", "checked_out"].map((status) => (
                  <div key={status} className="flex items-center gap-2">
                    {getStatusBadge(status)}
                    <span className="font-semibold">{bookingStatusCounts[status] || 0}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {activeTab === "discounts" && (
        <>
          <div className="text-sm text-muted-foreground">
            {effectiveStart && effectiveEnd
              ? `Discount usage for invoices with check-in ${formatDateSL(effectiveStart)} – ${formatDateSL(effectiveEnd)}`
              : "Showing all discount usage"}
          </div>
          {expiringDiscounts.length > 0 && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800">
              {expiringDiscounts.length} discount{expiringDiscounts.length !== 1 ? "s" : ""} expiring in 7 days
              <Link href="/promotions/discounts" className="ml-2 underline">View</Link>
            </div>
          )}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active Discounts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{discounts.filter((d) => d.status === "active").length}</div>
                <p className="text-xs text-muted-foreground">Currently available</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Uses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{discountUsage.reduce((s, r) => s + r.usageCount, 0)}</div>
                <p className="text-xs text-muted-foreground">In selected period</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Revenue Impact</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-700">
                  {formatCurrency(
                    discountUsage.reduce((s, r) => s + r.totalDiscountAmount, 0),
                    "USD"
                  )}
                </div>
                <p className="text-xs text-muted-foreground">Total discounts given</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{expiringDiscounts.length}</div>
                <p className="text-xs text-muted-foreground">Within 7 days</p>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Discount Usage by Discount / Coupon</CardTitle>
            </CardHeader>
            <CardContent>
              {discountUsage.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">No discount usage in selected period</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Discount</TableHead>
                      <TableHead>Coupon Code</TableHead>
                      <TableHead>Usage Count</TableHead>
                      <TableHead>Total Amount</TableHead>
                      <TableHead>Currency</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {discountUsage.map((r, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{r.discountName}</TableCell>
                        <TableCell>{r.couponCode || "-"}</TableCell>
                        <TableCell>{r.usageCount}</TableCell>
                        <TableCell>{formatCurrency(r.totalDiscountAmount, r.currency as "USD" | "LKR")}</TableCell>
                        <TableCell>{r.currency}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
          <Link href="/promotions/discounts">
            <Button variant="outline">
              <Tag className="mr-2 h-4 w-4" />
              Manage Discounts
            </Button>
          </Link>
        </>
      )}
    </div>
  );
}
