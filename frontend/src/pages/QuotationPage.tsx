import React, { useEffect, useState } from 'react';
import { ArrowLeft, Check, Calendar, DollarSign } from 'lucide-react';
import { useBNPL } from '../hooks/useBNPL';
import { QuotationOption } from '../types';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import ProgressBar from '../components/ProgressBar';
import apiService from '../services/api';

export function QuotationPage() {
  const { state, actions } = useBNPL();
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" message="Calculando melhores opções de pagamento..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={actions.prevStep}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Voltar
            </button>
            <h1 className="text-lg font-semibold">Opções de Pagamento</h1>
            <div className="w-16" /> {/* Spacer */}
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Bar */}
        <ProgressBar currentStep={state.currentStep} className="mb-8" />

        {/* Product Summary */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-stellar-100 to-stellar-200 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📱</span>
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900">
                {state.product?.name}
              </h2>
              <p className="text-gray-600">
                Valor total: <span className="font-semibold">{formatAmount(state.product?.price || '0')}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Payment Options */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            Escolha a melhor forma de pagamento:
          </h3>

          {quotationOptions.map((option, index) => (
            <div
              key={index}
              className={`
                bg-white rounded-lg shadow-sm border-2 transition-all cursor-pointer hover:shadow-md
                ${state.selectedPlan?.installmentsCount === option.installmentsCount
                  ? 'border-stellar-500 ring-2 ring-stellar-200'
                  : 'border-gray-200 hover:border-stellar-300'
                }
              `}
              onClick={() => handlePlanSelect(option)}
            >
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    {/* Option Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`
                          w-6 h-6 rounded-full border-2 flex items-center justify-center
                          ${state.selectedPlan?.installmentsCount === option.installmentsCount
                            ? 'border-stellar-500 bg-stellar-500'
                            : 'border-gray-300'
                          }
                        `}>
                          {state.selectedPlan?.installmentsCount === option.installmentsCount && (
                            <Check className="w-4 h-4 text-white" />
                          )}
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900">
                          {option.installmentsCount}x de {formatAmount(option.installmentAmount)}
                        </h4>
                      </div>
                      {option.installmentsCount === 2 && (
                        <span className="bg-success-100 text-success-800 text-xs px-2 py-1 rounded-full font-medium">
                          Mais Popular
                        </span>
                      )}
                    </div>

                    {/* Option Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">
                          Total: <span className="font-medium">{formatAmount(option.totalAmount)}</span>
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">
                          A cada {option.frequencyDays} dias
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Check className="w-4 h-4 text-green-500" />
                        <span className="text-green-600 font-medium">
                          {option.interestRate === '0.0000' ? 'Sem juros' : `Taxa: ${option.interestRate}%`}
                        </span>
                      </div>
                    </div>

                    {/* Payment Schedule Preview */}
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <h5 className="text-sm font-medium text-gray-900 mb-2">Cronograma de Pagamentos:</h5>
                      <div className="space-y-1">
                        {Array.from({ length: option.installmentsCount }, (_, i) => (
                          <div key={i} className="flex justify-between text-sm">
                            <span className="text-gray-600">
                              {i + 1}ª parcela - {formatDate((i + 1) * option.frequencyDays)}
                            </span>
                            <span className="font-medium">{formatAmount(option.installmentAmount)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Continue Button */}
        <div className="mt-8 flex justify-center">
          <Button
            variant="primary"
            size="lg"
            disabled={!state.selectedPlan}
            onClick={() => state.selectedPlan && handlePlanSelect(state.selectedPlan)}
            className="px-8"
          >
            Continuar com Plano Selecionado
          </Button>
        </div>

        {/* Benefits Section */}
        <div className="mt-12 bg-stellar-50 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-stellar-900 mb-4">
            Vantagens do Stellar BNPL
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <Check className="w-5 h-5 text-stellar-600 mt-0.5" />
              <div>
                <h5 className="font-medium text-stellar-900">Aprovação Instantânea</h5>
                <p className="text-sm text-stellar-700">Sem análise de crédito demorada</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Check className="w-5 h-5 text-stellar-600 mt-0.5" />
              <div>
                <h5 className="font-medium text-stellar-900">Blockchain Segura</h5>
                <p className="text-sm text-stellar-700">Transações protegidas pela rede Stellar</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Check className="w-5 h-5 text-stellar-600 mt-0.5" />
              <div>
                <h5 className="font-medium text-stellar-900">Transparência Total</h5>
                <p className="text-sm text-stellar-700">Acompanhe tudo no Stellar Explorer</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Check className="w-5 h-5 text-stellar-600 mt-0.5" />
              <div>
                <h5 className="font-medium text-stellar-900">Sem Taxas Ocultas</h5>
                <p className="text-sm text-stellar-700">O que você vê é o que você paga</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuotationPage;