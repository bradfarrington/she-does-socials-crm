"use client";

import React, { useState, useMemo } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, formatCurrency } from "@/lib/utils";
import {
    Plus, X, Search, ShoppingBag, Download, Eye, TrendingUp,
    FileText, BookOpen, Palette, Layers, Star, ArrowUpRight,
    Trash2, ToggleLeft, ToggleRight, ExternalLink,
} from "lucide-react";

// ─── Config ─────────────────────────────────────────────
type ProductType = "planner" | "toolkit" | "course" | "template" | "guide";

const typeConfig: Record<ProductType, { label: string; colour: string; bg: string; icon: React.ElementType }> = {
    planner: { label: "Planner", colour: "text-brand-600", bg: "bg-brand-50", icon: BookOpen },
    toolkit: { label: "Toolkit", colour: "text-lavender-500", bg: "bg-lavender-50", icon: Layers },
    course: { label: "Course", colour: "text-sage-600", bg: "bg-sage-50", icon: Star },
    template: { label: "Template", colour: "text-blue-600", bg: "bg-blue-50", icon: FileText },
    guide: { label: "Guide", colour: "text-rose-500", bg: "bg-rose-50", icon: Palette },
};

interface DigitalProduct {
    id: string; name: string; type: ProductType; price: number;
    description: string; is_active: boolean;
    download_count: number; revenue: number; conversion_rate: number;
    thumbnail_gradient: string;
}

const gradients = ["from-brand-400 to-rose-400", "from-lavender-400 to-brand-400", "from-sage-400 to-cyan-400", "from-rose-400 to-pink-400", "from-blue-400 to-lavender-400", "from-amber-400 to-brand-400"];

const demoProducts: DigitalProduct[] = [
    { id: "1", name: "Reel Ready Toolkit", type: "toolkit", price: 47, description: "Everything you need to start creating scroll-stopping Reels. Includes 50 hooks, trending audio ideas, caption templates, and an editing guide.", is_active: true, download_count: 84, revenue: 3948, conversion_rate: 12.5, thumbnail_gradient: gradients[0] },
    { id: "2", name: "30-Day Content Planner", type: "planner", price: 27, description: "A done-for-you content planner with daily prompts, hashtag lists, and strategy notes for a full month of social media.", is_active: true, download_count: 156, revenue: 4212, conversion_rate: 18.2, thumbnail_gradient: gradients[1] },
    { id: "3", name: "Brand Voice Workbook", type: "guide", price: 37, description: "Define your brand voice, create a messaging framework, and build a content bank that sounds authentically you.", is_active: true, download_count: 62, revenue: 2294, conversion_rate: 9.8, thumbnail_gradient: gradients[2] },
    { id: "4", name: "Instagram Carousel Templates", type: "template", price: 19, description: "15 stunning Canva carousel templates designed for coaches, beauty brands, and wellness businesses.", is_active: true, download_count: 210, revenue: 3990, conversion_rate: 22.4, thumbnail_gradient: gradients[3] },
    { id: "5", name: "Social Media Strategy Course", type: "course", price: 197, description: "A self-paced course on building a social media strategy from scratch — from audience research to content pillars to analytics.", is_active: false, download_count: 28, revenue: 5516, conversion_rate: 4.2, thumbnail_gradient: gradients[4] },
    { id: "6", name: "Caption Magic Template Pack", type: "template", price: 15, description: "100 fill-in-the-blank caption templates for every type of post — sales, engagement, education, and behind-the-scenes.", is_active: true, download_count: 320, revenue: 4800, conversion_rate: 28.1, thumbnail_gradient: gradients[5] },
];

