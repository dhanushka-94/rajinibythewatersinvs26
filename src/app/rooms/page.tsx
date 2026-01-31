"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BedDouble,
  RefreshCw,
  Wrench,
  User,
  Calendar,
  LogIn,
  LogOut,
  CheckCircle,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { formatDateSL, todaySL } from "@/lib/date-sl";
import { LiveClock } from "@/components/live-clock";
import type { RoomWithStatus, RoomOperationalStatus } from "@/lib/room-status";

const STATUS_CONFIG: Record<
  RoomOperationalStatus,
  { label: string; className: string; icon: React.ReactNode }
> = {
  available: {
    label: "Available",
    className: "bg-green-100 text-green-800 border-green-200",
    icon: <CheckCircle className="h-4 w-4" />,
  },
  booked: {
    label: "Booked",
    className: "bg-blue-100 text-blue-800 border-blue-200",
    icon: <Calendar className="h-4 w-4" />,
  },
  checked_in: {
    label: "Checked In",
    className: "bg-emerald-100 text-emerald-800 border-emerald-200",
    icon: <LogIn className="h-4 w-4" />,
  },
  checked_out: {
    label: "Checked Out",
    className: "bg-amber-100 text-amber-800 border-amber-200",
    icon: <LogOut className="h-4 w-4" />,
  },
  maintenance: {
    label: "Maintenance",
    className: "bg-orange-100 text-orange-800 border-orange-200",
    icon: <Wrench className="h-4 w-4" />,
  },
  disabled: {
    label: "Disabled",
    className: "bg-gray-100 text-gray-700 border-gray-200",
    icon: <XCircle className="h-4 w-4" />,
  },
};

export default function RoomStatusPage() {
  const [rooms, setRooms] = useState<RoomWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<RoomOperationalStatus | "all">("all");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/rooms/status");
      const data = await res.json();
      if (data.success) {
        setRooms(data.rooms);
      }
    } catch (e) {
      console.error("Error loading room status:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const today = todaySL();
  const filtered = rooms.filter(
    (r) => statusFilter === "all" || r.operationalStatus === statusFilter
  );

  const groupedByFloor = filtered.reduce<Record<string, RoomWithStatus[]>>(
    (acc, r) => {
      const floor = r.floor || "No floor";
      if (!acc[floor]) acc[floor] = [];
      acc[floor].push(r);
      return acc;
    },
    {}
  );
  const floorKeys = Object.keys(groupedByFloor).sort((a, b) => {
    if (a === "No floor") return 1;
    if (b === "No floor") return -1;
    return a.localeCompare(b, undefined, { numeric: true });
  });

  const statusCounts = rooms.reduce<Record<RoomOperationalStatus, number>>(
    (acc, r) => {
      acc[r.operationalStatus] = (acc[r.operationalStatus] || 0) + 1;
      return acc;
    },
    {} as Record<RoomOperationalStatus, number>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Room Status</h1>
          <p className="text-muted-foreground">
            Overview of all rooms as of {formatDateSL(today)}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={loadData} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <LiveClock />
          <Link href="/settings/hotel-rooms">
            <Button variant="outline" size="sm">
              <BedDouble className="mr-2 h-4 w-4" />
              Manage Rooms
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary badges */}
      <div className="flex flex-wrap gap-2">
        {(Object.entries(STATUS_CONFIG) as [RoomOperationalStatus, typeof STATUS_CONFIG.available][]).map(
          ([key, cfg]) => {
            const count = statusCounts[key] || 0;
            return (
              <button
                key={key}
                type="button"
                onClick={() =>
                  setStatusFilter((f) => (f === key ? "all" : key))
                }
                className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors hover:opacity-90 ${
                  statusFilter === key
                    ? "ring-2 ring-offset-2 ring-primary"
                    : ""
                } ${cfg.className}`}
              >
                {cfg.icon}
                <span>{cfg.label}</span>
                <span className="font-bold">{count}</span>
              </button>
            );
          }
        )}
      </div>

      {/* Filter dropdown */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Filter:</span>
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as RoomOperationalStatus | "all")}
        >
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All rooms</SelectItem>
            {(Object.entries(STATUS_CONFIG) as [RoomOperationalStatus, typeof STATUS_CONFIG.available][]).map(
              ([key, cfg]) => (
                <SelectItem key={key} value={key}>
                  {cfg.label}
                </SelectItem>
              )
            )}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-32 rounded-lg border bg-muted animate-pulse"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <BedDouble className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {statusFilter === "all"
                ? "No rooms found. Add rooms in Settings."
                : `No rooms with status "${STATUS_CONFIG[statusFilter as RoomOperationalStatus]?.label}".`}
            </p>
            {statusFilter !== "all" && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setStatusFilter("all")}
              >
                Show all rooms
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {floorKeys.map((floor) => (
            <div key={floor}>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <span className="text-muted-foreground">
                  {floor === "No floor" ? "Other" : `Floor ${floor}`}
                </span>
                <span className="text-sm font-normal text-muted-foreground">
                  ({groupedByFloor[floor].length} room
                  {groupedByFloor[floor].length !== 1 ? "s" : ""})
                </span>
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {groupedByFloor[floor]
                  .sort((a, b) =>
                    a.roomNumber.localeCompare(b.roomNumber, undefined, {
                      numeric: true,
                    })
                  )
                  .map((room) => {
                    const cfg =
                      STATUS_CONFIG[room.operationalStatus] ||
                      STATUS_CONFIG.available;
                    return (
                      <Card
                        key={room.id}
                        className={`overflow-hidden transition-colors ${
                          room.operationalStatus === "checked_in"
                            ? "border-l-4 border-l-emerald-500"
                            : room.operationalStatus === "booked"
                              ? "border-l-4 border-l-blue-500"
                              : room.operationalStatus === "checked_out"
                                ? "border-l-4 border-l-amber-500"
                                : room.operationalStatus === "maintenance"
                                  ? "border-l-4 border-l-orange-500"
                                  : ""
                        }`}
                      >
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between">
                            <CardTitle className="text-lg flex items-center gap-2">
                              <BedDouble className="h-5 w-5 text-muted-foreground" />
                              Room {room.roomNumber}
                            </CardTitle>
                            <Badge
                              variant="outline"
                              className={`flex items-center gap-1 ${cfg.className}`}
                            >
                              {cfg.icon}
                              {cfg.label}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {room.roomType} • Capacity {room.capacity}
                          </p>
                        </CardHeader>
                        <CardContent className="pt-0">
                          {(room.guestName || room.bookingId) && (
                            <div className="space-y-2 text-sm">
                              {room.guestName && (
                                <div className="flex items-center gap-2 text-foreground">
                                  <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                  <span className="truncate">{room.guestName}</span>
                                </div>
                              )}
                              {room.checkIn && room.checkOut && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <Calendar className="h-4 w-4 flex-shrink-0" />
                                  <span>
                                    {formatDateSL(room.checkIn)} –{" "}
                                    {formatDateSL(room.checkOut)}
                                  </span>
                                </div>
                              )}
                              {room.bookingId && (
                                <Link
                                  href={`/bookings/${room.bookingId}`}
                                  className="inline-block"
                                >
                                  <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                                    View booking →
                                  </Button>
                                </Link>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
