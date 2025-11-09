import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Check, DollarSign, Loader2 } from "lucide-react";
import QRScanner from "./QRScanner";
import { supabase } from "@/integrations/supabase/client";

const DepositFlow = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState<"amount" | "scan" | "insertCash" | "confirm" | "success">("amount");
  const [amount, setAmount] = useState("");
  const [qrCodeValue, setQrCodeValue] = useState<string>("");
  const [transactionId, setTransactionId] = useState<string>("");
  const [totalCash, setTotalCash] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [userPhone, setUserPhone] = useState<string>("");

  useEffect(() => {
    // Get user phone from localStorage or session
    const phone = localStorage.getItem('userPhone') || '+201092348204'; // Fallback for testing
    setUserPhone(phone);
  }, []);

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

  const handleScanSuccess = async (decodedText: string) => {
    setQrCodeValue(decodedText);
    toast({
      title: "QR Code Scanned",
      description: "ATM verified successfully",
    });
    
    // Start cash-in transaction
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('atm-deposit', {
        body: {
          action: 'STARTCASHIN',
          amount: parseFloat(amount),
          atmId: decodedText,
          userPhone
        }
      });

      if (error) throw error;

      setTransactionId(data.transactionId);
      toast({
        title: "Ready",
        description: data.message,
      });
      setStep("insertCash");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start transaction",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleContinueInsert = async () => {
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('atm-deposit', {
        body: {
          action: 'CASHINSERTED',
          transactionId
        }
      });

      if (error) throw error;

      setTotalCash(data.total_cash);
      setStep("confirm");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to read cash amount",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('atm-deposit', {
        body: {
          action: 'CONFIRMED',
          transactionId,
          totalCash: parseFloat(totalCash),
          userPhone
        }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: data.message,
      });
      setStep("success");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to confirm transaction",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRefund = async () => {
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('atm-deposit', {
        body: {
          action: 'REFUND',
          transactionId
        }
      });

      if (error) throw error;

      toast({
        title: "Refunded",
        description: data.message,
      });
      setStep("amount");
      setAmount("");
      setTotalCash("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refund",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = async () => {
    if (!transactionId) {
      navigate("/services");
      return;
    }

    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('atm-deposit', {
        body: {
          action: 'CANCEL',
          transactionId
        }
      });

      if (error) throw error;

      toast({
        title: "Cancelled",
        description: data.message,
      });
      navigate("/services");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel transaction",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-gradient-to-r from-primary to-secondary text-white p-6 flex items-center gap-4">
        <button onClick={handleCancel} disabled={isProcessing}>
          <ArrowLeft className="h-6 w-6" />
        </button>
        <div>
          <h1 className="text-xl font-bold">Deposit Cash</h1>
          <p className="text-sm opacity-90">
            {step === "amount" && "Enter Amount"}
            {step === "scan" && "Scan ATM QR Code"}
            {step === "insertCash" && "Insert Cash"}
            {step === "confirm" && "Confirm Amount"}
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

        {step === "scan" && (
          <QRScanner 
            onScanSuccess={handleScanSuccess}
            onClose={() => setStep("amount")}
          />
        )}

        {step === "insertCash" && (
          <Card className="p-8 space-y-6">
            <h2 className="text-2xl font-bold text-foreground text-center">Insert Cash</h2>
            
            <div className="bg-muted rounded-lg p-6 text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full mx-auto mb-4 animate-pulse" />
              <p className="text-sm text-muted-foreground mb-2">Shutter opened. Please insert cash</p>
              <p className="text-3xl font-bold text-foreground">EGP {amount}</p>
            </div>

            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• Insert bills one at a time</p>
              <p>• Ensure bills are not torn or damaged</p>
              <p>• Maximum 50 notes per transaction</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button 
                onClick={handleContinueInsert} 
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-primary to-secondary text-white"
              >
                {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Continue"}
              </Button>
              <Button 
                onClick={handleCancel} 
                disabled={isProcessing}
                variant="outline"
                className="w-full"
              >
                Cancel
              </Button>
            </div>
          </Card>
        )}

        {step === "confirm" && (
          <Card className="p-8 space-y-6">
            <h2 className="text-2xl font-bold text-foreground text-center">Confirm Amount</h2>
            
            <div className="bg-muted rounded-lg p-6 text-center">
              <p className="text-sm text-muted-foreground mb-2">Total cash inserted</p>
              <p className="text-4xl font-bold text-foreground">EGP {totalCash}</p>
            </div>

            <p className="text-sm text-center text-muted-foreground">
              Please confirm the amount counted by the ATM
            </p>

            <div className="grid grid-cols-2 gap-4">
              <Button 
                onClick={handleConfirm} 
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-primary to-secondary text-white"
              >
                {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm"}
              </Button>
              <Button 
                onClick={handleRefund} 
                disabled={isProcessing}
                variant="destructive"
                className="w-full"
              >
                {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Refund"}
              </Button>
            </div>
          </Card>
        )}

        {step === "success" && (
          <Card className="p-8 text-center space-y-6 animate-scale-in">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto">
              <Check className="h-10 w-10 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Deposit Successful!</h2>
              <p className="text-3xl font-bold text-primary">EGP {totalCash}</p>
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>Transaction ID: {transactionId.substring(0, 8)}...</p>
              {qrCodeValue && (
                <p>ATM ID: {qrCodeValue.substring(0, 20)}{qrCodeValue.length > 20 ? '...' : ''}</p>
              )}
            </div>
            <p className="text-muted-foreground">
              Cash stored successfully and added to your account
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
