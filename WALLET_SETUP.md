# 🚀 ShipShift Wallet & Backend Setup

## 🎯 Current Status: **REAL WALLET READY**

Your ShipShift application is now configured to use **REAL Cardano wallets** and **REAL backend APIs**!

## 🔧 Configuration

### Environment Variables (`.env.local`)

```bash
# Backend API - UPDATE THIS TO YOUR BACKEND URL
NEXT_PUBLIC_API_URL=http://localhost:8080

# Wallet Configuration
NEXT_PUBLIC_ENABLE_REAL_WALLET=true

# Development Settings
NEXT_PUBLIC_MOCK_MODE=false

# Network Configuration
NEXT_PUBLIC_CARDANO_NETWORK=testnet
```

## 🏃‍♂️ Quick Start

### 1. **Update Backend URL**

Edit `.env.local` and set your backend URL:

```bash
NEXT_PUBLIC_API_URL=https://your-backend-api.com
```

### 2. **Install Cardano Wallet**

- Install [Nami Wallet](https://namiwallet.io/) (recommended)
- Or [Eternl](https://eternl.io/), [Flint](https://flint-wallet.com/), etc.

### 3. **Run the Application**

```bash
npm run dev
```

### 4. **Test the Flow**

1. Visit `http://localhost:3000/auth`
2. Click "Create Account" or "Sign In"
3. Connect your real Cardano wallet
4. Create a colony with real wallet integration!

## 🎭 Mock vs Real Mode

### **Real Mode (Current)**

- ✅ Real Cardano wallet connection
- ✅ Real backend API calls
- ✅ Real ADA/Naira exchange rates
- ✅ Real transaction signing

### **Mock Mode (Fallback)**

To enable mock mode for testing:

```bash
# In .env.local
NEXT_PUBLIC_MOCK_MODE=true
NEXT_PUBLIC_ENABLE_REAL_WALLET=false
```

## 🔗 Backend API Integration

**✅ INTEGRATED WITH YOUR ACTUAL BACKEND!**

The frontend now uses your actual backend structure:

### **API Endpoints Used:**

- **Development**: `http://127.0.0.1:8034/api` (Mac)
- **Production**: `https://msg.shipshift.io/api`

### **Colony Creation Flow:**

```json
POST /colony/create
{
  "type": "icp",
  "colonyInfo": {
    "icpColonyParams": {
      "cpCreators": ["addr1..."],
      "cpMinActiveSignatory": 1,
      "cpColonyOf": ["ReserveOperator", "DispatchOperator"],
      "cpTxOutRef": "tx123#0"
    },
    "icpMinCollateral": [
      ["RequesterType", {"ADA.lovelace": 10}]
    ],
    "icpCommission": {
      "cpPercent": 5,
      "cpAddress": "addr1..."
    }
  }
}
```

### **Multisig Support:**

- ✅ **HandleMultisig** class integrated
- ✅ **PendingTxWitnessesDB** for witness management
- ✅ **Multi-signature transaction flow**
- ✅ **Automatic submission when all signatures collected**

### **Transaction Services:**

- ✅ **CardanoTransactionService** for transaction building
- ✅ **Real wallet signing** with your wallet integration
- ✅ **TxOutRef generation** from actual UTXOs

## 🌍 Supported Wallets

- **Nami** (Primary)
- **Eternl**
- **Flint**
- **Yoroi**
- **Typhon**
- **Gero**

## 💰 Currency Features

- **Real-time ADA/Naira conversion** using CoinGecko API
- **Nigerian Naira formatting** (₦)
- **Live exchange rates**

## 🚨 Troubleshooting

### Wallet Not Connecting?

1. Ensure wallet extension is installed
2. Check if wallet is unlocked
3. Try refreshing the page

### Backend API Errors?

1. Verify `NEXT_PUBLIC_API_URL` in `.env.local`
2. Ensure backend is running
3. Check CORS settings on backend

### Exchange Rate Issues?

- App falls back to cached rates if CoinGecko API fails
- Check internet connection

## 🎉 You're Ready!

Your application now supports:

- ✅ Real Cardano wallet integration
- ✅ Real backend API calls
- ✅ Real-time currency conversion
- ✅ Production-ready transaction flow

**Next Steps:**

1. Update your backend URL
2. Test with your real wallet
3. Deploy to production!
