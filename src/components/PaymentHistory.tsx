import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { ArrowLeft, ArrowDownToLine, ArrowUpFromLine } from "lucide-react";

const PaymentHistory = () => {
  const navigate = useNavigate();

  const transactions = [
    { id: 1, type: "withdraw", amount: 500, date: "2024-01-15", time: "14:30", atm: "#4521" },
    { id: 2, type: "deposit", amount: 1000, date: "2024-01-14", time: "10:15", atm: "#4521" },
    { id: 3, type: "withdraw", amount: 200, date: "2024-01-13", time: "16:45", atm: "#4522" },
    { id: 4, type: "deposit", amount: 750, date: "2024-01-12", time: "09:20", atm: "#4521" },
    { id: 5, type: "withdraw", amount: 1500, date: "2024-01-10", time: "11:30", atm: "#4523" },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-primary text-primary-foreground p-6 flex items-center gap-4">
        <button onClick={() => navigate("/services")}>
          <ArrowLeft className="h-6 w-6" />
        </button>
        <div>
          <h1 className="text-xl font-bold">Payment History</h1>
          <p className="text-sm opacity-90">View all your transactions</p>
        </div>
      </header>

      <main className="p-6 space-y-4 animate-fade-in">
        {transactions.map((transaction) => (
          <Card key={transaction.id} className="p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                transaction.type === "withdraw" 
                  ? "bg-primary/10" 
                  : "bg-green-500/10"
              }`}>
                {transaction.type === "withdraw" ? (
                  <ArrowDownToLine className="h-6 w-6 text-primary" />
                ) : (
                  <ArrowUpFromLine className="h-6 w-6 text-green-500" />
                )}
              </div>

              <div className="flex-1">
                <p className="font-semibold text-foreground capitalize">{transaction.type}</p>
                <p className="text-sm text-muted-foreground">
                  {transaction.date} • {transaction.time} • ATM {transaction.atm}
                </p>
              </div>

              <div className="text-right">
                <p className={`text-lg font-bold ${
                  transaction.type === "withdraw" ? "text-primary" : "text-green-500"
                }`}>
                  {transaction.type === "withdraw" ? "-" : "+"}EGP {transaction.amount}
                </p>
              </div>
            </div>
          </Card>
        ))}

        {transactions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No transactions yet</p>
            <button
              onClick={() => navigate("/services")}
              className="text-primary hover:underline"
            >
              Start a transaction
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default PaymentHistory;
