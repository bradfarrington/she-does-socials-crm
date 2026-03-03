"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Users,
    Plus,
    Search,
    Star,
    ArrowUpRight,
    Loader2,
} from "lucide-react";
import { cn, getInitials, formatCurrency } from "@/lib/utils";
import type { IndustryRecord } from "@/lib/types";

interface PackageRecord {
    id: string;
    name: string;
    type: string;
    price: number;
    active: boolean;
}

interface ClientWithIndustry {
    id: string;
    business_name: string;
    contact_name: string;
    contact_email: string;
    industry_id: string | null;
    is_priority: boolean;
    is_archived: boolean;
    location_type: string | null;
    package_id: string | null;
    logo_url: string | null;
    status: string;
    industries: IndustryRecord | null;
    packages: PackageRecord | null;
}

export default function ClientsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedIndustry, setSelectedIndustry] = useState<string>("all");
    const [selectedPackages, setSelectedPackages] = useState<string[]>([]);
    const [clients, setClients] = useState<ClientWithIndustry[]>([]);
    const [industries, setIndustries] = useState<IndustryRecord[]>([]);
    const [packages, setPackages] = useState<PackageRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<"active" | "past" | "all">("active");

    const fetchData = useCallback(async () => {
        try {
            const [clientsRes, industriesRes, packagesRes] = await Promise.all([
                fetch("/api/clients"),
                fetch("/api/industries"),
                fetch("/api/packages"),
            ]);
            if (clientsRes.ok) {
                const clientsData = await clientsRes.json();
                setClients(clientsData);
            }
            if (industriesRes.ok) {
                const industriesData = await industriesRes.json();
                setIndustries(industriesData);
            }
            if (packagesRes.ok) {
                const packagesData = await packagesRes.json();
                setPackages(packagesData);
            }
        } catch (err) {
            console.error("Failed to fetch data:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const filteredClients = clients.filter((client) => {
        const matchesSearch =
            client.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            client.contact_name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesIndustry =
            selectedIndustry === "all" || client.industry_id === selectedIndustry;
        const matchesPackage =
            selectedPackages.length === 0 || (client.package_id !== null && selectedPackages.includes(client.package_id));
        const matchesStatus =
            statusFilter === "all" || (client.status || "active") === statusFilter;
        return matchesSearch && matchesIndustry && matchesPackage && matchesStatus;
    });

    return (
        <>
            <Header
                title="Clients"
                subtitle={`${clients.length} client${clients.length !== 1 ? "s" : ""}`}
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

                    {/* Status Filter */}
                    <div className="flex items-center gap-1 bg-surface-secondary rounded-lg p-0.5 border border-border">
                        {(["active", "past", "all"] as const).map((s) => (
                            <button
                                key={s}
                                onClick={() => setStatusFilter(s)}
                                className={cn(
                                    "px-3 py-1.5 rounded-md text-xs font-medium transition-all capitalize",
                                    statusFilter === s
                                        ? "bg-white text-text-primary shadow-sm"
                                        : "text-text-tertiary hover:text-text-secondary"
                                )}
                            >
                                {s === "all" ? "All" : s === "active" ? "Active" : "Past"}
                            </button>
                        ))}
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
                        {industries.map((industry) => (
                            <button
                                key={industry.id}
                                onClick={() => setSelectedIndustry(industry.id)}
                                className={cn(
                                    "px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap",
                                    selectedIndustry === industry.id
                                        ? `${industry.bg} ${industry.colour}`
                                        : "bg-surface border border-border text-text-secondary hover:bg-surface-hover"
                                )}
                            >
                                {industry.name}
                            </button>
                        ))}
                    </div>

                    {/* Package Filter (multi-select) */}
                    {packages.length > 0 && (
                        <div className="flex items-center gap-2 overflow-x-auto">
                            <span className="text-xs font-medium text-text-tertiary whitespace-nowrap">Package:</span>
                            {packages.filter((p) => p.active).map((pkg) => {
                                const isSelected = selectedPackages.includes(pkg.id);
                                return (
                                    <button
                                        key={pkg.id}
                                        onClick={() =>
                                            setSelectedPackages((prev) =>
                                                isSelected
                                                    ? prev.filter((id) => id !== pkg.id)
                                                    : [...prev, pkg.id]
                                            )
                                        }
                                        className={cn(
                                            "px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap",
                                            isSelected
                                                ? "bg-lavender-50 text-lavender-500"
                                                : "bg-surface border border-border text-text-secondary hover:bg-surface-hover"
                                        )}
                                    >
                                        {pkg.name}
                                    </button>
                                );
                            })}
                            {selectedPackages.length > 0 && (
                                <button
                                    onClick={() => setSelectedPackages([])}
                                    className="px-2 py-1.5 rounded-full text-xs font-medium text-text-tertiary hover:text-error transition-colors"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Client Grid */}
                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="w-6 h-6 text-text-tertiary animate-spin" />
                    </div>
                ) : filteredClients.length === 0 ? (
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
                            const industry = client.industries;
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
                                                {client.logo_url ? (
                                                    <div className="w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 border border-border">
                                                        <img src={client.logo_url} alt={client.business_name} className="w-full h-full object-cover" />
                                                    </div>
                                                ) : (
                                                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-200 to-rose-200 flex items-center justify-center flex-shrink-0">
                                                        <span className="text-sm font-semibold text-brand-800">
                                                            {getInitials(client.business_name)}
                                                        </span>
                                                    </div>
                                                )}

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
                                                {industry && (
                                                    <Badge
                                                        variant="default"
                                                        size="sm"
                                                        className={`${industry.bg} ${industry.colour}`}
                                                    >
                                                        {industry.name}
                                                    </Badge>
                                                )}
                                                {client.packages && (
                                                    <Badge
                                                        variant="default"
                                                        size="sm"
                                                        className="bg-lavender-50 text-lavender-500"
                                                    >
                                                        {client.packages.name}
                                                    </Badge>
                                                )}
                                                {client.location_type && (
                                                    <Badge variant="outline" size="sm">
                                                        {client.location_type}
                                                    </Badge>
                                                )}
                                                {(client.status || "active") === "past" && (
                                                    <Badge variant="default" size="sm" className="bg-warm-100 text-warm-600">
                                                        Past
                                                    </Badge>
                                                )}
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
