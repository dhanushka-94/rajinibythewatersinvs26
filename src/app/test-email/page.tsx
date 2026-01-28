"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, CheckCircle, XCircle, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";

type EmailConfig = {
  configured: boolean;
  method: "resend" | "smtp" | null;
  hint?: string;
};

export default function TestEmailPage() {
  const [email, setEmail] = useState("olexto@gmail.com");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message?: string; error?: string } | null>(null);
  const [config, setConfig] = useState<EmailConfig | null>(null);
  const [configLoading, setConfigLoading] = useState(true);

  const fetchConfig = async () => {
    setConfigLoading(true);
    try {
      const res = await fetch("/api/email-config");
      const data = await res.json();
      if (res.ok) setConfig({ configured: data.configured, method: data.method, hint: data.hint });
      else setConfig(null);
    } catch {
      setConfig(null);
    } finally {
      setConfigLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleSendTestEmail = async () => {
    if (!email) {
      toast.error("Please enter an email address");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
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
        const msg = data.message || "Test email sent successfully!";
        setResult({ success: true, message: msg });
        toast.success(msg);
      } else {
        const err = data.error || "Failed to send test email";
        setResult({ success: false, error: err });
        toast.error(err);
      }
    } catch (error: unknown) {
      const err = error instanceof Error ? error.message : "An error occurred while sending the test email";
      setResult({ success: false, error: err });
      toast.error(err);
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
            Test Resend API or SMTP by sending a test email. Invoice emails use the same config.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Email config status */}
          {!configLoading && config && (
            <div
              className={`flex items-start gap-3 p-4 rounded-lg border ${
                config.configured
                  ? "bg-green-50 border-green-200"
                  : "bg-amber-50 border-amber-200"
              }`}
            >
              {config.configured ? (
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                {config.configured ? (
                  <p className="text-sm font-medium text-green-800">
                    Email configured via <span className="font-semibold">{config.method === "resend" ? "Resend API" : "SMTP"}</span>. You can send test and invoice emails.
                  </p>
                ) : (
                  <>
                    <p className="text-sm font-medium text-amber-800 mb-1">
                      Email is not configured. Sending will fail until you add credentials.
                    </p>
                    <p className="text-sm text-amber-800 mt-1">{config.hint}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={fetchConfig}
                    >
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Re-check config
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}

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
            disabled={loading || !email || (config && !config.configured)}
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
            <h3 className="font-medium text-blue-900 mb-2">Setup</h3>
            <p className="text-sm text-blue-800 mb-2">
              <strong>Vercel (recommended):</strong> Add <code className="bg-blue-100 px-1 rounded">RESEND_API_KEY</code> in Project → Settings → Environment Variables, then redeploy. No SMTP.
            </p>
            <p className="text-sm text-blue-800 mb-2">
              <strong>Local:</strong> Add <code className="bg-blue-100 px-1 rounded">RESEND_API_KEY</code> to <code className="bg-blue-100 px-1 rounded">.env.local</code> (or SMTP_USER + SMTP_PASSWORD), then restart the dev server.
            </p>
            <p className="text-sm text-blue-800">
              Optional: SMTP_FROM_EMAIL, SMTP_FROM_NAME, SMTP_REPLY_TO. See <code className="bg-blue-100 px-1 rounded">.env.local.example</code> and <code className="bg-blue-100 px-1 rounded">docs/RESEND_SETUP.md</code>.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
