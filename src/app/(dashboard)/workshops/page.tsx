"use client";

import React, { useState, useMemo } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import {
    Plus, X, Search, GraduationCap, Calendar, MapPin, Globe, Users,
    Clock, Trash2, ArrowUpRight, CheckCircle2, Star, TrendingUp,
    UserCheck, MessageSquare, Wifi,
} from "lucide-react";

// ─── Config ─────────────────────────────────────────────
type WorkshopType = "masterclass" | "tiktok_workshop" | "school_education" | "business_training" | "creative_session";
type WorkshopStatus = "upcoming" | "live" | "completed" | "cancelled" | "draft";

const typeConfig: Record<WorkshopType, { label: string; colour: string; bg: string; icon: React.ElementType }> = {
    masterclass: { label: "Masterclass", colour: "text-brand-600", bg: "bg-brand-50", icon: Star },
    tiktok_workshop: { label: "TikTok Workshop", colour: "text-pink-600", bg: "bg-pink-50", icon: TrendingUp },
    school_education: { label: "School/Parent Ed", colour: "text-sage-600", bg: "bg-sage-50", icon: GraduationCap },
    business_training: { label: "Business Training", colour: "text-blue-600", bg: "bg-blue-50", icon: Users },
    creative_session: { label: "Creative Session", colour: "text-lavender-500", bg: "bg-lavender-50", icon: Star },
};

const statusConfig: Record<WorkshopStatus, { label: string; colour: string; bg: string; dot: string }> = {
    upcoming: { label: "Upcoming", colour: "text-brand-600", bg: "bg-brand-50", dot: "bg-brand-400" },
    live: { label: "Live Now", colour: "text-sage-600", bg: "bg-sage-50", dot: "bg-sage-500" },
    completed: { label: "Completed", colour: "text-text-secondary", bg: "bg-surface-tertiary", dot: "bg-text-tertiary" },
    cancelled: { label: "Cancelled", colour: "text-rose-600", bg: "bg-rose-50", dot: "bg-rose-400" },
    draft: { label: "Draft", colour: "text-warm-600", bg: "bg-warm-100", dot: "bg-warm-400" },
};

interface Workshop {
    id: string; title: string; type: WorkshopType; status: WorkshopStatus;
    description?: string; event_date: string; event_time: string;
    location?: string; is_online: boolean;
    max_attendees: number; registered: number; attended: number;
    price: number; feedback_score?: number;
    gradient: string;
}

function getRelativeDate(d: number): string { const dt = new Date(); dt.setDate(dt.getDate() + d); return dt.toISOString().split("T")[0]; }

const gradients = ["from-brand-400 to-rose-400", "from-lavender-400 to-brand-400", "from-sage-400 to-cyan-400", "from-rose-400 to-pink-400", "from-blue-400 to-lavender-400"];

const demoWorkshops: Workshop[] = [
    { id: "1", title: "Reels That Convert", type: "masterclass", status: "upcoming", description: "Learn how to create Instagram Reels that drive real sales. Covers hooks, editing, trending audio, and CTAs.", event_date: getRelativeDate(10), event_time: "10:00", location: "The Garden Kitchen, Leeds", is_online: false, max_attendees: 20, registered: 14, attended: 0, price: 79, gradient: gradients[0] },
    { id: "2", title: "TikTok for Small Business", type: "tiktok_workshop", status: "upcoming", description: "Get your business on TikTok in 90 minutes. From setting up to your first viral video.", event_date: getRelativeDate(18), event_time: "14:00", is_online: true, max_attendees: 50, registered: 32, attended: 0, price: 39, gradient: gradients[1] },
    { id: "3", title: "Social Media Safety for Parents", type: "school_education", status: "completed", description: "Interactive session for parents on keeping children safe online, understanding algorithms, and setting boundaries.", event_date: getRelativeDate(-14), event_time: "18:30", location: "Roundhay School, Leeds", is_online: false, max_attendees: 40, registered: 38, attended: 35, price: 0, feedback_score: 4.8, gradient: gradients[2] },
    { id: "4", title: "Content Strategy Sprint", type: "business_training", status: "completed", description: "Half-day intensive: build a 90-day content strategy for your business. Includes workbook and templates.", event_date: getRelativeDate(-30), event_time: "09:00", location: "Platform, Leeds", is_online: false, max_attendees: 15, registered: 15, attended: 14, price: 129, feedback_score: 4.9, gradient: gradients[3] },
    { id: "5", title: "Brand Photography Basics", type: "creative_session", status: "draft", description: "Phone photography workshop — learn lighting, composition, and editing for stunning brand photos.", event_date: getRelativeDate(25), event_time: "11:00", is_online: false, max_attendees: 12, registered: 0, attended: 0, price: 59, gradient: gradients[4] },
];

