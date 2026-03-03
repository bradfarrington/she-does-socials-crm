"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type {
    Platform,
    ContentType,
    ContentStatus,
    ContentPurpose,
} from "@/lib/types";
import {
    Plus,
    ChevronLeft,
    ChevronRight,
    LayoutGrid,
    List,
    X,
    Instagram,
    Facebook,
    Linkedin,
    Music2,
    Image,
    Film,
    Radio,
    Mail,
    PenLine,
    Layers,
    Clock,
    Edit3,
    Trash2,
    Sparkles,
    Target,
    Users,
    Award,
    Heart,
    MessageCircle,
    Send,
    Bookmark,
    Share2,
    ThumbsUp,
    Repeat2,
    MoreHorizontal,
    Globe,
    Play,
    Volume2,
    Upload,
    Video,
} from "lucide-react";

// ─── Simple Client (for dropdown + platform filtering) ──
interface SimpleClient {
    id: string;
    business_name: string;
    platforms: string[];
}

// ─── Platform Config ────────────────────────────────────
const platformConfig: Record<Platform, { label: string; colour: string; bg: string; icon: React.ElementType }> = {
    instagram: { label: "Instagram", colour: "text-pink-600", bg: "bg-gradient-to-br from-purple-500 to-pink-500", icon: Instagram },
    facebook: { label: "Facebook", colour: "text-blue-600", bg: "bg-blue-600", icon: Facebook },
    tiktok: { label: "TikTok", colour: "text-gray-900", bg: "bg-black", icon: Music2 },
    linkedin: { label: "LinkedIn", colour: "text-blue-700", bg: "bg-blue-700", icon: Linkedin },
};

const contentTypeConfig: Record<ContentType, { label: string; icon: React.ElementType; colour: string }> = {
    reel: { label: "Reel", icon: Film, colour: "text-pink-500" },
    carousel: { label: "Carousel", icon: Layers, colour: "text-lavender-500" },
    static_post: { label: "Static", icon: Image, colour: "text-brand-500" },
    story: { label: "Story", icon: Radio, colour: "text-sage-500" },
    live: { label: "Live", icon: Radio, colour: "text-rose-500" },
    email: { label: "Email", icon: Mail, colour: "text-blue-500" },
    blog: { label: "Blog", icon: PenLine, colour: "text-warm-600" },
};

const statusConfig: Record<ContentStatus, { label: string; colour: string; bg: string }> = {
    idea: { label: "Idea", colour: "text-warm-600", bg: "bg-warm-100" },
    planned: { label: "Planned", colour: "text-lavender-500", bg: "bg-lavender-50" },
    drafted: { label: "Drafted", colour: "text-brand-600", bg: "bg-brand-50" },
    scheduled: { label: "Scheduled", colour: "text-blue-600", bg: "bg-blue-50" },
    live: { label: "Live", colour: "text-sage-600", bg: "bg-sage-50" },
};

const purposeConfig: Record<ContentPurpose, { label: string; icon: React.ElementType; colour: string }> = {
    educational: { label: "Educational", icon: Sparkles, colour: "text-lavender-500" },
    sales: { label: "Sales", icon: Target, colour: "text-brand-600" },
    community: { label: "Community", icon: Users, colour: "text-sage-500" },
    authority: { label: "Authority", icon: Award, colour: "text-rose-500" },
};

// ─── Types ──────────────────────────────────────────────
interface ContentPost {
    id: string;
    client_name: string;
    platform: Platform;
    content_type: ContentType;
    status: ContentStatus;
    purpose?: ContentPurpose;
    scheduled_date: string;
    caption?: string;
    hook?: string;
    cta?: string;
    notes?: string;
}

// ─── Demo Data ──────────────────────────────────────────
function getRelativeDate(daysFromToday: number): string {
    const d = new Date();
    d.setDate(d.getDate() + daysFromToday);
    return d.toISOString().split("T")[0];
}

const demoPosts: ContentPost[] = [
    { id: "1", client_name: "Glow Studio", platform: "instagram", content_type: "reel", status: "scheduled", purpose: "sales", scheduled_date: getRelativeDate(0), caption: "✨ Brow lamination that speaks for itself", hook: "POV: You finally found your brow girl", cta: "Book your appointment — link in bio" },
    { id: "2", client_name: "Glow Studio", platform: "instagram", content_type: "carousel", status: "drafted", purpose: "educational", scheduled_date: getRelativeDate(1), caption: "5 things to know before your first facial", hook: "Your skin is about to thank you" },
    { id: "3", client_name: "The Garden Kitchen", platform: "facebook", content_type: "static_post", status: "planned", purpose: "community", scheduled_date: getRelativeDate(2), caption: "This week's specials are here 🍽️" },
    { id: "4", client_name: "FitLife Academy", platform: "tiktok", content_type: "reel", status: "idea", purpose: "authority", scheduled_date: getRelativeDate(3), caption: "The workout nobody talks about", hook: "Stop doing crunches. Here's why." },
    { id: "5", client_name: "Glow Studio", platform: "instagram", content_type: "story", status: "live", purpose: "community", scheduled_date: getRelativeDate(-1), caption: "Behind the scenes at today's shoot" },
    { id: "6", client_name: "The Garden Kitchen", platform: "instagram", content_type: "reel", status: "scheduled", purpose: "sales", scheduled_date: getRelativeDate(5), caption: "Sunday roast at The Garden Kitchen", hook: "If you haven't tried our roasties, are you even living?", cta: "Reserve your table — link in bio" },
    { id: "7", client_name: "FitLife Academy", platform: "linkedin", content_type: "static_post", status: "planned", purpose: "authority", scheduled_date: getRelativeDate(4), caption: "Why corporate wellness isn't a perk — it's a strategy" },
    { id: "8", client_name: "Glow Studio", platform: "tiktok", content_type: "reel", status: "idea", scheduled_date: getRelativeDate(7), caption: "Get ready with me using only 3 products" },
    { id: "9", client_name: "The Garden Kitchen", platform: "instagram", content_type: "carousel", status: "drafted", purpose: "educational", scheduled_date: getRelativeDate(-2), caption: "Farm to fork: Meet our local suppliers" },
    { id: "10", client_name: "FitLife Academy", platform: "instagram", content_type: "static_post", status: "scheduled", purpose: "sales", scheduled_date: getRelativeDate(6), caption: "Spring challenge starts Monday — 6 weeks to transform", cta: "DM 'SPRING' to sign up" },
];

// ─── Calendar Helpers ───────────────────────────────────
function getDaysInMonth(year: number, month: number) { return new Date(year, month + 1, 0).getDate(); }
function getFirstDayOfMonth(year: number, month: number) { const day = new Date(year, month, 1).getDay(); return day === 0 ? 6 : day - 1; }
function getWeekDates(date: Date): Date[] {
    const d = new Date(date);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    const monday = new Date(d);
    monday.setDate(d.getDate() + diff);
    return Array.from({ length: 7 }, (_, i) => { const wd = new Date(monday); wd.setDate(monday.getDate() + i); return wd; });
}
function isSameDay(d1: Date, d2: Date) { return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate(); }
function formatDateKey(d: Date): string { return d.toISOString().split("T")[0]; }

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// ─── Platform Preview Components ────────────────────────
function InstagramPreview({ clientName, hook, caption, cta, mediaUrl, mediaType }: { clientName: string; hook?: string; caption?: string; cta?: string; mediaUrl?: string; mediaType?: "image" | "video" }) {
    const hasContent = hook || caption || cta;
    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            {/* Header */}
            <div className="flex items-center gap-2.5 px-3 py-2.5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 p-[2px]">
                    <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                        <span className="text-[9px] font-bold text-gray-700">{clientName.charAt(0)}</span>
                    </div>
                </div>
                <div className="flex-1">
                    <p className="text-xs font-semibold text-gray-900">{clientName || "Client Name"}</p>
                </div>
                <MoreHorizontal className="w-4 h-4 text-gray-500" />
            </div>
            {/* Image / Video */}
            <div className="w-full aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden">
                {mediaUrl ? (
                    mediaType === "video" ? (
                        <video src={mediaUrl} className="w-full h-full object-cover" muted loop autoPlay playsInline />
                    ) : (
                        <img src={mediaUrl} alt="Post media" className="w-full h-full object-cover" />
                    )
                ) : (
                    <div className="text-center">
                        <Image className="w-8 h-8 text-gray-300 mx-auto mb-1" />
                        <span className="text-[10px] text-gray-400">Post Preview</span>
                    </div>
                )}
            </div>
            {/* Actions */}
            <div className="flex items-center justify-between px-3 py-2">
                <div className="flex items-center gap-3.5">
                    <Heart className="w-5 h-5 text-gray-800" />
                    <MessageCircle className="w-5 h-5 text-gray-800" />
                    <Send className="w-5 h-5 text-gray-800" />
                </div>
                <Bookmark className="w-5 h-5 text-gray-800" />
            </div>
            {/* Caption area */}
            <div className="px-3 pb-3">
                <p className="text-xs text-gray-500 mb-1">0 likes</p>
                {hasContent ? (
                    <div className="text-xs text-gray-800 leading-relaxed">
                        <span className="font-semibold">{clientName || "client"}</span>{" "}
                        {hook && <><span className="font-bold">{hook}</span><br /></>}
                        {caption && <span>{caption}</span>}
                        {cta && <><br /><br /><span className="text-gray-500">{cta}</span></>}
                    </div>
                ) : (
                    <p className="text-xs text-gray-400 italic">Caption will appear here…</p>
                )}
            </div>
        </div>
    );
}

function FacebookPreview({ clientName, hook, caption, cta, mediaUrl, mediaType }: { clientName: string; hook?: string; caption?: string; cta?: string; mediaUrl?: string; mediaType?: "image" | "video" }) {
    const hasContent = hook || caption || cta;
    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            {/* Header */}
            <div className="flex items-center gap-2.5 px-3 py-2.5">
                <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center">
                    <span className="text-xs font-bold text-white">{clientName.charAt(0)}</span>
                </div>
                <div className="flex-1">
                    <p className="text-xs font-semibold text-gray-900">{clientName || "Client Name"}</p>
                    <p className="text-[10px] text-gray-500 flex items-center gap-1">Just now · <Globe className="w-2.5 h-2.5" /></p>
                </div>
                <MoreHorizontal className="w-4 h-4 text-gray-500" />
            </div>
            {/* Post text */}
            <div className="px-3 pb-2">
                {hasContent ? (
                    <div className="text-xs text-gray-800 leading-relaxed">
                        {hook && <p className="font-bold mb-1">{hook}</p>}
                        {caption && <p>{caption}</p>}
                        {cta && <p className="mt-2 text-blue-600 font-medium">{cta}</p>}
                    </div>
                ) : (
                    <p className="text-xs text-gray-400 italic">Post text will appear here…</p>
                )}
            </div>
            {/* Image / Video */}
            <div className="w-full aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden">
                {mediaUrl ? (
                    mediaType === "video" ? (
                        <video src={mediaUrl} className="w-full h-full object-cover" muted loop autoPlay playsInline />
                    ) : (
                        <img src={mediaUrl} alt="Post media" className="w-full h-full object-cover" />
                    )
                ) : (
                    <div className="text-center">
                        <Image className="w-8 h-8 text-gray-300 mx-auto mb-1" />
                        <span className="text-[10px] text-gray-400">Media Preview</span>
                    </div>
                )}
            </div>
            {/* Reactions bar */}
            <div className="px-3 py-1.5 border-t border-gray-100">
                <div className="flex items-center gap-1 mb-1.5">
                    <div className="flex -space-x-1">
                        <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center"><ThumbsUp className="w-2.5 h-2.5 text-white" /></div>
                        <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center"><Heart className="w-2.5 h-2.5 text-white" /></div>
                    </div>
                    <span className="text-[10px] text-gray-500 ml-1">0</span>
                </div>
                <div className="flex items-center border-t border-gray-100 pt-1.5">
                    <button className="flex-1 flex items-center justify-center gap-1.5 py-1 text-[11px] text-gray-600 font-medium"><ThumbsUp className="w-3.5 h-3.5" /> Like</button>
                    <button className="flex-1 flex items-center justify-center gap-1.5 py-1 text-[11px] text-gray-600 font-medium"><MessageCircle className="w-3.5 h-3.5" /> Comment</button>
                    <button className="flex-1 flex items-center justify-center gap-1.5 py-1 text-[11px] text-gray-600 font-medium"><Share2 className="w-3.5 h-3.5" /> Share</button>
                </div>
            </div>
        </div>
    );
}

