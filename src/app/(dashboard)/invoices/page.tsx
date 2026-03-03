"use client";

import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import type { InvoiceStatus } from "@/lib/types";
import {
    Plus, X, Search, FileText, Clock, CheckCircle2, AlertTriangle,
    Send, Trash2, RefreshCw, ArrowUpRight, Receipt, Settings2, Eye, Package, Ban, Calendar, ChevronLeft, ChevronRight,
} from "lucide-react";
import { InvoiceSettingsModal, PdfPreview, loadFromStorage, STORAGE_KEY_TEMPLATE, DEFAULT_TEMPLATE } from "./invoice-settings-modal";
import type { InvoiceTemplateSettings } from "./invoice-settings-modal";

// ─── Config ─────────────────────────────────────────────
const statusConfig: Record<InvoiceStatus, { label: string; colour: string; bg: string; icon: React.ElementType }> = {
    draft: { label: "Draft", colour: "text-warm-600", bg: "bg-warm-100", icon: FileText },
    sent: { label: "Sent", colour: "text-blue-600", bg: "bg-blue-50", icon: Send },
    paid: { label: "Paid", colour: "text-sage-600", bg: "bg-sage-50", icon: CheckCircle2 },
    overdue: { label: "Overdue", colour: "text-rose-600", bg: "bg-rose-50", icon: AlertTriangle },
    cancelled: { label: "Cancelled", colour: "text-text-tertiary", bg: "bg-surface-tertiary", icon: X },
    void: { label: "Void", colour: "text-text-tertiary", bg: "bg-surface-tertiary", icon: Ban },
};

const recurringLabels: Record<string, string> = { none: "One-off", monthly: "Monthly", quarterly: "Quarterly", yearly: "Yearly" };

interface Invoice {
    id: string; invoice_number: string; client_id: string; client_name: string; status: InvoiceStatus;
    amount: number; due_date: string; issued_date: string; paid_date?: string;
    description: string; recurring: "none" | "monthly" | "quarterly" | "yearly";
    line_items: { description: string; amount: number }[];
}

function getRelativeDate(d: number): string { const dt = new Date(); dt.setDate(dt.getDate() + d); return dt.toISOString().split("T")[0]; }
function toIso(d: Date): string { return d.toISOString().split("T")[0]; }

// ─── Date Presets ───────────────────────────────────────
type DatePreset = "all" | "this_month" | "last_month" | "last_3" | "last_6" | "this_year" | "last_year" | "custom";
const DATE_PRESETS: { key: DatePreset; label: string }[] = [
    { key: "all", label: "All Time" },
    { key: "this_month", label: "This Month" },
    { key: "last_month", label: "Last Month" },
    { key: "last_3", label: "Last 3 Months" },
    { key: "last_6", label: "Last 6 Months" },
    { key: "this_year", label: "This Year" },
    { key: "last_year", label: "Last Year" },
    { key: "custom", label: "Custom" },
];

function getPresetRange(key: DatePreset): { from: string; to: string } {
    const now = new Date();
    const y = now.getFullYear(), m = now.getMonth();
    switch (key) {
        case "this_month": return { from: toIso(new Date(y, m, 1)), to: toIso(new Date(y, m + 1, 0)) };
        case "last_month": return { from: toIso(new Date(y, m - 1, 1)), to: toIso(new Date(y, m, 0)) };
        case "last_3": return { from: toIso(new Date(y, m - 3, 1)), to: toIso(now) };
        case "last_6": return { from: toIso(new Date(y, m - 6, 1)), to: toIso(now) };
        case "this_year": return { from: toIso(new Date(y, 0, 1)), to: toIso(new Date(y, 11, 31)) };
        case "last_year": return { from: toIso(new Date(y - 1, 0, 1)), to: toIso(new Date(y - 1, 11, 31)) };
        default: return { from: "", to: "" };
    }
}

// ─── Mini Calendar ─────────────────────────────────────
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAY_NAMES = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

