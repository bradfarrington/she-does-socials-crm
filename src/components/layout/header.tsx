"use client";

import React from "react";
import { Search, Bell, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
    title: string;
    subtitle?: string;
    actions?: React.ReactNode;
}

export function Header({ title, subtitle, actions }: HeaderProps) {
    return (
        <header className="h-[var(--header-height)] border-b border-border-light bg-surface/80 backdrop-blur-md flex items-center justify-between px-6 flex-shrink-0 sticky top-0 z-30">
            <div>
                <h1 className="font-display font-semibold text-xl text-text-primary">
                    {title}
                </h1>
                {subtitle && (
                    <p className="text-sm text-text-tertiary mt-0.5">{subtitle}</p>
                )}
            </div>

            <div className="flex items-center gap-3">
                {/* Search */}
                <div className="relative hidden md:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="h-9 w-56 rounded-lg border border-border bg-surface-secondary pl-9 pr-3 text-sm placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-brand-400/40 focus:border-brand-400 transition-all"
                    />
                </div>

                {/* Notifications */}
                <Button variant="ghost" size="icon-sm" className="relative">
                    <Bell className="w-4 h-4" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-brand-500 rounded-full" />
                </Button>

                {/* Quick action */}
                {actions || (
                    <Button size="sm">
                        <Plus className="w-4 h-4" />
                        New Client
                    </Button>
                )}
            </div>
        </header>
    );
}
