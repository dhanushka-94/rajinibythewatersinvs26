"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { hotelInfo } from "@/lib/hotel-info";

export default function SettingsPage() {
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
            <Label htmlFor="hotelName">Hotel Name</Label>
            <Input id="hotelName" defaultValue={hotelInfo.name} readOnly />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hotelAddress">Address</Label>
            <Input id="hotelAddress" defaultValue={hotelInfo.address} readOnly />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hotelCity">City</Label>
              <Input id="hotelCity" defaultValue={hotelInfo.city} readOnly />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hotelCountry">Country</Label>
              <Input id="hotelCountry" defaultValue={hotelInfo.country} readOnly />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hotelPhone">Telephone</Label>
              <Input id="hotelPhone" defaultValue={hotelInfo.telephone} readOnly />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hotelHotline">Hotline</Label>
              <Input id="hotelHotline" defaultValue={hotelInfo.hotline} readOnly />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hotelUSA">USA Contact</Label>
              <Input id="hotelUSA" defaultValue={hotelInfo.usaContact} readOnly />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hotelEmail">Email</Label>
              <Input id="hotelEmail" type="email" defaultValue={hotelInfo.email} readOnly />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="hotelWebsite">Website</Label>
            <Input id="hotelWebsite" defaultValue={hotelInfo.website} readOnly />
          </div>
          <p className="text-sm text-muted-foreground">
            Hotel information is managed in the system configuration.
          </p>
          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground text-center">
              {hotelInfo.name} Powered by <span className="font-semibold">Phoenix Global Solutions</span>
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
