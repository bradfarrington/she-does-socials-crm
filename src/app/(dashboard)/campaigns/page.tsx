import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Megaphone } from "lucide-react";

export default function CampaignsPage() {
    return (
        <>
            <Header title="Campaigns" subtitle="Plan and manage campaigns" />
            <div className="p-6">
                <Card>
                    <CardContent className="py-16 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-50 mb-4">
                            <Megaphone className="w-7 h-7 text-brand-500" />
                        </div>
                        <h3 className="font-display font-semibold text-text-primary mb-1">Campaigns</h3>
                        <p className="text-sm text-text-tertiary max-w-sm mx-auto">
                            Coming in Phase 2 — Group posts into multi-week campaigns with strategy tags.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
