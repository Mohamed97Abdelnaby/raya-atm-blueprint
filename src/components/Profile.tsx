import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User as UserIcon, Phone, Mail, CreditCard, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userData, setUserData] = useState<{
    fullName: string;
    phoneNumber: string;
    createdAt?: string;
    lastLogin?: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = localStorage.getItem('userId');
        if (!userId) {
          toast({
            title: "Error",
            description: "User not found. Please register again.",
            variant: "destructive",
          });
          navigate("/register");
          return;
        }

        const response = await fetch('https://localhost:7199/api/Home/Profile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }

        const data = await response.json();
        setUserData(data);
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [navigate, toast]);

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-gradient-to-r from-primary to-secondary text-white p-6 flex items-center gap-4">
        <button onClick={() => navigate("/services")}>
          <ArrowLeft className="h-6 w-6" />
        </button>
        <div>
          <h1 className="text-xl font-bold">Profile</h1>
          <p className="text-sm opacity-90">Your account information</p>
        </div>
      </header>

      <main className="p-6 animate-fade-in">
        {isLoading ? (
          <Card className="p-8 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </Card>
        ) : userData ? (
          <div className="space-y-4">
            <Card className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                  <UserIcon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">{userData.fullName}</h2>
                  <p className="text-sm text-muted-foreground">Raya User</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                  <Phone className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Phone Number</p>
                    <p className="font-medium text-foreground">{userData.phoneNumber}</p>
                  </div>
                </div>

                {userData.lastLogin && (
                  <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                    <Mail className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Last Login</p>
                      <p className="font-medium text-foreground">{new Date(userData.lastLogin).toLocaleString()}</p>
                    </div>
                  </div>
                )}

                {userData.createdAt && (
                  <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                    <CreditCard className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Member Since</p>
                      <p className="font-medium text-foreground">{new Date(userData.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            <Button 
              onClick={() => navigate("/services")} 
              className="w-full bg-gradient-to-r from-primary to-secondary text-white"
            >
              Back to Services
            </Button>
          </div>
        ) : (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground mb-4">No profile data found</p>
            <Button onClick={() => navigate("/register")} variant="outline">
              Register
            </Button>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Profile;
