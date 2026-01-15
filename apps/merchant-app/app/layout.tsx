import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "../provider";
import { MerchantSidebar } from "../components/MerchantSidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "QuickPay Merchant Portal",
  description: "Manage your payments, transactions, and API settings",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-slate-50 dark:bg-slate-950 min-h-screen`}>
        <Providers>
          <MerchantSidebar />
          <main className="ml-64 min-h-screen">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
