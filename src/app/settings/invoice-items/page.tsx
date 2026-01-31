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
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import {
  getSavedItems,
  addSavedItem,
  updateSavedItem,
  deleteSavedItem,
} from "@/lib/invoice-items";
import { InvoiceItem, Currency } from "@/types/invoice";
import { formatCurrency } from "@/lib/currency";

export default function InvoiceItemsPage() {
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingItem, setEditingItem] = useState<InvoiceItem | null>(null);
  const [formData, setFormData] = useState({
    description: "",
    quantity: 1,
    unitPrice: 0,
    currency: "USD" as Currency,
  });

  const loadItems = async () => {
    setLoading(true);
    try {
      const data = await getSavedItems();
      setItems(data);
    } catch (error) {
      console.error("Error loading invoice items:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const filteredItems = items.filter((item) =>
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenDialog = (item?: InvoiceItem) => {
    if (item) {
      setIsEditMode(true);
      setEditingItem(item);
      setFormData({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        currency: item.currency || "USD",
      });
    } else {
      setIsEditMode(false);
      setEditingItem(null);
      setFormData({
        description: "",
        quantity: 1,
        unitPrice: 0,
        currency: "USD",
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setIsEditMode(false);
    setEditingItem(null);
    setFormData({
      description: "",
      quantity: 1,
      unitPrice: 0,
      currency: "USD",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.description.trim()) {
      alert("Description is required");
      return;
    }

    if (formData.unitPrice < 0) {
      alert("Unit price must be greater than or equal to 0");
      return;
    }

    try {
      const total = formData.quantity * formData.unitPrice;
      const itemData: Omit<InvoiceItem, "id"> = {
        description: formData.description.trim(),
        quantity: formData.quantity,
        unitPrice: formData.unitPrice,
        total: total,
        currency: formData.currency,
      };

      if (isEditMode && editingItem) {
        await updateSavedItem(editingItem.id!, {
          ...itemData,
        });
      } else {
        await addSavedItem(itemData);
      }

      await loadItems();
      handleCloseDialog();
    } catch (error) {
      console.error("Error saving invoice item:", error);
      alert("Error saving invoice item. Please try again.");
    }
  };

  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; description: string } | null>(null);

  const handleDeleteClick = (id: string, description: string) => {
    setDeleteConfirm({ id, description });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;
    try {
      await deleteSavedItem(deleteConfirm.id);
      await loadItems();
      setDeleteConfirm(null);
    } catch (error) {
      console.error("Error deleting invoice item:", error);
      alert("Error deleting invoice item. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Invoice Items</h1>
        <p className="text-muted-foreground">
          Manage reusable invoice items that can be added to invoices
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Invoice Items</CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm
                ? "No items found matching your search"
                : "No invoice items found. Create your first item to get started."}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Currency</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {item.description}
                    </TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>
                      {formatCurrency(item.unitPrice, item.currency || "USD")}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(item.total, item.currency || "USD")}
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 bg-muted rounded text-sm">
                        {item.currency || "USD"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(item)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(item.id!, item.description)}
                        >
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Edit Invoice Item" : "Add Invoice Item"}
            </DialogTitle>
            <DialogDescription>
              {isEditMode
                ? "Update the invoice item details"
                : "Create a new reusable invoice item"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="e.g., Deluxe Suite - Per Night"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        quantity: Number(e.target.value) || 1,
                      })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value) =>
                      setFormData({ ...formData, currency: value as Currency })
                    }
                  >
                    <SelectTrigger id="currency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="LKR">LKR - Sri Lankan Rupee</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="unitPrice">
                  Unit Price ({formData.currency}) *
                </Label>
                <Input
                  id="unitPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.unitPrice}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      unitPrice: Number(e.target.value) || 0,
                    })
                  }
                  required
                />
              </div>

              <div className="p-3 bg-muted rounded-lg">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total:</span>
                  <span className="font-semibold">
                    {formatCurrency(
                      formData.quantity * formData.unitPrice,
                      formData.currency
                    )}
                  </span>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
              >
                Cancel
              </Button>
              <Button type="submit">
                {isEditMode ? "Update Item" : "Add Item"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={!!deleteConfirm}
        onOpenChange={(open) => !open && setDeleteConfirm(null)}
        title="Delete Invoice Item"
        description={
          deleteConfirm
            ? `Are you sure you want to delete "${deleteConfirm.description}"? This cannot be undone.`
            : ""
        }
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
