import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingBag } from "lucide-react";

export default function ProductsPage() {
    return (
        <>
            <Header title="Digital Products" subtitle="Manage and sell digital products" />
            <div className="p-6">
                <Card>
                    <CardContent className="py-16 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-rose-50 mb-4">
                            <ShoppingBag className="w-7 h-7 text-rose-500" />
                        </div>
                        <h3 className="font-display font-semibold text-text-primary mb-1">Digital Products</h3>
                        <p className="text-sm text-text-tertiary max-w-sm mx-auto">
                            Coming in Phase 6 — Host and sell planners, toolkits, and courses with automatic delivery.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
