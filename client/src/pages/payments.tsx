import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Lock } from "lucide-react";
import { useLocation } from "wouter";
import type { PaymentRequest } from "@shared/schema";

export default function Payments() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const [paymentForm, setPaymentForm] = useState<PaymentRequest & { pin: string }>({
    recipientEmail: '',
    amount: 0,
    description: '',
    pin: '',
  });

  const paymentMutation = useMutation({
    mutationFn: async (data: PaymentRequest) => {
      const res = await apiRequest('POST', '/api/process-payment', data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Payment sent successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/me'] });
      setLocation('/dashboard');
    },
    onError: (error: any) => {
      toast({
        title: "Payment Failed",
        description: error.message || "Failed to process payment",
        variant: "destructive",
      });
    },
  });

  if (!user) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!paymentForm.recipientEmail || !paymentForm.amount || !paymentForm.pin) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (paymentForm.amount <= 0) {
      toast({
        title: "Error",
        description: "Amount must be greater than 0",
        variant: "destructive",
      });
      return;
    }

    if (paymentForm.amount > parseFloat(user.balance)) {
      toast({
        title: "Error",
        description: "Insufficient balance",
        variant: "destructive",
      });
      return;
    }

    // In a real app, you would validate the PIN here
    if (paymentForm.pin.length !== 4) {
      toast({
        title: "Error",
        description: "PIN must be 4 digits",
        variant: "destructive",
      });
      return;
    }

    const { pin, ...paymentData } = paymentForm;
    paymentMutation.mutate(paymentData);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h2 className="text-3xl font-bold text-foreground mb-8 text-center" data-testid="text-payments-title">
        {t("payments.title")}
      </h2>
      
      <Card>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6" data-testid="form-payment">
            {/* Recipient Information */}
            <div>
              <Label className="block text-sm font-medium text-foreground mb-2">
                {t("payments.recipient")} *
              </Label>
              <Input
                type="email"
                value={paymentForm.recipientEmail}
                onChange={(e) => setPaymentForm({ ...paymentForm, recipientEmail: e.target.value })}
                className="form-input"
                placeholder={t("payments.recipientPlaceholder")}
                required
                data-testid="input-recipient-email"
              />
            </div>
            
            {/* Amount */}
            <div>
              <Label className="block text-sm font-medium text-foreground mb-2">
                {t("payments.amount")} *
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-muted-foreground">₹</span>
                <Input
                  type="number"
                  value={paymentForm.amount || ''}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: parseFloat(e.target.value) || 0 })}
                  className="form-input pl-8"
                  placeholder={t("payments.amountPlaceholder")}
                  step="0.01"
                  min="0.01"
                  max={user.balance}
                  required
                  data-testid="input-amount"
                />
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Available balance: ₹{parseFloat(user.balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
            </div>
            
            {/* Description */}
            <div>
              <Label className="block text-sm font-medium text-foreground mb-2">
                {t("payments.description")}
              </Label>
              <Textarea
                value={paymentForm.description}
                onChange={(e) => setPaymentForm({ ...paymentForm, description: e.target.value })}
                className="form-input"
                rows={3}
                placeholder={t("payments.descriptionPlaceholder")}
                data-testid="input-description"
              />
            </div>
            
            {/* Security Verification */}
            <Card className="bg-secondary">
              <CardContent className="p-4">
                <h4 className="font-medium text-foreground mb-3" data-testid="text-security-verification">
                  {t("payments.security")}
                </h4>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label className="block text-sm font-medium text-foreground mb-2">
                      {t("payments.pin")} *
                    </Label>
                    <Input
                      type="password"
                      maxLength={4}
                      value={paymentForm.pin}
                      onChange={(e) => setPaymentForm({ ...paymentForm, pin: e.target.value })}
                      className="form-input text-center"
                      placeholder="****"
                      pattern="[0-9]{4}"
                      required
                      data-testid="input-pin"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Enter your 4-digit transaction PIN
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full py-3 text-lg font-semibold"
              disabled={paymentMutation.isPending}
              data-testid="button-submit-payment"
            >
              <Lock className="w-5 h-5 mr-2" />
              {paymentMutation.isPending ? t("common.loading") : t("payments.submit")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
