"use client";

import React, { useState, useMemo } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import type { InvoiceStatus } from "@/lib/types";
import {
    Plus, X, Search, FileText, Clock, CheckCircle2, AlertTriangle,
    Send, Trash2, RefreshCw, ArrowUpRight, Receipt,
} from "lucide-react";

// ─── Config ─────────────────────────────────────────────
const statusConfig: Record<InvoiceStatus, { label: string; colour: string; bg: string; icon: React.ElementType }> = {
    draft: { label: "Draft", colour: "text-warm-600", bg: "bg-warm-100", icon: FileText },
    sent: { label: "Sent", colour: "text-blue-600", bg: "bg-blue-50", icon: Send },
    paid: { label: "Paid", colour: "text-sage-600", bg: "bg-sage-50", icon: CheckCircle2 },
    overdue: { label: "Overdue", colour: "text-rose-600", bg: "bg-rose-50", icon: AlertTriangle },
    cancelled: { label: "Cancelled", colour: "text-text-tertiary", bg: "bg-surface-tertiary", icon: X },
};

const recurringLabels: Record<string, string> = { none: "One-off", monthly: "Monthly", quarterly: "Quarterly", yearly: "Yearly" };

interface Invoice {
    id: string; invoice_number: string; client_name: string; status: InvoiceStatus;
    amount: number; due_date: string; issued_date: string; paid_date?: string;
    description: string; recurring: "none" | "monthly" | "quarterly" | "yearly";
    line_items: { description: string; amount: number }[];
}

function getRelativeDate(d: number): string { const dt = new Date(); dt.setDate(dt.getDate() + d); return dt.toISOString().split("T")[0]; }
let invoiceCounter = 1024;

const demoInvoices: Invoice[] = [
    { id: "1", invoice_number: "SDS-1019", client_name: "Glow Studio", status: "paid", amount: 450, due_date: getRelativeDate(-15), issued_date: getRelativeDate(-30), paid_date: getRelativeDate(-14), description: "February — Monthly Social Management", recurring: "monthly", line_items: [{ description: "Social Media Management", amount: 350 }, { description: "Reel Creation (x3)", amount: 100 }] },
    { id: "2", invoice_number: "SDS-1020", client_name: "Glow Studio", status: "sent", amount: 450, due_date: getRelativeDate(5), issued_date: getRelativeDate(-10), description: "March — Monthly Social Management", recurring: "monthly", line_items: [{ description: "Social Media Management", amount: 350 }, { description: "Reel Creation (x3)", amount: 100 }] },
    { id: "3", invoice_number: "SDS-1021", client_name: "The Garden Kitchen", status: "overdue", amount: 600, due_date: getRelativeDate(-3), issued_date: getRelativeDate(-17), description: "March — Content Creation + Strategy Session", recurring: "monthly", line_items: [{ description: "Content Creation Package", amount: 400 }, { description: "Monthly Strategy Session", amount: 200 }] },
    { id: "4", invoice_number: "SDS-1022", client_name: "FitLife Academy", status: "draft", amount: 850, due_date: getRelativeDate(14), issued_date: getRelativeDate(0), description: "Q2 Social Strategy + Management", recurring: "quarterly", line_items: [{ description: "Quarterly Strategy Package", amount: 500 }, { description: "Social Media Management (Q2)", amount: 350 }] },
    { id: "5", invoice_number: "SDS-1018", client_name: "Serenity Spa", status: "paid", amount: 900, due_date: getRelativeDate(-45), issued_date: getRelativeDate(-60), paid_date: getRelativeDate(-43), description: "January — Full Package", recurring: "monthly", line_items: [{ description: "Full Package — Social + Content + Strategy", amount: 900 }] },
    { id: "6", invoice_number: "SDS-1017", client_name: "Serenity Spa", status: "paid", amount: 900, due_date: getRelativeDate(-75), issued_date: getRelativeDate(-90), paid_date: getRelativeDate(-74), description: "December — Full Package", recurring: "monthly", line_items: [{ description: "Full Package — Social + Content + Strategy", amount: 900 }] },
];

