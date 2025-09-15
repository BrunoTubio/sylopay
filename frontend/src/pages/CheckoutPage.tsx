import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Star, Shield, Zap } from 'lucide-react';
import { useBNPL } from '../hooks/useBNPL';
import Button from '../components/Button';
import { DEMO_PRODUCT } from '../types';

export function CheckoutPage() {
  const { state, actions } = useBNPL();
  const navigate = useNavigate();
  const product = state.product || DEMO_PRODUCT;

  const handleBNPLClick = () => {
    actions.setProduct(product);
    actions.setStep('quotation');
    navigate('/quotation');
  };

  const features = [
    {
      icon: Shield,
      title: 'Seguro e Confiável',
      description: 'Transações protegidas pela blockchain Stellar'
    },
    {
      icon: Zap,
      title: 'Aprovação Instantânea', 
      description: 'Sem burocacia, aprovação em segundos'
    },
    {
      icon: Star,
      title: 'Zero Juros',
      description: 'Parcele sem juros em até 4x'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-stellar-900">TechStore Demo</h1>
            </div>
            <div className="flex items-center space-x-4">
              <ShoppingCart className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-x-8 lg:items-start">
          {/* Product Image */}
          <div className="flex flex-col-reverse">
            <div className="mx-auto mt-6 w-full max-w-2xl sm:block lg:max-w-none">
              <div className="grid grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="aspect-w-3 aspect-h-2 rounded-lg overflow-hidden bg-gray-100"
                  >
                    <div className="w-full h-24 bg-gradient-to-br from-stellar-200 to-stellar-300 flex items-center justify-center">
                      <span className="text-stellar-600 text-xs">IMG {i}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="w-full aspect-w-1 aspect-h-1">
              <div className="w-full h-96 bg-gradient-to-br from-stellar-100 to-stellar-200 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="w-32 h-32 bg-white rounded-lg shadow-lg mx-auto mb-4 flex items-center justify-center">
                    <span className="text-stellar-600 font-bold text-lg">📱</span>
                  </div>
                  <p className="text-stellar-600 font-medium">{product.name}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              {product.name}
            </h1>

            <div className="mt-3">
              <h2 className="sr-only">Product information</h2>
              <div className="flex items-center space-x-2">
                <p className="text-3xl font-bold text-gray-900">
                  {parseFloat(product.price).toFixed(0)} XLM
                </p>
                <span className="text-sm text-gray-500">≈ $25.00 USD</span>
              </div>
            </div>

            {/* Reviews */}
            <div className="mt-3">
              <div className="flex items-center">
                <div className="flex items-center">
                  {[0, 1, 2, 3, 4].map((rating) => (
                    <Star
                      key={rating}
                      className="text-yellow-400 h-5 w-5 fill-current"
                    />
                  ))}
                </div>
                <p className="sr-only">5 out of 5 stars</p>
                <p className="ml-3 text-sm text-gray-500">256 avaliações</p>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="sr-only">Description</h3>
              <div className="text-base text-gray-700 space-y-6">
                <p>{product.description}</p>
              </div>
            </div>

            {/* Payment Options */}
            <div className="mt-8">
              <div className="flex flex-col space-y-4">
                {/* Traditional Payment */}
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full justify-start"
                  disabled
                >
                  <ShoppingCart className="w-5 h-5 mr-3" />
                  Comprar Agora - {parseFloat(product.price).toFixed(0)} XLM
                </Button>

                {/* BNPL Payment */}
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full justify-start bg-gradient-to-r from-stellar-600 to-stellar-700 hover:from-stellar-700 hover:to-stellar-800"
                  onClick={handleBNPLClick}
                >
                  <Zap className="w-5 h-5 mr-3" />
                  Pagar com Stellar BNPL
                </Button>
              </div>

              <p className="mt-3 text-sm text-gray-500 text-center">
                Parcele em até 4x sem juros • Aprovação instantânea
              </p>
            </div>

            {/* Features */}
            <div className="mt-8 border-t border-gray-200 pt-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Por que escolher Stellar BNPL?
              </h3>
              <div className="space-y-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex">
                    <div className="flex-shrink-0">
                      <feature.icon className="h-6 w-6 text-stellar-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {feature.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;