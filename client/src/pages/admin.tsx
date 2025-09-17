import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Users, Activity, TrendingUp, Globe, UserPlus, Edit, UserX } from "lucide-react";

interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  phone: string;
  balance: string;
  isActive: boolean;
  isAdmin: boolean;
  createdAt: string;
}

interface AdminTransaction {
  id: string;
  amount: string;
  type: string;
  status: string;
  description: string;
  createdAt: string;
  fromUser?: { id: string; fullName: string; email: string } | null;
  toUser?: { id: string; fullName: string; email: string } | null;
}

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  dailyTransactions: number;
  totalVolume: string;
}

export default function Admin() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'users' | 'transactions' | 'settings'>('users');

  // Check admin access
  if (!user?.isAdmin) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-destructive mb-4">Access Denied</h2>
            <p className="text-muted-foreground">You need admin privileges to access this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Queries
  const { data: stats, isLoading: statsLoading } = useQuery<AdminStats>({
    queryKey: ['/api/admin/stats'],
    enabled: !!user?.isAdmin,
  });

  const { data: users, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ['/api/admin/users'],
    enabled: !!user?.isAdmin && activeTab === 'users',
  });

  const { data: transactions, isLoading: transactionsLoading } = useQuery<AdminTransaction[]>({
    queryKey: ['/api/admin/transactions'],
    enabled: !!user?.isAdmin && activeTab === 'transactions',
  });

  // Mutations
  const updateUserStatusMutation = useMutation({
    mutationFn: async ({ userId, isActive }: { userId: string; isActive: boolean }) => {
      const res = await apiRequest('PATCH', `/api/admin/users/${userId}/status`, { isActive });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      toast({
        title: "Success",
        description: "User status updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user status",
        variant: "destructive",
      });
    },
  });

  const handleUserStatusChange = (userId: string, isActive: boolean) => {
    updateUserStatusMutation.mutate({ userId, isActive });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h2 className="text-3xl font-bold text-foreground mb-8" data-testid="text-admin-title">
        {t("admin.title")}
      </h2>
      
      {/* Admin Statistics */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t("admin.totalUsers")}</p>
                {statsLoading ? (
                  <Skeleton className="h-8 w-16 mt-1" />
                ) : (
                  <p className="text-3xl font-bold text-foreground" data-testid="text-total-users">
                    {stats?.totalUsers || 0}
                  </p>
                )}
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t("admin.dailyTransactions")}</p>
                {statsLoading ? (
                  <Skeleton className="h-8 w-16 mt-1" />
                ) : (
                  <p className="text-3xl font-bold text-foreground" data-testid="text-daily-transactions">
                    {stats?.dailyTransactions || 0}
                  </p>
                )}
              </div>
              <Activity className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t("admin.totalVolume")}</p>
                {statsLoading ? (
                  <Skeleton className="h-8 w-20 mt-1" />
                ) : (
                  <p className="text-3xl font-bold text-foreground" data-testid="text-total-volume">
                    ₹{stats?.totalVolume || '0.00'}
                  </p>
                )}
              </div>
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Users</p>
                {statsLoading ? (
                  <Skeleton className="h-8 w-16 mt-1" />
                ) : (
                  <p className="text-3xl font-bold text-foreground" data-testid="text-active-users">
                    {stats?.activeUsers || 0}
                  </p>
                )}
              </div>
              <Globe className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Admin Tabs */}
      <Card>
        <div className="border-b border-border">
          <nav className="flex space-x-8 px-6" aria-label="Admin Tabs">
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'users'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setActiveTab('users')}
              data-testid="tab-users"
            >
              {t("admin.userManagement")}
            </button>
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'transactions'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setActiveTab('transactions')}
              data-testid="tab-transactions"
            >
              {t("admin.allTransactions")}
            </button>
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'settings'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setActiveTab('settings')}
              data-testid="tab-settings"
            >
              {t("admin.systemSettings")}
            </button>
          </nav>
        </div>
        
        {/* User Management Tab */}
        {activeTab === 'users' && (
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-foreground">
                {t("admin.userManagement")}
              </h3>
              <Button className="bg-primary text-primary-foreground" data-testid="button-add-user">
                <UserPlus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            </div>
            
            {usersLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div>
                        <Skeleton className="h-4 w-32 mb-2" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                    <Skeleton className="h-8 w-20" />
                  </div>
                ))}
              </div>
            ) : users && users.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full" data-testid="table-users">
                  <thead className="bg-secondary">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Balance
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {users.map((adminUser) => (
                      <tr 
                        key={adminUser.id} 
                        className="hover:bg-muted transition-colors"
                        data-testid={`row-user-${adminUser.id}`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="h-10 w-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold">
                              {getInitials(adminUser.fullName)}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-foreground">
                                {adminUser.fullName}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                ID: {adminUser.id.slice(-8)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-foreground">
                          {adminUser.email}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-foreground">
                          ₹{parseFloat(adminUser.balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            adminUser.isActive 
                              ? 'bg-accent/10 text-accent' 
                              : 'bg-destructive/10 text-destructive'
                          }`}>
                            {adminUser.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium">
                          <div className="flex items-center space-x-4">
                            <Button variant="link" size="sm" className="text-primary hover:underline">
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={adminUser.isActive}
                                onCheckedChange={(checked) => handleUserStatusChange(adminUser.id, checked)}
                                disabled={updateUserStatusMutation.isPending || adminUser.id === user?.id}
                                data-testid={`switch-user-status-${adminUser.id}`}
                              />
                              <span className="text-xs text-muted-foreground">
                                {adminUser.isActive ? 'Active' : 'Suspended'}
                              </span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground" data-testid="text-no-users">
                No users found.
              </div>
            )}
          </CardContent>
        )}
        
        {/* All Transactions Tab */}
        {activeTab === 'transactions' && (
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-6">
              {t("admin.allTransactions")}
            </h3>
            
            {transactionsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : transactions && transactions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full" data-testid="table-admin-transactions">
                  <thead className="bg-secondary">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Transaction ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        From
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        To
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {transactions.map((transaction) => (
                      <tr 
                        key={transaction.id} 
                        className="hover:bg-muted transition-colors"
                        data-testid={`row-admin-transaction-${transaction.id}`}
                      >
                        <td className="px-6 py-4 text-sm text-foreground font-mono">
                          {transaction.id.slice(-8).toUpperCase()}
                        </td>
                        <td className="px-6 py-4 text-sm text-foreground">
                          {transaction.fromUser?.fullName || 'System'}
                        </td>
                        <td className="px-6 py-4 text-sm text-foreground">
                          {transaction.toUser?.fullName || 'External'}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-foreground">
                          ₹{parseFloat(transaction.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4">
                          <span className="status-completed">
                            {transaction.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-foreground">
                          {format(new Date(transaction.createdAt), 'MMM dd, yyyy')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground" data-testid="text-no-admin-transactions">
                No transactions found.
              </div>
            )}
          </CardContent>
        )}
        
        {/* System Settings Tab */}
        {activeTab === 'settings' && (
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-6">
              {t("admin.systemSettings")}
            </h3>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label className="block text-sm font-medium text-foreground mb-2">
                    Daily Transaction Limit
                  </Label>
                  <Input
                    type="number"
                    className="form-input"
                    defaultValue="100000"
                    data-testid="input-daily-limit"
                  />
                </div>
                <div>
                  <Label className="block text-sm font-medium text-foreground mb-2">
                    Minimum Balance
                  </Label>
                  <Input
                    type="number"
                    className="form-input"
                    defaultValue="1000"
                    data-testid="input-minimum-balance"
                  />
                </div>
              </div>
              
              <Card className="bg-secondary">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-foreground">Voice Assistant</h4>
                      <p className="text-sm text-muted-foreground">
                        Enable voice commands for users
                      </p>
                    </div>
                    <Switch defaultChecked data-testid="switch-voice-assistant" />
                  </div>
                </CardContent>
              </Card>
              
              <Button 
                className="bg-primary text-primary-foreground"
                data-testid="button-save-settings"
              >
                Save Settings
              </Button>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
