# 🛡️ Hedge Anything

**A sophisticated financial tool for hedging everyday expense volatility using Polymarket prediction markets.**

Transform unpredictable costs into manageable risks with precise hedging calculations, Monte Carlo simulations, and risk-optimized strategies.

## Features

- **Precise Hedging Calculator** - Calculate exact Polymarket positions for expense protection
- **Monte Carlo Risk Engine** - 5,000+ simulation runs with comprehensive risk metrics  
- **Intelligent Optimization** - AI-powered hedge ratio optimization for maximum downside protection
- **Advanced Analytics** - VaR, volatility reduction, Sharpe ratios, and comparative analysis
- **Educational Framework** - Learn proper hedging mindset (insurance vs speculation)

## Quick Start

```bash
# Install and run locally
npm install
npm run dev
# Open http://localhost:3000

# Test
npm test

# Build for production
npm run build
```

## 🚀 Deployment

This app is configured for **AWS Amplify** hosting with automatic deployments on every GitHub push.

### Deployment Pipeline

- **Platform**: AWS Amplify (static hosting)
- **Build**: Automatic via `amplify.yml` configuration
- **Auto-deploy**: ✅ Enabled on `main` branch pushes

### Local Static Build

```bash
# Generate static files (same as Amplify build)
npm run build

# Output directory: out/
# Contains: index.html, _next/, static assets
```

## How It Works

1. **Configure Your Scenario** - Enter baseline vs adverse expense amounts
2. **Set Market Parameters** - Input Polymarket YES price and desired hedge coverage
3. **Analyze Risk Profile** - View Monte Carlo simulations and optimization results
4. **Execute Strategy** - Get precise share calculations and Polymarket deep-links

## Example Use Case

**Gas Price Hedging**: Normally spend $150/month, but could spend $300 if oil spikes. Use Polymarket contract "Oil >$80 by Dec 2024" at 25¢ to hedge 80% of the $150 additional risk over 12 months.

**Result**: Buy ~121 shares for ~$30 premium, reducing worst-case from -$300 to -$208/month.

## Technology Stack

- **Next.js 15** with TypeScript and App Router
- **Tailwind CSS** for styling
- **Recharts** for visualizations
- **React Hook Form** with Zod validation
- **Vitest** for comprehensive testing
- **AWS Amplify** for hosting and CI/CD

## Architecture & Optimization

### Performance Features

- **Static Export**: Full client-side rendering for maximum performance
- **Tree Shaking**: Optimized bundle splitting (~121KB total JS)
- **TypeScript**: Full type safety across calculation engine
- **Monte Carlo Engine**: Efficient simulation algorithms with statistical analysis

### Risk Calculation Engine

- **Hedging Mathematics**: Precise share calculations with fee modeling
- **Statistical Analysis**: VaR, Sharpe ratios, volatility metrics
- **Optimization Algorithms**: Multi-objective risk minimization

  - Risk-optimized hedge ratios (70% downside protection, 20% volatility, 10% drawdown)

- **Scenario Modeling**: 5,000+ Monte Carlo simulations per analysis

## Contributing

```bash
# Development setup
git clone <repository-url>
cd hedge-anything
npm install

# Run tests
npm test

# Start development server  
npm run dev
```

## Mathematical Foundation

Uses modern portfolio theory with behavioral finance insights:

- Risk-optimized hedge ratios (70% downside protection, 20% volatility, 10% drawdown)
- Bernoulli trial modeling for event probabilities  
- Linear interpolation for precise percentile calculations

## Development

```bash
# Development setup
git clone <repository-url>
cd hedge-anything
npm install

# Run tests
npm test

# Start development server  
npm run dev
```

## License

MIT License - Built with ❤️ for the DeFi community.

---

**⚠️ Disclaimer**: This tool is for educational purposes. Polymarket involves financial risk. Past performance doesn't predict future results. Always consult financial advisors for investment decisions.
