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
import { Plus, Pencil, Trash2, Search, Tag } from "lucide-react";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { Offer } from "@/types/offer";

export default function OffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [newOffer, setNewOffer] = useState({ name: "", description: "", displayOrder: 0 });
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    loadOffers();
  }, []);

  const loadOffers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/offers");
      const data = await res.json();
      if (data.success) setOffers(data.offers);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = offers.filter(
    (o) =>
      o.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.description || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = async () => {
    if (!newOffer.name?.trim()) {
      alert("Offer name is required");
      return;
    }
    try {
      const res = await fetch("/api/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newOffer),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      await loadOffers();
      setIsAddDialogOpen(false);
      setNewOffer({ name: "", description: "", displayOrder: 0 });
    } catch (e) {
      alert((e as Error).message);
    }
  };

  const handleEdit = async () => {
    if (!editingOffer) return;
    if (!editingOffer.name?.trim()) {
      alert("Offer name is required");
      return;
    }
    try {
      const res = await fetch(`/api/offers/${editingOffer.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editingOffer.name,
          description: editingOffer.description,
          displayOrder: editingOffer.displayOrder,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      await loadOffers();
      setIsEditDialogOpen(false);
      setEditingOffer(null);
    } catch (e) {
      alert((e as Error).message);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      const res = await fetch(`/api/offers/${deleteConfirm.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      await loadOffers();
      setDeleteConfirm(null);
    } catch (e) {
      alert((e as Error).message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Offers</h1>
          <p className="text-muted-foreground">Marketing groupings for discounts</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Offer
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search offers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-muted-foreground">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">No offers found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-medium">{o.name}</TableCell>
                    <TableCell className="max-w-xs truncate">{o.description || "-"}</TableCell>
                    <TableCell>{o.displayOrder}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => { setEditingOffer(o); setIsEditDialogOpen(true); }}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm({ id: o.id, name: o.name })}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Offer</DialogTitle>
            <DialogDescription>Create a marketing grouping for discounts.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input value={newOffer.name} onChange={(e) => setNewOffer((p) => ({ ...p, name: e.target.value }))} placeholder="e.g. Summer Special" />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={newOffer.description} onChange={(e) => setNewOffer((p) => ({ ...p, description: e.target.value }))} placeholder="Optional description" rows={2} />
            </div>
            <div>
              <Label>Display Order</Label>
              <Input type="number" value={newOffer.displayOrder} onChange={(e) => setNewOffer((p) => ({ ...p, displayOrder: Number(e.target.value) || 0 }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Offer</DialogTitle>
          </DialogHeader>
          {editingOffer && (
            <div className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input value={editingOffer.name} onChange={(e) => setEditingOffer((p) => p ? { ...p, name: e.target.value } : null)} />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={editingOffer.description || ""} onChange={(e) => setEditingOffer((p) => p ? { ...p, description: e.target.value } : null)} rows={2} />
              </div>
              <div>
                <Label>Display Order</Label>
                <Input type="number" value={editingOffer.displayOrder} onChange={(e) => setEditingOffer((p) => p ? { ...p, displayOrder: Number(e.target.value) || 0 } : null)} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEdit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={!!deleteConfirm}
        onOpenChange={(o) => !o && setDeleteConfirm(null)}
        title="Delete Offer"
        description={deleteConfirm ? `Are you sure you want to delete "${deleteConfirm.name}"?` : ""}
        onConfirm={handleDelete}
      />
    </div>
  );
}
