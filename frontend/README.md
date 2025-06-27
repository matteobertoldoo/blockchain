# BetZilla Frontend

This is the frontend application for BetZilla, a decentralized sports betting platform built with React, TypeScript, and Web3 technologies.

## Features

- Modern and responsive UI built with Chakra UI
- Web3 integration for wallet connection and contract interaction
- Real-time betting interface
- User profile management
- Transaction history
- Referral system

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MetaMask or another Web3 wallet
- Local Hardhat network running

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/betzilla.git
cd betzilla/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```env
VITE_BETZ_TOKEN_ADDRESS=your_token_address
VITE_BETZILLA_ADDRESS=your_contract_address
VITE_RPC_URL=http://127.0.0.1:8545
VITE_CHAIN_ID=31337
```

## Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

## Building for Production

Build the application:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Testing

Run tests:
```bash
npm test
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Early Bettor Bonus

- The first 20 users to place a bet on each match pay **0% commission** on their winning bets.
- The UI displays a green badge and a slot counter on each match card during the "blind phase".
- In your profile, bets that benefited from the early bonus are highlighted with a special badge.

Example UI:
```jsx
{isBlindPhase && (
  <Badge colorScheme="green">NO COMMISSION FOR FIRST 20 BETTORS</Badge>
)}
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
