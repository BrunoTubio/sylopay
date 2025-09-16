import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ExternalLink, AlertCircle, Clock, Zap, Shield, CreditCard, ArrowRight, TrendingDown } from 'lucide-react';
import { useBNPL } from '../hooks/useBNPL';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import LoadingSpinner from '../components/LoadingSpinner';
import Logo from '../components/Logo';
import apiService from '../services/api';
import { DEMO_MERCHANT } from '../types';
import pricingService, { PricingBreakdown } from '../services/pricingService';

interface ProcessingStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
}

export function ProcessingPage() {
  const { state, actions } = useBNPL();
  const navigate = useNavigate();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [processingStarted, setProcessingStarted] = useState(false);
  const [pricingBreakdown, setPricingBreakdown] = useState<PricingBreakdown | null>(null);
  const [steps, setSteps] = useState<ProcessingStep[]>([
    {
      id: 'validation',
      title: 'Validating Data',
      description: 'Verifying customer information and selected plan',
      status: 'processing'
    },
    {
      id: 'stellar',
      title: 'Connecting to Stellar Network',
      description: 'Establishing blockchain connection',
      status: 'pending'
    },
    {
      id: 'contract',
      title: 'Creating Smart Contract',
      description: 'Deploying smart contract on blockchain',
      status: 'pending'
    },
    {
      id: 'payment',
      title: 'Processing Payment',
      description: 'Transferring funds to merchant',
      status: 'pending'
    },
    {
      id: 'completion',
      title: 'Finalizing',
      description: 'Setting up installment schedule',
      status: 'pending'
    }
  ]);

  useEffect(() => {
    const calculatePricing = async () => {
      if (!state.product || !state.selectedPlan) return;
      
      try {
        const pricing = await pricingService.calculateDynamicPricing(
          parseFloat(state.product.price),
          state.selectedPlan.installmentsCount
        );
        setPricingBreakdown(pricing);
      } catch (error) {
        console.error('Error calculating pricing:', error);
      }
    };

    calculatePricing();
  }, [state.product, state.selectedPlan]);

  useEffect(() => {
    const processContract = async () => {
      if (processingStarted) return; // Prevent multiple executions
      
      if (!state.customer || !state.selectedPlan || !state.product) {
        actions.setError('Incomplete data to process contract');
        return;
      }

      setProcessingStarted(true);

      try {
        // Step 1: Validation
        await updateStep(0, 'completed');
        await apiService.delay(1000);

        // Step 2: Stellar Connection
        await updateStep(1, 'processing');
        const stellarHealth = await apiService.getStellarHealth();
        if (!stellarHealth.connected) {
          throw new Error('Failed to connect to Stellar network');
        }
        await updateStep(1, 'completed');
        await apiService.delay(1000);

        // Step 3: Contract Creation
        await updateStep(2, 'processing');
        const contractData = {
          merchantPublicKey: DEMO_MERCHANT.publicKey,
          customerPublicKey: state.customer.stellarPublicKey,
          totalAmount: state.selectedPlan.totalAmount,
          installmentsCount: state.selectedPlan.installmentsCount,
          customer: state.customer,
          selectedPlan: state.selectedPlan,
          termsAccepted: true
        };

        const contractResponse = await apiService.createContract(contractData);
        if (!contractResponse.success) {
          throw new Error('Failed to create contract');
        }

        actions.setContract(contractResponse.contract);
        await updateStep(2, 'completed');
        await apiService.delay(1000);

        // Step 4: Payment Processing (mock)
        await updateStep(3, 'processing');
        await apiService.delay(2000); // Simulate payment processing
        await updateStep(3, 'completed');
        await apiService.delay(1000);

        // Step 5: Completion
        await updateStep(4, 'processing');
        await apiService.delay(1000);
        await updateStep(4, 'completed');

        // Redirect to dashboard after a short delay
        setTimeout(() => {
          actions.nextStep();
          navigate('/dashboard');
        }, 2000);

      } catch (error) {
        console.error('Contract processing error:', error);
        setSteps(prev => prev.map((step, index) => 
          index === currentStepIndex 
            ? { ...step, status: 'error' }
            : step
        ));
        actions.setError(error instanceof Error ? error.message : 'Processing error');
      }
    };

    const updateStep = async (stepIndex: number, status: ProcessingStep['status']) => {
      setCurrentStepIndex(stepIndex);
      setSteps(prev => prev.map((step, index) => 
        index === stepIndex 
          ? { ...step, status }
          : index < stepIndex 
          ? { ...step, status: 'completed' }
          : step
      ));
    };

    processContract();
  }, []);

  const getStepIcon = (step: ProcessingStep) => {
    switch (step.status) {
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-success-600" />;
      case 'processing':
        return <LoadingSpinner size="sm" />;
      case 'error':
        return <AlertCircle className="w-6 h-6 text-error-600" />;
      default:
        return <div className="w-6 h-6 border-2 border-gray-300 rounded-full" />;
    }
  };

  const allCompleted = steps.every(step => step.status === 'completed');
  const hasError = steps.some(step => step.status === 'error');

  return (
    <div className="min-h-screen bg-background">
      {/* Modern Header */}
      <header className="border-b border-border/40 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-16">
            <div className="flex items-center space-x-3">
              <Logo size="md" className="animate-pulse" />
              <h1 className="text-lg font-semibold">Processing BNPL Contract</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
            <span>Step 4 of 5</span>
            <span>80% Complete</span>
          </div>
          <Progress value={80} className="h-2" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Processing Steps */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-primary" />
                  Contract Processing
                </CardTitle>
                <CardDescription>
                  Creating your BNPL contract on the Stellar blockchain
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {steps.map((step, index) => (
                  <div
                    key={step.id}
                    className={`
                      flex items-start space-x-4 p-4 rounded-lg transition-all
                      ${step.status === 'processing' ? 'bg-primary/5 border border-primary/20' : ''}
                      ${step.status === 'error' ? 'bg-destructive/5 border border-destructive/20' : ''}
                      ${step.status === 'completed' ? 'bg-green-500/5 border border-green-500/20' : ''}
                    `}
                  >
                    <div className="flex-shrink-0 mt-1">
                      {getStepIcon(step)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={`
                        text-base font-semibold
                        ${step.status === 'completed' ? 'text-green-600' : ''}
                        ${step.status === 'processing' ? 'text-primary' : ''}
                        ${step.status === 'error' ? 'text-destructive' : ''}
                        ${step.status === 'pending' ? 'text-muted-foreground' : ''}
                      `}>
                        {step.title}
                      </h3>
                      <p className={`
                        text-sm mt-1
                        ${step.status === 'completed' ? 'text-green-600/80' : ''}
                        ${step.status === 'processing' ? 'text-primary/80' : ''}
                        ${step.status === 'error' ? 'text-destructive/80' : ''}
                        ${step.status === 'pending' ? 'text-muted-foreground' : ''}
                      `}>
                        {step.description}
                      </p>
                    </div>
                    {step.status === 'completed' && index === 2 && state.contract && (
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                      >
                        <a
                          href={state.contract.explorerUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View on Explorer
                        </a>
                      </Button>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Success Message */}
            {allCompleted && (
              <Card className="mt-6 border-green-500/20 bg-green-500/5">
                <CardContent className="pt-6">
                  <div className="flex">
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                    <div className="ml-3">
                      <h3 className="text-lg font-semibold text-green-600">
                        BNPL Contract Created Successfully!
                      </h3>
                      <p className="text-green-600/80 mt-1">
                        Your contract has been created on the Stellar blockchain. You'll be redirected to the dashboard
                        where you can track your installments.
                      </p>
                      {state.contract && (
                        <div className="mt-4">
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
                              Verify on Stellar Explorer
                            </a>
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Error Message */}
            {hasError && (
              <Card className="mt-6 border-destructive/20 bg-destructive/5">
                <CardContent className="pt-6">
                  <div className="flex">
                    <AlertCircle className="w-6 h-6 text-destructive flex-shrink-0" />
                    <div className="ml-3">
                      <h3 className="text-lg font-semibold text-destructive">
                        Processing Error
                      </h3>
                      <p className="text-destructive/80 mt-1">
                        {state.error || 'An error occurred during contract processing. Please try again.'}
                      </p>
                      <div className="mt-4 flex space-x-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={actions.prevStep}
                        >
                          Go Back
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => window.location.reload()}
                        >
                          Try Again
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Contract Details */}
            {state.contract && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center">
                    <Shield className="w-4 h-4 mr-2" />
                    Contract Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Contract ID</label>
                    <p className="font-mono text-sm break-all">{state.contract.id}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Transaction Hash</label>
                    <p className="font-mono text-sm break-all">{state.contract.stellarTxHash}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Status</label>
                    <div className="flex items-center mt-1">
                      <Badge variant="secondary" className="capitalize">
                        {state.contract.status}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Network</label>
                    <p className="text-sm font-medium">Stellar Testnet</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Product:</span>
                  <span className="font-medium">{state.product?.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Product Price:</span>
                  <span className="font-medium">
                    {state.product ? parseFloat(state.product.price).toFixed(2) : '0'} XLM
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Payment Plan:</span>
                  <span className="font-medium">
                    {state.selectedPlan?.installmentsCount}x installments
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Each Payment:</span>
                  <span className="font-medium">
                    {state.selectedPlan ? parseFloat(state.selectedPlan.installmentAmount).toFixed(2) : '0'} XLM
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Interest Rate:</span>
                  <span className="font-medium text-primary">
                    {pricingBreakdown 
                      ? `${pricingBreakdown.consumerInterestRate.toFixed(1)}% APR via Blend`
                      : state.selectedPlan
                        ? 'Dynamic rate via Blend'
                        : 'Loading...'
                    }
                  </span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between font-semibold">
                    <span>Total You'll Pay:</span>
                    <span className="text-primary">
                      {pricingBreakdown 
                        ? `${pricingBreakdown.totalConsumerPayment.toFixed(7)} XLM`
                        : state.selectedPlan 
                          ? `${parseFloat(state.selectedPlan.totalAmount).toFixed(2)} XLM`
                          : '0 XLM'
                      }
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Badge */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="text-center">
                  <Shield className="w-8 h-8 text-primary mx-auto mb-3" />
                  <h4 className="font-semibold text-primary mb-2">Blockchain Secured</h4>
                  <p className="text-xs text-muted-foreground">
                    Your contract is secured by the Stellar network with full transparency and immutability.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProcessingPage;