export type ActivityType =
  | "invoice_created"
  | "invoice_updated"
  | "invoice_deleted"
  | "invoice_viewed"
  | "invoice_printed"
  | "invoice_status_changed"
  | "guest_created"
  | "guest_updated"
  | "guest_deleted"
  | "travel_company_created"
  | "travel_company_updated"
  | "travel_company_deleted"
  | "bank_detail_created"
  | "bank_detail_updated"
  | "bank_detail_deleted"
  | "user_created"
  | "user_updated"
  | "user_deleted"
  | "user_logged_in"
  | "user_logged_out"
  | "settings_updated"
  | "report_generated"
  | "payment_recorded"
  | "other";

export interface ActivityLog {
  id: string;
  userId: string;
  username: string;
  userFullName?: string;
  activityType: ActivityType;
  entityType: string; // e.g., "invoice", "guest", "travel_company"
  entityId?: string; // ID of the affected entity
  entityName?: string; // Name/description of the affected entity
  description: string; // Human-readable description
  metadata?: Record<string, any>; // Additional data (JSON)
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface ActivityLogCreate {
  userId: string;
  activityType: ActivityType;
  entityType: string;
  entityId?: string;
  entityName?: string;
  description: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export interface ActivityLogFilter {
  userId?: string;
  activityType?: ActivityType;
  entityType?: string;
  entityId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  limit?: number;
  offset?: number;
}