// ─── Workshop Modal ─────────────────────────────────────
function WorkshopModal({ workshop, isOpen, onClose, onSave, onDelete }: { workshop?: Workshop | null; isOpen: boolean; onClose: () => void; onSave: (w: Workshop) => void; onDelete?: (id: string) => void }) {
    const isEdit = !!workshop;
    const [f, setF] = useState<Partial<Workshop>>({ title: workshop?.title || "", type: workshop?.type || "masterclass", status: workshop?.status || "draft", description: workshop?.description || "", event_date: workshop?.event_date || getRelativeDate(14), event_time: workshop?.event_time || "10:00", location: workshop?.location || "", is_online: workshop?.is_online ?? false, max_attendees: workshop?.max_attendees || 20, price: workshop?.price || 0 });

    React.useEffect(() => { setF({ title: workshop?.title || "", type: workshop?.type || "masterclass", status: workshop?.status || "draft", description: workshop?.description || "", event_date: workshop?.event_date || getRelativeDate(14), event_time: workshop?.event_time || "10:00", location: workshop?.location || "", is_online: workshop?.is_online ?? false, max_attendees: workshop?.max_attendees || 20, price: workshop?.price || 0 }); }, [workshop]);

    if (!isOpen) return null;

    const handleSave = () => { const gi = Math.floor(Math.random() * gradients.length); onSave({ id: workshop?.id || `ws-${Date.now()}`, title: f.title || "Untitled Workshop", type: f.type || "masterclass", status: f.status || "draft", description: f.description, event_date: f.event_date || getRelativeDate(14), event_time: f.event_time || "10:00", location: f.location, is_online: f.is_online ?? false, max_attendees: f.max_attendees || 20, registered: workshop?.registered || 0, attended: workshop?.attended || 0, price: f.price || 0, feedback_score: workshop?.feedback_score, gradient: workshop?.gradient || gradients[gi] }); onClose(); };
    const inputCls = "flex h-10 w-full rounded-lg border border-border bg-surface px-3.5 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-brand-400/40 focus:border-brand-400 transition-all";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-surface rounded-2xl border border-border shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto animate-scale-in">
                <div className="flex items-center justify-between p-5 border-b border-border-light"><h2 className="font-display font-semibold text-lg text-text-primary">{isEdit ? "Edit Workshop" : "New Workshop"}</h2><button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-hover transition-colors"><X className="w-4 h-4 text-text-tertiary" /></button></div>
                <div className="p-5 space-y-5">
                    <div className="space-y-1.5"><label className="block text-sm font-medium text-text-secondary">Title</label><input type="text" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="e.g. Reels That Convert" className={inputCls} /></div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5"><label className="block text-sm font-medium text-text-secondary">Type</label><div className="flex flex-wrap gap-1.5">{(Object.keys(typeConfig) as WorkshopType[]).map((t) => (<button key={t} onClick={() => setF({ ...f, type: t })} className={cn("px-2 py-1 rounded-full text-[10px] font-medium transition-all border", f.type === t ? `${typeConfig[t].bg} ${typeConfig[t].colour} border-transparent` : "bg-surface border-border text-text-secondary hover:bg-surface-hover")}>{typeConfig[t].label}</button>))}</div></div>
                        <div className="space-y-1.5"><label className="block text-sm font-medium text-text-secondary">Status</label><div className="flex flex-wrap gap-1.5">{(Object.keys(statusConfig) as WorkshopStatus[]).map((s) => (<button key={s} onClick={() => setF({ ...f, status: s })} className={cn("px-2.5 py-1.5 rounded-full text-xs font-medium transition-all border", f.status === s ? `${statusConfig[s].bg} ${statusConfig[s].colour} border-transparent` : "bg-surface border-border text-text-secondary hover:bg-surface-hover")}>{statusConfig[s].label}</button>))}</div></div>
                    </div>
                    <div className="space-y-1.5"><label className="block text-sm font-medium text-text-secondary">Description</label><textarea value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} placeholder="Describe this workshop..." rows={2} className="flex min-h-[60px] w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary resize-y focus:outline-none focus:ring-2 focus:ring-brand-400/40 focus:border-brand-400 transition-all" /></div>
                    <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1.5"><label className="block text-sm font-medium text-text-secondary">Date</label><input type="date" value={f.event_date} onChange={(e) => setF({ ...f, event_date: e.target.value })} className={inputCls} /></div>
                        <div className="space-y-1.5"><label className="block text-sm font-medium text-text-secondary">Time</label><input type="time" value={f.event_time} onChange={(e) => setF({ ...f, event_time: e.target.value })} className={inputCls} /></div>
                        <div className="space-y-1.5"><label className="block text-sm font-medium text-text-secondary">Max Attendees</label><input type="number" value={f.max_attendees} onChange={(e) => setF({ ...f, max_attendees: Number(e.target.value) })} className={inputCls} /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5"><label className="block text-sm font-medium text-text-secondary">Location</label><input type="text" value={f.location} onChange={(e) => setF({ ...f, location: e.target.value })} placeholder="e.g. The Garden Kitchen, Leeds" className={inputCls} /></div>
                        <div className="space-y-1.5"><label className="block text-sm font-medium text-text-secondary">Price (£)</label><input type="number" value={f.price} onChange={(e) => setF({ ...f, price: Number(e.target.value) })} className={inputCls} /></div>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={f.is_online} onChange={(e) => setF({ ...f, is_online: e.target.checked })} className="rounded border-border text-brand-500 focus:ring-brand-400" /><span className="text-sm text-text-secondary">Online workshop (Zoom / Google Meet)</span></label>
                </div>
                <div className="flex items-center justify-between p-5 border-t border-border-light">
                    <div>{isEdit && onDelete && <Button variant="ghost" size="sm" onClick={() => { onDelete(workshop!.id); onClose(); }} className="text-error hover:text-error hover:bg-rose-50"><Trash2 className="w-4 h-4" />Delete</Button>}</div>
                    <div className="flex gap-2"><Button variant="secondary" size="sm" onClick={onClose}>Cancel</Button><Button size="sm" onClick={handleSave}>{isEdit ? "Save Changes" : "Create Workshop"}</Button></div>
                </div>
            </div>
        </div>
    );
}

