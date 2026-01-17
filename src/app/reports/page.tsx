"use client";

import { useState, useEffect } from "react";
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
import { formatCurrency } from "@/lib/currency";
import { Invoice, Currency } from "@/types/invoice";
import { FileText, DollarSign, Calendar, Download, Filter } from "lucide-react";
import Link from "next/link";

export default function ReportsPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currencyFilter, setCurrencyFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInvoices();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [invoices, startDate, endDate, statusFilter, currencyFilter]);

  const loadInvoices = async () => {
    try {
      const data = await getInvoices();
      setInvoices(data);
      setFilteredInvoices(data);
      setLoading(false);
    } catch (error) {
      console.error("Error loading invoices:", error);
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...invoices];

    // Date filter
    if (startDate) {
      filtered = filtered.filter(
        (inv) => new Date(inv.checkIn) >= new Date(startDate)
      );
    }
    if (endDate) {
      filtered = filtered.filter(
        (inv) => new Date(inv.checkOut) <= new Date(endDate)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((inv) => inv.status === statusFilter);
    }

    // Currency filter
    if (currencyFilter !== "all") {
      filtered = filtered.filter((inv) => inv.currency === currencyFilter);
    }

    setFilteredInvoices(filtered);
  };

  const getStatusBadge = (status: string) => {
    const statusStyles: Record<string, string> = {
      paid: "bg-green-100 text-green-800 border-green-200 hover:bg-green-200",
      partially_paid: "bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200",
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200",
      sent: "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200",
      draft: "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200",
      cancelled: "bg-red-100 text-red-800 border-red-200 hover:bg-red-200",
    };
    
    const statusLabels: Record<string, string> = {
      partially_paid: "Partially Paid",
    };

    return (
      <Badge 
        variant="outline" 
        className={statusStyles[status] || "bg-gray-100 text-gray-800 border-gray-200"}
      >
        {statusLabels[status] || status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ')}
      </Badge>
    );
  };

  // Calculate statistics
  const totalInvoices = filteredInvoices.length;
  const paidInvoices = filteredInvoices.filter((inv) => inv.status === "paid");
  const partiallyPaidInvoices = filteredInvoices.filter((inv) => inv.status === "partially_paid");
  const pendingInvoices = filteredInvoices.filter((inv) => inv.status === "pending");
  const sentInvoices = filteredInvoices.filter((inv) => inv.status === "sent");
  const draftInvoices = filteredInvoices.filter((inv) => inv.status === "draft");
  const cancelledInvoices = filteredInvoices.filter((inv) => inv.status === "cancelled");

  // Calculate revenue by currency separately (never combine USD and LKR)
  const usdRevenue = paidInvoices
    .filter((inv) => inv.currency === "USD")
    .reduce((sum, inv) => sum + inv.total, 0);
  const lkrRevenue = paidInvoices
    .filter((inv) => inv.currency === "LKR")
    .reduce((sum, inv) => sum + inv.total, 0);

  const handleExport = () => {
    // Create CSV content
    const headers = [
      "Invoice Number",
      "Guest Name",
      "Check-in",
      "Check-out",
      "Currency",
      "Subtotal",
      "Service Charge",
      "Tax",
      "Discount",
      "Total",
      "Status",
      "Payment Methods",
      "Created Date",
    ];

    const rows = filteredInvoices.map((inv) => [
      inv.invoiceNumber,
      inv.guest.name || "-",
      inv.checkIn,
      inv.checkOut,
      inv.currency,
      inv.subtotal.toFixed(2),
      inv.serviceCharge.toFixed(2),
      inv.taxAmount.toFixed(2),
      inv.discount.toFixed(2),
      inv.total.toFixed(2),
      inv.status,
      inv.paymentMethods.join(", "),
      new Date(inv.createdAt).toLocaleDateString(),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `invoice-report-${startDate || "all"}-${endDate || "all"}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleResetFilters = () => {
    setStartDate("");
    setEndDate("");
    setStatusFilter("all");
    setCurrencyFilter("all");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading reports...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">
            View and analyze invoice data and statistics
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleResetFilters}>
            <Filter className="mr-2 h-4 w-4" />
            Reset Filters
          </Button>
          <Button onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="partially_paid">Partially Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select value={currencyFilter} onValueChange={setCurrencyFilter}>
                <SelectTrigger id="currency">
                  <SelectValue placeholder="All Currencies" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Currencies</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="LKR">LKR</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInvoices}</div>
            <p className="text-xs text-muted-foreground">
              {invoices.length} total in system
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">USD Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(usdRevenue, "USD")}
            </div>
            <p className="text-xs text-muted-foreground">
              {paidInvoices.filter((inv) => inv.currency === "USD").length} paid invoices
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">LKR Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(lkrRevenue, "LKR")}
            </div>
            <p className="text-xs text-muted-foreground">
              {paidInvoices.filter((inv) => inv.currency === "LKR").length} paid invoices
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Invoices</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingInvoices.length}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting payment
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Status Breakdown */}
      <div className="grid gap-4 md:grid-cols-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{paidInvoices.length}</div>
            <div className="space-y-1 mt-2">
              <p className="text-xs text-muted-foreground">
                USD: {formatCurrency(usdRevenue, "USD")}
              </p>
              <p className="text-xs text-muted-foreground">
                LKR: {formatCurrency(lkrRevenue, "LKR")}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Partially Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{partiallyPaidInvoices.length}</div>
            <div className="space-y-1 mt-2">
              <p className="text-xs text-muted-foreground">
                USD: {formatCurrency(
                  partiallyPaidInvoices.filter((inv) => inv.currency === "USD").reduce((sum, inv) => sum + inv.total, 0),
                  "USD"
                )}
              </p>
              <p className="text-xs text-muted-foreground">
                LKR: {formatCurrency(
                  partiallyPaidInvoices.filter((inv) => inv.currency === "LKR").reduce((sum, inv) => sum + inv.total, 0),
                  "LKR"
                )}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingInvoices.length}</div>
            <div className="space-y-1 mt-2">
              <p className="text-xs text-muted-foreground">
                USD: {formatCurrency(
                  pendingInvoices.filter((inv) => inv.currency === "USD").reduce((sum, inv) => sum + inv.total, 0),
                  "USD"
                )}
              </p>
              <p className="text-xs text-muted-foreground">
                LKR: {formatCurrency(
                  pendingInvoices.filter((inv) => inv.currency === "LKR").reduce((sum, inv) => sum + inv.total, 0),
                  "LKR"
                )}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Sent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sentInvoices.length}</div>
            <div className="space-y-1 mt-2">
              <p className="text-xs text-muted-foreground">
                USD: {formatCurrency(
                  sentInvoices.filter((inv) => inv.currency === "USD").reduce((sum, inv) => sum + inv.total, 0),
                  "USD"
                )}
              </p>
              <p className="text-xs text-muted-foreground">
                LKR: {formatCurrency(
                  sentInvoices.filter((inv) => inv.currency === "LKR").reduce((sum, inv) => sum + inv.total, 0),
                  "LKR"
                )}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Draft</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{draftInvoices.length}</div>
            <p className="text-xs text-muted-foreground">
              Not yet finalized
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Cancelled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cancelledInvoices.length}</div>
            <p className="text-xs text-muted-foreground">
              Cancelled invoices
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Invoice List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Invoice Details ({filteredInvoices.length})</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {filteredInvoices.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No invoices found matching the selected filters
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Guest</TableHead>
                    <TableHead>Check-in</TableHead>
                    <TableHead>Check-out</TableHead>
                    <TableHead>Currency</TableHead>
                    <TableHead>Subtotal</TableHead>
                    <TableHead>Service Charge</TableHead>
                    <TableHead>Tax</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment Methods</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">
                        {invoice.invoiceNumber}
                      </TableCell>
                      <TableCell>{invoice.guest.name || "-"}</TableCell>
                      <TableCell>
                        {new Date(invoice.checkIn).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {new Date(invoice.checkOut).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{invoice.currency}</TableCell>
                      <TableCell>
                        {formatCurrency(invoice.subtotal, invoice.currency)}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(invoice.serviceCharge, invoice.currency)}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(invoice.taxAmount, invoice.currency)}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(invoice.discount, invoice.currency)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(invoice.total, invoice.currency)}
                      </TableCell>
                      <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {invoice.paymentMethods.map((method) => (
                            <Badge key={method} variant="outline" className="text-xs">
                              {method.replace("_", " ")}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/invoices/${invoice.id}`}>
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
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
    </div>
  );
}
