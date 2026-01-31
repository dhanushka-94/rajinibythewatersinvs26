"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PromotionsPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/promotions/offers");
  }, [router]);
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <p className="text-muted-foreground">Redirecting...</p>
    </div>
  );
}
