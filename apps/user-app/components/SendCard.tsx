"use client"
import { Button } from "@repo/ui/button";
import { Card } from "@repo/ui/card";
import { TextInput } from "@repo/ui/textinput";
import { useState } from "react";
import { p2pTransfer } from "../app/lib/actions/p2pTransfer";
import { Send, User, Banknote } from "lucide-react";

export function SendCard() {
    const [number, setNumber] = useState("");
    const [amount, setAmount] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSend = async () => {
        setLoading(true);
        try {
            await p2pTransfer(number, Number(amount) * 100);
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
                        onChange={setAmount}
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

                <p className="text-xs text-center text-slate-500 dark:text-slate-400">
                    Money will be transferred instantly to the recipient's wallet.
                </p>
            </div>
        </Card>
    );
}