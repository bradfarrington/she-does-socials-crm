"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Users,
    Calendar,
    FileText,
    TrendingUp,
    Megaphone,
    Package,
    Sparkles,
    Globe,
    BarChart3,
    Zap,
    ShoppingBag,
    GraduationCap,
    Settings,
    ChevronLeft,
    ChevronRight,
    LogOut,
} from "lucide-react";

interface NavItem {
    label: string;
    href: string;
    icon: React.ElementType;
    badge?: string;
    section?: string;
}

const navItems: NavItem[] = [
    // Core
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, section: "Core" },
    { label: "Clients", href: "/clients", icon: Users, section: "Core" },
    { label: "Content", href: "/content", icon: Calendar, section: "Core" },

    // Business
    { label: "Leads", href: "/leads", icon: TrendingUp, section: "Business" },
    { label: "Invoices", href: "/invoices", icon: FileText, section: "Business" },
    { label: "Packages", href: "/packages", icon: Package, section: "Business" },

    // Create
    { label: "AI Assistant", href: "/ai", icon: Sparkles, section: "Create" },
    { label: "Landing Pages", href: "/landing-pages", icon: Globe, section: "Create" },
    { label: "Campaigns", href: "/campaigns", icon: Megaphone, section: "Create" },

    // Track
    { label: "Analytics", href: "/analytics", icon: BarChart3, section: "Track" },
    { label: "Automations", href: "/automations", icon: Zap, section: "Track" },

    // More
    { label: "Products", href: "/products", icon: ShoppingBag, section: "More" },
    { label: "Workshops", href: "/workshops", icon: GraduationCap, section: "More" },
];

export function Sidebar() {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);

    const sections = navItems.reduce<Record<string, NavItem[]>>((acc, item) => {
        const section = item.section || "Other";
        if (!acc[section]) acc[section] = [];
        acc[section].push(item);
        return acc;
    }, {});

    return (
        <aside
            className={cn(
                "fixed left-0 top-0 h-screen flex flex-col z-40",
                "bg-sidebar-bg text-sidebar-text",
                "transition-all duration-300 ease-in-out",
                collapsed ? "w-[var(--sidebar-collapsed-width)]" : "w-[var(--sidebar-width)]"
            )}
        >
            {/* Logo */}
            <div className="flex items-center gap-3 px-5 h-[var(--header-height)] border-b border-white/[0.06] flex-shrink-0">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-display font-bold text-sm">S</span>
                </div>
                {!collapsed && (
                    <div className="animate-fade-in overflow-hidden">
                        <p className="font-display font-semibold text-sm text-white leading-tight truncate">
                            She Does Socials
                        </p>
                        <p className="text-[10px] text-sidebar-text-muted truncate">
                            Social Media CRM
                        </p>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
                {Object.entries(sections).map(([section, items]) => (
                    <div key={section}>
                        {!collapsed && (
                            <p className="px-2 mb-2 text-[10px] font-semibold uppercase tracking-wider text-sidebar-text-muted">
                                {section}
                            </p>
                        )}
                        <div className="space-y-0.5">
                            {items.map((item) => {
                                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={cn(
                                            "flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                                            "hover:bg-sidebar-hover",
                                            isActive && "bg-sidebar-active text-sidebar-accent",
                                            !isActive && "text-sidebar-text",
                                            collapsed && "justify-center px-0"
                                        )}
                                        title={collapsed ? item.label : undefined}
                                    >
                                        <Icon className={cn("w-[18px] h-[18px] flex-shrink-0", isActive && "text-sidebar-accent")} />
                                        {!collapsed && (
                                            <span className="truncate">{item.label}</span>
                                        )}
                                        {!collapsed && item.badge && (
                                            <span className="ml-auto text-[10px] bg-brand-500 text-white px-1.5 py-0.5 rounded-full">
                                                {item.badge}
                                            </span>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            {/* Bottom Actions */}
            <div className="border-t border-white/[0.06] p-3 space-y-0.5 flex-shrink-0">
                <Link
                    href="/settings"
                    className={cn(
                        "flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm font-medium text-sidebar-text hover:bg-sidebar-hover transition-all",
                        collapsed && "justify-center px-0",
                        pathname === "/settings" && "bg-sidebar-active text-sidebar-accent"
                    )}
                >
                    <Settings className="w-[18px] h-[18px] flex-shrink-0" />
                    {!collapsed && <span>Settings</span>}
                </Link>
                <button
                    className={cn(
                        "flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm font-medium text-sidebar-text-muted hover:bg-sidebar-hover hover:text-sidebar-text transition-all w-full",
                        collapsed && "justify-center px-0"
                    )}
                >
                    <LogOut className="w-[18px] h-[18px] flex-shrink-0" />
                    {!collapsed && <span>Sign Out</span>}
                </button>
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className={cn(
                        "flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm text-sidebar-text-muted hover:bg-sidebar-hover transition-all w-full mt-1",
                        collapsed && "justify-center px-0"
                    )}
                >
                    {collapsed ? (
                        <ChevronRight className="w-[18px] h-[18px]" />
                    ) : (
                        <>
                            <ChevronLeft className="w-[18px] h-[18px]" />
                            <span>Collapse</span>
                        </>
                    )}
                </button>
            </div>
        </aside>
    );
}
