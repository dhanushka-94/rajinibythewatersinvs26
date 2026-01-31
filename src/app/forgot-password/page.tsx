"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle style={{ color: "#D4AF37" }}>Forgot password?</CardTitle>
          <CardDescription>
            Password reset is not yet configured. Please contact your administrator to reset your password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/login">
            <Button
              variant="outline"
              className="w-full"
            >
              Back to login
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
