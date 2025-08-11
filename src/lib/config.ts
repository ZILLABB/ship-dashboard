// Configuration for ShipShift application

export const config = {
  // API Configuration
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  
  // Wallet Configuration
  enableRealWallet: process.env.NEXT_PUBLIC_ENABLE_REAL_WALLET === 'true',
  
  // Development Settings
  mockMode: process.env.NEXT_PUBLIC_MOCK_MODE === 'true',
  
  // Network Configuration
  cardanoNetwork: process.env.NEXT_PUBLIC_CARDANO_NETWORK || 'testnet',
  
  // Exchange Rate API
  exchangeApiUrl: process.env.NEXT_PUBLIC_EXCHANGE_API_URL || 'https://api.coingecko.com/api/v3',
  
  // Development mode check
  isDevelopment: process.env.NODE_ENV === 'development',
  
  // Supported wallets
  supportedWallets: ['nami', 'eternl', 'flint', 'yoroi', 'typhon', 'gero'] as const,
  
  // Default wallet
  defaultWallet: 'nami' as const,
  
  // Currency settings
  defaultCurrency: 'NGN' as const,
  supportedCurrencies: ['ADA', 'USD', 'NGN'] as const,
};

export type SupportedWallet = typeof config.supportedWallets[number];
export type SupportedCurrency = typeof config.supportedCurrencies[number];
