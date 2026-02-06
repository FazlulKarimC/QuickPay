"use client";

import Link from "next/link";
import { CreditCard, Wallet, Send, Zap, Code, Rocket } from "lucide-react";
import { AnimatedPaymentCard } from "@/components/shared/AnimatedPaymentCard";
import { FeatureCard } from "@/components/shared/FeatureCard";
import { TechBadge } from "@/components/shared/TechBadge";
import { StatsCounter } from "@/components/shared/StatsCounter";

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-[rgb(var(--bg))]">
            {/* Hero Section */}
            <section className="relative overflow-hidden">
                {/* Background gradient */}
                <div className="absolute inset-0 bg-linear-to-br from-[rgb(var(--primary))]/10 via-transparent to-[rgb(var(--primary-dark))]/5 pointer-events-none" />

                <div className="container mx-auto px-4 max-w-7xl py-20 md:py-32 relative">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Left side - Text content */}
                        <div className="space-y-8">
                            {/* Fun badge */}
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[rgb(var(--surface))] border border-[rgb(var(--border))]">
                                <Rocket className="w-4 h-4 text-[rgb(var(--primary))]" />
                                <span className="text-sm text-[rgb(var(--text-muted))]">
                                    Personal Learning Project
                                </span>
                            </div>

                            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                                <span className="text-gradient">Payment Gateway</span>
                                <br />
                                <span className="text-[rgb(var(--text))]">for Developers</span>
                            </h1>

                            <p className="text-xl text-[rgb(var(--text-muted))] leading-relaxed">
                                A full-stack educational payment platform built with Next.js, Prisma, and PostgreSQL.
                                Features dual dashboards, P2P transfers, and a simulated bank processor. 🚀
                            </p>

                            {/* CTA Buttons */}
                            <div className="flex flex-wrap gap-4">
                                <Link
                                    href="/login"
                                    className="inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-linear-to-r from-[rgb(var(--primary))] to-[rgb(var(--primary-dark))] text-white font-semibold hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] hover:-translate-y-1 transition-all duration-300"
                                >
                                    <Wallet className="w-5 h-5" />
                                    User Dashboard
                                </Link>

                                <Link
                                    href="/merchant/login"
                                    className="inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-transparent border-2 border-[rgb(var(--primary))] text-[rgb(var(--primary))] font-semibold hover:bg-[rgb(var(--primary))]/10 hover:-translate-y-1 transition-all duration-300"
                                >
                                    <Code className="w-5 h-5" />
                                    Merchant Portal
                                </Link>
                            </div>

                            {/* Quick Stats */}
                            <div className="grid grid-cols-3 gap-6 pt-8">
                                <StatsCounter label="API Endpoints" value={15} suffix="+" />
                                <StatsCounter label="Avg Response" value={120} suffix="ms" />
                                <StatsCounter label="Success Rate" value={98} suffix="%" />
                            </div>
                        </div>

                        {/* Right side - Animated card */}
                        <div className="flex justify-center lg:justify-end">
                            <AnimatedPaymentCard />
                        </div>
                    </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute top-20 right-10 w-72 h-72 bg-[rgb(var(--primary))] opacity-10 rounded-full blur-3xl animate-pulse pointer-events-none" />
                <div className="absolute bottom-20 left-10 w-96 h-96 bg-[rgb(var(--primary-light))] opacity-5 rounded-full blur-3xl animate-pulse delay-1000 pointer-events-none" />
            </section>

            {/* Features Section */}
            <section className="py-20 relative">
                <div className="container mx-auto px-4 max-w-7xl">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-[rgb(var(--text))] mb-4">
                            What&apos;s Inside? 🎁
                        </h2>
                        <p className="text-[rgb(var(--text-muted))] text-lg">
                            Everything you need to understand modern payment systems
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={CreditCard}
                            title="Payment Processing"
                            description="Create, confirm, cancel, and refund payment intents with a Stripe-inspired API. Includes webhook callbacks and idempotency keys."
                        />
                        <FeatureCard
                            icon={Wallet}
                            title="User Wallets"
                            description="Full wallet system with balance tracking, transaction history, and simulated bank transfers. Add money, check balance, view history."
                            gradient="bg-linear-to-br from-[rgb(var(--success))] to-emerald-600"
                        />
                        <FeatureCard
                            icon={Send}
                            title="P2P Transfers"
                            description="Send money to other users instantly with phone number lookup. Real-time balance updates and transaction tracking."
                            gradient="bg-linear-to-br from-[rgb(var(--info))] to-blue-600"
                        />
                        <FeatureCard
                            icon={Zap}
                            title="Rate Limiting"
                            description="Production-ready rate limiting on all API endpoints. Configurable windows and request limits per user/IP."
                            gradient="bg-linear-to-br from-[rgb(var(--warning))] to-orange-600"
                        />
                        <FeatureCard
                            icon={Code}
                            title="Dual Auth System"
                            description="Separate authentication flows for users (phone login) and merchants (API keys + dashboard access). Built with NextAuth."
                            gradient="bg-linear-to-br from-purple-500 to-purple-700"
                        />
                        <FeatureCard
                            icon={Rocket}
                            title="Type-Safe & Modern"
                            description="Built with TypeScript, Prisma ORM, and Next.js 16 App Router. Fully typed API responses and database queries."
                            gradient="bg-linear-to-br from-pink-500 to-rose-600"
                        />
                    </div>
                </div>
            </section>

            {/* Tech Stack Section */}
            <section className="py-20 bg-[rgb(var(--surface))]/30">
                <div className="container mx-auto px-4 max-w-7xl">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-[rgb(var(--text))] mb-4">Built With ⚡</h2>
                        <p className="text-[rgb(var(--text-muted))]">Modern tech stack for learning and production</p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-4">
                        <TechBadge name="Next.js 16" icon="⚛️" />
                        <TechBadge name="TypeScript" icon="📘" />
                        <TechBadge name="Prisma" icon="🔷" />
                        <TechBadge name="PostgreSQL" icon="🐘" />
                        <TechBadge name="NextAuth" icon="🔐" />
                        <TechBadge name="Tailwind CSS" icon="🎨" />
                        <TechBadge name="Turborepo" icon="⚡" />
                        <TechBadge name="shadcn/ui" icon="✨" />
                    </div>
                </div>
            </section>

            {/* Quick Start Section */}
            <section className="py-20">
                <div className="container mx-auto px-4 max-w-7xl">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-12">
                            <h2 className="text-4xl font-bold text-[rgb(var(--text))] mb-4">
                                Try It Out 🎮
                            </h2>
                            <p className="text-[rgb(var(--text-muted))]">
                                Login with test credentials and explore the platform
                            </p>
                        </div>

                        <div className="glass-card p-8 rounded-2xl border border-[rgb(var(--border))]">
                            <div className="grid md:grid-cols-2 gap-8">
                                {/* User credentials */}
                                <div>
                                    <h3 className="text-xl font-bold text-[rgb(var(--text))] mb-4 flex items-center gap-2">
                                        <Wallet className="w-5 h-5 text-[rgb(var(--primary))]" />
                                        User Account
                                    </h3>
                                    <div className="space-y-2 font-mono text-sm">
                                        <div className="flex justify-between items-center py-2 border-b border-[rgb(var(--border))]">
                                            <span className="text-[rgb(var(--text-muted))]">Phone:</span>
                                            <span className="text-[rgb(var(--text-secondary))]">1111111111</span>
                                        </div>
                                        <div className="flex justify-between items-center py-2">
                                            <span className="text-[rgb(var(--text-muted))]">Password:</span>
                                            <span className="text-[rgb(var(--text-secondary))]">password</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Merchant credentials */}
                                <div>
                                    <h3 className="text-xl font-bold text-[rgb(var(--text))] mb-4 flex items-center gap-2">
                                        <Code className="w-5 h-5 text-[rgb(var(--primary))]" />
                                        Merchant Account
                                    </h3>
                                    <div className="space-y-2 font-mono text-sm">
                                        <div className="flex justify-between items-center py-2 border-b border-[rgb(var(--border))]">
                                            <span className="text-[rgb(var(--text-muted))]">Phone:</span>
                                            <span className="text-[rgb(var(--text-secondary))]">3333333333</span>
                                        </div>
                                        <div className="flex justify-between items-center py-2">
                                            <span className="text-[rgb(var(--text-muted))]">Password:</span>
                                            <span className="text-[rgb(var(--text-secondary))]">password</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-8 border-t border-[rgb(var(--border))]">
                                <p className="text-center text-[rgb(var(--text-muted))] text-sm mb-4">
                                    👆 Click the buttons above to get started!
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-[rgb(var(--border))]">
                <div className="container mx-auto px-4 max-w-7xl">
                    <div className="text-center space-y-4">
                        <div className="flex justify-center gap-6 text-[rgb(var(--text-muted))]">
                            <a
                                href="https://github.com/FazlulKarimC/QuickPay"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-[rgb(var(--primary))] transition-colors"
                            >
                                GitHub
                            </a>
                            <a
                                href="/api/health"
                                target="_blank"
                                className="hover:text-[rgb(var(--primary))] transition-colors"
                            >
                                API Health
                            </a>
                        </div>

                        <p className="text-[rgb(var(--text-muted))] text-sm">
                            Made with 💙 as a learning project • QuickPay © 2026
                        </p>

                        <p className="text-[rgb(var(--text-disabled))] text-xs">
                            ⚠️ Educational purposes only • Not for production use
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
