import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Send, Download, CreditCard, ArrowDown, ArrowUp, Building } from "lucide-react";
import { format } from "date-fns";

interface Transaction {
  id: string;
  amount: string;
  type: string;
  description: string;
  createdAt: string;
  fromUser?: { id: string; fullName: string; email: string } | null;
  toUser?: { id: string; fullName: string; email: string } | null;
}

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useTranslation();

  const { data: transactions, isLoading: transactionsLoading } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions'],
    enabled: !!user,
  });

  if (!user) return null;

  const recentTransactions = transactions?.slice(0, 5) || [];

  const getTransactionIcon = (transaction: Transaction) => {
    if (transaction.fromUser?.id === user.id) {
      return <ArrowUp className="w-5 h-5 text-destructive-foreground" />;
    } else if (transaction.toUser?.id === user.id) {
      return <ArrowDown className="w-5 h-5 text-accent-foreground" />;
    } else {
      return <Building className="w-5 h-5 text-primary-foreground" />;
    }
  };

  const getTransactionAmount = (transaction: Transaction) => {
    const amount = parseFloat(transaction.amount);
    if (transaction.fromUser?.id === user.id) {
      return `-₹${amount.toFixed(2)}`;
    } else if (transaction.toUser?.id === user.id) {
      return `+₹${amount.toFixed(2)}`;
    }
    return `₹${amount.toFixed(2)}`;
  };

  const getTransactionAmountClass = (transaction: Transaction) => {
    if (transaction.fromUser?.id === user.id) {
      return "font-semibold text-destructive";
    } else if (transaction.toUser?.id === user.id) {
      return "font-semibold text-accent";
    }
    return "font-semibold text-foreground";
  };

  const getTransactionDescription = (transaction: Transaction) => {
    if (transaction.fromUser?.id === user.id && transaction.toUser) {
      return `Payment to ${transaction.toUser.fullName}`;
    } else if (transaction.toUser?.id === user.id && transaction.fromUser) {
      return `Payment from ${transaction.fromUser.fullName}`;
    }
    return transaction.description || 'Transaction';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Account Overview */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Balance Card */}
        <div className="lg:col-span-2">
          <div className="balance-card rounded-lg shadow-lg p-6 text-white">
            <h2 className="text-2xl font-bold mb-2" data-testid="text-balance-title">
              {t("dashboard.balance")}
            </h2>
            <div className="text-4xl font-bold mb-4" data-testid="text-balance-amount">
              ₹{parseFloat(user.balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm opacity-90">
                {t("dashboard.available")}
              </span>
              <span className="text-sm opacity-90" data-testid="text-account-number">
                {t("dashboard.account")}: ****{user.id.slice(-4)}
              </span>
            </div>
          </div>
        </div>
        
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle data-testid="text-quick-actions">
              {t("dashboard.quickActions")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/payments">
              <Button className="w-full justify-start" data-testid="button-send-money">
                <Send className="w-4 h-4 mr-2" />
                {t("dashboard.sendMoney")}
              </Button>
            </Link>
            <Button 
              className="w-full justify-start bg-secondary text-secondary-foreground hover:bg-secondary/80" 
              disabled
              data-testid="button-request-money"
            >
              <Download className="w-4 h-4 mr-2" />
              {t("dashboard.requestMoney")}
            </Button>
            <Button 
              className="w-full justify-start bg-accent text-accent-foreground hover:bg-accent/80" 
              disabled
              data-testid="button-pay-bills"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              {t("dashboard.payBills")}
            </Button>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle data-testid="text-recent-transactions">
              {t("dashboard.recentTransactions")}
            </CardTitle>
            <Link href="/history">
              <Button variant="link" className="text-primary hover:underline" data-testid="button-view-all">
                {t("dashboard.viewAll")}
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {transactionsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-3">
                  <div className="flex items-center space-x-3">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div>
                      <Skeleton className="h-4 w-32 mb-2" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <div className="text-right">
                    <Skeleton className="h-4 w-20 mb-2" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              ))}
            </div>
          ) : recentTransactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground" data-testid="text-no-transactions">
              No transactions found. Make your first payment!
            </div>
          ) : (
            <div className="space-y-4">
              {recentTransactions.map((transaction: Transaction) => (
                <div
                  key={transaction.id}
                  className="transaction-item flex items-center justify-between p-3 rounded-lg transition-colors"
                  data-testid={`transaction-item-${transaction.id}`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      transaction.fromUser?.id === user.id
                        ? 'bg-destructive'
                        : transaction.toUser?.id === user.id
                        ? 'bg-accent'
                        : 'bg-primary'
                    }`}>
                      {getTransactionIcon(transaction)}
                    </div>
                    <div>
                      <p className="font-medium text-foreground" data-testid={`text-transaction-description-${transaction.id}`}>
                        {getTransactionDescription(transaction)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {transaction.type}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={getTransactionAmountClass(transaction)} data-testid={`text-transaction-amount-${transaction.id}`}>
                      {getTransactionAmount(transaction)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(transaction.createdAt), 'MMM dd, HH:mm')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
