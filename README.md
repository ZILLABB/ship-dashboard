# ShipShift - Cardano-Powered Decentralized Delivery Platform

ShipShift is a modern, decentralized delivery and colony management platform built on the Cardano blockchain. It enables users to organize into "colonies" for efficient package transport and storage with blockchain-verified transactions and smart contract automation.

## 🚀 Features

### Core Platform Features
- **Colony Management**: Create and manage homogeneous or heterogeneous delivery colonies
- **Member Management**: Onboard members with role-based permissions and KYC verification
- **Delivery Operations**: Create, track, and manage shipments with real-time status updates
- **Collabo Chains**: Build complex multi-step delivery sequences with drag-and-drop interface
- **Analytics & Reporting**: Comprehensive performance metrics and financial analytics
- **Wallet Integration**: Seamless Cardano wallet connection using Lucid library

### Technical Features
- **Next.js 15** with App Router and TypeScript
- **TailwindCSS v4** with custom design system
- **Responsive Design** supporting mobile, tablet, and desktop
- **Real-time Updates** with optimistic UI patterns
- **State Management** using Zustand with persistence
- **Form Handling** with custom validation hooks
- **Component Library** with reusable UI components
- **Mock Data Integration** for development and testing

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with TypeScript
- **Styling**: TailwindCSS v4 with custom design tokens
- **State Management**: Zustand with persistence
- **UI Components**: Custom component library with Radix UI primitives
- **Icons**: Lucide React
- **Blockchain**: Cardano integration ready (Lucid library)
- **Forms**: Custom form hooks with validation
- **Charts**: Recharts (ready for integration)

## 📦 Installation

### Prerequisites
- Node.js 18+
- npm or yarn
- Git

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd shipshift-newfrontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Dashboard (home page)
│   ├── colonies/          # Colony management pages
│   ├── deliveries/        # Delivery operations pages
│   ├── members/           # Member management pages
│   ├── analytics/         # Analytics and reporting pages
│   └── globals.css        # Global styles and design tokens
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── layout/           # Layout components (sidebar, header)
│   ├── dashboard/        # Dashboard-specific components
│   └── ...               # Feature-specific components
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions and configurations
├── stores/               # Zustand state management
├── types/                # TypeScript type definitions
├── data/                 # Mock data and API interfaces
└── utils/                # Helper functions
```

## 🎨 Design System

### Color Palette
- **Primary**: ShipShift Blue (#1e40af)
- **Secondary**: Muted grays for backgrounds
- **Success**: Green (#059669)
- **Warning**: Orange (#ea580c)
- **Error**: Red (#ef4444)

### Typography
- **Font Family**: Inter (primary), JetBrains Mono (code)
- **Scale**: Responsive typography with proper line heights

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Mock Data

The application includes comprehensive mock data for development:
- **Users**: Sample user profiles with roles and permissions
- **Colonies**: Different colony types with financial data
- **Shipments**: Various delivery statuses and locations
- **Analytics**: Performance metrics and trends

## 🔗 Blockchain Integration

### Cardano Wallet Connection
The platform is prepared for Cardano wallet integration:

```tsx
// Wallet connection hook
const { wallet, connect, disconnect, signTransaction } = useWallet();

// Transaction signing
const txHash = await signTransaction(transactionData);
```

## 📱 Responsive Design

The application is fully responsive with breakpoints:
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## 🚀 Deployment

### Build for Production
```bash
npm run build
npm run start
```

## 🗺️ Roadmap

### Phase 1 (Current)
- [x] Core UI components and layout
- [x] Dashboard with KPI cards and activity feed
- [x] Colony and delivery management interfaces
- [x] Member management system
- [x] Analytics and reporting pages

### Phase 2 (Next)
- [ ] Cardano wallet integration
- [ ] Smart contract interactions
- [ ] Real-time notifications
- [ ] Advanced filtering and search
- [ ] Collabo chains drag-and-drop builder

---

Built with ❤️ for the Cardano ecosystem
