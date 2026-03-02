"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, formatCurrency } from "@/lib/utils";
import type { PackageType } from "@/lib/types";
import {
    Plus, X, CheckCircle2, Star, Trash2, Sparkles, Clock, Users, Zap, Loader2, GripVertical, Copy,
} from "lucide-react";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
    rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// ─── Config ─────────────────────────────────────────────
const typeConfig: Record<PackageType, { label: string; colour: string; bg: string; icon: React.ElementType }> = {
    monthly: { label: "Monthly", colour: "text-brand-600", bg: "bg-brand-50", icon: Clock },
    one_off: { label: "One-off", colour: "text-lavender-500", bg: "bg-lavender-50", icon: Zap },
    coaching: { label: "Coaching", colour: "text-sage-600", bg: "bg-sage-50", icon: Users },
    digital_product: { label: "Digital Product", colour: "text-rose-500", bg: "bg-rose-50", icon: Sparkles },
};

interface ServicePackage {
    id: string; name: string; type: PackageType; price: number;
    description: string; deliverables: string[]; popular?: boolean; active: boolean;
    sort_order: number;
}

// ─── Sortable Deliverable ───────────────────────────────
function SortableDeliverable({
    id, value, index, onChange, onRemove, canRemove,
}: {
    id: string; value: string; index: number;
    onChange: (i: number, v: string) => void;
    onRemove: (i: number) => void;
    canRemove: boolean;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
    const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

    return (
        <div ref={setNodeRef} style={style} className="flex items-center gap-2">
            <button {...attributes} {...listeners} className="p-1 cursor-grab active:cursor-grabbing text-text-tertiary hover:text-text-secondary touch-none">
                <GripVertical className="w-3.5 h-3.5" />
            </button>
            <CheckCircle2 className="w-3.5 h-3.5 text-sage-400 flex-shrink-0" />
            <input
                type="text" value={value}
                onChange={(e) => onChange(index, e.target.value)}
                placeholder="e.g. 5 posts per week"
                className="flex h-9 flex-1 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-brand-400/40 focus:border-brand-400 transition-all"
            />
            {canRemove && (
                <button onClick={() => onRemove(index)} className="p-1.5 rounded-lg hover:bg-rose-50 text-text-tertiary hover:text-rose-500 transition-all">
                    <X className="w-3.5 h-3.5" />
                </button>
            )}
        </div>
    );
}

// ─── Sortable Package Card ──────────────────────────────
function SortablePackageCard({ pkg, index, onClick }: { pkg: ServicePackage; index: number; onClick: () => void }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: pkg.id });
    const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.6 : 1, animationDelay: `${index * 50}ms` };
    const type = typeConfig[pkg.type];
    const TypeIcon = type.icon;

    return (
        <div ref={setNodeRef} style={style}>
            <Card hover className={cn("relative overflow-hidden group animate-fade-in", pkg.popular && "ring-2 ring-brand-400")}>
                {/* Drag handle */}
                <button
                    {...attributes} {...listeners}
                    className="absolute top-3 left-3 p-1.5 rounded-lg bg-surface-secondary/80 hover:bg-surface-hover text-text-tertiary hover:text-text-secondary transition-all opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing touch-none z-10"
                    onClick={(e) => e.stopPropagation()}
                >
                    <GripVertical className="w-4 h-4" />
                </button>
                {pkg.popular && <div className="absolute top-3 right-3"><Badge variant="brand" size="sm"><Star className="w-2.5 h-2.5" />Most Popular</Badge></div>}
                <CardContent className="p-5 cursor-pointer" onClick={onClick}>
                    <div className="flex items-center gap-2 mb-3"><Badge size="sm" className={cn(type.bg, type.colour)}><TypeIcon className="w-2.5 h-2.5" />{type.label}</Badge>{!pkg.active && <Badge size="sm" variant="outline">Inactive</Badge>}</div>
                    <h3 className="font-display font-semibold text-lg text-text-primary mb-1">{pkg.name}</h3>
                    <p className="text-xs text-text-secondary mb-4 line-clamp-2">{pkg.description}</p>
                    <div className="mb-4"><span className="text-2xl font-display font-bold text-text-primary">{formatCurrency(pkg.price)}</span>{pkg.type === "monthly" && <span className="text-xs text-text-tertiary ml-1">/month</span>}</div>
                    <div className="space-y-2 pt-4 border-t border-border-light">{pkg.deliverables.map((d, j) => (<div key={j} className="flex items-start gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-sage-500 flex-shrink-0 mt-0.5" /><span className="text-xs text-text-secondary">{d}</span></div>))}</div>
                </CardContent>
            </Card>
        </div>
    );
}

// ─── Create-From Prompt ─────────────────────────────────
function CreatePrompt({ isOpen, onClose, onCreateBlank, onCreateFrom, packages }: {
    isOpen: boolean; onClose: () => void;
    onCreateBlank: () => void;
    onCreateFrom: (pkg: ServicePackage) => void;
    packages: ServicePackage[];
}) {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-surface rounded-2xl border border-border shadow-xl w-full max-w-md mx-4 animate-scale-in">
                <div className="p-6 space-y-5">
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-50 mb-3">
                            <Plus className="w-6 h-6 text-brand-500" />
                        </div>
                        <h2 className="font-display font-semibold text-lg text-text-primary">New Package</h2>
                        <p className="text-sm text-text-tertiary mt-1">Start from scratch or duplicate an existing package</p>
                    </div>

                    <Button className="w-full justify-center" onClick={onCreateBlank}>
                        <Plus className="w-4 h-4" />
                        Create Blank Package
                    </Button>

                    {packages.length > 0 && (
                        <div className="space-y-2">
                            <p className="text-xs font-medium text-text-tertiary text-center">Or duplicate from existing</p>
                            <div className="max-h-48 overflow-y-auto space-y-1.5">
                                {packages.map((pkg) => (
                                    <button
                                        key={pkg.id}
                                        onClick={() => onCreateFrom(pkg)}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border border-border hover:border-brand-300 hover:bg-brand-50/50 transition-all text-left group"
                                    >
                                        <Copy className="w-4 h-4 text-text-tertiary group-hover:text-brand-500 flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-text-primary truncate">{pkg.name}</p>
                                            <p className="text-xs text-text-tertiary">{typeConfig[pkg.type].label} · {formatCurrency(pkg.price)}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                <div className="px-6 pb-5">
                    <Button variant="ghost" size="sm" className="w-full justify-center" onClick={onClose}>Cancel</Button>
                </div>
            </div>
        </div>
    );
}

// ─── Package Modal ──────────────────────────────────────
function PackageModal({ pkg, isOpen, onClose, onSave, onDelete, isNew }: {
    pkg?: ServicePackage | null; isOpen: boolean; isNew?: boolean;
    onClose: () => void;
    onSave: (p: Omit<ServicePackage, "id" | "sort_order"> & { id?: string; sort_order?: number }) => void;
    onDelete?: (id: string) => void;
}) {
    const isEdit = !!pkg?.id && !isNew;
    const emptyState: Partial<ServicePackage> = { name: "", type: "monthly", price: 0, description: "", deliverables: [""], popular: false, active: true };

    const [f, setF] = useState<Partial<ServicePackage>>(emptyState);

    // Reset form whenever the modal opens with new data
    useEffect(() => {
        if (isOpen) {
            if (pkg) {
                setF({
                    name: isNew ? `${pkg.name} (Copy)` : pkg.name,
                    type: pkg.type || "monthly",
                    price: pkg.price || 0,
                    description: pkg.description || "",
                    deliverables: pkg.deliverables?.length ? [...pkg.deliverables] : [""],
                    popular: pkg.popular || false,
                    active: pkg.active ?? true,
                });
            } else {
                setF({ ...emptyState });
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, pkg, isNew]);

    if (!isOpen) return null;

    const deliverables = f.deliverables || [""];
    const deliverableIds = deliverables.map((_, i) => `deliverable-${i}`);

    const updateDeliverable = (i: number, v: string) => { const d = [...deliverables]; d[i] = v; setF({ ...f, deliverables: d }); };
    const addDeliverable = () => setF({ ...f, deliverables: [...deliverables, ""] });
    const removeDeliverable = (i: number) => setF({ ...f, deliverables: deliverables.filter((_, idx) => idx !== i) });

    const handleDeliverableDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const oldIndex = deliverableIds.indexOf(active.id as string);
        const newIndex = deliverableIds.indexOf(over.id as string);
        setF({ ...f, deliverables: arrayMove(deliverables, oldIndex, newIndex) });
    };

    const handleSave = () => {
        onSave({
            ...(isEdit && pkg?.id ? { id: pkg.id, sort_order: pkg.sort_order } : {}),
            name: f.name || "New Package",
            type: (f.type || "monthly") as PackageType,
            price: f.price || 0,
            description: f.description || "",
            deliverables: deliverables.filter(Boolean),
            popular: f.popular || false,
            active: f.active ?? true,
        });
        onClose();
    };

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const inputCls = "flex h-10 w-full rounded-lg border border-border bg-surface px-3.5 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-brand-400/40 focus:border-brand-400 transition-all";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-surface rounded-2xl border border-border shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto animate-scale-in">
                <div className="flex items-center justify-between p-5 border-b border-border-light">
                    <h2 className="font-display font-semibold text-lg text-text-primary">{isEdit ? "Edit Package" : "New Package"}</h2>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-hover transition-colors"><X className="w-4 h-4 text-text-tertiary" /></button>
                </div>
                <div className="p-5 space-y-5">
                    <div className="space-y-1.5"><label className="block text-sm font-medium text-text-secondary">Package Name</label><input type="text" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="e.g. Content Queen" className={inputCls} /></div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5"><label className="block text-sm font-medium text-text-secondary">Type</label><div className="flex flex-wrap gap-1.5">{(Object.keys(typeConfig) as PackageType[]).map((t) => (<button key={t} onClick={() => setF({ ...f, type: t })} className={cn("px-2.5 py-1.5 rounded-full text-xs font-medium transition-all border", f.type === t ? `${typeConfig[t].bg} ${typeConfig[t].colour} border-transparent` : "bg-surface border-border text-text-secondary hover:bg-surface-hover")}>{typeConfig[t].label}</button>))}</div></div>
                        <div className="space-y-1.5"><label className="block text-sm font-medium text-text-secondary">Price (\u00a3)</label><input type="number" value={f.price} onChange={(e) => setF({ ...f, price: Number(e.target.value) })} className={inputCls} /></div>
                    </div>
                    <div className="space-y-1.5"><label className="block text-sm font-medium text-text-secondary">Description</label><textarea value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} placeholder="Describe what this package includes..." rows={2} className="flex min-h-[60px] w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary resize-y focus:outline-none focus:ring-2 focus:ring-brand-400/40 focus:border-brand-400 transition-all" /></div>

                    {/* Deliverables with drag-and-drop */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-text-secondary">Deliverables</label>
                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDeliverableDragEnd}>
                            <SortableContext items={deliverableIds} strategy={verticalListSortingStrategy}>
                                {deliverables.map((d, i) => (
                                    <SortableDeliverable
                                        key={deliverableIds[i]}
                                        id={deliverableIds[i]}
                                        value={d}
                                        index={i}
                                        onChange={updateDeliverable}
                                        onRemove={removeDeliverable}
                                        canRemove={deliverables.length > 1}
                                    />
                                ))}
                            </SortableContext>
                        </DndContext>
                        <button onClick={addDeliverable} className="text-xs font-medium text-brand-600 hover:text-brand-700 flex items-center gap-1"><Plus className="w-3 h-3" />Add deliverable</button>
                    </div>

                    <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={f.popular} onChange={(e) => setF({ ...f, popular: e.target.checked })} className="rounded border-border text-brand-500 focus:ring-brand-400" /><span className="text-sm text-text-secondary">Mark as popular</span></label>
                        <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={f.active} onChange={(e) => setF({ ...f, active: e.target.checked })} className="rounded border-border text-brand-500 focus:ring-brand-400" /><span className="text-sm text-text-secondary">Active</span></label>
                    </div>
                </div>
                <div className="flex items-center justify-between p-5 border-t border-border-light">
                    <div>{isEdit && onDelete && <Button variant="ghost" size="sm" onClick={() => { onDelete(pkg!.id); onClose(); }} className="text-error hover:text-error hover:bg-rose-50"><Trash2 className="w-4 h-4" />Delete</Button>}</div>
                    <div className="flex gap-2"><Button variant="secondary" size="sm" onClick={onClose}>Cancel</Button><Button size="sm" onClick={handleSave}>{isEdit ? "Save Changes" : "Create Package"}</Button></div>
                </div>
            </div>
        </div>
    );
}

// ─── Main Page ──────────────────────────────────────────
export default function PackagesPage() {
    const [packages, setPackages] = useState<ServicePackage[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [promptOpen, setPromptOpen] = useState(false);
    const [editingPkg, setEditingPkg] = useState<ServicePackage | null>(null);
    const [isNewFromExisting, setIsNewFromExisting] = useState(false);
    const [typeFilter, setTypeFilter] = useState<string>("all");

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const fetchPackages = useCallback(async () => {
        try {
            const res = await fetch("/api/packages");
            if (res.ok) {
                const data = await res.json();
                setPackages(data);
            }
        } catch (err) {
            console.error("Failed to fetch packages:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPackages();
    }, [fetchPackages]);

    const filtered = useMemo(() => typeFilter === "all" ? packages : packages.filter((p) => p.type === typeFilter), [packages, typeFilter]);
    const filteredIds = useMemo(() => filtered.map((p) => p.id), [filtered]);

    // ── New Package flow ──
    const handleNewClick = () => {
        setPromptOpen(true);
    };

    const handleCreateBlank = () => {
        setPromptOpen(false);
        setEditingPkg(null);
        setIsNewFromExisting(false);
        setModalOpen(true);
    };

    const handleCreateFrom = (pkg: ServicePackage) => {
        setPromptOpen(false);
        setEditingPkg(pkg);
        setIsNewFromExisting(true);
        setModalOpen(true);
    };

    // ── CRUD ──
    const handleSave = async (pkg: Omit<ServicePackage, "id" | "sort_order"> & { id?: string; sort_order?: number }) => {
        try {
            if (pkg.id && !isNewFromExisting) {
                // Update existing
                const res = await fetch(`/api/packages/${pkg.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: pkg.name, type: pkg.type, price: pkg.price,
                        description: pkg.description, deliverables: pkg.deliverables,
                        popular: pkg.popular, active: pkg.active,
                    }),
                });
                if (res.ok) {
                    const updated = await res.json();
                    setPackages((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
                }
            } else {
                // Create new
                const maxOrder = packages.length > 0 ? Math.max(...packages.map((p) => p.sort_order)) : -1;
                const res = await fetch("/api/packages", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: pkg.name, type: pkg.type, price: pkg.price,
                        description: pkg.description, deliverables: pkg.deliverables,
                        popular: pkg.popular, active: pkg.active,
                        sort_order: maxOrder + 1,
                    }),
                });
                if (res.ok) {
                    const created = await res.json();
                    setPackages((prev) => [...prev, created]);
                }
            }
        } catch (err) {
            console.error("Failed to save package:", err);
        } finally {
            setIsNewFromExisting(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const res = await fetch(`/api/packages/${id}`, { method: "DELETE" });
            if (res.ok) {
                setPackages((prev) => prev.filter((p) => p.id !== id));
            }
        } catch (err) {
            console.error("Failed to delete package:", err);
        }
    };

    // ── Package drag-and-drop reorder ──
    const handlePackageDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = packages.findIndex((p) => p.id === active.id);
        const newIndex = packages.findIndex((p) => p.id === over.id);
        if (oldIndex === -1 || newIndex === -1) return;

        const reordered = arrayMove(packages, oldIndex, newIndex).map((p, i) => ({ ...p, sort_order: i }));
        setPackages(reordered);

        // Persist new order
        try {
            await Promise.all(
                reordered.map((p) =>
                    fetch(`/api/packages/${p.id}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ sort_order: p.sort_order }),
                    })
                )
            );
        } catch (err) {
            console.error("Failed to persist order:", err);
            fetchPackages(); // rollback
        }
    };

    return (
        <>
            <Header title="Packages" subtitle={`${packages.length} service package${packages.length !== 1 ? "s" : ""}`} actions={<Button size="sm" onClick={handleNewClick}><Plus className="w-4 h-4" />New Package</Button>} />
            <div className="p-6 space-y-5 animate-fade-in">
                <div className="flex items-center gap-1.5">
                    <button onClick={() => setTypeFilter("all")} className={cn("px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap", typeFilter === "all" ? "bg-text-primary text-white" : "bg-surface border border-border text-text-secondary hover:bg-surface-hover")}>All</button>
                    {(Object.keys(typeConfig) as PackageType[]).map((t) => (<button key={t} onClick={() => setTypeFilter(t)} className={cn("px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap", typeFilter === t ? `${typeConfig[t].bg} ${typeConfig[t].colour}` : "bg-surface border border-border text-text-secondary hover:bg-surface-hover")}>{typeConfig[t].label}</button>))}
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="w-6 h-6 text-text-tertiary animate-spin" />
                    </div>
                ) : (
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handlePackageDragEnd}>
                        <SortableContext items={filteredIds} strategy={rectSortingStrategy}>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                                {filtered.map((pkg, i) => (
                                    <SortablePackageCard
                                        key={pkg.id}
                                        pkg={pkg}
                                        index={i}
                                        onClick={() => { setEditingPkg(pkg); setIsNewFromExisting(false); setModalOpen(true); }}
                                    />
                                ))}
                                <Card hover className="border-dashed border-2 border-border hover:border-brand-300 group cursor-pointer" onClick={handleNewClick}>
                                    <CardContent className="p-5 flex items-center justify-center min-h-[300px]"><div className="text-center"><div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-brand-50 group-hover:bg-brand-100 transition-colors mb-2"><Plus className="w-5 h-5 text-brand-500" /></div><p className="text-sm font-medium text-text-secondary group-hover:text-brand-600 transition-colors">New Package</p></div></CardContent>
                                </Card>
                            </div>
                        </SortableContext>
                    </DndContext>
                )}
            </div>

            {/* Prompt: Create blank or from existing */}
            <CreatePrompt
                isOpen={promptOpen}
                onClose={() => setPromptOpen(false)}
                onCreateBlank={handleCreateBlank}
                onCreateFrom={handleCreateFrom}
                packages={packages}
            />

            {/* Package edit/create modal */}
            <PackageModal
                pkg={editingPkg}
                isOpen={modalOpen}
                isNew={isNewFromExisting || !editingPkg}
                onClose={() => { setModalOpen(false); setIsNewFromExisting(false); }}
                onSave={handleSave}
                onDelete={handleDelete}
            />
        </>
    );
}
