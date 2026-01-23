"use server";

import { supabase } from "./supabase";
import { User, UserCreate, UserUpdate } from "@/types/user";
import { hashPassword } from "./auth";
import { nowISOStringSL } from "./date-sl";

// Map database row to User interface
function mapDbToUser(data: any): User {
  return {
    id: data.id,
    username: data.username,
    fullName: data.full_name,
    email: data.email,
    role: data.role,
    isActive: data.is_active,
    lastLogin: data.last_login,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

// Get all users
export async function getUsers(): Promise<User[]> {
  if (!supabase) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching users:", error);
      return [];
    }

    return (data || []).map(mapDbToUser);
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}

// Get user by ID
export async function getUserById(id: string): Promise<User | undefined> {
  if (!supabase) {
    return undefined;
  }

  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return undefined;
    }

    return mapDbToUser(data);
  } catch (error) {
    console.error("Error fetching user:", error);
    return undefined;
  }
}

// Create user
export async function createUser(userData: UserCreate): Promise<User> {
  if (!supabase) {
    throw new Error("Database not configured");
  }

  // Check if username already exists
  const { data: existingUser } = await supabase
    .from("users")
    .select("id")
    .eq("username", userData.username)
    .single();

  if (existingUser) {
    throw new Error("Username already exists");
  }

  // Hash password
  const passwordHash = await hashPassword(userData.password);

  // Insert user
  const { data, error } = await supabase
    .from("users")
    .insert([
      {
        username: userData.username,
        password_hash: passwordHash,
        full_name: userData.fullName,
        email: userData.email || null,
        role: userData.role,
        is_active: userData.isActive !== undefined ? userData.isActive : true,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Error creating user:", error);
    throw new Error("Failed to create user");
  }

  return mapDbToUser(data);
}

// Update user
export async function updateUser(id: string, userData: UserUpdate): Promise<void> {
  if (!supabase) {
    throw new Error("Database not configured");
  }

  const updateData: any = {};

  if (userData.username !== undefined) {
    // Check if username is already taken by another user
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("username", userData.username)
      .neq("id", id)
      .single();

    if (existingUser) {
      throw new Error("Username already exists");
    }

    updateData.username = userData.username;
  }

  if (userData.password !== undefined) {
    updateData.password_hash = await hashPassword(userData.password);
  }

  if (userData.fullName !== undefined) {
    updateData.full_name = userData.fullName;
  }

  if (userData.email !== undefined) {
    updateData.email = userData.email || null;
  }

  if (userData.role !== undefined) {
    updateData.role = userData.role;
  }

  if (userData.isActive !== undefined) {
    updateData.is_active = userData.isActive;
  }

  updateData.updated_at = nowISOStringSL();

  const { error } = await supabase
    .from("users")
    .update(updateData)
    .eq("id", id);

  if (error) {
    console.error("Error updating user:", error);
    throw new Error("Failed to update user");
  }
}

// Delete user
export async function deleteUser(id: string): Promise<void> {
  if (!supabase) {
    throw new Error("Database not configured");
  }

  const { error } = await supabase
    .from("users")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting user:", error);
    throw new Error("Failed to delete user");
  }
}
