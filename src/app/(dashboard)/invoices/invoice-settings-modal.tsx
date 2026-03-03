"use client";

import React, { useState, useCallback, useMemo, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn, formatCurrency } from "@/lib/utils";
import {
    X, Settings2, Mail, FileText, Plus, Trash2, Eye,
    Type, Bold, Italic, List, Link2, ChevronDown, Palette, Upload, ImageIcon
} from "lucide-react";
import { ColourPicker } from "@/components/ui/colour-picker";
import "react-quill-new/dist/quill.snow.css";

// Lazy-load react-quill to avoid SSR issues
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false, loading: () => <div className="h-[220px] bg-surface-secondary rounded-lg animate-shimmer" /> });

// ─── Types ──────────────────────────────────────────────
export interface InvoiceTemplateSettings {
    companyName: string;
    companyEmail: string;
    companyPhone: string;
    companyAddress: string;
    logoUrl: string;
    accentColor: string;
    paymentDetails: string;
    footerText: string;
    bankName: string;
    accountNumber: string;
    sortCode: string;
    includePaymentTerms: boolean;
    paymentTermsDays: number;
}

interface EmailTemplateSettings {
    subject: string;
    body: string;
    replyTo: string;
}

interface InvoiceSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

// ─── Merge Fields ───────────────────────────────────────
const MERGE_FIELDS = [
    { token: "{{client_name}}", label: "Client Name", sample: "Glow Studio" },
    { token: "{{invoice_number}}", label: "Invoice #", sample: "SDS-1025" },
    { token: "{{invoice_amount}}", label: "Amount", sample: "£450.00" },
    { token: "{{due_date}}", label: "Due Date", sample: "20 Mar 2026" },
    { token: "{{company_name}}", label: "Your Company", sample: "She Does Socials" },
    { token: "{{description}}", label: "Description", sample: "March — Monthly Social Management" },
    { token: "{{payment_link}}", label: "Payment Link", sample: "https://pay.example.com/inv-123" },
];

// ─── Default values ─────────────────────────────────────
export const DEFAULT_TEMPLATE: InvoiceTemplateSettings = {
    companyName: "She Does Socials",
    companyEmail: "hello@shedoessocials.co.uk",
    companyPhone: "",
    companyAddress: "",
    logoUrl: "",
    accentColor: "#f472b6",
    paymentDetails: "",
    footerText: "Thank you for your business!",
    bankName: "",
    accountNumber: "",
    sortCode: "",
    includePaymentTerms: true,
    paymentTermsDays: 14,
};

const DEFAULT_EMAIL: EmailTemplateSettings = {
    subject: "Invoice {{invoice_number}} from {{company_name}}",
    body: `<p>Hi {{client_name}},</p>
<p>Please find attached your invoice <strong>{{invoice_number}}</strong> for <strong>{{invoice_amount}}</strong>.</p>
<p>This invoice is for: {{description}}</p>
<p>Payment is due by <strong>{{due_date}}</strong>.</p>
<p>If you have any questions about this invoice, please don't hesitate to get in touch.</p>
<p>Thank you,<br/>{{company_name}}</p>`,
    replyTo: "",
};

export const STORAGE_KEY_TEMPLATE = "sds-invoice-template";
const STORAGE_KEY_EMAIL = "sds-invoice-email";

export function loadFromStorage<T>(key: string, fallback: T): T {
    if (typeof window === "undefined") return fallback;
    try {
        const s = localStorage.getItem(key);
        return s ? JSON.parse(s) : fallback;
    } catch { return fallback; }
}

// ─── Quill modules ──────────────────────────────────────
const quillModules = {
    toolbar: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["link"],
        ["clean"],
    ],
};

const quillFormats = ["header", "bold", "italic", "underline", "list", "link"];

