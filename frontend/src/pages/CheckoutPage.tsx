import React from 'react';
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
    <div className="min-h-screen bg-background">
      {/* Modern Header */}
      <header className="border-b border-border/40 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Logo size="md" />
              <h1 className="text-xl font-bold text-foreground">SyloPay Store</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="hidden sm:flex">
                Demo Mode
              </Badge>
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
              <div className="aspect-square bg-gradient-to-br from-primary/10 via-accent/5 to-primary/5 flex items-center justify-center relative">
                <div className="absolute top-4 right-4">
                  <Badge variant="secondary">Trending</Badge>
                </div>
                <div className="text-center">
                  <div className="w-32 h-32 bg-card rounded-2xl shadow-xl mx-auto mb-6 flex items-center justify-center border border-border/50">
                    <span className="text-primary font-bold text-4xl">📱</span>
                  </div>
                  <p className="text-muted-foreground font-medium">{product.name}</p>
                </div>
              </div>
            </Card>

            {/* Thumbnail Gallery */}
            <div className="grid grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="aspect-square overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all">
                  <div className="w-full h-full bg-gradient-to-br from-muted/50 to-muted/20 flex items-center justify-center">
                    <span className="text-muted-foreground text-xs font-medium">IMG {i}</span>
                  </div>
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
                  Premium smartphone with cutting-edge technology
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
                  ≈ $25.00 USD
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
                <p className="text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
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
                  <span className="font-semibold">Pay with SyloPay BNPL</span>
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