// ─── Product Modal ──────────────────────────────────────
function ProductModal({ product, isOpen, onClose, onSave, onDelete }: { product?: DigitalProduct | null; isOpen: boolean; onClose: () => void; onSave: (p: DigitalProduct) => void; onDelete?: (id: string) => void }) {
    const isEdit = !!product;
    const [f, setF] = useState<Partial<DigitalProduct>>({ name: product?.name || "", type: product?.type || "toolkit", price: product?.price || 0, description: product?.description || "", is_active: product?.is_active ?? true });

    React.useEffect(() => { setF({ name: product?.name || "", type: product?.type || "toolkit", price: product?.price || 0, description: product?.description || "", is_active: product?.is_active ?? true }); }, [product]);

    if (!isOpen) return null;

    const handleSave = () => { const gi = Math.floor(Math.random() * gradients.length); onSave({ id: product?.id || `prod-${Date.now()}`, name: f.name || "New Product", type: f.type || "toolkit", price: f.price || 0, description: f.description || "", is_active: f.is_active ?? true, download_count: product?.download_count || 0, revenue: product?.revenue || 0, conversion_rate: product?.conversion_rate || 0, thumbnail_gradient: product?.thumbnail_gradient || gradients[gi] }); onClose(); };
    const inputCls = "flex h-10 w-full rounded-lg border border-border bg-surface px-3.5 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-brand-400/40 focus:border-brand-400 transition-all";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-surface rounded-2xl border border-border shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto animate-scale-in">
                <div className="flex items-center justify-between p-5 border-b border-border-light"><h2 className="font-display font-semibold text-lg text-text-primary">{isEdit ? "Edit Product" : "New Product"}</h2><button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-hover transition-colors"><X className="w-4 h-4 text-text-tertiary" /></button></div>
                <div className="p-5 space-y-5">
                    <div className="space-y-1.5"><label className="block text-sm font-medium text-text-secondary">Product Name</label><input type="text" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="e.g. Reel Ready Toolkit" className={inputCls} /></div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5"><label className="block text-sm font-medium text-text-secondary">Type</label><div className="flex flex-wrap gap-1.5">{(Object.keys(typeConfig) as ProductType[]).map((t) => (<button key={t} onClick={() => setF({ ...f, type: t })} className={cn("px-2.5 py-1.5 rounded-full text-xs font-medium transition-all border", f.type === t ? `${typeConfig[t].bg} ${typeConfig[t].colour} border-transparent` : "bg-surface border-border text-text-secondary hover:bg-surface-hover")}>{typeConfig[t].label}</button>))}</div></div>
                        <div className="space-y-1.5"><label className="block text-sm font-medium text-text-secondary">Price (£)</label><input type="number" value={f.price} onChange={(e) => setF({ ...f, price: Number(e.target.value) })} className={inputCls} /></div>
                    </div>
                    <div className="space-y-1.5"><label className="block text-sm font-medium text-text-secondary">Description</label><textarea value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} placeholder="Describe this product..." rows={3} className="flex min-h-[80px] w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary resize-y focus:outline-none focus:ring-2 focus:ring-brand-400/40 focus:border-brand-400 transition-all" /></div>
                    <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={f.is_active} onChange={(e) => setF({ ...f, is_active: e.target.checked })} className="rounded border-border text-brand-500 focus:ring-brand-400" /><span className="text-sm text-text-secondary">Active — product is available for purchase</span></label>
                </div>
                <div className="flex items-center justify-between p-5 border-t border-border-light">
                    <div>{isEdit && onDelete && <Button variant="ghost" size="sm" onClick={() => { onDelete(product!.id); onClose(); }} className="text-error hover:text-error hover:bg-rose-50"><Trash2 className="w-4 h-4" />Delete</Button>}</div>
                    <div className="flex gap-2"><Button variant="secondary" size="sm" onClick={onClose}>Cancel</Button><Button size="sm" onClick={handleSave}>{isEdit ? "Save Changes" : "Create Product"}</Button></div>
                </div>
            </div>
        </div>
    );
}

