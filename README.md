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
# Install and run
npm install
npm run dev
# Open http://localhost:3000

# Test
npm test

# Build
npm run build
```

## How It Works

1. **Configure Your Scenario** - Enter baseline vs adverse expense amounts
2. **Set Market Parameters** - Input Polymarket YES price and desired hedge coverage
3. **Analyze Risk Profile** - View Monte Carlo simulations and optimization results
4. **Execute Strategy** - Get precise share calculations and Polymarket deep-links

## Example Use Case

**Gas Price Hedging**: Normally spend $150/month, but could spend $300 if oil spikes. Use Polymarket contract "Oil >$80 by Dec 2024" at 25¢ to hedge 80% of the $150 additional risk over 12 months.

**Result**: Buy ~121 shares for ~$30 premium, reducing worst-case from -$300 to -$208/month.

## Technology

- **Next.js 15** with TypeScript and App Router
- **Tailwind CSS** for styling
- **Recharts** for visualizations
- **React Hook Form** with Zod validation
- **Vitest** for comprehensive testing

## Mathematical Foundation

Uses modern portfolio theory with behavioral finance insights:
- Risk-optimized hedge ratios (70% downside protection, 20% volatility, 10% drawdown)
- Bernoulli trial modeling for event probabilities
- Linear interpolation for precise percentile calculations

## Deployment

Optimized for Vercel deployment. Push to GitHub and connect to Vercel for automatic deployment.

## Contributing

1. Fork the repo
2. Create feature branch
3. Add tests for new functionality
4. Ensure `npm test` passes
5. Submit pull request

## License

MIT License - Built with ❤️ for the DeFi community.
