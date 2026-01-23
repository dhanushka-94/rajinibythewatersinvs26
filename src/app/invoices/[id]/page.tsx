"use client";

import { useState, useEffect, use } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getInvoiceById, updateInvoice } from "@/lib/invoices";
import { Printer, ArrowLeft, DollarSign, Send, CheckCircle, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { InvoiceLayout } from "@/components/invoice/invoice-layout";
import { InvoicePrintLayout } from "@/components/invoice/invoice-print-layout";
import { Invoice, Payment } from "@/types/invoice";
import { formatCurrency } from "@/lib/currency";
import { createRoot } from "react-dom/client";
import React from "react";

export default function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentAmount, setPaymentAmount] = useState<string>("");
  const [paymentNotes, setPaymentNotes] = useState("");
  const [paymentCardLast4Digits, setPaymentCardLast4Digits] = useState<string>("");
  const [emailRecipient, setEmailRecipient] = useState<string>("");
  const [emailRecipientName, setEmailRecipientName] = useState<string>("");
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [newStatus, setNewStatus] = useState<string>("");

  useEffect(() => {
    const loadInvoice = async () => {
      try {
        const data = await getInvoiceById(id);
        setInvoice(data || null);
      } catch (error) {
        console.error("Error loading invoice:", error);
        setInvoice(null);
      } finally {
        setLoading(false);
      }
    };
    loadInvoice();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading invoice...</p>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Invoice Not Found</h1>
          <Link href="/invoices">
            <Button>Back to Invoices</Button>
          </Link>
        </div>
      </div>
    );
  }

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

  const handlePrint = () => {
    // Hide all existing content
    const existingContent = document.querySelectorAll('body > *:not(#invoice-print-container)');
    const originalDisplays: (string | null)[] = [];
    existingContent.forEach((el) => {
      const htmlEl = el as HTMLElement;
      originalDisplays.push(htmlEl.style.display);
      htmlEl.style.display = 'none';
    });

    // Create a temporary container for the print template
    const printContainer = document.createElement('div');
    printContainer.id = 'invoice-print-container';
    printContainer.style.position = 'relative';
    printContainer.style.left = '0';
    printContainer.style.top = '0';
    printContainer.style.width = '100%';
    printContainer.style.backgroundColor = 'white';
    printContainer.style.display = 'block';
    document.body.appendChild(printContainer);

    // Render the print template
    const root = createRoot(printContainer);
    root.render(React.createElement(InvoicePrintLayout, { invoice }));
    
    // Wait for rendering then print
    setTimeout(() => {
      window.print();
      
      // Cleanup after print
      setTimeout(() => {
        root.unmount();
        if (document.body.contains(printContainer)) {
          document.body.removeChild(printContainer);
        }
        // Restore original content
        existingContent.forEach((el, index) => {
          const htmlEl = el as HTMLElement;
          htmlEl.style.display = originalDisplays[index] || '';
        });
      }, 1000);
    }, 500);
  };


  const handleRecordPayment = async () => {
    if (!invoice) return;

    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid payment amount.");
      return;
    }

    const totalPaid = (invoice.payments || []).reduce((sum, p) => sum + p.amount, 0);
    const remainingBalance = invoice.total - totalPaid;
    
    if (amount > remainingBalance) {
      alert(`Payment amount cannot exceed remaining balance of ${formatCurrency(remainingBalance, invoice.currency)}`);
      return;
    }

    // Validate card last 4 digits if card payment method is selected
    if (invoice.paymentMethods.includes("card") && !paymentCardLast4Digits) {
      alert("Card Last 4 Digits is required for card payments.");
      return;
    }

    if (invoice.paymentMethods.includes("card") && paymentCardLast4Digits.length !== 4) {
      alert("Please enter exactly 4 digits for the card number.");
      return;
    }

    try {
      const newPayment: Payment = {
        id: `payment-${Date.now()}`,
        amount: amount,
        date: paymentDate,
        notes: paymentNotes || undefined,
        cardLast4Digits: invoice.paymentMethods.includes("card") && paymentCardLast4Digits ? paymentCardLast4Digits : undefined,
        createdAt: new Date().toISOString(),
      };

      const existingPayments = invoice.payments || [];
      const updatedPayments = [...existingPayments, newPayment];
      const newTotalPaid = updatedPayments.reduce((sum, p) => sum + p.amount, 0);
      
      // Update status based on payment amount
      let newStatus: Invoice["status"];
      if (newTotalPaid >= invoice.total) {
        newStatus = "paid";
      } else if (newTotalPaid > 0) {
        newStatus = "partially_paid";
      } else {
        newStatus = invoice.status;
      }

      await updateInvoice(id, {
        payments: updatedPayments,
        status: newStatus,
      });

      // Reload invoice
      const updatedInvoice = await getInvoiceById(id);
      setInvoice(updatedInvoice || null);
      setIsPaymentDialogOpen(false);
      setPaymentAmount("");
      setPaymentNotes("");
      setPaymentCardLast4Digits("");
      setPaymentDate(new Date().toISOString().split('T')[0]);
    } catch (error) {
      console.error("Error recording payment:", error);
      alert("Failed to record payment. Please try again.");
    }
  };

  const handleStatusChange = async () => {
    if (!invoice || !newStatus) return;

    try {
      await updateInvoice(id, {
        status: newStatus as Invoice["status"],
      });

      // Reload invoice
      const updatedInvoice = await getInvoiceById(id);
      setInvoice(updatedInvoice || null);
      setIsStatusDialogOpen(false);
      setNewStatus("");
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status. Please try again.");
    }
  };

  const handleSendEmail = async () => {
    if (!emailRecipient) {
      alert("Please enter recipient email address.");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailRecipient)) {
      alert("Please enter a valid email address.");
      return;
    }

    setIsSendingEmail(true);

    try {
      const response = await fetch(`/api/invoices/${id}/send-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipientEmail: emailRecipient,
          recipientName: emailRecipientName || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to send email");
      }

      alert(`Invoice sent successfully to ${emailRecipient}`);
      setIsEmailDialogOpen(false);
      setEmailRecipient("");
      setEmailRecipientName("");
    } catch (error: any) {
      console.error("Error sending email:", error);
      alert(error.message || "Failed to send email. Please check your email service configuration.");
    } finally {
      setIsSendingEmail(false);
    }
  };

  const totalPaid = invoice ? (invoice.payments || []).reduce((sum, p) => sum + p.amount, 0) : 0;
  const remainingBalance = invoice ? invoice.total - totalPaid : 0;
  const isFullyPaid = invoice ? totalPaid >= invoice.total : false;
  const canRecordPayment = invoice && !isFullyPaid && invoice.status !== "cancelled";
  const canChangeStatus = invoice && invoice.status !== "cancelled";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-4">
          <Link href="/invoices">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {invoice.invoiceNumber}
            </h1>
            <p className="text-muted-foreground">Invoice Details</p>
          </div>
        </div>
        <div className="flex gap-2">
          {getStatusBadge(invoice.status)}
          {canChangeStatus && (
            <Button
              variant="outline"
              onClick={() => {
                setNewStatus(invoice.status);
                setIsStatusDialogOpen(true);
              }}
            >
              Change Status
            </Button>
          )}
          {canRecordPayment && (
            <Button onClick={() => {
              setPaymentAmount("");
              setIsPaymentDialogOpen(true);
            }}>
              <DollarSign className="mr-2 h-4 w-4" />
              Record Payment
            </Button>
          )}
          {invoice.status === "draft" && (
            <Button
              variant="outline"
              onClick={async () => {
                try {
                  await updateInvoice(id, { status: "sent" });
                  const updatedInvoice = await getInvoiceById(id);
                  setInvoice(updatedInvoice || null);
                } catch (error) {
                  console.error("Error updating status:", error);
                }
              }}
            >
              <Send className="mr-2 h-4 w-4" />
              Mark as Sent
            </Button>
          )}
          <Button 
            variant="outline" 
            onClick={() => {
              // Pre-fill email from invoice
              if (invoice.billingType === "company" && invoice.travelCompanyId) {
                // Could fetch travel company email here if available
                setEmailRecipient("");
              } else {
                setEmailRecipient(invoice.guest.email || "");
                setEmailRecipientName(invoice.guest.name || "");
              }
              setIsEmailDialogOpen(true);
            }}
          >
            <Send className="mr-2 h-4 w-4" />
            Send Email
          </Button>
          <Button onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Link href={`/invoices/${id}/edit`}>
            <Button variant="outline">
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </Link>
        </div>
      </div>

      {/* Payment Summary Card */}
      {invoice.payments && invoice.payments.length > 0 && (
        <Card className="print:hidden">
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 pb-4 border-b">
                <div>
                  <p className="text-sm text-muted-foreground">Invoice Total</p>
                  <p className="text-lg font-semibold">{formatCurrency(invoice.total, invoice.currency)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Paid</p>
                  <p className="text-lg font-semibold text-green-600">{formatCurrency(totalPaid, invoice.currency)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Remaining Balance</p>
                  <p className={`text-lg font-semibold ${remainingBalance > 0 ? "text-orange-600" : "text-green-600"}`}>
                    {formatCurrency(remainingBalance, invoice.currency)}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                {invoice.payments.map((payment, index) => (
                  <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{formatCurrency(payment.amount, invoice.currency)}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(payment.date).toLocaleDateString()}
                        {payment.cardLast4Digits && ` • Card: ****${payment.cardLast4Digits}`}
                        {payment.notes && ` • ${payment.notes}`}
                      </p>
                    </div>
                    <Badge variant="outline">Payment #{index + 1}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="print:hidden" id="invoice-content">
        <CardContent className="p-0">
          <InvoiceLayout invoice={invoice} showHeader={true} />
        </CardContent>
      </Card>

      {/* Payment Recording Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              Record payment for invoice {invoice?.invoiceNumber}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Invoice Total</Label>
                <Input
                  value={invoice ? formatCurrency(invoice.total, invoice.currency) : ""}
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label>Total Paid</Label>
                <Input
                  value={invoice ? formatCurrency(totalPaid, invoice.currency) : ""}
                  disabled
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Remaining Balance</Label>
              <Input
                value={invoice ? formatCurrency(remainingBalance, invoice.currency) : ""}
                disabled
                className={remainingBalance > 0 ? "font-semibold text-orange-600" : "font-semibold text-green-600"}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentAmount">Payment Amount *</Label>
              <Input
                id="paymentAmount"
                type="number"
                step="0.01"
                min="0.01"
                max={remainingBalance}
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder={`Max: ${invoice ? formatCurrency(remainingBalance, invoice.currency) : ""}`}
              />
              <p className="text-xs text-muted-foreground">
                Maximum: {invoice ? formatCurrency(remainingBalance, invoice.currency) : ""}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentDate">Payment Date</Label>
              <Input
                id="paymentDate"
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
              />
            </div>
            {invoice?.paymentMethods.includes("card") && (
              <div className="space-y-2">
                <Label htmlFor="paymentCardLast4Digits">Card Last 4 Digits *</Label>
                <Input
                  id="paymentCardLast4Digits"
                  type="text"
                  maxLength={4}
                  value={paymentCardLast4Digits}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                    setPaymentCardLast4Digits(value);
                  }}
                  placeholder="1234"
                />
                <p className="text-xs text-muted-foreground">
                  Enter the last 4 digits of the card used for this payment
                </p>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="paymentNotes">Payment Notes (Optional)</Label>
              <Textarea
                id="paymentNotes"
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                placeholder="Enter payment details, reference number, etc."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsPaymentDialogOpen(false);
              setPaymentAmount("");
              setPaymentNotes("");
              setPaymentCardLast4Digits("");
            }}>
              Cancel
            </Button>
            <Button onClick={handleRecordPayment}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Record Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status Change Dialog */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Invoice Status</DialogTitle>
            <DialogDescription>
              Update the status of invoice {invoice?.invoiceNumber}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="status">New Status</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStatusDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleStatusChange} disabled={!newStatus}>
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Email Dialog */}
      <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Invoice via Email</DialogTitle>
            <DialogDescription>
              Send invoice {invoice?.invoiceNumber} to the recipient's email address
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="emailRecipientName">Recipient Name (Optional)</Label>
              <Input
                id="emailRecipientName"
                type="text"
                value={emailRecipientName}
                onChange={(e) => setEmailRecipientName(e.target.value)}
                placeholder="Enter recipient name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emailRecipient">Recipient Email *</Label>
              <Input
                id="emailRecipient"
                type="email"
                value={emailRecipient}
                onChange={(e) => setEmailRecipient(e.target.value)}
                placeholder="recipient@example.com"
                required
              />
              <p className="text-xs text-muted-foreground">
                The invoice will be sent as an HTML email to this address
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsEmailDialogOpen(false);
              setEmailRecipient("");
              setEmailRecipientName("");
            }}>
              Cancel
            </Button>
            <Button onClick={handleSendEmail} disabled={!emailRecipient || isSendingEmail}>
              <Send className="mr-2 h-4 w-4" />
              {isSendingEmail ? "Sending..." : "Send Email"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
