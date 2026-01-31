"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle, Eye, EyeOff, ExternalLink } from "lucide-react";
import { toast } from "sonner";

const REMEMBER_KEY = "login-remember-username";
const USERNAME_KEY = "login-username";

function validateRedirect(raw: string | null): string {
  if (!raw || typeof raw !== "string") return "/";
  const s = raw.trim();
  if (!s.startsWith("/") || s.includes("//")) return "/";
  return s;
}

function LoginClock() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const fmt = () => {
      const d = new Date();
      const t = d.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
        timeZone: "Asia/Colombo",
      });
      setTime(t);
    };
    fmt();
    const id = setInterval(fmt, 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="text-xs text-muted-foreground">
      Sri Lanka {time} IST
    </span>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawRedirect = searchParams.get("redirect");
  const redirect = validateRedirect(rawRedirect);
  const expired = searchParams.get("expired") === "1";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [hotelInfo, setHotelInfo] = useState<{
    name?: string;
    website?: string;
    logoPath?: string;
  } | null>(null);
  const [logoError, setLogoError] = useState(false);
  const errorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const r = localStorage.getItem(REMEMBER_KEY) === "1";
    setRemember(r);
    if (r) {
      const u = localStorage.getItem(USERNAME_KEY);
      if (u) setUsername(u);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    fetch("/api/hotel-info")
      .then((res) => res.json())
      .then((data) => {
        if (mounted) setHotelInfo(data);
      })
      .catch(() => {
        if (mounted)
          setHotelInfo({
            name: "Rajini by The Waters",
            website: "www.rajinihotels.com",
            logoPath: "/images/rajini-logo-flat-color.png",
          });
      });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (expired) setError("Your session has expired. Please sign in again.");
  }, [expired]);

  const clearError = useCallback(() => setError(""), []);
  const onUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
    clearError();
  };
  const onPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    clearError();
  };

  useEffect(() => {
    if (error && errorRef.current) errorRef.current.focus();
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (data.success) {
        if (remember) {
          localStorage.setItem(REMEMBER_KEY, "1");
          localStorage.setItem(USERNAME_KEY, username);
        } else {
          localStorage.removeItem(REMEMBER_KEY);
          localStorage.removeItem(USERNAME_KEY);
        }
        toast.success("Logged in");
        await new Promise((r) => setTimeout(r, 400));
        router.push(redirect);
        router.refresh();
        return;
      }

      if (res.status === 429) {
        setError(
          data.error || "Too many failed attempts. Please try again later."
        );
        return;
      }
      if (res.status >= 500) {
        setError("Network error. Please check your connection and try again.");
        return;
      }
      setError(data.error || "Invalid username or password");
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = Boolean(username.trim() && password && !loading);
  const logoUrl = hotelInfo?.logoPath || "/images/rajini-logo-flat-color.png";
  const websiteUrl = hotelInfo?.website
    ? hotelInfo.website.startsWith("http")
      ? hotelInfo.website
      : `https://${hotelInfo.website}`
    : null;

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md shadow-lg" aria-label="Login form">
        <CardHeader className="space-y-4">
          <div
            className="flex items-center justify-center mb-2 min-h-[80px]"
            aria-hidden
          >
            {!logoError ? (
              <Image
                src={logoUrl}
                alt={hotelInfo?.name || "Hotel"}
                width={150}
                height={60}
                className="h-auto object-contain"
                priority
                onError={() => setLogoError(true)}
              />
            ) : (
              <div
                className="w-[150px] h-[60px] rounded bg-muted flex items-center justify-center text-xs text-muted-foreground"
                role="img"
                aria-label="Logo unavailable"
              >
                Logo
              </div>
            )}
          </div>
          <div className="text-center">
            <CardTitle
              className="text-2xl font-bold"
              style={{ color: "#D4AF37" }}
            >
              Invoice Management System
            </CardTitle>
            {hotelInfo?.name && (
              <CardDescription className="text-base mt-2">
                {hotelInfo.name}
              </CardDescription>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit}
            className="space-y-4"
            role="form"
            aria-label="Sign in"
          >
            {error && (
              <div
                id="login-error"
                ref={errorRef}
                tabIndex={-1}
                role="alert"
                className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md flex items-start gap-2"
              >
                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <span className="text-sm">{error}</span>
                  <Button
                    type="button"
                    variant="link"
                    className="mt-1 h-auto p-0 text-red-700 underline text-sm"
                    onClick={() => {
                      setError("");
                      setPassword("");
                    }}
                  >
                    Try again
                  </Button>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={onUsernameChange}
                required
                autoComplete="username"
                autoFocus={!expired}
                disabled={loading}
                className="focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                aria-describedby={error ? "login-error" : undefined}
                aria-invalid={!!error}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={onPasswordChange}
                  required
                  autoComplete="current-password"
                  disabled={loading}
                  className="focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] pr-10"
                  aria-describedby={error ? "login-error" : undefined}
                  aria-invalid={!!error}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 rounded"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="remember"
                checked={remember}
                onCheckedChange={(v) => setRemember(v === true)}
                disabled={loading}
                aria-describedby="remember-desc"
              />
              <Label
                id="remember-desc"
                htmlFor="remember"
                className="text-sm font-normal cursor-pointer"
              >
                Remember username
              </Label>
            </div>
            <Button
              type="submit"
              className="w-full font-semibold"
              disabled={!canSubmit}
              style={{
                backgroundColor: "#D4AF37",
                color: "#000",
              }}
              onMouseEnter={(e) => {
                if (canSubmit)
                  e.currentTarget.style.backgroundColor = "#C5A028";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#D4AF37";
              }}
              aria-busy={loading}
            >
              {loading ? "Logging in…" : "Login"}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <a
              href="/forgot-password"
              className="text-sm text-muted-foreground hover:underline"
            >
              Forgot password?
            </a>
          </div>
          {rawRedirect && redirect !== "/" && (
            <p className="text-xs text-center text-muted-foreground mt-2">
              You will be redirected to {redirect} after signing in.
            </p>
          )}
          {websiteUrl && (
            <div className="mt-4 text-center">
              <a
                href={websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:underline"
              >
                Visit website
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}
          <div className="mt-6 pt-4 border-t space-y-2">
            <p className="text-xs text-center text-muted-foreground">
              Powered by{" "}
              <span
                className="font-semibold"
                style={{ color: "#D4AF37" }}
              >
                Phoenix Global Solutions
              </span>
            </p>
            <p className="text-xs text-center text-muted-foreground">
              Developed by{" "}
              <span
                className="font-semibold"
                style={{ color: "#D4AF37" }}
              >
                olexto Digital Solutions (Pvt) Ltd.
              </span>
            </p>
          </div>
        </CardContent>
      </Card>
      <div className="absolute top-4 right-4">
        <LoginClock />
      </div>
    </div>
  );
}

function LoginSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-4">
          <div className="flex justify-center mb-2 min-h-[80px]">
            <div className="w-[150px] h-[60px] rounded bg-muted animate-pulse" />
          </div>
          <div className="space-y-2">
            <div className="h-6 w-48 mx-auto rounded bg-muted animate-pulse" />
            <div className="h-4 w-36 mx-auto rounded bg-muted animate-pulse" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-10 rounded bg-muted animate-pulse" />
          <div className="h-10 rounded bg-muted animate-pulse" />
          <div className="h-10 rounded bg-muted animate-pulse" />
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginSkeleton />}>
      <LoginForm />
    </Suspense>
  );
}
