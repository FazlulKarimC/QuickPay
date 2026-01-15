import { Card } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/textinput"; // Check usages
import prisma from "@repo/db/client";
import { Eye, RefreshCw, Copy } from "lucide-react";

async function getMerchantSettings() {
    const merchant = await prisma.merchant.findFirst();
    return merchant;
}

export default async function MerchantSettingsPage() {
    const merchant = await getMerchantSettings();

    return (
        <div className="p-8 space-y-8 animate-in fade-in-50">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Settings</h1>

            <div className="space-y-6">
                <Card className="p-6 space-y-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                    <div>
                        <h3 className="text-lg font-medium text-slate-900 dark:text-white">API Configuration</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Manage your API keys and webhook settings.</p>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Publishable Key</label>
                            <div className="flex gap-2">
                                <div className="flex-1 p-2 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 font-mono text-sm text-slate-600 dark:text-slate-400">
                                    pk_live_{merchant?.id || '...'}
                                </div>
                                <Button variant="secondary" className="px-3"><Copy className="w-4 h-4" /></Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Secret Key</label>
                            <div className="flex gap-2">
                                <div className="flex-1 p-2 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 font-mono text-sm text-slate-600 dark:text-slate-400 flex justify-between items-center">
                                    <span>••••••••••••••••••••••••••••••••</span>
                                </div>
                                <Button variant="secondary" className="px-3"><Eye className="w-4 h-4" /></Button>
                                <Button variant="secondary" className="px-3"><RefreshCw className="w-4 h-4" /></Button>
                            </div>
                            <p className="text-xs text-red-500">Keep this key secret. Do not share it in client-side code.</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-6 space-y-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                    <div>
                        <h3 className="text-lg font-medium text-slate-900 dark:text-white">Webhooks</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Listen to events on your server.</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Endpoint URL</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="https://api.yourdomain.com/webhooks"
                                className="flex-1 p-2 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm"
                            />
                            <Button>Save</Button>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
