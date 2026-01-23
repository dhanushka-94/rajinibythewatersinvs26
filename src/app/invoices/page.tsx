"use client";

import { useState, useEffect } from "react";
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
import { formatDateSL } from "@/lib/date-sl";
import Link from "next/link";
import { Eye, Plus, Filter, X, Pencil, Trash2, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Invoice } from "@/types/invoice";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currencyFilter, setCurrencyFilter] = useState<string>("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [deletingInvoiceId, setDeletingInvoiceId] = useState<string | null>(null);

  useEffect(() => {
    const loadInvoices = async () => {
      const data = await getInvoices();
      setInvoices(data);
    };
    loadInvoices();
  }, []);

  const handleDelete = async (invoiceId: string, invoiceNumber: string) => {
    if (!confirm(`Are you sure you want to delete invoice ${invoiceNumber}? This action cannot be undone.`)) {
      return;
    }

    setDeletingInvoiceId(invoiceId);
    try {
      await deleteInvoice(invoiceId);
      // Reload invoices
      const data = await getInvoices();
      setInvoices(data);
    } catch (error) {
      console.error("Error deleting invoice:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to delete invoice. Please try again.";
      alert(errorMessage);
    } finally {
      setDeletingInvoiceId(null);
    }
  };

  // Helper function to calculate remaining balance
  const calculateRemainingBalance = (invoice: Invoice): number => {
    const totalPaid = (invoice.payments || []).reduce((sum, p) => sum + p.amount, 0);
    return invoice.total - totalPaid;
  };

  // Helper function to check if invoice is due
  const isDueInvoice = (invoice: Invoice): boolean => {
    const remainingBalance = calculateRemainingBalance(invoice);
    return remainingBalance > 0 && invoice.status !== "paid" && invoice.status !== "cancelled";
  };

  const filteredInvoices = invoices.filter((invoice) => {
    // Search filter
    const matchesSearch = 
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.guest.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.guest.email?.toLowerCase().includes(searchTerm.toLowerCase());

    // Status filter (including "due" filter)
    let matchesStatus = true;
    if (statusFilter === "due") {
      matchesStatus = isDueInvoice(invoice);
    } else if (statusFilter !== "all") {
      matchesStatus = invoice.status === statusFilter;
    }

    // Currency filter
    const matchesCurrency = currencyFilter === "all" || invoice.currency === currencyFilter;

    // Date filters
    const matchesStartDate = !startDate || new Date(invoice.checkIn) >= new Date(startDate);
    const matchesEndDate = !endDate || new Date(invoice.checkOut) <= new Date(endDate);

    return matchesSearch && matchesStatus && matchesCurrency && matchesStartDate && matchesEndDate;
  });

  // Calculate due invoices
  const dueInvoices = invoices.filter(isDueInvoice);
  
  // Separate by currency
  const usdDueAmount = dueInvoices
    .filter((inv) => inv.currency === "USD")
    .reduce((sum, inv) => sum + calculateRemainingBalance(inv), 0);
  const lkrDueAmount = dueInvoices
    .filter((inv) => inv.currency === "LKR")
    .reduce((sum, inv) => sum + calculateRemainingBalance(inv), 0);

  const handleResetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setCurrencyFilter("all");
    setStartDate("");
    setEndDate("");
  };

  const hasActiveFilters = statusFilter !== "all" || currencyFilter !== "all" || startDate || endDate;
  const getStatusBadge = (status: string) => {
    const statusStyles: Record<string, string> = {
      paid: "bg-green-100 text-green-800 border-green-200 hover:bg-green-200",
      partially_paid: "bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200",
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200",
      sent: "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200",
      draft: "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200",
      cancelled: "bg-red-100 text-red-800 border-red-200 hover:bg-red-200",
    };

    return (
      <Badge 
        variant="outline" 
        className={statusStyles[status] || "bg-gray-100 text-gray-800 border-gray-200"}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground">
            Manage and view all hotel invoices
          </p>
        </div>
        <Link href="/invoices/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Invoice
          </Button>
        </Link>
      </div>

      {/* Due Invoices Summary Card */}
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
                  setSearchTerm("");
                  setCurrencyFilter("all");
                  setStartDate("");
                  setEndDate("");
                }}
              >
                View All Due Invoices ({dueInvoices.length})
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Due Invoices</p>
                <p className="text-2xl font-bold text-orange-900">
                  {dueInvoices.length}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  invoice{dueInvoices.length !== 1 ? 's' : ''} with outstanding balance
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">USD Due</p>
                <p className="text-2xl font-bold text-orange-900">
                  {formatCurrency(usdDueAmount, "USD")}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {dueInvoices.filter((inv) => inv.currency === "USD").length} invoice{dueInvoices.filter((inv) => inv.currency === "USD").length !== 1 ? 's' : ''}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">LKR Due</p>
                <p className="text-2xl font-bold text-orange-900">
                  {formatCurrency(lkrDueAmount, "LKR")}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {dueInvoices.filter((inv) => inv.currency === "LKR").length} invoice{dueInvoices.filter((inv) => inv.currency === "LKR").length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Filters</CardTitle>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={handleResetFilters}>
                <X className="mr-2 h-4 w-4" />
                Reset Filters
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Invoice #, Guest name, Email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
                  <SelectItem value="due">Due (Outstanding Balance)</SelectItem>
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
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Invoices ({filteredInvoices.length})</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Guest</TableHead>
                <TableHead>Check-in</TableHead>
                <TableHead>Check-out</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No invoices found matching the selected filters
                  </TableCell>
                </TableRow>
              ) : (
                filteredInvoices.map((invoice) => {
                  const remainingBalance = calculateRemainingBalance(invoice);
                  const isDue = isDueInvoice(invoice);
                  
                  return (
                    <TableRow 
                      key={invoice.id}
                      className={isDue ? "bg-orange-50/50 hover:bg-orange-100/50" : ""}
                    >
                      <TableCell className="font-medium">
                        {invoice.invoiceNumber}
                        {isDue && (
                          <AlertCircle className="inline-block ml-2 h-4 w-4 text-orange-600" />
                        )}
                      </TableCell>
                      <TableCell>{invoice.guest.name}</TableCell>
                      <TableCell>
                        {formatDateSL(invoice.checkIn)}
                      </TableCell>
                      <TableCell>
                        {formatDateSL(invoice.checkOut)}
                      </TableCell>
                      <TableCell>{formatCurrency(invoice.total, invoice.currency)}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className={remainingBalance > 0 ? "font-semibold text-orange-600" : "text-green-600"}>
                            {formatCurrency(remainingBalance, invoice.currency)}
                          </span>
                          {remainingBalance > 0 && (
                            <span className="text-xs text-muted-foreground">
                              {formatCurrency((invoice.payments || []).reduce((sum, p) => sum + p.amount, 0), invoice.currency)} paid
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/invoices/${invoice.id}`}>
                            <Button variant="ghost" size="sm" title="View">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          {invoice.status !== "paid" ? (
                            <>
                              <Link href={`/invoices/${invoice.id}/edit`}>
                                <Button variant="ghost" size="sm" title="Edit">
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(invoice.id, invoice.invoiceNumber)}
                                disabled={deletingInvoiceId === invoice.id}
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </>
                          ) : (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <AlertCircle className="h-4 w-4" />
                              <span>Protected</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