// ─── Invoice Modal ──────────────────────────────────────
function InvoiceModal({ invoice, isOpen, onClose, onSave, onDelete }: { invoice?: Invoice | null; isOpen: boolean; onClose: () => void; onSave: (i: Invoice) => void; onDelete?: (id: string) => void }) {
    const isEdit = !!invoice;
    const [f, setF] = useState<Partial<Invoice>>({ client_name: invoice?.client_name || "", description: invoice?.description || "", status: invoice?.status || "draft", due_date: invoice?.due_date || getRelativeDate(14), issued_date: invoice?.issued_date || getRelativeDate(0), recurring: invoice?.recurring || "none", line_items: invoice?.line_items || [{ description: "", amount: 0 }] });

    React.useEffect(() => { setF({ client_name: invoice?.client_name || "", description: invoice?.description || "", status: invoice?.status || "draft", due_date: invoice?.due_date || getRelativeDate(14), issued_date: invoice?.issued_date || getRelativeDate(0), recurring: invoice?.recurring || "none", line_items: invoice?.line_items || [{ description: "", amount: 0 }] }); }, [invoice]);

    if (!isOpen) return null;

    const lineItems = f.line_items || [];
    const total = lineItems.reduce((s, i) => s + (i.amount || 0), 0);
    const updateLineItem = (idx: number, field: string, value: string | number) => { const items = [...lineItems]; items[idx] = { ...items[idx], [field]: value }; setF({ ...f, line_items: items }); };
    const addLineItem = () => setF({ ...f, line_items: [...lineItems, { description: "", amount: 0 }] });
    const removeLineItem = (i: number) => setF({ ...f, line_items: lineItems.filter((_, idx) => idx !== i) });

    const handleSave = () => { invoiceCounter++; onSave({ id: invoice?.id || `inv-${Date.now()}`, invoice_number: invoice?.invoice_number || `SDS-${invoiceCounter}`, client_name: f.client_name || "New Client", description: f.description || "", status: f.status || "draft", amount: total, due_date: f.due_date || getRelativeDate(14), issued_date: f.issued_date || getRelativeDate(0), paid_date: invoice?.paid_date, recurring: f.recurring || "none", line_items: lineItems }); onClose(); };
    const clients = ["Glow Studio", "The Garden Kitchen", "FitLife Academy", "Serenity Spa"];
    const inputCls = "flex h-10 w-full rounded-lg border border-border bg-surface px-3.5 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-brand-400/40 focus:border-brand-400 transition-all";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-surface rounded-2xl border border-border shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto animate-scale-in">
                <div className="flex items-center justify-between p-5 border-b border-border-light"><h2 className="font-display font-semibold text-lg text-text-primary">{isEdit ? "Edit Invoice" : "New Invoice"}</h2><button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-hover transition-colors"><X className="w-4 h-4 text-text-tertiary" /></button></div>
                <div className="p-5 space-y-5">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5"><label className="block text-sm font-medium text-text-secondary">Client</label><select value={f.client_name} onChange={(e) => setF({ ...f, client_name: e.target.value })} className={inputCls}><option value="">Select client...</option>{clients.map((c) => <option key={c} value={c}>{c}</option>)}</select></div>
                        <div className="space-y-1.5"><label className="block text-sm font-medium text-text-secondary">Recurring</label><div className="flex gap-1.5 flex-wrap">{Object.keys(recurringLabels).map((r) => (<button key={r} onClick={() => setF({ ...f, recurring: r as Invoice["recurring"] })} className={cn("px-2.5 py-1.5 rounded-full text-xs font-medium transition-all border", f.recurring === r ? "bg-brand-50 text-brand-700 border-brand-300" : "bg-surface border-border text-text-secondary hover:bg-surface-hover")}>{recurringLabels[r]}</button>))}</div></div>
                    </div>
                    <div className="space-y-1.5"><label className="block text-sm font-medium text-text-secondary">Description</label><input type="text" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} placeholder="e.g. March — Monthly Social Management" className={inputCls} /></div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5"><label className="block text-sm font-medium text-text-secondary">Issue Date</label><input type="date" value={f.issued_date} onChange={(e) => setF({ ...f, issued_date: e.target.value })} className={inputCls} /></div>
                        <div className="space-y-1.5"><label className="block text-sm font-medium text-text-secondary">Due Date</label><input type="date" value={f.due_date} onChange={(e) => setF({ ...f, due_date: e.target.value })} className={inputCls} /></div>
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-text-secondary">Line Items</label>
                        {lineItems.map((item, i) => (<div key={i} className="flex items-center gap-2"><input type="text" value={item.description} onChange={(e) => updateLineItem(i, "description", e.target.value)} placeholder="Description" className="flex h-9 flex-1 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-brand-400/40 focus:border-brand-400 transition-all" /><input type="number" value={item.amount} onChange={(e) => updateLineItem(i, "amount", Number(e.target.value))} placeholder="0" className="flex h-9 w-24 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-text-primary text-right focus:outline-none focus:ring-2 focus:ring-brand-400/40 focus:border-brand-400 transition-all" />{lineItems.length > 1 && <button onClick={() => removeLineItem(i)} className="p-1.5 rounded-lg hover:bg-rose-50 text-text-tertiary hover:text-rose-500 transition-all"><X className="w-3.5 h-3.5" /></button>}</div>))}
                        <button onClick={addLineItem} className="text-xs font-medium text-brand-600 hover:text-brand-700 flex items-center gap-1"><Plus className="w-3 h-3" />Add line item</button>
                        <div className="flex justify-end pt-2 border-t border-border-light"><span className="text-sm font-semibold text-text-primary">Total: {formatCurrency(total)}</span></div>
                    </div>
                </div>
                <div className="flex items-center justify-between p-5 border-t border-border-light">
                    <div>{isEdit && onDelete && <Button variant="ghost" size="sm" onClick={() => { onDelete(invoice!.id); onClose(); }} className="text-error hover:text-error hover:bg-rose-50"><Trash2 className="w-4 h-4" />Delete</Button>}</div>
                    <div className="flex gap-2"><Button variant="secondary" size="sm" onClick={onClose}>Cancel</Button><Button size="sm" onClick={handleSave}>{isEdit ? "Save Changes" : "Create Invoice"}</Button></div>
                </div>
            </div>
        </div>
    );
}

