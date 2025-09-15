import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Calendar, DollarSign, CreditCard, Zap, ArrowRight } from 'lucide-react';
import { useBNPL } from '../hooks/useBNPL';
import { QuotationOption } from '../types';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import LoadingSpinner from '../components/LoadingSpinner';
import Logo from '../components/Logo';
import apiService from '../services/api';

export function QuotationPage() {
  const { state, actions } = useBNPL();
  const navigate = useNavigate();
  const [quotationOptions, setQuotationOptions] = useState<QuotationOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuotation = async () => {
      if (!state.product) return;

      try {
        setLoading(true);
        const response = await apiService.getQuotation(state.product.price);
        setQuotationOptions(response.options);
      } catch (error) {
        console.error('Error fetching quotation:', error);
        actions.setError('Erro ao buscar opções de parcelamento');
      } finally {
        setLoading(false);
      }
    };

    fetchQuotation();
  }, [state.product]);

  const handlePlanSelect = (plan: QuotationOption) => {
    actions.setSelectedPlan(plan);
    actions.nextStep(); // Go to contract
    navigate('/contract');
  };

  const formatAmount = (amount: string) => {
    return `${parseFloat(amount).toFixed(2)} XLM`;
  };

  const formatDate = (daysFromNow: number) => {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    return date.toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <Logo size="lg" className="mb-4" />
              <LoadingSpinner size="lg" />
              <div className="text-center">
                <h3 className="text-lg font-semibold">Calculating Payment Options</h3>
                <p className="text-muted-foreground">Finding the best installment plans for you...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Modern Header */}
      <header className="border-b border-border/40 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button
              variant="ghost"
              onClick={actions.prevStep}
              className="flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center space-x-3">
              <Logo size="sm" />
              <h1 className="text-lg font-semibold">Payment Options</h1>
            </div>
            <div className="w-16" />
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
            <span>Step 2 of 5</span>
            <span>40% Complete</span>
          </div>
          <Progress value={40} className="h-2" />
        </div>

        {/* Product Summary */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl flex items-center justify-center">
                <span className="text-2xl">📱</span>
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-foreground">
                  {state.product?.name}
                </h2>
                <p className="text-muted-foreground">
                  Total amount: <span className="font-semibold text-foreground">{formatAmount(state.product?.price || '0')}</span>
                </p>
              </div>
              <Badge variant="secondary">Selected</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Payment Options */}
        <div className="space-y-6">
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-2">
              Choose Your Payment Plan
            </h3>
            <p className="text-muted-foreground">
              Select the installment option that works best for you
            </p>
          </div>

          <div className="grid gap-4">
            {quotationOptions.map((option, index) => (
              <Card
                key={index}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  state.selectedPlan?.installmentsCount === option.installmentsCount
                    ? 'ring-2 ring-primary border-primary'
                    : 'hover:border-primary/50'
                }`}
                onClick={() => handlePlanSelect(option)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`
                        w-6 h-6 rounded-full border-2 flex items-center justify-center
                        ${state.selectedPlan?.installmentsCount === option.installmentsCount
                          ? 'border-primary bg-primary'
                          : 'border-muted'
                        }
                      `}>
                        {state.selectedPlan?.installmentsCount === option.installmentsCount && (
                          <Check className="w-4 h-4 text-primary-foreground" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-foreground">
                          {option.installmentsCount}x installments
                        </h4>
                        <p className="text-muted-foreground">
                          {formatAmount(option.installmentAmount)} per payment
                        </p>
                      </div>
                    </div>
                    {option.installmentsCount === 3 && (
                      <Badge className="bg-primary text-primary-foreground">
                        Most Popular
                      </Badge>
                    )}
                  </div>

                  {/* Payment Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Total: <span className="font-medium text-foreground">{formatAmount(option.totalAmount)}</span>
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Every {option.frequencyDays} days
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium text-primary">
                        {option.interestRate === '0.0000' ? '0% interest' : `${option.interestRate}% rate`}
                      </span>
                    </div>
                  </div>

                  {/* Payment Schedule */}
                  <Card className="bg-muted/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Payment Schedule</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        {Array.from({ length: option.installmentsCount }, (_, i) => (
                          <div key={i} className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              Payment {i + 1} - {formatDate((i + 1) * option.frequencyDays)}
                            </span>
                            <span className="font-medium">{formatAmount(option.installmentAmount)}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Continue Button */}
        <div className="mt-8 flex justify-center">
          <Button
            size="lg"
            disabled={!state.selectedPlan}
            onClick={() => state.selectedPlan && handlePlanSelect(state.selectedPlan)}
            className="w-full sm:w-auto px-8 h-12"
          >
            <span className="mr-2">Continue with Selected Plan</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Benefits Section */}
        <Card className="mt-12">
          <CardHeader>
            <CardTitle className="text-xl">Why Choose SyloPay BNPL?</CardTitle>
            <CardDescription>
              Experience the future of payments with blockchain technology
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Zap className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h5 className="font-semibold text-foreground">Instant Approval</h5>
                  <p className="text-sm text-muted-foreground">No lengthy credit checks or waiting</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h5 className="font-semibold text-foreground">Blockchain Security</h5>
                  <p className="text-sm text-muted-foreground">Secured by Stellar network technology</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CreditCard className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h5 className="font-semibold text-foreground">Complete Transparency</h5>
                  <p className="text-sm text-muted-foreground">Track everything on Stellar Explorer</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <DollarSign className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h5 className="font-semibold text-foreground">No Hidden Fees</h5>
                  <p className="text-sm text-muted-foreground">What you see is what you pay</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default QuotationPage;