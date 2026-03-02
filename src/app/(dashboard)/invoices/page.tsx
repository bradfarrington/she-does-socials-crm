import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default function InvoicesPage() {
    return (
        <>
            <Header title="Invoices" subtitle="Manage invoicing and payments" />
            <div className="p-6">
                <Card>
                    <CardContent className="py-16 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-sage-50 mb-4">
                            <FileText className="w-7 h-7 text-sage-500" />
                        </div>
                        <h3 className="font-display font-semibold text-text-primary mb-1">Invoicing</h3>
                        <p className="text-sm text-text-tertiary max-w-sm mx-auto">
                            Coming in Phase 3 — Create, send, and track invoices with Stripe integration.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
