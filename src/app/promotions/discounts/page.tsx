"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Search, Percent } from "lucide-react";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { formatDateSL } from "@/lib/date-sl";
import { formatCurrency } from "@/lib/currency";
import type { Discount } from "@/types/discount";
import type { Offer } from "@/types/offer";

const defaultDiscountForm = {
  offerId: "" as string,
  name: "",
  description: "",
  discountType: "percentage" as "percentage" | "fixed",
  amount: 0,
  currency: "USD",
  minStayNights: 0,
  validFrom: "",
  validUntil: "",
  blackoutDates: [] as string[],
  maxTotalUsage: "" as number | "",
  maxUsagePerGuest: "" as number | "",
  oneTimePerBooking: false,
  oneTimePerGuest: false,
  applicableRoomTypes: [] as string[],
  applicableRateTypeIds: [] as string[],
  status: "active" as "active" | "inactive",
};

export default function DiscountsPage() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [rateTypes, setRateTypes] = useState<{ id: string; name: string }[]>([]);
  const [roomTypes, setRoomTypes] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null);
  const [form, setForm] = useState(defaultDiscountForm);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);
  const [includeInactive, setIncludeInactive] = useState(false);

  useEffect(() => {
    loadDiscounts();
    loadOffers();
    loadRateTypes();
    loadRoomTypes();
  }, [includeInactive]);

  const loadDiscounts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/discounts?includeInactive=${includeInactive}`);
      const data = await res.json();
      if (data.success) setDiscounts(data.discounts);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadOffers = async () => {
    const res = await fetch("/api/offers");
    const data = await res.json();
    if (data.success) setOffers(data.offers);
  };

  const loadRateTypes = async () => {
    const res = await fetch("/api/rate-types");
    const data = await res.json();
    if (data.success) setRateTypes(data.rateTypes || []);
  };

  const loadRoomTypes = async () => {
    const res = await fetch("/api/rooms");
    const data = await res.json();
    if (data.success && data.rooms) {
      const types = [...new Set((data.rooms as { roomType: string }[]).map((r: { roomType: string }) => r.roomType))];
      setRoomTypes(types);
    }
  };

  const filtered = discounts.filter(
    (d) =>
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.description || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => setForm(defaultDiscountForm);

  const openAdd = () => {
    resetForm();
    setForm((p) => ({ ...p, validFrom: new Date().toISOString().slice(0, 10), validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10) }));
    setIsAddDialogOpen(true);
  };

  const openEdit = (d: Discount) => {
    setEditingDiscount(d);
    setForm({
      offerId: d.offerId || "",
      name: d.name,
      description: d.description || "",
      discountType: d.discountType,
      amount: d.amount,
      currency: d.currency,
      minStayNights: d.minStayNights,
      validFrom: d.validFrom,
      validUntil: d.validUntil,
      blackoutDates: d.blackoutDates || [],
      maxTotalUsage: d.maxTotalUsage ?? "",
      maxUsagePerGuest: d.maxUsagePerGuest ?? "",
      oneTimePerBooking: d.oneTimePerBooking,
      oneTimePerGuest: d.oneTimePerGuest,
      applicableRoomTypes: d.applicableRoomTypes || [],
      applicableRateTypeIds: d.applicableRateTypeIds || [],
      status: d.status,
    });
    setIsEditDialogOpen(true);
  };

  const handleAdd = async () => {
    if (!form.name?.trim()) {
      alert("Discount name is required");
      return;
    }
    if (!form.validFrom || !form.validUntil) {
      alert("Valid dates are required");
      return;
    }
    try {
      const res = await fetch("/api/discounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          offerId: form.offerId || undefined,
          maxTotalUsage: form.maxTotalUsage === "" ? undefined : Number(form.maxTotalUsage),
          maxUsagePerGuest: form.maxUsagePerGuest === "" ? undefined : Number(form.maxUsagePerGuest),
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      await loadDiscounts();
      setIsAddDialogOpen(false);
      resetForm();
    } catch (e) {
      alert((e as Error).message);
    }
  };

  const handleEdit = async () => {
    if (!editingDiscount) return;
    if (!form.name?.trim()) {
      alert("Discount name is required");
      return;
    }
    try {
      const res = await fetch(`/api/discounts/${editingDiscount.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          offerId: form.offerId || undefined,
          maxTotalUsage: form.maxTotalUsage === "" ? undefined : Number(form.maxTotalUsage),
          maxUsagePerGuest: form.maxUsagePerGuest === "" ? undefined : Number(form.maxUsagePerGuest),
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      await loadDiscounts();
      setIsEditDialogOpen(false);
      setEditingDiscount(null);
    } catch (e) {
      alert((e as Error).message);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      const res = await fetch(`/api/discounts/${deleteConfirm.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      await loadDiscounts();
      setDeleteConfirm(null);
    } catch (e) {
      alert((e as Error).message);
    }
  };

  const FormFields = () => (
    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
      <div>
        <Label>Offer (optional)</Label>
        <Select value={form.offerId || "__none__"} onValueChange={(v) => setForm((p) => ({ ...p, offerId: v === "__none__" ? "" : v }))}>
          <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="__none__">None</SelectItem>
            {offers.map((o) => (
              <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Name</Label>
        <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="e.g. Early Bird 20%" />
      </div>
      <div>
        <Label>Description</Label>
        <Textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} rows={2} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Discount Type</Label>
          <Select value={form.discountType} onValueChange={(v: "percentage" | "fixed") => setForm((p) => ({ ...p, discountType: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="percentage">Percentage</SelectItem>
              <SelectItem value="fixed">Fixed Amount</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>{form.discountType === "percentage" ? "Percentage (%)" : "Amount"}</Label>
          <Input type="number" step="0.01" value={form.amount || ""} onChange={(e) => setForm((p) => ({ ...p, amount: Number(e.target.value) || 0 }))} />
        </div>
      </div>
      {form.discountType === "fixed" && (
        <div>
          <Label>Currency</Label>
          <Select value={form.currency} onValueChange={(v) => setForm((p) => ({ ...p, currency: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">USD</SelectItem>
              <SelectItem value="LKR">LKR</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
      <div>
        <Label>Min Stay (nights)</Label>
        <Input type="number" min="0" value={form.minStayNights} onChange={(e) => setForm((p) => ({ ...p, minStayNights: Number(e.target.value) || 0 }))} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Valid From</Label>
          <Input type="date" value={form.validFrom} onChange={(e) => setForm((p) => ({ ...p, validFrom: e.target.value }))} />
        </div>
        <div>
          <Label>Valid Until</Label>
          <Input type="date" value={form.validUntil} onChange={(e) => setForm((p) => ({ ...p, validUntil: e.target.value }))} />
        </div>
      </div>
      <div>
        <Label>Blackout Dates (comma-separated YYYY-MM-DD)</Label>
        <Input value={form.blackoutDates.join(", ")} onChange={(e) => setForm((p) => ({ ...p, blackoutDates: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) }))} placeholder="2025-12-25, 2025-12-31" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Max Total Usage</Label>
          <Input type="number" placeholder="Unlimited" value={form.maxTotalUsage} onChange={(e) => setForm((p) => ({ ...p, maxTotalUsage: e.target.value === "" ? "" : Number(e.target.value) }))} />
        </div>
        <div>
          <Label>Max Per Guest</Label>
          <Input type="number" placeholder="Unlimited" value={form.maxUsagePerGuest} onChange={(e) => setForm((p) => ({ ...p, maxUsagePerGuest: e.target.value === "" ? "" : Number(e.target.value) }))} />
        </div>
      </div>
      <div className="flex gap-4">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={form.oneTimePerBooking} onChange={(e) => setForm((p) => ({ ...p, oneTimePerBooking: e.target.checked }))} />
          <span className="text-sm">One-time per booking</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={form.oneTimePerGuest} onChange={(e) => setForm((p) => ({ ...p, oneTimePerGuest: e.target.checked }))} />
          <span className="text-sm">One-time per guest</span>
        </label>
      </div>
      <div>
        <Label>Applicable Room Types (comma-separated, empty = all)</Label>
        <Input value={form.applicableRoomTypes.join(", ")} onChange={(e) => setForm((p) => ({ ...p, applicableRoomTypes: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) }))} placeholder="Standard, Deluxe" />
      </div>
      <div>
        <Label>Applicable Rate Types (select from list, empty = all)</Label>
        <p className="text-xs text-muted-foreground mb-2">Leave empty for all rate types</p>
        <div className="flex flex-wrap gap-2">
          {rateTypes.map((rt) => (
            <label key={rt.id} className="flex items-center gap-1 text-sm">
              <input
                type="checkbox"
                checked={form.applicableRateTypeIds.includes(rt.id)}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    applicableRateTypeIds: e.target.checked ? [...p.applicableRateTypeIds, rt.id] : p.applicableRateTypeIds.filter((id) => id !== rt.id),
                  }))
                }
              />
              {rt.name}
            </label>
          ))}
        </div>
      </div>
      {isEditDialogOpen && (
        <div>
          <Label>Status</Label>
          <Select value={form.status} onValueChange={(v: "active" | "inactive") => setForm((p) => ({ ...p, status: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Discounts</h1>
          <p className="text-muted-foreground">Discount definitions with pricing and restrictions</p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add Discount
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
            </div>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={includeInactive} onChange={(e) => setIncludeInactive(e.target.checked)} />
              <span className="text-sm">Include inactive</span>
            </label>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-muted-foreground">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">No discounts found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Valid</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="font-medium">{d.name}</TableCell>
                    <TableCell>{d.discountType}</TableCell>
                    <TableCell>{d.discountType === "percentage" ? `${d.amount}%` : formatCurrency(d.amount, d.currency)}</TableCell>
                    <TableCell className="text-sm">{formatDateSL(d.validFrom)} – {formatDateSL(d.validUntil)}</TableCell>
                    <TableCell>{d.usageCount}{d.maxTotalUsage != null ? ` / ${d.maxTotalUsage}` : ""}</TableCell>
                    <TableCell>
                      <Badge variant={d.status === "active" ? "default" : "secondary"}>{d.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(d)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm({ id: d.id, name: d.name })}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Discount</DialogTitle>
            <DialogDescription>Create a new discount with pricing logic and restrictions.</DialogDescription>
          </DialogHeader>
          <FormFields />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Discount</DialogTitle>
          </DialogHeader>
          <FormFields />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEdit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={!!deleteConfirm}
        onOpenChange={(o) => !o && setDeleteConfirm(null)}
        title="Delete Discount"
        description={deleteConfirm ? `Are you sure you want to delete "${deleteConfirm.name}"?` : ""}
        onConfirm={handleDelete}
      />
    </div>
  );
}
