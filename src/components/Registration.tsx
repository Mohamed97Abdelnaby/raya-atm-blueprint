import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Phone, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import OTPVerification from "./OTPVerification";

const Registration = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showOTP, setShowOTP] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    try {
      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      // Register user in database
      const { error: registerError } = await supabase.functions.invoke('register-user', {
        body: {
          name: formData.name,
          phone: formData.phone,
          otp,
        },
      });

      if (registerError) {
        throw registerError;
      }

      // Send OTP via WhatsApp
      const { error: otpError } = await supabase.functions.invoke('send-otp', {
        body: {
          phone: formData.phone,
          otp,
        },
      });

      if (otpError) {
        throw otpError;
      }

      toast({
        title: "OTP Sent",
        description: "Check your WhatsApp for verification code",
      });
      setShowOTP(true);
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to send OTP. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleOTPSuccess = () => {
    navigate("/services");
  };

  return (
    <div className="min-h-screen bg-background p-6 flex flex-col items-center justify-center animate-fade-in">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary mb-2">Create Your Account</h1>
          <p className="text-muted-foreground">Enter your details to register securely</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-foreground">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                id="name"
                type="text"
                placeholder="Enter your name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="pl-10 border-border focus-visible:ring-primary"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-foreground">Phone Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                id="phone"
                type="tel"
                placeholder="+20 123 456 7890"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="pl-10 border-border focus-visible:ring-primary"
              />
            </div>
          </div>


          <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
            Send OTP
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Already registered?{" "}
          <button
            onClick={() => navigate("/login")}
            className="text-primary underline hover:text-primary/80"
          >
            Login
          </button>
        </p>
      </div>

      {showOTP && <OTPVerification onSuccess={handleOTPSuccess} onClose={() => setShowOTP(false)} phone={formData.phone} />}
    </div>
  );
};

export default Registration;
