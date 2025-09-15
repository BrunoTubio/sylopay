import React, { useEffect, useState } from 'react';
import { ExternalLink, Calendar, DollarSign, CheckCircle, Clock, RefreshCw, Home, TrendingUp, Wallet, Activity, Star } from 'lucide-react';
import { useBNPL } from '../hooks/useBNPL';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import Logo from '../components/Logo';
import apiService from '../services/api';
import { StellarAccount } from '../types';

interface InstallmentSchedule {
  number: number;
  amount: string;
  dueDate: string;
  status: 'pending' | 'due' | 'paid' | 'overdue';
  paidDate?: string;
}

export function DashboardPage() {
  const { state, actions } = useBNPL();
  const [accountInfo, setAccountInfo] = useState<StellarAccount | null>(null);
  const [installments, setInstallments] = useState<InstallmentSchedule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!state.customer || !state.selectedPlan) return;

      try {
        setLoading(true);

        // Fetch Stellar account info
        const account = await apiService.getStellarAccount(state.customer.stellarPublicKey);
        setAccountInfo(account);

        // Generate installment schedule
        const schedule = generateInstallmentSchedule();
        setInstallments(schedule);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        actions.setError('Error loading dashboard data');
      } finally {
        setLoading(false);
      }
    };

    const generateInstallmentSchedule = (): InstallmentSchedule[] => {
      if (!state.selectedPlan) return [];

      const installments: InstallmentSchedule[] = [];
      const today = new Date();

      for (let i = 0; i < state.selectedPlan.installmentsCount; i++) {
        const dueDate = new Date();
        dueDate.setDate(today.getDate() + (i + 1) * state.selectedPlan.frequencyDays);

        installments.push({
          number: i + 1,
          amount: state.selectedPlan.installmentAmount,
          dueDate: dueDate.toISOString().split('T')[0],
          status: i === 0 ? 'due' : 'pending'
        });
      }

      return installments;
    };

    fetchDashboardData();
  }, [state.customer, state.selectedPlan]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatAmount = (amount: string) => {
    return `${parseFloat(amount).toFixed(2)} XLM`;
  };

  const getStatusIcon = (status: InstallmentSchedule['status']) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-5 h-5 text-success-600" />;
      case 'due':
        return <Clock className="w-5 h-5 text-warning-600" />;
      case 'overdue':
        return <Clock className="w-5 h-5 text-error-600" />;
      default:
        return <Calendar className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusText = (status: InstallmentSchedule['status']) => {
    switch (status) {
      case 'paid':
        return 'Paid';
      case 'due':
        return 'Due';
      case 'overdue':
        return 'Overdue';
      default:
        return 'Pending';
    }
  };

  const getStatusColor = (status: InstallmentSchedule['status']) => {
    switch (status) {
      case 'paid':
        return 'text-success-600 bg-success-100';
      case 'due':
        return 'text-warning-600 bg-warning-100';
      case 'overdue':
        return 'text-error-600 bg-error-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const paidInstallments = installments.filter(i => i.status === 'paid').length;
  const totalInstallments = installments.length;
  const progress = totalInstallments > 0 ? (paidInstallments / totalInstallments) * 100 : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Modern Header */}
      <header className="border-b border-border/40 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Logo size="md" />
              <h1 className="text-xl font-bold text-foreground">SyloPay Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="hidden sm:flex">
                <Activity className="w-3 h-3 mr-1" />
                Active Contract
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={actions.resetFlow}
                className="flex items-center"
              >
                <Home className="w-4 h-4 mr-2" />
                New Purchase
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
            <span>Step 5 of 5</span>
            <span>100% Complete</span>
          </div>
          <Progress value={100} className="h-2" />
        </div>

        {/* Success Banner */}
        <Card className="mb-8 border-green-500/20 bg-gradient-to-r from-green-500/5 to-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  🎉 Congratulations! Your BNPL Contract is Live!
                </h3>
                <p className="text-muted-foreground mb-4">
                  Your contract has been successfully created on the Stellar blockchain. Track your installments and monitor all transactions with full transparency.
                </p>
                {state.contract && (
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="border-green-500/30 text-green-600 hover:bg-green-500/10"
                  >
                    <a
                      href={state.contract.explorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View on Stellar Explorer
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Amount</p>
                      <p className="text-2xl font-bold text-foreground">
                        {state.selectedPlan ? formatAmount(state.selectedPlan.totalAmount) : '0 XLM'}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Installments</p>
                      <p className="text-2xl font-bold text-foreground">
                        {state.selectedPlan?.installmentsCount || 0}x
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Progress</p>
                      <p className="text-2xl font-bold text-foreground">{progress.toFixed(0)}%</p>
                    </div>
                    <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Payment Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Progress</CardTitle>
                <CardDescription>
                  {paidInstallments} of {totalInstallments} installments completed
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Progress value={progress} className="h-3" />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Started</span>
                    <span>{progress.toFixed(0)}% Complete</span>
                    <span>Finished</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Installment Schedule */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Payment Schedule
                </CardTitle>
                <CardDescription>
                  Track your upcoming and completed payments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {installments.map((installment) => (
                    <div 
                      key={installment.number}
                      className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        {getStatusIcon(installment.status)}
                        <div>
                          <div className="font-medium text-foreground">
                            Payment #{installment.number}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Due: {formatDate(installment.dueDate)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="font-semibold text-foreground">
                            {formatAmount(installment.amount)}
                          </div>
                          <Badge 
                            variant={installment.status === 'paid' ? 'default' : 
                                    installment.status === 'due' ? 'destructive' : 'secondary'}
                            className="text-xs"
                          >
                            {getStatusText(installment.status)}
                          </Badge>
                        </div>
                        
                        {installment.status === 'due' && (
                          <Button size="sm">
                            Pay Now
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Stellar Account Info */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center text-base">
                    <Wallet className="w-4 h-4 mr-2" />
                    Stellar Account
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.location.reload()}
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {accountInfo ? (
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Public Key</label>
                      <p className="font-mono text-xs break-all bg-muted p-2 rounded mt-1">
                        {accountInfo.publicKey}
                      </p>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Balance</label>
                      <p className="text-lg font-bold text-primary mt-1">
                        {parseFloat(accountInfo.balance).toFixed(2)} XLM
                      </p>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      asChild
                    >
                      <a
                        href={accountInfo.explorerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View on Explorer
                      </a>
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-sm text-muted-foreground">Loading account info...</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Contract Details */}
            {state.contract && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Contract Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Contract ID</label>
                    <p className="font-mono text-xs break-all">{state.contract.id}</p>
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Transaction Hash</label>
                    <p className="font-mono text-xs break-all">{state.contract.stellarTxHash}</p>
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Status</label>
                    <div className="flex items-center mt-1">
                      <Badge variant="default" className="bg-green-500 text-green-50">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        {state.contract.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Rating Card */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="flex justify-center mb-3">
                    {[1,2,3,4,5].map((star) => (
                      <Star key={star} className="w-5 h-5 text-yellow-500 fill-current" />
                    ))}
                  </div>
                  <h4 className="font-semibold text-foreground mb-2">Love SyloPay?</h4>
                  <p className="text-xs text-muted-foreground mb-4">
                    Share your experience and help others discover the future of payments.
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    Rate Experience
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Support */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Need Help?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Our support team is ready to help with any questions about your BNPL contract.
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  Contact Support
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;