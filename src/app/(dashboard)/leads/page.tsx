"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, formatCurrency } from "@/lib/utils";
import type { LeadSource } from "@/lib/types";
import {
    Plus, X, Calendar, Clock, User, AlertCircle,
    Edit3, Trash2, Instagram, Globe, MessageSquare, Users, Star,
    TrendingUp, Target, Package,
} from "lucide-react";

// ─── Config ─────────────────────────────────────────────
interface PipelineStage { id: string; label: string; colour: string; bgColour: string; dotColour: string; }

interface FetchedPackage { id: string; name: string; price: number; type: string; active: boolean; }

interface Lead {
    id: string; business_name: string; contact_name: string; contact_email: string; contact_phone?: string;
    stage_id: string; source: LeadSource; package_id: string | null; package_name: string; estimated_value: number;
    priority: "high" | "medium" | "low"; notes?: string; follow_up_date?: string; created_at: string;
}

const defaultStages: PipelineStage[] = [
    { id: "new", label: "New Lead", colour: "text-lavender-500", bgColour: "bg-lavender-50", dotColour: "bg-lavender-400" },
    { id: "discovery", label: "Discovery Call", colour: "text-blue-600", bgColour: "bg-blue-50", dotColour: "bg-blue-400" },
    { id: "proposal", label: "Proposal Sent", colour: "text-brand-600", bgColour: "bg-brand-50", dotColour: "bg-brand-400" },
    { id: "follow_up", label: "Follow-Up", colour: "text-warm-600", bgColour: "bg-warm-100", dotColour: "bg-warm-400" },
    { id: "won", label: "Won 🎉", colour: "text-sage-600", bgColour: "bg-sage-50", dotColour: "bg-sage-500" },
    { id: "lost", label: "Lost", colour: "text-rose-500", bgColour: "bg-rose-50", dotColour: "bg-rose-400" },
];

const sourceConfig: Record<LeadSource, { label: string; icon: React.ElementType }> = {
    landing_page: { label: "Landing Page", icon: Globe },
    contact_form: { label: "Contact Form", icon: MessageSquare },
    manual: { label: "Manual Entry", icon: Edit3 },
    social_media: { label: "Social Media", icon: Instagram },
    referral: { label: "Referral", icon: Users },
};

const priorityConfig = {
    high: { label: "High", colour: "text-rose-600", bg: "bg-rose-50", dot: "bg-rose-500" },
    medium: { label: "Medium", colour: "text-brand-600", bg: "bg-brand-50", dot: "bg-brand-400" },
    low: { label: "Low", colour: "text-sage-600", bg: "bg-sage-50", dot: "bg-sage-400" },
};

function getRelativeDate(d: number): string { const dt = new Date(); dt.setDate(dt.getDate() + d); return dt.toISOString().split("T")[0]; }

