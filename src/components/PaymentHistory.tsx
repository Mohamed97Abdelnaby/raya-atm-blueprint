import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { ArrowLeft, ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Transaction {
  id: number;
  userId: number;
  type: string;
  amount: number;
  createdAt: string;
}

const PaymentHistory = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (userId) {
      fetchTransactions(userId);
    } else {
      setLoading(false);
      toast({
        title: "Not Authenticated",
        description: "Please register or login first",
        variant: "destructive",
      });
      navigate("/register");
    }
  }, [navigate, toast]);

  const fetchTransactions = async (userId: string) => {
    try {
      const response = await fetch('https://localhost:7199/api/Home/UserTransactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }

      const data = await response.json();
      // Sort by createdAt descending (most recent first)
      const sortedData = data.sort((a: Transaction, b: Transaction) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setTransactions(sortedData);
    } catch (error: any) {
      console.error("Error fetching transactions:", error);
      toast({
        title: "Error",
        description: "Failed to load transactions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading transactions...</p>
          </div>
        ) : transactions.length > 0 ? (
          transactions.map((transaction) => (
            <Card key={transaction.id} className="p-4 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  transaction.type === "Withdrawal" 
                    ? "bg-primary/10" 
                    : "bg-green-500/10"
                }`}>
                  {transaction.type === "Withdrawal" ? (
                    <ArrowDownToLine className="h-6 w-6 text-primary" />
                  ) : (
                    <ArrowUpFromLine className="h-6 w-6 text-green-500" />
                  )}
                </div>

                <div className="flex-1">
                  <p className="font-semibold text-foreground">{transaction.type}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(transaction.createdAt)} • {formatTime(transaction.createdAt)}
                  </p>
                </div>

                <div className="text-right">
                  <p className={`text-lg font-bold ${
                    transaction.type === "Withdrawal" ? "text-primary" : "text-green-500"
                  }`}>
                    {transaction.type === "Withdrawal" ? "-" : "+"}EGP {transaction.amount}
                  </p>
                </div>
              </div>
            </Card>
          ))
        ) : (
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
