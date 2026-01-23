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
import { getGuests, addGuest, updateGuest, deleteGuest, type Guest } from "@/lib/guests";
import { formatDateSL } from "@/lib/date-sl";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { CountrySelector } from "@/components/country-selector";
import { Title } from "@/types/invoice";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function GuestsPage() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [newGuest, setNewGuest] = useState<Omit<Guest, "id">>({
    title: undefined,
    name: "",
    email: "",
    phone: "",
    phone2: "",
    phone3: "",
    address: "",
    city: "",
    country: "",
    idNumber: "",
    birthday: "",
  });

  useEffect(() => {
    loadGuests();
  }, []);

  const loadGuests = async () => {
    const data = await getGuests();
    setGuests(data);
  };

  const filteredGuests = guests.filter(
    (guest) =>
      guest.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.country?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddGuest = async () => {
    if (!newGuest.name || !newGuest.name.trim()) {
      alert("Full Name is required");
      return;
    }

    try {
      await addGuest(newGuest);
      await loadGuests();
      setIsAddDialogOpen(false);
      setNewGuest({
        title: undefined,
        name: "",
        email: "",
        phone: "",
        phone2: "",
        phone3: "",
        address: "",
        city: "",
        country: "",
        idNumber: "",
        birthday: "",
      });
    } catch (error) {
      console.error("Error adding guest:", error);
      alert("Error adding guest. Please try again.");
    }
  };

  const handleEditGuest = async () => {
    if (!editingGuest) {
      return;
    }
    if (!editingGuest.name || !editingGuest.name.trim()) {
      alert("Full Name is required");
      return;
    }

    try {
      await updateGuest(editingGuest.id!, editingGuest);
      await loadGuests();
      setIsEditDialogOpen(false);
      setEditingGuest(null);
    } catch (error) {
      console.error("Error updating guest:", error);
      alert("Error updating guest. Please try again.");
    }
  };

  const handleDeleteGuest = async (id: string) => {
    if (!confirm("Are you sure you want to delete this guest?")) {
      return;
    }

    try {
      await deleteGuest(id);
      await loadGuests();
    } catch (error) {
      console.error("Error deleting guest:", error);
      alert("Error deleting guest. Please try again.");
    }
  };

  const openEditDialog = (guest: Guest) => {
    setEditingGuest({ ...guest });
    setIsEditDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Guests</h1>
          <p className="text-muted-foreground">
            Manage customer and guest information
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Guest
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Guests</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search guests..."
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
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>ID or Passport Number</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGuests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center text-muted-foreground">
                    {searchTerm ? "No guests found matching your search" : "No guests found. Add your first guest!"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredGuests.map((guest) => (
                  <TableRow key={guest.id}>
                    <TableCell>{guest.title || "-"}</TableCell>
                    <TableCell className="font-medium">{guest.name || "-"}</TableCell>
                    <TableCell>{guest.email || "-"}</TableCell>
                    <TableCell>{guest.phone || "-"}</TableCell>
                    <TableCell>{guest.phone2 || "-"}</TableCell>
                    <TableCell>{guest.phone3 || "-"}</TableCell>
                    <TableCell>{guest.birthday ? formatDateSL(guest.birthday) : "-"}</TableCell>
                    <TableCell>{guest.idNumber || "-"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(guest)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteGuest(guest.id!)}
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

      {/* Add Guest Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Guest</DialogTitle>
            <DialogDescription>
              Add a new customer or guest to the system
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="add-name">Full Name *</Label>
              <Input
                id="add-name"
                value={newGuest.name || ""}
                onChange={(e) =>
                  setNewGuest({ ...newGuest, name: e.target.value })
                }
                placeholder="Enter full name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-email">Email</Label>
              <Input
                id="add-email"
                type="email"
                value={newGuest.email}
                onChange={(e) =>
                  setNewGuest({ ...newGuest, email: e.target.value })
                }
                placeholder="Enter email address"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="add-phone">Phone</Label>
                <Input
                  id="add-phone"
                  value={newGuest.phone || ""}
                  onChange={(e) =>
                    setNewGuest({ ...newGuest, phone: e.target.value })
                  }
                  placeholder="Enter phone number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-phone2">Phone 2</Label>
                <Input
                  id="add-phone2"
                  value={newGuest.phone2 || ""}
                  onChange={(e) =>
                    setNewGuest({ ...newGuest, phone2: e.target.value })
                  }
                  placeholder="Enter second phone number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-phone3">Phone 3</Label>
                <Input
                  id="add-phone3"
                  value={newGuest.phone3 || ""}
                  onChange={(e) =>
                    setNewGuest({ ...newGuest, phone3: e.target.value })
                  }
                  placeholder="Enter third phone number"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-address">Address</Label>
              <Input
                id="add-address"
                value={newGuest.address}
                onChange={(e) =>
                  setNewGuest({ ...newGuest, address: e.target.value })
                }
                placeholder="Enter address"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="add-city">City</Label>
                <Input
                  id="add-city"
                  value={newGuest.city}
                  onChange={(e) =>
                    setNewGuest({ ...newGuest, city: e.target.value })
                  }
                  placeholder="Enter city"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-country">Country</Label>
                <CountrySelector
                  id="add-country"
                  value={newGuest.country}
                  onValueChange={(value) =>
                    setNewGuest({ ...newGuest, country: value })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-id">ID or Passport Number</Label>
              <Input
                id="add-id"
                value={newGuest.idNumber || ""}
                onChange={(e) =>
                  setNewGuest({ ...newGuest, idNumber: e.target.value })
                }
                placeholder="Enter ID or Passport number"
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
            <Button onClick={handleAddGuest}>Add Guest</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Guest Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Guest</DialogTitle>
            <DialogDescription>
              Update guest information
            </DialogDescription>
          </DialogHeader>
          {editingGuest && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-title">Title</Label>
                  <Select
                    value={editingGuest.title || undefined}
                    onValueChange={(value) =>
                      setEditingGuest({ ...editingGuest, title: value as Title })
                    }
                  >
                    <SelectTrigger id="edit-title">
                      <SelectValue placeholder="Select title (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mr">Mr</SelectItem>
                      <SelectItem value="Mrs">Mrs</SelectItem>
                      <SelectItem value="Miss">Miss</SelectItem>
                      <SelectItem value="Ms">Ms</SelectItem>
                      <SelectItem value="Dr">Dr</SelectItem>
                      <SelectItem value="Prof">Prof</SelectItem>
                      <SelectItem value="Rev">Rev</SelectItem>
                      <SelectItem value="Sir">Sir</SelectItem>
                      <SelectItem value="Madam">Madam</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Full Name *</Label>
                  <Input
                    id="edit-name"
                    value={editingGuest.name || ""}
                    onChange={(e) =>
                      setEditingGuest({ ...editingGuest, name: e.target.value })
                    }
                    placeholder="Enter full name"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-birthday">Birthday</Label>
                <Input
                  id="edit-birthday"
                  type="date"
                  value={editingGuest.birthday || ""}
                  onChange={(e) =>
                    setEditingGuest({ ...editingGuest, birthday: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editingGuest.email || ""}
                  onChange={(e) =>
                    setEditingGuest({ ...editingGuest, email: e.target.value })
                  }
                  placeholder="Enter email address"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-phone">Phone</Label>
                  <Input
                    id="edit-phone"
                    value={editingGuest.phone || ""}
                    onChange={(e) =>
                      setEditingGuest({ ...editingGuest, phone: e.target.value })
                    }
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-phone2">Phone 2</Label>
                  <Input
                    id="edit-phone2"
                    value={editingGuest.phone2 || ""}
                    onChange={(e) =>
                      setEditingGuest({ ...editingGuest, phone2: e.target.value })
                    }
                    placeholder="Enter second phone number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-phone3">Phone 3</Label>
                  <Input
                    id="edit-phone3"
                    value={editingGuest.phone3 || ""}
                    onChange={(e) =>
                      setEditingGuest({ ...editingGuest, phone3: e.target.value })
                    }
                    placeholder="Enter third phone number"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-address">Address</Label>
                <Input
                  id="edit-address"
                  value={editingGuest.address || ""}
                  onChange={(e) =>
                    setEditingGuest({ ...editingGuest, address: e.target.value })
                  }
                  placeholder="Enter address"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-city">City</Label>
                  <Input
                    id="edit-city"
                    value={editingGuest.city || ""}
                    onChange={(e) =>
                      setEditingGuest({ ...editingGuest, city: e.target.value })
                    }
                    placeholder="Enter city"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-country">Country</Label>
                  <CountrySelector
                    id="edit-country"
                    value={editingGuest.country || ""}
                    onValueChange={(value) =>
                      setEditingGuest({ ...editingGuest, country: value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-id">ID or Passport Number</Label>
                <Input
                  id="edit-id"
                  value={editingGuest.idNumber || ""}
                  onChange={(e) =>
                    setEditingGuest({ ...editingGuest, idNumber: e.target.value })
                  }
                  placeholder="Enter ID or Passport number"
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
            <Button onClick={handleEditGuest}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