const demoLeads: Lead[] = [
    { id: "1", business_name: "Bloom Beauty Bar", contact_name: "Jessica Taylor", contact_email: "jess@bloombeauty.co.uk", contact_phone: "07912 345678", stage_id: "new", source: "social_media", package_id: null, package_name: "Monthly Social Management", estimated_value: 450, priority: "high", notes: "Found via Instagram DMs, very interested in full management", follow_up_date: getRelativeDate(1), created_at: getRelativeDate(-2) },
    { id: "2", business_name: "The Fitness Hut", contact_name: "Mark Andrews", contact_email: "mark@fitnesshut.com", stage_id: "discovery", source: "referral", package_id: null, package_name: "Content Creation Package", estimated_value: 600, priority: "medium", notes: "Referred by FitLife Academy", follow_up_date: getRelativeDate(3), created_at: getRelativeDate(-5) },
    { id: "3", business_name: "Luna Yoga Studio", contact_name: "Priya Sharma", contact_email: "priya@lunayoga.co.uk", contact_phone: "07845 678901", stage_id: "proposal", source: "landing_page", package_id: null, package_name: "Full Package — Social + Content + Strategy", estimated_value: 850, priority: "high", notes: "Proposal sent Tuesday, decision expected by Friday", follow_up_date: getRelativeDate(2), created_at: getRelativeDate(-7) },
    { id: "4", business_name: "Copper & Vine", contact_name: "Amy Wheeler", contact_email: "amy@copperandvine.com", stage_id: "follow_up", source: "contact_form", package_id: null, package_name: "Monthly Social Management", estimated_value: 500, priority: "medium", notes: "Needs to discuss budget with business partner", follow_up_date: getRelativeDate(5), created_at: getRelativeDate(-14) },
    { id: "5", business_name: "Serenity Spa", contact_name: "Claire Bennett", contact_email: "claire@serenityspa.co.uk", contact_phone: "07756 234567", stage_id: "won", source: "referral", package_id: null, package_name: "Full Package — Social + Content + Strategy", estimated_value: 900, priority: "high", created_at: getRelativeDate(-21) },
    { id: "6", business_name: "Quick Bites Café", contact_name: "Tom Morris", contact_email: "tom@quickbites.co.uk", stage_id: "lost", source: "manual", package_id: null, package_name: "One-off Campaign", estimated_value: 300, priority: "low", notes: "Budget too tight, may revisit in Q3", created_at: getRelativeDate(-30) },
    { id: "7", business_name: "Wildflower Boutique", contact_name: "Hannah Cross", contact_email: "hannah@wildflowerboutique.co.uk", stage_id: "new", source: "social_media", package_id: null, package_name: "Reel Creation Package", estimated_value: 350, priority: "medium", follow_up_date: getRelativeDate(0), created_at: getRelativeDate(-1) },
    { id: "8", business_name: "Peak Performance PT", contact_name: "Jake Wilson", contact_email: "jake@peakpt.com", stage_id: "discovery", source: "landing_page", package_id: null, package_name: "Monthly Social Management", estimated_value: 500, priority: "low", follow_up_date: getRelativeDate(4), created_at: getRelativeDate(-3) },
];

