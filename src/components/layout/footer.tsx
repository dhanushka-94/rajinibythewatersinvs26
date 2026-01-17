"use client";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const version = "0.1.0"; // You can import from package.json if needed

  return (
    <footer className="border-t bg-card mt-auto">
      <div className="container mx-auto px-6 py-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
            <span>© {currentYear} Rajini by The Waters. All rights reserved.</span>
            <span className="hidden md:inline">•</span>
            <span>Powered by <span className="font-semibold text-foreground">Phoenix Global Solutions</span></span>
            <span className="hidden md:inline">•</span>
            <span>Version {version}</span>
          </div>
          <div className="flex items-center gap-2">
            <span>Developed by</span>
            <span className="font-semibold text-foreground">olexto Digital Solutions (Pvt) Ltd.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