// ─── Main Page ──────────────────────────────────────────
export default function WorkshopsPage() {
    const [workshops, setWorkshops] = useState<Workshop[]>(demoWorkshops);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [modalOpen, setModalOpen] = useState(false);
    const [editingWorkshop, setEditingWorkshop] = useState<Workshop | null>(null);

    const filtered = useMemo(() => workshops.filter((w) => { const q = searchQuery.toLowerCase(); return (w.title.toLowerCase().includes(q) || (w.description || "").toLowerCase().includes(q)) && (statusFilter === "all" || w.status === statusFilter); }), [workshops, searchQuery, statusFilter]);

    const stats = useMemo(() => ({
        total: workshops.length,
        upcoming: workshops.filter((w) => w.status === "upcoming").length,
        totalRegistered: workshops.reduce((s, w) => s + w.registered, 0),
        revenue: workshops.reduce((s, w) => s + (w.price * w.registered), 0),
    }), [workshops]);

    const handleSave = (w: Workshop) => { setWorkshops((prev) => { const idx = prev.findIndex((x) => x.id === w.id); if (idx >= 0) { const u = [...prev]; u[idx] = w; return u; } return [...prev, w]; }); };
    const handleDelete = (id: string) => setWorkshops((prev) => prev.filter((w) => w.id !== id));

    return (
        <>
            <Header title="Workshops" subtitle={`${stats.upcoming} upcoming workshops`} actions={<Button size="sm" onClick={() => { setEditingWorkshop(null); setModalOpen(true); }}><Plus className="w-4 h-4" />New Workshop</Button>} />
            <div className="p-6 space-y-5 animate-fade-in">
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2.5 rounded-xl bg-brand-50"><GraduationCap className="w-4 h-4 text-brand-500" /></div><div><p className="text-xl font-display font-bold text-text-primary">{stats.total}</p><p className="text-[10px] text-text-tertiary font-medium">Total Workshops</p></div></CardContent></Card>
                    <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2.5 rounded-xl bg-sage-50"><Calendar className="w-4 h-4 text-sage-500" /></div><div><p className="text-xl font-display font-bold text-text-primary">{stats.upcoming}</p><p className="text-[10px] text-text-tertiary font-medium">Upcoming</p></div></CardContent></Card>
                    <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2.5 rounded-xl bg-lavender-50"><Users className="w-4 h-4 text-lavender-500" /></div><div><p className="text-xl font-display font-bold text-text-primary">{stats.totalRegistered}</p><p className="text-[10px] text-text-tertiary font-medium">Registrations</p></div></CardContent></Card>
                    <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2.5 rounded-xl bg-rose-50"><TrendingUp className="w-4 h-4 text-rose-500" /></div><div><p className="text-xl font-display font-bold text-text-primary">{formatCurrency(stats.revenue)}</p><p className="text-[10px] text-text-tertiary font-medium">Revenue</p></div></CardContent></Card>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-3 flex-wrap">
                    <div className="relative flex-1 max-w-sm"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" /><input type="text" placeholder="Search workshops..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="h-9 w-full rounded-lg border border-border bg-surface pl-9 pr-3 text-sm placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-brand-400/40 focus:border-brand-400 transition-all" /></div>
                    <div className="flex items-center gap-1.5">
                        <button onClick={() => setStatusFilter("all")} className={cn("px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap", statusFilter === "all" ? "bg-text-primary text-white" : "bg-surface border border-border text-text-secondary hover:bg-surface-hover")}>All</button>
                        {(Object.keys(statusConfig) as WorkshopStatus[]).map((s) => (<button key={s} onClick={() => setStatusFilter(s)} className={cn("px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap", statusFilter === s ? `${statusConfig[s].bg} ${statusConfig[s].colour}` : "bg-surface border border-border text-text-secondary hover:bg-surface-hover")}>{statusConfig[s].label}</button>))}
                    </div>
                </div>

                {/* Workshop Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {filtered.map((ws, i) => {
                        const type = typeConfig[ws.type]; const status = statusConfig[ws.status]; const TypeIcon = type.icon;
                        const spotsLeft = ws.max_attendees - ws.registered; const isFull = spotsLeft <= 0;
                        const fillPercent = Math.min(100, Math.round((ws.registered / ws.max_attendees) * 100));
                        return (
                            <Card key={ws.id} hover className="group animate-fade-in overflow-hidden" onClick={() => { setEditingWorkshop(ws); setModalOpen(true); }} style={{ animationDelay: `${i * 50}ms` }}>
                                <div className={cn("h-3 bg-gradient-to-r", ws.gradient)} />
                                <CardContent className="p-5">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <Badge size="sm" className={cn(type.bg, type.colour)}><TypeIcon className="w-2.5 h-2.5" />{type.label}</Badge>
                                            <Badge size="sm" className={cn(status.bg, status.colour)}>{status.label}</Badge>
                                        </div>
                                        <ArrowUpRight className="w-4 h-4 text-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>

                                    <h3 className="text-sm font-semibold text-text-primary mb-1">{ws.title}</h3>
                                    {ws.description && <p className="text-xs text-text-secondary line-clamp-2 mb-3">{ws.description}</p>}

                                    <div className="space-y-1.5 mb-3 text-[11px] text-text-secondary">
                                        <div className="flex items-center gap-1.5"><Calendar className="w-3 h-3 text-text-tertiary" />{formatDate(ws.event_date)} at {ws.event_time}</div>
                                        <div className="flex items-center gap-1.5">{ws.is_online ? <Wifi className="w-3 h-3 text-text-tertiary" /> : <MapPin className="w-3 h-3 text-text-tertiary" />}{ws.is_online ? "Online" : ws.location || "TBC"}</div>
                                        <div className="flex items-center gap-1.5"><Users className="w-3 h-3 text-text-tertiary" />{ws.registered}/{ws.max_attendees} registered {isFull && <Badge size="sm" className="bg-rose-50 text-rose-600">Full</Badge>}</div>
                                    </div>

                                    {/* Registration bar */}
                                    <div className="mb-3">
                                        <div className="h-1.5 bg-surface-tertiary rounded-full overflow-hidden">
                                            <div className={cn("h-full rounded-full bg-gradient-to-r transition-all duration-500", ws.gradient)} style={{ width: `${fillPercent}%` }} />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-3 border-t border-border-light text-[10px] text-text-tertiary">
                                        <span className="font-semibold text-text-primary">{ws.price > 0 ? formatCurrency(ws.price) : "Free"}</span>
                                        {ws.attended > 0 && <span className="flex items-center gap-1"><UserCheck className="w-3 h-3" />{ws.attended} attended</span>}
                                        {ws.feedback_score && <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-400" />{ws.feedback_score}</span>}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                    <Card hover className="border-dashed border-2 border-border hover:border-sage-300 group cursor-pointer" onClick={() => { setEditingWorkshop(null); setModalOpen(true); }}>
                        <CardContent className="p-5 flex items-center justify-center min-h-[300px]"><div className="text-center"><div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-sage-50 group-hover:bg-sage-100 transition-colors mb-2"><Plus className="w-5 h-5 text-sage-500" /></div><p className="text-sm font-medium text-text-secondary group-hover:text-sage-600 transition-colors">New Workshop</p></div></CardContent>
                    </Card>
                </div>
            </div>
            <WorkshopModal workshop={editingWorkshop} isOpen={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSave} onDelete={handleDelete} />
        </>
    );
}
