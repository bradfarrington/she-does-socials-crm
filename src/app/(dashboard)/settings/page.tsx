"use client";

import React, { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Key,
    User,
    Palette,
    Layers,
    Plus,
    Pencil,
    Trash2,
    Check,
    X,
    GripVertical,
    Loader2,
    Link2,
    Unlink,
    Building2,
    RefreshCw,
    Facebook,
    Instagram,
    Users,
    CheckCircle2,
    AlertCircle,
    ExternalLink,
} from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import type { IndustryRecord, MetaPage } from "@/lib/types";

// ─── Colour Presets ─────────────────────────────────────
const colourPresets = [
    { colour: "text-rose-600", bg: "bg-rose-50", label: "Rose" },
    { colour: "text-brand-700", bg: "bg-brand-50", label: "Brand" },
    { colour: "text-sage-600", bg: "bg-sage-50", label: "Sage" },
    { colour: "text-lavender-500", bg: "bg-lavender-50", label: "Lavender" },
    { colour: "text-blue-600", bg: "bg-blue-50", label: "Blue" },
    { colour: "text-cyan-600", bg: "bg-cyan-50", label: "Cyan" },
    { colour: "text-pink-600", bg: "bg-pink-50", label: "Pink" },
    { colour: "text-amber-600", bg: "bg-amber-50", label: "Amber" },
    { colour: "text-orange-600", bg: "bg-orange-50", label: "Orange" },
    { colour: "text-emerald-600", bg: "bg-emerald-50", label: "Emerald" },
    { colour: "text-warm-600", bg: "bg-warm-100", label: "Warm" },
];

interface MetaConnectionInfo {
    connected: boolean;
    meta_user_name?: string;
    meta_user_id?: string;
    connected_at?: string;
    token_expires_at?: string;
}

interface PageSelection {
    page_id: string;
    status: "active" | "past";
}

