import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Globe } from "lucide-react";

export default function LandingPagesPage() {
    return (
        <>
            <Header title="Landing Pages" subtitle="Create and manage landing pages" />
            <div className="p-6">
                <Card>
                    <CardContent className="py-16 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-lavender-50 mb-4">
                            <Globe className="w-7 h-7 text-lavender-500" />
                        </div>
                        <h3 className="font-display font-semibold text-text-primary mb-1">Landing Pages</h3>
                        <p className="text-sm text-text-tertiary max-w-sm mx-auto">
                            Coming in Phase 4 — AI-generated landing pages for lead magnets, workshops, and offers.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
