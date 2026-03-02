import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Package } from "lucide-react";

export default function PackagesPage() {
    return (
        <>
            <Header title="Packages" subtitle="Manage service packages and pricing" />
            <div className="p-6">
                <Card>
                    <CardContent className="py-16 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-50 mb-4">
                            <Package className="w-7 h-7 text-brand-500" />
                        </div>
                        <h3 className="font-display font-semibold text-text-primary mb-1">Packages</h3>
                        <p className="text-sm text-text-tertiary max-w-sm mx-auto">
                            Coming in Phase 3 — Create pre-set packages with custom pricing and deliverables.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
