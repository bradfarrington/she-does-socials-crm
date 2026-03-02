"use client";

import React from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
    Users,
    FileText,
    TrendingUp,
    Calendar,
    ArrowUpRight,
    Plus,
    Clock,
    AlertCircle,
    CheckCircle2,
    Sparkles,
} from "lucide-react";
import Link from "next/link";

// Demo data — will be replaced with real data from Supabase
const stats = [
    {
        label: "Total Clients",
        value: "0",
        change: "Start adding clients →",
        icon: Users,
        colour: "text-brand-500",
        bg: "bg-brand-50",
    },
    {
        label: "Active Content",
        value: "0",
        change: "Plan your first post →",
        icon: Calendar,
        colour: "text-lavender-500",
        bg: "bg-lavender-50",
    },
    {
        label: "Open Leads",
        value: "0",
        change: "Capture your first lead →",
        icon: TrendingUp,
        colour: "text-sage-500",
        bg: "bg-sage-50",
    },
    {
        label: "Revenue (MTD)",
        value: "£0",
        change: "Send your first invoice →",
        icon: FileText,
        colour: "text-rose-500",
        bg: "bg-rose-50",
    },
];

const quickActions = [
    { label: "Add Client", icon: Users, href: "/clients/new", colour: "bg-brand-500" },
    { label: "Plan Content", icon: Calendar, href: "/content", colour: "bg-lavender-500" },
    { label: "Create Invoice", icon: FileText, href: "/invoices/new", colour: "bg-sage-500" },
    { label: "AI Assistant", icon: Sparkles, href: "/ai", colour: "bg-rose-500" },
];

const recentActivity = [
    {
        icon: CheckCircle2,
        text: "Welcome to She Does Socials CRM!",
        time: "Just now",
        colour: "text-sage-500",
    },
    {
        icon: AlertCircle,
        text: "Set up your first client to get started",
        time: "Get started",
        colour: "text-brand-500",
    },
    {
        icon: Clock,
        text: "Connect your OpenAI API key in Settings",
        time: "Recommended",
        colour: "text-lavender-500",
    },
];

export default function DashboardPage() {
    return (
        <>
            <Header
                title="Dashboard"
                subtitle="Welcome back! Here's what's happening today."
                actions={
                    <Link href="/clients/new" className={buttonVariants({ size: "sm" })}>
                        <Plus className="w-4 h-4" />
                        New Client
                    </Link>
                }
            />

            <div className="p-6 space-y-6 animate-fade-in">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((stat) => {
                        const Icon = stat.icon;
                        return (
                            <Card key={stat.label} hover>
                                <CardContent className="p-5">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-sm text-text-tertiary font-medium">
                                                {stat.label}
                                            </p>
                                            <p className="text-2xl font-display font-bold text-text-primary mt-1">
                                                {stat.value}
                                            </p>
                                            <p className="text-xs text-text-tertiary mt-1">
                                                {stat.change}
                                            </p>
                                        </div>
                                        <div className={`p-2.5 rounded-xl ${stat.bg}`}>
                                            <Icon className={`w-5 h-5 ${stat.colour}`} />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Quick Actions + Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Quick Actions */}
                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <CardTitle className="text-base">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {quickActions.map((action) => {
                                const Icon = action.icon;
                                return (
                                    <Link
                                        key={action.label}
                                        href={action.href}
                                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface-hover transition-all group"
                                    >
                                        <div className={`p-2 rounded-lg ${action.colour} text-white`}>
                                            <Icon className="w-4 h-4" />
                                        </div>
                                        <span className="text-sm font-medium text-text-primary">
                                            {action.label}
                                        </span>
                                        <ArrowUpRight className="w-4 h-4 text-text-tertiary ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </Link>
                                );
                            })}
                        </CardContent>
                    </Card>

                    {/* Recent Activity */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-base">Activity</CardTitle>
                                <Badge variant="brand" size="sm">Getting Started</Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recentActivity.map((activity, i) => {
                                    const Icon = activity.icon;
                                    return (
                                        <div
                                            key={i}
                                            className="flex items-start gap-3 animate-fade-in"
                                            style={{ animationDelay: `${i * 100}ms` }}
                                        >
                                            <Icon className={`w-5 h-5 mt-0.5 ${activity.colour} flex-shrink-0`} />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-text-primary">{activity.text}</p>
                                                <p className="text-xs text-text-tertiary mt-0.5">
                                                    {activity.time}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Empty state illustration */}
                            <div className="mt-8 text-center py-8 border-t border-border-light">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-100 to-rose-100 mb-4">
                                    <Sparkles className="w-7 h-7 text-brand-500" />
                                </div>
                                <h3 className="font-display font-semibold text-text-primary mb-1">
                                    Ready to get started?
                                </h3>
                                <p className="text-sm text-text-tertiary max-w-sm mx-auto mb-4">
                                    Add your first client and the dashboard will come to life with insights, tasks, and activity.
                                </p>
                                <Link href="/clients/new" className={buttonVariants({ size: "sm" })}>
                                    <Plus className="w-4 h-4" />
                                    Add Your First Client
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Today's Focus */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base">Today&apos;s Focus</CardTitle>
                            <Badge variant="outline" size="sm">
                                <Clock className="w-3 h-3" />
                                {new Date().toLocaleDateString("en-GB", {
                                    weekday: "long",
                                    day: "numeric",
                                    month: "long",
                                })}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center py-8">
                            <p className="text-sm text-text-tertiary">
                                No tasks for today yet. As you add clients and content plans, your daily focus will appear here.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
