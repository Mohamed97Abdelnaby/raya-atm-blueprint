import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, QrCode, Check } from "lucide-react";

const WithdrawFlow = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState<"scan" | "amount" | "confirm" | "success">("scan");
  const [amount, setAmount] = useState("");
  const [account, setAccount] = useState("Main Account ****1234");

  const handleScan = () => {
    toast({
      title: "ATM Linked",
      description: "Successfully connected to ATM #4521",
    });
    setStep("amount");
  };

  const handleAmountSubmit = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }
    setStep("confirm");
  };

  const handleConfirm = () => {
    setStep("success");
    toast({
      title: "Withdrawal Successful",
      description: `EGP ${amount} has been withdrawn`,
    });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-primary text-primary-foreground p-6 flex items-center gap-4">
        <button onClick={() => step === "scan" ? navigate("/services") : setStep("scan")}>
          <ArrowLeft className="h-6 w-6" />
        </button>
        <div>
          <h1 className="text-xl font-bold">Withdraw Cash</h1>
          <p className="text-sm opacity-90">
            {step === "scan" && "Scan ATM QR Code"}
            {step === "amount" && "Enter Amount"}
            {step === "confirm" && "Confirm Transaction"}
            {step === "success" && "Transaction Complete"}
          </p>
        </div>
      </header>

      <main className="p-6 animate-fade-in">
        {step === "scan" && (
          <Card className="p-8 text-center space-y-6">
            <div className="w-64 h-64 mx-auto bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center">
              <QrCode className="h-32 w-32 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground mb-2">Position QR Code</h2>
              <p className="text-muted-foreground">Align the QR code within the frame</p>
            </div>
            <Button onClick={handleScan} className="w-full bg-primary text-primary-foreground">
              Simulate Scan
            </Button>
          </Card>
        )}

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
                <span className="font-medium text-foreground">#4521</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium text-foreground">{new Date().toLocaleDateString()}</span>
              </div>
            </div>

            <Button onClick={handleConfirm} className="w-full bg-primary text-primary-foreground">
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
