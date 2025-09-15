import React from 'react';
import { Check } from 'lucide-react';

interface ProgressBarProps {
  currentStep: string;
  className?: string;
}

const steps = [
  { id: 'checkout', label: 'Produto', description: 'Selecionar produto' },
  { id: 'quotation', label: 'Parcelas', description: 'Escolher plano' },
  { id: 'contract', label: 'Dados', description: 'Informações pessoais' },
  { id: 'processing', label: 'Processando', description: 'Criando contrato' },
  { id: 'dashboard', label: 'Concluído', description: 'Acompanhar pagamentos' }
];

export function ProgressBar({ currentStep, className = '' }: ProgressBarProps) {
  const currentIndex = steps.findIndex(step => step.id === currentStep);

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isUpcoming = index > currentIndex;

          return (
            <div key={step.id} className="flex flex-col items-center flex-1">
              <div className="flex items-center w-full">
                {/* Step Circle */}
                <div className={`
                  flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors
                  ${isCompleted 
                    ? 'bg-success-500 border-success-500 text-white' 
                    : isCurrent 
                    ? 'bg-stellar-500 border-stellar-500 text-white' 
                    : 'bg-gray-100 border-gray-300 text-gray-400'
                  }
                `}>
                  {isCompleted ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className={`
                    flex-1 h-0.5 mx-2 transition-colors
                    ${isCompleted ? 'bg-success-500' : 'bg-gray-200'}
                  `} />
                )}
              </div>

              {/* Step Label */}
              <div className="mt-2 text-center">
                <div className={`
                  text-xs font-medium
                  ${isCurrent ? 'text-stellar-600' : isCompleted ? 'text-success-600' : 'text-gray-400'}
                `}>
                  {step.label}
                </div>
                <div className="text-xs text-gray-500 mt-1 hidden sm:block">
                  {step.description}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ProgressBar;