"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export default function MerchantLogin() {
    const router = useRouter();
    const [phone, setPhone] = useState("3333333333");
    const [password, setPassword] = useState("password");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const result = await signIn("merchant-credentials", {
                phone,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError("Invalid phone number or password");
            } else if (result?.ok) {
                router.push("/merchant/dashboard");
            }
        } catch (err) {
            setError("An error occurred during login");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[rgb(var(--bg))] p-4">
            <Card className="w-full max-w-md p-8 glass-card">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gradient mb-2">QuickPay</h1>
                    <p className="text-[rgb(var(--text-muted))]">Merchant Login</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium mb-2">
                            Phone Number
                        </label>
                        <Input
                            id="phone"
                            type="text"
                            placeholder="3333333333"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                            className="w-full"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium mb-2">
                            Password
                        </label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full"
                        />
                    </div>

                    {error && (
                        <div className="text-[rgb(var(--error))] text-sm text-center">
                            {error}
                        </div>
                    )}

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full"
                    >
                        {loading ? "Signing in..." : "Sign In"}
                    </Button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-sm text-[rgb(var(--text-muted))]">
                        Are you a user?{" "}
                        <a
                            href="/login"
                            className="text-[rgb(var(--primary))] hover:underline"
                        >
                            Login here
                        </a>
                    </p>
                </div>
            </Card>
        </div>
    );
}
