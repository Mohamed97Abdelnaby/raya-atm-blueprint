import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Check } from "lucide-react";
import QRScanner from "./QRScanner";

const WithdrawFlow = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState<"amount" | "confirm" | "scan" | "success">("amount");
  const [amount, setAmount] = useState("");
  const [account, setAccount] = useState("Main Account ****1234");
  const [qrCodeValue, setQrCodeValue] = useState<string>("");

  const handleAmountSubmit = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }
    setStep("scan");
  };

  const handleScanSuccess = (decodedText: string) => {
    setQrCodeValue(decodedText);
    toast({
      title: "QR Code Scanned",
      description: "ATM verified successfully",
    });
    setStep("confirm");
  };

  const handleConfirm = async () => {
    try {
      const userId = localStorage.getItem("userId");
      
      const response = await fetch("https://localhost:7199/api/Home/withdraw", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          trans_type: "WITHD",
          trans_amount: parseFloat(amount),
          terminal_id: qrCodeValue,
          User_Id: userId ? parseInt(userId) : null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: data.message || "Withdrawal Successful",
          description: `EGP ${data.amount || amount}`,
        });
        setStep("success");
      } else {
        toast({
          title: data.message || "Withdrawal Failed",
          description: "Please try again",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process withdrawal. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-gradient-to-r from-primary to-secondary text-white p-6 flex items-center gap-4">
        <button onClick={() => {
          if (step === "amount") navigate("/services");
          else if (step === "scan") setStep("amount");
          else if (step === "confirm") setStep("scan");
          else setStep("amount");
        }}>
          <ArrowLeft className="h-6 w-6" />
        </button>
        <div>
          <h1 className="text-xl font-bold">Withdraw Cash</h1>
          <p className="text-sm opacity-90">
            {step === "amount" && "Enter Amount"}
            {step === "scan" && "Scan ATM QR Code"}
            {step === "confirm" && "Review Transaction"}
            {step === "success" && "Withdrawal Complete"}
          </p>
        </div>
      </header>

      <main className="p-6 animate-fade-in">
        {step === "amount" && (
          <Card className="p-8 space-y-6">
            <div>
              <label className="text-sm text-muted-foreground">Selected Account</label>
              <p className="text-lg font-semibold text-foreground mt-1">{account}</p>
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Enter Amount (EGP)</label>
              <Input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="text-2xl font-bold text-center border-border focus-visible:ring-primary"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[100, 200, 500, 1000, 2000, 5000].map((preset) => (
                <Button
                  key={preset}
                  variant="outline"
                  onClick={() => setAmount(preset.toString())}
                  className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                >
                  {preset}
                </Button>
              ))}
            </div>

            <Button onClick={handleAmountSubmit} className="w-full bg-primary text-primary-foreground">
              Continue
            </Button>
          </Card>
        )}

        {step === "scan" && (
          <QRScanner 
            onScanSuccess={handleScanSuccess}
            onClose={() => setStep("amount")}
          />
        )}

        {step === "confirm" && (
          <Card className="p-8 space-y-6">
            <h2 className="text-2xl font-bold text-foreground text-center">Confirm Withdrawal</h2>
            
            <div className="space-y-4 border-t border-b border-border py-6">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-bold text-foreground text-xl">EGP {amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Account</span>
                <span className="font-medium text-foreground">{account}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">ATM ID</span>
                <span className="font-medium text-foreground">{qrCodeValue || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium text-foreground">{new Date().toLocaleDateString()}</span>
              </div>
            </div>

            <Button onClick={handleConfirm} className="w-full bg-gradient-to-r from-primary to-secondary text-white">
              Confirm Withdrawal
            </Button>
          </Card>
        )}

        {step === "success" && (
          <Card className="p-8 text-center space-y-6 animate-scale-in">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto">
              <Check className="h-10 w-10 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Withdrawal Successful!</h2>
              <p className="text-3xl font-bold text-primary">EGP {amount}</p>
            </div>
            {qrCodeValue && (
              <div className="text-sm text-muted-foreground">
                <p>ATM ID: {qrCodeValue.substring(0, 20)}{qrCodeValue.length > 20 ? '...' : ''}</p>
              </div>
            )}
            <p className="text-muted-foreground">
              Please collect your cash from the ATM
            </p>
            <Button onClick={() => navigate("/services")} className="w-full bg-primary text-primary-foreground">
              Done
            </Button>
          </Card>
        )}
      </main>
    </div>
  );
};

export default WithdrawFlow;
