import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Check, DollarSign, Loader2 } from "lucide-react";
import QRScanner from "./QRScanner";

const DepositFlow = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState<"amount" | "scan" | "insertCash" | "confirm" | "success">("scan");
  const [qrCodeValue, setQrCodeValue] = useState<string>("");
  const [totalCash, setTotalCash] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    // Get userId from localStorage
    const id = localStorage.getItem('userId');
    if (!id) {
      toast({
        title: "Error",
        description: "User ID not found. Please register again.",
        variant: "destructive",
      });
      navigate("/");
      return;
    }
    setUserId(id);
  }, [navigate, toast]);


  const handleScanSuccess = useCallback(async (decodedText: string) => {
    setQrCodeValue(decodedText);
    toast({
      title: "QR Code Scanned",
      description: "ATM verified successfully",
    });
    
    if (!userId) {
      toast({
        title: "Error",
        description: "User ID not found. Please register again.",
        variant: "destructive",
      });
      return;
    }

    // Start cash-in transaction
    setIsProcessing(true);
    try {
      const response = await fetch('https://localhost:7199/api/Home/deposit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trans_type: "DEPST",
          terminal_id: decodedText,
          STATUS: "STARTCASHIN",
          User_Id: userId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to start deposit');
      }

      const data = await response.json();

      toast({
        title: "Ready",
        description: data.message || "Deposit Command Sent to ATM",
      });
      setStep("insertCash");
    } catch (error: any) {
      console.error('Start deposit error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to start transaction",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [userId, toast]);

  const handleContinueInsert = async () => {
    if (!userId || !qrCodeValue) {
      toast({
        title: "Error",
        description: "Missing transaction information",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch('https://localhost:7199/api/Home/deposit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trans_type: "DEPST",
          terminal_id: qrCodeValue,
          STATUS: "CASHINSERTED",
          User_Id: userId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to read cash amount');
      }

      const data = await response.json();

      setTotalCash(data.amount?.toString() || "0");
      setStep("confirm");
    } catch (error: any) {
      console.error('Cash inserted error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to read cash amount",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirm = async () => {
    if (!userId || !qrCodeValue) {
      toast({
        title: "Error",
        description: "Missing transaction information",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch('https://localhost:7199/api/Home/deposit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trans_type: "DEPST",
          terminal_id: qrCodeValue,
          STATUS: "CONFIRMED",
          User_Id: userId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to confirm transaction');
      }

      const data = await response.json();

      toast({
        title: "Success",
        description: data.message || "Deposit - Confirmed",
      });
      setStep("success");
    } catch (error: any) {
      console.error('Confirm deposit error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to confirm transaction",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRefund = async () => {
    if (!userId || !qrCodeValue) {
      toast({
        title: "Error",
        description: "Missing transaction information",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch('https://localhost:7199/api/Home/deposit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trans_type: "DEPST",
          terminal_id: qrCodeValue,
          STATUS: "REFUND",
          User_Id: userId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to refund');
      }

      const data = await response.json();

      toast({
        title: "Refunded",
        description: data.message || "Deposit - Refunded",
      });
      setStep("scan");
      setTotalCash("");
    } catch (error: any) {
      console.error('Refund error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to refund",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = async () => {
    if (!qrCodeValue || !userId) {
      navigate("/services");
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch('https://localhost:7199/api/Home/deposit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trans_type: "DEPST",
          terminal_id: qrCodeValue,
          STATUS: "CANCEL",
          User_Id: userId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to cancel transaction');
      }

      const data = await response.json();

      toast({
        title: "Cancelled",
        description: data.message || "Deposit - Cancelled",
      });
      navigate("/services");
    } catch (error: any) {
      console.error('Cancel error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to cancel transaction",
        variant: "destructive",
      });
      navigate("/services");
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
            {step === "scan" && "Scan ATM QR Code"}
            {step === "insertCash" && "Insert Cash"}
            {step === "confirm" && "Confirm Amount"}
            {step === "success" && "Deposit Complete"}
          </p>
        </div>
      </header>

      <main className="p-6 animate-fade-in">
        {step === "scan" && (
          <QRScanner 
            onScanSuccess={handleScanSuccess}
            onClose={() => navigate("/services")}
          />
        )}

        {step === "insertCash" && (
          <Card className="p-8 space-y-6">
            <h2 className="text-2xl font-bold text-foreground text-center">Insert Cash</h2>
            
            <div className="bg-muted rounded-lg p-6 text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full mx-auto mb-4 animate-pulse" />
              <p className="text-sm text-muted-foreground mb-2">Shutter opened. Please insert cash</p>
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
            {qrCodeValue && (
              <div className="text-sm text-muted-foreground">
                <p>ATM ID: {qrCodeValue.substring(0, 20)}{qrCodeValue.length > 20 ? '...' : ''}</p>
              </div>
            )}
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