// ─── Main Page ──────────────────────────────────────────
export default function ProductsPage() {
    const [products, setProducts] = useState<DigitalProduct[]>(demoProducts);
    const [searchQuery, setSearchQuery] = useState("");
    const [typeFilter, setTypeFilter] = useState<string>("all");
    const [modalOpen, setModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<DigitalProduct | null>(null);

    const filtered = useMemo(() => products.filter((p) => { const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()); const matchesType = typeFilter === "all" || p.type === typeFilter; return matchesSearch && matchesType; }), [products, searchQuery, typeFilter]);

    const stats = useMemo(() => ({
        totalRevenue: products.reduce((s, p) => s + p.revenue, 0),
        totalDownloads: products.reduce((s, p) => s + p.download_count, 0),
        activeProducts: products.filter((p) => p.is_active).length,
        avgConversion: products.length > 0 ? products.reduce((s, p) => s + p.conversion_rate, 0) / products.length : 0,
    }), [products]);

    const handleSave = (p: DigitalProduct) => { setProducts((prev) => { const idx = prev.findIndex((x) => x.id === p.id); if (idx >= 0) { const u = [...prev]; u[idx] = p; return u; } return [...prev, p]; }); };
    const handleDelete = (id: string) => setProducts((prev) => prev.filter((p) => p.id !== id));

    return (
        <>
            <Header title="Digital Products" subtitle={`${stats.activeProducts} active products`} actions={<Button size="sm" onClick={() => { setEditingProduct(null); setModalOpen(true); }}><Plus className="w-4 h-4" />New Product</Button>} />
            <div className="p-6 space-y-5 animate-fade-in">
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2.5 rounded-xl bg-brand-50"><TrendingUp className="w-4 h-4 text-brand-500" /></div><div><p className="text-xl font-display font-bold text-text-primary">{formatCurrency(stats.totalRevenue)}</p><p className="text-[10px] text-text-tertiary font-medium">Total Revenue</p></div></CardContent></Card>
                    <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2.5 rounded-xl bg-lavender-50"><Download className="w-4 h-4 text-lavender-500" /></div><div><p className="text-xl font-display font-bold text-text-primary">{stats.totalDownloads}</p><p className="text-[10px] text-text-tertiary font-medium">Total Downloads</p></div></CardContent></Card>
                    <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2.5 rounded-xl bg-sage-50"><ShoppingBag className="w-4 h-4 text-sage-500" /></div><div><p className="text-xl font-display font-bold text-text-primary">{stats.activeProducts}</p><p className="text-[10px] text-text-tertiary font-medium">Active Products</p></div></CardContent></Card>
                    <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2.5 rounded-xl bg-rose-50"><Eye className="w-4 h-4 text-rose-500" /></div><div><p className="text-xl font-display font-bold text-text-primary">{stats.avgConversion.toFixed(1)}%</p><p className="text-[10px] text-text-tertiary font-medium">Avg. Conversion</p></div></CardContent></Card>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-3 flex-wrap">
                    <div className="relative flex-1 max-w-sm"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" /><input type="text" placeholder="Search products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="h-9 w-full rounded-lg border border-border bg-surface pl-9 pr-3 text-sm placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-brand-400/40 focus:border-brand-400 transition-all" /></div>
                    <div className="flex items-center gap-1.5">
                        <button onClick={() => setTypeFilter("all")} className={cn("px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap", typeFilter === "all" ? "bg-text-primary text-white" : "bg-surface border border-border text-text-secondary hover:bg-surface-hover")}>All</button>
                        {(Object.keys(typeConfig) as ProductType[]).map((t) => (<button key={t} onClick={() => setTypeFilter(t)} className={cn("px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap", typeFilter === t ? `${typeConfig[t].bg} ${typeConfig[t].colour}` : "bg-surface border border-border text-text-secondary hover:bg-surface-hover")}>{typeConfig[t].label}</button>))}
                    </div>
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {filtered.map((product, i) => {
                        const type = typeConfig[product.type]; const TypeIcon = type.icon; return (
                            <Card key={product.id} hover className={cn("group animate-fade-in overflow-hidden", !product.is_active && "opacity-60")} onClick={() => { setEditingProduct(product); setModalOpen(true); }} style={{ animationDelay: `${i * 50}ms` }}>
                                <div className={cn("h-24 bg-gradient-to-br flex items-center justify-center relative", product.thumbnail_gradient)}>
                                    <TypeIcon className="w-10 h-10 text-white/80" />
                                    <div className="absolute top-3 right-3"><Badge size="sm" className="bg-white/20 text-white backdrop-blur-sm border-0">{formatCurrency(product.price)}</Badge></div>
                                </div>
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Badge size="sm" className={cn(type.bg, type.colour)}><TypeIcon className="w-2.5 h-2.5" />{type.label}</Badge>
                                        {!product.is_active && <Badge size="sm" variant="outline">Inactive</Badge>}
                                    </div>
                                    <h3 className="text-sm font-semibold text-text-primary mb-1">{product.name}</h3>
                                    <p className="text-xs text-text-secondary line-clamp-2 mb-3">{product.description}</p>
                                    <div className="flex items-center justify-between pt-3 border-t border-border-light text-[10px] text-text-tertiary">
                                        <span className="flex items-center gap-1"><Download className="w-3 h-3" />{product.download_count} downloads</span>
                                        <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" />{formatCurrency(product.revenue)}</span>
                                        <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{product.conversion_rate}%</span>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                    <Card hover className="border-dashed border-2 border-border hover:border-rose-300 group cursor-pointer" onClick={() => { setEditingProduct(null); setModalOpen(true); }}>
                        <CardContent className="p-5 flex items-center justify-center min-h-[280px]"><div className="text-center"><div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-rose-50 group-hover:bg-rose-100 transition-colors mb-2"><Plus className="w-5 h-5 text-rose-500" /></div><p className="text-sm font-medium text-text-secondary group-hover:text-rose-600 transition-colors">New Product</p></div></CardContent>
                    </Card>
                </div>
            </div>
            <ProductModal product={editingProduct} isOpen={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSave} onDelete={handleDelete} />
        </>
    );
}
