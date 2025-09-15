import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Star, Shield, Zap, CreditCard, ArrowRight } from 'lucide-react';
import { useBNPL } from '../hooks/useBNPL';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import Logo from '../components/Logo';
import { DEMO_PRODUCT } from '../types';

export function CheckoutPage() {
  const { state, actions } = useBNPL();
  const navigate = useNavigate();
  const product = state.product || DEMO_PRODUCT;
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const productImages = [
    '/samsung-s25-ultra-main.jpg',
    '/samsung-s25-ultra-front-back.jpg',
    '/samsung-s25-ultra-details.jpg',
    '/samsung-s25-ultra-angle1.jpg',
    '/samsung-s25-ultra-angle2.jpg'
  ];

  const handleBNPLClick = () => {
    actions.setProduct(product);
    actions.setStep('quotation');
    navigate('/quotation');
  };

  const features = [
    {
      icon: Shield,
      title: 'Safe & Reliable',
      description: 'Transactions protected by Stellar blockchain'
    },
    {
      icon: Zap,
      title: 'Instant Approval', 
      description: 'No paperwork, approval in seconds'
    },
    {
      icon: Star,
      title: 'Zero Interest',
      description: 'Split into up to 4 interest-free installments'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Modern Header */}
      <header className="border-b border-border/40 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Logo size="md" />
              
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon">
                <ShoppingCart className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 lg:items-start">
          {/* Product Showcase */}
          <div className="space-y-6">
            {/* Main Product Image */}
            <Card className="overflow-hidden">
              <div className="aspect-square relative bg-gradient-to-br from-muted/20 to-muted/5">
                <div className="absolute top-4 right-4 z-10">
                  <Badge variant="secondary">Trending</Badge>
                </div>
                <img 
                  src={productImages[selectedImageIndex]} 
                  alt={product.name}
                  className="w-full h-full object-contain p-8"
                />
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="bg-background/80 backdrop-blur-sm rounded-lg p-3">
                    <p className="text-foreground font-medium text-sm">{product.name}</p>
                    <p className="text-muted-foreground text-xs">Titanium Black - 256GB</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Thumbnail Gallery */}
            <div className="grid grid-cols-5 gap-3">
              {productImages.map((image, index) => (
                <Card 
                  key={index} 
                  className={`aspect-square overflow-hidden cursor-pointer transition-all ${
                    selectedImageIndex === index 
                      ? 'ring-2 ring-primary border-primary' 
                      : 'hover:ring-2 hover:ring-primary/20 border-border'
                  }`}
                  onClick={() => setSelectedImageIndex(index)}
                >
                  <img 
                    src={image} 
                    alt={`${product.name} - Image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </Card>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="mt-10 lg:mt-0 space-y-8">
            {/* Header */}
            <div className="space-y-4">
              <div>
                <h1 className="text-4xl font-bold tracking-tight text-foreground">
                  {product.name}
                </h1>
                <p className="text-lg text-muted-foreground mt-2">
                  256GB, 12GB RAM, Quad Camera 200MP, 6.9" Display, Titanium Black
                </p>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-baseline space-x-2">
                  <span className="text-4xl font-bold text-foreground">
                    {parseFloat(product.price).toFixed(0)}
                  </span>
                  <span className="text-xl font-medium text-primary">XLM</span>
                </div>
                <Badge variant="outline" className="text-muted-foreground">
                  ≈ $3,000 USD
                </Badge>
              </div>

              {/* Rating */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center">
                  {[0, 1, 2, 3, 4].map((rating) => (
                    <Star
                      key={rating}
                      className="w-5 h-5 fill-primary text-primary"
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">5.0 (256 reviews)</span>
              </div>
            </div>

            {/* Product Description */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <p className="text-muted-foreground leading-relaxed">
                    {product.description}
                  </p>
                  
                  {/* Technical Specifications */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">Specifications</h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>• Display: 6.9" Dynamic AMOLED 2X</li>
                        <li>• Storage: 256GB</li>
                        <li>• RAM: 12GB</li>
                        <li>• Connectivity: 5G</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">Cameras</h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>• Main: 200MP</li>
                        <li>• Ultra-wide: 50MP</li>
                        <li>• Telephoto: 10MP + 50MP</li>
                        <li>• Front: 12MP</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Options */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Choose Payment Method</h3>
              
              {/* Traditional Payment */}
              <Button
                variant="outline"
                size="lg"
                className="w-full justify-between h-14"
                disabled
              >
                <div className="flex items-center">
                  <CreditCard className="w-5 h-5 mr-3" />
                  <span>Pay Full Amount</span>
                </div>
                <span className="font-semibold">{parseFloat(product.price).toFixed(0)} XLM</span>
              </Button>

              {/* BNPL Payment */}
              <Button
                size="lg"
                className="w-full justify-between h-14 bg-primary hover:bg-primary/90 text-primary-foreground relative overflow-hidden group"
                onClick={handleBNPLClick}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/90 to-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-center relative z-10">
                  <Zap className="w-5 h-5 mr-3" />
                  <span className="font-semibold">Pay with SyloPay</span>
                </div>
                <ArrowRight className="w-5 h-5 relative z-10" />
              </Button>

              <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
                <span>Split in up to 4x</span>
                <span>•</span>
                <span>0% interest</span>
                <span>•</span>
                <span>Instant approval</span>
              </div>
            </div>

            {/* Features */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Why Choose SyloPay BNPL?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <feature.icon className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {feature.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;