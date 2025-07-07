import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Home, Search } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-cyber-black text-cyber-white font-mono cyber-grid flex items-center justify-center relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 cyber-grid-dense opacity-30"></div>
      <div className="absolute top-20 left-20 w-32 h-32 border border-cyber-cyan/20 rounded-full animate-cyber-pulse"></div>
      <div
        className="absolute bottom-20 right-20 w-24 h-24 border border-cyber-cyan/20 rounded-full animate-cyber-pulse"
        style={{ animationDelay: "1s" }}
      ></div>
      <div
        className="absolute top-1/2 left-10 w-16 h-16 border border-cyber-cyan/20 rounded-full animate-cyber-pulse"
        style={{ animationDelay: "2s" }}
      ></div>

      <div className="relative z-10 max-w-2xl mx-auto px-6 text-center">
        <Card className="cyber-card-enhanced">
          <CardContent className="p-12 relative z-10">
            {/* Glitch effect overlay */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="cyber-highlight"></div>
            </div>

            {/* Alert icon with glow */}
            <div className="mb-8 flex justify-center">
              <div className="relative">
                <AlertTriangle className="w-24 h-24 text-cyber-cyan animate-cyber-glow" />
                <div className="absolute inset-0 blur-lg">
                  <AlertTriangle className="w-24 h-24 text-cyber-cyan opacity-50" />
                </div>
              </div>
            </div>

            {/* 404 Title */}
            <h1 className="text-8xl font-bold mb-6 cyber-glow-strong font-mono tracking-wider">
              404
            </h1>

            {/* Subtitle */}
            <h2 className="text-2xl font-semibold mb-4 text-cyber-cyan uppercase tracking-widest">
              QUANTUM PATHWAY NOT FOUND
            </h2>

            {/* Description */}
            <p className="text-lg text-cyber-cyan/70 mb-2 uppercase tracking-wide">
              The requested data stream does not exist in our quantum matrix
            </p>
            <p className="text-sm text-cyber-cyan/50 mb-8 font-mono">
              ROUTE: <span className="text-red-400">{location.pathname}</span>
            </p>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button asChild className="btn-primary px-8 py-3 text-lg">
                <a href="/">
                  <Home className="w-5 h-5 mr-2" />
                  RETURN TO BASE
                </a>
              </Button>

              <Button
                variant="secondary"
                className="btn-secondary px-8 py-3 text-lg"
                onClick={() => window.history.back()}
              >
                <Search className="w-5 h-5 mr-2" />
                SCAN PREVIOUS LOCATION
              </Button>
            </div>

            {/* Status indicator */}
            <div className="mt-8 pt-6 border-t border-cyber-cyan/20">
              <div className="flex items-center justify-center gap-2 text-sm text-cyber-cyan/60 uppercase tracking-wide">
                <div className="w-2 h-2 bg-red-400 rounded-full animate-cyber-pulse"></div>
                SECURITY PROTOCOL ACTIVE
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NotFound;
