"use client";

import React, { useState, useMemo } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Platform, ContentPurpose } from "@/lib/types";
import {
    Plus, X, Search, Calendar, Clock, CheckCircle2, ArrowUpRight,
    Target, Users, Sparkles, Award, Megaphone, TrendingUp,
    Instagram, Facebook, Linkedin, Music2, Trash2, BarChart3, Layers,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────
interface Campaign {
    id: string; name: string; client_name: string; description?: string;
    start_date: string; end_date: string;
    status: "active" | "draft" | "completed" | "paused";
    strategy_tags: ContentPurpose[]; platforms: Platform[];
    post_count: number; completed_posts: number; colour: string;
}

const statusConfig = {
    active: { label: "Active", colour: "text-sage-600", bg: "bg-sage-50", dot: "bg-sage-500" },
    draft: { label: "Draft", colour: "text-warm-600", bg: "bg-warm-100", dot: "bg-warm-400" },
    completed: { label: "Completed", colour: "text-brand-600", bg: "bg-brand-50", dot: "bg-brand-500" },
    paused: { label: "Paused", colour: "text-lavender-500", bg: "bg-lavender-50", dot: "bg-lavender-400" },
};

const purposeConfig: Record<ContentPurpose, { label: string; icon: React.ElementType; colour: string }> = {
    educational: { label: "Educational", icon: Sparkles, colour: "text-lavender-500" },
    sales: { label: "Sales", icon: Target, colour: "text-brand-600" },
    community: { label: "Community", icon: Users, colour: "text-sage-500" },
    authority: { label: "Authority", icon: Award, colour: "text-rose-500" },
};

const platformIcons: Record<Platform, React.ElementType> = { instagram: Instagram, facebook: Facebook, tiktok: Music2, linkedin: Linkedin };
const campaignColours = ["from-brand-400 to-rose-400", "from-lavender-400 to-brand-400", "from-sage-400 to-cyan-400", "from-rose-400 to-pink-400", "from-blue-400 to-lavender-400", "from-amber-400 to-brand-400"];

function getRelativeDate(d: number): string { const dt = new Date(); dt.setDate(dt.getDate() + d); return dt.toISOString().split("T")[0]; }

const demoCampaigns: Campaign[] = [
    { id: "1", name: "Spring Glow-Up", client_name: "Glow Studio", description: "6-week campaign building excitement for spring beauty treatments. Focus on brow lamination, facials, and seasonal offers.", start_date: getRelativeDate(-7), end_date: getRelativeDate(35), status: "active", strategy_tags: ["sales", "community"], platforms: ["instagram", "tiktok"], post_count: 18, completed_posts: 6, colour: campaignColours[0] },
    { id: "2", name: "Sunday Roast Series", client_name: "The Garden Kitchen", description: "Ongoing weekly content showcasing the restaurant\u2019s legendary Sunday roasts with behind-the-scenes and customer stories.", start_date: getRelativeDate(-14), end_date: getRelativeDate(14), status: "active", strategy_tags: ["community", "sales"], platforms: ["instagram", "facebook"], post_count: 8, completed_posts: 4, colour: campaignColours[2] },
    { id: "3", name: "Corporate Wellness Programme", client_name: "FitLife Academy", description: "Authority-building campaign targeting HR managers and business owners with educational content about workplace fitness.", start_date: getRelativeDate(7), end_date: getRelativeDate(49), status: "draft", strategy_tags: ["authority", "educational"], platforms: ["linkedin", "instagram"], post_count: 12, completed_posts: 0, colour: campaignColours[1] },
    { id: "4", name: "January Detox Challenge", client_name: "FitLife Academy", description: "Completed 4-week fitness challenge with daily tips, workout videos, and community engagement.", start_date: "2026-01-06", end_date: "2026-02-02", status: "completed", strategy_tags: ["community", "educational"], platforms: ["instagram", "tiktok", "facebook"], post_count: 24, completed_posts: 24, colour: campaignColours[3] },
];

// ─── Campaign Modal ─────────────────────────────────────
function CampaignModal({ campaign, isOpen, onClose, onSave, onDelete }: { campaign?: Campaign | null; isOpen: boolean; onClose: () => void; onSave: (c: Campaign) => void; onDelete?: (id: string) => void }) {
    const isEdit = !!campaign;
    const [formData, setFormData] = useState<Partial<Campaign>>({ name: campaign?.name || "", client_name: campaign?.client_name || "", description: campaign?.description || "", start_date: campaign?.start_date || getRelativeDate(0), end_date: campaign?.end_date || getRelativeDate(28), status: campaign?.status || "draft", strategy_tags: campaign?.strategy_tags || [], platforms: campaign?.platforms || [] });

    React.useEffect(() => { setFormData({ name: campaign?.name || "", client_name: campaign?.client_name || "", description: campaign?.description || "", start_date: campaign?.start_date || getRelativeDate(0), end_date: campaign?.end_date || getRelativeDate(28), status: campaign?.status || "draft", strategy_tags: campaign?.strategy_tags || [], platforms: campaign?.platforms || [] }); }, [campaign]);

    if (!isOpen) return null;

    const toggleTag = (tag: ContentPurpose) => { const tags = formData.strategy_tags || []; setFormData({ ...formData, strategy_tags: tags.includes(tag) ? tags.filter((t) => t !== tag) : [...tags, tag] }); };
    const togglePlatform = (p: Platform) => { const platforms = formData.platforms || []; setFormData({ ...formData, platforms: platforms.includes(p) ? platforms.filter((x) => x !== p) : [...platforms, p] }); };

    const handleSave = () => { const ci = Math.floor(Math.random() * campaignColours.length); onSave({ id: campaign?.id || `campaign-${Date.now()}`, name: formData.name || "Untitled Campaign", client_name: formData.client_name || "New Client", description: formData.description, start_date: formData.start_date || getRelativeDate(0), end_date: formData.end_date || getRelativeDate(28), status: formData.status || "draft", strategy_tags: formData.strategy_tags || [], platforms: formData.platforms || [], post_count: campaign?.post_count || 0, completed_posts: campaign?.completed_posts || 0, colour: campaign?.colour || campaignColours[ci] }); onClose(); };
    const clients = ["Glow Studio", "The Garden Kitchen", "FitLife Academy"];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-surface rounded-2xl border border-border shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto animate-scale-in">
                <div className="flex items-center justify-between p-5 border-b border-border-light">
                    <h2 className="font-display font-semibold text-lg text-text-primary">{isEdit ? "Edit Campaign" : "New Campaign"}</h2>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-hover transition-colors"><X className="w-4 h-4 text-text-tertiary" /></button>
                </div>
                <div className="p-5 space-y-5">
                    <div className="space-y-1.5"><label className="block text-sm font-medium text-text-secondary">Campaign Name</label><input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Spring Glow-Up" className="flex h-10 w-full rounded-lg border border-border bg-surface px-3.5 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-brand-400/40 focus:border-brand-400 transition-all" /></div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5"><label className="block text-sm font-medium text-text-secondary">Client</label><select value={formData.client_name} onChange={(e) => setFormData({ ...formData, client_name: e.target.value })} className="flex h-10 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-400/40 focus:border-brand-400 transition-all"><option value="">Select client...</option>{clients.map((c) => <option key={c} value={c}>{c}</option>)}</select></div>
                        <div className="space-y-1.5"><label className="block text-sm font-medium text-text-secondary">Status</label><div className="flex flex-wrap gap-1.5">{(Object.keys(statusConfig) as Array<keyof typeof statusConfig>).map((s) => (<button key={s} onClick={() => setFormData({ ...formData, status: s })} className={cn("px-2.5 py-1.5 rounded-full text-xs font-medium transition-all border", formData.status === s ? `${statusConfig[s].bg} ${statusConfig[s].colour} border-transparent` : "bg-surface border-border text-text-secondary hover:bg-surface-hover")}>{statusConfig[s].label}</button>))}</div></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5"><label className="block text-sm font-medium text-text-secondary">Start Date</label><input type="date" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} className="flex h-10 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-400/40 focus:border-brand-400 transition-all" /></div>
                        <div className="space-y-1.5"><label className="block text-sm font-medium text-text-secondary">End Date</label><input type="date" value={formData.end_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} className="flex h-10 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-400/40 focus:border-brand-400 transition-all" /></div>
                    </div>
                    <div className="space-y-1.5"><label className="block text-sm font-medium text-text-secondary">Description</label><textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Describe the campaign goals, key messages, and approach..." rows={3} className="flex min-h-[80px] w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary resize-y focus:outline-none focus:ring-2 focus:ring-brand-400/40 focus:border-brand-400 transition-all" /></div>
                    <div className="space-y-1.5"><label className="block text-sm font-medium text-text-secondary">Strategy Tags</label><div className="flex gap-1.5">{(Object.keys(purposeConfig) as ContentPurpose[]).map((p) => { const config = purposeConfig[p]; const Icon = config.icon; return (<button key={p} onClick={() => toggleTag(p)} className={cn("flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all border", formData.strategy_tags?.includes(p) ? "bg-brand-50 text-brand-700 border-brand-300" : "bg-surface border-border text-text-secondary hover:bg-surface-hover")}><Icon className="w-3.5 h-3.5" />{config.label}</button>); })}</div></div>
                    <div className="space-y-1.5"><label className="block text-sm font-medium text-text-secondary">Platforms</label><div className="flex gap-1.5">{(Object.keys(platformIcons) as Platform[]).map((p) => { const Icon = platformIcons[p]; return (<button key={p} onClick={() => togglePlatform(p)} className={cn("flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all border capitalize", formData.platforms?.includes(p) ? "bg-brand-50 text-brand-700 border-brand-300" : "bg-surface border-border text-text-secondary hover:bg-surface-hover")}><Icon className="w-3.5 h-3.5" />{p}</button>); })}</div></div>
                </div>
                <div className="flex items-center justify-between p-5 border-t border-border-light">
                    <div>{isEdit && onDelete && <Button variant="ghost" size="sm" onClick={() => { onDelete(campaign!.id); onClose(); }} className="text-error hover:text-error hover:bg-rose-50"><Trash2 className="w-4 h-4" />Delete</Button>}</div>
                    <div className="flex gap-2"><Button variant="secondary" size="sm" onClick={onClose}>Cancel</Button><Button size="sm" onClick={handleSave}>{isEdit ? "Save Changes" : "Create Campaign"}</Button></div>
                </div>
            </div>
        </div>
    );
}

