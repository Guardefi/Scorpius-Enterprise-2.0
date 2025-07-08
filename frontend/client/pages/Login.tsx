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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { CanvasRevealEffect } from "@/components/ui/canvas-reveal-effect";
import { GradientButton } from "@/components/ui/gradient-button";
import { Eye, EyeOff, User, Lock, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [initialCanvasVisible, setInitialCanvasVisible] = useState(true);
  const [reverseCanvasVisible, setReverseCanvasVisible] = useState(false);
  const navigate = useNavigate();
  const { login, register } = useAuth();

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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !username) return;

    if (!acceptedTerms) {
      setError("You must accept the terms and conditions to create an account");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await register({
        email,
        username,
        password,
        full_name: fullName,
      });

      // Trigger ripple effect on successful registration
      setReverseCanvasVisible(true);
      setTimeout(() => {
        setInitialCanvasVisible(false);
      }, 50);

      // Navigate to dashboard after animation completes
      setTimeout(() => {
        navigate("/");
      }, 200);
    } catch (err: any) {
      setError(err.message || "Registration failed");
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setError("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setUsername("");
    setFullName("");
    setAcceptedTerms(false);
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
              <p className="text-sm text-cyber-cyan/80 font-medium uppercase tracking-[0.3em]">
                Security Platform
              </p>
            </div>
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
                  {isRegistering ? "Create Account" : "System Access"}
                </CardTitle>
                <CardDescription className="text-cyber-cyan/60 font-mono text-sm">
                  {isRegistering
                    ? "Create a new account to access the security platform"
                    : "Enter your credentials to access the war room"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <form
                  onSubmit={isRegistering ? handleRegister : handleLogin}
                  className="space-y-4"
                >
                  {/* Registration-only fields */}
                  {isRegistering && (
                    <>
                      <div className="space-y-2">
                        <Label
                          htmlFor="fullName"
                          className="text-cyber-cyan font-mono text-sm"
                        >
                          Full Name (Optional)
                        </Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-cyber-cyan/60" />
                          <Input
                            id="fullName"
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="pl-10 bg-black/70 border-cyber-cyan/30 text-white font-mono focus:border-cyber-cyan focus:ring-cyber-cyan/20 placeholder:text-cyber-cyan/40"
                            placeholder="John Doe"
                            disabled={isLoading}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="username"
                          className="text-cyber-cyan font-mono text-sm"
                        >
                          Username
                        </Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-cyber-cyan/60" />
                          <Input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="pl-10 bg-black/70 border-cyber-cyan/30 text-white font-mono focus:border-cyber-cyan focus:ring-cyber-cyan/20 placeholder:text-cyber-cyan/40"
                            placeholder="johndoe"
                            required
                            disabled={isLoading}
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* Email Field */}
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
                        placeholder={
                          isRegistering
                            ? "john@example.com"
                            : "admin@scorpius.security"
                        }
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

                  {/* Confirm Password Field (Registration only) */}
                  {isRegistering && (
                    <div className="space-y-2">
                      <Label
                        htmlFor="confirmPassword"
                        className="text-cyber-cyan font-mono text-sm"
                      >
                        Confirm Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-cyber-cyan/60" />
                        <Input
                          id="confirmPassword"
                          type={showPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="pl-10 bg-black/70 border-cyber-cyan/30 text-white font-mono focus:border-cyber-cyan focus:ring-cyber-cyan/20 placeholder:text-cyber-cyan/40"
                          placeholder="••••••••••••"
                          required
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  )}

                  {/* Terms and Conditions (Registration only) */}
                  {isRegistering && (
                    <div className="space-y-2">
                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="terms"
                          checked={acceptedTerms}
                          onCheckedChange={(checked) =>
                            setAcceptedTerms(checked === true)
                          }
                          className="border-cyber-cyan/30 data-[state=checked]:bg-cyber-cyan data-[state=checked]:border-cyber-cyan"
                          disabled={isLoading}
                        />
                        <Label
                          htmlFor="terms"
                          className="text-cyber-cyan/70 font-mono text-xs leading-relaxed"
                        >
                          I accept the{" "}
                          <Button
                            type="button"
                            variant="ghost"
                            className="p-0 h-auto text-cyber-cyan hover:text-cyber-cyan/80 font-mono text-xs underline hover:bg-transparent"
                            onClick={() => setShowTermsModal(true)}
                            disabled={isLoading}
                          >
                            Terms and Conditions
                            <ExternalLink className="w-3 h-3 ml-1" />
                          </Button>
                        </Label>
                      </div>
                    </div>
                  )}

                  {/* Error Message */}
                  {error && (
                    <div className="text-red-400 text-sm font-mono text-center">
                      {error}
                    </div>
                  )}

                  {/* Submit Button */}
                  <GradientButton
                    type="submit"
                    disabled={
                      isLoading ||
                      !email ||
                      !password ||
                      (isRegistering &&
                        (!username || !confirmPassword || !acceptedTerms))
                    }
                    className="w-full font-mono uppercase tracking-wide py-3 text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
                  >
                    <span className="relative z-10">
                      {isLoading
                        ? isRegistering
                          ? "Creating Account..."
                          : "Authenticating..."
                        : isRegistering
                          ? "Create Account"
                          : "Access System"}
                    </span>
                    {isLoading && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-cyber-scan"></div>
                    )}
                  </GradientButton>
                </form>

                {/* Toggle between login and registration */}
                <div className="text-center">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={toggleMode}
                    disabled={isLoading}
                    className="text-cyber-cyan/70 hover:text-cyber-cyan font-mono text-sm hover:bg-transparent"
                  >
                    {isRegistering
                      ? "Already have an account? Sign in"
                      : "Need an account? Create one"}
                  </Button>
                </div>

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

      {/* Terms and Conditions Modal */}
      <Dialog open={showTermsModal} onOpenChange={setShowTermsModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-black/95 border-cyber-cyan/30 text-white">
          <DialogHeader>
            <DialogTitle className="text-cyber-cyan font-mono text-xl">
              SCORPIUS Security Platform - Terms and Conditions
            </DialogTitle>
            <DialogDescription className="text-cyber-cyan/60 font-mono">
              Please read and understand our terms of service before creating an
              account.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 text-sm font-mono leading-relaxed text-cyber-cyan/80">
            <section>
              <h3 className="text-cyber-cyan font-semibold mb-2">
                1. ACCEPTANCE OF TERMS
              </h3>
              <p>
                By accessing and using the SCORPIUS Security Platform
                ("Platform"), you agree to be bound by these Terms and
                Conditions ("Terms"). If you do not agree to these Terms, you
                may not use the Platform.
              </p>
            </section>

            <section>
              <h3 className="text-cyber-cyan font-semibold mb-2">
                2. DESCRIPTION OF SERVICE
              </h3>
              <p>
                SCORPIUS is an enterprise-grade quantum security platform
                designed for security assessment, real-time monitoring, and
                compliance management. The Platform provides advanced security
                analysis tools, vulnerability detection, and threat intelligence
                capabilities.
              </p>
            </section>

            <section>
              <h3 className="text-cyber-cyan font-semibold mb-2">
                3. USER ACCOUNTS AND SECURITY
              </h3>
              <p>
                You are responsible for maintaining the confidentiality of your
                account credentials and for all activities that occur under your
                account. You must immediately notify SCORPIUS of any
                unauthorized use of your account or any other breach of
                security.
              </p>
            </section>

            <section>
              <h3 className="text-cyber-cyan font-semibold mb-2">
                4. ACCEPTABLE USE POLICY
              </h3>
              <div className="space-y-2">
                <p>You agree NOT to use the Platform to:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>
                    Conduct illegal activities or violate any applicable laws
                  </li>
                  <li>
                    Attempt to gain unauthorized access to any systems or
                    networks
                  </li>
                  <li>Distribute malware, viruses, or other harmful code</li>
                  <li>Interfere with or disrupt the Platform's operation</li>
                  <li>
                    Use the Platform for any purpose other than legitimate
                    security analysis
                  </li>
                </ul>
              </div>
            </section>

            <section>
              <h3 className="text-cyber-cyan font-semibold mb-2">
                5. DATA PRIVACY AND SECURITY
              </h3>
              <p>
                SCORPIUS implements enterprise-grade security measures to
                protect your data. We collect and process data in accordance
                with our Privacy Policy and applicable data protection
                regulations including GDPR and SOC 2 Type II requirements.
              </p>
            </section>

            <section>
              <h3 className="text-cyber-cyan font-semibold mb-2">
                6. INTELLECTUAL PROPERTY
              </h3>
              <p>
                The Platform and all its content, features, and functionality
                are owned by SCORPIUS and are protected by international
                copyright, trademark, and other intellectual property laws.
              </p>
            </section>

            <section>
              <h3 className="text-cyber-cyan font-semibold mb-2">
                7. LIMITATION OF LIABILITY
              </h3>
              <p>
                SCORPIUS shall not be liable for any indirect, incidental,
                special, consequential, or punitive damages resulting from your
                use of the Platform. Our total liability shall not exceed the
                amount paid by you for the Platform in the twelve months
                preceding the claim.
              </p>
            </section>

            <section>
              <h3 className="text-cyber-cyan font-semibold mb-2">
                8. COMPLIANCE AND REGULATORY
              </h3>
              <p>
                Users must ensure their use of the Platform complies with all
                applicable laws, regulations, and industry standards in their
                jurisdiction. SCORPIUS maintains SOC 2 Type II certification and
                ISO 27001 compliance.
              </p>
            </section>

            <section>
              <h3 className="text-cyber-cyan font-semibold mb-2">
                9. TERMINATION
              </h3>
              <p>
                SCORPIUS may terminate or suspend your account immediately,
                without prior notice, if you breach these Terms. Upon
                termination, your right to use the Platform will cease
                immediately.
              </p>
            </section>

            <section>
              <h3 className="text-cyber-cyan font-semibold mb-2">
                10. CHANGES TO TERMS
              </h3>
              <p>
                SCORPIUS reserves the right to modify these Terms at any time.
                We will notify you of any changes by posting the new Terms on
                the Platform. Your continued use of the Platform after such
                changes constitutes acceptance of the new Terms.
              </p>
            </section>

            <section>
              <h3 className="text-cyber-cyan font-semibold mb-2">
                11. CONTACT INFORMATION
              </h3>
              <p>
                For questions about these Terms, please contact us at:
                <br />
                Email: legal@scorpius.security
                <br />
                Support: support@scorpius.security
              </p>
            </section>

            <div className="pt-4 border-t border-cyber-cyan/20">
              <p className="text-xs text-cyber-cyan/50">
                Last updated: {new Date().toLocaleDateString()}
                <br />
                SCORPIUS Security Platform v2.0.1
              </p>
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <Button
              onClick={() => setShowTermsModal(false)}
              className="bg-cyber-cyan text-black hover:bg-cyber-cyan/80 font-mono"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
