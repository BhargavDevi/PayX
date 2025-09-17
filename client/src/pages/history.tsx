import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

interface Transaction {
  id: string;
  amount: string;
  type: string;
  description: string;
  status: string;
  createdAt: string;
  fromUser?: { id: string; fullName: string; email: string } | null;
  toUser?: { id: string; fullName: string; email: string } | null;
}

export default function History() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [filter, setFilter] = useState<string>('all');

  const { data: transactions, isLoading } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions'],
    enabled: !!user,
  });

  const { data: summary, isLoading: summaryLoading } = useQuery<{
    totalSent: string;
    totalReceived: string;
    transactionCount: number;
  }>({
    queryKey: ['/api/transaction-summary'],
    enabled: !!user,
  });

  if (!user) return null;

  const filteredTransactions = transactions?.filter((transaction: Transaction) => {
    if (filter === 'all') return true;
    if (filter === 'sent') return transaction.fromUser?.id === user.id;
    if (filter === 'received') return transaction.toUser?.id === user.id;
    if (filter === 'withdrawals') return transaction.type === 'withdrawal';
    return true;
  }) || [];

  const getTransactionType = (transaction: Transaction) => {
    if (transaction.fromUser?.id === user.id) return 'sent';
    if (transaction.toUser?.id === user.id) return 'received';
    if (transaction.type === 'withdrawal') return 'withdrawal';
    return transaction.type;
  };

  const getTransactionTypeLabel = (transaction: Transaction) => {
    const type = getTransactionType(transaction);
    switch (type) {
      case 'sent': return 'Sent';
      case 'received': return 'Received';
      case 'withdrawal': return 'ATM';
      default: return transaction.type;
    }
  };

  const getTransactionTypeClass = (transaction: Transaction) => {
    const type = getTransactionType(transaction);
    switch (type) {
      case 'sent': return 'bg-destructive/10 text-destructive';
      case 'received': return 'bg-accent/10 text-accent';
      case 'withdrawal': return 'bg-primary/10 text-primary';
      default: return 'bg-muted/10 text-muted-foreground';
    }
  };

  const getTransactionDescription = (transaction: Transaction) => {
    if (transaction.fromUser?.id === user.id && transaction.toUser) {
      return `Payment to ${transaction.toUser.fullName}`;
    } else if (transaction.toUser?.id === user.id && transaction.fromUser) {
      return `Payment from ${transaction.fromUser.fullName}`;
    }
    return transaction.description || 'Transaction';
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-foreground" data-testid="text-history-title">
          {t("history.title")}
        </h2>
        <div className="flex space-x-4">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-48" data-testid="select-transaction-filter">
              <SelectValue placeholder="Filter transactions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" data-testid="option-filter-all">
                {t("history.allTransactions")}
              </SelectItem>
              <SelectItem value="sent" data-testid="option-filter-sent">
                {t("history.paymentsSent")}
              </SelectItem>
              <SelectItem value="received" data-testid="option-filter-received">
                {t("history.paymentsReceived")}
              </SelectItem>
              <SelectItem value="withdrawals" data-testid="option-filter-withdrawals">
                {t("history.withdrawals")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Transaction Summary Cards */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground">{t("history.totalSent")}</p>
            {summaryLoading ? (
              <Skeleton className="h-8 w-24 mx-auto mt-2" />
            ) : (
              <p className="text-2xl font-bold text-destructive" data-testid="text-total-sent">
                ₹{summary?.totalSent || '0.00'}
              </p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground">{t("history.totalReceived")}</p>
            {summaryLoading ? (
              <Skeleton className="h-8 w-24 mx-auto mt-2" />
            ) : (
              <p className="text-2xl font-bold text-accent" data-testid="text-total-received">
                ₹{summary?.totalReceived || '0.00'}
              </p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground">{t("history.netBalance")}</p>
            {summaryLoading ? (
              <Skeleton className="h-8 w-24 mx-auto mt-2" />
            ) : (
              <p className="text-2xl font-bold text-primary" data-testid="text-net-balance">
                ₹{summary ? (parseFloat(summary.totalReceived) - parseFloat(summary.totalSent)).toFixed(2) : '0.00'}
              </p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground">{t("history.totalTransactions")}</p>
            {summaryLoading ? (
              <Skeleton className="h-8 w-16 mx-auto mt-2" />
            ) : (
              <p className="text-2xl font-bold text-foreground" data-testid="text-transaction-count">
                {summary?.transactionCount || 0}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Detailed Transaction List */}
      <Card>
        <CardHeader>
          <CardTitle data-testid="text-detailed-history">{t("history.detailedHistory")}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 border-b border-border">
                  <div className="flex items-center space-x-3">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground" data-testid="text-no-transactions">
              No transactions found for the selected filter.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full" data-testid="table-transactions">
                <thead className="bg-secondary">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredTransactions.map((transaction: Transaction) => (
                    <tr
                      key={transaction.id}
                      className="hover:bg-muted transition-colors"
                      data-testid={`row-transaction-${transaction.id}`}
                    >
                      <td className="px-6 py-4 text-sm text-foreground">
                        {format(new Date(transaction.createdAt), 'MMM dd, yyyy HH:mm')}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTransactionTypeClass(transaction)}`}>
                          {getTransactionTypeLabel(transaction)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        {getTransactionDescription(transaction)}
                      </td>
                      <td className={`px-6 py-4 text-sm ${getTransactionAmountClass(transaction)}`}>
                        {getTransactionAmount(transaction)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="status-completed">
                          {transaction.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
