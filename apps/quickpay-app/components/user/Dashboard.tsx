"use client";
import { useRouter } from "next/navigation";
export default function Dashboard() {
      const router = useRouter();

  return (
    <div className="h-[92vh] flex flex-col items-center justify-between text-white">
      {/* Header */}
      <header className="w-full flex justify-between items-center px-8 py-6">
      </header>

      {/* Main Content */}
      <main className="flex flex-col items-center text-center px-6">
        {/* Welcome Message */}
        <h1 className="text-5xl font-extrabold mb-4 drop-shadow-md">
          Welcome to QuickPay
        </h1>
        <p className="text-lg max-w-lg mb-8">
          Easily manage your payments, track transactions, and send money with a few clicks. 
          Your secure and reliable payment solution starts here.
        </p>

        {/* Statistics Section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <div className="bg-white/20 backdrop-blur-lg p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-2">1M+</h2>
            <p>Active accounts</p>
          </div>
          <div className="bg-white/20 backdrop-blur-lg p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-2">3.5B</h2>
            <p>Total payment transactions</p>
          </div>
          <div className="bg-white/20 backdrop-blur-lg p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-2">$40B</h2>
            <p>Total payment volume</p>
          </div>
        </div>

        {/* Call to Action Button */}
        <button className="px-8 py-3 bg-indigo-700 hover:bg-indigo-800 text-white font-semibold rounded-lg shadow-lg transition-all"
          onClick={() => router.push("/transfer")}>
          Make a Payment
        </button>
      </main>

      {/* Footer */}
      <footer className="w-full text-center py-4 bg-white/10">
        <p className="text-sm">
          © {new Date().getFullYear()} QuickPay. All rights reserved. Built with ❤️ by fazlul.
        </p>
      </footer>
    </div>
  );
}


