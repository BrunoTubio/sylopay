import React, { useEffect, useState } from 'react';
import { CheckCircle, ExternalLink, AlertCircle } from 'lucide-react';
import { useBNPL } from '../hooks/useBNPL';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import ProgressBar from '../components/ProgressBar';
import apiService from '../services/api';
import { DEMO_MERCHANT } from '../types';

interface ProcessingStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
}

export function ProcessingPage() {
  const { state, actions } = useBNPL();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [steps, setSteps] = useState<ProcessingStep[]>([
    {
      id: 'validation',
      title: 'Validando Dados',
      description: 'Verificando informações do cliente e plano selecionado',
      status: 'processing'
    },
    {
      id: 'stellar',
      title: 'Conectando à Rede Stellar',
      description: 'Estabelecendo conexão com a blockchain',
      status: 'pending'
    },
    {
      id: 'contract',
      title: 'Criando Smart Contract',
      description: 'Implantando contrato inteligente na blockchain',
      status: 'pending'
    },
    {
      id: 'payment',
      title: 'Processando Pagamento',
      description: 'Transferindo fundos para o merchant',
      status: 'pending'
    },
    {
      id: 'completion',
      title: 'Finalizando',
      description: 'Configurando cronograma de parcelas',
      status: 'pending'
    }
  ]);

  useEffect(() => {
    const processContract = async () => {
      if (!state.customer || !state.selectedPlan || !state.product) {
        actions.setError('Dados incompletos para processar contrato');
        return;
      }

      try {
        // Step 1: Validation
        await updateStep(0, 'completed');
        await apiService.delay(1000);

        // Step 2: Stellar Connection
        await updateStep(1, 'processing');
        const stellarHealth = await apiService.getStellarHealth();
        if (!stellarHealth.connected) {
          throw new Error('Falha na conexão com a rede Stellar');
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
          throw new Error('Falha na criação do contrato');
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
        }, 2000);

      } catch (error) {
        console.error('Contract processing error:', error);
        setSteps(prev => prev.map((step, index) => 
          index === currentStepIndex 
            ? { ...step, status: 'error' }
            : step
        ));
        actions.setError(error instanceof Error ? error.message : 'Erro no processamento');
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-16">
            <h1 className="text-lg font-semibold">Processando Contrato BNPL</h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProgressBar currentStep={state.currentStep} className="mb-8" />

        <div className="bg-white rounded-lg shadow-sm p-8">
          {/* Processing Steps */}
          <div className="space-y-6">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`
                  flex items-start space-x-4 p-4 rounded-lg transition-colors
                  ${step.status === 'processing' ? 'bg-stellar-50' : ''}
                  ${step.status === 'error' ? 'bg-error-50' : ''}
                `}
              >
                <div className="flex-shrink-0 mt-1">
                  {getStepIcon(step)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`
                    text-lg font-medium
                    ${step.status === 'completed' ? 'text-success-900' : ''}
                    ${step.status === 'processing' ? 'text-stellar-900' : ''}
                    ${step.status === 'error' ? 'text-error-900' : ''}
                    ${step.status === 'pending' ? 'text-gray-500' : ''}
                  `}>
                    {step.title}
                  </h3>
                  <p className={`
                    text-sm mt-1
                    ${step.status === 'completed' ? 'text-success-700' : ''}
                    ${step.status === 'processing' ? 'text-stellar-700' : ''}
                    ${step.status === 'error' ? 'text-error-700' : ''}
                    ${step.status === 'pending' ? 'text-gray-400' : ''}
                  `}>
                    {step.description}
                  </p>
                </div>
                {step.status === 'completed' && index === 2 && state.contract && (
                  <a
                    href={state.contract.explorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-sm text-stellar-600 hover:text-stellar-700"
                  >
                    Ver no Explorer
                    <ExternalLink className="w-4 h-4 ml-1" />
                  </a>
                )}
              </div>
            ))}
          </div>

          {/* Success Message */}
          {allCompleted && (
            <div className="mt-8 p-6 bg-success-50 rounded-lg">
              <div className="flex">
                <CheckCircle className="w-6 h-6 text-success-600" />
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-success-900">
                    Contrato BNPL Criado com Sucesso!
                  </h3>
                  <p className="text-success-700 mt-1">
                    Seu contrato foi criado na blockchain Stellar. Você será redirecionado para o dashboard
                    onde poderá acompanhar suas parcelas.
                  </p>
                  {state.contract && (
                    <div className="mt-4">
                      <a
                        href={state.contract.explorerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm font-medium text-success-600 hover:text-success-500"
                      >
                        Verificar transação no Stellar Explorer
                        <ExternalLink className="w-4 h-4 ml-1" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {hasError && (
            <div className="mt-8 p-6 bg-error-50 rounded-lg">
              <div className="flex">
                <AlertCircle className="w-6 h-6 text-error-600" />
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-error-900">
                    Erro no Processamento
                  </h3>
                  <p className="text-error-700 mt-1">
                    {state.error || 'Ocorreu um erro durante o processamento do contrato. Tente novamente.'}
                  </p>
                  <div className="mt-4 flex space-x-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={actions.prevStep}
                    >
                      Voltar
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => window.location.reload()}
                    >
                      Tentar Novamente
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Contract Details */}
          {state.contract && (
            <div className="mt-8 p-6 bg-gray-50 rounded-lg">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Detalhes do Contrato</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">ID do Contrato:</span>
                  <p className="font-mono text-gray-900 break-all">{state.contract.id}</p>
                </div>
                <div>
                  <span className="text-gray-600">Hash da Transação:</span>
                  <p className="font-mono text-gray-900 break-all">{state.contract.stellarTxHash}</p>
                </div>
                <div>
                  <span className="text-gray-600">Status:</span>
                  <p className="font-medium text-success-600 capitalize">{state.contract.status}</p>
                </div>
                <div>
                  <span className="text-gray-600">Rede:</span>
                  <p className="font-medium text-gray-900">Stellar Testnet</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProcessingPage;