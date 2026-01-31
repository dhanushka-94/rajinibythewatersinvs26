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
import { Input } from "@/components/ui/input";
import { Booking, BookingStatus } from "@/types/booking";
import { User } from "@/types/user";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { formatDateSL, todaySL } from "@/lib/date-sl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Eye,
  Plus,
  X,
  Pencil,
  Trash2,
  LogIn,
  LogOut,
  CalendarDays,
  RefreshCw,
  FileText,
  Download,
  Calendar,
  ChevronUp,
  ChevronDown,
  Users,
} from "lucide-react";

const PAGE_SIZE = 20;
const DEBOUNCE_MS = 300;

type SortKey = "bookingNumber" | "guest" | "checkIn" | "checkOut" | "nights" | "roomType" | "status";
type DatePreset = "" | "arrivals_today" | "departures_today" | "this_week" | "next_7" | "this_month";

function nights(checkIn: string, checkOut: string): number {
  const a = new Date(checkIn).getTime();
  const b = new Date(checkOut).getTime();
  return Math.max(0, Math.ceil((b - a) / (24 * 60 * 60 * 1000)));
}

function getWeekRange(today: string): { start: string; end: string } {
  const [y, m, d] = today.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const day = date.getDay();
  const monOffset = day === 0 ? -6 : 1 - day;
  const mon = new Date(date);
  mon.setDate(date.getDate() + monOffset);
  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  return { start: fmt(mon), end: fmt(sun) };
}

function getNext7Range(today: string): { start: string; end: string } {
  const [y, m, d] = today.split("-").map(Number);
  const start = new Date(y, m - 1, d);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const fmt = (x: Date) => x.toISOString().slice(0, 10);
  return { start: fmt(start), end: fmt(end) };
}

function getMonthRange(today: string): { start: string; end: string } {
  const [y, m] = today.split("-").map(Number);
  const start = `${y}-${String(m).padStart(2, "0")}-01`;
  const last = new Date(y, m, 0);
  const end = `${y}-${String(m).padStart(2, "0")}-${String(last.getDate()).padStart(2, "0")}`;
  return { start, end };
}

