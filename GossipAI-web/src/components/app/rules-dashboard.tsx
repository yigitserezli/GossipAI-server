"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { isAdminUnlockedInSession } from "@/lib/security/admin-gate";
import { useAuthStore } from "@/stores/auth-store";
import { AdminDevices } from "./admin-devices";
import { AdminNotifications } from "./admin-notifications";
import { AdminUsers } from "./admin-users";

type AdminSection = "notifications" | "users" | "devices";

const navItems: { id: AdminSection; label: string; description: string }[] = [
  { id: "notifications", label: "Notifications", description: "Campaigns & delivery" },
  { id: "users", label: "Kullanicilar", description: "Plan & prompt istatistikleri" },
  { id: "devices", label: "Cihazlar", description: "Push token listesi" },
];

export function RulesDashboard() {
  const user = useAuthStore((state) => state.user);
  const isAdminUnlocked = isAdminUnlockedInSession();
  const [activeSection, setActiveSection] = useState<AdminSection>("notifications");

  return (
    <div className="flex flex-1 bg-background">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 border-r flex flex-col py-6 gap-1">
        <div className="px-4 mb-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            Admin Panel
          </p>
          <div className="flex items-center gap-2">
            <Badge variant={isAdminUnlocked ? "default" : "outline"} className="text-xs">
              {isAdminUnlocked ? "Admin Unlocked" : "Admin Locked"}
            </Badge>
          </div>
          {user?.email ? (
            <p className="text-xs text-muted-foreground mt-1 truncate">{user.email}</p>
          ) : null}
        </div>

        <nav className="flex flex-col gap-0.5 px-2">
          {navItems.map((item) => (
            <Button
              key={item.id}
              variant={activeSection === item.id ? "secondary" : "ghost"}
              className="w-full justify-start h-auto py-2 px-3 text-left"
              onClick={() => setActiveSection(item.id)}
            >
              <div>
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
            </Button>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto px-8 py-8">
        {activeSection === "notifications" && <AdminNotifications />}
        {activeSection === "users" && <AdminUsers />}
        {activeSection === "devices" && <AdminDevices />}
      </main>
    </div>
  );
}
