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
import { Badge } from "@/components/ui/badge";
import { KeyRound, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { User } from "@/types/user";
import { formatDateTimeSL } from "@/lib/date-sl";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";

interface SecureEditPinWithUser {
  userId: string;
  userName: string;
  userFullName: string;
  createdAt: string;
}

export default function SecureEditPinsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [pins, setPins] = useState<SecureEditPinWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSetDialogOpen, setIsSetDialogOpen] = useState(false);
  const [isChangeDialogOpen, setIsChangeDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [pinValue, setPinValue] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [usersRes, pinsRes] = await Promise.all([
        fetch("/api/users"),
        fetch("/api/secure-edit-pins"),
      ]);
      const usersData = await usersRes.json();
      const pinsData = await pinsRes.json();
      if (usersData.success) setUsers(usersData.users);
      if (pinsData.success) setPins(pinsData.pins);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const userIdsWithPin = new Set(pins.map((p) => p.userId));
  const usersWithoutPin = users.filter((u) => !userIdsWithPin.has(u.id));

  const handleSetPin = async () => {
    if (!selectedUser || !pinValue.trim() || pinValue.length < 4) {
      alert("Select a user and enter a PIN (at least 4 characters)");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/secure-edit-pins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: selectedUser.id, pin: pinValue }),
      });
      const data = await res.json();
      if (data.success) {
        await loadData();
        setIsSetDialogOpen(false);
        setSelectedUser(null);
        setPinValue("");
      } else {
        alert(data.error || "Failed to set PIN");
      }
    } catch (error) {
      alert("Failed to set PIN");
    } finally {
      setSubmitting(false);
    }
  };

  const handleChangePin = async () => {
    if (!selectedUser || !pinValue.trim() || pinValue.length < 4) {
      alert("Enter a new PIN (at least 4 characters)");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/secure-edit-pins/${selectedUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: pinValue }),
      });
      const data = await res.json();
      if (data.success) {
        await loadData();
        setIsChangeDialogOpen(false);
        setSelectedUser(null);
        setPinValue("");
      } else {
        alert(data.error || "Failed to update PIN");
      }
    } catch (error) {
      alert("Failed to update PIN");
    } finally {
      setSubmitting(false);
    }
  };

  const [removePinConfirm, setRemovePinConfirm] = useState<User | null>(null);

  const handleRemovePinClick = (user: User) => {
    setRemovePinConfirm(user);
  };

  const handleRemovePinConfirm = async () => {
    if (!removePinConfirm) return;
    try {
      const res = await fetch(`/api/secure-edit-pins/${removePinConfirm.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        await loadData();
        setRemovePinConfirm(null);
      } else {
        alert(data.error || "Failed to remove PIN");
      }
    } catch (error) {
      alert("Failed to remove PIN");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center min-h-screen items-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Secure Edit PINs</h1>
        <p className="text-muted-foreground">
          Assign PINs to users for editing paid invoices and checked-out bookings. Each user can have one PIN; only the owner can use it.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <KeyRound className="h-5 w-5" />
              Users with Secure Edit PIN ({pins.length})
            </CardTitle>
            <Button
              onClick={() => {
                setSelectedUser(null);
                setPinValue("");
                setIsSetDialogOpen(true);
              }}
              disabled={usersWithoutPin.length === 0}
              title={usersWithoutPin.length === 0 ? "All users have a PIN" : ""}
            >
              Assign PIN
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Assigned</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pins.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No secure edit PINs assigned yet. Click &quot;Assign PIN&quot; to add one.
                  </TableCell>
                </TableRow>
              ) : (
                pins.map((p) => {
                  const u = users.find((x) => x.id === p.userId);
                  return (
                    <TableRow key={p.userId}>
                      <TableCell className="font-medium">{p.userFullName}</TableCell>
                      <TableCell>{p.userName}</TableCell>
                      <TableCell>{formatDateTimeSL(p.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(u || null);
                              setPinValue("");
                              setIsChangeDialogOpen(true);
                            }}
                            title="Change PIN"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => u && handleRemovePinClick(u)}
                            title="Remove PIN"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
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

      {usersWithoutPin.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Users without PIN ({usersWithoutPin.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {usersWithoutPin.map((u) => u.fullName).join(", ")}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Set PIN Dialog */}
      <Dialog open={isSetDialogOpen} onOpenChange={setIsSetDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Secure Edit PIN</DialogTitle>
            <DialogDescription>
              Select a user and set their PIN. Only they can use it to unlock paid invoices or checked-out bookings.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>User *</Label>
              <Select
                value={selectedUser?.id ?? ""}
                onValueChange={(id) =>
                  setSelectedUser(users.find((u) => u.id === id) || null)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
                <SelectContent>
                  {usersWithoutPin.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.fullName} ({u.username})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>PIN (min 4 characters) *</Label>
              <div className="relative">
                <Input
                  type={showPin ? "text" : "password"}
                  inputMode="numeric"
                  placeholder="Enter PIN"
                  value={pinValue}
                  onChange={(e) => setPinValue(e.target.value)}
                  minLength={4}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full"
                  onClick={() => setShowPin(!showPin)}
                  aria-label={showPin ? "Hide PIN" : "Show PIN"}
                >
                  {showPin ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSetDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSetPin} disabled={submitting}>
              {submitting ? "Saving..." : "Assign PIN"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change PIN Dialog */}
      <Dialog open={isChangeDialogOpen} onOpenChange={setIsChangeDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change Secure Edit PIN</DialogTitle>
            <DialogDescription>
              Enter a new PIN for {selectedUser?.fullName}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>New PIN (min 4 characters) *</Label>
              <div className="relative">
                <Input
                  type={showPin ? "text" : "password"}
                  inputMode="numeric"
                  placeholder="Enter new PIN"
                  value={pinValue}
                  onChange={(e) => setPinValue(e.target.value)}
                  minLength={4}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full"
                  onClick={() => setShowPin(!showPin)}
                  aria-label={showPin ? "Hide PIN" : "Show PIN"}
                >
                  {showPin ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsChangeDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleChangePin} disabled={submitting}>
              {submitting ? "Updating..." : "Update PIN"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={!!removePinConfirm}
        onOpenChange={(open) => !open && setRemovePinConfirm(null)}
        title="Remove Secure Edit PIN"
        description={
          removePinConfirm
            ? `Are you sure you want to remove the secure edit PIN for ${removePinConfirm.fullName}?`
            : ""
        }
        onConfirm={handleRemovePinConfirm}
        confirmLabel="Yes, Remove"
      />
    </div>
  );
}