export default function BookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [datePreset, setDatePreset] = useState<DatePreset>("");
  const [hasInvoiceFilter, setHasInvoiceFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("checkIn");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [deletingBookingId, setDeletingBookingId] = useState<string | null>(null);
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

  const loadBookings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/bookings");
      const data = await res.json();
      if (data.success) setBookings(data.bookings);
    } catch (e) {
      console.error("Error loading bookings:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.has("arrivals_today")) {
      setDatePreset("arrivals_today");
      setStartDate("");
      setEndDate("");
      setPage(1);
    } else if (params.has("departures_today")) {
      setDatePreset("departures_today");
      setStartDate("");
      setEndDate("");
      setPage(1);
    }
  }, []);

  const today = todaySL();

  const filteredBookings = useMemo(() => {
    let list = bookings.filter((b) => {
      const matchSearch =
        !debouncedSearch ||
        b.bookingNumber.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        b.guest.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        b.guest.email?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        [b.guest.phone, b.guest.phone2, b.guest.phone3]
          .filter(Boolean)
          .some((p) => String(p).includes(debouncedSearch));

      const matchStatus = statusFilter === "all" || b.status === statusFilter;

      let matchDate = true;
      if (datePreset === "arrivals_today") matchDate = b.checkIn === today;
      else if (datePreset === "departures_today") matchDate = b.checkOut === today;
      else if (datePreset === "this_week") {
        const { start, end } = getWeekRange(today);
        matchDate = b.checkIn <= end && b.checkOut >= start;
      } else if (datePreset === "next_7") {
        const { start, end } = getNext7Range(today);
        matchDate = b.checkIn <= end && b.checkOut >= start;
      } else if (datePreset === "this_month") {
        const { start, end } = getMonthRange(today);
        matchDate = b.checkIn <= end && b.checkOut >= start;
      } else {
        if (startDate) matchDate = matchDate && new Date(b.checkIn) >= new Date(startDate);
        if (endDate) matchDate = matchDate && new Date(b.checkOut) <= new Date(endDate);
      }

      const matchInvoice =
        hasInvoiceFilter === "all" ||
        (hasInvoiceFilter === "yes" && !!b.invoiceId) ||
        (hasInvoiceFilter === "no" && !b.invoiceId);

      return matchSearch && matchStatus && matchDate && matchInvoice;
    });

    const mult = sortDir === "asc" ? 1 : -1;
    list = [...list].sort((a, b) => {
      let va: string | number = "";
      let vb: string | number = "";
      switch (sortKey) {
        case "bookingNumber":
          va = a.bookingNumber;
          vb = b.bookingNumber;
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
        case "roomType":
          va = (a.roomType || "").toLowerCase();
          vb = (b.roomType || "").toLowerCase();
          break;
        case "status":
          va = a.status;
          vb = b.status;
          break;
        default:
          return 0;
      }
      return mult * String(va).localeCompare(String(vb));
    });

    return list;
  }, [
    bookings,
    debouncedSearch,
    statusFilter,
    startDate,
    endDate,
    datePreset,
    hasInvoiceFilter,
    sortKey,
    sortDir,
    today,
  ]);

  const totalPages = Math.ceil(filteredBookings.length / PAGE_SIZE) || 1;
  const paginatedBookings = useMemo(
    () =>
      filteredBookings.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filteredBookings, page]
  );

  const arrivalsToday = useMemo(
    () => bookings.filter((b) => b.checkIn === today).length,
    [bookings, today]
  );
  const departuresToday = useMemo(
    () => bookings.filter((b) => b.checkOut === today).length,
    [bookings, today]
  );

  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; num: string } | null>(null);

  const handleDeleteClick = (id: string, num: string) => {
    setDeleteConfirm({ id, num });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;
    setDeletingBookingId(deleteConfirm.id);
    try {
      const res = await fetch(`/api/bookings/${deleteConfirm.id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) await loadBookings();
      else alert(data.error || "Failed to delete");
    } catch (e) {
      console.error(e);
      alert("Error deleting booking.");
    } finally {
      setDeletingBookingId(null);
      setDeleteConfirm(null);
    }
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setDebouncedSearch("");
    setStatusFilter("all");
    setStartDate("");
    setEndDate("");
    setDatePreset("");
    setHasInvoiceFilter("all");
    setPage(1);
  };

  const setQuickFilter = (preset: DatePreset) => {
    setDatePreset(preset);
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir(key === "checkIn" || key === "checkOut" ? "desc" : "asc");
    }
    setPage(1);
  };

  const hasActiveFilters =
    statusFilter !== "all" ||
    startDate ||
    endDate ||
    datePreset ||
    hasInvoiceFilter !== "all" ||
    !!debouncedSearch;

  const getStatusBadge = (status: BookingStatus) => {
    const styles: Record<BookingStatus, string> = {
      booked: "bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200",
      confirmed: "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200",
      checked_in: "bg-green-100 text-green-800 border-green-200 hover:bg-green-200",
      checked_out: "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200",
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
      "Booking #",
      "Guest",
      "Title",
      "Check-in",
      "Check-out",
      "Nights",
      "Room Type",
      "Adults",
      "Children",
      "Babies",
      "Status",
      "Invoice",
    ];
    const escape = (v: string | number) => {
      const s = String(v ?? "");
      return `"${s.replace(/"/g, '""')}"`;
    };
    const rows = filteredBookings.map((b) =>
      [
        b.bookingNumber,
        b.guest.name || "",
        b.guest.title || "",
        b.checkIn,
        b.checkOut,
        nights(b.checkIn, b.checkOut),
        b.roomType || "",
        b.adults ?? "",
        b.children ?? "",
        b.babies ?? "",
        b.status,
        b.invoiceId ? "Yes" : "No",
      ].map(escape).join(",")
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bookings-${today}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const confirmedCount = bookings.filter((b) => b.status === "confirmed").length;
  const checkedInCount = bookings.filter((b) => b.status === "checked_in").length;
  const checkedOutCount = bookings.filter((b) => b.status === "checked_out").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bookings</h1>
          <p className="text-muted-foreground">Manage guest bookings and reservations</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => loadBookings()} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Link href="/bookings/calendar">
            <Button variant="outline">
              <CalendarDays className="mr-2 h-4 w-4" />
              Calendar
            </Button>
          </Link>
          <Link href="/bookings/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Booking
            </Button>
          </Link>
        </div>
      </div>

      {/* Banners */}
      {(arrivalsToday > 0 || departuresToday > 0) && (
        <div className="flex flex-wrap gap-4">
          {arrivalsToday > 0 && (
            <div className="rounded-lg border bg-blue-50 px-4 py-2 text-sm font-medium text-blue-800 border-blue-200">
              {arrivalsToday} arrival{arrivalsToday !== 1 ? "s" : ""} today
            </div>
          )}
          {departuresToday > 0 && (
            <div className="rounded-lg border bg-amber-50 px-4 py-2 text-sm font-medium text-amber-800 border-amber-200">
              {departuresToday} departure{departuresToday !== 1 ? "s" : ""} today
            </div>
          )}
        </div>
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
            <div className="text-2xl font-bold">{bookings.length}</div>
          </CardContent>
        </button>
        <button
          type="button"
          onClick={() => {
            setStatusFilter("confirmed");
            setDatePreset("");
            setPage(1);
          }}
          className="text-left rounded-lg border bg-card p-4 hover:bg-accent/50 transition-colors"
        >
          <CardHeader className="p-0 pb-1">
            <CardTitle className="text-sm font-medium text-muted-foreground">Confirmed</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="text-2xl font-bold text-blue-600">{confirmedCount}</div>
          </CardContent>
        </button>
        <button
          type="button"
          onClick={() => {
            setStatusFilter("checked_in");
            setDatePreset("");
            setPage(1);
          }}
          className="text-left rounded-lg border bg-card p-4 hover:bg-accent/50 transition-colors"
        >
          <CardHeader className="p-0 pb-1">
            <CardTitle className="text-sm font-medium text-muted-foreground">Checked In</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="text-2xl font-bold text-green-600">{checkedInCount}</div>
          </CardContent>
        </button>
        <button
          type="button"
          onClick={() => {
            setStatusFilter("checked_out");
            setDatePreset("");
            setPage(1);
          }}
          className="text-left rounded-lg border bg-card p-4 hover:bg-accent/50 transition-colors"
        >
          <CardHeader className="p-0 pb-1">
            <CardTitle className="text-sm font-medium text-muted-foreground">Checked Out</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="text-2xl font-bold text-gray-600">{checkedOutCount}</div>
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
            <Button
              variant={datePreset === "" ? "default" : "outline"}
              size="sm"
              onClick={() => setQuickFilter("")}
            >
              All
            </Button>
            <Button
              variant={datePreset === "arrivals_today" ? "default" : "outline"}
              size="sm"
              onClick={() => setQuickFilter("arrivals_today")}
            >
              Arrivals today
            </Button>
            <Button
              variant={datePreset === "departures_today" ? "default" : "outline"}
              size="sm"
              onClick={() => setQuickFilter("departures_today")}
            >
              Departures today
            </Button>
            <Button
              variant={datePreset === "this_week" ? "default" : "outline"}
              size="sm"
              onClick={() => setQuickFilter("this_week")}
            >
              This week
            </Button>
            <Button
              variant={datePreset === "next_7" ? "default" : "outline"}
              size="sm"
              onClick={() => setQuickFilter("next_7")}
            >
              Next 7 days
            </Button>
            <Button
              variant={datePreset === "this_month" ? "default" : "outline"}
              size="sm"
              onClick={() => setQuickFilter("this_month")}
            >
              This month
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2 relative">
              <Label htmlFor="bookings-search">Search</Label>
              <div className="relative">
                <Input
                  id="bookings-search"
                  placeholder="Booking #, guest, email, phone..."
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
                  <SelectItem value="booked">Booked</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="checked_in">Checked In</SelectItem>
                  <SelectItem value="checked_out">Checked Out</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
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
            <div className="space-y-2">
              <Label>Invoice</Label>
              <Select value={hasInvoiceFilter} onValueChange={(v) => { setHasInvoiceFilter(v); setPage(1); }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="yes">Has invoice</SelectItem>
                  <SelectItem value="no">No invoice</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle>All Bookings ({filteredBookings.length})</CardTitle>
            <Button variant="outline" size="sm" onClick={exportCsv} disabled={filteredBookings.length === 0}>
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
                      <button type="button" onClick={() => handleSort("bookingNumber")} className="flex items-center gap-1 font-medium">
                        Booking # {sortKey === "bookingNumber" && (sortDir === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}
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
                      <button type="button" onClick={() => handleSort("roomType")} className="flex items-center gap-1 font-medium">
                        Room {sortKey === "roomType" && (sortDir === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}
                      </button>
                    </TableHead>
                    <TableHead>Guests</TableHead>
                    <TableHead>
                      <button type="button" onClick={() => handleSort("status")} className="flex items-center gap-1 font-medium">
                        Status {sortKey === "status" && (sortDir === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}
                      </button>
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedBookings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-12">
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                          <Users className="h-12 w-12 opacity-50" />
                          <p className="font-medium">No bookings match your filters</p>
                          <p className="text-sm">Try changing filters or create a new booking.</p>
                          <Button variant="outline" onClick={handleResetFilters}>
                            Reset filters
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedBookings.map((booking, idx) => {
                      const totalGuests = (booking.adults || 0) + (booking.children || 0) + (booking.babies || 0);
                      const extra = booking.guests?.length ?? 0;
                      const isArriving = booking.checkIn === today;
                      const isDeparting = booking.checkOut === today;
                      return (
                        <TableRow
                          key={booking.id}
                          className={`
                            cursor-pointer ${idx % 2 === 1 ? "bg-muted/30" : ""}
                            ${isArriving ? "border-l-4 border-l-blue-500" : ""}
                            ${isDeparting && !isArriving ? "border-l-4 border-l-amber-500" : ""}
                          `}
                          onClick={() => router.push(`/bookings/${booking.id}`)}
                        >
                          <TableCell className="font-medium">
                            {booking.bookingNumber}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {booking.guest.title ? `${booking.guest.title} ` : ""}
                                {booking.guest.name}
                                {extra > 0 && (
                                  <span className="text-muted-foreground font-normal"> +{extra}</span>
                                )}
                              </span>
                              {booking.guest.email && (
                                <span className="text-xs text-muted-foreground">{booking.guest.email}</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <LogIn className="h-3 w-3 text-muted-foreground" />
                              {formatDateSL(booking.checkIn)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <LogOut className="h-3 w-3 text-muted-foreground" />
                              {formatDateSL(booking.checkOut)}
                            </div>
                          </TableCell>
                          <TableCell>
                            {nights(booking.checkIn, booking.checkOut)}
                          </TableCell>
                          <TableCell>
                            {booking.roomType ? (
                              <Badge variant="secondary" className="font-normal">
                                {booking.roomType}
                              </Badge>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          <TableCell>
                            {totalGuests > 0 ? (
                              <div className="flex flex-col text-sm">
                                {booking.adults && booking.adults > 0 && (
                                  <span>{booking.adults} adult{booking.adults !== 1 ? "s" : ""}</span>
                                )}
                                {booking.children && booking.children > 0 && (
                                  <span>{booking.children} child{booking.children !== 1 ? "ren" : ""}</span>
                                )}
                                {booking.babies && booking.babies > 0 && (
                                  <span>{booking.babies} bab{booking.babies !== 1 ? "ies" : "y"}</span>
                                )}
                              </div>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(booking.status)}
                          </TableCell>
                          <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex justify-end gap-1">
                              <Link href={`/bookings/${booking.id}`}>
                                <Button variant="ghost" size="sm" title="View">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>
                              {booking.status !== "checked_out" && booking.status !== "cancelled" && (
                                <>
                                  <Link href={`/bookings/${booking.id}/edit`}>
                                    <Button variant="ghost" size="sm" title="Edit">
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                  </Link>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteClick(booking.id, booking.bookingNumber)}
                                    disabled={deletingBookingId === booking.id}
                                    title="Delete"
                                  >
                                    <Trash2 className="h-4 w-4 text-red-600" />
                                  </Button>
                                </>
                              )}
                              {booking.status === "checked_out" && currentUser?.role === "super_admin" && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteClick(booking.id, booking.bookingNumber)}
                                    disabled={deletingBookingId === booking.id}
                                    title="Delete (Super Admin)"
                                >
                                  <Trash2 className="h-4 w-4 text-red-600" />
                                </Button>
                              )}
                              {booking.invoiceId ? (
                                <Link href={`/invoices/${booking.invoiceId}`}>
                                  <Button variant="ghost" size="sm" title="View invoice">
                                    <FileText className="h-4 w-4 text-green-600" />
                                  </Button>
                                </Link>
                              ) : (
                                <span className="inline-flex h-8 w-8 items-center justify-center text-muted-foreground" title="No invoice">
                                  <FileText className="h-4 w-4 opacity-40" />
                                </span>
                              )}
                              <Link href="/bookings/calendar" title="View on calendar">
                                <Button variant="ghost" size="sm">
                                  <Calendar className="h-4 w-4" />
                                </Button>
                              </Link>
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

          {!loading && filteredBookings.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages} ({filteredBookings.length} bookings)
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDeleteDialog
        open={!!deleteConfirm}
        onOpenChange={(open) => !open && setDeleteConfirm(null)}
        title="Delete Booking"
        description={
          deleteConfirm
            ? `Are you sure you want to delete booking ${deleteConfirm.num}? This cannot be undone.`
            : ""
        }
        onConfirm={handleDeleteConfirm}
        loading={!!deletingBookingId}
      />
    </div>
  );
}
