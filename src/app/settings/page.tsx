"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getHotelInfo, updateHotelInfo, type HotelInfo } from "@/lib/hotel-info";

export default function SettingsPage() {
  const [hotelInfo, setHotelInfo] = useState<HotelInfo | null>(null);
  const [formData, setFormData] = useState<Partial<HotelInfo>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    loadHotelInfo();
  }, []);

  const loadHotelInfo = async () => {
    setIsLoading(true);
    try {
      const info = await getHotelInfo();
      setHotelInfo(info);
      setFormData({
        name: info.name,
        address: info.address,
        city: info.city,
        country: info.country,
        telephone: info.telephone || "",
        hotline: info.hotline || "",
        usaContact: info.usaContact || "",
        email: info.email || "",
        website: info.website || "",
        logoPath: info.logoPath || "",
      });
    } catch (error) {
      console.error("Error loading hotel info:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!hotelInfo) return;

    setIsSaving(true);
    setSaveMessage(null);

    try {
      await updateHotelInfo(formData);
      await loadHotelInfo();
      setSaveMessage({ type: "success", text: "Hotel information updated successfully!" });
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      console.error("Error saving hotel info:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to update hotel information. Please try again.";
      setSaveMessage({ type: "error", text: errorMessage });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your hotel invoice system settings
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Hotel Information</CardTitle>
          <CardDescription>
            Hotel details that appear on invoices
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="hotelName">Hotel Name *</Label>
            <Input
              id="hotelName"
              value={formData.name || ""}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter hotel name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hotelAddress">Address *</Label>
            <Input
              id="hotelAddress"
              value={formData.address || ""}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Enter address"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hotelCity">City *</Label>
              <Input
                id="hotelCity"
                value={formData.city || ""}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Enter city"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hotelCountry">Country *</Label>
              <Input
                id="hotelCountry"
                value={formData.country || ""}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                placeholder="Enter country"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hotelPhone">Telephone</Label>
              <Input
                id="hotelPhone"
                value={formData.telephone || ""}
                onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                placeholder="Enter telephone"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hotelHotline">Hotline</Label>
              <Input
                id="hotelHotline"
                value={formData.hotline || ""}
                onChange={(e) => setFormData({ ...formData, hotline: e.target.value })}
                placeholder="Enter hotline"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hotelUSA">USA Contact</Label>
              <Input
                id="hotelUSA"
                value={formData.usaContact || ""}
                onChange={(e) => setFormData({ ...formData, usaContact: e.target.value })}
                placeholder="Enter USA contact"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hotelEmail">Email</Label>
              <Input
                id="hotelEmail"
                type="email"
                value={formData.email || ""}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter email"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="hotelWebsite">Website</Label>
            <Input
              id="hotelWebsite"
              value={formData.website || ""}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder="Enter website"
            />
          </div>
          {saveMessage && (
            <div
              className={`p-3 rounded-md text-sm ${
                saveMessage.type === "success"
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              {saveMessage.text}
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              onClick={handleSave}
              disabled={isSaving || !formData.name || !formData.address || !formData.city || !formData.country}
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground text-center">
              {hotelInfo?.name || "Hotel"} Powered by <span className="font-semibold">Phoenix Global Solutions</span>
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Invoice Settings</CardTitle>
          <CardDescription>
            Configure default invoice settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="defaultTaxRate">Default Tax Rate (%)</Label>
            <Input id="defaultTaxRate" type="number" placeholder="10" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Input id="currency" placeholder="USD" />
          </div>
          <Button>Save Changes</Button>
        </CardContent>
      </Card>
    </div>
  );
}
