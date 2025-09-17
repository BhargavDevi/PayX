import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/language-switcher";
import { VoiceAssistant } from "@/components/voice-assistant";
import { Building2, LogOut } from "lucide-react";

export function Navigation() {
  const [location] = useLocation();
  const { user, logout, isAuthenticated } = useAuth();
  const { t } = useTranslation();

  const navItems = [
    { href: "/", label: t("nav.home"), page: "home" },
    { href: "/dashboard", label: t("nav.dashboard"), page: "dashboard" },
    { href: "/payments", label: t("nav.payments"), page: "payments" },
    { href: "/history", label: t("nav.history"), page: "history" },
  ];

  if (user?.isAdmin) {
    navItems.push({ href: "/admin", label: t("nav.admin"), page: "admin" });
  }

  const isActive = (href: string) => {
    if (href === "/" && location === "/") return true;
    if (href !== "/" && location.startsWith(href)) return true;
    return false;
  };

  return (
    <nav className="bg-card border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" data-testid="link-home">
              <div className="flex items-center space-x-2 cursor-pointer">
                <Building2 className="text-primary text-2xl" />
                <span className="text-xl font-bold text-primary">SecureBank</span>
              </div>
            </Link>
            
            {isAuthenticated && (
              <div className="hidden md:flex space-x-6">
                {navItems.map((item) => (
                  <Link key={item.href} href={item.href} data-testid={`link-${item.page}`}>
                    <span
                      className={`font-medium transition-colors cursor-pointer ${
                        isActive(item.href)
                          ? "text-foreground"
                          : "text-muted-foreground hover:text-primary"
                      }`}
                    >
                      {item.label}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            <VoiceAssistant />
            
            {isAuthenticated && user && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground hidden sm:block" data-testid="text-welcome">
                  {t("nav.welcome")}, {user.fullName}
                </span>
                <Button
                  onClick={() => logout()}
                  variant="default"
                  size="sm"
                  data-testid="button-logout"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  {t("nav.logout")}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