function TikTokPreview({ clientName, hook, caption, cta, mediaUrl, mediaType }: { clientName: string; hook?: string; caption?: string; cta?: string; mediaUrl?: string; mediaType?: "image" | "video" }) {
    const hasContent = hook || caption || cta;
    return (
        <div className="bg-black rounded-xl overflow-hidden shadow-sm relative" style={{ aspectRatio: "9/14" }}>
            {/* Video / Image background */}
            {mediaUrl ? (
                mediaType === "video" ? (
                    <video src={mediaUrl} className="absolute inset-0 w-full h-full object-cover" muted loop autoPlay playsInline />
                ) : (
                    <img src={mediaUrl} alt="Post media" className="absolute inset-0 w-full h-full object-cover" />
                )
            ) : (
                <div className="absolute inset-0 bg-gradient-to-b from-gray-800 via-gray-900 to-black flex items-center justify-center">
                    <div className="text-center">
                        <Play className="w-10 h-10 text-white/30 mx-auto mb-1" />
                        <span className="text-[10px] text-white/30">Video Preview</span>
                    </div>
                </div>
            )}
            {/* Dark overlay for readability when media present */}
            {mediaUrl && <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />}
            {/* Hook overlay at top */}
            {hook && (
                <div className="absolute top-4 left-3 right-12">
                    <p className="text-white text-sm font-bold drop-shadow-lg leading-snug">{hook}</p>
                </div>
            )}
            {/* Right sidebar icons */}
            <div className="absolute right-2 bottom-24 flex flex-col items-center gap-4">
                <div className="w-9 h-9 rounded-full bg-white/20 border-2 border-white flex items-center justify-center">
                    <span className="text-[9px] font-bold text-white">{clientName.charAt(0)}</span>
                </div>
                <div className="flex flex-col items-center gap-0.5">
                    <Heart className="w-5 h-5 text-white" />
                    <span className="text-[9px] text-white">0</span>
                </div>
                <div className="flex flex-col items-center gap-0.5">
                    <MessageCircle className="w-5 h-5 text-white" />
                    <span className="text-[9px] text-white">0</span>
                </div>
                <div className="flex flex-col items-center gap-0.5">
                    <Share2 className="w-5 h-5 text-white" />
                    <span className="text-[9px] text-white">0</span>
                </div>
            </div>
            {/* Bottom caption */}
            <div className="absolute bottom-3 left-3 right-12">
                <p className="text-white text-xs font-semibold mb-1">@{clientName.toLowerCase().replace(/\s+/g, "")}</p>
                {hasContent ? (
                    <div className="text-[11px] text-white/90 leading-relaxed">
                        {caption && <span>{caption}</span>}
                        {cta && <span className="text-white/60"> {cta}</span>}
                    </div>
                ) : (
                    <p className="text-[11px] text-white/40">Caption will appear here…</p>
                )}
                <div className="flex items-center gap-1.5 mt-2">
                    <Volume2 className="w-3 h-3 text-white/60" />
                    <div className="h-0.5 flex-1 bg-white/20 rounded-full">
                        <div className="h-full w-1/3 bg-white rounded-full" />
                    </div>
                </div>
            </div>
        </div>
    );
}

