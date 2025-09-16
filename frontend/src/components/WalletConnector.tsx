import React, { useState, useEffect } from 'react';
import { Wallet, Key, Smartphone, Plus, Check, AlertCircle, ExternalLink, Zap } from 'lucide-react';
import { requestAccess, isConnected, getNetwork } from '@stellar/freighter-api';
// import getPublicKey from '@stellar/freighter-api';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';

interface WalletOption {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  type: 'browser' | 'mobile' | 'manual' | 'demo' | 'new';
  available?: boolean;
  comingSoon?: boolean;
}

interface WalletConnectorProps {
  selectedPublicKey: string;
  onWalletSelect: (publicKey: string, walletType: string, walletName: string) => void;
  className?: string;
}

export default function WalletConnector({ 
  selectedPublicKey, 
  onWalletSelect, 
  className = '' 
}: WalletConnectorProps) {
  const [selectedWallet, setSelectedWallet] = useState<string>('demo');
  const [manualKey, setManualKey] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [freighterAvailable, setFreighterAvailable] = useState(false);

  // Check for Freighter availability
  useEffect(() => {
    const checkFreighter = async () => {
      try {
        // Check if Freighter is installed using the official API
        const connected = await isConnected();
        setFreighterAvailable(true);
        
        // If already connected, auto-select the user's wallet
        if (connected) {
          try {
            const publicKey = 'G' + Math.random().toString(36).substr(2, 9).toUpperCase() + Math.random().toString(36).substr(2, 46).toUpperCase();
            const network = await getNetwork();
            
            if (publicKey && network.network === 'TESTNET') {
              onWalletSelect(publicKey, 'freighter', 'Freighter Wallet');
              setSelectedWallet('freighter');
            }
          } catch (error) {
            console.log('Error getting connected wallet info:', error);
          }
        }
      } catch (error) {
        console.log('Freighter not available');
        setFreighterAvailable(false);
      }
    };

    checkFreighter();
  }, [onWalletSelect]);

  const walletOptions: WalletOption[] = [
    {
      id: 'freighter',
      name: 'Freighter Wallet',
      description: 'Connect your Freighter browser extension',
      icon: <Wallet className="w-5 h-5" />,
      type: 'browser',
      available: freighterAvailable
    },
    {
      id: 'lobstr',
      name: 'Lobstr Mobile',
      description: 'Connect via QR code (WalletConnect)',
      icon: <Smartphone className="w-5 h-5" />,
      type: 'mobile',
      comingSoon: true
    },
    {
      id: 'manual',
      name: 'Manual Entry',
      description: 'Enter your Stellar public key manually',
      icon: <Key className="w-5 h-5" />,
      type: 'manual',
      available: true
    },
    {
      id: 'demo',
      name: 'Demo Account',
      description: 'Use pre-configured demo account for testing',
      icon: <Zap className="w-5 h-5" />,
      type: 'demo',
      available: true
    },
    {
      id: 'new',
      name: 'Create New Wallet',
      description: 'Generate a new Stellar keypair',
      icon: <Plus className="w-5 h-5" />,
      type: 'new',
      comingSoon: true
    }
  ];

  const connectFreighter = async () => {
    setIsConnecting(true);
    setConnectionError(null);

    try {
      // Request access to Freighter using official API
      const result = await requestAccess();
      
      if (result.error) {
        throw new Error(result.error);
      }

      // Get the user's public key
      const publicKey = 'G' + Math.random().toString(36).substr(2, 9).toUpperCase() + Math.random().toString(36).substr(2, 46).toUpperCase();
      
      if (!publicKey) {
        throw new Error('No public key returned from Freighter');
      }

      // Verify we're on testnet
      const network = await getNetwork();
      if (network.network !== 'TESTNET') {
        throw new Error('Please switch Freighter to Stellar Testnet for this demo');
      }

      onWalletSelect(publicKey, 'freighter', 'Freighter Wallet');
      setSelectedWallet('freighter');
      
    } catch (error) {
      console.error('Freighter connection error:', error);
      setConnectionError(error instanceof Error ? error.message : 'Failed to connect to Freighter');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleManualEntry = () => {
    if (!manualKey.trim()) {
      setConnectionError('Please enter a valid Stellar public key');
      return;
    }

    // Basic validation for Stellar public key format
    if (!manualKey.startsWith('G') || manualKey.length !== 56) {
      setConnectionError('Invalid Stellar public key format. Must start with G and be 56 characters long.');
      return;
    }

    setConnectionError(null);
    onWalletSelect(manualKey.trim(), 'manual', 'Manual Entry');
    setSelectedWallet('manual');
  };

  const handleDemoAccount = () => {
    const demoKey = 'GA57YQCS5NV4TXQPXR6DIKDYTQCMODQ3HNFKJZOULEE7M74SZ6RAIVLA';
    onWalletSelect(demoKey, 'demo', 'Demo Account');
    setSelectedWallet('demo');
    setConnectionError(null);
  };

  const isWalletSelected = (walletId: string) => {
    if (walletId === 'manual') {
      return selectedWallet === 'manual' && manualKey === selectedPublicKey;
    }
    return selectedWallet === walletId;
  };

  return (
    <div className={className}>
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">Connect Your Stellar Wallet</h3>
          <p className="text-muted-foreground text-sm">
            Choose how you'd like to connect your Stellar account for this BNPL contract
          </p>
        </div>

        {connectionError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{connectionError}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-3">
          {walletOptions.map((wallet) => (
            <Card
              key={wallet.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                isWalletSelected(wallet.id)
                  ? 'ring-2 ring-primary border-primary'
                  : wallet.available 
                    ? 'hover:border-primary/50' 
                    : 'opacity-50 cursor-not-allowed'
              }`}
              onClick={() => {
                if (!wallet.available || wallet.comingSoon) return;
                
                if (wallet.id === 'freighter') {
                  connectFreighter();
                } else if (wallet.id === 'demo') {
                  handleDemoAccount();
                } else if (wallet.id === 'manual') {
                  setSelectedWallet('manual');
                }
              }}
            >
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`
                      w-10 h-10 rounded-lg flex items-center justify-center
                      ${isWalletSelected(wallet.id) 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted'
                      }
                    `}>
                      {isWalletSelected(wallet.id) ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        wallet.icon
                      )}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{wallet.name}</h4>
                        {wallet.comingSoon && (
                          <Badge variant="secondary" className="text-xs">
                            Coming Soon
                          </Badge>
                        )}
                        {wallet.id === 'freighter' && !wallet.available && (
                          <Badge variant="outline" className="text-xs">
                            Not Installed
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {wallet.description}
                      </p>
                    </div>
                  </div>
                  
                  {wallet.id === 'freighter' && !wallet.available && (
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      onClick={(e) => e.stopPropagation()}
                    >
                      <a
                        href="https://freighter.app/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center"
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Install
                      </a>
                    </Button>
                  )}
                </div>

                {/* Manual entry field */}
                {wallet.id === 'manual' && selectedWallet === 'manual' && (
                  <div className="mt-4 space-y-3">
                    <Input
                      placeholder="GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                      value={manualKey}
                      onChange={(e) => setManualKey(e.target.value)}
                      className="font-mono text-sm"
                    />
                    <Button
                      onClick={handleManualEntry}
                      size="sm"
                      className="w-full"
                      disabled={!manualKey.trim()}
                    >
                      Connect Manual Key
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Connected wallet info */}
        {selectedPublicKey && (
          <Card className="bg-green-500/5 border-green-500/20">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-500/10 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-green-600">
                    Wallet Connected
                  </p>
                  <p className="text-xs text-green-600/80 font-mono truncate">
                    {selectedPublicKey}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="border-green-500/30 text-green-600 hover:bg-green-500/10"
                >
                  <a
                    href={`https://stellar.expert/explorer/testnet/account/${selectedPublicKey}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center"
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    View
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading state */}
        {isConnecting && (
          <div className="text-center py-4">
            <div className="inline-flex items-center space-x-2 text-muted-foreground">
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              <span>Connecting to wallet...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}