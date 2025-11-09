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
  const [userId, setUserId] = useState<number | null>(null);
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
      // Call the API endpoint
      const response = await fetch('https://172.121.40.231:8443/api/Home/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: formData.name,
          phoneNumber: formData.phone,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Store userId for later use
      setUserId(data.userId);

      toast({
        title: "OTP Sent",
        description: data.message || "Check your phone for verification code",
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
              <div className="absolute left-10 top-3 text-muted-foreground font-medium">+20</div>
              <Input
                id="phone"
                type="tel"
                placeholder="123 456 7890"
                value={formData.phone}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  setFormData({ ...formData, phone: value });
                }}
                className="pl-20 border-border focus-visible:ring-primary"
                maxLength={10}
              />
            </div>
          </div>


          <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
            Send OTP
          </Button>
        </form>
      </div>

      {showOTP && <OTPVerification onSuccess={handleOTPSuccess} onClose={() => setShowOTP(false)} phone={`+20${formData.phone}`} />}
    </div>
  );
};

export default Registration;
