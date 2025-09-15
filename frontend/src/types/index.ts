// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Quotation Types
export interface QuotationOption {
  installmentsCount: number;
  installmentAmount: string;
  totalAmount: string;
  frequencyDays: number;
  interestRate: string;
  description: string;
}

export interface QuotationResponse {
  success: boolean;
  originalAmount: string;
  options: QuotationOption[];
  currency: string;
  generatedAt: string;
}

// Customer Types
export interface Customer {
  stellarPublicKey: string;
  email: string;
  fullName: string;
  phone?: string;
  documentNumber?: string;
}

// Contract Types
export interface Contract {
  id: string;
  stellarTxHash: string;
  explorerUrl: string;
  status: string;
}

export interface ContractRequest {
  merchantPublicKey: string;
  customerPublicKey: string;
  totalAmount: string;
  installmentsCount: number;
  customer: Customer;
  selectedPlan: QuotationOption;
  termsAccepted: boolean;
}

export interface ContractResponse {
  success: boolean;
  contract: Contract;
}

// Product Types
export interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  image: string;
  category: string;
}

// Stellar Account Types
export interface StellarAccount {
  publicKey: string;
  balance: string;
  sequence: string;
  explorerUrl: string;
}

// App State Types
export interface AppState {
  currentStep: 'checkout' | 'quotation' | 'contract' | 'processing' | 'dashboard';
  product: Product | null;
  selectedPlan: QuotationOption | null;
  customer: Customer | null;
  contract: Contract | null;
  loading: boolean;
  error: string | null;
}

// Demo Data
export const DEMO_PRODUCT: Product = {
  id: 'demo-product-1',
  name: 'Smartphone Galaxy Pro',
  description: 'Último modelo com tecnologia avançada, câmera profissional e bateria de longa duração.',
  price: '100.0000000',
  image: '/demo-phone.jpg',
  category: 'Electronics'
};

export const DEMO_MERCHANT = {
  name: 'TechStore Demo',
  publicKey: 'GDGDQR3GOGDYKMNOVOIVF2LYZZXDPPYJSYCZ3VSDIQOZ6FONU5JTF5HE'
};

export const DEMO_CUSTOMER = {
  stellarPublicKey: 'GA57YQCS5NV4TXQPXR6DIKDYTQCMODQ3HNFKJZOULEE7M74SZ6RAIVLA',
  email: 'demo@hackathon.stellar',
  fullName: 'Demo Customer',
  phone: '+55 11 99999-9999',
  documentNumber: '123.456.789-00'
};