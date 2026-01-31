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
import { getTravelCompanies, createTravelCompany, updateTravelCompany, deleteTravelCompany } from "@/lib/travel-companies";
import { type TravelCompany } from "@/types/travel-company";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { CountrySelector } from "@/components/country-selector";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";

export default function TravelCompaniesPage() {
  const [companies, setCompanies] = useState<TravelCompany[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<TravelCompany | null>(null);
  const [newCompany, setNewCompany] = useState({
    name: "",
    email: "",
    phone: "",
    phone2: "",
    address: "",
    city: "",
    country: "",
    taxId: "",
    contactPerson: "",
    notes: "",
  });

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    const data = await getTravelCompanies();
    setCompanies(data);
  };

  const filteredCompanies = companies.filter(
    (company) =>
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.country?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddCompany = async () => {
    if (!newCompany.name || !newCompany.name.trim()) {
      alert("Company Name is required");
      return;
    }

    try {
      await createTravelCompany(newCompany);
      await loadCompanies();
      setIsAddDialogOpen(false);
      setNewCompany({
        name: "",
        email: "",
        phone: "",
        phone2: "",
        address: "",
        city: "",
        country: "",
        taxId: "",
        contactPerson: "",
        notes: "",
      });
    } catch (error) {
      console.error("Error adding travel company:", error);
      alert("Error adding travel company. Please try again.");
    }
  };

  const handleEditCompany = async () => {
    if (!editingCompany) {
      return;
    }
    if (!editingCompany.name || !editingCompany.name.trim()) {
      alert("Company Name is required");
      return;
    }

    try {
      await updateTravelCompany(editingCompany.id, {
        name: editingCompany.name,
        email: editingCompany.email,
        phone: editingCompany.phone,
        phone2: editingCompany.phone2,
        address: editingCompany.address,
        city: editingCompany.city,
        country: editingCompany.country,
        taxId: editingCompany.taxId,
        contactPerson: editingCompany.contactPerson,
        notes: editingCompany.notes,
      });
      await loadCompanies();
      setIsEditDialogOpen(false);
      setEditingCompany(null);
    } catch (error) {
      console.error("Error updating travel company:", error);
      alert("Error updating travel company. Please try again.");
    }
  };

  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);

  const handleDeleteCompanyClick = (id: string, name: string) => {
    setDeleteConfirm({ id, name });
  };

  const handleDeleteCompanyConfirm = async () => {
    if (!deleteConfirm) return;
    try {
      await deleteTravelCompany(deleteConfirm.id);
      await loadCompanies();
      setDeleteConfirm(null);
    } catch (error) {
      console.error("Error deleting travel company:", error);
      alert("Error deleting travel company. Please try again.");
    }
  };

  const openEditDialog = (company: TravelCompany) => {
    setEditingCompany({ ...company });
    setIsEditDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Travel Companies</h1>
          <p className="text-muted-foreground">
            Manage travel agency and company information for billing
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Travel Company
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Travel Companies</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search companies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-[300px]"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company Name</TableHead>
                <TableHead>Contact Person</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Tax ID</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCompanies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    {searchTerm ? "No companies found matching your search" : "No travel companies found. Add your first company!"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredCompanies.map((company) => (
                  <TableRow key={company.id}>
                    <TableCell className="font-medium">{company.name}</TableCell>
                    <TableCell>{company.contactPerson || "-"}</TableCell>
                    <TableCell>{company.email || "-"}</TableCell>
                    <TableCell>{company.phone || "-"}</TableCell>
                    <TableCell>{company.city || "-"}</TableCell>
                    <TableCell>{company.country || "-"}</TableCell>
                    <TableCell>{company.taxId || "-"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(company)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteCompanyClick(company.id, company.name)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Company Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Travel Company</DialogTitle>
            <DialogDescription>
              Add a new travel agency or company for billing purposes
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="add-name">Company Name *</Label>
              <Input
                id="add-name"
                value={newCompany.name}
                onChange={(e) =>
                  setNewCompany({ ...newCompany, name: e.target.value })
                }
                placeholder="Enter company name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-contact">Contact Person</Label>
              <Input
                id="add-contact"
                value={newCompany.contactPerson}
                onChange={(e) =>
                  setNewCompany({ ...newCompany, contactPerson: e.target.value })
                }
                placeholder="Enter contact person name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-email">Email</Label>
              <Input
                id="add-email"
                type="email"
                value={newCompany.email}
                onChange={(e) =>
                  setNewCompany({ ...newCompany, email: e.target.value })
                }
                placeholder="Enter email address"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="add-phone">Phone</Label>
                <Input
                  id="add-phone"
                  value={newCompany.phone}
                  onChange={(e) =>
                    setNewCompany({ ...newCompany, phone: e.target.value })
                  }
                  placeholder="Enter phone number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-phone2">Phone 2</Label>
                <Input
                  id="add-phone2"
                  value={newCompany.phone2}
                  onChange={(e) =>
                    setNewCompany({ ...newCompany, phone2: e.target.value })
                  }
                  placeholder="Enter second phone number"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-address">Address</Label>
              <Input
                id="add-address"
                value={newCompany.address}
                onChange={(e) =>
                  setNewCompany({ ...newCompany, address: e.target.value })
                }
                placeholder="Enter address"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="add-city">City</Label>
                <Input
                  id="add-city"
                  value={newCompany.city}
                  onChange={(e) =>
                    setNewCompany({ ...newCompany, city: e.target.value })
                  }
                  placeholder="Enter city"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-country">Country</Label>
                <CountrySelector
                  id="add-country"
                  value={newCompany.country}
                  onValueChange={(value) =>
                    setNewCompany({ ...newCompany, country: value })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-tax">Tax ID / VAT Number</Label>
              <Input
                id="add-tax"
                value={newCompany.taxId}
                onChange={(e) =>
                  setNewCompany({ ...newCompany, taxId: e.target.value })
                }
                placeholder="Enter tax ID or VAT number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-notes">Notes</Label>
              <Textarea
                id="add-notes"
                value={newCompany.notes}
                onChange={(e) =>
                  setNewCompany({ ...newCompany, notes: e.target.value })
                }
                placeholder="Enter any additional notes"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAddCompany}>Add Company</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Company Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Travel Company</DialogTitle>
            <DialogDescription>
              Update travel company information
            </DialogDescription>
          </DialogHeader>
          {editingCompany && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Company Name *</Label>
                <Input
                  id="edit-name"
                  value={editingCompany.name}
                  onChange={(e) =>
                    setEditingCompany({ ...editingCompany, name: e.target.value })
                  }
                  placeholder="Enter company name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-contact">Contact Person</Label>
                <Input
                  id="edit-contact"
                  value={editingCompany.contactPerson || ""}
                  onChange={(e) =>
                    setEditingCompany({ ...editingCompany, contactPerson: e.target.value })
                  }
                  placeholder="Enter contact person name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editingCompany.email || ""}
                  onChange={(e) =>
                    setEditingCompany({ ...editingCompany, email: e.target.value })
                  }
                  placeholder="Enter email address"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-phone">Phone</Label>
                  <Input
                    id="edit-phone"
                    value={editingCompany.phone || ""}
                    onChange={(e) =>
                      setEditingCompany({ ...editingCompany, phone: e.target.value })
                    }
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-phone2">Phone 2</Label>
                  <Input
                    id="edit-phone2"
                    value={editingCompany.phone2 || ""}
                    onChange={(e) =>
                      setEditingCompany({ ...editingCompany, phone2: e.target.value })
                    }
                    placeholder="Enter second phone number"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-address">Address</Label>
                <Input
                  id="edit-address"
                  value={editingCompany.address || ""}
                  onChange={(e) =>
                    setEditingCompany({ ...editingCompany, address: e.target.value })
                  }
                  placeholder="Enter address"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-city">City</Label>
                  <Input
                    id="edit-city"
                    value={editingCompany.city || ""}
                    onChange={(e) =>
                      setEditingCompany({ ...editingCompany, city: e.target.value })
                    }
                    placeholder="Enter city"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-country">Country</Label>
                  <CountrySelector
                    id="edit-country"
                    value={editingCompany.country || ""}
                    onValueChange={(value) =>
                      setEditingCompany({ ...editingCompany, country: value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-tax">Tax ID / VAT Number</Label>
                <Input
                  id="edit-tax"
                  value={editingCompany.taxId || ""}
                  onChange={(e) =>
                    setEditingCompany({ ...editingCompany, taxId: e.target.value })
                  }
                  placeholder="Enter tax ID or VAT number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-notes">Notes</Label>
                <Textarea
                  id="edit-notes"
                  value={editingCompany.notes || ""}
                  onChange={(e) =>
                    setEditingCompany({ ...editingCompany, notes: e.target.value })
                  }
                  placeholder="Enter any additional notes"
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleEditCompany}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={!!deleteConfirm}
        onOpenChange={(open) => !open && setDeleteConfirm(null)}
        title="Delete Travel Company"
        description={
          deleteConfirm
            ? `Are you sure you want to delete ${deleteConfirm.name}? This cannot be undone.`
            : ""
        }
        onConfirm={handleDeleteCompanyConfirm}
      />
    </div>
  );
}
