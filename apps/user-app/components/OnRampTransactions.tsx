import { Card } from "@repo/ui/card"

export const OnRampTransactions = ({
    transactions
}: {
    transactions: {
        time: Date,
        amount: number,
        status: string,
        provider: string
    }[]
}) => {
    if (!transactions.length) {
        return <Card title="Recent Transactions">
            <div className="text-center pb-8 pt-8">
                No Recent transactions
            </div>
        </Card>
    }
    return <Card title="Recent Transactions">
        <div className="p-4 space-y-3">
            {transactions.map((t, index) => <div key={index} className="flex justify-between py-2 border-b border-slate-200 dark:border-slate-800 last:border-0">
                <div>
                    <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        Received INR
                    </div>
                    <div className="text-slate-600 dark:text-slate-400 text-xs mt-1">
                        {t.time.toDateString()}
                    </div>
                </div>
                <div className="flex flex-col justify-center font-semibold text-green-600 dark:text-green-400">
                    + Rs {t.amount / 100}
                </div>

            </div>)}
        </div>
    </Card>
}