// ─── PDF Preview Component ─────────────────────────────
export function PdfPreview({ template, invoiceData }: { template: InvoiceTemplateSettings; invoiceData?: { clientName?: string; clientEmail?: string; description?: string; invoiceNumber?: string; issuedDate?: string; dueDate?: string; lineItems?: { description: string; amount: number }[] } }) {
    const sampleItems = invoiceData?.lineItems?.length ? invoiceData.lineItems : [
        { description: "Social Media Management", amount: 350 },
        { description: "Reel Creation (x3)", amount: 100 },
    ];
    const total = sampleItems.reduce((s, i) => s + i.amount, 0);

    return (
        <div className="bg-white rounded-lg shadow-lg border border-border-light overflow-hidden" style={{ fontSize: "10px" }}>
            {/* PDF Header */}
            <div className="p-5 flex items-start justify-between" style={{ borderBottom: `3px solid ${template.accentColor}` }}>
                <div>
                    {template.logoUrl ? (
                        <img src={template.logoUrl} alt="Logo" className="h-8 w-auto mb-2" />
                    ) : (
                        <div className="text-base font-display font-bold" style={{ color: template.accentColor }}>
                            {template.companyName || "Your Company"}
                        </div>
                    )}
                    {template.companyAddress && (
                        <div className="text-[9px] text-text-tertiary mt-1 whitespace-pre-line leading-tight max-w-[140px]">
                            {template.companyAddress}
                        </div>
                    )}
                    {template.companyEmail && (
                        <div className="text-[9px] text-text-tertiary">{template.companyEmail}</div>
                    )}
                    {template.companyPhone && (
                        <div className="text-[9px] text-text-tertiary">{template.companyPhone}</div>
                    )}
                </div>
                <div className="text-right">
                    <div className="text-lg font-display font-bold text-text-primary">INVOICE</div>
                    <div className="text-[9px] text-text-tertiary mt-1">
                        <div>Invoice: <span className="font-semibold text-text-secondary">{invoiceData?.invoiceNumber || "SDS-1025"}</span></div>
                        <div>Date: <span className="font-semibold text-text-secondary">{invoiceData?.issuedDate || "3 Mar 2026"}</span></div>
                        <div>Due: <span className="font-semibold text-text-secondary">{invoiceData?.dueDate || "17 Mar 2026"}</span></div>
                    </div>
                </div>
            </div>

            {/* Bill To */}
            <div className="px-5 pt-4 pb-2">
                <div className="text-[8px] font-semibold text-text-tertiary uppercase tracking-wider mb-1">Bill To</div>
                <div className="text-[10px] font-semibold text-text-primary">{invoiceData?.clientName || "Glow Studio"}</div>
                <div className="text-[9px] text-text-tertiary">{invoiceData?.clientEmail || "glow@example.com"}</div>
            </div>

            {/* Description */}
            <div className="px-5 pb-2">
                <div className="text-[9px] text-text-secondary italic">{invoiceData?.description || "March — Monthly Social Management"}</div>
            </div>

            {/* Line Items */}
            <div className="px-5 pb-3">
                <table className="w-full">
                    <thead>
                        <tr style={{ borderBottom: `1px solid ${template.accentColor}30` }}>
                            <th className="text-left text-[8px] font-semibold text-text-tertiary uppercase tracking-wider py-1.5">Item</th>
                            <th className="text-right text-[8px] font-semibold text-text-tertiary uppercase tracking-wider py-1.5">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sampleItems.map((item, i) => (
                            <tr key={i} className="border-b border-border-light">
                                <td className="text-[9px] text-text-primary py-1.5">{item.description}</td>
                                <td className="text-[9px] text-text-primary text-right py-1.5">{formatCurrency(item.amount)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {/* Total */}
                <div className="flex justify-end pt-2">
                    <div className="flex items-baseline gap-3">
                        <span className="text-[9px] font-semibold text-text-tertiary uppercase">Total</span>
                        <span className="text-sm font-display font-bold" style={{ color: template.accentColor }}>
                            {formatCurrency(total)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Payment Details */}
            {(template.bankName || template.accountNumber || template.sortCode || template.paymentDetails) && (
                <div className="px-5 py-3 bg-surface-secondary border-t border-border-light">
                    <div className="text-[8px] font-semibold text-text-tertiary uppercase tracking-wider mb-1">Payment Details</div>
                    {template.bankName && <div className="text-[9px] text-text-secondary">Bank: {template.bankName}</div>}
                    {template.sortCode && <div className="text-[9px] text-text-secondary">Sort Code: {template.sortCode}</div>}
                    {template.accountNumber && <div className="text-[9px] text-text-secondary">Account: {template.accountNumber}</div>}
                    {template.paymentDetails && <div className="text-[9px] text-text-secondary mt-1">{template.paymentDetails}</div>}
                </div>
            )}

            {/* Footer */}
            {template.footerText && (
                <div className="px-5 py-3 text-center border-t border-border-light">
                    <div className="text-[8px] text-text-tertiary">{template.footerText}</div>
                </div>
            )}

            {/* Payment Terms */}
            {template.includePaymentTerms && (
                <div className="px-5 pb-3 text-center">
                    <div className="text-[8px] text-text-tertiary">
                        Payment terms: {template.paymentTermsDays} days from invoice date
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Email Preview Component ───────────────────────────
function EmailPreview({ email, companyName, accentColor }: { email: EmailTemplateSettings; companyName: string; accentColor: string }) {
    const resolvedSubject = useMemo(() => {
        let s = email.subject;
        MERGE_FIELDS.forEach((f) => { s = s.replaceAll(f.token, f.sample); });
        return s;
    }, [email.subject]);

    const resolvedBody = useMemo(() => {
        let b = email.body;
        MERGE_FIELDS.forEach((f) => { b = b.replaceAll(f.token, `<span style="color:${accentColor};font-weight:600">${f.sample}</span>`); });
        return b;
    }, [email.body, accentColor]);

    return (
        <div className="bg-white rounded-lg shadow-lg border border-border-light overflow-hidden" style={{ fontSize: "11px" }}>
            {/* Email header bar */}
            <div className="px-4 py-3 bg-surface-secondary border-b border-border-light space-y-1.5">
                <div className="flex items-center gap-2">
                    <span className="text-[9px] font-semibold text-text-tertiary uppercase w-10">From</span>
                    <span className="text-[10px] text-text-secondary">{companyName} &lt;{email.replyTo || "hello@shedoessocials.co.uk"}&gt;</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[9px] font-semibold text-text-tertiary uppercase w-10">To</span>
                    <span className="text-[10px] text-text-secondary">Glow Studio &lt;glow@example.com&gt;</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[9px] font-semibold text-text-tertiary uppercase w-10">Subject</span>
                    <span className="text-[10px] font-medium text-text-primary">{resolvedSubject}</span>
                </div>
            </div>
            {/* Email body */}
            <div className="px-5 py-4">
                <div
                    className="text-[11px] text-text-primary leading-relaxed [&_p]:mb-2 [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_a]:text-brand-600 [&_a]:underline"
                    dangerouslySetInnerHTML={{ __html: resolvedBody }}
                />
            </div>
            {/* Attachment bar */}
            <div className="px-4 py-2.5 bg-surface-secondary border-t border-border-light flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-text-tertiary" />
                <span className="text-[10px] text-text-secondary">Invoice_SDS-1025.pdf</span>
                <span className="text-[9px] text-text-tertiary ml-auto">42 KB</span>
            </div>
        </div>
    );
}

// ─── Main Modal ────────────────────────────────────────
export function InvoiceSettingsModal({ isOpen, onClose }: InvoiceSettingsModalProps) {
    const [activeTab, setActiveTab] = useState<"template" | "email">("template");
    const [template, setTemplate] = useState<InvoiceTemplateSettings>(() => loadFromStorage(STORAGE_KEY_TEMPLATE, DEFAULT_TEMPLATE));
    const [email, setEmail] = useState<EmailTemplateSettings>(() => loadFromStorage(STORAGE_KEY_EMAIL, DEFAULT_EMAIL));
    const [saved, setSaved] = useState(false);
    const quillRef = useRef<any>(null);
    const quillCallbackRef = useCallback((el: any) => { if (el) quillRef.current = el; }, []);

    useEffect(() => {
        if (isOpen) {
            setTemplate(loadFromStorage(STORAGE_KEY_TEMPLATE, DEFAULT_TEMPLATE));
            setEmail(loadFromStorage(STORAGE_KEY_EMAIL, DEFAULT_EMAIL));
            setSaved(false);
        }
    }, [isOpen]);

    const handleSave = useCallback(() => {
        localStorage.setItem(STORAGE_KEY_TEMPLATE, JSON.stringify(template));
        localStorage.setItem(STORAGE_KEY_EMAIL, JSON.stringify(email));
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    }, [template, email]);

    const insertMergeField = useCallback((token: string): void => {
        const editor = quillRef.current?.getEditor?.();
        if (editor) {
            const range = editor.getSelection(true);
            if (range) {
                editor.insertText(range.index, token, "user");
                editor.setSelection(range.index + token.length);
            } else {
                const len = editor.getLength();
                editor.insertText(len - 1, token, "user");
            }
        } else {
            setEmail((prev) => ({ ...prev, body: prev.body + token }));
        }
    }, []);

    const updateTemplate = useCallback(<K extends keyof InvoiceTemplateSettings>(key: K, value: InvoiceTemplateSettings[K]) => {
        setTemplate((prev) => ({ ...prev, [key]: value }));
    }, []);

    if (!isOpen) return null;

    const inputCls = "flex h-9 w-full rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-brand-400/40 focus:border-brand-400 transition-all";
    const labelCls = "block text-xs font-semibold text-text-secondary mb-1";

    const tabs = [
        { key: "template" as const, label: "Invoice Template", icon: FileText },
        { key: "email" as const, label: "Email Template", icon: Mail },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-surface rounded-2xl border border-border shadow-xl w-full max-w-6xl mx-4 max-h-[92vh] flex flex-col animate-scale-in">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border-light flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-brand-50">
                            <Settings2 className="w-5 h-5 text-brand-500" />
                        </div>
                        <div>
                            <h2 className="font-display font-semibold text-lg text-text-primary">Invoice Settings</h2>
                            <p className="text-xs text-text-tertiary">Customise your invoice template and email</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            variant={saved ? "success" : "primary"}
                            onClick={handleSave}
                        >
                            {saved ? "✓ Saved!" : "Save Settings"}
                        </Button>
                        <button onClick={onClose} className="p-2 rounded-lg hover:bg-surface-hover transition-colors">
                            <X className="w-4 h-4 text-text-tertiary" />
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="px-6 pt-3 flex-shrink-0">
                    <div className="flex gap-1 bg-surface-tertiary rounded-xl p-1">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    className={cn(
                                        "flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                                        activeTab === tab.key
                                            ? "bg-surface text-text-primary shadow-sm"
                                            : "text-text-tertiary hover:text-text-secondary"
                                    )}
                                >
                                    <Icon className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {activeTab === "template" ? (
                        <TemplateTab template={template} updateTemplate={updateTemplate} inputCls={inputCls} labelCls={labelCls} />
                    ) : (
                        <EmailTab
                            quillCallbackRef={quillCallbackRef}
                            email={email}
                            setEmail={setEmail}

                            insertMergeField={insertMergeField}
                            quillRef={quillRef}
                            companyName={template.companyName}
                            accentColor={template.accentColor}
                            inputCls={inputCls}
                            labelCls={labelCls}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Logo Upload Component ─────────────────────────────
function LogoUpload({ logoUrl, onLogoChange }: { logoUrl: string; onLogoChange: (url: string) => void }) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith("image/")) {
            alert("Please upload an image file (PNG, JPG, SVG, etc.)");
            return;
        }

        // Validate size (max 2MB for localStorage)
        if (file.size > 2 * 1024 * 1024) {
            alert("Logo must be under 2MB");
            return;
        }

        setUploading(true);
        const reader = new FileReader();
        reader.onload = (ev) => {
            const dataUrl = ev.target?.result as string;
            onLogoChange(dataUrl);
            setUploading(false);
        };
        reader.onerror = () => {
            alert("Failed to read file");
            setUploading(false);
        };
        reader.readAsDataURL(file);

        // Reset input so re-uploading same file works
        e.target.value = "";
    }, [onLogoChange]);

    return (
        <div>
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
            />
            {logoUrl ? (
                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <img
                            src={logoUrl}
                            alt="Company logo"
                            className="h-12 w-auto max-w-[120px] rounded-lg border border-border object-contain bg-white p-1"
                        />
                        <button
                            onClick={() => onLogoChange("")}
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs font-medium text-brand-600 hover:text-brand-700 transition-colors"
                    >
                        Change
                    </button>
                </div>
            ) : (
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg border border-dashed border-border-strong bg-surface-secondary hover:bg-surface-hover hover:border-brand-300 transition-all cursor-pointer group"
                >
                    <div className="p-2 rounded-lg bg-brand-50 group-hover:bg-brand-100 transition-colors">
                        {uploading ? (
                            <svg className="animate-spin w-4 h-4 text-brand-500" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                        ) : (
                            <Upload className="w-4 h-4 text-brand-500" />
                        )}
                    </div>
                    <div className="text-left">
                        <div className="text-xs font-medium text-text-primary">
                            {uploading ? "Uploading..." : "Upload logo"}
                        </div>
                        <div className="text-[10px] text-text-tertiary">PNG, JPG, or SVG — max 2MB</div>
                    </div>
                </button>
            )}
        </div>
    );
}

// ─── Template Tab ──────────────────────────────────────
function TemplateTab({
    template,
    updateTemplate,
    inputCls,
    labelCls,
}: {
    template: InvoiceTemplateSettings;
    updateTemplate: <K extends keyof InvoiceTemplateSettings>(key: K, value: InvoiceTemplateSettings[K]) => void;
    inputCls: string;
    labelCls: string;
}) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Form */}
            <div className="space-y-5">
                {/* Company Info */}
                <Card>
                    <CardContent className="p-4 space-y-3">
                        <h3 className="text-sm font-display font-semibold text-text-primary flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-brand-400" />
                            Company Details
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className={labelCls}>Company Name</label>
                                <input type="text" value={template.companyName} onChange={(e) => updateTemplate("companyName", e.target.value)} className={inputCls} placeholder="She Does Socials" />
                            </div>
                            <div>
                                <label className={labelCls}>Email</label>
                                <input type="email" value={template.companyEmail} onChange={(e) => updateTemplate("companyEmail", e.target.value)} className={inputCls} placeholder="hello@example.com" />
                            </div>
                        </div>
                        <div>
                            <label className={labelCls}>Phone</label>
                            <input type="tel" value={template.companyPhone} onChange={(e) => updateTemplate("companyPhone", e.target.value)} className={inputCls} placeholder="07xxx xxx xxx" />
                        </div>
                        <div>
                            <label className={labelCls}>Logo</label>
                            <LogoUpload logoUrl={template.logoUrl} onLogoChange={(url) => updateTemplate("logoUrl", url)} />
                        </div>
                        <div>
                            <label className={labelCls}>Address</label>
                            <textarea
                                value={template.companyAddress}
                                onChange={(e) => updateTemplate("companyAddress", e.target.value)}
                                rows={2}
                                className={cn(inputCls, "h-auto py-2 resize-none")}
                                placeholder="123 High Street&#10;London, SW1A 1AA"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Accent Colour */}
                <Card>
                    <CardContent className="p-4 space-y-3">
                        <h3 className="text-sm font-display font-semibold text-text-primary flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-lavender-400" />
                            Branding
                        </h3>
                        <div className="flex items-center gap-3">
                            <label className={cn(labelCls, "mb-0")}>Accent Colour</label>
                            <div className="flex items-center gap-2">
                                <ColourPicker
                                    value={template.accentColor}
                                    onChange={(hex) => updateTemplate("accentColor", hex)}
                                />
                                <input
                                    type="text"
                                    value={template.accentColor}
                                    onChange={(e) => updateTemplate("accentColor", e.target.value)}
                                    className={cn(inputCls, "w-28 font-mono text-xs")}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Payment Details */}
                <Card>
                    <CardContent className="p-4 space-y-3">
                        <h3 className="text-sm font-display font-semibold text-text-primary flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-sage-400" />
                            Payment Details
                        </h3>
                        <div className="grid grid-cols-3 gap-3">
                            <div>
                                <label className={labelCls}>Bank Name</label>
                                <input type="text" value={template.bankName} onChange={(e) => updateTemplate("bankName", e.target.value)} className={inputCls} placeholder="Monzo" />
                            </div>
                            <div>
                                <label className={labelCls}>Sort Code</label>
                                <input type="text" value={template.sortCode} onChange={(e) => updateTemplate("sortCode", e.target.value)} className={inputCls} placeholder="XX-XX-XX" />
                            </div>
                            <div>
                                <label className={labelCls}>Account Number</label>
                                <input type="text" value={template.accountNumber} onChange={(e) => updateTemplate("accountNumber", e.target.value)} className={inputCls} placeholder="XXXXXXXX" />
                            </div>
                        </div>
                        <div>
                            <label className={labelCls}>Additional Payment Notes</label>
                            <input type="text" value={template.paymentDetails} onChange={(e) => updateTemplate("paymentDetails", e.target.value)} className={inputCls} placeholder="e.g. PayPal: hello@shedoessocials.co.uk" />
                        </div>
                        <div className="flex items-center gap-3">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={template.includePaymentTerms}
                                    onChange={(e) => updateTemplate("includePaymentTerms", e.target.checked)}
                                    className="w-4 h-4 rounded border-border text-brand-500 focus:ring-brand-400/40"
                                />
                                <span className="text-xs text-text-secondary">Include payment terms</span>
                            </label>
                            {template.includePaymentTerms && (
                                <div className="flex items-center gap-1.5">
                                    <input
                                        type="number"
                                        value={template.paymentTermsDays}
                                        onChange={(e) => updateTemplate("paymentTermsDays", Number(e.target.value))}
                                        className={cn(inputCls, "w-16 text-center")}
                                        min={1}
                                    />
                                    <span className="text-xs text-text-tertiary">days</span>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Footer */}
                <Card>
                    <CardContent className="p-4 space-y-3">
                        <h3 className="text-sm font-display font-semibold text-text-primary flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-warm-400" />
                            Footer
                        </h3>
                        <div>
                            <label className={labelCls}>Footer Message</label>
                            <input type="text" value={template.footerText} onChange={(e) => updateTemplate("footerText", e.target.value)} className={inputCls} placeholder="Thank you for your business!" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Right: PDF Preview */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-display font-semibold text-text-primary">
                    <Eye className="w-4 h-4 text-brand-400" />
                    PDF Preview
                </div>
                <div className="sticky top-0">
                    <div className="bg-surface-tertiary rounded-xl p-6 border border-border-light">
                        <PdfPreview template={template} />
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Email Tab ─────────────────────────────────────────
function EmailTab({
    email,
    setEmail,
    insertMergeField,
    quillRef,
    quillCallbackRef,
    companyName,
    accentColor,
    inputCls,
    labelCls,
}: {
    email: EmailTemplateSettings;
    setEmail: React.Dispatch<React.SetStateAction<EmailTemplateSettings>>;
    insertMergeField: (token: string) => void;
    quillRef: React.MutableRefObject<any>;
    quillCallbackRef: (el: any) => void;
    companyName: string;
    accentColor: string;
    inputCls: string;
    labelCls: string;
}) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Editor */}
            <div className="space-y-4">
                {/* Subject */}
                <Card>
                    <CardContent className="p-4 space-y-3">
                        <h3 className="text-sm font-display font-semibold text-text-primary flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-brand-400" />
                            Email Subject
                        </h3>
                        <div>
                            <label className={labelCls}>Subject Line</label>
                            <input
                                type="text"
                                value={email.subject}
                                onChange={(e) => setEmail((prev) => ({ ...prev, subject: e.target.value }))}
                                className={inputCls}
                                placeholder="Invoice {{invoice_number}} from {{company_name}}"
                            />
                        </div>
                        <div>
                            <label className={labelCls}>Reply-To Email</label>
                            <input
                                type="email"
                                value={email.replyTo}
                                onChange={(e) => setEmail((prev) => ({ ...prev, replyTo: e.target.value }))}
                                className={inputCls}
                                placeholder="hello@shedoessocials.co.uk"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Merge Fields */}
                <Card>
                    <CardContent className="p-4 space-y-3">
                        <h3 className="text-sm font-display font-semibold text-text-primary flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-lavender-400" />
                            Merge Fields
                            <span className="text-[10px] font-normal text-text-tertiary ml-1">Click to insert</span>
                        </h3>
                        <div className="flex flex-wrap gap-1.5">
                            {MERGE_FIELDS.map((field) => (
                                <button
                                    key={field.token}
                                    onClick={() => insertMergeField(field.token)}
                                    className="px-2.5 py-1.5 rounded-full text-[10px] font-medium bg-brand-50 text-brand-700 border border-brand-200 hover:bg-brand-100 hover:border-brand-300 transition-all cursor-pointer active:scale-95"
                                >
                                    {field.label}
                                </button>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Rich Text Editor */}
                <Card>
                    <CardContent className="p-4 space-y-3">
                        <h3 className="text-sm font-display font-semibold text-text-primary flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-sage-400" />
                            Email Body
                        </h3>
                        <div className="rounded-lg border border-border overflow-hidden [&_.ql-toolbar]:bg-surface-secondary [&_.ql-toolbar]:border-b [&_.ql-toolbar]:border-border [&_.ql-toolbar]:px-2 [&_.ql-container]:border-none [&_.ql-editor]:min-h-[220px] [&_.ql-editor]:max-h-[400px] [&_.ql-editor]:overflow-y-auto [&_.ql-editor]:text-sm [&_.ql-editor]:text-text-primary [&_.ql-editor]:leading-relaxed [&_.ql-editor.ql-blank::before]:text-text-tertiary [&_.ql-editor.ql-blank::before]:not-italic">
                            <ReactQuill
                                // @ts-ignore — dynamic import ref workaround
                                ref={quillCallbackRef}
                                theme="snow"
                                value={email.body}
                                onChange={(value: string) => setEmail((prev) => ({ ...prev, body: value }))}
                                modules={quillModules}
                                formats={quillFormats}
                                placeholder="Compose your invoice email..."
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Right: Email Preview */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-display font-semibold text-text-primary">
                    <Eye className="w-4 h-4 text-brand-400" />
                    Email Preview
                </div>
                <div className="sticky top-0">
                    <div className="bg-surface-tertiary rounded-xl p-6 border border-border-light">
                        <EmailPreview email={email} companyName={companyName} accentColor={accentColor} />
                    </div>
                </div>
            </div>
        </div>
    );
}
