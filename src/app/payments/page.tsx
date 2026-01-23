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
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getInvoices } from "@/lib/invoices";
import { formatCurrency } from "@/lib/currency";
import { formatDateSL } from "@/lib/date-sl";
import { Invoice, Payment } from "@/types/invoice";
import { X, Download, DollarSign } from "lucide-react";
import Link from "next/link";

interface PaymentTransaction {
  id: string;
  payment: Payment;
  invoiceId: string;
  invoiceNumber: string;
  guestName: string;
  currency: string;
  invoiceTotal: number;
}

export default function PaymentsPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currencyFilter, setCurrencyFilter] = useState<string>("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInvoices = async () => {
      try {
        const data = await getInvoices();
        setInvoices(data);
        
        // Extract all payments from all invoices
        const allTransactions: PaymentTransaction[] = [];
        data.forEach((invoice) => {
          if (invoice.payments && invoice.payments.length > 0) {
            invoice.payments.forEach((payment) => {
              allTransactions.push({
                id: payment.id,
                payment: payment,
                invoiceId: invoice.id,
                invoiceNumber: invoice.invoiceNumber,
                guestName: invoice.guest.name || "Unknown",
                currency: invoice.currency,
                invoiceTotal: invoice.total,
              });
            });
          }
        });
        
        // Sort by payment date (newest first)
        allTransactions.sort((a, b) => 
          new Date(b.payment.date).getTime() - new Date(a.payment.date).getTime()
        );
        
        setTransactions(allTransactions);
        setLoading(false);
      } catch (error) {
        console.error("Error loading payments:", error);
        setLoading(false);
      }
    };
    loadInvoices();
  }, []);

  const filteredTransactions = transactions.filter((transaction) => {
    // Search filter
    const matchesSearch = 
      transaction.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.payment.notes?.toLowerCase().includes(searchTerm.toLowerCase());

    // Currency filter
    const matchesCurrency = currencyFilter === "all" || transaction.currency === currencyFilter;

    // Date filters
    const matchesStartDate = !startDate || new Date(transaction.payment.date) >= new Date(startDate);
    const matchesEndDate = !endDate || new Date(transaction.payment.date) <= new Date(endDate);

    // Amount filters
    const matchesMinAmount = !minAmount || transaction.payment.amount >= parseFloat(minAmount);
    const matchesMaxAmount = !maxAmount || transaction.payment.amount <= parseFloat(maxAmount);

    return matchesSearch && matchesCurrency && matchesStartDate && matchesEndDate && matchesMinAmount && matchesMaxAmount;
  });

  const handleResetFilters = () => {
    setSearchTerm("");
    setCurrencyFilter("all");
    setStartDate("");
    setEndDate("");
    setMinAmount("");
    setMaxAmount("");
  };

  const hasActiveFilters = currencyFilter !== "all" || startDate || endDate || minAmount || maxAmount || searchTerm;

  // Calculate totals
  const totalAmount = filteredTransactions.reduce((sum, t) => sum + t.payment.amount, 0);
  const usdTotal = filteredTransactions
    .filter((t) => t.currency === "USD")
    .reduce((sum, t) => sum + t.payment.amount, 0);
  const lkrTotal = filteredTransactions
    .filter((t) => t.currency === "LKR")
    .reduce((sum, t) => sum + t.payment.amount, 0);

  const handleExport = () => {
    const headers = [
      "Payment Date",
      "Invoice Number",
      "Guest Name",
      "Currency",
      "Payment Amount",
      "Invoice Total",
      "Notes",
      "Created At",
    ];

    const rows = filteredTransactions.map((t) => [
      t.payment.date,
      t.invoiceNumber,
      t.guestName,
      t.currency,
      t.payment.amount.toFixed(2),
      t.invoiceTotal.toFixed(2),
      t.payment.notes || "",
      formatDateSL(t.payment.createdAt),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `payment-transactions-${startDate || "all"}-${endDate || "all"}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading payment transactions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payment Transactions</h1>
          <p className="text-muted-foreground">
            View and filter all payment transactions across invoices
          </p>
        </div>
        <div className="flex gap-2">
          {hasActiveFilters && (
            <Button variant="outline" onClick={handleResetFilters}>
              <X className="mr-2 h-4 w-4" />
              Reset Filters
            </Button>
          )}
          <Button onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredTransactions.length}</div>
            <p className="text-xs text-muted-foreground">
              {transactions.length} total in system
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">USD Payments</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(usdTotal, "USD")}</div>
            <p className="text-xs text-muted-foreground">
              {filteredTransactions.filter((t) => t.currency === "USD").length} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">LKR Payments</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(lkrTotal, "LKR")}</div>
            <p className="text-xs text-muted-foreground">
              {filteredTransactions.filter((t) => t.currency === "LKR").length} transactions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Filters</CardTitle>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={handleResetFilters}>
                <X className="mr-2 h-4 w-4" />
                Reset
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Invoice #, Guest, Notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
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
            <div className="space-y-2">
              <Label htmlFor="minAmount">Min Amount</Label>
              <Input
                id="minAmount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxAmount">Max Amount</Label>
              <Input
                id="maxAmount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={maxAmount}
                onChange={(e) => setMaxAmount(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Transactions ({filteredTransactions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No payment transactions found matching the selected filters
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Payment Date</TableHead>
                    <TableHead>Invoice Number</TableHead>
                    <TableHead>Guest Name</TableHead>
                    <TableHead>Currency</TableHead>
                    <TableHead>Payment Amount</TableHead>
                    <TableHead>Invoice Total</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        {formatDateSL(transaction.payment.date)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {transaction.invoiceNumber}
                      </TableCell>
                      <TableCell>{transaction.guestName}</TableCell>
                      <TableCell>{transaction.currency}</TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(transaction.payment.amount, transaction.currency as "USD" | "LKR")}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(transaction.invoiceTotal, transaction.currency as "USD" | "LKR")}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {transaction.payment.notes || "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/invoices/${transaction.invoiceId}`}>
                          <Button variant="ghost" size="sm">
                            View Invoice
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
