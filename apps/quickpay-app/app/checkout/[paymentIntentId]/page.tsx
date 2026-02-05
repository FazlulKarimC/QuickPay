import { getPaymentIntentById } from "@/app/lib/services/payment";
import { MerchantHeader } from "@repo/ui/merchant-header";
import { AmountDisplay } from "@repo/ui/amount-display";
import { PaymentSummary } from "@repo/ui/payment-summary";
import { Button } from "@repo/ui/button";
import { Card } from "@repo/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { notFound, redirect } from "next/navigation";
import { CreditCard, Smartphone, Building } from "lucide-react";

export default async function CheckoutPage({
    params
}: {
    params: Promise<{ paymentIntentId: string }>
}) {
    try {
        const { paymentIntentId } = await params;
        const payment = await getPaymentIntentById(paymentIntentId);

        // Redirect if already completed
        if (payment.status === 'succeeded') {
            redirect('/checkout/success');
        }

        async function processPayment(formData: FormData) {
            "use server";
            const method = formData.get('method') as string;

            // Call the confirm API (simulated for now via direct import or fetch)
            // For this phase, we mock the confirmation call or use the API route
            // Ideally we would call the confirmPayment service function here

            // Temporary redirect to success for demo
            redirect(`/checkout/success?amount=${payment.amount}`);
        }

        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
                <div className="w-full max-w-md space-y-4">

                    <MerchantHeader
                        name={payment.merchant?.name || "Merchant"}
                        reference={payment.id}
                    />

                    <Card className="overflow-hidden border-slate-200 dark:border-slate-800 shadow-xl">
                        <div className="p-6 bg-white dark:bg-slate-900 space-y-6">

                            <div className="text-center py-4">
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Total to pay</p>
                                <AmountDisplay amount={payment.amount} size="xl" />
                            </div>

                            <Tabs defaultValue="card" className="w-full">
                                <TabsList className="grid w-full grid-cols-3 mb-6 bg-slate-100 dark:bg-slate-800">
                                    <TabsTrigger value="card" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700">
                                        <CreditCard className="w-4 h-4 mr-2" />
                                        Card
                                    </TabsTrigger>
                                    <TabsTrigger value="upi" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700">
                                        <Smartphone className="w-4 h-4 mr-2" />
                                        UPI
                                    </TabsTrigger>
                                    <TabsTrigger value="netbanking" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700">
                                        <Building className="w-4 h-4 mr-2" />
                                        Net
                                    </TabsTrigger>
                                </TabsList>

                                <form action={processPayment}>
                                    <TabsContent value="card" className="space-y-4 animate-in fade-in-50">
                                        <div className="space-y-2">
                                            <Label htmlFor="cardNumber">Card Number</Label>
                                            <Input id="cardNumber" placeholder="0000 0000 0000 0000" className="font-mono" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="expiry">Expiry</Label>
                                                <Input id="expiry" placeholder="MM/YY" className="font-mono" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="cvc">CVC</Label>
                                                <Input id="cvc" placeholder="123" className="font-mono" />
                                            </div>
                                        </div>
                                        <input type="hidden" name="method" value="card" />
                                        <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white" size="lg">
                                            Pay now
                                        </Button>
                                    </TabsContent>

                                    <TabsContent value="upi" className="space-y-4 animate-in fade-in-50">
                                        <div className="space-y-2">
                                            <Label htmlFor="vpa">UPI ID</Label>
                                            <Input id="vpa" placeholder="username@bank" />
                                        </div>
                                        <input type="hidden" name="method" value="upi" />
                                        <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white" size="lg">
                                            Pay now
                                        </Button>
                                    </TabsContent>

                                    <TabsContent value="netbanking" className="space-y-4 animate-in fade-in-50">
                                        <div className="space-y-2">
                                            <Label>Select Bank</Label>
                                            <select className="w-full p-2 rounded-md border border-slate-200 dark:border-slate-800 bg-background">
                                                <option>HDFC Bank</option>
                                                <option>ICICI Bank</option>
                                                <option>SBI</option>
                                                <option>Axis Bank</option>
                                            </select>
                                        </div>
                                        <input type="hidden" name="method" value="netbanking" />
                                        <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white" size="lg">
                                            Pay now
                                        </Button>
                                    </TabsContent>
                                </form>
                            </Tabs>

                            <PaymentSummary
                                items={[
                                    { label: "Subtotal", value: <AmountDisplay amount={payment.amount} size="sm" /> },
                                    { label: "Processing Fee", value: "₹0.00" },
                                ]}
                            />
                        </div>
                    </Card>

                    <div className="text-center text-xs text-slate-400">
                        Powered by QuickPay Secured Gateway
                    </div>
                </div>
            </div>
        );
    } catch (e) {
        notFound();
    }
}
