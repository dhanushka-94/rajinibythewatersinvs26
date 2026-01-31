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
import { getRooms, createRoom, updateRoom, deleteRoom } from "@/lib/rooms";
import { type Room, type RoomStatus } from "@/types/room";
import { type RateType } from "@/types/rate-type";
import { Plus, Pencil, Trash2, Search, BedDouble } from "lucide-react";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { formatCurrency } from "@/lib/currency";

const statusOptions: { value: RoomStatus; label: string }[] = [
  { value: "available", label: "Available" },
  { value: "maintenance", label: "Maintenance" },
  { value: "disabled", label: "Disabled" },
];

function groupRateTypes(rateTypes: RateType[]): { groupName: string; items: RateType[] }[] {
  const groups: Record<string, RateType[]> = {};
  const order = (n: number) => (n <= 9 ? "1" : n <= 19 ? "2" : n <= 29 ? "3" : n <= 39 ? "4" : n <= 49 ? "5" : n <= 59 ? "6" : n <= 79 ? "7" : n <= 89 ? "8" : "9");
  const names: Record<string, string> = {
    "1": "Room Only (RO)",
    "2": "Bed & Breakfast (BB)",
    "3": "Half Board (HB)",
    "4": "Full Board (FB)",
    "5": "All Inclusive (AI)",
    "6": "Ultra All Inclusive (UAI)",
    "7": "Child Rates",
    "8": "Meals Only",
    "9": "Charges",
  };
  for (const rt of rateTypes) {
    const key = order(rt.displayOrder);
    if (!groups[key]) groups[key] = [];
    groups[key].push(rt);
  }
  return Object.entries(groups)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, items]) => ({ groupName: names[k] || "Other", items }));
}

