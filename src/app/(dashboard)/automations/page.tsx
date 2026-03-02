"use client";

import React, { useState, useMemo } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { AutomationTrigger, AutomationAction } from "@/lib/types";
import {
    Plus, X, Search, Zap, Play, Pause, ArrowRight, Trash2,
    UserPlus, FileText, AlertTriangle, Users, GraduationCap,
    ShoppingBag, Calendar, Mail, CheckSquare, RefreshCw, Bell,
    ToggleLeft, ToggleRight, ArrowUpRight, Sparkles, Clock,
} from "lucide-react";

// ─── Config ─────────────────────────────────────────────
const triggerConfig: Record<AutomationTrigger, { label: string; description: string; icon: React.ElementType; colour: string; bg: string }> = {
    client_created: { label: "Client Created", description: "When a new client is added", icon: UserPlus, colour: "text-brand-600", bg: "bg-brand-50" },
    invoice_sent: { label: "Invoice Sent", description: "When an invoice is sent to a client", icon: FileText, colour: "text-blue-600", bg: "bg-blue-50" },
    invoice_overdue: { label: "Invoice Overdue", description: "When an invoice passes its due date", icon: AlertTriangle, colour: "text-rose-600", bg: "bg-rose-50" },
    lead_created: { label: "Lead Created", description: "When a new lead enters the pipeline", icon: Users, colour: "text-lavender-500", bg: "bg-lavender-50" },
    workshop_registered: { label: "Workshop Registration", description: "When someone registers for a workshop", icon: GraduationCap, colour: "text-sage-600", bg: "bg-sage-50" },
    product_purchased: { label: "Product Purchased", description: "When a digital product is bought", icon: ShoppingBag, colour: "text-pink-600", bg: "bg-pink-50" },
    content_due: { label: "Content Due", description: "When content is due for scheduling", icon: Calendar, colour: "text-warm-600", bg: "bg-warm-100" },
};

const actionConfig: Record<AutomationAction, { label: string; description: string; icon: React.ElementType; colour: string; bg: string }> = {
    send_email: { label: "Send Email", description: "Send an automated email", icon: Mail, colour: "text-blue-600", bg: "bg-blue-50" },
    create_task: { label: "Create Task", description: "Add a follow-up task", icon: CheckSquare, colour: "text-brand-600", bg: "bg-brand-50" },
    update_status: { label: "Update Status", description: "Change a record's status", icon: RefreshCw, colour: "text-sage-600", bg: "bg-sage-50" },
    send_reminder: { label: "Send Reminder", description: "Send a reminder notification", icon: Bell, colour: "text-warm-600", bg: "bg-warm-100" },
};

// ─── Types ──────────────────────────────────────────────
interface AutomationItem {
    id: string;
    name: string;
    trigger: AutomationTrigger;
    action: AutomationAction;
    description?: string;
    is_active: boolean;
    run_count: number;
    last_run?: string;
}

// ─── Demo Data ──────────────────────────────────────────
function getRelativeDate(d: number): string { const dt = new Date(); dt.setDate(dt.getDate() + d); return dt.toISOString().split("T")[0]; }

const demoAutomations: AutomationItem[] = [
    { id: "1", name: "Welcome New Clients", trigger: "client_created", action: "send_email", description: "Send a warm welcome email with onboarding guide when a new client is added.", is_active: true, run_count: 12, last_run: getRelativeDate(-2) },
    { id: "2", name: "Overdue Invoice Reminder", trigger: "invoice_overdue", action: "send_reminder", description: "Automatically nudge clients with a friendly payment reminder when invoices pass their due date.", is_active: true, run_count: 8, last_run: getRelativeDate(-1) },
    { id: "3", name: "New Lead Follow-Up", trigger: "lead_created", action: "create_task", description: "Create a follow-up task within 24 hours when a new lead enters the pipeline.", is_active: true, run_count: 23, last_run: getRelativeDate(0) },
    { id: "4", name: "Workshop Welcome Pack", trigger: "workshop_registered", action: "send_email", description: "Send booking confirmation and prep materials when someone registers for a workshop.", is_active: true, run_count: 15, last_run: getRelativeDate(-5) },
    { id: "5", name: "Content Due Reminder", trigger: "content_due", action: "send_reminder", description: "Remind you when content is due for scheduling — no more missed deadlines!", is_active: false, run_count: 0 },
    { id: "6", name: "Product Purchase Thank You", trigger: "product_purchased", action: "send_email", description: "Send a thank-you email with download link when someone purchases a digital product.", is_active: false, run_count: 0 },
    { id: "7", name: "Invoice Sent Notification", trigger: "invoice_sent", action: "create_task", description: "Create a task to follow up 7 days after an invoice is sent.", is_active: true, run_count: 18, last_run: getRelativeDate(-3) },
];

