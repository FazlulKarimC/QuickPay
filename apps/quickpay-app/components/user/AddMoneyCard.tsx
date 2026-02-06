"use client"
import { Button } from "@repo/ui/button";
import { Card } from "@repo/ui/card";
import { Select } from "@repo/ui/select";
import { useState } from "react";
import { TextInput } from "@repo/ui/textinput";
import { createOnRampTransaction } from "@/app/lib/actions/createOnrampTransaction";
import { SimulatedBankModal } from "./SimulatedBankModal";
import { Building, Plus, Banknote } from "lucide-react";
import { useRouter } from "next/navigation";

// Simulated banks for educational purposes
const SUPPORTED_BANKS = [
    { name: "HDFC Bank" },
    { name: "Axis Bank" },
    { name: "ICICI Bank" },
    { name: "SBI" }
];

export const AddMoney = () => {
    const router = useRouter();
    const [provider, setProvider] = useState(SUPPORTED_BANKS[0]?.name || "");
    const [value, setValue] = useState("");
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [paymentIntentId, setPaymentIntentId] = useState("");
    const [error, setError] = useState<string | null>(null);

    const handleAddMoney = async () => {
        setLoading(true);
        setError(null);

        try {
            const result = await createOnRampTransaction(provider, Number(value));

            if (result.paymentIntentId) {
                setPaymentIntentId(result.paymentIntentId);
                setModalOpen(true);
            } else if (result.message) {
                setError(result.message);
            } else {
                setError("Failed to create payment. Please try again.");
            }
        } catch (error) {
            console.error("Failed to create payment intent:", error);
            setError("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handlePaymentSuccess = () => {
        // Clear form inputs
        setValue("");
        setError(null);
        // Redirect to dashboard to show updated balance and transactions
        router.push("/user/dashboard");
    };

    return (
        <>
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
                            type="number"
                            onChange={(val) => {
                                const numVal = Number(val);
                                if (val === "" || (!isNaN(numVal) && numVal >= 0)) {
                                    setValue(val);
                                }
                            }}
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                            <Building className="w-4 h-4" />
                            Select Bank
                        </label>
                        <Select
                            onSelect={(value) => {
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
                            disabled={loading || !value || Number(value) <= 0}
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            {loading ? "Processing..." : "Add Money"}
                        </Button>
                    </div>

                    {error && (
                        <div className="p-3 rounded-lg text-sm bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-900">
                            {error}
                        </div>
                    )}

                    <p className="text-xs text-center text-slate-500 dark:text-slate-400">
                        A simulated bank interface will appear to complete the transaction.
                    </p>
                </div>
            </Card>

            <SimulatedBankModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                paymentIntentId={paymentIntentId}
                amount={Number(value)}
                provider={provider}
                onSuccess={handlePaymentSuccess}
            />
        </>
    );
}
