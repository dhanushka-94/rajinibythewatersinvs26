"use server";

import { supabase } from "./supabase";
import { ActivityLog, ActivityLogCreate, ActivityLogFilter } from "@/types/activity-log";
import { getSession } from "./auth";
import { nowISOStringSL } from "./date-sl";

// Map database row to ActivityLog interface
const mapDbToActivityLog = (data: any): ActivityLog => {
  return {
    id: data.id,
    userId: data.user_id,
    username: data.username,
    userFullName: data.user_full_name,
    activityType: data.activity_type,
    entityType: data.entity_type,
    entityId: data.entity_id || undefined,
    entityName: data.entity_name || undefined,
    description: data.description,
    metadata: data.metadata ? (typeof data.metadata === 'string' ? JSON.parse(data.metadata) : data.metadata) : undefined,
    ipAddress: data.ip_address || undefined,
    userAgent: data.user_agent || undefined,
    createdAt: data.created_at,
  };
};

// Map ActivityLogCreate to database row
const mapActivityLogToDb = (log: ActivityLogCreate): any => {
  // Get user info from session
  return {
    user_id: log.userId,
    activity_type: log.activityType,
    entity_type: log.entityType,
    entity_id: log.entityId || null,
    entity_name: log.entityName || null,
    description: log.description,
    metadata: log.metadata ? JSON.stringify(log.metadata) : null,
    ip_address: log.ipAddress || null,
    user_agent: log.userAgent || null,
  };
};

// Get user info for activity log
async function getUserInfoForLog(userId: string): Promise<{ username: string; fullName?: string }> {
  if (!supabase) {
    return { username: "Unknown" };
  }

  try {
    const { data, error } = await supabase
      .from("users")
      .select("username, full_name")
      .eq("id", userId)
      .single();

    if (error || !data) {
      return { username: "Unknown" };
    }

    return {
      username: data.username,
      fullName: data.full_name || undefined,
    };
  } catch (error) {
    console.error("Error getting user info for log:", error);
    return { username: "Unknown" };
  }
}

// Create activity log
export async function createActivityLog(
  activityType: ActivityLogCreate["activityType"],
  entityType: string,
  description: string,
  options?: {
    entityId?: string;
    entityName?: string;
    metadata?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
    userId?: string; // Optional, will use session if not provided
  }
): Promise<void> {
  try {
    if (!supabase) {
      console.warn("Activity log: Database not configured");
      return;
    }

    // Get user from session or use provided userId
    let userId = options?.userId;
    if (!userId) {
      const session = await getSession();
      if (!session) {
        console.warn("Activity log: No session found");
        return;
      }
      userId = session.userId;
    }

    // Get user info
    const userInfo = await getUserInfoForLog(userId);

    const logData: ActivityLogCreate = {
      userId,
      activityType,
      entityType,
      entityId: options?.entityId,
      entityName: options?.entityName,
      description,
      metadata: options?.metadata,
      ipAddress: options?.ipAddress,
      userAgent: options?.userAgent,
    };

    const dbData = mapActivityLogToDb(logData);
    
    // Add username and full_name to the database record
    dbData.username = userInfo.username;
    dbData.user_full_name = userInfo.fullName || null;
    dbData.created_at = nowISOStringSL();

    const { error } = await supabase
      .from("activity_logs")
      .insert([dbData]);

    if (error) {
      console.error("Error creating activity log:", error);
    }
  } catch (error) {
    console.error("Error creating activity log:", error);
  }
}

// Get activity logs with filters
export async function getActivityLogs(filter?: ActivityLogFilter): Promise<ActivityLog[]> {
  if (!supabase) {
    return [];
  }

  try {
    let query = supabase
      .from("activity_logs")
      .select("*")
      .order("created_at", { ascending: false });

    if (filter?.userId) {
      query = query.eq("user_id", filter.userId);
    }

    if (filter?.activityType) {
      query = query.eq("activity_type", filter.activityType);
    }

    if (filter?.entityType) {
      query = query.eq("entity_type", filter.entityType);
    }

    if (filter?.entityId) {
      query = query.eq("entity_id", filter.entityId);
    }

    if (filter?.startDate) {
      query = query.gte("created_at", filter.startDate);
    }

    if (filter?.endDate) {
      query = query.lte("created_at", filter.endDate);
    }

    if (filter?.search) {
      query = query.or(
        `description.ilike.%${filter.search}%,entity_name.ilike.%${filter.search}%,username.ilike.%${filter.search}%`
      );
    }

    if (filter?.limit) {
      query = query.limit(filter.limit);
    }

    if (filter?.offset) {
      query = query.range(filter.offset, filter.offset + (filter.limit || 100) - 1);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching activity logs:", error);
      return [];
    }

    return (data || []).map(mapDbToActivityLog);
  } catch (error) {
    console.error("Error fetching activity logs:", error);
    return [];
  }
}

// Get activity log by ID
export async function getActivityLogById(id: string): Promise<ActivityLog | null> {
  if (!supabase) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from("activity_logs")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return null;
    }

    return mapDbToActivityLog(data);
  } catch (error) {
    console.error("Error fetching activity log:", error);
    return null;
  }
}

// Get activity logs count
export async function getActivityLogsCount(filter?: ActivityLogFilter): Promise<number> {
  if (!supabase) {
    return 0;
  }

  try {
    let query = supabase
      .from("activity_logs")
      .select("*", { count: "exact", head: true });

    if (filter?.userId) {
      query = query.eq("user_id", filter.userId);
    }

    if (filter?.activityType) {
      query = query.eq("activity_type", filter.activityType);
    }

    if (filter?.entityType) {
      query = query.eq("entity_type", filter.entityType);
    }

    if (filter?.entityId) {
      query = query.eq("entity_id", filter.entityId);
    }

    if (filter?.startDate) {
      query = query.gte("created_at", filter.startDate);
    }

    if (filter?.endDate) {
      query = query.lte("created_at", filter.endDate);
    }

    if (filter?.search) {
      query = query.or(
        `description.ilike.%${filter.search}%,entity_name.ilike.%${filter.search}%,username.ilike.%${filter.search}%`
      );
    }

    const { count, error } = await query;

    if (error) {
      console.error("Error counting activity logs:", error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error("Error counting activity logs:", error);
    return 0;
  }
}

// Get activity logs by entity
export async function getActivityLogsByEntity(
  entityType: string,
  entityId: string
): Promise<ActivityLog[]> {
  return getActivityLogs({ entityType, entityId });
}

// Get activity logs by user
export async function getActivityLogsByUser(userId: string): Promise<ActivityLog[]> {
  return getActivityLogs({ userId });
}