// ─── Automation Modal ───────────────────────────────────
function AutomationModal({ automation, isOpen, onClose, onSave, onDelete }: { automation?: AutomationItem | null; isOpen: boolean; onClose: () => void; onSave: (a: AutomationItem) => void; onDelete?: (id: string) => void }) {
    const isEdit = !!automation;
    const [f, setF] = useState<Partial<AutomationItem>>({ name: automation?.name || "", trigger: automation?.trigger || "client_created", action: automation?.action || "send_email", description: automation?.description || "", is_active: automation?.is_active ?? true });

    React.useEffect(() => { setF({ name: automation?.name || "", trigger: automation?.trigger || "client_created", action: automation?.action || "send_email", description: automation?.description || "", is_active: automation?.is_active ?? true }); }, [automation]);

    if (!isOpen) return null;

    const handleSave = () => { onSave({ id: automation?.id || `auto-${Date.now()}`, name: f.name || "Untitled Automation", trigger: f.trigger || "client_created", action: f.action || "send_email", description: f.description, is_active: f.is_active ?? true, run_count: automation?.run_count || 0, last_run: automation?.last_run }); onClose(); };
    const inputCls = "flex h-10 w-full rounded-lg border border-border bg-surface px-3.5 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-brand-400/40 focus:border-brand-400 transition-all";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-surface rounded-2xl border border-border shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto animate-scale-in">
                <div className="flex items-center justify-between p-5 border-b border-border-light"><h2 className="font-display font-semibold text-lg text-text-primary">{isEdit ? "Edit Automation" : "New Automation"}</h2><button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-hover transition-colors"><X className="w-4 h-4 text-text-tertiary" /></button></div>

                <div className="p-5 space-y-5">
                    <div className="space-y-1.5"><label className="block text-sm font-medium text-text-secondary">Name</label><input type="text" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="e.g. Welcome New Clients" className={inputCls} /></div>

                    <div className="space-y-1.5"><label className="block text-sm font-medium text-text-secondary">Description</label><textarea value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} placeholder="Describe what this automation does..." rows={2} className="flex min-h-[60px] w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary resize-y focus:outline-none focus:ring-2 focus:ring-brand-400/40 focus:border-brand-400 transition-all" /></div>

                    {/* Trigger */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-text-secondary">When this happens…</label>
                        <div className="grid grid-cols-2 gap-2">
                            {(Object.keys(triggerConfig) as AutomationTrigger[]).map((t) => {
                                const config = triggerConfig[t]; const Icon = config.icon; return (
                                    <button key={t} onClick={() => setF({ ...f, trigger: t })} className={cn("flex items-start gap-2.5 p-3 rounded-xl border text-left transition-all", f.trigger === t ? "bg-brand-50 border-brand-300 ring-1 ring-brand-200" : "bg-surface border-border hover:bg-surface-hover")}>
                                        <div className={cn("p-1.5 rounded-lg", config.bg)}><Icon className={cn("w-3.5 h-3.5", config.colour)} /></div>
                                        <div><p className="text-xs font-semibold text-text-primary">{config.label}</p><p className="text-[10px] text-text-tertiary mt-0.5">{config.description}</p></div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Visual Flow */}
                    <div className="flex items-center justify-center py-2">
                        <div className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center"><ArrowRight className="w-4 h-4 text-brand-500" /></div>
                    </div>

                    {/* Action */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-text-secondary">…do this</label>
                        <div className="grid grid-cols-2 gap-2">
                            {(Object.keys(actionConfig) as AutomationAction[]).map((a) => {
                                const config = actionConfig[a]; const Icon = config.icon; return (
                                    <button key={a} onClick={() => setF({ ...f, action: a })} className={cn("flex items-start gap-2.5 p-3 rounded-xl border text-left transition-all", f.action === a ? "bg-sage-50 border-sage-300 ring-1 ring-sage-200" : "bg-surface border-border hover:bg-surface-hover")}>
                                        <div className={cn("p-1.5 rounded-lg", config.bg)}><Icon className={cn("w-3.5 h-3.5", config.colour)} /></div>
                                        <div><p className="text-xs font-semibold text-text-primary">{config.label}</p><p className="text-[10px] text-text-tertiary mt-0.5">{config.description}</p></div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={f.is_active} onChange={(e) => setF({ ...f, is_active: e.target.checked })} className="rounded border-border text-brand-500 focus:ring-brand-400" /><span className="text-sm text-text-secondary">Active — automation will run automatically</span></label>
                </div>

                <div className="flex items-center justify-between p-5 border-t border-border-light">
                    <div>{isEdit && onDelete && <Button variant="ghost" size="sm" onClick={() => { onDelete(automation!.id); onClose(); }} className="text-error hover:text-error hover:bg-rose-50"><Trash2 className="w-4 h-4" />Delete</Button>}</div>
                    <div className="flex gap-2"><Button variant="secondary" size="sm" onClick={onClose}>Cancel</Button><Button size="sm" onClick={handleSave}>{isEdit ? "Save Changes" : "Create Automation"}</Button></div>
                </div>
            </div>
        </div>
    );
}

// ─── Automation Card ────────────────────────────────────
function AutomationCard({ automation, onClick, onToggle }: { automation: AutomationItem; onClick: () => void; onToggle: () => void }) {
    const trigger = triggerConfig[automation.trigger];
    const action = actionConfig[automation.action];
    const TriggerIcon = trigger.icon;
    const ActionIcon = action.icon;

    return (
        <Card hover className={cn("group animate-fade-in", !automation.is_active && "opacity-60")} onClick={onClick}>
            <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-sm font-semibold text-text-primary truncate">{automation.name}</h3>
                            <Badge size="sm" className={automation.is_active ? "bg-sage-50 text-sage-600" : "bg-surface-tertiary text-text-tertiary"}>
                                {automation.is_active ? <><Play className="w-2.5 h-2.5" />Active</> : <><Pause className="w-2.5 h-2.5" />Paused</>}
                            </Badge>
                        </div>
                        {automation.description && <p className="text-xs text-text-secondary line-clamp-2">{automation.description}</p>}
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); onToggle(); }} className="p-1 rounded-lg hover:bg-surface-hover transition-colors">
                        {automation.is_active ? <ToggleRight className="w-6 h-6 text-sage-500" /> : <ToggleLeft className="w-6 h-6 text-text-tertiary" />}
                    </button>
                </div>

                {/* Visual flow */}
                <div className="flex items-center gap-2 mb-3">
                    <div className={cn("flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg", trigger.bg)}>
                        <TriggerIcon className={cn("w-3.5 h-3.5", trigger.colour)} />
                        <span className={cn("text-[11px] font-medium", trigger.colour)}>{trigger.label}</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-text-tertiary flex-shrink-0" />
                    <div className={cn("flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg", action.bg)}>
                        <ActionIcon className={cn("w-3.5 h-3.5", action.colour)} />
                        <span className={cn("text-[11px] font-medium", action.colour)}>{action.label}</span>
                    </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-3 pt-3 border-t border-border-light">
                    <span className="text-[10px] text-text-tertiary flex items-center gap-1"><Zap className="w-3 h-3" />{automation.run_count} runs</span>
                    {automation.last_run && <span className="text-[10px] text-text-tertiary flex items-center gap-1"><Clock className="w-3 h-3" />Last: {new Date(automation.last_run).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>}
                </div>
            </CardContent>
        </Card>
    );
}

// ─── Main Page ──────────────────────────────────────────
export default function AutomationsPage() {
    const [automations, setAutomations] = useState<AutomationItem[]>(demoAutomations);
    const [searchQuery, setSearchQuery] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [editingAutomation, setEditingAutomation] = useState<AutomationItem | null>(null);
    const [filter, setFilter] = useState<"all" | "active" | "paused">("all");

    const filtered = useMemo(() => automations.filter((a) => {
        const matchesSearch = a.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filter === "all" || (filter === "active" ? a.is_active : !a.is_active);
        return matchesSearch && matchesFilter;
    }), [automations, searchQuery, filter]);

    const stats = useMemo(() => ({
        total: automations.length,
        active: automations.filter((a) => a.is_active).length,
        totalRuns: automations.reduce((s, a) => s + a.run_count, 0),
    }), [automations]);

    const handleSave = (a: AutomationItem) => { setAutomations((prev) => { const idx = prev.findIndex((x) => x.id === a.id); if (idx >= 0) { const u = [...prev]; u[idx] = a; return u; } return [...prev, a]; }); };
    const handleDelete = (id: string) => setAutomations((prev) => prev.filter((a) => a.id !== id));
    const handleToggle = (id: string) => { setAutomations((prev) => prev.map((a) => a.id === id ? { ...a, is_active: !a.is_active } : a)); };

    return (
        <>
            <Header title="Automations" subtitle={`${stats.active} active automations`} actions={<Button size="sm" onClick={() => { setEditingAutomation(null); setModalOpen(true); }}><Plus className="w-4 h-4" />New Automation</Button>} />
            <div className="p-6 space-y-5 animate-fade-in">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                    <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2.5 rounded-xl bg-lavender-50"><Zap className="w-4 h-4 text-lavender-500" /></div><div><p className="text-xl font-display font-bold text-text-primary">{stats.total}</p><p className="text-[10px] text-text-tertiary font-medium">Total Automations</p></div></CardContent></Card>
                    <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2.5 rounded-xl bg-sage-50"><Play className="w-4 h-4 text-sage-500" /></div><div><p className="text-xl font-display font-bold text-text-primary">{stats.active}</p><p className="text-[10px] text-text-tertiary font-medium">Active</p></div></CardContent></Card>
                    <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2.5 rounded-xl bg-brand-50"><Sparkles className="w-4 h-4 text-brand-500" /></div><div><p className="text-xl font-display font-bold text-text-primary">{stats.totalRuns}</p><p className="text-[10px] text-text-tertiary font-medium">Total Runs</p></div></CardContent></Card>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-3 flex-wrap">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                        <input type="text" placeholder="Search automations..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="h-9 w-full rounded-lg border border-border bg-surface pl-9 pr-3 text-sm placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-brand-400/40 focus:border-brand-400 transition-all" />
                    </div>
                    <div className="flex items-center gap-1.5">
                        {(["all", "active", "paused"] as const).map((f) => (<button key={f} onClick={() => setFilter(f)} className={cn("px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap capitalize", filter === f ? f === "all" ? "bg-text-primary text-white" : f === "active" ? "bg-sage-50 text-sage-600" : "bg-warm-100 text-warm-600" : "bg-surface border border-border text-text-secondary hover:bg-surface-hover")}>{f}</button>))}
                    </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filtered.map((a, i) => <div key={a.id} style={{ animationDelay: `${i * 50}ms` }}><AutomationCard automation={a} onClick={() => { setEditingAutomation(a); setModalOpen(true); }} onToggle={() => handleToggle(a.id)} /></div>)}
                    <Card hover className="border-dashed border-2 border-border hover:border-lavender-300 group cursor-pointer" onClick={() => { setEditingAutomation(null); setModalOpen(true); }}>
                        <CardContent className="p-5 flex items-center justify-center min-h-[200px]"><div className="text-center"><div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-lavender-50 group-hover:bg-lavender-100 transition-colors mb-2"><Plus className="w-5 h-5 text-lavender-500" /></div><p className="text-sm font-medium text-text-secondary group-hover:text-lavender-600 transition-colors">New Automation</p></div></CardContent>
                    </Card>
                </div>
            </div>
            <AutomationModal automation={editingAutomation} isOpen={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSave} onDelete={handleDelete} />
        </>
    );
}
