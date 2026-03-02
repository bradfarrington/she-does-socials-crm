"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input, Textarea } from "@/components/ui/input";
import {
    ArrowLeft,
    Building2,
    Mail,
    Phone,
    Globe,
    MapPin,
    Palette,
    Share2,
    Target,
    Star,
    Trash2,
    Loader2,
    Camera,
    Megaphone,
    Eye,
    MessageCircle,
    CalendarRange,
    CheckCircle2,
    Instagram,
    Pencil,
    Check,
    X,
    Plus,
    Save,
} from "lucide-react";
import { cn, getInitials, formatDate, formatCurrency } from "@/lib/utils";
import type { IndustryRecord } from "@/lib/types";

interface ClientDetail {
    id: string;
    business_name: string;
    contact_name: string;
    contact_email: string;
    contact_phone: string | null;
    website: string | null;
    industry_id: string | null;
    location: string | null;
    location_type: string | null;
    is_priority: boolean;
    is_archived: boolean;
    notes: string | null;
    brand_colours: string[];
    brand_voice: string[];
    words_love: string | null;
    words_avoid: string | null;
    platforms: string[];
    posting_frequency: string | null;
    success_definition: string | null;
    focus: string[];
    short_term_campaigns: string | null;
    long_term_vision: string | null;
    comfortable_on_camera: string | null;
    preferred_content_types: string[];
    content_boundaries: string | null;
    created_at: string;
    updated_at: string;
    industries: IndustryRecord | null;
    package_id: string | null;
    packages: { id: string; name: string; type: string; price: number } | null;
    instagram_handle: string | null;
    facebook_url: string | null;
    tiktok_handle: string | null;
    linkedin_url: string | null;
    business_description: string | null;
    target_audience: string | null;
    usp: string | null;
    content_looking_for: string | null;
    content_not_working: string | null;
    content_themes: string | null;
    strategy_month_1_goal: string | null;
    strategy_month_1_actions: string[];
    strategy_month_2_goal: string | null;
    strategy_month_2_actions: string[];
    strategy_month_3_goal: string | null;
    strategy_month_3_actions: string[];
}

const platformConfig: Record<string, { label: string; colour: string; bg: string }> = {
    instagram: { label: "Instagram", colour: "text-purple-600", bg: "bg-purple-50" },
    facebook: { label: "Facebook", colour: "text-blue-600", bg: "bg-blue-50" },
    tiktok: { label: "TikTok", colour: "text-text-primary", bg: "bg-warm-100" },
    linkedin: { label: "LinkedIn", colour: "text-blue-700", bg: "bg-blue-50" },
};

const voiceEmojis: Record<string, string> = {
    friendly: "😊", luxury: "✨", bold: "💪", educational: "📚",
    soulful: "🌿", playful: "🎉", professional: "💼", warm: "☀️",
};

const focusIcons: Record<string, React.ReactNode> = {
    sales: <Megaphone className="w-3.5 h-3.5" />,
    awareness: <Eye className="w-3.5 h-3.5" />,
    community: <MessageCircle className="w-3.5 h-3.5" />,
};

const cameraLabels: Record<string, { label: string; colour: string; bg: string }> = {
    yes: { label: "Yes — loves it!", colour: "text-sage-600", bg: "bg-sage-50" },
    no: { label: "No — prefers off-camera", colour: "text-rose-600", bg: "bg-rose-50" },
    sometimes: { label: "Sometimes — depends on mood", colour: "text-lavender-500", bg: "bg-lavender-50" },
};

const contentTypeLabels: Record<string, string> = {
    b_roll: "B-Roll", talking_head: "Talking Head", carousels: "Carousels", static: "Static Posts",
};

const brandVoiceOptions = ["friendly", "luxury", "bold", "educational", "soulful", "playful", "professional", "warm"];
const platformOptions = ["instagram", "facebook", "tiktok", "linkedin"];
const contentTypeOptions = ["b_roll", "talking_head", "carousels", "static"];

type Section = "contact" | "business" | "content" | "goals" | "brand" | "strategy";

