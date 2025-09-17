import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Smartphone, Headphones } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { LoginUser, InsertUser } from "@shared/schema";

export default function Home() {
  const { login, register, isAuthenticated, isLoading } = useAuth();
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [loginForm, setLoginForm] = useState<LoginUser>({
    email: '',
    password: '',
  });
  const [registerForm, setRegisterForm] = useState<InsertUser>({
    username: '',
    email: '',
    password: '',
    fullName: '',
    phone: '',
  });

  // Redirect if already authenticated
  if (isAuthenticated) {
    setLocation('/dashboard');
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(loginForm);
      setLocation('/dashboard');
    } catch (error) {
      // Error handling is done in the useAuth hook
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(registerForm);
      setActiveTab('login');
      setRegisterForm({
        username: '',
        email: '',
        password: '',
        fullName: '',
        phone: '',
      });
      toast({
        title: "Success",
        description: "Account created successfully! Please login.",
      });
    } catch (error) {
      // Error handling is done in the useAuth hook
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="bg-card rounded-lg shadow-sm border border-border p-8 mb-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4" data-testid="text-title">
            {t("home.title")}
          </h1>
          <p className="text-lg text-muted-foreground mb-8" data-testid="text-subtitle">
            {t("home.subtitle")}
          </p>
          
          {/* Authentication Forms */}
          <div className="max-w-md mx-auto">
            <Card className="bg-secondary">
              <CardContent className="p-6">
                <div className="flex mb-6" role="tablist">
                  <button
                    className={`flex-1 py-2 px-4 text-center font-medium rounded-l-md transition-colors ${
                      activeTab === 'login'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                    onClick={() => setActiveTab('login')}
                    data-testid="tab-login"
                  >
                    {t("auth.login")}
                  </button>
                  <button
                    className={`flex-1 py-2 px-4 text-center font-medium rounded-r-md transition-colors ${
                      activeTab === 'register'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                    onClick={() => setActiveTab('register')}
                    data-testid="tab-register"
                  >
                    {t("auth.register")}
                  </button>
                </div>
                
                {/* Login Form */}
                {activeTab === 'login' && (
                  <form onSubmit={handleLogin} className="space-y-4" data-testid="form-login">
                    <div>
                      <Label className="block text-sm font-medium text-foreground mb-2">
                        {t("auth.email")}
                      </Label>
                      <Input
                        type="email"
                        value={loginForm.email}
                        onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                        className="form-input"
                        placeholder="Enter your email"
                        required
                        data-testid="input-email"
                      />
                    </div>
                    <div>
                      <Label className="block text-sm font-medium text-foreground mb-2">
                        {t("auth.password")}
                      </Label>
                      <Input
                        type="password"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                        className="form-input"
                        placeholder="Enter your password"
                        required
                        data-testid="input-password"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading}
                      data-testid="button-login"
                    >
                      {isLoading ? t("common.loading") : t("auth.loginButton")}
                    </Button>
                  </form>
                )}
                
                {/* Register Form */}
                {activeTab === 'register' && (
                  <form onSubmit={handleRegister} className="space-y-4" data-testid="form-register">
                    <div>
                      <Label className="block text-sm font-medium text-foreground mb-2">
                        {t("auth.fullName")}
                      </Label>
                      <Input
                        type="text"
                        value={registerForm.fullName}
                        onChange={(e) => setRegisterForm({ ...registerForm, fullName: e.target.value })}
                        className="form-input"
                        placeholder="Enter your full name"
                        required
                        data-testid="input-fullname"
                      />
                    </div>
                    <div>
                      <Label className="block text-sm font-medium text-foreground mb-2">
                        Username
                      </Label>
                      <Input
                        type="text"
                        value={registerForm.username}
                        onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                        className="form-input"
                        placeholder="Choose a username"
                        required
                        data-testid="input-username"
                      />
                    </div>
                    <div>
                      <Label className="block text-sm font-medium text-foreground mb-2">
                        {t("auth.email")}
                      </Label>
                      <Input
                        type="email"
                        value={registerForm.email}
                        onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                        className="form-input"
                        placeholder="Enter your email"
                        required
                        data-testid="input-register-email"
                      />
                    </div>
                    <div>
                      <Label className="block text-sm font-medium text-foreground mb-2">
                        {t("auth.password")}
                      </Label>
                      <Input
                        type="password"
                        value={registerForm.password}
                        onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                        className="form-input"
                        placeholder="Create a password"
                        required
                        minLength={6}
                        data-testid="input-register-password"
                      />
                    </div>
                    <div>
                      <Label className="block text-sm font-medium text-foreground mb-2">
                        {t("auth.phone")}
                      </Label>
                      <Input
                        type="tel"
                        value={registerForm.phone}
                        onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                        className="form-input"
                        placeholder="Enter your phone number"
                        required
                        data-testid="input-phone"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                      disabled={isLoading}
                      data-testid="button-register"
                    >
                      {isLoading ? t("common.loading") : t("auth.createAccount")}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Features Section */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card className="text-center">
          <CardContent className="p-6">
            <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {t("home.features.secure.title")}
            </h3>
            <p className="text-muted-foreground">
              {t("home.features.secure.desc")}
            </p>
          </CardContent>
        </Card>
        
        <Card className="text-center">
          <CardContent className="p-6">
            <Smartphone className="h-12 w-12 text-accent mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {t("home.features.mobile.title")}
            </h3>
            <p className="text-muted-foreground">
              {t("home.features.mobile.desc")}
            </p>
          </CardContent>
        </Card>
        
        <Card className="text-center">
          <CardContent className="p-6">
            <Headphones className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {t("home.features.voice.title")}
            </h3>
            <p className="text-muted-foreground">
              {t("home.features.voice.desc")}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
