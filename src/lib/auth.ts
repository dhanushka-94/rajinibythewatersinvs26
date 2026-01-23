"use server";

import bcrypt from "bcryptjs";
import { supabase } from "./supabase";
import { User, UserCreate, UserUpdate, LoginCredentials, UserRole } from "@/types/user";
import { cookies } from "next/headers";
import { createActivityLog } from "./activity-logs";
import { nowISOStringSL, toISOStringSL } from "./date-sl";

const SESSION_COOKIE_NAME = "invoice-session";
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

// Verify password
async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Create session
async function createSession(userId: string, username: string, role: UserRole) {
  const sessionData = {
    userId,
    username,
    role,
    expiresAt: toISOStringSL(new Date(Date.now() + SESSION_DURATION)),
  };
  
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, JSON.stringify(sessionData), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DURATION / 1000,
    path: "/",
  });
}

// Get current session
export async function getSession(): Promise<{ userId: string; username: string; role: UserRole } | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
    
    if (!sessionCookie?.value) {
      return null;
    }

    const session = JSON.parse(sessionCookie.value);
    
    // Check if session expired
    if (new Date(session.expiresAt) < new Date()) {
      await clearSession();
      return null;
    }

    return {
      userId: session.userId,
      username: session.username,
      role: session.role,
    };
  } catch (error) {
    console.error("Error getting session:", error);
    return null;
  }
}

// Clear session
export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

// Login
export async function login(credentials: LoginCredentials): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    if (!supabase) {
      return { success: false, error: "Database not configured" };
    }

    // Find user by username
    const { data: userData, error } = await supabase
      .from("users")
      .select("*")
      .eq("username", credentials.username)
      .eq("is_active", true)
      .single();

    if (error || !userData) {
      return { success: false, error: "Invalid username or password" };
    }

    // Verify password
    const isValid = await verifyPassword(credentials.password, userData.password_hash);
    if (!isValid) {
      return { success: false, error: "Invalid username or password" };
    }

    // Update last login
    await supabase
      .from("users")
      .update({ last_login: nowISOStringSL() })
      .eq("id", userData.id);

    // Create session
    await createSession(userData.id, userData.username, userData.role);

    // Map database user to User interface
    const user: User = {
      id: userData.id,
      username: userData.username,
      fullName: userData.full_name,
      email: userData.email,
      role: userData.role,
      isActive: userData.is_active,
      lastLogin: userData.last_login,
      createdAt: userData.created_at,
      updatedAt: userData.updated_at,
    };

    // Log login activity
    await createActivityLog(
      "user_logged_in",
      "user",
      `User ${userData.username} logged in`,
      {
        entityId: userData.id,
        entityName: userData.username,
        userId: userData.id, // Explicitly set userId for login
      }
    );

    return { success: true, user };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, error: "An error occurred during login" };
  }
}

// Logout
export async function logout(): Promise<void> {
  // Get session before clearing to log logout
  const session = await getSession();
  
  if (session) {
    // Log logout activity
    await createActivityLog(
      "user_logged_out",
      "user",
      `User ${session.username} logged out`,
      {
        entityId: session.userId,
        entityName: session.username,
        userId: session.userId, // Explicitly set userId for logout
      }
    );
  }
  
  await clearSession();
}

// Get current user
export async function getCurrentUser(): Promise<User | null> {
  try {
    const session = await getSession();
    if (!session) {
      return null;
    }

    if (!supabase) {
      return null;
    }

    const { data: userData, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", session.userId)
      .eq("is_active", true)
      .single();

    if (error || !userData) {
      return null;
    }

    return {
      id: userData.id,
      username: userData.username,
      fullName: userData.full_name,
      email: userData.email,
      role: userData.role,
      isActive: userData.is_active,
      lastLogin: userData.last_login,
      createdAt: userData.created_at,
      updatedAt: userData.updated_at,
    };
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

// Check if user has permission
export async function hasPermission(requiredRole: UserRole): Promise<boolean> {
  const session = await getSession();
  if (!session) {
    return false;
  }

  const roleHierarchy: Record<UserRole, number> = {
    viewer: 1,
    staff: 2,
    manager: 3,
    admin: 4,
  };

  return roleHierarchy[session.role] >= roleHierarchy[requiredRole];
}