export default function ClientDetailPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const [client, setClient] = useState<ClientDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [archiving, setArchiving] = useState(false);
    const [editingSection, setEditingSection] = useState<Section | null>(null);
    const [saving, setSaving] = useState(false);
    const [draft, setDraft] = useState<Record<string, unknown>>({});

    const fetchClient = useCallback(async () => {
        try {
            const res = await fetch(`/api/clients/${id}`);
            if (res.ok) {
                const data = await res.json();
                setClient(data);
            } else {
                console.error("Failed to fetch client");
            }
        } catch (err) {
            console.error("Error fetching client:", err);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => { fetchClient(); }, [fetchClient]);

    const handleArchive = async () => {
        if (!confirm("Are you sure you want to archive this client?")) return;
        setArchiving(true);
        try {
            const res = await fetch(`/api/clients/${id}`, { method: "DELETE" });
            if (res.ok) router.push("/clients");
        } catch (err) {
            console.error("Failed to archive:", err);
        } finally {
            setArchiving(false);
        }
    };

    /* ── Edit helpers ── */
    const startEditing = (section: Section) => {
        if (!client) return;
        const sectionFields: Record<Section, Record<string, unknown>> = {
            contact: {
                contact_name: client.contact_name,
                contact_email: client.contact_email,
                contact_phone: client.contact_phone || "",
                website: client.website || "",
                instagram_handle: client.instagram_handle || "",
                tiktok_handle: client.tiktok_handle || "",
                facebook_url: client.facebook_url || "",
                linkedin_url: client.linkedin_url || "",
            },
            business: {
                business_name: client.business_name,
                location: client.location || "",
                location_type: client.location_type || "",
                business_description: client.business_description || "",
                target_audience: client.target_audience || "",
                usp: client.usp || "",
            },
            content: {
                platforms: [...client.platforms],
                posting_frequency: client.posting_frequency || "",
                content_looking_for: client.content_looking_for || "",
                content_not_working: client.content_not_working || "",
                content_themes: client.content_themes || "",
                comfortable_on_camera: client.comfortable_on_camera || "",
                preferred_content_types: [...client.preferred_content_types],
                content_boundaries: client.content_boundaries || "",
            },
            goals: {
                success_definition: client.success_definition || "",
                focus: [...client.focus],
                short_term_campaigns: client.short_term_campaigns || "",
                long_term_vision: client.long_term_vision || "",
            },
            brand: {
                brand_colours: [...client.brand_colours],
                brand_voice: [...client.brand_voice],
                words_love: client.words_love || "",
                words_avoid: client.words_avoid || "",
            },
            strategy: {
                strategy_month_1_goal: client.strategy_month_1_goal || "",
                strategy_month_1_actions: client.strategy_month_1_actions?.length ? [...client.strategy_month_1_actions] : [""],
                strategy_month_2_goal: client.strategy_month_2_goal || "",
                strategy_month_2_actions: client.strategy_month_2_actions?.length ? [...client.strategy_month_2_actions] : [""],
                strategy_month_3_goal: client.strategy_month_3_goal || "",
                strategy_month_3_actions: client.strategy_month_3_actions?.length ? [...client.strategy_month_3_actions] : [""],
            },
        };
        setDraft(sectionFields[section]);
        setEditingSection(section);
    };

    const cancelEditing = () => { setEditingSection(null); setDraft({}); };

    const saveDraft = async () => {
        if (!client) return;
        setSaving(true);
        try {
            // Clean up: convert empty strings to null for nullable fields
            const payload: Record<string, unknown> = {};
            for (const [key, value] of Object.entries(draft)) {
                if (Array.isArray(value)) {
                    payload[key] = (value as string[]).filter(Boolean);
                } else if (value === "") {
                    payload[key] = null;
                } else {
                    payload[key] = value;
                }
            }
            const res = await fetch(`/api/clients/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (res.ok) {
                const updated = await res.json();
                setClient(updated);
                setEditingSection(null);
                setDraft({});
            }
        } catch (err) {
            console.error("Failed to save:", err);
        } finally {
            setSaving(false);
        }
    };

    const d = (key: string) => (draft[key] as string) ?? "";
    const dArr = (key: string) => (draft[key] as string[]) ?? [];
    const setD = (key: string, value: unknown) => setDraft((prev) => ({ ...prev, [key]: value }));
    const toggleDArr = (key: string, val: string) => {
        const arr = dArr(key);
        setD(key, arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]);
    };

    if (loading) {
        return (
            <>
                <Header title="Loading..." />
                <div className="flex items-center justify-center py-32">
                    <Loader2 className="w-6 h-6 text-text-tertiary animate-spin" />
                </div>
            </>
        );
    }

    if (!client) {
        return (
            <>
                <Header title="Client Not Found" />
                <div className="p-6 text-center py-32">
                    <p className="text-text-tertiary mb-4">This client doesn&apos;t exist or has been archived.</p>
                    <Link href="/clients" className={buttonVariants({ variant: "secondary", size: "sm" })}>
                        <ArrowLeft className="w-4 h-4" /> Back to Clients
                    </Link>
                </div>
            </>
        );
    }

    const industry = client.industries;
    const pkg = client.packages;
    const isEditing = (s: Section) => editingSection === s;

    return (
        <>
            <Header
                title={client.business_name}
                subtitle={client.contact_name}
                actions={
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={handleArchive} disabled={archiving} className="text-text-tertiary hover:text-error">
                            {archiving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                            Archive
                        </Button>
                        <Link href="/clients" className={buttonVariants({ variant: "ghost", size: "sm" })}>
                            <ArrowLeft className="w-4 h-4" /> Back to Clients
                        </Link>
                    </div>
                }
            />

            <div className="p-6 max-w-5xl mx-auto space-y-6 animate-fade-in">
                {/* Top Summary Bar */}
                <div className="flex items-center gap-4 flex-wrap">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-200 to-rose-200 flex items-center justify-center shadow-sm">
                        <span className="text-xl font-bold text-brand-800">{getInitials(client.business_name)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <h2 className="text-xl font-display font-bold text-text-primary truncate">{client.business_name}</h2>
                            {client.is_priority && <Star className="w-5 h-5 text-brand-500 fill-brand-500 flex-shrink-0" />}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                            {industry && <Badge variant="default" size="sm" className={`${industry.bg} ${industry.colour}`}>{industry.name}</Badge>}
                            {pkg && <Badge variant="default" size="sm" className="bg-lavender-50 text-lavender-500">{pkg.name} · {formatCurrency(pkg.price)}</Badge>}
                            {client.location_type && <Badge variant="outline" size="sm" className="capitalize">{client.location_type}</Badge>}
                            {client.location && <span className="text-xs text-text-tertiary flex items-center gap-1"><MapPin className="w-3 h-3" />{client.location}</span>}
                        </div>
                    </div>
                    {client.brand_colours.length > 0 && (
                        <div className="flex items-center gap-1.5">
                            {client.brand_colours.map((colour) => <div key={colour} className="w-6 h-6 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: colour }} title={colour} />)}
                        </div>
                    )}
                </div>

                {/* Main Grid — 5 Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* ──────── 1. CONTACT DETAILS ──────── */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-brand-500" /> Contact Details
                                </CardTitle>
                                <EditToggle section="contact" isEditing={isEditing("contact")} saving={saving} onEdit={() => startEditing("contact")} onSave={saveDraft} onCancel={cancelEditing} />
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {isEditing("contact") ? (
                                <div className="space-y-3">
                                    <Input label="Contact Name" value={d("contact_name")} onChange={(e) => setD("contact_name", e.target.value)} />
                                    <Input label="Email" type="email" value={d("contact_email")} onChange={(e) => setD("contact_email", e.target.value)} />
                                    <Input label="Phone" type="tel" value={d("contact_phone")} onChange={(e) => setD("contact_phone", e.target.value)} />
                                    <Input label="Website" value={d("website")} onChange={(e) => setD("website", e.target.value)} />
                                    <div className="grid grid-cols-2 gap-3">
                                        <Input label="Instagram" placeholder="@handle" value={d("instagram_handle")} onChange={(e) => setD("instagram_handle", e.target.value)} />
                                        <Input label="TikTok" placeholder="@handle" value={d("tiktok_handle")} onChange={(e) => setD("tiktok_handle", e.target.value)} />
                                        <Input label="Facebook URL" value={d("facebook_url")} onChange={(e) => setD("facebook_url", e.target.value)} />
                                        <Input label="LinkedIn URL" value={d("linkedin_url")} onChange={(e) => setD("linkedin_url", e.target.value)} />
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <InfoRow icon={<Mail className="w-4 h-4" />} label="Email"><a href={`mailto:${client.contact_email}`} className="text-brand-600 hover:underline">{client.contact_email}</a></InfoRow>
                                    {client.contact_phone && <InfoRow icon={<Phone className="w-4 h-4" />} label="Phone"><a href={`tel:${client.contact_phone}`} className="text-brand-600 hover:underline">{client.contact_phone}</a></InfoRow>}
                                    {client.website && <InfoRow icon={<Globe className="w-4 h-4" />} label="Website"><a href={client.website} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline truncate block">{client.website.replace(/^https?:\/\//, "")}</a></InfoRow>}
                                    {client.instagram_handle && <InfoRow icon={<Instagram className="w-4 h-4" />} label="Instagram">{client.instagram_handle}</InfoRow>}
                                    {client.tiktok_handle && <InfoRow icon={<Share2 className="w-4 h-4" />} label="TikTok">{client.tiktok_handle}</InfoRow>}
                                    {client.facebook_url && <InfoRow icon={<Globe className="w-4 h-4" />} label="Facebook"><a href={client.facebook_url} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline truncate block">{client.facebook_url.replace(/^https?:\/\//, "")}</a></InfoRow>}
                                    {client.linkedin_url && <InfoRow icon={<Globe className="w-4 h-4" />} label="LinkedIn"><a href={client.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline truncate block">{client.linkedin_url.replace(/^https?:\/\//, "")}</a></InfoRow>}
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* ──────── 2. BUSINESS INFO ──────── */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <Building2 className="w-4 h-4 text-brand-500" /> Business Info
                                </CardTitle>
                                <EditToggle section="business" isEditing={isEditing("business")} saving={saving} onEdit={() => startEditing("business")} onSave={saveDraft} onCancel={cancelEditing} />
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {isEditing("business") ? (
                                <div className="space-y-3">
                                    <Input label="Business Name" value={d("business_name")} onChange={(e) => setD("business_name", e.target.value)} />
                                    <Input label="Location" value={d("location")} onChange={(e) => setD("location", e.target.value)} />
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-text-secondary">Business Reach</label>
                                        <div className="flex gap-2">
                                            {(["local", "national", "online"] as const).map((type) => (
                                                <button key={type} type="button" onClick={() => setD("location_type", type)} className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-all border capitalize", d("location_type") === type ? "bg-brand-50 text-brand-700 border-brand-300" : "bg-surface border-border text-text-secondary hover:bg-surface-hover")}>{type}</button>
                                            ))}
                                        </div>
                                    </div>
                                    <Textarea label="Description" value={d("business_description")} onChange={(e) => setD("business_description", e.target.value)} />
                                    <Textarea label="Target Audience" value={d("target_audience")} onChange={(e) => setD("target_audience", e.target.value)} />
                                    <Textarea label="Unique Selling Point (USP)" value={d("usp")} onChange={(e) => setD("usp", e.target.value)} />
                                </div>
                            ) : (
                                <>
                                    {client.location && <InfoRow icon={<MapPin className="w-4 h-4" />} label="Location">{client.location}</InfoRow>}
                                    {client.business_description && <TextBlock label="Description" value={client.business_description} />}
                                    {client.target_audience && <TextBlock label="Target Audience" value={client.target_audience} />}
                                    {client.usp && <TextBlock label="Unique Selling Point" value={client.usp} accent />}
                                    {!client.location && !client.business_description && !client.target_audience && !client.usp && <EmptyState>No business info added yet.</EmptyState>}
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* ──────── 3. WANTS & NEEDS FOR CONTENT ──────── */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <Share2 className="w-4 h-4 text-brand-500" /> Wants & Needs for Content
                                </CardTitle>
                                <EditToggle section="content" isEditing={isEditing("content")} saving={saving} onEdit={() => startEditing("content")} onSave={saveDraft} onCancel={cancelEditing} />
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {isEditing("content") ? (
                                <div className="space-y-4">
                                    {/* Platforms */}
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-text-secondary">Active Platforms</label>
                                        <div className="flex flex-wrap gap-2">
                                            {platformOptions.map((p) => (
                                                <button key={p} type="button" onClick={() => toggleDArr("platforms", p)} className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-all border capitalize", dArr("platforms").includes(p) ? "bg-brand-50 text-brand-700 border-brand-300" : "bg-surface border-border text-text-secondary hover:bg-surface-hover")}>{platformConfig[p]?.label || p}</button>
                                            ))}
                                        </div>
                                    </div>
                                    <Input label="Posting Frequency" value={d("posting_frequency")} onChange={(e) => setD("posting_frequency", e.target.value)} />
                                    <Textarea label="What content are they looking for?" value={d("content_looking_for")} onChange={(e) => setD("content_looking_for", e.target.value)} />
                                    <Textarea label="What's not currently working?" value={d("content_not_working")} onChange={(e) => setD("content_not_working", e.target.value)} />
                                    <Textarea label="Content themes / topics" value={d("content_themes")} onChange={(e) => setD("content_themes", e.target.value)} />
                                    {/* Camera */}
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-text-secondary">Comfortable on camera?</label>
                                        <div className="flex gap-2">
                                            {(["yes", "no", "sometimes"] as const).map((opt) => (
                                                <button key={opt} type="button" onClick={() => setD("comfortable_on_camera", opt)} className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-all border capitalize", d("comfortable_on_camera") === opt ? "bg-brand-50 text-brand-700 border-brand-300" : "bg-surface border-border text-text-secondary hover:bg-surface-hover")}>{opt}</button>
                                            ))}
                                        </div>
                                    </div>
                                    {/* Content types */}
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-text-secondary">Preferred Content Types</label>
                                        <div className="flex flex-wrap gap-2">
                                            {contentTypeOptions.map((t) => (
                                                <button key={t} type="button" onClick={() => toggleDArr("preferred_content_types", t)} className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-all border", dArr("preferred_content_types").includes(t) ? "bg-brand-50 text-brand-700 border-brand-300" : "bg-surface border-border text-text-secondary hover:bg-surface-hover")}>{contentTypeLabels[t]}</button>
                                            ))}
                                        </div>
                                    </div>
                                    <Textarea label="Content Boundaries" value={d("content_boundaries")} onChange={(e) => setD("content_boundaries", e.target.value)} />
                                </div>
                            ) : (
                                <>
                                    {client.platforms.length > 0 && (
                                        <div>
                                            <p className="text-xs font-medium text-text-tertiary mb-2">Active Platforms</p>
                                            <div className="flex flex-wrap gap-2">
                                                {client.platforms.map((platform) => {
                                                    const config = platformConfig[platform];
                                                    return <Badge key={platform} variant="default" size="sm" className={cn(config?.bg || "bg-surface-secondary", config?.colour || "text-text-primary")}>{config?.label || platform}</Badge>;
                                                })}
                                            </div>
                                        </div>
                                    )}
                                    {client.posting_frequency && <TextBlock label="Posting Frequency" value={client.posting_frequency} />}
                                    {client.content_looking_for && <TextBlock label="What they're looking for" value={client.content_looking_for} green />}
                                    {client.content_not_working && <TextBlock label="What's not working" value={client.content_not_working} red />}
                                    {client.content_themes && <TextBlock label="Content Themes" value={client.content_themes} />}
                                    {client.comfortable_on_camera && (() => {
                                        const cam = cameraLabels[client.comfortable_on_camera];
                                        return cam ? <div><p className="text-xs font-medium text-text-tertiary mb-2 flex items-center gap-1"><Camera className="w-3 h-3" /> Camera Comfort</p><Badge variant="default" size="sm" className={`${cam.bg} ${cam.colour}`}>{cam.label}</Badge></div> : null;
                                    })()}
                                    {client.preferred_content_types.length > 0 && (
                                        <div>
                                            <p className="text-xs font-medium text-text-tertiary mb-2">Preferred Content Types</p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {client.preferred_content_types.map((type) => <Badge key={type} variant="outline" size="sm">{contentTypeLabels[type] || type}</Badge>)}
                                            </div>
                                        </div>
                                    )}
                                    {client.content_boundaries && <TextBlock label="Content Boundaries" value={client.content_boundaries} red />}
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* ──────── 4. THEIR END GOAL ──────── */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <Target className="w-4 h-4 text-brand-500" /> Their End Goal
                                </CardTitle>
                                <EditToggle section="goals" isEditing={isEditing("goals")} saving={saving} onEdit={() => startEditing("goals")} onSave={saveDraft} onCancel={cancelEditing} />
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {isEditing("goals") ? (
                                <div className="space-y-3">
                                    <Textarea label="What does success look like?" value={d("success_definition")} onChange={(e) => setD("success_definition", e.target.value)} />
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-text-secondary">Primary Focus</label>
                                        <div className="flex flex-wrap gap-2">
                                            {(["sales", "awareness", "community"] as const).map((f) => (
                                                <button key={f} type="button" onClick={() => toggleDArr("focus", f)} className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-all border capitalize", dArr("focus").includes(f) ? "bg-brand-50 text-brand-700 border-brand-300" : "bg-surface border-border text-text-secondary hover:bg-surface-hover")}>{f}</button>
                                            ))}
                                        </div>
                                    </div>
                                    <Textarea label="Short-term campaigns" value={d("short_term_campaigns")} onChange={(e) => setD("short_term_campaigns", e.target.value)} />
                                    <Textarea label="Long-term vision" value={d("long_term_vision")} onChange={(e) => setD("long_term_vision", e.target.value)} />
                                </div>
                            ) : (
                                <>
                                    {client.success_definition && <TextBlock label="What success looks like" value={client.success_definition} accent />}
                                    {client.focus.length > 0 && (
                                        <div>
                                            <p className="text-xs font-medium text-text-tertiary mb-2">Primary Focus</p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {client.focus.map((f) => <Badge key={f} variant="default" size="sm" className="bg-lavender-50 text-lavender-500 capitalize flex items-center gap-1">{focusIcons[f]} {f}</Badge>)}
                                            </div>
                                        </div>
                                    )}
                                    {client.short_term_campaigns && <TextBlock label="Short-term campaigns" value={client.short_term_campaigns} />}
                                    {client.long_term_vision && <TextBlock label="Long-term vision" value={client.long_term_vision} />}
                                    {!client.success_definition && client.focus.length === 0 && !client.short_term_campaigns && !client.long_term_vision && <EmptyState>No goals added yet.</EmptyState>}
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* ──────── BRAND IDENTITY ──────── */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <Palette className="w-4 h-4 text-brand-500" /> Brand Identity
                                </CardTitle>
                                <EditToggle section="brand" isEditing={isEditing("brand")} saving={saving} onEdit={() => startEditing("brand")} onSave={saveDraft} onCancel={cancelEditing} />
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {isEditing("brand") ? (
                                <div className="space-y-4">
                                    {/* Voice */}
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-text-secondary">Brand Voice</label>
                                        <div className="flex flex-wrap gap-2">
                                            {brandVoiceOptions.map((v) => (
                                                <button key={v} type="button" onClick={() => toggleDArr("brand_voice", v)} className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-all border capitalize", dArr("brand_voice").includes(v) ? "bg-brand-50 text-brand-700 border-brand-300" : "bg-surface border-border text-text-secondary hover:bg-surface-hover")}>{voiceEmojis[v]} {v}</button>
                                            ))}
                                        </div>
                                    </div>
                                    <Textarea label="Words they love" value={d("words_love")} onChange={(e) => setD("words_love", e.target.value)} />
                                    <Textarea label="Words to avoid" value={d("words_avoid")} onChange={(e) => setD("words_avoid", e.target.value)} />
                                </div>
                            ) : (
                                <>
                                    {client.brand_colours.length > 0 && (
                                        <div>
                                            <p className="text-xs font-medium text-text-tertiary mb-2">Colours</p>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                {client.brand_colours.map((colour) => (
                                                    <div key={colour} className="flex items-center gap-1.5 bg-surface-secondary rounded-full px-2.5 py-1 border border-border">
                                                        <div className="w-4 h-4 rounded-full border border-border" style={{ backgroundColor: colour }} />
                                                        <span className="text-xs text-text-secondary font-mono">{colour}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {client.brand_voice.length > 0 && (
                                        <div>
                                            <p className="text-xs font-medium text-text-tertiary mb-2">Brand Voice</p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {client.brand_voice.map((voice) => <Badge key={voice} variant="default" size="sm" className="bg-brand-50 text-brand-700 capitalize">{voiceEmojis[voice] || ""} {voice}</Badge>)}
                                            </div>
                                        </div>
                                    )}
                                    {(client.words_love || client.words_avoid) && (
                                        <div className="grid grid-cols-2 gap-3">
                                            {client.words_love && <TextBlock label="Words they love" value={client.words_love} green />}
                                            {client.words_avoid && <TextBlock label="Words to avoid" value={client.words_avoid} red />}
                                        </div>
                                    )}
                                    {client.brand_colours.length === 0 && client.brand_voice.length === 0 && !client.words_love && !client.words_avoid && <EmptyState>No branding info added yet.</EmptyState>}
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* ──────── 5. 3 MONTH STRATEGY PLAN — FULL WIDTH ──────── */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <CalendarRange className="w-4 h-4 text-brand-500" /> 3 Month Strategy Plan
                            </CardTitle>
                            <EditToggle section="strategy" isEditing={isEditing("strategy")} saving={saving} onEdit={() => startEditing("strategy")} onSave={saveDraft} onCancel={cancelEditing} />
                        </div>
                    </CardHeader>
                    <CardContent>
                        {isEditing("strategy") ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {([1, 2, 3] as const).map((month) => {
                                    const goalKey = `strategy_month_${month}_goal`;
                                    const actionsKey = `strategy_month_${month}_actions`;
                                    const actions = dArr(actionsKey);
                                    const colours = [
                                        { border: "border-l-brand-400", badge: "bg-brand-50 text-brand-700" },
                                        { border: "border-l-lavender-400", badge: "bg-lavender-50 text-lavender-600" },
                                        { border: "border-l-sage-400", badge: "bg-sage-50 text-sage-700" },
                                    ];
                                    const mc = colours[month - 1];
                                    return (
                                        <div key={month} className={cn("pl-4 border-l-4 space-y-3", mc.border)}>
                                            <Badge size="sm" className={mc.badge}>Month {month}</Badge>
                                            <Textarea label="Goal" placeholder={`Goal for month ${month}`} value={d(goalKey)} onChange={(e) => setD(goalKey, e.target.value)} />
                                            <div className="space-y-2">
                                                <label className="block text-xs font-medium text-text-secondary">Actions</label>
                                                {actions.map((action, i) => (
                                                    <div key={i} className="flex items-center gap-2">
                                                        <CheckCircle2 className="w-3.5 h-3.5 text-sage-400 flex-shrink-0" />
                                                        <input
                                                            type="text"
                                                            value={action}
                                                            onChange={(e) => {
                                                                const updated = [...actions];
                                                                updated[i] = e.target.value;
                                                                setD(actionsKey, updated);
                                                            }}
                                                            placeholder={`Action ${i + 1}`}
                                                            className="flex h-8 flex-1 rounded-lg border border-border bg-surface px-3 py-1 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-brand-400/40 focus:border-brand-400 transition-all"
                                                        />
                                                        {actions.length > 1 && (
                                                            <button type="button" onClick={() => setD(actionsKey, actions.filter((_, idx) => idx !== i))} className="p-1 rounded hover:bg-rose-50 text-text-tertiary hover:text-rose-500 transition-all"><X className="w-3 h-3" /></button>
                                                        )}
                                                    </div>
                                                ))}
                                                <button type="button" onClick={() => setD(actionsKey, [...actions, ""])} className="text-xs font-medium text-brand-600 hover:text-brand-700 flex items-center gap-1"><Plus className="w-3 h-3" />Add action</button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (() => {
                            const hasStrategy = client.strategy_month_1_goal || client.strategy_month_2_goal || client.strategy_month_3_goal ||
                                (client.strategy_month_1_actions?.filter(Boolean).length > 0) || (client.strategy_month_2_actions?.filter(Boolean).length > 0) || (client.strategy_month_3_actions?.filter(Boolean).length > 0);
                            if (!hasStrategy) return <EmptyState>No strategy plan added yet. Click the edit button to start planning.</EmptyState>;
                            const months = [
                                { num: 1, goal: client.strategy_month_1_goal, actions: client.strategy_month_1_actions || [], border: "border-l-brand-400", badge: "bg-brand-50 text-brand-700" },
                                { num: 2, goal: client.strategy_month_2_goal, actions: client.strategy_month_2_actions || [], border: "border-l-lavender-400", badge: "bg-lavender-50 text-lavender-600" },
                                { num: 3, goal: client.strategy_month_3_goal, actions: client.strategy_month_3_actions || [], border: "border-l-sage-400", badge: "bg-sage-50 text-sage-700" },
                            ];
                            return (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {months.map((m) => (
                                        <div key={m.num} className={cn("pl-4 border-l-4 space-y-3", m.border)}>
                                            <Badge size="sm" className={m.badge}>Month {m.num}</Badge>
                                            {m.goal && <div><p className="text-xs font-medium text-text-tertiary mb-1">Goal</p><p className="text-sm text-text-primary">{m.goal}</p></div>}
                                            {m.actions.filter(Boolean).length > 0 && (
                                                <div>
                                                    <p className="text-xs font-medium text-text-tertiary mb-2">Actions</p>
                                                    <div className="space-y-1.5">
                                                        {m.actions.filter(Boolean).map((action, i) => (
                                                            <div key={i} className="flex items-start gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-sage-400 flex-shrink-0 mt-0.5" /><span className="text-xs text-text-secondary">{action}</span></div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            {!m.goal && m.actions.filter(Boolean).length === 0 && <p className="text-xs text-text-tertiary italic">Not planned yet</p>}
                                        </div>
                                    ))}
                                </div>
                            );
                        })()}
                    </CardContent>
                </Card>

                {/* Metadata footer */}
                <div className="flex items-center justify-between text-xs text-text-tertiary pt-2 border-t border-border">
                    <span>Created {formatDate(client.created_at)}</span>
                    <span>Last updated {formatDate(client.updated_at)}</span>
                </div>
            </div>
        </>
    );
}

/* ── Helper components ── */

function EditToggle({ section, isEditing, saving, onEdit, onSave, onCancel }: {
    section: string; isEditing: boolean; saving: boolean;
    onEdit: () => void; onSave: () => void; onCancel: () => void;
}) {
    if (isEditing) {
        return (
            <div className="flex items-center gap-1.5">
                <Button variant="ghost" size="sm" onClick={onCancel} disabled={saving} className="h-7 px-2 text-xs">
                    <X className="w-3 h-3" /> Cancel
                </Button>
                <Button variant="success" size="sm" onClick={onSave} disabled={saving} className="h-7 px-3 text-xs">
                    {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />} Save
                </Button>
            </div>
        );
    }
    return (
        <button onClick={onEdit} className="p-1.5 rounded-lg hover:bg-surface-hover text-text-tertiary hover:text-text-secondary transition-all" title={`Edit ${section}`}>
            <Pencil className="w-3.5 h-3.5" />
        </button>
    );
}

function InfoRow({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
    return (
        <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-surface-secondary flex items-center justify-center text-text-tertiary flex-shrink-0">{icon}</div>
            <div className="min-w-0">
                <p className="text-xs text-text-tertiary">{label}</p>
                <div className="text-sm text-text-primary">{children}</div>
            </div>
        </div>
    );
}

function TextBlock({ label, value, accent, green, red }: { label: string; value: string; accent?: boolean; green?: boolean; red?: boolean }) {
    const bg = accent ? "bg-brand-50 border-brand-200" : green ? "bg-sage-50 border-sage-200" : red ? "bg-rose-50 border-rose-200" : "bg-surface-secondary border-border";
    const labelColour = accent ? "text-brand-600" : green ? "text-sage-600" : red ? "text-rose-600" : "text-text-tertiary";
    return (
        <div className={cn("p-3 rounded-lg border", bg)}>
            <p className={cn("text-xs font-medium mb-1", labelColour)}>{label}</p>
            <p className="text-sm text-text-primary">{value}</p>
        </div>
    );
}

function EmptyState({ children }: { children: React.ReactNode }) {
    return <p className="text-sm text-text-tertiary italic">{children}</p>;
}
