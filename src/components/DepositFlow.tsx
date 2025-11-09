import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, QrCode, Check, DollarSign } from "lucide-react";

const DepositFlow = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState<"amount" | "confirm" | "scan" | "success">("amount");
  const [amount, setAmount] = useState("");

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
    setStep("scan");
  };

  const handleScan = () => {
    toast({
      title: "Deposit Successful",
      description: `EGP ${amount} has been deposited`,
    });
    setStep("success");
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-gradient-to-r from-primary to-secondary text-white p-6 flex items-center gap-4">
        <button onClick={() => step === "amount" ? navigate("/services") : setStep("amount")}>
          <ArrowLeft className="h-6 w-6" />
        </button>
        <div>
          <h1 className="text-xl font-bold">Deposit Cash</h1>
          <p className="text-sm opacity-90">
            {step === "amount" && "Enter Amount"}
            {step === "confirm" && "Insert Cash"}
            {step === "scan" && "Scan ATM QR Code"}
            {step === "success" && "Deposit Complete"}
          </p>
        </div>
      </header>

      <main className="p-6 animate-fade-in">
        {step === "amount" && (
          <Card className="p-8 space-y-6">
            <div className="text-center">
              <DollarSign className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h2 className="text-xl font-bold text-foreground">How much to deposit?</h2>
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

            <Button onClick={handleAmountSubmit} className="w-full bg-gradient-to-r from-primary to-secondary text-white">
              Continue
            </Button>
          </Card>
        )}

        {step === "confirm" && (
          <Card className="p-8 space-y-6">
            <h2 className="text-2xl font-bold text-foreground text-center">Insert Cash</h2>
            
            <div className="bg-muted rounded-lg p-6 text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full mx-auto mb-4 animate-pulse" />
              <p className="text-sm text-muted-foreground mb-2">ATM is ready to accept cash</p>
              <p className="text-3xl font-bold text-foreground">EGP {amount}</p>
            </div>

            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• Insert bills one at a time</p>
              <p>• Ensure bills are not torn or damaged</p>
              <p>• Maximum 50 notes per transaction</p>
            </div>

            <Button onClick={handleConfirm} className="w-full bg-gradient-to-r from-primary to-secondary text-white">
              Continue to ATM
            </Button>
          </Card>
        )}

        {step === "scan" && (
          <Card className="p-8 text-center space-y-6">
            <div className="w-64 h-64 mx-auto bg-gradient-to-br from-secondary to-primary rounded-2xl flex items-center justify-center">
              <QrCode className="h-32 w-32 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground mb-2">Scan ATM QR Code</h2>
              <p className="text-muted-foreground">Align the QR code to complete deposit</p>
            </div>
            <Button onClick={handleScan} className="w-full bg-gradient-to-r from-primary to-secondary text-white">
              Simulate Scan
            </Button>
          </Card>
        )}

        {step === "success" && (
          <Card className="p-8 text-center space-y-6 animate-scale-in">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto">
              <Check className="h-10 w-10 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Deposit Successful!</h2>
              <p className="text-3xl font-bold text-primary">EGP {amount}</p>
            </div>
            <p className="text-muted-foreground">
              Your deposit has been processed successfully
            </p>
            <Button onClick={() => navigate("/services")} className="w-full bg-gradient-to-r from-primary to-secondary text-white">
              Done
            </Button>
          </Card>
        )}
      </main>
    </div>
  );
};

export default DepositFlow;