function LinkedInPreview({ clientName, hook, caption, cta, mediaUrl, mediaType }: { clientName: string; hook?: string; caption?: string; cta?: string; mediaUrl?: string; mediaType?: "image" | "video" }) {
    const hasContent = hook || caption || cta;
    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            {/* Header */}
            <div className="flex items-center gap-2.5 px-3 py-2.5">
                <div className="w-10 h-10 rounded-full bg-blue-700 flex items-center justify-center">
                    <span className="text-xs font-bold text-white">{clientName.charAt(0)}</span>
                </div>
                <div className="flex-1">
                    <p className="text-xs font-semibold text-gray-900">{clientName || "Client Name"}</p>
                    <p className="text-[10px] text-gray-500">Business · Just now</p>
                </div>
                <MoreHorizontal className="w-4 h-4 text-gray-500" />
            </div>
            {/* Post text */}
            <div className="px-3 pb-2.5">
                {hasContent ? (
                    <div className="text-xs text-gray-800 leading-relaxed">
                        {hook && <p className="font-bold mb-1.5">{hook}</p>}
                        {caption && <p className="whitespace-pre-wrap">{caption}</p>}
                        {cta && <p className="mt-2 text-blue-700 font-semibold">{cta}</p>}
                    </div>
                ) : (
                    <p className="text-xs text-gray-400 italic">Post text will appear here…</p>
                )}
            </div>
            {/* Image / Video */}
            <div className="w-full aspect-[1.91/1] bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden">
                {mediaUrl ? (
                    mediaType === "video" ? (
                        <video src={mediaUrl} className="w-full h-full object-cover" muted loop autoPlay playsInline />
                    ) : (
                        <img src={mediaUrl} alt="Post media" className="w-full h-full object-cover" />
                    )
                ) : (
                    <div className="text-center">
                        <Image className="w-8 h-8 text-gray-300 mx-auto mb-1" />
                        <span className="text-[10px] text-gray-400">Media Preview</span>
                    </div>
                )}
            </div>
            {/* Engagement bar */}
            <div className="px-3 py-1.5 border-t border-gray-100">
                <div className="flex items-center gap-1 mb-1.5">
                    <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center"><ThumbsUp className="w-2.5 h-2.5 text-white" /></div>
                    <span className="text-[10px] text-gray-500">0</span>
                </div>
                <div className="flex items-center border-t border-gray-100 pt-1.5">
                    <button className="flex-1 flex items-center justify-center gap-1.5 py-1 text-[11px] text-gray-600 font-medium"><ThumbsUp className="w-3.5 h-3.5" /> Like</button>
                    <button className="flex-1 flex items-center justify-center gap-1.5 py-1 text-[11px] text-gray-600 font-medium"><MessageCircle className="w-3.5 h-3.5" /> Comment</button>
                    <button className="flex-1 flex items-center justify-center gap-1.5 py-1 text-[11px] text-gray-600 font-medium"><Repeat2 className="w-3.5 h-3.5" /> Repost</button>
                    <button className="flex-1 flex items-center justify-center gap-1.5 py-1 text-[11px] text-gray-600 font-medium"><Send className="w-3.5 h-3.5" /> Send</button>
                </div>
            </div>
        </div>
    );
}

const previewComponents: Record<Platform, React.FC<{ clientName: string; hook?: string; caption?: string; cta?: string; mediaUrl?: string; mediaType?: "image" | "video" }>> = {
    instagram: InstagramPreview,
    facebook: FacebookPreview,
    tiktok: TikTokPreview,
    linkedin: LinkedInPreview,
};

