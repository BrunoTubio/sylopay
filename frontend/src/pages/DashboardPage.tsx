import React, { useEffect, useState } from 'react';
import { ExternalLink, Calendar, DollarSign, CheckCircle, Clock, RefreshCw, Home } from 'lucide-react';
import { useBNPL } from '../hooks/useBNPL';
import Button from '../components/Button';
import ProgressBar from '../components/ProgressBar';
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
        actions.setError('Erro ao carregar dados do dashboard');
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
        return 'Pago';
      case 'due':
        return 'Vencendo';
      case 'overdue':
        return 'Vencido';
      default:
        return 'Pendente';
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-stellar-900">Stellar BNPL Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={actions.resetFlow}
                className="flex items-center"
              >
                <Home className="w-4 h-4 mr-2" />
                Nova Compra
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProgressBar currentStep={state.currentStep} className="mb-8" />

        {/* Success Message */}
        <div className="bg-success-50 border border-success-200 rounded-lg p-6 mb-8">
          <div className="flex">
            <CheckCircle className="w-6 h-6 text-success-600" />
            <div className="ml-3">
              <h3 className="text-lg font-medium text-success-900">
                Parabéns! Seu contrato BNPL foi criado com sucesso!
              </h3>
              <p className="text-success-700 mt-1">
                Agora você pode acompanhar suas parcelas e verificar todas as transações na blockchain Stellar.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contract Overview */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contract Summary */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Resumo do Contrato</h2>
                {state.contract && (
                  <a
                    href={state.contract.explorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-sm text-stellar-600 hover:text-stellar-700"
                  >
                    Ver no Stellar Explorer
                    <ExternalLink className="w-4 h-4 ml-1" />
                  </a>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-stellar-50 rounded-lg">
                  <DollarSign className="w-8 h-8 text-stellar-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-stellar-900">
                    {state.selectedPlan ? formatAmount(state.selectedPlan.totalAmount) : '0 XLM'}
                  </div>
                  <div className="text-sm text-stellar-700">Valor Total</div>
                </div>

                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Calendar className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">
                    {state.selectedPlan?.installmentsCount || 0}x
                  </div>
                  <div className="text-sm text-gray-700">Parcelas</div>
                </div>

                <div className="text-center p-4 bg-success-50 rounded-lg">
                  <CheckCircle className="w-8 h-8 text-success-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-success-900">{progress.toFixed(0)}%</div>
                  <div className="text-sm text-success-700">Concluído</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Progresso do Pagamento</span>
                  <span>{paidInstallments} de {totalInstallments} parcelas pagas</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-success-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Installment Schedule */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Cronograma de Pagamentos</h3>
              
              <div className="space-y-4">
                {installments.map((installment) => (
                  <div 
                    key={installment.number}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(installment.status)}
                      <div>
                        <div className="font-medium text-gray-900">
                          {installment.number}ª Parcela
                        </div>
                        <div className="text-sm text-gray-600">
                          Vencimento: {formatDate(installment.dueDate)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">
                          {formatAmount(installment.amount)}
                        </div>
                        <span className={`
                          inline-flex px-2 py-1 text-xs font-medium rounded-full
                          ${getStatusColor(installment.status)}
                        `}>
                          {getStatusText(installment.status)}
                        </span>
                      </div>
                      
                      {installment.status === 'due' && (
                        <Button size="sm" variant="primary">
                          Pagar Agora
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Account Info Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Stellar Account */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Conta Stellar</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.location.reload()}
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>

              {accountInfo ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-600">Chave Pública:</label>
                    <p className="font-mono text-xs text-gray-900 break-all bg-gray-50 p-2 rounded">
                      {accountInfo.publicKey}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm text-gray-600">Saldo:</label>
                    <p className="text-lg font-semibold text-gray-900">
                      {parseFloat(accountInfo.balance).toFixed(2)} XLM
                    </p>
                  </div>

                  <a
                    href={accountInfo.explorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-full text-sm text-stellar-600 hover:text-stellar-700 py-2 border border-stellar-200 rounded-lg hover:bg-stellar-50"
                  >
                    Ver no Stellar Explorer
                    <ExternalLink className="w-4 h-4 ml-1" />
                  </a>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500">Carregando informações da conta...</p>
                </div>
              )}
            </div>

            {/* Contract Details */}
            {state.contract && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Detalhes do Contrato</h3>
                
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-gray-600">ID:</span>
                    <p className="font-mono text-xs text-gray-900 break-all">{state.contract.id}</p>
                  </div>
                  
                  <div>
                    <span className="text-gray-600">Hash:</span>
                    <p className="font-mono text-xs text-gray-900 break-all">{state.contract.stellarTxHash}</p>
                  </div>
                  
                  <div>
                    <span className="text-gray-600">Status:</span>
                    <p className="font-medium text-success-600 capitalize">{state.contract.status}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Support */}
            <div className="bg-stellar-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-stellar-900 mb-4">Precisa de Ajuda?</h3>
              <p className="text-sm text-stellar-700 mb-4">
                Nossa equipe está pronta para te ajudar com qualquer dúvida sobre seu contrato BNPL.
              </p>
              <Button variant="outline" size="sm" className="w-full">
                Entrar em Contato
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;