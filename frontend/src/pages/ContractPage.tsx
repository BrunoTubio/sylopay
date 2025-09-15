import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Phone, FileText, Check } from 'lucide-react';
import { useBNPL } from '../hooks/useBNPL';
import Button from '../components/Button';
import ProgressBar from '../components/ProgressBar';
import { Customer } from '../types';

export function ContractPage() {
  const { state, actions } = useBNPL();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<Customer>(
    state.customer || {
      stellarPublicKey: 'GA57YQCS5NV4TXQPXR6DIKDYTQCMODQ3HNFKJZOULEE7M74SZ6RAIVLA',
      email: 'demo@hackathon.stellar',
      fullName: 'Demo Customer',
      phone: '+55 11 99999-9999',
      documentNumber: '123.456.789-00'
    }
  );
  const [termsAccepted, setTermsAccepted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!termsAccepted) return;
    
    actions.setCustomer(formData);
    actions.nextStep(); // Go to processing
    navigate('/processing');
  };

  const isFormValid = formData.fullName && formData.email && formData.stellarPublicKey && termsAccepted;

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
            <h1 className="text-lg font-semibold">Informações do Cliente</h1>
            <div className="w-16" />
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProgressBar currentStep={state.currentStep} className="mb-8" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Dados Pessoais
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                    Nome Completo *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-stellar-500 focus:border-stellar-500"
                      placeholder="Seu nome completo"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    E-mail *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-stellar-500 focus:border-stellar-500"
                      placeholder="seu@email.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Telefone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-stellar-500 focus:border-stellar-500"
                      placeholder="+55 11 99999-9999"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="documentNumber" className="block text-sm font-medium text-gray-700 mb-2">
                    CPF
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      id="documentNumber"
                      name="documentNumber"
                      value={formData.documentNumber}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-stellar-500 focus:border-stellar-500"
                      placeholder="000.000.000-00"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="stellarPublicKey" className="block text-sm font-medium text-gray-700 mb-2">
                    Stellar Public Key *
                  </label>
                  <input
                    type="text"
                    id="stellarPublicKey"
                    name="stellarPublicKey"
                    value={formData.stellarPublicKey}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-stellar-500 focus:border-stellar-500 font-mono text-sm"
                    placeholder="GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Sua chave pública da conta Stellar para receber os pagamentos
                  </p>
                </div>

                {/* Terms and Conditions */}
                <div className="border-t pt-6">
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="mt-1 h-4 w-4 text-stellar-600 focus:ring-stellar-500 border-gray-300 rounded"
                    />
                    <label htmlFor="terms" className="ml-3 text-sm text-gray-700">
                      Li e aceito os{' '}
                      <a href="#" className="text-stellar-600 hover:text-stellar-500">
                        Termos e Condições
                      </a>{' '}
                      e a{' '}
                      <a href="#" className="text-stellar-600 hover:text-stellar-500">
                        Política de Privacidade
                      </a>
                    </label>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={!isFormValid}
                  className="w-full"
                >
                  Criar Contrato BNPL
                </Button>
              </form>
            </div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Resumo do Pedido
              </h3>

              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Produto:</span>
                  <span className="font-medium">{state.product?.name}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Valor Total:</span>
                  <span className="font-medium">
                    {state.product ? parseFloat(state.product.price).toFixed(2) : '0'} XLM
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Parcelas:</span>
                  <span className="font-medium">
                    {state.selectedPlan?.installmentsCount}x de {' '}
                    {state.selectedPlan ? parseFloat(state.selectedPlan.installmentAmount).toFixed(2) : '0'} XLM
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Taxa de Juros:</span>
                  <span className="font-medium text-green-600">0% (Sem juros)</span>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between font-semibold">
                    <span>Total a Pagar:</span>
                    <span className="text-stellar-600">
                      {state.selectedPlan ? parseFloat(state.selectedPlan.totalAmount).toFixed(2) : '0'} XLM
                    </span>
                  </div>
                </div>

                <div className="bg-stellar-50 rounded-lg p-4 mt-6">
                  <h4 className="font-medium text-stellar-900 mb-2">Próximos Passos:</h4>
                  <ul className="space-y-2 text-sm text-stellar-700">
                    <li className="flex items-center">
                      <Check className="w-4 h-4 mr-2 text-stellar-600" />
                      Criação do smart contract
                    </li>
                    <li className="flex items-center">
                      <Check className="w-4 h-4 mr-2 text-stellar-600" />
                      Pagamento instantâneo ao merchant
                    </li>
                    <li className="flex items-center">
                      <Check className="w-4 h-4 mr-2 text-stellar-600" />
                      Cronograma de parcelas criado
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContractPage;