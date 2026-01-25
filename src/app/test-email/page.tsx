"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function TestEmailPage() {
  const [email, setEmail] = useState("olexto@gmail.com");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message?: string; error?: string } | null>(null);

  const handleSendTestEmail = async () => {
    if (!email) {
      alert("Please enter an email address");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/test-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipientEmail: email,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setResult({
          success: true,
          message: data.message || "Test email sent successfully!",
        });
      } else {
        setResult({
          success: false,
          error: data.error || "Failed to send test email",
        });
      }
    } catch (error: any) {
      setResult({
        success: false,
        error: error.message || "An error occurred while sending the test email",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Test Email Configuration</CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Test your SMTP configuration (e.g. your own domain email) by sending a test email
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="testEmail">Recipient Email Address</Label>
            <Input
              id="testEmail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="recipient@example.com"
            />
          </div>

          <Button
            onClick={handleSendTestEmail}
            disabled={loading || !email}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send Test Email
              </>
            )}
          </Button>

          {result && (
            <div
              className={`p-4 rounded-lg border ${
                result.success
                  ? "bg-green-50 border-green-200 text-green-800"
                  : "bg-red-50 border-red-200 text-red-800"
              }`}
            >
              <div className="flex items-start gap-2">
                {result.success ? (
                  <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                ) : (
                  <XCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                )}
                <div>
                  {result.success ? (
                    <p className="font-medium">{result.message}</p>
                  ) : (
                    <div>
                      <p className="font-medium">Error sending email</p>
                      <p className="text-sm mt-1">{result.error}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">Using your own domain</h3>
            <p className="text-sm text-blue-800 mb-2">
              Set in <code className="bg-blue-100 px-1 rounded">.env.local</code>: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD.
              Optionally SMTP_FROM_EMAIL and SMTP_FROM_NAME so emails send as your domain (e.g. bookings@yourdomain.com).
            </p>
            <p className="text-sm text-blue-800">
              Works with Gmail, Brevo, Resend SMTP, etc. Use an app password, not your normal login.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