export default function HotelRoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [rateTypes, setRateTypes] = useState<RateType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [editingRates, setEditingRates] = useState<Record<string, string>>({});
  const [newRoom, setNewRoom] = useState({
    roomNumber: "",
    roomType: "",
    rates: {} as Record<string, string>,
    currency: "USD",
    capacity: "2",
    status: "available" as RoomStatus,
    floor: "",
    notes: "",
  });

  useEffect(() => {
    loadRooms();
    loadRateTypes();
  }, []);

  const loadRateTypes = async () => {
    try {
      const res = await fetch("/api/rate-types");
      const data = await res.json();
      if (data.success) setRateTypes(data.rateTypes);
    } catch (e) {
      console.error("Error loading rate types:", e);
    }
  };

  const loadRooms = async () => {
    setLoading(true);
    const data = await getRooms();
    setRooms(data);
    setLoading(false);
  };

  const filteredRooms = rooms.filter(
    (room) =>
      room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.roomType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.floor?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddRoom = async () => {
    if (!newRoom.roomNumber?.trim() || !newRoom.roomType?.trim()) {
      alert("Room number and room type are required");
      return;
    }
    const rates = rateTypes
      .map((rt) => ({ rateTypeId: rt.id, ratePerNight: Number(newRoom.rates[rt.id]) || 0, currency: newRoom.currency }))
      .filter((r) => r.ratePerNight > 0);
    if (rates.length === 0) {
      alert("At least one rate must be greater than 0");
      return;
    }

    try {
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomNumber: newRoom.roomNumber.trim(),
          roomType: newRoom.roomType.trim(),
          rates,
          currency: newRoom.currency,
          capacity: Number(newRoom.capacity) || 2,
          status: newRoom.status,
          floor: newRoom.floor.trim() || undefined,
          notes: newRoom.notes.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      await loadRooms();
      setIsAddDialogOpen(false);
      setNewRoom({
        roomNumber: "",
        roomType: "",
        rates: {},
        currency: "USD",
        capacity: "2",
        status: "available",
        floor: "",
        notes: "",
      });
    } catch (error) {
      console.error("Error adding room:", error);
      alert("Error adding room. Please try again.");
    }
  };

  const handleEditRoom = async () => {
    if (!editingRoom) return;
    if (!editingRoom.roomNumber?.trim() || !editingRoom.roomType?.trim()) {
      alert("Room number and room type are required");
      return;
    }
    const rates = rateTypes.map((rt) => ({
      rateTypeId: rt.id,
      ratePerNight: Number(editingRates[rt.id]) || 0,
      currency: editingRoom.currency,
    }));
    if (rates.every((r) => r.ratePerNight === 0)) {
      alert("At least one rate must be greater than 0");
      return;
    }

    try {
      await updateRoom(editingRoom.id, {
        roomNumber: editingRoom.roomNumber.trim(),
        roomType: editingRoom.roomType.trim(),
        ratePerNight: Math.min(...rates.map((r) => r.ratePerNight).filter((n) => n > 0)),
        currency: editingRoom.currency,
        capacity: editingRoom.capacity,
        status: editingRoom.status,
        floor: editingRoom.floor?.trim() || undefined,
        notes: editingRoom.notes?.trim() || undefined,
      });
      await fetch(`/api/rooms/${editingRoom.id}/rates`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rates }),
      });
      await loadRooms();
      setIsEditDialogOpen(false);
      setEditingRoom(null);
      setEditingRates({});
    } catch (error) {
      console.error("Error updating room:", error);
      alert("Error updating room. Please try again.");
    }
  };

  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; label: string } | null>(null);

  const handleDeleteRoomClick = (id: string, label: string) => {
    setDeleteConfirm({ id, label });
  };

  const handleDeleteRoomConfirm = async () => {
    if (!deleteConfirm) return;
    try {
      await deleteRoom(deleteConfirm.id);
      await loadRooms();
      setDeleteConfirm(null);
    } catch (error) {
      console.error("Error deleting room:", error);
      alert("Error deleting room. Please try again.");
    }
  };

  const openEditDialog = async (room: Room) => {
    setEditingRoom({ ...room });
    setEditingRates({});
    try {
      const res = await fetch(`/api/rooms/${room.id}/rates`);
      const data = await res.json();
      if (data.success && data.rates?.length) {
        const map: Record<string, string> = {};
        data.rates.forEach((r: { rateTypeId: string; ratePerNight: number }) => {
          map[r.rateTypeId] = String(r.ratePerNight);
        });
        setEditingRates(map);
      }
    } catch (e) {
      console.error("Error loading room rates:", e);
    }
    setIsEditDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <BedDouble className="h-8 w-8" />
            Hotel Rooms
          </h1>
          <p className="text-muted-foreground">
            Manage hotel rooms for bookings and invoices
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Room
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Rooms</CardTitle>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search rooms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-[300px]"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Room #</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Rate/Night</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Floor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRooms.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      {searchTerm ? "No rooms found matching your search" : "No rooms yet. Add your first room!"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRooms.map((room) => (
                    <TableRow key={room.id}>
                      <TableCell className="font-medium">{room.roomNumber}</TableCell>
                      <TableCell>{room.roomType}</TableCell>
                      <TableCell>{formatCurrency(room.ratePerNight, room.currency)}</TableCell>
                      <TableCell>{room.capacity}</TableCell>
                      <TableCell>{room.floor || "-"}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            room.status === "available"
                              ? "bg-green-100 text-green-800"
                              : room.status === "maintenance"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {room.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(room)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              handleDeleteRoomClick(room.id, `${room.roomNumber} (${room.roomType})`)
                            }
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
          )}
        </CardContent>
      </Card>

      {/* Add Room Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Room</DialogTitle>
            <DialogDescription>
              Add a new hotel room for bookings and invoicing
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="add-roomNumber">Room Number *</Label>
                <Input
                  id="add-roomNumber"
                  value={newRoom.roomNumber}
                  onChange={(e) =>
                    setNewRoom({ ...newRoom, roomNumber: e.target.value })
                  }
                  placeholder="e.g. 101, A1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-roomType">Room Type *</Label>
                <Input
                  id="add-roomType"
                  value={newRoom.roomType}
                  onChange={(e) =>
                    setNewRoom({ ...newRoom, roomType: e.target.value })
                  }
                  placeholder="e.g. Standard, Deluxe"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Rates per Night</Label>
              {rateTypes.length === 0 ? (
                <p className="text-sm text-muted-foreground">No rate types. Run MIGRATION_RATE_TYPES_UPDATE.sql.</p>
              ) : (
                <div className="max-h-64 overflow-y-auto border rounded-md p-3 space-y-4">
                  {groupRateTypes(rateTypes).map(({ groupName, items }) => (
                    <div key={groupName}>
                      <p className="text-xs font-medium text-muted-foreground mb-2">{groupName}</p>
                      <div className="space-y-1.5">
                        {items.map((rt) => (
                          <div key={rt.id} className="flex items-center gap-2">
                            <Label htmlFor={`add-rate-${rt.id}`} className="w-48 shrink-0 text-sm">{rt.name}</Label>
                            <Input
                              id={`add-rate-${rt.id}`}
                              type="number"
                              min="0"
                              step="0.01"
                              className="h-8 w-24"
                              value={newRoom.rates[rt.id] ?? ""}
                              onChange={(e) =>
                                setNewRoom({
                                  ...newRoom,
                                  rates: { ...newRoom.rates, [rt.id]: e.target.value },
                                })
                              }
                              placeholder="0"
                            />
                            <span className="text-xs text-muted-foreground">{newRoom.currency}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-currency">Currency</Label>
              <Select
                value={newRoom.currency}
                onValueChange={(v) =>
                  setNewRoom({ ...newRoom, currency: v })
                }
              >
                <SelectTrigger id="add-currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="LKR">LKR</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="add-capacity">Capacity</Label>
                <Input
                  id="add-capacity"
                  type="number"
                  min="1"
                  value={newRoom.capacity}
                  onChange={(e) =>
                    setNewRoom({ ...newRoom, capacity: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-status">Status</Label>
                <Select
                  value={newRoom.status}
                  onValueChange={(v: RoomStatus) =>
                    setNewRoom({ ...newRoom, status: v })
                  }
                >
                  <SelectTrigger id="add-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-floor">Floor</Label>
              <Input
                id="add-floor"
                value={newRoom.floor}
                onChange={(e) =>
                  setNewRoom({ ...newRoom, floor: e.target.value })
                }
                placeholder="e.g. 1, Ground"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-notes">Notes</Label>
              <Textarea
                id="add-notes"
                value={newRoom.notes}
                onChange={(e) =>
                  setNewRoom({ ...newRoom, notes: e.target.value })
                }
                placeholder="Optional notes"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddRoom}>Add Room</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Room Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Room</DialogTitle>
            <DialogDescription>
              Update room details
            </DialogDescription>
          </DialogHeader>
          {editingRoom && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-roomNumber">Room Number *</Label>
                  <Input
                    id="edit-roomNumber"
                    value={editingRoom.roomNumber}
                    onChange={(e) =>
                      setEditingRoom({ ...editingRoom, roomNumber: e.target.value })
                    }
                    placeholder="e.g. 101"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-roomType">Room Type *</Label>
                  <Input
                    id="edit-roomType"
                    value={editingRoom.roomType}
                    onChange={(e) =>
                      setEditingRoom({ ...editingRoom, roomType: e.target.value })
                    }
                    placeholder="e.g. Standard"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Rates per Night</Label>
                {rateTypes.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No rate types.</p>
                ) : (
                  <div className="max-h-64 overflow-y-auto border rounded-md p-3 space-y-4">
                    {groupRateTypes(rateTypes).map(({ groupName, items }) => (
                      <div key={groupName}>
                        <p className="text-xs font-medium text-muted-foreground mb-2">{groupName}</p>
                        <div className="space-y-1.5">
                          {items.map((rt) => (
                            <div key={rt.id} className="flex items-center gap-2">
                              <Label htmlFor={`edit-rate-${rt.id}`} className="w-48 shrink-0 text-sm">{rt.name}</Label>
                              <Input
                                id={`edit-rate-${rt.id}`}
                                type="number"
                                min="0"
                                step="0.01"
                                className="h-8 w-24"
                                value={editingRates[rt.id] ?? ""}
                                onChange={(e) =>
                                  setEditingRates({ ...editingRates, [rt.id]: e.target.value })
                                }
                                placeholder="0"
                              />
                              <span className="text-xs text-muted-foreground">{editingRoom.currency}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-currency">Currency</Label>
                <Select
                  value={editingRoom.currency}
                  onValueChange={(v) =>
                    setEditingRoom({ ...editingRoom, currency: v })
                  }
                >
                  <SelectTrigger id="edit-currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="LKR">LKR</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-capacity">Capacity</Label>
                  <Input
                    id="edit-capacity"
                    type="number"
                    min="1"
                    value={editingRoom.capacity}
                    onChange={(e) =>
                      setEditingRoom({
                        ...editingRoom,
                        capacity: Number(e.target.value) || 2,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select
                    value={editingRoom.status}
                    onValueChange={(v: RoomStatus) =>
                      setEditingRoom({ ...editingRoom, status: v })
                    }
                  >
                    <SelectTrigger id="edit-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-floor">Floor</Label>
                <Input
                  id="edit-floor"
                  value={editingRoom.floor || ""}
                  onChange={(e) =>
                    setEditingRoom({ ...editingRoom, floor: e.target.value })
                  }
                  placeholder="e.g. 1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-notes">Notes</Label>
                <Textarea
                  id="edit-notes"
                  value={editingRoom.notes || ""}
                  onChange={(e) =>
                    setEditingRoom({ ...editingRoom, notes: e.target.value })
                  }
                  placeholder="Optional notes"
                  rows={2}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditRoom}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={!!deleteConfirm}
        onOpenChange={(open) => !open && setDeleteConfirm(null)}
        title="Delete Room"
        description={
          deleteConfirm
            ? `Are you sure you want to delete room ${deleteConfirm.label}? This cannot be undone.`
            : ""
        }
        onConfirm={handleDeleteRoomConfirm}
      />
    </div>
  );
}
