import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import rayaLogo from "@/assets/raya-logo.png";

const Splash = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/register");
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="animate-fade-in">
        <img src={rayaLogo} alt="Raya IT" className="w-32 h-32 mb-8" />
      </div>
      
      <div className="absolute bottom-8 text-center animate-fade-in">
        <p className="text-sm text-muted-foreground uppercase tracking-wide">
          Powered by Raya Information Technology
        </p>
        <div className="w-48 h-1 bg-primary/20 rounded-full mt-4 mx-auto overflow-hidden">
          <div className="h-full bg-primary rounded-full animate-slide-right" style={{
            animation: "slide-right 2s ease-in-out infinite"
          }} />
        </div>
      </div>

      <style>{`
        @keyframes slide-right {
          0%, 100% { transform: translateX(-100%); }
          50% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
};

export default Splash;
