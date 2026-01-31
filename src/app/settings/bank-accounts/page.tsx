"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash2, Pencil } from "lucide-react";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { getBankDetails, addBankDetail, updateBankDetail, deleteBankDetail, type BankDetail } from "@/lib/bank-details";

export default function BankAccountsPage() {
  const [bankAccounts, setBankAccounts] = useState<BankDetail[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingBank, setEditingBank] = useState<BankDetail | null>(null);
  const [formData, setFormData] = useState<Omit<BankDetail, "id" | "createdAt" | "updatedAt">>({
    accountName: "",
    bankName: "",
    branch: "",
    accountNumber: "",
    bankAddress: "",
    swiftCode: "",
  });

  useEffect(() => {
    loadBankAccounts();
  }, []);

  const loadBankAccounts = async () => {
    const banks = await getBankDetails();
    setBankAccounts(banks);
  };

  const handleAdd = async () => {
    if (
      formData.accountName &&
      formData.bankName &&
      formData.branch &&
      formData.accountNumber &&
      formData.bankAddress &&
      formData.swiftCode
    ) {
      await addBankDetail(formData);
      await loadBankAccounts();
      setIsAddDialogOpen(false);
      setFormData({
        accountName: "",
        bankName: "",
        branch: "",
        accountNumber: "",
        bankAddress: "",
        swiftCode: "",
      });
    }
  };

  const handleEdit = (bank: BankDetail) => {
    setEditingBank(bank);
    setFormData({
      accountName: bank.accountName,
      bankName: bank.bankName,
      branch: bank.branch,
      accountNumber: bank.accountNumber,
      bankAddress: bank.bankAddress,
      swiftCode: bank.swiftCode,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (editingBank) {
      await updateBankDetail(editingBank.id, formData);
      await loadBankAccounts();
      setIsEditDialogOpen(false);
      setEditingBank(null);
      setFormData({
        accountName: "",
        bankName: "",
        branch: "",
        accountNumber: "",
        bankAddress: "",
        swiftCode: "",
      });
    }
  };

  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);

  const handleDeleteClick = (id: string, name: string) => {
    setDeleteConfirm({ id, name });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;
    try {
      await deleteBankDetail(deleteConfirm.id);
      await loadBankAccounts();
      setDeleteConfirm(null);
    } catch (error) {
      console.error("Error deleting bank account:", error);
      alert("Error deleting bank account. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bank Accounts</h1>
          <p className="text-muted-foreground">
            Manage your saved bank account details
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Bank Account
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Bank Account</DialogTitle>
              <DialogDescription>
                Add a new bank account to your saved list
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="addAccountName">Account Name *</Label>
                <Input
                  id="addAccountName"
                  value={formData.accountName}
                  onChange={(e) =>
                    setFormData({ ...formData, accountName: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="addBankName">Bank Name *</Label>
                <Input
                  id="addBankName"
                  value={formData.bankName}
                  onChange={(e) =>
                    setFormData({ ...formData, bankName: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="addBranch">Branch *</Label>
                <Input
                  id="addBranch"
                  value={formData.branch}
                  onChange={(e) =>
                    setFormData({ ...formData, branch: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="addAccountNumber">Account Number *</Label>
                <Input
                  id="addAccountNumber"
                  value={formData.accountNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, accountNumber: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="addBankAddress">Bank Address *</Label>
                <Input
                  id="addBankAddress"
                  value={formData.bankAddress}
                  onChange={(e) =>
                    setFormData({ ...formData, bankAddress: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="addSwiftCode">SWIFT Code *</Label>
                <Input
                  id="addSwiftCode"
                  value={formData.swiftCode}
                  onChange={(e) =>
                    setFormData({ ...formData, swiftCode: e.target.value })
                  }
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="button" onClick={handleAdd}>
                Add Bank Account
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Saved Bank Accounts</CardTitle>
          <CardDescription>
            All bank accounts saved in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Account Name</TableHead>
                <TableHead>Bank Name</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>Account Number</TableHead>
                <TableHead>SWIFT Code</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bankAccounts.map((bank) => (
                <TableRow key={bank.id}>
                  <TableCell className="font-medium">{bank.accountName}</TableCell>
                  <TableCell>{bank.bankName}</TableCell>
                  <TableCell>{bank.branch}</TableCell>
                  <TableCell>{bank.accountNumber}</TableCell>
                  <TableCell>{bank.swiftCode}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(bank)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick(bank.id, bank.accountName)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Bank Account</DialogTitle>
            <DialogDescription>
              Update bank account details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="editAccountName">Account Name *</Label>
              <Input
                id="editAccountName"
                value={formData.accountName}
                onChange={(e) =>
                  setFormData({ ...formData, accountName: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editBankName">Bank Name *</Label>
              <Input
                id="editBankName"
                value={formData.bankName}
                onChange={(e) =>
                  setFormData({ ...formData, bankName: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editBranch">Branch *</Label>
              <Input
                id="editBranch"
                value={formData.branch}
                onChange={(e) =>
                  setFormData({ ...formData, branch: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editAccountNumber">Account Number *</Label>
              <Input
                id="editAccountNumber"
                value={formData.accountNumber}
                onChange={(e) =>
                  setFormData({ ...formData, accountNumber: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editBankAddress">Bank Address *</Label>
              <Input
                id="editBankAddress"
                value={formData.bankAddress}
                onChange={(e) =>
                  setFormData({ ...formData, bankAddress: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editSwiftCode">SWIFT Code *</Label>
              <Input
                id="editSwiftCode"
                value={formData.swiftCode}
                onChange={(e) =>
                  setFormData({ ...formData, swiftCode: e.target.value })
                }
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                setEditingBank(null);
              }}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleUpdate}>
              Update Bank Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={!!deleteConfirm}
        onOpenChange={(open) => !open && setDeleteConfirm(null)}
        title="Delete Bank Account"
        description={
          deleteConfirm
            ? `Are you sure you want to delete bank account "${deleteConfirm.name}"? This cannot be undone.`
            : ""
        }
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
