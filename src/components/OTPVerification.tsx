import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { X } from "lucide-react";
import Confetti from "react-confetti";

interface OTPVerificationProps {
  onSuccess: () => void;
  onClose: () => void;
  phone: string;
}

const OTPVerification = ({ onSuccess, onClose, phone }: OTPVerificationProps) => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [showConfetti, setShowConfetti] = useState(false);
  const { toast } = useToast();

  const handleOTPChange = (index: number, value: string) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleVerify = async () => {
    const otpValue = otp.join("");
    
    if (otpValue.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter all 6 digits",
        variant: "destructive",
      });
      return;
    }

    const userId = localStorage.getItem("userId");
    if (!userId) {
      toast({
        title: "Error",
        description: "User ID not found. Please register again.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch('https://prod.rayaswteam.com:1443/api/Home/VerifyOtp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          UserId: userId,
          OTP: otpValue,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to verify OTP');
      }

      const data = await response.json();

      if (data?.message === "OTP verified successfully") {
        // Store user phone in localStorage for future use
        localStorage.setItem("user_phone", phone);
        
        setShowConfetti(true);
        toast({
          title: "Verification Successful!",
          description: "Welcome to Raya IT ATM Services",
        });

        setTimeout(() => {
          onSuccess();
        }, 2000);
      } else {
        toast({
          title: "Invalid OTP",
          description: "The code you entered is incorrect",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Verification error:', error);
      toast({
        title: "Verification Failed",
        description: error.message || "Failed to verify OTP. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      {showConfetti && <Confetti recycle={false} numberOfPieces={500} />}
      
      <div className="fixed inset-0 bg-primary/20 backdrop-blur-sm flex items-center justify-center p-6 z-50 animate-fade-in">
        <div className="bg-card rounded-2xl shadow-2xl p-8 w-full max-w-md animate-scale-in">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-foreground">Verify OTP</h2>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
              <X className="h-6 w-6" />
            </button>
          </div>

          <p className="text-muted-foreground mb-6">
            Enter the 6-digit code sent to your WhatsApp
          </p>

          <div className="flex gap-2 mb-6">
            {otp.map((digit, index) => (
              <Input
                key={index}
                id={`otp-${index}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOTPChange(index, e.target.value)}
                className="w-12 h-12 text-center text-xl font-bold border-border focus-visible:ring-primary"
              />
            ))}
          </div>

          <Button
            onClick={handleVerify}
            className="w-full bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90"
          >
            Verify
          </Button>

          <button className="w-full text-center text-sm text-muted-foreground mt-4 hover:text-primary">
            Resend OTP
          </button>
        </div>
      </div>
    </>
  );
};

export default OTPVerification;
