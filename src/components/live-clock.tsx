"use client";

import { useState, useEffect } from "react";

export function LiveClock() {
  const [dateTime, setDateTime] = useState<string>("");
  const [date, setDate] = useState<string>("");

  useEffect(() => {
    const updateDateTime = () => {
      // Sri Lanka timezone: Asia/Colombo (UTC+5:30)
      const now = new Date();
      const sriLankaTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Colombo" }));
      
      // Format time: HH:MM:SS
      const timeString = sriLankaTime.toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZone: "Asia/Colombo",
      });

      // Format date: Day, DD Month YYYY
      const dateString = sriLankaTime.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "Asia/Colombo",
      });

      setDateTime(timeString);
      setDate(dateString);
    };

    // Update immediately
    updateDateTime();

    // Update every second
    const interval = setInterval(updateDateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-end">
      <div className="text-2xl font-bold" style={{ color: "#D4AF37" }}>
        {dateTime}
      </div>
      <div className="text-sm text-muted-foreground">
        {date}
      </div>
      <div className="text-xs text-muted-foreground mt-1">
        Sri Lanka Time (IST)
      </div>
    </div>
  );
}
