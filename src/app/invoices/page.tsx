"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getInvoices, deleteInvoice } from "@/lib/invoices";
import { formatCurrency } from "@/lib/currency";
import { formatDateSL, todaySL } from "@/lib/date-sl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Eye,
  Plus,
  X,
  Pencil,
  Trash2,
  AlertCircle,
  RefreshCw,
  Download,
  ChevronUp,
  ChevronDown,
  FileText,
  Mail,
  Building2,
  CalendarDays,
  Wallet,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Invoice } from "@/types/invoice";
import { User } from "@/types/user";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";

const PAGE_SIZE = 20;
const DEBOUNCE_MS = 300;

type SortKey =
  | "invoiceNumber"
  | "guest"
  | "checkIn"
  | "checkOut"
  | "nights"
  | "total"
  | "balance"
  | "status"
  | "createdAt";
type DatePreset = "" | "this_month" | "last_30" | "this_quarter";

function nights(checkIn: string, checkOut: string): number {
  const a = new Date(checkIn).getTime();
  const b = new Date(checkOut).getTime();
  return Math.max(0, Math.ceil((b - a) / (24 * 60 * 60 * 1000)));
}

function getMonthRange(today: string): { start: string; end: string } {
  const [y, m] = today.split("-").map(Number);
  const start = `${y}-${String(m).padStart(2, "0")}-01`;
  const last = new Date(y, m, 0);
  const end = `${y}-${String(m).padStart(2, "0")}-${String(last.getDate()).padStart(2, "0")}`;
  return { start, end };
}

function getLast30Range(today: string): { start: string; end: string } {
  const [y, m, d] = today.split("-").map(Number);
  const end = new Date(y, m - 1, d);
  const start = new Date(end);
  start.setDate(start.getDate() - 29);
  const fmt = (x: Date) => x.toISOString().slice(0, 10);
  return { start: fmt(start), end: fmt(end) };
}

function getQuarterRange(today: string): { start: string; end: string } {
  const [y, m] = today.split("-").map(Number);
  const q = Math.ceil(m / 3);
  const startM = (q - 1) * 3 + 1;
  const endM = q * 3;
  const start = `${y}-${String(startM).padStart(2, "0")}-01`;
  const last = new Date(y, endM, 0);
  const end = `${y}-${String(endM).padStart(2, "0")}-${String(last.getDate()).padStart(2, "0")}`;
  return { start, end };
}

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

