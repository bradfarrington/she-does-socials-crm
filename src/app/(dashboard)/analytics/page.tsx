import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

export default function AnalyticsPage() {
    return (
        <>
            <Header title="Analytics" subtitle="Track performance across platforms" />
            <div className="p-6">
                <Card>
                    <CardContent className="py-16 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-50 mb-4">
                            <BarChart3 className="w-7 h-7 text-brand-500" />
                        </div>
                        <h3 className="font-display font-semibold text-text-primary mb-1">Analytics</h3>
                        <p className="text-sm text-text-tertiary max-w-sm mx-auto">
                            Coming in Phase 5 — Track follower growth, engagement, and generate branded reports.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
