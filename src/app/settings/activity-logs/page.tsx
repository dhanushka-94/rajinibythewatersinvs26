"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ActivityLog, ActivityType } from "@/types/activity-log";
import { getActivityLogs, getActivityLogsCount } from "@/lib/activity-logs";
// Format distance to now helper
const formatDistanceToNow = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return `${diffInSeconds} seconds ago`;
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 2592000) {
    const weeks = Math.floor(diffInSeconds / 604800);
    return `${weeks} week${weeks !== 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 31536000) {
    const months = Math.floor(diffInSeconds / 2592000);
    return `${months} month${months !== 1 ? 's' : ''} ago`;
  } else {
    const years = Math.floor(diffInSeconds / 31536000);
    return `${years} year${years !== 1 ? 's' : ''} ago`;
  }
};
import { Search, Filter, RefreshCw, FileText, User, Building2, CreditCard, Settings, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

const activityTypeLabels: Record<ActivityType, string> = {
  invoice_created: "Invoice Created",
  invoice_updated: "Invoice Updated",
  invoice_deleted: "Invoice Deleted",
  invoice_viewed: "Invoice Viewed",
  invoice_printed: "Invoice Printed",
  invoice_sent: "Invoice Sent",
  invoice_status_changed: "Invoice Status Changed",
  guest_created: "Guest Created",
  guest_updated: "Guest Updated",
  guest_deleted: "Guest Deleted",
  travel_company_created: "Travel Company Created",
  travel_company_updated: "Travel Company Updated",
  travel_company_deleted: "Travel Company Deleted",
  bank_detail_created: "Bank Detail Created",
  bank_detail_updated: "Bank Detail Updated",
  bank_detail_deleted: "Bank Detail Deleted",
  user_created: "User Created",
  user_updated: "User Updated",
  user_deleted: "User Deleted",
  user_logged_in: "User Logged In",
  user_logged_out: "User Logged Out",
  settings_updated: "Settings Updated",
  report_generated: "Report Generated",
  payment_recorded: "Payment Recorded",
  other: "Other",
};

const activityTypeColors: Record<ActivityType, string> = {
  invoice_created: "bg-blue-100 text-blue-800 border-blue-200",
  invoice_updated: "bg-amber-100 text-amber-800 border-amber-200",
  invoice_deleted: "bg-red-100 text-red-800 border-red-200",
  invoice_viewed: "bg-gray-100 text-gray-800 border-gray-200",
  invoice_printed: "bg-purple-100 text-purple-800 border-purple-200",
  invoice_sent: "bg-teal-100 text-teal-800 border-teal-200",
  invoice_status_changed: "bg-indigo-100 text-indigo-800 border-indigo-200",
  guest_created: "bg-green-100 text-green-800 border-green-200",
  guest_updated: "bg-yellow-100 text-yellow-800 border-yellow-200",
  guest_deleted: "bg-red-100 text-red-800 border-red-200",
  travel_company_created: "bg-blue-100 text-blue-800 border-blue-200",
  travel_company_updated: "bg-amber-100 text-amber-800 border-amber-200",
  travel_company_deleted: "bg-red-100 text-red-800 border-red-200",
  bank_detail_created: "bg-green-100 text-green-800 border-green-200",
  bank_detail_updated: "bg-yellow-100 text-yellow-800 border-yellow-200",
  bank_detail_deleted: "bg-red-100 text-red-800 border-red-200",
  user_created: "bg-green-100 text-green-800 border-green-200",
  user_updated: "bg-yellow-100 text-yellow-800 border-yellow-200",
  user_deleted: "bg-red-100 text-red-800 border-red-200",
  user_logged_in: "bg-emerald-100 text-emerald-800 border-emerald-200",
  user_logged_out: "bg-gray-100 text-gray-800 border-gray-200",
  settings_updated: "bg-orange-100 text-orange-800 border-orange-200",
  report_generated: "bg-cyan-100 text-cyan-800 border-cyan-200",
  payment_recorded: "bg-lime-100 text-lime-800 border-lime-200",
  other: "bg-gray-100 text-gray-800 border-gray-200",
};

const entityTypeIcons: Record<string, any> = {
  invoice: FileText,
  guest: User,
  travel_company: Building2,
  bank_detail: CreditCard,
  user: User,
  settings: Settings,
  report: FileText,
  payment: CreditCard,
};

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(50);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedActivityType, setSelectedActivityType] = useState<ActivityType | "all">("all");
  const [selectedEntityType, setSelectedEntityType] = useState<string>("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const loadLogs = async () => {
    setLoading(true);
    try {
      const filter: any = {
        limit: pageSize,
        offset: (page - 1) * pageSize,
      };

      if (searchTerm) {
        filter.search = searchTerm;
      }

      if (selectedActivityType !== "all") {
        filter.activityType = selectedActivityType;
      }

      if (selectedEntityType !== "all") {
        filter.entityType = selectedEntityType;
      }

      if (startDate) {
        filter.startDate = new Date(startDate).toISOString();
      }

      if (endDate) {
        // Set to end of day
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.endDate = end.toISOString();
      }

      const [logsData, count] = await Promise.all([
        getActivityLogs(filter),
        getActivityLogsCount(filter),
      ]);

      setLogs(logsData);
      setTotalCount(count);
    } catch (error) {
      console.error("Error loading activity logs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [page, selectedActivityType, selectedEntityType, startDate, endDate]);

  const handleSearch = () => {
    setPage(1);
    loadLogs();
  };

  const handleReset = () => {
    setSearchTerm("");
    setSelectedActivityType("all");
    setSelectedEntityType("all");
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Activity Logs</h1>
        <p className="text-muted-foreground">
          Track all user activities and system events
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="flex gap-2">
                <Input
                  id="search"
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearch();
                    }
                  }}
                />
                <Button onClick={handleSearch} size="icon">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="activityType">Activity Type</Label>
              <Select
                value={selectedActivityType}
                onValueChange={(value) => {
                  setSelectedActivityType(value as ActivityType | "all");
                  setPage(1);
                }}
              >
                <SelectTrigger id="activityType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {Object.entries(activityTypeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="entityType">Entity Type</Label>
              <Select
                value={selectedEntityType}
                onValueChange={(value) => {
                  setSelectedEntityType(value);
                  setPage(1);
                }}
              >
                <SelectTrigger id="entityType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Entities</SelectItem>
                  <SelectItem value="invoice">Invoice</SelectItem>
                  <SelectItem value="guest">Guest</SelectItem>
                  <SelectItem value="travel_company">Travel Company</SelectItem>
                  <SelectItem value="bank_detail">Bank Detail</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="settings">Settings</SelectItem>
                  <SelectItem value="report">Report</SelectItem>
                  <SelectItem value="payment">Payment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Actions</Label>
              <div className="flex gap-2">
                <Button onClick={handleReset} variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 mt-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Activity Logs</CardTitle>
            <div className="text-sm text-muted-foreground">
              Total: {totalCount} logs
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No activity logs found
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Activity</TableHead>
                      <TableHead>Entity</TableHead>
                      <TableHead>Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => {
                      const EntityIcon = entityTypeIcons[log.entityType] || FileText;
                      return (
                        <TableRow key={log.id}>
                          <TableCell className="whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <div className="text-sm font-medium">
                                  {new Date(log.createdAt).toLocaleString()}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {formatDistanceToNow(new Date(log.createdAt))}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <div className="font-medium">{log.username}</div>
                                {log.userFullName && (
                                  <div className="text-xs text-muted-foreground">
                                    {log.userFullName}
                                  </div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={activityTypeColors[log.activityType]}
                            >
                              {activityTypeLabels[log.activityType]}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <EntityIcon className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <div className="font-medium capitalize">
                                  {log.entityType.replace("_", " ")}
                                </div>
                                {log.entityName && (
                                  <div className="text-xs text-muted-foreground">
                                    {log.entityName}
                                  </div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-md">
                            <div className="text-sm">{log.description}</div>
                            {log.metadata && Object.keys(log.metadata).length > 0 && (
                              <details className="mt-1">
                                <summary className="text-xs text-muted-foreground cursor-pointer">
                                  View details
                                </summary>
                                <pre className="text-xs mt-1 p-2 bg-muted rounded overflow-auto">
                                  {JSON.stringify(log.metadata, null, 2)}
                                </pre>
                              </details>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