export default function InvoicesPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currencyFilter, setCurrencyFilter] = useState<string>("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [datePreset, setDatePreset] = useState<DatePreset>("");
  const [sortKey, setSortKey] = useState<SortKey>("checkIn");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [deletingInvoiceId, setDeletingInvoiceId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => d.success && d.user && setCurrentUser(d.user))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const loadInvoices = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getInvoices();
      setInvoices(data);
    } catch (e) {
      console.error("Error loading invoices:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const s = params.get("status");
    if (s) setStatusFilter(s);
    const c = params.get("currency");
    if (c) setCurrencyFilter(c);
  }, []);

  const today = todaySL();

  const filteredInvoices = useMemo(() => {
    let list = invoices.filter((inv) => {
      const matchSearch =
        !debouncedSearch ||
        inv.invoiceNumber.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        inv.guest.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        inv.guest.email?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        [inv.guest.phone, inv.guest.phone2, inv.guest.phone3]
          .filter(Boolean)
          .some((p) => String(p).includes(debouncedSearch)) ||
        (inv.referenceNumber || "").toLowerCase().includes(debouncedSearch.toLowerCase());

      let matchStatus = true;
      if (statusFilter === "due") matchStatus = isDueInvoice(inv);
      else if (statusFilter === "overdue") matchStatus = isOverdueInvoice(inv, today);
      else if (statusFilter !== "all") matchStatus = inv.status === statusFilter;

      const matchCurrency = currencyFilter === "all" || inv.currency === currencyFilter;

      let matchDate = true;
      if (datePreset === "this_month") {
        const { start, end } = getMonthRange(today);
        matchDate = inv.checkIn <= end && inv.checkOut >= start;
      } else if (datePreset === "last_30") {
        const { start, end } = getLast30Range(today);
        matchDate = inv.checkIn <= end && inv.checkOut >= start;
      } else if (datePreset === "this_quarter") {
        const { start, end } = getQuarterRange(today);
        matchDate = inv.checkIn <= end && inv.checkOut >= start;
      } else {
        if (startDate) matchDate = matchDate && new Date(inv.checkIn) >= new Date(startDate);
        if (endDate) matchDate = matchDate && new Date(inv.checkOut) <= new Date(endDate);
      }

      return matchSearch && matchStatus && matchCurrency && matchDate;
    });

    const mult = sortDir === "asc" ? 1 : -1;
    list = [...list].sort((a, b) => {
      const balA = calculateRemainingBalance(a);
      const balB = calculateRemainingBalance(b);
      let va: string | number = "";
      let vb: string | number = "";
      switch (sortKey) {
        case "invoiceNumber":
          va = a.invoiceNumber;
          vb = b.invoiceNumber;
          break;
        case "guest":
          va = (a.guest.name || "").toLowerCase();
          vb = (b.guest.name || "").toLowerCase();
          break;
        case "checkIn":
          va = a.checkIn;
          vb = b.checkIn;
          break;
        case "checkOut":
          va = a.checkOut;
          vb = b.checkOut;
          break;
        case "nights":
          va = nights(a.checkIn, a.checkOut);
          vb = nights(b.checkIn, b.checkOut);
          return mult * (va - vb);
        case "total":
          va = a.total;
          vb = b.total;
          return mult * (va - vb);
        case "balance":
          return mult * (balA - balB);
        case "status":
          va = a.status;
          vb = b.status;
          break;
        case "createdAt":
          va = a.createdAt || "";
          vb = b.createdAt || "";
          break;
        default:
          return 0;
      }
      return mult * String(va).localeCompare(String(vb));
    });

    return list;
  }, [
    invoices,
    debouncedSearch,
    statusFilter,
    currencyFilter,
    startDate,
    endDate,
    datePreset,
    sortKey,
    sortDir,
    today,
  ]);

  const totalPages = Math.ceil(filteredInvoices.length / PAGE_SIZE) || 1;
  const paginatedInvoices = useMemo(
    () => filteredInvoices.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filteredInvoices, page]
  );

  const dueInvoices = useMemo(() => invoices.filter(isDueInvoice), [invoices]);
  const overdueInvoices = useMemo(
    () => invoices.filter((inv) => isOverdueInvoice(inv, today)),
    [invoices, today]
  );
  const usdDueAmount = useMemo(
    () => dueInvoices.filter((i) => i.currency === "USD").reduce((s, i) => s + calculateRemainingBalance(i), 0),
    [dueInvoices]
  );
  const lkrDueAmount = useMemo(
    () => dueInvoices.filter((i) => i.currency === "LKR").reduce((s, i) => s + calculateRemainingBalance(i), 0),
    [dueInvoices]
  );

  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; num: string } | null>(null);

  const handleDeleteClick = (id: string, num: string) => {
    setDeleteConfirm({ id, num });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;
    setDeletingInvoiceId(deleteConfirm.id);
    try {
      await deleteInvoice(deleteConfirm.id);
      await loadInvoices();
    } catch (e) {
      console.error(e);
      alert("Failed to delete invoice. Please try again.");
    } finally {
      setDeletingInvoiceId(null);
      setDeleteConfirm(null);
    }
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setDebouncedSearch("");
    setStatusFilter("all");
    setCurrencyFilter("all");
    setStartDate("");
    setEndDate("");
    setDatePreset("");
    setPage(1);
  };

  const setQuickPreset = (preset: DatePreset) => {
    setDatePreset(preset);
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir(key === "checkIn" || key === "checkOut" || key === "createdAt" ? "desc" : "asc");
    }
    setPage(1);
  };

  const hasActiveFilters =
    statusFilter !== "all" ||
    currencyFilter !== "all" ||
    startDate ||
    endDate ||
    datePreset ||
    !!searchTerm;

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      paid: "bg-green-100 text-green-800 border-green-200 hover:bg-green-200",
      partially_paid: "bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200",
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200",
      sent: "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200",
      draft: "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200",
      cancelled: "bg-red-100 text-red-800 border-red-200 hover:bg-red-200",
    };
    return (
      <Badge variant="outline" className={styles[status] || "bg-gray-100 text-gray-800 border-gray-200"}>
        {status.replace("_", " ")}
      </Badge>
    );
  };

  const exportCsv = () => {
    const headers = [
      "Invoice #",
      "Guest",
      "Title",
      "Check-in",
      "Check-out",
      "Nights",
      "Total",
      "Balance",
      "Currency",
      "Status",
      "Ref",
    ];
    const escape = (v: string | number) => {
      const s = String(v ?? "");
      return `"${s.replace(/"/g, '""')}"`;
    };
    const rows = filteredInvoices.map((inv) => {
      const bal = calculateRemainingBalance(inv);
      return [
        inv.invoiceNumber,
        inv.guest.name || "",
        inv.guest.title || "",
        inv.checkIn,
        inv.checkOut,
        nights(inv.checkIn, inv.checkOut),
        inv.total,
        bal,
        inv.currency,
        inv.status,
        inv.referenceNumber || "",
      ]
        .map(escape)
        .join(",");
    });
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoices-${today}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement).closest("button")
      )
        return;
      if (e.key === "n" || e.key === "N") {
        e.preventDefault();
        router.push("/invoices/new");
      } else if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        loadInvoices();
      } else if (e.key === "/") {
        e.preventDefault();
        document.getElementById("invoices-search")?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router, loadInvoices]);

  const paidCount = invoices.filter((i) => i.status === "paid").length;
  const draftCount = invoices.filter((i) => i.status === "draft").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground">Manage and view all hotel invoices</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => loadInvoices()} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Link href="/payments">
            <Button variant="outline">
              <Wallet className="mr-2 h-4 w-4" />
              Payments
            </Button>
          </Link>
          <Link href="/bookings/calendar">
            <Button variant="outline">
              <CalendarDays className="mr-2 h-4 w-4" />
              Calendar
            </Button>
          </Link>
          <Link href="/invoices/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Invoice
            </Button>
          </Link>
        </div>
      </div>

      {/* Overdue banner */}
      {overdueInvoices.length > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-800">
          {overdueInvoices.length} overdue invoice{overdueInvoices.length !== 1 ? "s" : ""} (check-out passed, balance due)
        </div>
      )}

      {/* Due summary card */}
      {dueInvoices.length > 0 && (
        <Card className="border-orange-200 bg-orange-50/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                <CardTitle className="text-orange-900">Due Invoices</CardTitle>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setStatusFilter("due");
                  setDatePreset("");
                  setPage(1);
                }}
              >
                View All Due ({dueInvoices.length})
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Due</p>
                <p className="text-2xl font-bold text-orange-900">{dueInvoices.length}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  invoice{dueInvoices.length !== 1 ? "s" : ""} with outstanding balance
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">USD Due</p>
                <p className="text-2xl font-bold text-orange-900">{formatCurrency(usdDueAmount, "USD")}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {dueInvoices.filter((i) => i.currency === "USD").length} invoice
                  {dueInvoices.filter((i) => i.currency === "USD").length !== 1 ? "s" : ""}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">LKR Due</p>
                <p className="text-2xl font-bold text-orange-900">{formatCurrency(lkrDueAmount, "LKR")}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {dueInvoices.filter((i) => i.currency === "LKR").length} invoice
                  {dueInvoices.filter((i) => i.currency === "LKR").length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats - clickable */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <button
          type="button"
          onClick={handleResetFilters}
          className="text-left rounded-lg border bg-card p-4 hover:bg-accent/50 transition-colors"
        >
          <CardHeader className="p-0 pb-1">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="text-2xl font-bold">{invoices.length}</div>
          </CardContent>
        </button>
        <button
          type="button"
          onClick={() => {
            setStatusFilter("paid");
            setDatePreset("");
            setPage(1);
          }}
          className="text-left rounded-lg border bg-card p-4 hover:bg-accent/50 transition-colors"
        >
          <CardHeader className="p-0 pb-1">
            <CardTitle className="text-sm font-medium text-muted-foreground">Paid</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="text-2xl font-bold text-green-600">{paidCount}</div>
          </CardContent>
        </button>
        <button
          type="button"
          onClick={() => {
            setStatusFilter("due");
            setDatePreset("");
            setPage(1);
          }}
          className="text-left rounded-lg border bg-card p-4 hover:bg-accent/50 transition-colors"
        >
          <CardHeader className="p-0 pb-1">
            <CardTitle className="text-sm font-medium text-muted-foreground">Due</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="text-2xl font-bold text-orange-600">{dueInvoices.length}</div>
          </CardContent>
        </button>
        <button
          type="button"
          onClick={() => {
            setStatusFilter("draft");
            setDatePreset("");
            setPage(1);
          }}
          className="text-left rounded-lg border bg-card p-4 hover:bg-accent/50 transition-colors"
        >
          <CardHeader className="p-0 pb-1">
            <CardTitle className="text-sm font-medium text-muted-foreground">Draft</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="text-2xl font-bold text-gray-600">{draftCount}</div>
          </CardContent>
        </button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle>Filters</CardTitle>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={handleResetFilters}>
                <X className="mr-2 h-4 w-4" />
                Reset
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button variant={datePreset === "" ? "default" : "outline"} size="sm" onClick={() => setQuickPreset("")}>
              All
            </Button>
            <Button
              variant={datePreset === "this_month" ? "default" : "outline"}
              size="sm"
              onClick={() => setQuickPreset("this_month")}
            >
              This month
            </Button>
            <Button
              variant={datePreset === "last_30" ? "default" : "outline"}
              size="sm"
              onClick={() => setQuickPreset("last_30")}
            >
              Last 30 days
            </Button>
            <Button
              variant={datePreset === "this_quarter" ? "default" : "outline"}
              size="sm"
              onClick={() => setQuickPreset("this_quarter")}
            >
              This quarter
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2 relative">
              <Label htmlFor="invoices-search">Search</Label>
              <div className="relative">
                <Input
                  id="invoices-search"
                  placeholder="Invoice #, guest, email, phone, Ref..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1);
                  }}
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm("");
                      setDebouncedSearch("");
                      setPage(1);
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
                <SelectTrigger>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="due">Due</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="partially_paid">Partially paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Currency</Label>
              <Select value={currencyFilter} onValueChange={(v) => { setCurrencyFilter(v); setPage(1); }}>
                <SelectTrigger>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="LKR">LKR</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Check-in from</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setDatePreset("");
                  setPage(1);
                }}
              />
            </div>
            <div className="space-y-2">
              <Label>Check-out to</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setDatePreset("");
                  setPage(1);
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle>All Invoices ({filteredInvoices.length})</CardTitle>
            <Button variant="outline" size="sm" onClick={exportCsv} disabled={filteredInvoices.length === 0}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-12 rounded bg-muted animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="relative w-full overflow-auto max-h-[60vh]">
              <Table>
                <TableHeader>
                  <TableRow className="sticky top-0 z-10 bg-background hover:bg-background">
                    <TableHead>
                      <button type="button" onClick={() => handleSort("invoiceNumber")} className="flex items-center gap-1 font-medium">
                        Invoice # {sortKey === "invoiceNumber" && (sortDir === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}
                      </button>
                    </TableHead>
                    <TableHead>
                      <button type="button" onClick={() => handleSort("guest")} className="flex items-center gap-1 font-medium">
                        Guest {sortKey === "guest" && (sortDir === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}
                      </button>
                    </TableHead>
                    <TableHead>
                      <button type="button" onClick={() => handleSort("checkIn")} className="flex items-center gap-1 font-medium">
                        Check-in {sortKey === "checkIn" && (sortDir === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}
                      </button>
                    </TableHead>
                    <TableHead>
                      <button type="button" onClick={() => handleSort("checkOut")} className="flex items-center gap-1 font-medium">
                        Check-out {sortKey === "checkOut" && (sortDir === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}
                      </button>
                    </TableHead>
                    <TableHead>
                      <button type="button" onClick={() => handleSort("nights")} className="flex items-center gap-1 font-medium">
                        Nights {sortKey === "nights" && (sortDir === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}
                      </button>
                    </TableHead>
                    <TableHead>
                      <button type="button" onClick={() => handleSort("total")} className="flex items-center gap-1 font-medium">
                        Total {sortKey === "total" && (sortDir === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}
                      </button>
                    </TableHead>
                    <TableHead>
                      <button type="button" onClick={() => handleSort("balance")} className="flex items-center gap-1 font-medium">
                        Balance {sortKey === "balance" && (sortDir === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}
                      </button>
                    </TableHead>
                    <TableHead>
                      <button type="button" onClick={() => handleSort("status")} className="flex items-center gap-1 font-medium">
                        Status {sortKey === "status" && (sortDir === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}
                      </button>
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedInvoices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-12">
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                          <FileText className="h-12 w-12 opacity-50" />
                          <p className="font-medium">No invoices match your filters</p>
                          <p className="text-sm">Try changing filters or create a new invoice.</p>
                          <Button variant="outline" onClick={handleResetFilters}>
                            Reset filters
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedInvoices.map((inv, idx) => {
                      const remainingBalance = calculateRemainingBalance(inv);
                      const isDue = isDueInvoice(inv);
                      const isOverdue = isOverdueInvoice(inv, today);
                      const guestLabel = [
                        inv.guest.title ? `${inv.guest.title} ` : "",
                        inv.guest.name || "-",
                      ].join("");
                      return (
                        <TableRow
                          key={inv.id}
                          className={`
                            cursor-pointer ${idx % 2 === 1 ? "bg-muted/30" : ""}
                            ${isOverdue ? "border-l-4 border-l-red-500" : ""}
                            ${isDue && !isOverdue ? "border-l-4 border-l-orange-500" : ""}
                            ${isDue ? "bg-orange-50/50 hover:bg-orange-100/50" : ""}
                          `}
                          onClick={() => router.push(`/invoices/${inv.id}`)}
                        >
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-1.5">
                              {inv.invoiceNumber}
                              {isDue && <AlertCircle className="h-4 w-4 text-orange-600 flex-shrink-0" />}
                              <Badge variant="secondary" className="font-normal text-xs">
                                {inv.currency}
                              </Badge>
                            </div>
                            {inv.referenceNumber && (
                              <span className="text-xs text-muted-foreground block mt-0.5">Ref: {inv.referenceNumber}</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">{guestLabel}</span>
                              {inv.billingType === "company" && (
                                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                  <Building2 className="h-3 w-3" /> Company
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{formatDateSL(inv.checkIn)}</TableCell>
                          <TableCell>{formatDateSL(inv.checkOut)}</TableCell>
                          <TableCell>{nights(inv.checkIn, inv.checkOut)}</TableCell>
                          <TableCell>{formatCurrency(inv.total, inv.currency)}</TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span
                                className={
                                  remainingBalance > 0
                                    ? "font-semibold text-orange-600"
                                    : "text-green-600"
                                }
                              >
                                {formatCurrency(remainingBalance, inv.currency)}
                              </span>
                              {remainingBalance > 0 && (
                                <span className="text-xs text-muted-foreground">
                                  {formatCurrency((inv.payments || []).reduce((s, p) => s + p.amount, 0), inv.currency)} paid
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(inv.status)}</TableCell>
                          <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex justify-end gap-1">
                              <Link href={`/invoices/${inv.id}`}>
                                <Button variant="ghost" size="sm" title="View">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>
                              {inv.status !== "paid" && (
                                <>
                                  <Link href={`/invoices/${inv.id}/edit`}>
                                    <Button variant="ghost" size="sm" title="Edit">
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                  </Link>
                                  <Link href={`/invoices/${inv.id}`} title="View & send email">
                                    <Button variant="ghost" size="sm">
                                      <Mail className="h-4 w-4" />
                                    </Button>
                                  </Link>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteClick(inv.id, inv.invoiceNumber)}
                                    disabled={deletingInvoiceId === inv.id}
                                    title="Delete"
                                  >
                                    <Trash2 className="h-4 w-4 text-red-600" />
                                  </Button>
                                </>
                              )}
                              {inv.status === "paid" && (
                                currentUser?.role === "super_admin" ? (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteClick(inv.id, inv.invoiceNumber)}
                                    disabled={deletingInvoiceId === inv.id}
                                    title="Delete (Super Admin)"
                                  >
                                    <Trash2 className="h-4 w-4 text-red-600" />
                                  </Button>
                                ) : (
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <AlertCircle className="h-4 w-4" />
                                    <span>Protected</span>
                                  </div>
                                )
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {!loading && filteredInvoices.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages} ({filteredInvoices.length} invoices)
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
                  Previous
                </Button>
                <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      <p className="text-xs text-muted-foreground">Shortcuts: N = New invoice, R = Refresh, / = Focus search</p>

      <ConfirmDeleteDialog
        open={!!deleteConfirm}
        onOpenChange={(open) => !open && setDeleteConfirm(null)}
        title="Delete Invoice"
        description={
          deleteConfirm
            ? `Are you sure you want to delete invoice ${deleteConfirm.num}? This cannot be undone.`
            : ""
        }
        onConfirm={handleDeleteConfirm}
        loading={!!deletingInvoiceId}
      />
    </div>
  );
}