// ─── Page Toggle Row Component ──────────────────────────
function PageToggleRow({
    page,
    onToggle,
    onLinkToExisting,
    onStatusChange,
    togglingId,
}: {
    page: MetaPage;
    onToggle: (page: MetaPage) => void;
    onLinkToExisting: (page: MetaPage, clientId: string) => void;
    onStatusChange: (pageId: string, status: "active" | "past") => void;
    togglingId: string | null;
}) {
    const isToggling = togglingId === page.id;
    const [showLinkPopup, setShowLinkPopup] = useState(false);
    const [unlinkedClients, setUnlinkedClients] = useState<{ id: string; business_name: string }[]>([]);
    const [loadingClients, setLoadingClients] = useState(false);
    const popupRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
                setShowLinkPopup(false);
            }
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const handleToggleClick = async () => {
        if (page.already_synced) {
            // Turning off — just disconnect
            onToggle(page);
            return;
        }
        // Turning on — show popup to choose link to existing or create new
        setLoadingClients(true);
        setShowLinkPopup(true);
        try {
            const res = await fetch("/api/clients?unlinked=true");
            if (res.ok) {
                const data = await res.json();
                // Filter to only clients without a meta_page_id
                const clients = (data || []).filter((c: { meta_page_id?: string | null }) => !c.meta_page_id);
                setUnlinkedClients(clients);
            }
        } catch {
            setUnlinkedClients([]);
        } finally {
            setLoadingClients(false);
        }
    };

    return (
        <div
            className={cn(
                "relative flex items-center gap-3 p-3 rounded-lg border transition-all",
                page.already_synced
                    ? "bg-surface border-brand-200"
                    : "bg-surface border-border hover:border-border"
            )}
        >
            {/* Toggle Switch */}
            <button
                onClick={handleToggleClick}
                disabled={isToggling}
                className={cn(
                    "relative w-10 h-[22px] rounded-full transition-all flex-shrink-0",
                    isToggling
                        ? "bg-border cursor-wait"
                        : page.already_synced
                            ? "bg-brand-500 hover:bg-brand-600"
                            : "bg-border hover:bg-text-tertiary"
                )}
            >
                <span
                    className={cn(
                        "absolute top-[3px] w-4 h-4 rounded-full bg-white shadow-sm transition-all",
                        isToggling
                            ? "left-3 animate-pulse"
                            : page.already_synced
                                ? "left-[22px]"
                                : "left-[3px]"
                    )}
                />
            </button>

            {/* Page Picture */}
            {page.picture_url ? (
                <img
                    src={page.picture_url}
                    alt={page.name}
                    className="w-9 h-9 rounded-lg object-cover flex-shrink-0"
                />
            ) : (
                <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Facebook className="w-4 h-4 text-blue-600" />
                </div>
            )}

            {/* Page Info */}
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">
                    {page.name}
                </p>
                <div className="flex items-center gap-2 text-xs text-text-tertiary">
                    {page.category && <span>{page.category}</span>}
                    {page.followers_count > 0 && (
                        <span className="flex items-center gap-0.5">
                            <Users className="w-3 h-3" />
                            {page.followers_count.toLocaleString()}
                        </span>
                    )}
                    {page.instagram && (
                        <span className="flex items-center gap-0.5 text-purple-600">
                            <Instagram className="w-3 h-3" />
                            @{page.instagram.username}
                        </span>
                    )}
                </div>
            </div>

            {/* Status Selector (only for connected pages) */}
            {page.already_synced && (
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => onStatusChange(page.id, "active")}
                        disabled={isToggling}
                        className={cn(
                            "px-2.5 py-1 rounded-full text-xs font-medium transition-all border",
                            page.existing_status === "active"
                                ? "bg-sage-50 text-sage-700 border-sage-300"
                                : "bg-surface border-border text-text-secondary hover:bg-surface-hover"
                        )}
                    >
                        Active
                    </button>
                    <button
                        onClick={() => onStatusChange(page.id, "past")}
                        disabled={isToggling}
                        className={cn(
                            "px-2.5 py-1 rounded-full text-xs font-medium transition-all border",
                            page.existing_status === "past"
                                ? "bg-warm-100 text-warm-600 border-warm-300"
                                : "bg-surface border-border text-text-secondary hover:bg-surface-hover"
                        )}
                    >
                        Past
                    </button>
                </div>
            )}

            {/* Link-to-existing popup */}
            {showLinkPopup && (
                <div
                    ref={popupRef}
                    className="absolute top-full left-0 right-0 mt-1 bg-surface border border-border rounded-lg shadow-lg z-50 overflow-hidden"
                >
                    <div className="p-2.5 border-b border-border bg-surface-secondary">
                        <p className="text-xs font-medium text-text-primary">How do you want to add this page?</p>
                    </div>

                    {/* Create new client option */}
                    <button
                        onClick={() => {
                            setShowLinkPopup(false);
                            onToggle(page);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-surface-hover transition-colors border-b border-border"
                    >
                        <div className="w-7 h-7 rounded-md bg-brand-50 flex items-center justify-center flex-shrink-0">
                            <Plus className="w-3.5 h-3.5 text-brand-500" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-text-primary">Create as new client</p>
                            <p className="text-[10px] text-text-tertiary">Add &quot;{page.name}&quot; as a new client</p>
                        </div>
                    </button>

                    {/* Link to existing */}
                    {loadingClients ? (
                        <div className="flex items-center justify-center py-3">
                            <Loader2 className="w-4 h-4 animate-spin text-text-tertiary" />
                        </div>
                    ) : unlinkedClients.length > 0 ? (
                        <div className="max-h-48 overflow-y-auto">
                            <p className="px-3 pt-2 pb-1 text-[10px] font-medium text-text-tertiary uppercase tracking-wider">
                                Or link to existing client
                            </p>
                            {unlinkedClients.map((client) => (
                                <button
                                    key={client.id}
                                    onClick={() => {
                                        setShowLinkPopup(false);
                                        onLinkToExisting(page, client.id);
                                    }}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-surface-hover transition-colors"
                                >
                                    <div className="w-7 h-7 rounded-md bg-blue-50 flex items-center justify-center flex-shrink-0">
                                        <Building2 className="w-3.5 h-3.5 text-blue-500" />
                                    </div>
                                    <p className="text-xs font-medium text-text-primary truncate">{client.business_name}</p>
                                </button>
                            ))}
                        </div>
                    ) : null}
                </div>
            )}
        </div>
    );
}