function MiniCalendar({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
    const selected = value ? new Date(value + "T00:00:00") : null;
    const [viewYear, setViewYear] = useState(selected?.getFullYear() ?? new Date().getFullYear());
    const [viewMonth, setViewMonth] = useState(selected?.getMonth() ?? new Date().getMonth());

    const firstDay = new Date(viewYear, viewMonth, 1);
    const startDow = (firstDay.getDay() + 6) % 7; // Mon=0
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const cells: (number | null)[] = Array(startDow).fill(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);

    const prev = () => { if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); } else setViewMonth(viewMonth - 1); };
    const next = () => { if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); } else setViewMonth(viewMonth + 1); };

    const isSelected = (d: number) => selected && selected.getFullYear() === viewYear && selected.getMonth() === viewMonth && selected.getDate() === d;
    const isToday = (d: number) => { const t = new Date(); return t.getFullYear() === viewYear && t.getMonth() === viewMonth && t.getDate() === d; };

    return (
        <div className="space-y-2">
            <div className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider">{label}</div>
            <div className="flex items-center justify-between mb-1">
                <button onClick={prev} className="p-1 rounded hover:bg-surface-hover transition-colors"><ChevronLeft className="w-3.5 h-3.5 text-text-tertiary" /></button>
                <span className="text-xs font-semibold text-text-primary">{MONTH_NAMES[viewMonth]} {viewYear}</span>
                <button onClick={next} className="p-1 rounded hover:bg-surface-hover transition-colors"><ChevronRight className="w-3.5 h-3.5 text-text-tertiary" /></button>
            </div>
            <div className="grid grid-cols-7 gap-0">
                {DAY_NAMES.map((d) => <div key={d} className="text-center text-[9px] font-semibold text-text-tertiary py-1">{d}</div>)}
                {cells.map((d, i) => d ? (
                    <button key={i} onClick={() => onChange(toIso(new Date(viewYear, viewMonth, d)))} className={cn("w-7 h-7 rounded-lg text-[11px] font-medium transition-all", isSelected(d) ? "bg-brand-500 text-white" : isToday(d) ? "bg-brand-50 text-brand-600 font-bold" : "text-text-primary hover:bg-surface-hover")}>{d}</button>
                ) : <div key={i} className="w-7 h-7" />)}
            </div>
        </div>
    );
}

// ─── Custom Date Picker Popover ────────────────────────
function DateRangePopover({ dateFrom, dateTo, onApply, onClose }: { dateFrom: string; dateTo: string; onApply: (from: string, to: string) => void; onClose: () => void }) {
    const [from, setFrom] = useState(dateFrom);
    const [to, setTo] = useState(dateTo);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose(); };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [onClose]);

    return (
        <div ref={ref} className="absolute top-full right-0 mt-1.5 z-50 bg-surface rounded-xl border border-border shadow-xl p-4 animate-scale-in">
            <div className="flex gap-5">
                <MiniCalendar value={from} onChange={setFrom} label="From" />
                <MiniCalendar value={to} onChange={setTo} label="To" />
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border-light">
                <div className="text-[10px] text-text-tertiary">
                    {from && to ? `${new Date(from + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })} — ${new Date(to + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}` : "Select dates"}
                </div>
                <div className="flex gap-1.5">
                    <button onClick={onClose} className="px-2.5 py-1.5 text-xs font-medium text-text-secondary hover:bg-surface-hover rounded-lg transition-colors">Cancel</button>
                    <button onClick={() => { onApply(from, to); onClose(); }} className="px-2.5 py-1.5 text-xs font-medium bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors">Apply</button>
                </div>
            </div>
        </div>
    );
}