// ─── Lead Modal ─────────────────────────────────────────
function LeadModal({ lead, isOpen, onClose, onSave, onDelete, stages, packages }: { lead?: Lead | null; isOpen: boolean; onClose: () => void; onSave: (l: Lead) => void; onDelete?: (id: string) => void; stages: PipelineStage[]; packages: FetchedPackage[] }) {
    const isEdit = !!lead;
    const [f, setF] = useState<Partial<Lead>>({ business_name: lead?.business_name || "", contact_name: lead?.contact_name || "", contact_email: lead?.contact_email || "", contact_phone: lead?.contact_phone || "", stage_id: lead?.stage_id || "new", source: lead?.source || "manual", package_id: lead?.package_id || null, package_name: lead?.package_name || "", estimated_value: lead?.estimated_value || 0, priority: lead?.priority || "medium", notes: lead?.notes || "", follow_up_date: lead?.follow_up_date || "" });

    React.useEffect(() => { setF({ business_name: lead?.business_name || "", contact_name: lead?.contact_name || "", contact_email: lead?.contact_email || "", contact_phone: lead?.contact_phone || "", stage_id: lead?.stage_id || "new", source: lead?.source || "manual", package_id: lead?.package_id || null, package_name: lead?.package_name || "", estimated_value: lead?.estimated_value || 0, priority: lead?.priority || "medium", notes: lead?.notes || "", follow_up_date: lead?.follow_up_date || "" }); }, [lead]);

    if (!isOpen) return null;

    const handlePackageChange = (packageId: string) => {
        if (!packageId) {
            setF({ ...f, package_id: null, package_name: "", estimated_value: 0 });
            return;
        }
        const pkg = packages.find((p) => p.id === packageId);
        if (pkg) {
            setF({ ...f, package_id: pkg.id, package_name: pkg.name, estimated_value: pkg.price });
        }
    };

    const handleSave = () => { onSave({ id: lead?.id || `lead-${Date.now()}`, business_name: f.business_name || "New Business", contact_name: f.contact_name || "", contact_email: f.contact_email || "", contact_phone: f.contact_phone, stage_id: f.stage_id || "new", source: f.source || "manual", package_id: f.package_id || null, package_name: f.package_name || "", estimated_value: f.estimated_value || 0, priority: f.priority || "medium", notes: f.notes, follow_up_date: f.follow_up_date || undefined, created_at: lead?.created_at || getRelativeDate(0) }); onClose(); };

    const inputCls = "flex h-10 w-full rounded-lg border border-border bg-surface px-3.5 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-brand-400/40 focus:border-brand-400 transition-all";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-surface rounded-2xl border border-border shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto animate-scale-in">
                <div className="flex items-center justify-between p-5 border-b border-border-light"><h2 className="font-display font-semibold text-lg text-text-primary">{isEdit ? "Edit Lead" : "New Lead"}</h2><button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-hover transition-colors"><X className="w-4 h-4 text-text-tertiary" /></button></div>
                <div className="p-5 space-y-5">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5"><label className="block text-sm font-medium text-text-secondary">Business Name</label><input type="text" value={f.business_name} onChange={(e) => setF({ ...f, business_name: e.target.value })} placeholder="e.g. Bloom Beauty Bar" className={inputCls} /></div>
                        <div className="space-y-1.5"><label className="block text-sm font-medium text-text-secondary">Contact Name</label><input type="text" value={f.contact_name} onChange={(e) => setF({ ...f, contact_name: e.target.value })} placeholder="e.g. Jessica Taylor" className={inputCls} /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5"><label className="block text-sm font-medium text-text-secondary">Email</label><input type="email" value={f.contact_email} onChange={(e) => setF({ ...f, contact_email: e.target.value })} placeholder="jess@business.com" className={inputCls} /></div>
                        <div className="space-y-1.5"><label className="block text-sm font-medium text-text-secondary">Phone</label><input type="tel" value={f.contact_phone} onChange={(e) => setF({ ...f, contact_phone: e.target.value })} placeholder="07XXX XXXXXX" className={inputCls} /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5"><label className="block text-sm font-medium text-text-secondary">Stage</label><select value={f.stage_id} onChange={(e) => setF({ ...f, stage_id: e.target.value })} className={inputCls}>{stages.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}</select></div>
                        <div className="space-y-1.5"><label className="block text-sm font-medium text-text-secondary">Priority</label><div className="flex gap-1.5">{(Object.keys(priorityConfig) as Array<keyof typeof priorityConfig>).map((p) => (<button key={p} onClick={() => setF({ ...f, priority: p })} className={cn("px-2.5 py-1.5 rounded-full text-xs font-medium transition-all border capitalize", f.priority === p ? `${priorityConfig[p].bg} ${priorityConfig[p].colour} border-transparent` : "bg-surface border-border text-text-secondary hover:bg-surface-hover")}>{priorityConfig[p].label}</button>))}</div></div>
                    </div>
                    <div className="space-y-1.5"><label className="block text-sm font-medium text-text-secondary">Lead Source</label><div className="flex flex-wrap gap-1.5">{(Object.keys(sourceConfig) as LeadSource[]).map((s) => { const c = sourceConfig[s]; const Icon = c.icon; return (<button key={s} onClick={() => setF({ ...f, source: s })} className={cn("flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all border", f.source === s ? "bg-brand-50 text-brand-700 border-brand-300" : "bg-surface border-border text-text-secondary hover:bg-surface-hover")}><Icon className="w-3.5 h-3.5" />{c.label}</button>); })}</div></div>
                    {/* Package Suggested dropdown */}
                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-text-secondary">Package Suggested</label>
                        <div className="relative">
                            <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary pointer-events-none" />
                            <select
                                value={f.package_id || ""}
                                onChange={(e) => handlePackageChange(e.target.value)}
                                className={cn(inputCls, "pl-9 appearance-none")}
                            >
                                <option value="">Select a package…</option>
                                {packages.filter((p) => p.active).map((p) => (
                                    <option key={p.id} value={p.id}>{p.name} — {formatCurrency(p.price)}</option>
                                ))}
                            </select>
                        </div>
                        {f.package_id && (
                            <p className="text-xs text-text-tertiary flex items-center gap-1 mt-1">
                                <TrendingUp className="w-3 h-3" />Pipeline value: <span className="font-semibold text-text-secondary">{formatCurrency(f.estimated_value || 0)}</span>
                            </p>
                        )}
                    </div>
                    <div className="space-y-1.5"><label className="block text-sm font-medium text-text-secondary">Follow-Up Date</label><input type="date" value={f.follow_up_date} onChange={(e) => setF({ ...f, follow_up_date: e.target.value })} className={inputCls} /></div>
                    <div className="space-y-1.5"><label className="block text-sm font-medium text-text-secondary">Notes</label><textarea value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} placeholder="Any notes about this lead..." rows={3} className="flex min-h-[80px] w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary resize-y focus:outline-none focus:ring-2 focus:ring-brand-400/40 focus:border-brand-400 transition-all" /></div>
                </div>
                <div className="flex items-center justify-between p-5 border-t border-border-light">
                    <div>{isEdit && onDelete && <Button variant="ghost" size="sm" onClick={() => { onDelete(lead!.id); onClose(); }} className="text-error hover:text-error hover:bg-rose-50"><Trash2 className="w-4 h-4" />Delete</Button>}</div>
                    <div className="flex gap-2"><Button variant="secondary" size="sm" onClick={onClose}>Cancel</Button><Button size="sm" onClick={handleSave}>{isEdit ? "Save Changes" : "Add Lead"}</Button></div>
                </div>
            </div>
        </div>
    );
}