function SettingsContent() {
    const searchParams = useSearchParams();

    // ─── Industry State ─────────────────────────────────
    const [industries, setIndustries] = useState<IndustryRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [newName, setNewName] = useState("");
    const [newColour, setNewColour] = useState(colourPresets[0]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState("");
    const [saving, setSaving] = useState(false);

    // ─── Meta State ─────────────────────────────────────
    const [metaConnection, setMetaConnection] = useState<MetaConnectionInfo | null>(null);
    const [metaLoading, setMetaLoading] = useState(true);
    const [metaPages, setMetaPages] = useState<MetaPage[]>([]);
    const [pagesLoading, setPagesLoading] = useState(false);
    const [showPages, setShowPages] = useState(false);
    const [selectedPages, setSelectedPages] = useState<Map<string, PageSelection>>(new Map());
    const [syncing, setSyncing] = useState(false);
    const [syncResult, setSyncResult] = useState<{ created: number; updated: number; errors: string[] } | null>(null);
    const [disconnecting, setDisconnecting] = useState(false);
    const [togglingPageId, setTogglingPageId] = useState<string | null>(null);

    //  Meta flash messages from OAuth redirect
    const metaStatus = searchParams.get("meta");

    // ─── Industry Fetching ──────────────────────────────
    const fetchIndustries = useCallback(async () => {
        try {
            const res = await fetch("/api/industries");
            if (res.ok) {
                const data = await res.json();
                setIndustries(data);
            }
        } catch (err) {
            console.error("Failed to fetch industries:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchIndustries();
    }, [fetchIndustries]);

    // ─── Meta Connection Check ──────────────────────────
    const fetchMetaConnection = useCallback(async () => {
        setMetaLoading(true);
        try {
            const res = await fetch("/api/meta/connection");
            if (res.ok) {
                const data = await res.json();
                setMetaConnection(data);
            }
        } catch (err) {
            console.error("Failed to check Meta connection:", err);
        } finally {
            setMetaLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMetaConnection();
    }, [fetchMetaConnection]);

    // ─── Industry CRUD ──────────────────────────────────
    const handleAddIndustry = async () => {
        if (!newName.trim() || saving) return;
        setSaving(true);
        try {
            const res = await fetch("/api/industries", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: newName.trim(),
                    colour: newColour.colour,
                    bg: newColour.bg,
                }),
            });
            if (res.ok) {
                setNewName("");
                await fetchIndustries();
            }
        } catch (err) {
            console.error("Failed to add industry:", err);
        } finally {
            setSaving(false);
        }
    };

    const handleUpdateIndustry = async (id: string) => {
        if (!editName.trim() || saving) return;
        setSaving(true);
        try {
            const res = await fetch(`/api/industries/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: editName.trim() }),
            });
            if (res.ok) {
                setEditingId(null);
                await fetchIndustries();
            }
        } catch (err) {
            console.error("Failed to update industry:", err);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteIndustry = async (id: string) => {
        if (saving) return;
        setSaving(true);
        try {
            const res = await fetch(`/api/industries/${id}`, {
                method: "DELETE",
            });
            if (res.ok) {
                await fetchIndustries();
            }
        } catch (err) {
            console.error("Failed to delete industry:", err);
        } finally {
            setSaving(false);
        }
    };

    // ─── Meta Handlers ──────────────────────────────────
    const handleFetchPages = async () => {
        setPagesLoading(true);
        setSyncResult(null);
        try {
            const res = await fetch("/api/meta/pages");
            if (res.ok) {
                const data = await res.json();
                setMetaPages(data.pages || []);
                setShowPages(true);
                // Auto-select all un-synced pages as "active"
                const newSelections = new Map<string, PageSelection>();
                for (const page of data.pages || []) {
                    if (!page.already_synced) {
                        newSelections.set(page.id, { page_id: page.id, status: "active" });
                    }
                }
                setSelectedPages(newSelections);
            } else {
                const err = await res.json();
                alert(err.error || "Failed to fetch pages");
            }
        } catch (err) {
            console.error("Failed to fetch pages:", err);
        } finally {
            setPagesLoading(false);
        }
    };

    const handleTogglePage = async (page: MetaPage) => {
        setTogglingPageId(page.id);
        try {
            const action = page.already_synced ? "disconnect" : "connect";
            const res = await fetch("/api/meta/sync", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    page_id: page.id,
                    action,
                    status: "active",
                    name: page.name,
                    picture_url: page.picture_url,
                    instagram_username: page.instagram?.username,
                }),
            });
            if (res.ok) {
                await handleFetchPages();
            }
        } catch (err) {
            console.error("Failed to toggle page:", err);
        } finally {
            setTogglingPageId(null);
        }
    };

    const handleLinkToExisting = async (page: MetaPage, clientId: string) => {
        setTogglingPageId(page.id);
        try {
            const res = await fetch(`/api/clients/${clientId}/meta-link`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ meta_page_id: page.id }),
            });
            if (res.ok) {
                await handleFetchPages();
            } else {
                const err = await res.json();
                alert(err.error || "Failed to link");
            }
        } catch (err) {
            console.error("Failed to link to existing:", err);
        } finally {
            setTogglingPageId(null);
        }
    };

    const handlePageStatusChange = async (pageId: string, status: "active" | "past") => {
        setTogglingPageId(pageId);
        try {
            const res = await fetch("/api/meta/sync", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    page_id: pageId,
                    action: "update_status",
                    status,
                }),
            });
            if (res.ok) {
                await handleFetchPages();
            }
        } catch (err) {
            console.error("Failed to update status:", err);
        } finally {
            setTogglingPageId(null);
        }
    };

    const handleDisconnect = async () => {
        if (!confirm("Are you sure you want to disconnect your Meta account? This won't remove any imported clients.")) return;
        setDisconnecting(true);
        try {
            const res = await fetch("/api/meta/connection", { method: "DELETE" });
            if (res.ok) {
                setMetaConnection({ connected: false });
                setShowPages(false);
                setMetaPages([]);
            }
        } catch (err) {
            console.error("Failed to disconnect:", err);
        } finally {
            setDisconnecting(false);
        }
    };

    return (
        <>
            <Header title="Settings" subtitle="Manage your account and preferences" />
            <div className="p-6 max-w-2xl space-y-6 animate-fade-in">
                {/* Profile */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-text-tertiary" />
                            <CardTitle className="text-base">Profile</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Input label="Full Name" placeholder="Your name" />
                        <Input label="Email" type="email" placeholder="hello@shedoessocials.com" />
                        <Button size="sm">Save Changes</Button>
                    </CardContent>
                </Card>

                {/* ──────── META BUSINESS SUITE ──────── */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Facebook className="w-4 h-4 text-blue-600" />
                            <CardTitle className="text-base">Meta Business Suite</CardTitle>
                        </div>
                        <p className="text-sm text-text-tertiary mt-1">
                            Connect your Meta account to import the pages you manage as clients.
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Flash messages from OAuth redirect */}
                        {metaStatus === "connected" && (
                            <div className="flex items-center gap-2 p-3 rounded-lg bg-sage-50 text-sage-700 border border-sage-200 text-sm">
                                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                                <span>Meta account connected successfully! You can now import your pages.</span>
                            </div>
                        )}
                        {metaStatus === "error" && (
                            <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-sm">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                <span>Failed to connect Meta account. Please try again.</span>
                            </div>
                        )}

                        {metaLoading ? (
                            <div className="flex items-center justify-center py-6">
                                <Loader2 className="w-5 h-5 text-text-tertiary animate-spin" />
                            </div>
                        ) : metaConnection?.connected ? (
                            <>
                                {/* Connected State */}
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                        <Facebook className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-text-primary">
                                            {metaConnection.meta_user_name || "Meta Account"}
                                        </p>
                                        <p className="text-xs text-text-tertiary">
                                            Connected {metaConnection.connected_at ? formatDate(metaConnection.connected_at) : ""}
                                        </p>
                                    </div>
                                    <Badge variant="default" size="sm" className="bg-sage-50 text-sage-700 border-sage-200">
                                        <CheckCircle2 className="w-3 h-3" /> Connected
                                    </Badge>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center gap-2">
                                    <Button
                                        size="sm"
                                        onClick={handleFetchPages}
                                        disabled={pagesLoading}
                                    >
                                        {pagesLoading ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Layers className="w-4 h-4" />
                                        )}
                                        Manage Pages
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={handleDisconnect}
                                        disabled={disconnecting}
                                        className="text-text-tertiary hover:text-error"
                                    >
                                        {disconnecting ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Unlink className="w-4 h-4" />
                                        )}
                                        Disconnect
                                    </Button>
                                </div>

                                {/* Sync Result */}
                                {syncResult && (
                                    <div className="p-3 rounded-lg bg-sage-50 border border-sage-200 text-sm text-sage-700">
                                        <p className="font-medium">
                                            ✅ {syncResult.created > 0 ? `${syncResult.created} imported` : ""}{syncResult.created > 0 && syncResult.updated > 0 ? ", " : ""}{syncResult.updated > 0 ? `${syncResult.updated} updated` : ""}
                                        </p>
                                        {syncResult.errors.length > 0 && (
                                            <ul className="mt-1 text-xs text-rose-600">
                                                {syncResult.errors.map((err, i) => (
                                                    <li key={i}>⚠ {err}</li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                )}

                                {/* Pages List with Toggles */}
                                {showPages && (
                                    <div className="space-y-3 border-t border-border pt-4">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-medium text-text-primary">
                                                Your Pages ({metaPages.length})
                                            </p>
                                            <button
                                                onClick={handleFetchPages}
                                                disabled={pagesLoading}
                                                className="text-xs text-text-tertiary hover:text-text-primary flex items-center gap-1 transition-colors"
                                            >
                                                <RefreshCw className={cn("w-3 h-3", pagesLoading && "animate-spin")} />
                                                Refresh
                                            </button>
                                        </div>

                                        {metaPages.length === 0 ? (
                                            <p className="text-sm text-text-tertiary py-4 text-center">
                                                No pages found. Make sure your Meta account has page access.
                                            </p>
                                        ) : (
                                            <div className="space-y-2">
                                                {metaPages.map((page) => (
                                                    <PageToggleRow
                                                        key={page.id}
                                                        page={page}
                                                        onToggle={handleTogglePage}
                                                        onLinkToExisting={handleLinkToExisting}
                                                        onStatusChange={handlePageStatusChange}
                                                        togglingId={togglingPageId}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </>
                        ) : (
                            /* Not Connected State */
                            <div className="text-center py-4 space-y-3">
                                <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto">
                                    <Facebook className="w-7 h-7 text-blue-500" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-text-primary">
                                        Connect your Meta account
                                    </p>
                                    <p className="text-xs text-text-tertiary mt-1 max-w-sm mx-auto">
                                        Import all the Facebook &amp; Instagram pages you manage and add them as clients in one click.
                                    </p>
                                </div>
                                <a
                                    href="/api/auth/meta"
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
                                >
                                    <Facebook className="w-4 h-4" />
                                    Connect with Meta
                                </a>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Industry Types */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Layers className="w-4 h-4 text-text-tertiary" />
                            <CardTitle className="text-base">Industry Types</CardTitle>
                        </div>
                        <p className="text-sm text-text-tertiary mt-1">
                            Manage the industries you can assign to clients.
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {loading ? (
                            <div className="flex items-center justify-center py-6">
                                <Loader2 className="w-5 h-5 text-text-tertiary animate-spin" />
                            </div>
                        ) : (
                            <>
                                {/* Industry List */}
                                <div className="space-y-1">
                                    {industries.map((industry) => (
                                        <div
                                            key={industry.id}
                                            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-surface-hover transition-colors group"
                                        >
                                            <GripVertical className="w-3.5 h-3.5 text-text-tertiary/40 flex-shrink-0" />

                                            {editingId === industry.id ? (
                                                <>
                                                    <input
                                                        type="text"
                                                        value={editName}
                                                        onChange={(e) => setEditName(e.target.value)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === "Enter") handleUpdateIndustry(industry.id);
                                                            if (e.key === "Escape") setEditingId(null);
                                                        }}
                                                        className="flex-1 h-7 px-2 rounded border border-brand-300 bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-brand-400/40"
                                                        autoFocus
                                                    />
                                                    <button
                                                        onClick={() => handleUpdateIndustry(industry.id)}
                                                        className="p-1 rounded hover:bg-sage-50 text-sage-600 transition-colors"
                                                    >
                                                        <Check className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => setEditingId(null)}
                                                        className="p-1 rounded hover:bg-rose-50 text-text-tertiary transition-colors"
                                                    >
                                                        <X className="w-3.5 h-3.5" />
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <Badge
                                                        variant="default"
                                                        size="sm"
                                                        className={`${industry.bg} ${industry.colour}`}
                                                    >
                                                        {industry.name}
                                                    </Badge>
                                                    <div className="flex-1" />
                                                    <button
                                                        onClick={() => {
                                                            setEditingId(industry.id);
                                                            setEditName(industry.name);
                                                        }}
                                                        className="p-1 rounded hover:bg-surface-hover text-text-tertiary opacity-0 group-hover:opacity-100 transition-all"
                                                    >
                                                        <Pencil className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteIndustry(industry.id)}
                                                        className="p-1 rounded hover:bg-rose-50 text-text-tertiary hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-all"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    ))}
                                    {industries.length === 0 && (
                                        <p className="text-sm text-text-tertiary py-4 text-center">
                                            No industries yet. Add one below.
                                        </p>
                                    )}
                                </div>

                                {/* Add New Industry */}
                                <div className="border-t border-border pt-4 space-y-3">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            placeholder="New industry name..."
                                            value={newName}
                                            onChange={(e) => setNewName(e.target.value)}
                                            onKeyDown={(e) => e.key === "Enter" && handleAddIndustry()}
                                            className="flex-1 h-9 px-3 rounded-lg border border-border bg-surface text-sm placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-brand-400/40 focus:border-brand-400 transition-all"
                                        />
                                        <Button
                                            size="sm"
                                            onClick={handleAddIndustry}
                                            disabled={!newName.trim() || saving}
                                        >
                                            {saving ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Plus className="w-4 h-4" />
                                            )}
                                            Add
                                        </Button>
                                    </div>

                                    {/* Colour Preset Picker */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-text-tertiary">
                                            Badge Colour
                                        </label>
                                        <div className="flex flex-wrap gap-1.5">
                                            {colourPresets.map((preset) => (
                                                <button
                                                    key={preset.label}
                                                    onClick={() => setNewColour(preset)}
                                                    className={cn(
                                                        "px-2.5 py-1 rounded-full text-xs font-medium transition-all border",
                                                        newColour.label === preset.label
                                                            ? `${preset.bg} ${preset.colour} border-current ring-2 ring-current/20`
                                                            : "bg-surface border-border text-text-secondary hover:bg-surface-hover"
                                                    )}
                                                >
                                                    {preset.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* API Keys */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Key className="w-4 h-4 text-text-tertiary" />
                            <CardTitle className="text-base">AI Integration</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Input
                            label="OpenAI API Key"
                            type="password"
                            placeholder="sk-..."
                            hint="Connect your ChatGPT/OpenAI account to unlock AI features. Your key is stored securely."
                        />
                        <Button size="sm">Connect API Key</Button>
                    </CardContent>
                </Card>

                {/* Branding */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Palette className="w-4 h-4 text-text-tertiary" />
                            <CardTitle className="text-base">Branding</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-text-tertiary">
                            Customise your CRM&apos;s look and feel. Upload your logo and set your brand colours.
                        </p>
                        <Input label="Business Name" placeholder="She Does Socials" />
                        <Button size="sm" variant="secondary">Upload Logo</Button>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

export default function SettingsPage() {
    return (
        <Suspense fallback={
            <>
                <Header title="Settings" subtitle="Manage your account and preferences" />
                <div className="flex items-center justify-center py-32">
                    <Loader2 className="w-6 h-6 text-text-tertiary animate-spin" />
                </div>
            </>
        }>
            <SettingsContent />
        </Suspense>
    );
}
