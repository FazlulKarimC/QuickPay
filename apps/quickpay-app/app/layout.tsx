import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "../provider";

export const metadata: Metadata = {
    title: "QuickPay - Payment Gateway",
    description: "Modern payment gateway for users and merchants",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>
                <Providers>
                    {children}
                </Providers>
            </body>
        </html>
    );
}
