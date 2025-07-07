import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CanvasRevealEffect } from "@/components/ui/canvas-reveal-effect";
import { GradientButton } from "@/components/ui/gradient-button";
import { Eye, EyeOff, Shield, User, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [initialCanvasVisible, setInitialCanvasVisible] = useState(true);
  const [reverseCanvasVisible, setReverseCanvasVisible] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    setError("");

    try {
      await login(email, password);

      // Trigger ripple effect on successful login
      setReverseCanvasVisible(true);
      setTimeout(() => {
        setInitialCanvasVisible(false);
      }, 50);

      // Navigate to dashboard after animation completes
      setTimeout(() => {
        navigate("/");
      }, 200);
    } catch (err: any) {
      setError(err.message || "Login failed");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Ripple Effect Background */}
      <div className="absolute inset-0 z-0">
        {/* Initial canvas (forward animation) */}
        {initialCanvasVisible && (
          <div className="absolute inset-0">
            <CanvasRevealEffect
              animationSpeed={3}
              containerClassName="bg-black"
              colors={[
                [0, 255, 255], // Cyber cyan
                [0, 255, 255],
              ]}
              dotSize={4}
              reverse={false}
              showGradient={true}
            />
          </div>
        )}

        {/* Reverse canvas (appears when login is successful) */}
        {reverseCanvasVisible && (
          <div className="absolute inset-0">
            <CanvasRevealEffect
              animationSpeed={25}
              containerClassName="bg-black"
              colors={[
                [0, 255, 255], // Cyber cyan
                [0, 255, 255],
              ]}
              dotSize={4}
              reverse={true}
              showGradient={true}
            />
          </div>
        )}

        {/* Overlay gradients for better contrast */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-black/30 to-transparent"></div>
        <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-black/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/50 to-transparent" />
      </div>

      {/* Main Login Container */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo Section */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <h1
              className="text-6xl font-black tracking-wide mb-4 relative"
              style={{
                fontFamily:
                  'Impact, "Arial Black", "Franklin Gothic Bold", "Arial Narrow", sans-serif',
              }}
            >
              <span className="text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] [text-shadow:_0_1px_0_rgba(255,255,255,0.8),_0_2px_0_rgba(200,200,200,0.6),_0_3px_0_rgba(150,150,150,0.4),_0_4px_0_rgba(100,100,100,0.2)] filter brightness-125 contrast-125">
                SCORPIUS
              </span>
              {/* Metallic 3D Shadow Effect */}
              <span className="absolute inset-0 text-slate-600/60 transform translate-x-1 translate-y-1 -z-10">
                SCORPIUS
              </span>
              {/* Metallic highlight shine */}
              <span className="absolute inset-0 text-transparent bg-clip-text bg-gradient-to-t from-transparent via-white/30 to-transparent transform -translate-y-1">
                SCORPIUS
              </span>
              {/* Additional chrome reflection */}
              <span className="absolute inset-0 text-transparent bg-clip-text bg-gradient-to-r from-transparent via-white/20 to-transparent transform translate-x-0.5">
                SCORPIUS
              </span>
            </h1>
            <div className="flex items-center justify-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-cyber-cyan" />
              <p className="text-sm text-cyber-cyan/80 font-medium uppercase tracking-[0.3em]">
                Quantum Security Platform
              </p>
            </div>
            <p className="text-xs text-cyber-cyan/60 font-mono">
              Secure Access Terminal
            </p>
          </motion.div>

          {/* Login Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
          >
            <Card className="card-modern border-cyber-cyan/30 bg-black/50 backdrop-blur-xl">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-cyber-cyan text-xl font-mono uppercase tracking-wide">
                  System Access
                </CardTitle>
                <CardDescription className="text-cyber-cyan/60 font-mono text-sm">
                  Enter your credentials to access the security dashboard
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={handleLogin} className="space-y-4">
                  {/* Username Field */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-cyber-cyan font-mono text-sm"
                    >
                      Email
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-cyber-cyan/60" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 bg-black/70 border-cyber-cyan/30 text-white font-mono focus:border-cyber-cyan focus:ring-cyber-cyan/20 placeholder:text-cyber-cyan/40"
                        placeholder="admin@scorpius.security"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="password"
                      className="text-cyber-cyan font-mono text-sm"
                    >
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-cyber-cyan/60" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10 bg-black/70 border-cyber-cyan/30 text-white font-mono focus:border-cyber-cyan focus:ring-cyber-cyan/20 placeholder:text-cyber-cyan/40"
                        placeholder="••••••••••••"
                        required
                        disabled={isLoading}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4 text-cyber-cyan/60" />
                        ) : (
                          <Eye className="w-4 h-4 text-cyber-cyan/60" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Login Button */}
                  {error && (
                    <div className="text-red-400 text-sm font-mono text-center">
                      {error}
                    </div>
                  )}

                  <GradientButton
                    type="submit"
                    disabled={isLoading || !email || !password}
                    className="w-full font-mono uppercase tracking-wide py-3 text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
                  >
                    <span className="relative z-10">
                      {isLoading ? "Authenticating..." : "Access System"}
                    </span>
                    {isLoading && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-cyber-scan"></div>
                    )}
                  </GradientButton>
                </form>

                {/* Security Notice */}
                <div className="pt-4 border-t border-cyber-cyan/20">
                  <p className="text-xs text-cyber-cyan/50 text-center font-mono">
                    All access attempts are monitored and logged.
                    <br />
                    Unauthorized access is prohibited.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Footer */}
          <motion.div
            className="text-center mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.4 }}
          >
            <p className="text-xs text-cyber-cyan/40 font-mono">
              SCORPIUS v2.0.1 | Quantum Security Systems
            </p>
          </motion.div>
        </div>
      </div>

      {/* Scanning Line Animation */}
      <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-cyber-cyan to-transparent animate-cyber-scan opacity-30 z-20"></div>
    </div>
  );
}