// ─── Campaign Card ──────────────────────────────────────
function CampaignCard({ campaign, onClick }: { campaign: Campaign; onClick: () => void }) {
    const status = statusConfig[campaign.status];
    const progress = campaign.post_count > 0 ? Math.round((campaign.completed_posts / campaign.post_count) * 100) : 0;
    const endDate = new Date(campaign.end_date);
    const startDate = new Date(campaign.start_date);
    const today = new Date();
    const daysLeft = Math.max(0, Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));

    return (
        <Card hover className="group animate-fade-in overflow-hidden" onClick={onClick}>
            <div className={cn("h-2 bg-gradient-to-r", campaign.colour)} />
            <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1"><h3 className="font-semibold text-sm text-text-primary truncate">{campaign.name}</h3><Badge size="sm" className={cn(status.bg, status.colour)}>{status.label}</Badge></div>
                        <p className="text-xs text-text-tertiary">{campaign.client_name}</p>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                </div>
                {campaign.description && <p className="text-xs text-text-secondary line-clamp-2 mb-3">{campaign.description}</p>}
                <div className="mb-3">
                    <div className="flex items-center justify-between mb-1.5"><span className="text-[10px] font-semibold text-text-secondary">{campaign.completed_posts}/{campaign.post_count} posts</span><span className="text-[10px] font-semibold text-text-tertiary">{progress}%</span></div>
                    <div className="h-1.5 bg-surface-tertiary rounded-full overflow-hidden"><div className={cn("h-full rounded-full bg-gradient-to-r transition-all duration-500", campaign.colour)} style={{ width: `${progress}%` }} /></div>
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">{campaign.platforms.map((p) => { const Icon = platformIcons[p]; return <Icon key={p} className="w-3.5 h-3.5 text-text-tertiary" />; })}</div>
                    <div className="flex items-center gap-3">{campaign.strategy_tags.map((tag) => <span key={tag} className={cn("text-[10px] font-medium", purposeConfig[tag].colour)}>{purposeConfig[tag].label}</span>)}</div>
                </div>
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border-light">
                    <Calendar className="w-3 h-3 text-text-tertiary" />
                    <span className="text-[10px] text-text-tertiary">{startDate.toLocaleDateString("en-GB", { day: "numeric", month: "short" })} — {endDate.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                    {campaign.status === "active" && <Badge variant="outline" size="sm" className="ml-auto"><Clock className="w-2.5 h-2.5" />{daysLeft}d left</Badge>}
                </div>
            </CardContent>
        </Card>
    );
}

