import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Zap } from "lucide-react";

export default function AutomationsPage() {
    return (
        <>
            <Header title="Automations" subtitle="Set up triggers and automated actions" />
            <div className="p-6">
                <Card>
                    <CardContent className="py-16 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-lavender-50 mb-4">
                            <Zap className="w-7 h-7 text-lavender-500" />
                        </div>
                        <h3 className="font-display font-semibold text-text-primary mb-1">Automations</h3>
                        <p className="text-sm text-text-tertiary max-w-sm mx-auto">
                            Coming in Phase 5 — Automate emails, reminders, follow-ups, and more.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
