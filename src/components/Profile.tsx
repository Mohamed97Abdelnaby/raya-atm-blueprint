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
    name: string;
    phone: string;
    email?: string;
    national_id?: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const phone = localStorage.getItem('userPhone');
        if (!phone) {
          toast({
            title: "Error",
            description: "User not found. Please register again.",
            variant: "destructive",
          });
          navigate("/register");
          return;
        }

        const { data, error } = await supabase
          .from('registrations')
          .select('name, phone, email, national_id')
          .eq('phone', phone)
          .single();

        if (error) throw error;

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
                  <h2 className="text-xl font-bold text-foreground">{userData.name}</h2>
                  <p className="text-sm text-muted-foreground">Raya User</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                  <Phone className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Phone Number</p>
                    <p className="font-medium text-foreground">{userData.phone}</p>
                  </div>
                </div>

                {userData.email && (
                  <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                    <Mail className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="font-medium text-foreground">{userData.email}</p>
                    </div>
                  </div>
                )}

                {userData.national_id && (
                  <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                    <CreditCard className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">National ID</p>
                      <p className="font-medium text-foreground">{userData.national_id}</p>
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
