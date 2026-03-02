"use client";

import React from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { cn } from "@/lib/utils";

export function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-surface-secondary">
            <Sidebar />
            <main
                className={cn(
                    "ml-[var(--sidebar-width)] min-h-screen",
                    "transition-all duration-300 ease-in-out"
                )}
            >
                {children}
            </main>
        </div>
    );
}
