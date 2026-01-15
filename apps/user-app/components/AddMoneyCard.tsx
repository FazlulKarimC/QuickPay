"use client"
import { Button } from "@repo/ui/button";
import { Card } from "@repo/ui/card";
import { Select } from "@repo/ui/select";
import { useState } from "react";
import { TextInput } from "@repo/ui/textinput";
import { createOnRampTransaction } from "../app/lib/actions/createOnrampTransaction";
import { Building, Plus, Banknote } from "lucide-react";

const SUPPORTED_BANKS = [{
    name: "HDFC Bank",
    redirectUrl: "https://netbanking.hdfcbank.com"
}, {
    name: "Axis Bank",
    redirectUrl: "https://www.axisbank.com/"
}, {
    name: "ICICI Bank",
    redirectUrl: "https://www.icicibank.com/"
}, {
    name: "SBI",
    redirectUrl: "https://www.onlinesbi.com/"
}];

export const AddMoney = () => {
    const [redirectUrl, setRedirectUrl] = useState(SUPPORTED_BANKS[0]?.redirectUrl);
    const [provider, setProvider] = useState(SUPPORTED_BANKS[0]?.name || "");
    const [value, setValue] = useState(0);
    const [loading, setLoading] = useState(false);

    const handleAddMoney = async () => {
        setLoading(true);
        try {
            await createOnRampTransaction(provider, value);
            window.location.href = redirectUrl || "";
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card title="Add Money">
            <div className="p-4 space-y-4">
                <div className="space-y-1">
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                        <Banknote className="w-4 h-4" />
                        Amount (₹)
                    </label>
                    <TextInput
                        label=""
                        placeholder="Enter amount"
                        onChange={(val) => setValue(Number(val))}
                    />
                </div>

                <div className="space-y-1">
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                        <Building className="w-4 h-4" />
                        Select Bank
                    </label>
                    <Select
                        onSelect={(value) => {
                            setRedirectUrl(SUPPORTED_BANKS.find(x => x.name === value)?.redirectUrl || "");
                            setProvider(SUPPORTED_BANKS.find(x => x.name === value)?.name || "");
                        }}
                        options={SUPPORTED_BANKS.map(x => ({
                            key: x.name,
                            value: x.name
                        }))}
                    />
                </div>

                <div className="pt-2">
                    <Button
                        onClick={handleAddMoney}
                        className="w-full bg-indigo-600 hover:bg-indigo-700"
                        disabled={loading || value <= 0}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        {loading ? "Processing..." : "Add Money"}
                    </Button>
                </div>

                <p className="text-xs text-center text-slate-500 dark:text-slate-400">
                    You will be redirected to your bank's website to complete the transaction.
                </p>
            </div>
        </Card>
    );
}