// ─── Post Modal ─────────────────────────────────────────
function PostModal({ post, date, isOpen, onClose, onSave, onDelete, clients }: { post?: ContentPost | null; date?: string; isOpen: boolean; onClose: () => void; onSave: (post: ContentPost) => void; onDelete?: (id: string) => void; clients: SimpleClient[] }) {
    const isEdit = !!post;
    const [formData, setFormData] = useState<Partial<ContentPost>>({
        client_name: post?.client_name || "", platform: post?.platform || "instagram", content_type: post?.content_type || "static_post", status: post?.status || "idea", purpose: post?.purpose || undefined, scheduled_date: post?.scheduled_date || date || getRelativeDate(0), caption: post?.caption || "", hook: post?.hook || "", cta: post?.cta || "", notes: post?.notes || "",
    });
    const [previewPlatform, setPreviewPlatform] = useState<Platform>("instagram");
    const [mediaPreview, setMediaPreview] = useState<{ url: string; type: "image" | "video" } | null>(null);
    const mediaInputRef = React.useRef<HTMLInputElement>(null);

    const handleMediaSelect = (file: File) => {
        const isVideo = file.type.startsWith("video/");
        const url = URL.createObjectURL(file);
        setMediaPreview({ url, type: isVideo ? "video" : "image" });
    };

    const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleMediaSelect(file);
    };

    const handleMediaDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file && (file.type.startsWith("image/") || file.type.startsWith("video/"))) {
            handleMediaSelect(file);
        }
    };

    const removeMedia = () => {
        if (mediaPreview) URL.revokeObjectURL(mediaPreview.url);
        setMediaPreview(null);
        if (mediaInputRef.current) mediaInputRef.current.value = "";
    };

    React.useEffect(() => {
        setFormData({ client_name: post?.client_name || "", platform: post?.platform || "instagram", content_type: post?.content_type || "static_post", status: post?.status || "idea", purpose: post?.purpose || undefined, scheduled_date: post?.scheduled_date || date || getRelativeDate(0), caption: post?.caption || "", hook: post?.hook || "", cta: post?.cta || "", notes: post?.notes || "" });
    }, [post, date]);

    // Get platforms for the selected client
    const selectedClient = clients.find((c) => c.business_name === formData.client_name);
    const clientPlatforms = (selectedClient?.platforms || []) as Platform[];
    const availablePlatforms = clientPlatforms.length > 0 ? clientPlatforms : (Object.keys(platformConfig) as Platform[]);

    // Auto-select first available platform if current one isn't available
    React.useEffect(() => {
        if (clientPlatforms.length > 0 && formData.platform && !clientPlatforms.includes(formData.platform)) {
            setFormData((prev) => ({ ...prev, platform: clientPlatforms[0] }));
        }
        if (clientPlatforms.length > 0 && !clientPlatforms.includes(previewPlatform)) {
            setPreviewPlatform(clientPlatforms[0]);
        }
    }, [formData.client_name]); // eslint-disable-line react-hooks/exhaustive-deps

    const clientNames = clients.length > 0
        ? clients.map((c) => c.business_name)
        : ["Glow Studio", "The Garden Kitchen", "FitLife Academy"];

    const PreviewComponent = previewComponents[previewPlatform];

    if (!isOpen) return null;

    const handleSave = () => {
        onSave({ id: post?.id || `post-${Date.now()}`, client_name: formData.client_name || "New Client", platform: formData.platform || "instagram", content_type: formData.content_type || "static_post", status: formData.status || "idea", purpose: formData.purpose, scheduled_date: formData.scheduled_date || getRelativeDate(0), caption: formData.caption, hook: formData.hook, cta: formData.cta, notes: formData.notes });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-surface rounded-2xl border border-border shadow-xl w-[80vw] max-w-6xl mx-4 max-h-[90vh] overflow-hidden animate-scale-in flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-border-light flex-shrink-0">
                    <h2 className="font-display font-semibold text-lg text-text-primary">{isEdit ? "Edit Post" : "New Post"}</h2>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-hover transition-colors"><X className="w-4 h-4 text-text-tertiary" /></button>
                </div>

                {/* Two-Panel Body */}
                <div className="flex-1 overflow-hidden grid grid-cols-5 divide-x divide-border-light">
                    {/* Left Panel — Form (3 cols) */}
                    <div className="col-span-3 overflow-y-auto p-5 space-y-5">
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-text-secondary">Client</label>
                            <select value={formData.client_name} onChange={(e) => setFormData({ ...formData, client_name: e.target.value })} className="flex h-10 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-400/40 focus:border-brand-400 transition-all">
                                <option value="">Select client...</option>
                                {clientNames.map((c) => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <label className="block text-sm font-medium text-text-secondary">Platform</label>
                                <div className="flex flex-wrap gap-1.5">
                                    {availablePlatforms.map((p) => {
                                        const config = platformConfig[p]; if (!config) return null; const Icon = config.icon; return (
                                            <button key={p} onClick={() => setFormData({ ...formData, platform: p })} className={cn("flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all border", formData.platform === p ? "bg-brand-50 text-brand-700 border-brand-300" : "bg-surface border-border text-text-secondary hover:bg-surface-hover")}>
                                                <Icon className="w-3.5 h-3.5" />{config.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-sm font-medium text-text-secondary">Type</label>
                                <select value={formData.content_type} onChange={(e) => setFormData({ ...formData, content_type: e.target.value as ContentType })} className="flex h-10 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-400/40 focus:border-brand-400 transition-all">
                                    {(Object.keys(contentTypeConfig) as ContentType[]).map((t) => <option key={t} value={t}>{contentTypeConfig[t].label}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <label className="block text-sm font-medium text-text-secondary">Status</label>
                                <div className="flex flex-wrap gap-1.5">
                                    {(Object.keys(statusConfig) as ContentStatus[]).map((s) => (
                                        <button key={s} onClick={() => setFormData({ ...formData, status: s })} className={cn("px-2.5 py-1.5 rounded-full text-xs font-medium transition-all border", formData.status === s ? `${statusConfig[s].bg} ${statusConfig[s].colour} border-transparent` : "bg-surface border-border text-text-secondary hover:bg-surface-hover")}>{statusConfig[s].label}</button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-sm font-medium text-text-secondary">Date</label>
                                <input type="date" value={formData.scheduled_date} onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })} className="flex h-10 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-400/40 focus:border-brand-400 transition-all" />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-text-secondary">Purpose</label>
                            <div className="flex gap-1.5">
                                {(Object.keys(purposeConfig) as ContentPurpose[]).map((p) => {
                                    const config = purposeConfig[p]; const Icon = config.icon; return (
                                        <button key={p} onClick={() => setFormData({ ...formData, purpose: formData.purpose === p ? undefined : p })} className={cn("flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all border", formData.purpose === p ? "bg-brand-50 text-brand-700 border-brand-300" : "bg-surface border-border text-text-secondary hover:bg-surface-hover")}>
                                            <Icon className="w-3.5 h-3.5" />{config.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        {/* Media Upload */}
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-text-secondary">Media</label>
                            <input ref={mediaInputRef} type="file" accept="image/*,video/*" onChange={handleMediaChange} className="hidden" />
                            {mediaPreview ? (
                                <div className="relative group/media rounded-xl overflow-hidden border border-border">
                                    {mediaPreview.type === "video" ? (
                                        <video src={mediaPreview.url} className="w-full max-h-[200px] object-cover" muted loop autoPlay playsInline />
                                    ) : (
                                        <img src={mediaPreview.url} alt="Selected media" className="w-full max-h-[200px] object-cover" />
                                    )}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/media:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <button onClick={() => mediaInputRef.current?.click()} className="px-3 py-1.5 rounded-lg bg-white/90 text-xs font-medium text-gray-800 hover:bg-white transition-colors">Replace</button>
                                        <button onClick={removeMedia} className="px-3 py-1.5 rounded-lg bg-red-500/90 text-xs font-medium text-white hover:bg-red-500 transition-colors">Remove</button>
                                    </div>
                                    <div className="absolute top-2 right-2">
                                        <Badge size="sm" className={mediaPreview.type === "video" ? "bg-black/60 text-white" : "bg-black/60 text-white"}>{mediaPreview.type === "video" ? "Video" : "Image"}</Badge>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => mediaInputRef.current?.click()}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={handleMediaDrop}
                                    className="w-full py-8 rounded-xl border-2 border-dashed border-border hover:border-brand-300 bg-surface-secondary/50 hover:bg-brand-50/30 transition-all flex flex-col items-center gap-2 cursor-pointer group"
                                >
                                    <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center border border-border group-hover:border-brand-300 transition-colors">
                                        <Upload className="w-5 h-5 text-text-tertiary group-hover:text-brand-500 transition-colors" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xs font-medium text-text-secondary">Click to upload or drag and drop</p>
                                        <p className="text-[10px] text-text-tertiary mt-0.5">Images or videos</p>
                                    </div>
                                </button>
                            )}
                        </div>
                        {/* Content fields */}
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-text-secondary">Hook</label>
                            <input type="text" value={formData.hook} onChange={(e) => setFormData({ ...formData, hook: e.target.value })} placeholder="Opening hook — grabs attention..." className="flex h-10 w-full rounded-lg border border-border bg-surface px-3.5 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-brand-400/40 focus:border-brand-400 transition-all" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-text-secondary">Caption</label>
                            <textarea value={formData.caption} onChange={(e) => setFormData({ ...formData, caption: e.target.value })} placeholder="Write your caption..." rows={4} className="flex min-h-[100px] w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary resize-y focus:outline-none focus:ring-2 focus:ring-brand-400/40 focus:border-brand-400 transition-all" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-text-secondary">CTA</label>
                            <input type="text" value={formData.cta} onChange={(e) => setFormData({ ...formData, cta: e.target.value })} placeholder="Call to action — what should they do?" className="flex h-10 w-full rounded-lg border border-border bg-surface px-3.5 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-brand-400/40 focus:border-brand-400 transition-all" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-text-secondary">Notes</label>
                            <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="Internal notes..." rows={2} className="flex min-h-[60px] w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary resize-y focus:outline-none focus:ring-2 focus:ring-brand-400/40 focus:border-brand-400 transition-all" />
                        </div>
                    </div>

                    {/* Right Panel — Platform Preview (2 cols) */}
                    <div className="col-span-2 overflow-y-auto bg-surface-secondary/50 flex flex-col">
                        <div className="p-4 border-b border-border-light flex-shrink-0">
                            <h3 className="text-sm font-semibold text-text-primary mb-3">Platform Preview</h3>
                            {/* Platform tabs */}
                            <div className="flex items-center gap-1.5">
                                {availablePlatforms.map((p) => {
                                    const config = platformConfig[p]; if (!config) return null; const Icon = config.icon;
                                    return (
                                        <button key={p} onClick={() => setPreviewPlatform(p)} className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border", previewPlatform === p ? "bg-white text-text-primary border-border shadow-sm" : "bg-transparent border-transparent text-text-tertiary hover:text-text-secondary hover:bg-surface-hover")}>
                                            <Icon className="w-3.5 h-3.5" />{config.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        {/* Preview */}
                        <div className="flex-1 p-5 flex items-start justify-center">
                            <div className={cn("w-full", previewPlatform === "tiktok" ? "max-w-[260px]" : "max-w-[340px]")}>
                                <PreviewComponent
                                    clientName={formData.client_name || "Client Name"}
                                    hook={formData.hook}
                                    caption={formData.caption}
                                    cta={formData.cta}
                                    mediaUrl={mediaPreview?.url}
                                    mediaType={mediaPreview?.type}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-5 border-t border-border-light flex-shrink-0">
                    <div>{isEdit && onDelete && <Button variant="ghost" size="sm" onClick={() => { onDelete(post!.id); onClose(); }} className="text-error hover:text-error hover:bg-rose-50"><Trash2 className="w-4 h-4" />Delete</Button>}</div>
                    <div className="flex gap-2">
                        <Button variant="secondary" size="sm" onClick={onClose}>Cancel</Button>
                        <Button size="sm" onClick={handleSave}>{isEdit ? "Save Changes" : "Create Post"}</Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Post Chip (Calendar Cell) ──────────────────────────
function PostChip({ post, onClick }: { post: ContentPost; onClick: () => void }) {
    const platform = platformConfig[post.platform];
    const status = statusConfig[post.status];
    const PlatformIcon = platform.icon;
    return (
        <button onClick={onClick} className="w-full text-left group flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-surface-hover transition-all border border-transparent hover:border-border-light">
            <div className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", platform.bg)} />
            <PlatformIcon className={cn("w-3 h-3 flex-shrink-0", platform.colour)} />
            <span className="text-[11px] font-medium text-text-primary truncate flex-1">{post.caption || "Untitled"}</span>
            <Badge size="sm" className={cn("hidden group-hover:inline-flex", status.bg, status.colour)}>{status.label}</Badge>
        </button>
    );
}

// ─── Week View Post Card ────────────────────────────────
function WeekPostCard({ post, onClick }: { post: ContentPost; onClick: () => void }) {
    const platform = platformConfig[post.platform];
    const type = contentTypeConfig[post.content_type];
    const status = statusConfig[post.status];
    const PlatformIcon = platform.icon;
    const TypeIcon = type.icon;
    return (
        <button onClick={onClick} className="w-full text-left p-3 rounded-xl bg-surface border border-border hover:shadow-card-hover hover:border-border-strong transition-all group animate-fade-in">
            <div className="flex items-start gap-2.5">
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-white flex-shrink-0", platform.bg)}><PlatformIcon className="w-4 h-4" /></div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-text-primary truncate">{post.client_name}</span>
                        <Badge size="sm" className={cn(status.bg, status.colour)}>{status.label}</Badge>
                    </div>
                    <p className="text-[11px] text-text-secondary mt-0.5 truncate">{post.caption || "Untitled post"}</p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                        <Badge variant="outline" size="sm"><TypeIcon className={cn("w-2.5 h-2.5", type.colour)} />{type.label}</Badge>
                        {post.purpose && <Badge variant="outline" size="sm">{purposeConfig[post.purpose].label}</Badge>}
                    </div>
                </div>
                <Edit3 className="w-3.5 h-3.5 text-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
            </div>
        </button>
    );
}

// ─── Main Page ──────────────────────────────────────────
export default function ContentPage() {
    const today = new Date();
    const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
    const [view, setView] = useState<"month" | "week">("month");
    const [posts, setPosts] = useState<ContentPost[]>(demoPosts);
    const [selectedPlatform, setSelectedPlatform] = useState<Platform | "all">("all");
    const [selectedClient, setSelectedClient] = useState<string>("all");
    const [modalOpen, setModalOpen] = useState(false);
    const [editingPost, setEditingPost] = useState<ContentPost | null>(null);
    const [modalDate, setModalDate] = useState<string | undefined>();
    const [apiClients, setApiClients] = useState<SimpleClient[]>([]);

    // Fetch clients from API for the dropdown and platform filtering
    useEffect(() => {
        fetch("/api/clients")
            .then((res) => res.ok ? res.json() : [])
            .then((data: Array<{ id: string; business_name: string; platforms: string[]; status?: string }>) => {
                setApiClients(data.filter((c) => c.status === "active").map((c) => ({ id: c.id, business_name: c.business_name, platforms: c.platforms || [] })));
            })
            .catch(() => setApiClients([]));
    }, []);

    const postsByDate = useMemo(() => {
        const filtered = posts.filter((p) => {
            if (selectedPlatform !== "all" && p.platform !== selectedPlatform) return false;
            if (selectedClient !== "all" && p.client_name !== selectedClient) return false;
            return true;
        });
        const map: Record<string, ContentPost[]> = {};
        filtered.forEach((p) => { if (!map[p.scheduled_date]) map[p.scheduled_date] = []; map[p.scheduled_date].push(p); });
        return map;
    }, [posts, selectedPlatform, selectedClient]);

    const clients = useMemo(() => {
        const apiNames = apiClients.map((c) => c.business_name);
        const postNames = Array.from(new Set(posts.map((p) => p.client_name)));
        return Array.from(new Set([...apiNames, ...postNames]));
    }, [posts, apiClients]);
    const statusCounts = useMemo(() => { const c: Record<ContentStatus, number> = { idea: 0, planned: 0, drafted: 0, scheduled: 0, live: 0 }; posts.forEach((p) => c[p.status]++); return c; }, [posts]);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const navigatePrev = () => { if (view === "month") setCurrentDate(new Date(year, month - 1, 1)); else { const d = new Date(currentDate); d.setDate(d.getDate() - 7); setCurrentDate(d); } };
    const navigateNext = () => { if (view === "month") setCurrentDate(new Date(year, month + 1, 1)); else { const d = new Date(currentDate); d.setDate(d.getDate() + 7); setCurrentDate(d); } };
    const goToToday = () => setCurrentDate(new Date());

    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const prevMonthDays = getDaysInMonth(year, month - 1);
    const weekDates = getWeekDates(currentDate);

    const handleSavePost = (post: ContentPost) => { setPosts((prev) => { const idx = prev.findIndex((p) => p.id === post.id); if (idx >= 0) { const u = [...prev]; u[idx] = post; return u; } return [...prev, post]; }); };
    const handleDeletePost = (id: string) => setPosts((prev) => prev.filter((p) => p.id !== id));
    const openNewPost = (date?: string) => { setEditingPost(null); setModalDate(date); setModalOpen(true); };
    const openEditPost = (post: ContentPost) => { setEditingPost(post); setModalDate(undefined); setModalOpen(true); };

    return (
        <>
            <Header title="Content Calendar" subtitle={`${posts.length} posts across ${clients.length} clients`}
                actions={<Button size="sm" onClick={() => openNewPost()}><Plus className="w-4 h-4" />New Post</Button>}
            />
            <div className="p-6 space-y-4 animate-fade-in">
                {/* Status Summary */}
                <div className="flex items-center gap-3 flex-wrap">
                    {(Object.keys(statusConfig) as ContentStatus[]).map((s) => (
                        <div key={s} className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full ring-2 ring-white" style={{ backgroundColor: s === "idea" ? "#d6cfC4" : s === "planned" ? "#c4b5fd" : s === "drafted" ? "#f29a5e" : s === "scheduled" ? "#60a5fa" : "#5a815d" }} />
                            <span className="text-xs text-text-secondary"><span className="font-semibold">{statusCounts[s]}</span> {statusConfig[s].label}</span>
                        </div>
                    ))}
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                        <Button variant="secondary" size="icon-sm" onClick={navigatePrev}><ChevronLeft className="w-4 h-4" /></Button>
                        <h2 className="font-display font-semibold text-lg text-text-primary min-w-[180px] text-center">
                            {view === "month" ? `${MONTHS[month]} ${year}` : `${weekDates[0].toLocaleDateString("en-GB", { day: "numeric", month: "short" })} — ${weekDates[6].toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`}
                        </h2>
                        <Button variant="secondary" size="icon-sm" onClick={navigateNext}><ChevronRight className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={goToToday}>Today</Button>
                    </div>
                    <div className="flex items-center gap-2">
                        <select value={selectedClient} onChange={(e) => setSelectedClient(e.target.value)} className="h-8 rounded-lg border border-border bg-surface px-2.5 text-xs text-text-secondary focus:outline-none focus:ring-2 focus:ring-brand-400/40">
                            <option value="all">All Clients</option>
                            {clients.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <div className="flex items-center border border-border rounded-lg overflow-hidden">
                            <button onClick={() => setSelectedPlatform("all")} className={cn("px-2.5 py-1.5 text-xs font-medium transition-all", selectedPlatform === "all" ? "bg-brand-50 text-brand-700" : "bg-surface text-text-tertiary hover:bg-surface-hover")}>All</button>
                            {(Object.keys(platformConfig) as Platform[]).map((p) => {
                                const Icon = platformConfig[p].icon; return (
                                    <button key={p} onClick={() => setSelectedPlatform(selectedPlatform === p ? "all" : p)} className={cn("px-2 py-1.5 transition-all border-l border-border", selectedPlatform === p ? "bg-brand-50 text-brand-700" : "bg-surface text-text-tertiary hover:bg-surface-hover")} title={platformConfig[p].label}><Icon className="w-3.5 h-3.5" /></button>
                                );
                            })}
                        </div>
                        <div className="flex items-center border border-border rounded-lg overflow-hidden">
                            <button onClick={() => setView("month")} className={cn("px-2.5 py-1.5 text-xs font-medium transition-all flex items-center gap-1.5", view === "month" ? "bg-brand-50 text-brand-700" : "bg-surface text-text-tertiary hover:bg-surface-hover")}><LayoutGrid className="w-3.5 h-3.5" />Month</button>
                            <button onClick={() => setView("week")} className={cn("px-2.5 py-1.5 text-xs font-medium transition-all flex items-center gap-1.5 border-l border-border", view === "week" ? "bg-brand-50 text-brand-700" : "bg-surface text-text-tertiary hover:bg-surface-hover")}><List className="w-3.5 h-3.5" />Week</button>
                        </div>
                    </div>
                </div>

                {/* Month View */}
                {view === "month" && (
                    <Card><CardContent className="p-0">
                        <div className="grid grid-cols-7 border-b border-border-light">
                            {WEEKDAYS.map((day) => <div key={day} className="px-2 py-2.5 text-center text-xs font-semibold text-text-tertiary uppercase tracking-wide">{day}</div>)}
                        </div>
                        <div className="grid grid-cols-7">
                            {Array.from({ length: firstDay }, (_, i) => <div key={`prev-${i}`} className="min-h-[110px] p-1.5 border-b border-r border-border-light bg-surface-secondary/50"><span className="text-xs text-text-tertiary/50 font-medium ml-1">{prevMonthDays - firstDay + i + 1}</span></div>)}
                            {Array.from({ length: daysInMonth }, (_, i) => {
                                const dayNum = i + 1;
                                const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
                                const dayPosts = postsByDate[dateStr] || [];
                                const isToday = isSameDay(new Date(year, month, dayNum), today);
                                const isWeekend = ((firstDay + i) % 7 >= 5);
                                return (
                                    <div key={dayNum} className={cn("min-h-[110px] p-1.5 border-b border-r border-border-light group/cell transition-colors", isWeekend && "bg-surface-secondary/30", isToday && "bg-brand-50/30")}>
                                        <div className="flex items-center justify-between mb-1">
                                            <span className={cn("text-xs font-medium ml-1 w-6 h-6 flex items-center justify-center rounded-full", isToday ? "bg-brand-500 text-white" : "text-text-secondary")}>{dayNum}</span>
                                            <button onClick={() => openNewPost(dateStr)} className="w-5 h-5 flex items-center justify-center rounded-md text-text-tertiary opacity-0 group-hover/cell:opacity-100 hover:bg-brand-50 hover:text-brand-600 transition-all"><Plus className="w-3.5 h-3.5" /></button>
                                        </div>
                                        <div className="space-y-0.5">
                                            {dayPosts.slice(0, 3).map((post) => <PostChip key={post.id} post={post} onClick={() => openEditPost(post)} />)}
                                            {dayPosts.length > 3 && <span className="text-[10px] text-text-tertiary ml-2">+{dayPosts.length - 3} more</span>}
                                        </div>
                                    </div>
                                );
                            })}
                            {(() => { const totalCells = firstDay + daysInMonth; const remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7); return Array.from({ length: remaining }, (_, i) => <div key={`next-${i}`} className="min-h-[110px] p-1.5 border-b border-r border-border-light bg-surface-secondary/50"><span className="text-xs text-text-tertiary/50 font-medium ml-1">{i + 1}</span></div>); })()}
                        </div>
                    </CardContent></Card>
                )}

                {/* Week View */}
                {view === "week" && (
                    <div className="grid grid-cols-7 gap-3">
                        {weekDates.map((date, i) => {
                            const dateStr = formatDateKey(date);
                            const dayPosts = postsByDate[dateStr] || [];
                            const isToday = isSameDay(date, today);
                            return (
                                <div key={i} className="space-y-2">
                                    <div className={cn("text-center py-2 rounded-xl", isToday ? "bg-brand-500" : "bg-surface border border-border")}>
                                        <p className={cn("text-[10px] uppercase tracking-wide font-semibold", isToday ? "text-white/70" : "text-text-tertiary")}>{WEEKDAYS[i]}</p>
                                        <p className={cn("text-lg font-display font-bold", isToday ? "text-white" : "text-text-primary")}>{date.getDate()}</p>
                                    </div>
                                    <div className="space-y-2 min-h-[200px]">
                                        {dayPosts.map((post) => <WeekPostCard key={post.id} post={post} onClick={() => openEditPost(post)} />)}
                                        <button onClick={() => openNewPost(dateStr)} className="w-full py-2.5 rounded-xl border-2 border-dashed border-border hover:border-brand-300 text-text-tertiary hover:text-brand-500 transition-all flex items-center justify-center gap-1.5 text-xs font-medium"><Plus className="w-3.5 h-3.5" />Add</button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
            <PostModal post={editingPost} date={modalDate} isOpen={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSavePost} onDelete={handleDeletePost} clients={apiClients} />
        </>
    );
}