// ─── Lead Card ──────────────────────────────────────────
function LeadCard({ lead, onClick, onDragStart }: { lead: Lead; onClick: () => void; onDragStart: (e: React.DragEvent) => void }) {
    const priority = priorityConfig[lead.priority];
    const source = sourceConfig[lead.source];
    const SourceIcon = source.icon;
    const today = new Date();
    const followUp = lead.follow_up_date ? new Date(lead.follow_up_date) : null;
    const isOverdue = followUp && followUp < today;
    const isDueToday = followUp && followUp.toDateString() === today.toDateString();

    return (
        <div draggable onDragStart={onDragStart} onClick={onClick} className="p-3 rounded-xl bg-surface border border-border hover:shadow-card-hover hover:border-border-strong transition-all cursor-pointer group animate-fade-in">
            <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0"><h4 className="text-sm font-semibold text-text-primary truncate">{lead.business_name}</h4><p className="text-[11px] text-text-tertiary flex items-center gap-1 mt-0.5"><User className="w-3 h-3" />{lead.contact_name}</p></div>
                <div className={cn("w-2 h-2 rounded-full flex-shrink-0 mt-1.5", priority.dot)} title={priority.label} />
            </div>
            <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-text-secondary truncate flex items-center gap-1"><Package className="w-3 h-3 text-text-tertiary" />{lead.package_name || "No package"}</span>
                <Badge variant="brand" size="sm" className="font-semibold ml-2 flex-shrink-0">{formatCurrency(lead.estimated_value)}</Badge>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-border-light">
                <Badge variant="outline" size="sm"><SourceIcon className="w-2.5 h-2.5" />{source.label}</Badge>
                {followUp && <span className={cn("text-[10px] font-medium flex items-center gap-1", isOverdue ? "text-rose-500" : isDueToday ? "text-brand-600" : "text-text-tertiary")}>{isOverdue && <AlertCircle className="w-3 h-3" />}{isDueToday && <Clock className="w-3 h-3" />}<Calendar className="w-2.5 h-2.5" />{followUp.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>}
            </div>
        </div>
    );
}

// ─── Main Page ──────────────────────────────────────────
export default function LeadsPage() {
    const [leads, setLeads] = useState<Lead[]>(demoLeads);
    const [stages] = useState<PipelineStage[]>(defaultStages);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingLead, setEditingLead] = useState<Lead | null>(null);
    const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
    const [packages, setPackages] = useState<FetchedPackage[]>([]);

    // Fetch packages from the database
    const fetchPackages = useCallback(async () => {
        try {
            const res = await fetch("/api/packages");
            if (res.ok) {
                const data = await res.json();
                setPackages(data);
            }
        } catch (err) {
            console.error("Failed to fetch packages:", err);
        }
    }, []);

    useEffect(() => { fetchPackages(); }, [fetchPackages]);

    const stats = useMemo(() => { const pipeline = leads.filter((l) => !["won", "lost"].includes(l.stage_id)); return { total: leads.length, open: pipeline.length, pipelineValue: pipeline.reduce((s, l) => s + l.estimated_value, 0), won: leads.filter((l) => l.stage_id === "won").length, wonValue: leads.filter((l) => l.stage_id === "won").reduce((s, l) => s + l.estimated_value, 0) }; }, [leads]);

    const leadsByStage = useMemo(() => { const map: Record<string, Lead[]> = {}; stages.forEach((s) => { map[s.id] = []; }); leads.forEach((l) => { if (map[l.stage_id]) map[l.stage_id].push(l); }); return map; }, [leads, stages]);

    const handleSave = (lead: Lead) => { setLeads((prev) => { const idx = prev.findIndex((l) => l.id === lead.id); if (idx >= 0) { const u = [...prev]; u[idx] = lead; return u; } return [...prev, lead]; }); };
    const handleDelete = (id: string) => setLeads((prev) => prev.filter((l) => l.id !== id));
    const handleDragStart = (e: React.DragEvent, leadId: string) => { setDraggedLeadId(leadId); e.dataTransfer.effectAllowed = "move"; };
    const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; };
    const handleDrop = (e: React.DragEvent, stageId: string) => { e.preventDefault(); if (draggedLeadId) { setLeads((prev) => prev.map((l) => l.id === draggedLeadId ? { ...l, stage_id: stageId } : l)); setDraggedLeadId(null); } };

    return (
        <>
            <Header title="Lead Pipeline" subtitle={`${stats.open} open leads \u00b7 ${formatCurrency(stats.pipelineValue)} pipeline value`} actions={<Button size="sm" onClick={() => { setEditingLead(null); setModalOpen(true); }}><Plus className="w-4 h-4" />Add Lead</Button>} />
            <div className="p-6 space-y-4 animate-fade-in">
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2.5 rounded-xl bg-lavender-50"><Users className="w-4 h-4 text-lavender-500" /></div><div><p className="text-xl font-display font-bold text-text-primary">{stats.total}</p><p className="text-[10px] text-text-tertiary font-medium">Total Leads</p></div></CardContent></Card>
                    <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2.5 rounded-xl bg-brand-50"><Target className="w-4 h-4 text-brand-500" /></div><div><p className="text-xl font-display font-bold text-text-primary">{stats.open}</p><p className="text-[10px] text-text-tertiary font-medium">Open Pipeline</p></div></CardContent></Card>
                    <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2.5 rounded-xl bg-brand-50"><TrendingUp className="w-4 h-4 text-brand-500" /></div><div><p className="text-xl font-display font-bold text-text-primary">{formatCurrency(stats.pipelineValue)}</p><p className="text-[10px] text-text-tertiary font-medium">Pipeline Value</p></div></CardContent></Card>
                    <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2.5 rounded-xl bg-sage-50"><Star className="w-4 h-4 text-sage-500" /></div><div><p className="text-xl font-display font-bold text-text-primary">{formatCurrency(stats.wonValue)}</p><p className="text-[10px] text-text-tertiary font-medium">{stats.won} Won</p></div></CardContent></Card>
                </div>
                {/* Kanban */}
                <div className="flex gap-3 overflow-x-auto pb-4 -mx-6 px-6">
                    {stages.map((stage) => {
                        const stageLeads = leadsByStage[stage.id] || []; const stageValue = stageLeads.reduce((s, l) => s + l.estimated_value, 0); return (
                            <div key={stage.id} className="flex-shrink-0 w-[280px]" onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, stage.id)}>
                                <div className={cn("flex items-center justify-between px-3 py-2.5 rounded-xl mb-2", stage.bgColour)}>
                                    <div className="flex items-center gap-2"><div className={cn("w-2.5 h-2.5 rounded-full", stage.dotColour)} /><span className={cn("text-xs font-semibold", stage.colour)}>{stage.label}</span><Badge size="sm" className={cn(stage.bgColour, stage.colour, "text-[10px]")}>{stageLeads.length}</Badge></div>
                                    {stageValue > 0 && <span className={cn("text-[10px] font-semibold", stage.colour)}>{formatCurrency(stageValue)}</span>}
                                </div>
                                <div className="space-y-2 min-h-[200px] p-1">
                                    {stageLeads.map((lead) => <LeadCard key={lead.id} lead={lead} onClick={() => { setEditingLead(lead); setModalOpen(true); }} onDragStart={(e) => handleDragStart(e, lead.id)} />)}
                                    {stage.id !== "won" && stage.id !== "lost" && <button onClick={() => { setEditingLead(null); setModalOpen(true); }} className="w-full py-2.5 rounded-xl border-2 border-dashed border-border hover:border-brand-300 text-text-tertiary hover:text-brand-500 transition-all flex items-center justify-center gap-1.5 text-xs font-medium"><Plus className="w-3.5 h-3.5" />Add Lead</button>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            <LeadModal lead={editingLead} isOpen={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSave} onDelete={handleDelete} stages={stages} packages={packages} />
        </>
    );
}