// ─── Invoice Modal ──────────────────────────────────────
function InvoiceModal({ invoice, isOpen, onClose, onSave, onDelete }: { invoice?: Invoice | null; isOpen: boolean; onClose: () => void; onSave: (i: Partial<Invoice>) => void; onDelete?: (id: string) => void }) {
    const isEdit = !!invoice;
    const [f, setF] = useState<Partial<Invoice>>({ client_id: invoice?.client_id || "", description: invoice?.description || "", status: invoice?.status || "draft", due_date: invoice?.due_date || getRelativeDate(14), issued_date: invoice?.issued_date || getRelativeDate(0), recurring: invoice?.recurring || "none", line_items: invoice?.line_items || [{ description: "", amount: 0 }] });
    const [packages, setPackages] = useState<{ id: string; name: string; description: string; price: number; type: string }[]>([]);
    const [clients, setClients] = useState<{ id: string; business_name: string }[]>([]);
    const [selectedPackageId, setSelectedPackageId] = useState<string>("");
    const [saving, setSaving] = useState(false);

    React.useEffect(() => { setF({ client_id: invoice?.client_id || "", description: invoice?.description || "", status: invoice?.status || "draft", due_date: invoice?.due_date || getRelativeDate(14), issued_date: invoice?.issued_date || getRelativeDate(0), recurring: invoice?.recurring || "none", line_items: invoice?.line_items || [{ description: "", amount: 0 }] }); setSelectedPackageId(""); }, [invoice]);

    useEffect(() => {
        if (isOpen) {
            fetch("/api/packages").then((r) => r.ok ? r.json() : []).then((data) => setPackages(data)).catch(() => { });
            fetch("/api/clients").then((r) => r.ok ? r.json() : []).then((data) => setClients(data)).catch(() => { });
        }
    }, [isOpen]);

    const handlePackageSelect = useCallback((pkgId: string) => {
        setSelectedPackageId(pkgId);
        if (!pkgId) return;
        const pkg = packages.find((p) => p.id === pkgId);
        if (!pkg) return;
        const existingExtras = (f.line_items || []).slice(1).filter((li) => li.description);
        setF((prev) => ({
            ...prev,
            description: pkg.description || pkg.name,
            recurring: pkg.type === "monthly" ? "monthly" : prev.recurring,
            line_items: [{ description: pkg.name, amount: pkg.price }, ...existingExtras],
        }));
    }, [packages, f.line_items]);

    if (!isOpen) return null;

    const lineItems = f.line_items || [];
    const total = lineItems.reduce((s, i) => s + (i.amount || 0), 0);
    const updateLineItem = (idx: number, field: string, value: string | number) => { const items = [...lineItems]; items[idx] = { ...items[idx], [field]: value }; setF({ ...f, line_items: items }); };
    const addLineItem = () => setF({ ...f, line_items: [...lineItems, { description: "", amount: 0 }] });
    const removeLineItem = (i: number) => setF({ ...f, line_items: lineItems.filter((_, idx) => idx !== i) });

    const handleSave = async () => {
        setSaving(true);
        onSave({
            id: invoice?.id,
            invoice_number: invoice?.invoice_number,
            client_id: f.client_id,
            description: f.description || "",
            status: f.status || "draft",
            amount: total,
            due_date: f.due_date || getRelativeDate(14),
            issued_date: f.issued_date || getRelativeDate(0),
            paid_date: invoice?.paid_date,
            recurring: f.recurring || "none",
            line_items: lineItems,
        });
        onClose();
        setSaving(false);
    };

    const inputCls = "flex h-10 w-full rounded-lg border border-border bg-surface px-3.5 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-brand-400/40 focus:border-brand-400 transition-all";
    const templateSettings = loadFromStorage<InvoiceTemplateSettings>(STORAGE_KEY_TEMPLATE, DEFAULT_TEMPLATE);
    const selectedClient = clients.find((c) => c.id === f.client_id);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-surface rounded-2xl border border-border shadow-xl w-full max-w-5xl mx-4 max-h-[90vh] flex flex-col animate-scale-in">
                <div className="flex items-center justify-between p-5 border-b border-border-light flex-shrink-0"><h2 className="font-display font-semibold text-lg text-text-primary">{isEdit ? "Edit Invoice" : "New Invoice"}</h2><button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-hover transition-colors"><X className="w-4 h-4 text-text-tertiary" /></button></div>
                <div className="flex-1 overflow-y-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 p-5">
                        {/* Left: Form */}
                        <div className="lg:col-span-3 space-y-5">
                            {/* Package + Client Row */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <label className="block text-sm font-medium text-text-secondary">Package</label>
                                    <div className="relative">
                                        <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                                        <select value={selectedPackageId} onChange={(e) => handlePackageSelect(e.target.value)} className={cn(inputCls, "pl-9")}>
                                            <option value="">No package (custom)</option>
                                            {packages.map((p) => <option key={p.id} value={p.id}>{p.name} — {formatCurrency(p.price)}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-1.5"><label className="block text-sm font-medium text-text-secondary">Client</label><select value={f.client_id} onChange={(e) => setF({ ...f, client_id: e.target.value })} className={inputCls}><option value="">Select client...</option>{clients.map((c) => <option key={c.id} value={c.id}>{c.business_name}</option>)}</select></div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5"><label className="block text-sm font-medium text-text-secondary">Recurring</label><div className="flex gap-1.5 flex-wrap">{Object.keys(recurringLabels).map((r) => (<button key={r} onClick={() => setF({ ...f, recurring: r as Invoice["recurring"] })} className={cn("px-2.5 py-1.5 rounded-full text-xs font-medium transition-all border", f.recurring === r ? "bg-brand-50 text-brand-700 border-brand-300" : "bg-surface border-border text-text-secondary hover:bg-surface-hover")}>{recurringLabels[r]}</button>))}</div></div>
                            </div>
                            <div className="space-y-1.5"><label className="block text-sm font-medium text-text-secondary">Description</label><input type="text" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} placeholder="e.g. March — Monthly Social Management" className={inputCls} /></div>
                            <div className="flex gap-3">
                                <div className="space-y-1.5"><label className="block text-sm font-medium text-text-secondary">Issue Date</label><input type="date" value={f.issued_date} onChange={(e) => setF({ ...f, issued_date: e.target.value })} className={cn(inputCls, "text-xs w-auto")} /></div>
                                <div className="space-y-1.5"><label className="block text-sm font-medium text-text-secondary">Due Date</label><input type="date" value={f.due_date} onChange={(e) => setF({ ...f, due_date: e.target.value })} className={cn(inputCls, "text-xs w-auto")} /></div>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-text-secondary">Line Items</label>
                                {selectedPackageId && lineItems.length > 0 && (
                                    <div className="text-[10px] text-text-tertiary bg-brand-50 text-brand-700 px-2 py-1 rounded-md inline-block mb-1">
                                        <Package className="w-3 h-3 inline mr-1" />First item from package — add extras below
                                    </div>
                                )}
                                {lineItems.map((item, i) => (<div key={i} className="flex items-center gap-2"><input type="text" value={item.description} onChange={(e) => updateLineItem(i, "description", e.target.value)} placeholder={i === 0 && selectedPackageId ? "Package item" : "Extra item description"} className={cn("flex h-9 flex-1 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-brand-400/40 focus:border-brand-400 transition-all", i === 0 && selectedPackageId && "border-brand-200 bg-brand-50/30")} /><div className={cn("flex items-center h-9 rounded-lg border border-border bg-surface overflow-hidden focus-within:ring-2 focus-within:ring-brand-400/40 focus-within:border-brand-400 transition-all", i === 0 && selectedPackageId && "border-brand-200 bg-brand-50/30")}><span className="pl-2.5 text-sm text-text-tertiary select-none">£</span><input type="number" value={item.amount} onChange={(e) => updateLineItem(i, "amount", Number(e.target.value))} placeholder="0" className="h-full w-20 bg-transparent pl-1 pr-2.5 py-1.5 text-sm text-text-primary text-right focus:outline-none" /></div>{lineItems.length > 1 && <button onClick={() => removeLineItem(i)} className="p-1.5 rounded-lg hover:bg-rose-50 text-text-tertiary hover:text-rose-500 transition-all"><X className="w-3.5 h-3.5" /></button>}</div>))}
                                <button onClick={addLineItem} className="text-xs font-medium text-brand-600 hover:text-brand-700 flex items-center gap-1"><Plus className="w-3 h-3" />{selectedPackageId ? "Add extra item" : "Add line item"}</button>
                                <div className="flex justify-end pt-2 border-t border-border-light"><span className="text-sm font-semibold text-text-primary">Total: {formatCurrency(total)}</span></div>
                            </div>
                        </div>
                        {/* Right: PDF Preview */}
                        <div className="lg:col-span-2 space-y-3">
                            <div className="flex items-center gap-2 text-sm font-display font-semibold text-text-primary">
                                <Eye className="w-4 h-4 text-brand-400" />
                                Live Preview
                            </div>
                            <div className="sticky top-0">
                                <div className="bg-surface-tertiary rounded-xl p-4 border border-border-light">
                                    <PdfPreview template={templateSettings} invoiceData={{ clientName: selectedClient?.business_name || "", description: f.description, invoiceNumber: invoice?.invoice_number || "SDS-XXXX", issuedDate: f.issued_date ? new Date(f.issued_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : undefined, dueDate: f.due_date ? new Date(f.due_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : undefined, lineItems: lineItems.filter((li) => li.description) }} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex items-center justify-between p-5 border-t border-border-light flex-shrink-0">
                    <div>{isEdit && onDelete && <Button variant="ghost" size="sm" onClick={() => { onDelete(invoice!.id); onClose(); }} className="text-error hover:text-error hover:bg-rose-50"><Trash2 className="w-4 h-4" />Delete</Button>}</div>
                    <div className="flex gap-2"><Button variant="secondary" size="sm" onClick={onClose}>Cancel</Button><Button size="sm" onClick={handleSave} disabled={saving}>{saving ? "Saving…" : isEdit ? "Save Changes" : "Create Invoice"}</Button></div>
                </div>
            </div>
        </div>
    );
}

// ─── Main Page ──────────────────────────────────────────
export default function InvoicesPage() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [datePreset, setDatePreset] = useState<DatePreset>("all");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [customPickerOpen, setCustomPickerOpen] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
    const [settingsOpen, setSettingsOpen] = useState(false);

    // Fetch invoices from API
    const fetchInvoices = useCallback(async () => {
        try {
            const res = await fetch("/api/invoices");
            if (res.ok) {
                const data = await res.json();
                setInvoices(data);
            }
        } catch (err) {
            console.error("Failed to fetch invoices:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchInvoices(); }, [fetchInvoices]);

    const handlePresetChange = useCallback((key: DatePreset) => {
        setDatePreset(key);
        if (key === "custom") {
            setCustomPickerOpen(true);
        } else {
            setCustomPickerOpen(false);
            const range = getPresetRange(key);
            setDateFrom(range.from);
            setDateTo(range.to);
        }
    }, []);

    const dateFiltered = useMemo(() => {
        return invoices.filter((inv) => {
            if (dateFrom && inv.issued_date < dateFrom) return false;
            if (dateTo && inv.issued_date > dateTo) return false;
            return true;
        });
    }, [invoices, dateFrom, dateTo]);

    const filtered = useMemo(() => dateFiltered.filter((inv) => { const q = search.toLowerCase(); return (inv.client_name.toLowerCase().includes(q) || inv.invoice_number.toLowerCase().includes(q) || inv.description.toLowerCase().includes(q)) && (statusFilter === "all" || inv.status === statusFilter); }), [dateFiltered, search, statusFilter]);

    const stats = useMemo(() => {
        const active = dateFiltered.filter((i) => ["sent", "paid", "overdue"].includes(i.status));
        return {
            total: active.reduce((s, i) => s + i.amount, 0),
            paid: active.filter((i) => i.status === "paid").reduce((s, i) => s + i.amount, 0),
            outstanding: active.filter((i) => ["sent", "overdue"].includes(i.status)).reduce((s, i) => s + i.amount, 0),
            overdue: active.filter((i) => i.status === "overdue").reduce((s, i) => s + i.amount, 0),
        };
    }, [dateFiltered]);

    const handleSave = async (inv: Partial<Invoice>) => {
        try {
            if (inv.id) {
                // Update existing
                const res = await fetch(`/api/invoices/${inv.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        client_id: inv.client_id,
                        description: inv.description,
                        status: inv.status,
                        amount: inv.amount,
                        due_date: inv.due_date,
                        issued_date: inv.issued_date,
                        paid_date: inv.paid_date,
                        recurring: inv.recurring,
                        line_items: inv.line_items,
                    }),
                });
                if (res.ok) {
                    const updated = await res.json();
                    setInvoices((prev) => prev.map((i) => i.id === updated.id ? updated : i));
                }
            } else {
                // Create new
                const res = await fetch("/api/invoices", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        client_id: inv.client_id,
                        description: inv.description,
                        status: inv.status,
                        amount: inv.amount,
                        due_date: inv.due_date,
                        issued_date: inv.issued_date,
                        paid_date: inv.paid_date,
                        recurring: inv.recurring,
                        line_items: inv.line_items,
                    }),
                });
                if (res.ok) {
                    const created = await res.json();
                    setInvoices((prev) => [created, ...prev]);
                }
            }
        } catch (err) {
            console.error("Failed to save invoice:", err);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const res = await fetch(`/api/invoices/${id}`, { method: "DELETE" });
            if (res.ok) {
                setInvoices((prev) => prev.filter((i) => i.id !== id));
            }
        } catch (err) {
            console.error("Failed to delete invoice:", err);
        }
    };

    const handleVoid = async (id: string) => {
        const inv = invoices.find((i) => i.id === id);
        if (!inv) return;
        const newStatus = inv.status === "void" ? "draft" : "void";
        try {
            const res = await fetch(`/api/invoices/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });
            if (res.ok) {
                const updated = await res.json();
                setInvoices((prev) => prev.map((i) => i.id === id ? updated : i));
            }
        } catch (err) {
            console.error("Failed to void invoice:", err);
        }
    };

    return (
        <>
            <Header title="Invoices" subtitle={`${invoices.length} invoices`} actions={<div className="flex items-center gap-2"><Button variant="secondary" size="icon-sm" onClick={() => setSettingsOpen(true)}><Settings2 className="w-4 h-4" /></Button><Button size="sm" onClick={() => { setEditingInvoice(null); setModalOpen(true); }}><Plus className="w-4 h-4" />New Invoice</Button></div>} />
            <div className="p-6 space-y-5 animate-fade-in">
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2.5 rounded-xl bg-lavender-50"><Receipt className="w-4 h-4 text-lavender-500" /></div><div><p className="text-xl font-display font-bold text-text-primary">{formatCurrency(stats.total)}</p><p className="text-[10px] text-text-tertiary font-medium">Total Invoiced</p></div></CardContent></Card>
                    <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2.5 rounded-xl bg-sage-50"><CheckCircle2 className="w-4 h-4 text-sage-500" /></div><div><p className="text-xl font-display font-bold text-text-primary">{formatCurrency(stats.paid)}</p><p className="text-[10px] text-text-tertiary font-medium">Paid</p></div></CardContent></Card>
                    <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2.5 rounded-xl bg-brand-50"><Clock className="w-4 h-4 text-brand-500" /></div><div><p className="text-xl font-display font-bold text-text-primary">{formatCurrency(stats.outstanding)}</p><p className="text-[10px] text-text-tertiary font-medium">Outstanding</p></div></CardContent></Card>
                    <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2.5 rounded-xl bg-rose-50"><AlertTriangle className="w-4 h-4 text-rose-500" /></div><div><p className="text-xl font-display font-bold text-text-primary">{formatCurrency(stats.overdue)}</p><p className="text-[10px] text-text-tertiary font-medium">Overdue</p></div></CardContent></Card>
                </div>
                {/* Date Range Presets */}
                <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-1 relative">
                        <Calendar className="w-3.5 h-3.5 text-text-tertiary mr-0.5" />
                        {DATE_PRESETS.map((p) => (
                            <button key={p.key} onClick={() => handlePresetChange(p.key)} className={cn("px-2.5 py-1.5 rounded-full text-[11px] font-medium transition-all whitespace-nowrap", datePreset === p.key ? "bg-brand-50 text-brand-700 border border-brand-300" : "bg-surface border border-border text-text-secondary hover:bg-surface-hover")}>
                                {p.label}
                            </button>
                        ))}
                        {datePreset === "custom" && customPickerOpen && (
                            <DateRangePopover dateFrom={dateFrom} dateTo={dateTo} onApply={(from, to) => { setDateFrom(from); setDateTo(to); }} onClose={() => setCustomPickerOpen(false)} />
                        )}
                    </div>
                    {datePreset !== "all" && <span className="text-[10px] text-text-tertiary">{dateFrom && new Date(dateFrom + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}{dateFrom && dateTo && " — "}{dateTo && new Date(dateTo + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>}
                </div>
                {/* Filters */}
                <div className="flex items-center gap-3 flex-wrap">
                    <div className="relative flex-1 max-w-sm"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" /><input type="text" placeholder="Search invoices..." value={search} onChange={(e) => setSearch(e.target.value)} className="h-9 w-full rounded-lg border border-border bg-surface pl-9 pr-3 text-sm placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-brand-400/40 focus:border-brand-400 transition-all" /></div>
                    <div className="flex items-center gap-1.5">{["all", ...Object.keys(statusConfig)].map((s) => (<button key={s} onClick={() => setStatusFilter(s)} className={cn("px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap capitalize", statusFilter === s ? s === "all" ? "bg-text-primary text-white" : `${statusConfig[s as InvoiceStatus].bg} ${statusConfig[s as InvoiceStatus].colour}` : "bg-surface border border-border text-text-secondary hover:bg-surface-hover")}>{s === "all" ? "All" : statusConfig[s as InvoiceStatus].label}</button>))}</div>
                </div>
                {/* Table */}
                <Card><CardContent className="p-0"><div className="overflow-x-auto"><table className="w-full">
                    <thead><tr className="border-b border-border-light">
                        <th className="text-left px-5 py-3 text-[10px] font-semibold text-text-tertiary uppercase tracking-wider">Invoice</th>
                        <th className="text-left px-5 py-3 text-[10px] font-semibold text-text-tertiary uppercase tracking-wider">Client</th>
                        <th className="text-left px-5 py-3 text-[10px] font-semibold text-text-tertiary uppercase tracking-wider">Description</th>
                        <th className="text-left px-5 py-3 text-[10px] font-semibold text-text-tertiary uppercase tracking-wider">Status</th>
                        <th className="text-right px-5 py-3 text-[10px] font-semibold text-text-tertiary uppercase tracking-wider">Amount</th>
                        <th className="text-left px-5 py-3 text-[10px] font-semibold text-text-tertiary uppercase tracking-wider">Due</th>
                        <th className="text-left px-5 py-3 text-[10px] font-semibold text-text-tertiary uppercase tracking-wider">Type</th>
                        <th className="px-5 py-3 w-10"></th>
                    </tr></thead>
                    <tbody>
                        {loading ? <tr><td colSpan={8} className="px-5 py-12 text-center text-sm text-text-tertiary">Loading invoices…</td></tr> : filtered.length === 0 ? <tr><td colSpan={8} className="px-5 py-12 text-center text-sm text-text-tertiary">No invoices found</td></tr> : filtered.map((inv) => {
                            const status = statusConfig[inv.status]; const StatusIcon = status.icon; const isVoid = inv.status === "void";
                            return (<tr key={inv.id} className={cn("border-b border-border-light hover:bg-surface-hover/50 transition-colors cursor-pointer group", isVoid && "opacity-50")}>
                                <td className="px-5 py-3.5" onClick={() => { setEditingInvoice(inv); setModalOpen(true); }}><span className={cn("text-xs font-semibold text-text-primary", isVoid && "line-through")}>{inv.invoice_number}</span></td>
                                <td className="px-5 py-3.5" onClick={() => { setEditingInvoice(inv); setModalOpen(true); }}><span className={cn("text-sm text-text-primary", isVoid && "line-through")}>{inv.client_name}</span></td>
                                <td className="px-5 py-3.5" onClick={() => { setEditingInvoice(inv); setModalOpen(true); }}><span className={cn("text-xs text-text-secondary truncate max-w-[200px] block", isVoid && "line-through")}>{inv.description}</span></td>
                                <td className="px-5 py-3.5" onClick={() => { setEditingInvoice(inv); setModalOpen(true); }}><Badge size="sm" className={cn(status.bg, status.colour)}><StatusIcon className="w-2.5 h-2.5" />{status.label}</Badge></td>
                                <td className="px-5 py-3.5 text-right" onClick={() => { setEditingInvoice(inv); setModalOpen(true); }}><span className={cn("text-sm font-semibold text-text-primary", isVoid && "line-through")}>{formatCurrency(inv.amount)}</span></td>
                                <td className="px-5 py-3.5" onClick={() => { setEditingInvoice(inv); setModalOpen(true); }}><span className={cn("text-xs", inv.status === "overdue" ? "text-rose-600 font-semibold" : "text-text-secondary")}>{formatDate(inv.due_date)}</span></td>
                                <td className="px-5 py-3.5" onClick={() => { setEditingInvoice(inv); setModalOpen(true); }}>{inv.recurring !== "none" && <Badge variant="outline" size="sm"><RefreshCw className="w-2.5 h-2.5" />{recurringLabels[inv.recurring]}</Badge>}</td>
                                <td className="px-5 py-3.5">
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={(e) => { e.stopPropagation(); handleVoid(inv.id); }} className={cn("p-1.5 rounded-lg transition-all", isVoid ? "hover:bg-sage-50 text-sage-500" : "hover:bg-surface-tertiary text-text-tertiary hover:text-text-secondary")} title={isVoid ? "Unvoid invoice" : "Mark as void"}>
                                            <Ban className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>);
                        })}
                    </tbody>
                </table></div></CardContent></Card>
            </div>
            <InvoiceModal invoice={editingInvoice} isOpen={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSave} onDelete={handleDelete} />
            <InvoiceSettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
        </>
    );
}
