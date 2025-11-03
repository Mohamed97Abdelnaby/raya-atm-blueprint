import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { ArrowDownToLine, ArrowUpFromLine, History, User } from "lucide-react";

const Services = () => {
  const navigate = useNavigate();

  const services = [
    {
      title: "Withdraw",
      icon: ArrowDownToLine,
      gradient: "from-primary to-secondary",
      path: "/withdraw",
    },
    {
      title: "Deposit",
      icon: ArrowUpFromLine,
      gradient: "from-primary to-secondary",
      path: "/deposit",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground p-6 shadow-lg">
        <h1 className="text-2xl font-bold">ATM Services</h1>
        <p className="text-sm opacity-90 mt-1">Choose a service to continue</p>
      </header>

      <main className="p-6 space-y-6 animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((service) => (
            <Card
              key={service.title}
              onClick={() => navigate(service.path)}
              className={`p-8 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl ${
                service.gradient
                  ? `bg-gradient-to-br ${service.gradient} text-white`
                  : "bg-muted"
              }`}
            >
              <service.icon className="h-12 w-12 mb-4" />
              <h2 className="text-2xl font-bold">{service.title}</h2>
              <p className={`text-sm mt-2 ${service.gradient ? "text-white/80" : "text-muted-foreground"}`}>
                Tap to {service.title.toLowerCase()} cash
              </p>
            </Card>
          ))}
        </div>

        <Card className="p-6 bg-card hover:shadow-lg transition-shadow">
          <h3 className="text-lg font-semibold text-foreground mb-2">Quick Actions</h3>
          <div className="flex gap-4">
            <button
              onClick={() => navigate("/history")}
              className="flex-1 p-4 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
            >
              <History className="h-6 w-6 mb-2 text-primary" />
              <p className="text-sm font-medium text-foreground">History</p>
            </button>
            <button
              onClick={() => navigate("/profile")}
              className="flex-1 p-4 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
            >
              <User className="h-6 w-6 mb-2 text-primary" />
              <p className="text-sm font-medium text-foreground">Profile</p>
            </button>
          </div>
        </Card>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4">
        <div className="flex justify-around max-w-md mx-auto">
          <button className="flex flex-col items-center gap-1 text-primary">
            <ArrowDownToLine className="h-6 w-6" />
            <span className="text-xs font-medium">Services</span>
          </button>
          <button
            onClick={() => navigate("/history")}
            className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
          >
            <History className="h-6 w-6" />
            <span className="text-xs font-medium">History</span>
          </button>
          <button
            onClick={() => navigate("/profile")}
            className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
          >
            <User className="h-6 w-6" />
            <span className="text-xs font-medium">Profile</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Services;
