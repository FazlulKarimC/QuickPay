"use client"
import { Button } from "@repo/ui/button";
import { Card } from "@repo/ui/card";
import { TextInput } from "@repo/ui/textinput";
import { useState } from "react";
import { p2pTransfer } from "@/app/lib/actions/p2pTransfer";
import { Send, User, Banknote } from "lucide-react";

export function SendCard() {
    const [number, setNumber] = useState("");
    const [amount, setAmount] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null);

    const handleSend = async () => {
        setLoading(true);
        setMessage(null);

        try {
            const result = await p2pTransfer(number, Number(amount) * 100);

            if (result.success) {
                setMessage({ type: "success", text: result.message || "Transfer successful!" });
                // Clear form on success
                setNumber("");
                setAmount("");

                // Clear success message after 3 seconds
                setTimeout(() => setMessage(null), 3000);
            } else {
                setMessage({ type: "error", text: result.message || "Transfer failed" });
            }
        } catch (error) {
            setMessage({ type: "error", text: "An error occurred. Please try again." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card title="Send Money">
            <div className="p-4 space-y-4">
                <div className="space-y-1">
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                        <User className="w-4 h-4" />
                        Recipient Phone
                    </label>
                    <TextInput
                        placeholder="Enter phone number"
                        label=""
                        onChange={setNumber}
                    />
                </div>

                <div className="space-y-1">
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                        <Banknote className="w-4 h-4" />
                        Amount (₹)
                    </label>
                    <TextInput
                        placeholder="Enter amount"
                        label=""
                        type="number"
                        onChange={(val) => {
                            // Only allow positive numbers or empty string
                            if (val === "" || (Number(val) > 0 && !isNaN(Number(val)))) {
                                setAmount(val);
                            }
                        }}
                    />
                </div>

                <div className="pt-2">
                    <Button
                        onClick={handleSend}
                        className="w-full bg-indigo-600 hover:bg-indigo-700"
                        disabled={loading || !number || !amount}
                    >
                        <Send className="w-4 h-4 mr-2" />
                        {loading ? "Sending..." : "Send Money"}
                    </Button>
                </div>

                {message && (
                    <div className={`p-3 rounded-lg text-sm ${message.type === "success"
                        ? "bg-green-50 dark:bg-green-950/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-900"
                        : "bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-900"
                        }`}>
                        {message.text}
                    </div>
                )}

                <p className="text-xs text-center text-slate-500 dark:text-slate-400">
                    Money will be transferred instantly to the recipient's wallet.
                </p>
            </div>
        </Card>
    );
}