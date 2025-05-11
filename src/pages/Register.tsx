
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import MainLayout from "@/common/components/layouts/MainLayout";
import { useToast } from "@/hooks/use-toast";
import { Loader2, UserPlus, AtSign, Key, ShieldCheck, Eye, EyeOff, Check } from "lucide-react";
import { motion } from "framer-motion";

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signUp, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Redirect if already logged in
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const passwordRequirements = [
    { id: "length", text: "At least 8 characters", met: password.length >= 8 },
    { id: "uppercase", text: "At least one uppercase letter", met: /[A-Z]/.test(password) },
    { id: "lowercase", text: "At least one lowercase letter", met: /[a-z]/.test(password) },
    { id: "number", text: "At least one number", met: /\d/.test(password) },
    { id: "special", text: "At least one special character", met: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
  ];

  const passwordStrength = passwordRequirements.filter(req => req.met).length;
  
  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 1) return "bg-red-500";
    if (passwordStrength <= 3) return "bg-yellow-500";
    return "bg-green-500";
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Passwords do not match",
        description: "Please make sure your passwords match",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const success = await signUp(email, password);
      if (success) {
        toast({
          title: "Registration successful",
          description: "Please check your email to verify your account"
        });
        navigate("/login");
      }
    } catch (error) {
      toast({
        title: "Error signing up",
        description: "An error occurred during registration",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  return (
    <MainLayout>
      <motion.div 
        className="container flex items-center justify-center min-h-[80vh] py-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Card className="w-full max-w-md shadow-xl border-t-4 border-t-primary">
          <CardHeader className="space-y-1">
            <motion.div variants={itemVariants}>
              <CardTitle className="text-2xl font-bold text-center">
                Join TANOELUIS
              </CardTitle>
            </motion.div>
            <motion.div variants={itemVariants}>
              <CardDescription className="text-center">
                Create an account to access all features
              </CardDescription>
            </motion.div>
          </CardHeader>
          <form onSubmit={handleRegister}>
            <CardContent className="space-y-4">
              <motion.div className="space-y-2" variants={itemVariants}>
                <Label htmlFor="fullName" className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4 text-muted-foreground" />
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="h-12"
                  required
                />
              </motion.div>
              <motion.div className="space-y-2" variants={itemVariants}>
                <Label htmlFor="email" className="flex items-center gap-2">
                  <AtSign className="h-4 w-4 text-muted-foreground" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12"
                  required
                />
              </motion.div>
              <motion.div className="space-y-2" variants={itemVariants}>
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Key className="h-4 w-4 text-muted-foreground" />
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 pr-10"
                    required
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {password && (
                  <div className="mt-2 space-y-2">
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${getPasswordStrengthColor()}`} 
                        style={{ width: `${(passwordStrength / passwordRequirements.length) * 100}%` }}
                      />
                    </div>
                    <ul className="text-xs space-y-1">
                      {passwordRequirements.map((requirement) => (
                        <li key={requirement.id} className="flex items-center">
                          {requirement.met ? (
                            <Check className="h-3 w-3 text-green-500 mr-1" />
                          ) : (
                            <span className="h-3 w-3 rounded-full border border-gray-300 mr-1" />
                          )}
                          <span className={requirement.met ? "text-green-600 dark:text-green-400" : "text-gray-500"}>
                            {requirement.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
              <motion.div className="space-y-2" variants={itemVariants}>
                <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-12 pr-10"
                    required
                  />
                  <button 
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {password && confirmPassword && (
                  <div className="flex items-center mt-1">
                    {password === confirmPassword ? (
                      <>
                        <Check className="h-4 w-4 text-green-500 mr-1" />
                        <span className="text-xs text-green-600 dark:text-green-400">Passwords match</span>
                      </>
                    ) : (
                      <>
                        <svg className="h-4 w-4 text-red-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <span className="text-xs text-red-600 dark:text-red-400">Passwords don't match</span>
                      </>
                    )}
                  </div>
                )}
              </motion.div>
            </CardContent>
            <motion.div variants={itemVariants}>
              <CardFooter className="flex flex-col space-y-4">
                <Button 
                  type="submit" 
                  className="w-full h-12 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 transition-all duration-300"
                  disabled={isLoading || password !== confirmPassword || passwordStrength < 3}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Register
                    </>
                  )}
                </Button>
                <div className="text-center text-sm">
                  Already have an account?{" "}
                  <Link to="/login" className="text-primary font-medium hover:underline">
                    Login
                  </Link>
                </div>
                <div className="text-xs text-center text-gray-500">
                  By registering, you agree to our Terms of Service and Privacy Policy.
                </div>
              </CardFooter>
            </motion.div>
          </form>
        </Card>
      </motion.div>
    </MainLayout>
  );
}
