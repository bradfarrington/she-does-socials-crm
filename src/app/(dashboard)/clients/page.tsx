"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Users,
    Plus,
    Search,
    Filter,
    Star,
    MoreHorizontal,
    ArrowUpRight,
    Building2,
} from "lucide-react";
import { cn, getInitials } from "@/lib/utils";
import type { Industry } from "@/lib/types";

// Industry config
const industryConfig: Record<Industry, { label: string; colour: string; bg: string }> = {
    beauty: { label: "Beauty", colour: "text-rose-600", bg: "bg-rose-50" },
    hospitality: { label: "Hospitality", colour: "text-brand-700", bg: "bg-brand-50" },
    fitness: { label: "Fitness", colour: "text-sage-600", bg: "bg-sage-50" },
    therapy: { label: "Therapy", colour: "text-lavender-500", bg: "bg-lavender-50" },
    education: { label: "Education", colour: "text-blue-600", bg: "bg-blue-50" },
    travel: { label: "Travel", colour: "text-cyan-600", bg: "bg-cyan-50" },
    events: { label: "Events", colour: "text-pink-600", bg: "bg-pink-50" },
    retail: { label: "Retail", colour: "text-amber-600", bg: "bg-amber-50" },
    food_drink: { label: "Food & Drink", colour: "text-orange-600", bg: "bg-orange-50" },
    health: { label: "Health", colour: "text-emerald-600", bg: "bg-emerald-50" },
    other: { label: "Other", colour: "text-warm-600", bg: "bg-warm-100" },
};

// Demo clients for visual preview — will be replaced with Supabase data
const demoClients = [
    {
        id: "1",
        business_name: "Glow Studio",
        contact_name: "Sarah Mitchell",
        contact_email: "sarah@glowstudio.com",
        industry: "beauty" as Industry,
        is_priority: true,
        is_archived: false,
        location_type: "local",
    },
    {
        id: "2",
        business_name: "The Garden Kitchen",
        contact_name: "Tom Harris",
        contact_email: "tom@gardenkitchen.co.uk",
        industry: "hospitality" as Industry,
        is_priority: false,
        is_archived: false,
        location_type: "local",
    },
    {
        id: "3",
        business_name: "FitLife Academy",
        contact_name: "Jade Cooper",
        contact_email: "jade@fitlife.com",
        industry: "fitness" as Industry,
        is_priority: true,
        is_archived: false,
        location_type: "national",
    },
];

export default function ClientsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedIndustry, setSelectedIndustry] = useState<string>("all");

    const filteredClients = demoClients.filter((client) => {
        const matchesSearch =
            client.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            client.contact_name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesIndustry =
            selectedIndustry === "all" || client.industry === selectedIndustry;
        return matchesSearch && matchesIndustry;
    });

    return (
        <>
            <Header
                title="Clients"
                subtitle={`${demoClients.length} clients`}
                actions={
                    <Link href="/clients/new" className={buttonVariants({ size: "sm" })}>
                        <Plus className="w-4 h-4" />
                        Add Client
                    </Link>
                }
            />

            <div className="p-6 space-y-4 animate-fade-in">
                {/* Filters */}
                <div className="flex items-center gap-3 flex-wrap">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                        <input
                            type="text"
                            placeholder="Search clients..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-9 w-full rounded-lg border border-border bg-surface pl-9 pr-3 text-sm placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-brand-400/40 focus:border-brand-400 transition-all"
                        />
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto">
                        <button
                            onClick={() => setSelectedIndustry("all")}
                            className={cn(
                                "px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap",
                                selectedIndustry === "all"
                                    ? "bg-text-primary text-white"
                                    : "bg-surface border border-border text-text-secondary hover:bg-surface-hover"
                            )}
                        >
                            All
                        </button>
                        {Object.entries(industryConfig).map(([key, config]) => (
                            <button
                                key={key}
                                onClick={() => setSelectedIndustry(key)}
                                className={cn(
                                    "px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap",
                                    selectedIndustry === key
                                        ? `${config.bg} ${config.colour}`
                                        : "bg-surface border border-border text-text-secondary hover:bg-surface-hover"
                                )}
                            >
                                {config.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Client Grid */}
                {filteredClients.length === 0 ? (
                    <Card>
                        <CardContent className="py-16 text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-50 mb-4">
                                <Users className="w-7 h-7 text-brand-500" />
                            </div>
                            <h3 className="font-display font-semibold text-text-primary mb-1">
                                No clients found
                            </h3>
                            <p className="text-sm text-text-tertiary max-w-sm mx-auto mb-4">
                                {searchQuery
                                    ? "No clients match your search. Try a different term."
                                    : "Add your first client to start managing their social media."}
                            </p>
                            <Link href="/clients/new" className={buttonVariants({ size: "sm" })}>
                                <Plus className="w-4 h-4" />
                                Add Client
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {filteredClients.map((client, index) => {
                            const industry = industryConfig[client.industry];
                            return (
                                <Link key={client.id} href={`/clients/${client.id}`}>
                                    <Card
                                        hover
                                        className="animate-fade-in group"
                                        style={{ animationDelay: `${index * 50}ms` }}
                                    >
                                        <CardContent className="p-5">
                                            <div className="flex items-start gap-3">
                                                {/* Avatar */}
                                                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-200 to-rose-200 flex items-center justify-center flex-shrink-0">
                                                    <span className="text-sm font-semibold text-brand-800">
                                                        {getInitials(client.business_name)}
                                                    </span>
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-semibold text-sm text-text-primary truncate">
                                                            {client.business_name}
                                                        </h3>
                                                        {client.is_priority && (
                                                            <Star className="w-3.5 h-3.5 text-brand-500 fill-brand-500 flex-shrink-0" />
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-text-tertiary truncate">
                                                        {client.contact_name}
                                                    </p>
                                                </div>

                                                <ArrowUpRight className="w-4 h-4 text-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                                            </div>

                                            <div className="flex items-center gap-2 mt-3">
                                                <Badge
                                                    variant="default"
                                                    size="sm"
                                                    className={`${industry.bg} ${industry.colour}`}
                                                >
                                                    {industry.label}
                                                </Badge>
                                                <Badge variant="outline" size="sm">
                                                    {client.location_type}
                                                </Badge>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            );
                        })}

                        {/* Add New Card */}
                        <Link href="/clients/new">
                            <Card
                                hover
                                className="border-dashed border-2 border-border hover:border-brand-300 group"
                            >
                                <CardContent className="p-5 flex items-center justify-center min-h-[120px]">
                                    <div className="text-center">
                                        <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-brand-50 group-hover:bg-brand-100 transition-colors mb-2">
                                            <Plus className="w-5 h-5 text-brand-500" />
                                        </div>
                                        <p className="text-sm font-medium text-text-secondary group-hover:text-brand-600 transition-colors">
                                            Add New Client
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    </div>
                )}
            </div>
        </>
    );
}
