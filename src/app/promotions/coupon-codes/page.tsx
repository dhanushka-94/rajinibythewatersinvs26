"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Plus, Trash2, Search, Ticket } from "lucide-react";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import type { CouponCode } from "@/types/coupon-code";
import type { Discount } from "@/types/discount";

export default function CouponCodesPage() {
  const [couponCodes, setCouponCodes] = useState<CouponCode[]>([]);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDiscountId, setFilterDiscountId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newCode, setNewCode] = useState({ discountId: "", code: "" });
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; code: string } | null>(null);

  useEffect(() => {
    loadCouponCodes();
    loadDiscounts();
  }, [filterDiscountId]);

  const loadCouponCodes = async () => {
    setLoading(true);
    try {
      const url = filterDiscountId ? `/api/coupon-codes?discountId=${filterDiscountId}` : "/api/coupon-codes";
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) setCouponCodes(data.couponCodes);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadDiscounts = async () => {
    const res = await fetch("/api/discounts?includeInactive=true");
    const data = await res.json();
    if (data.success) setDiscounts(data.discounts);
  };

  const filtered = couponCodes.filter(
    (c) =>
      c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.discount?.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = async () => {
    if (!newCode.discountId || !newCode.code?.trim()) {
      alert("Discount and code are required");
      return;
    }
    try {
      const res = await fetch("/api/coupon-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCode),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      await loadCouponCodes();
      setIsAddDialogOpen(false);
      setNewCode({ discountId: "", code: "" });
    } catch (e) {
      alert((e as Error).message);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      const res = await fetch(`/api/coupon-codes/${deleteConfirm.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      await loadCouponCodes();
      setDeleteConfirm(null);
    } catch (e) {
      alert((e as Error).message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Coupon Codes</h1>
          <p className="text-muted-foreground">Optional codes to trigger discounts</p>
        </div>
        <Button onClick={() => { setNewCode({ discountId: filterDiscountId || "", code: "" }); setIsAddDialogOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          Add Coupon Code
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search codes or discounts..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
            </div>
            <div className="w-48">
              <Select value={filterDiscountId || "__all__"} onValueChange={(v) => setFilterDiscountId(v === "__all__" ? "" : v)}>
                <SelectTrigger><SelectValue placeholder="All discounts" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All discounts</SelectItem>
                  {discounts.map((d) => (
                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-muted-foreground">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">No coupon codes found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-mono font-medium">{c.code}</TableCell>
                    <TableCell>{c.discount?.name || "-"}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm({ id: c.id, code: c.code })}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Coupon Code</DialogTitle>
            <DialogDescription>Create a code that triggers a discount when entered.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Discount</Label>
              <Select value={newCode.discountId} onValueChange={(v) => setNewCode((p) => ({ ...p, discountId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select discount" /></SelectTrigger>
                <SelectContent>
                  {discounts.filter((d) => d.status === "active").map((d) => (
                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                  ))}
                  {discounts.filter((d) => d.status === "active").length === 0 && (
                    <SelectItem value="_none" disabled>No active discounts</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Code</Label>
              <Input
                value={newCode.code}
                onChange={(e) => setNewCode((p) => ({ ...p, code: e.target.value.toUpperCase() }))}
                placeholder="e.g. SUMMER20"
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground mt-1">Codes are case-insensitive when applied</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={!!deleteConfirm}
        onOpenChange={(o) => !o && setDeleteConfirm(null)}
        title="Delete Coupon Code"
        description={deleteConfirm ? `Are you sure you want to delete "${deleteConfirm.code}"?` : ""}
        onConfirm={handleDelete}
      />
    </div>
  );
}