// ─── Main Page ──────────────────────────────────────────
export default function CampaignsPage() {
    const [campaigns, setCampaigns] = useState<Campaign[]>(demoCampaigns);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [modalOpen, setModalOpen] = useState(false);
    const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);

    const filteredCampaigns = useMemo(() => campaigns.filter((c) => { const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.client_name.toLowerCase().includes(searchQuery.toLowerCase()); const matchesStatus = statusFilter === "all" || c.status === statusFilter; return matchesSearch && matchesStatus; }), [campaigns, searchQuery, statusFilter]);

    const stats = useMemo(() => ({ total: campaigns.length, active: campaigns.filter((c) => c.status === "active").length, totalPosts: campaigns.reduce((sum, c) => sum + c.post_count, 0), completedPosts: campaigns.reduce((sum, c) => sum + c.completed_posts, 0) }), [campaigns]);

    const handleSave = (campaign: Campaign) => { setCampaigns((prev) => { const idx = prev.findIndex((c) => c.id === campaign.id); if (idx >= 0) { const u = [...prev]; u[idx] = campaign; return u; } return [...prev, campaign]; }); };
    const handleDelete = (id: string) => setCampaigns((prev) => prev.filter((c) => c.id !== id));

    return (
        <>
            <Header title="Campaigns" subtitle={`${stats.active} active campaigns`} actions={<Button size="sm" onClick={() => { setEditingCampaign(null); setModalOpen(true); }}><Plus className="w-4 h-4" />New Campaign</Button>} />
            <div className="p-6 space-y-5 animate-fade-in">
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2.5 rounded-xl bg-brand-50"><Megaphone className="w-4 h-4 text-brand-500" /></div><div><p className="text-xl font-display font-bold text-text-primary">{stats.total}</p><p className="text-[10px] text-text-tertiary font-medium">Total Campaigns</p></div></CardContent></Card>
                    <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2.5 rounded-xl bg-sage-50"><TrendingUp className="w-4 h-4 text-sage-500" /></div><div><p className="text-xl font-display font-bold text-text-primary">{stats.active}</p><p className="text-[10px] text-text-tertiary font-medium">Active</p></div></CardContent></Card>
                    <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2.5 rounded-xl bg-lavender-50"><Layers className="w-4 h-4 text-lavender-500" /></div><div><p className="text-xl font-display font-bold text-text-primary">{stats.totalPosts}</p><p className="text-[10px] text-text-tertiary font-medium">Total Posts</p></div></CardContent></Card>
                    <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2.5 rounded-xl bg-rose-50"><BarChart3 className="w-4 h-4 text-rose-500" /></div><div><p className="text-xl font-display font-bold text-text-primary">{stats.totalPosts > 0 ? Math.round((stats.completedPosts / stats.totalPosts) * 100) : 0}%</p><p className="text-[10px] text-text-tertiary font-medium">Completion</p></div></CardContent></Card>
                </div>
                {/* Filters */}
                <div className="flex items-center gap-3 flex-wrap">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                        <input type="text" placeholder="Search campaigns..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="h-9 w-full rounded-lg border border-border bg-surface pl-9 pr-3 text-sm placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-brand-400/40 focus:border-brand-400 transition-all" />
                    </div>
                    <div className="flex items-center gap-1.5">
                        <button onClick={() => setStatusFilter("all")} className={cn("px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap", statusFilter === "all" ? "bg-text-primary text-white" : "bg-surface border border-border text-text-secondary hover:bg-surface-hover")}>All</button>
                        {(Object.keys(statusConfig) as Array<keyof typeof statusConfig>).map((s) => (<button key={s} onClick={() => setStatusFilter(s)} className={cn("px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap", statusFilter === s ? `${statusConfig[s].bg} ${statusConfig[s].colour}` : "bg-surface border border-border text-text-secondary hover:bg-surface-hover")}>{statusConfig[s].label}</button>))}
                    </div>
                </div>
                {/* Grid */}
                {filteredCampaigns.length === 0 ? (
                    <Card><CardContent className="py-16 text-center"><div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-50 mb-4"><Megaphone className="w-7 h-7 text-brand-500" /></div><h3 className="font-display font-semibold text-text-primary mb-1">No campaigns found</h3><p className="text-sm text-text-tertiary max-w-sm mx-auto mb-4">{searchQuery ? "No campaigns match your search." : "Create your first campaign to start grouping content by strategy."}</p><Button size="sm" onClick={() => { setEditingCampaign(null); setModalOpen(true); }}><Plus className="w-4 h-4" />Create Campaign</Button></CardContent></Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {filteredCampaigns.map((c, i) => <div key={c.id} style={{ animationDelay: `${i * 50}ms` }}><CampaignCard campaign={c} onClick={() => { setEditingCampaign(c); setModalOpen(true); }} /></div>)}
                        <Card hover className="border-dashed border-2 border-border hover:border-brand-300 group cursor-pointer" onClick={() => { setEditingCampaign(null); setModalOpen(true); }}><CardContent className="p-5 flex items-center justify-center min-h-[200px]"><div className="text-center"><div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-brand-50 group-hover:bg-brand-100 transition-colors mb-2"><Plus className="w-5 h-5 text-brand-500" /></div><p className="text-sm font-medium text-text-secondary group-hover:text-brand-600 transition-colors">New Campaign</p></div></CardContent></Card>
                    </div>
                )}
            </div>
            <CampaignModal campaign={editingCampaign} isOpen={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSave} onDelete={handleDelete} />
        </>
    );
}
