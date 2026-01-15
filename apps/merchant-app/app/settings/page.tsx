import { Card } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import prisma from "@repo/db/client";
import { Eye, RefreshCw, Copy, Key, Webhook } from "lucide-react";

async function getMerchantSettings() {
    const merchant = await prisma.merchant.findFirst();
    return merchant;
}

export default async function MerchantSettingsPage() {
    const merchant = await getMerchantSettings();

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in-50">
            {/* Page Header */}
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Settings</h1>
                <p className="text-slate-500 dark:text-slate-400">Manage your API keys and webhook configuration.</p>
            </div>

            <div className="space-y-6">
                {/* API Keys */}
                <Card className="border-slate-200 dark:border-slate-800">
                    <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg">
                                <Key className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">API Keys</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Manage your API keys for integration.</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Publishable Key</label>
                            <div className="flex gap-2">
                                <div className="flex-1 p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-sm text-slate-600 dark:text-slate-400">
                                    pk_live_{merchant?.id || '...'}
                                </div>
                                <Button variant="secondary" className="px-3"><Copy className="w-4 h-4" /></Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Secret Key</label>
                            <div className="flex gap-2">
                                <div className="flex-1 p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-sm text-slate-600 dark:text-slate-400 flex items-center">
                                    <span>••••••••••••••••••••••••••••••••</span>
                                </div>
                                <Button variant="secondary" className="px-3"><Eye className="w-4 h-4" /></Button>
                                <Button variant="secondary" className="px-3"><RefreshCw className="w-4 h-4" /></Button>
                            </div>
                            <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                                ⚠️ Keep this key secret. Do not share it in client-side code.
                            </p>
                        </div>
                    </div>
                </Card>

                {/* Webhooks */}
                <Card className="border-slate-200 dark:border-slate-800">
                    <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg">
                                <Webhook className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Webhooks</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Listen to payment events on your server.</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Endpoint URL</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    defaultValue={merchant?.webhookUrl || ''}
                                    placeholder="https://api.yourdomain.com/webhooks"
                                    className="flex-1 p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                                />
                                <Button className="bg-indigo-600 hover:bg-indigo-700">Save</Button>
                            </div>
                        </div>

                        <div className="text-sm text-slate-500 dark:text-slate-400">
                            <p className="font-medium mb-2">Events sent to this endpoint:</p>
                            <ul className="list-disc list-inside space-y-1 text-xs">
                                <li><code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">payment.succeeded</code> - Payment completed successfully</li>
                                <li><code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">payment.failed</code> - Payment failed</li>
                                <li><code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">payment.refunded</code> - Payment was refunded</li>
                            </ul>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