// ─── Main Page ──────────────────────────────────────────
export default function InvoicesPage() {
    const [invoices, setInvoices] = useState<Invoice[]>(demoInvoices);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [modalOpen, setModalOpen] = useState(false);
    const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);

    const filtered = useMemo(() => invoices.filter((inv) => { const q = search.toLowerCase(); return (inv.client_name.toLowerCase().includes(q) || inv.invoice_number.toLowerCase().includes(q) || inv.description.toLowerCase().includes(q)) && (statusFilter === "all" || inv.status === statusFilter); }), [invoices, search, statusFilter]);

    const stats = useMemo(() => ({ total: invoices.reduce((s, i) => s + i.amount, 0), paid: invoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.amount, 0), outstanding: invoices.filter((i) => ["sent", "overdue"].includes(i.status)).reduce((s, i) => s + i.amount, 0), overdue: invoices.filter((i) => i.status === "overdue").reduce((s, i) => s + i.amount, 0) }), [invoices]);

    const handleSave = (inv: Invoice) => { setInvoices((prev) => { const idx = prev.findIndex((i) => i.id === inv.id); if (idx >= 0) { const u = [...prev]; u[idx] = inv; return u; } return [...prev, inv]; }); };
    const handleDelete = (id: string) => setInvoices((prev) => prev.filter((i) => i.id !== id));

    return (
        <>
            <Header title="Invoices" subtitle={`${invoices.length} invoices`} actions={<Button size="sm" onClick={() => { setEditingInvoice(null); setModalOpen(true); }}><Plus className="w-4 h-4" />New Invoice</Button>} />
            <div className="p-6 space-y-5 animate-fade-in">
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2.5 rounded-xl bg-lavender-50"><Receipt className="w-4 h-4 text-lavender-500" /></div><div><p className="text-xl font-display font-bold text-text-primary">{formatCurrency(stats.total)}</p><p className="text-[10px] text-text-tertiary font-medium">Total Invoiced</p></div></CardContent></Card>
                    <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2.5 rounded-xl bg-sage-50"><CheckCircle2 className="w-4 h-4 text-sage-500" /></div><div><p className="text-xl font-display font-bold text-text-primary">{formatCurrency(stats.paid)}</p><p className="text-[10px] text-text-tertiary font-medium">Paid</p></div></CardContent></Card>
                    <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2.5 rounded-xl bg-brand-50"><Clock className="w-4 h-4 text-brand-500" /></div><div><p className="text-xl font-display font-bold text-text-primary">{formatCurrency(stats.outstanding)}</p><p className="text-[10px] text-text-tertiary font-medium">Outstanding</p></div></CardContent></Card>
                    <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2.5 rounded-xl bg-rose-50"><AlertTriangle className="w-4 h-4 text-rose-500" /></div><div><p className="text-xl font-display font-bold text-text-primary">{formatCurrency(stats.overdue)}</p><p className="text-[10px] text-text-tertiary font-medium">Overdue</p></div></CardContent></Card>
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
                        {filtered.length === 0 ? <tr><td colSpan={8} className="px-5 py-12 text-center text-sm text-text-tertiary">No invoices found</td></tr> : filtered.map((inv) => {
                            const status = statusConfig[inv.status]; const StatusIcon = status.icon;
                            return (<tr key={inv.id} onClick={() => { setEditingInvoice(inv); setModalOpen(true); }} className="border-b border-border-light hover:bg-surface-hover/50 transition-colors cursor-pointer group">
                                <td className="px-5 py-3.5"><span className="text-xs font-semibold text-text-primary">{inv.invoice_number}</span></td>
                                <td className="px-5 py-3.5"><span className="text-sm text-text-primary">{inv.client_name}</span></td>
                                <td className="px-5 py-3.5"><span className="text-xs text-text-secondary truncate max-w-[200px] block">{inv.description}</span></td>
                                <td className="px-5 py-3.5"><Badge size="sm" className={cn(status.bg, status.colour)}><StatusIcon className="w-2.5 h-2.5" />{status.label}</Badge></td>
                                <td className="px-5 py-3.5 text-right"><span className="text-sm font-semibold text-text-primary">{formatCurrency(inv.amount)}</span></td>
                                <td className="px-5 py-3.5"><span className={cn("text-xs", inv.status === "overdue" ? "text-rose-600 font-semibold" : "text-text-secondary")}>{formatDate(inv.due_date)}</span></td>
                                <td className="px-5 py-3.5">{inv.recurring !== "none" && <Badge variant="outline" size="sm"><RefreshCw className="w-2.5 h-2.5" />{recurringLabels[inv.recurring]}</Badge>}</td>
                                <td className="px-5 py-3.5"><ArrowUpRight className="w-3.5 h-3.5 text-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity" /></td>
                            </tr>);
                        })}
                    </tbody>
                </table></div></CardContent></Card>
            </div>
            <InvoiceModal invoice={editingInvoice} isOpen={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSave} onDelete={handleDelete} />
        </>
    );
}
