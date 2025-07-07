# Wallet Guard Service SDK

TypeScript SDK for the Wallet Guard Service API, providing type-safe access to wallet security scanning and user management endpoints.

## Installation

```bash
npm install @scorpius/wallet-guard-service-sdk
```

## Quick Start

```typescript
import { createWalletGuardServiceSDK } from '@scorpius/wallet-guard-service-sdk';

// Create SDK instance
const sdk = createWalletGuardServiceSDK({
  baseURL: 'http://localhost:8080', // Optional, defaults to localhost:8080
  timeout: 30000, // Optional, defaults to 30 seconds
  headers: {
    'Authorization': 'Bearer your-token' // Optional additional headers
  }
});

// Use the endpoints
const healthStatus = await sdk.endpoints.getHealth();
console.log('Service status:', healthStatus.status);

// Scan a wallet for security threats
const scanResult = await sdk.endpoints.postWalletGuardScan({
  walletAddress: '0x742d35Cc6543C00532C2e6B33433b0e5A9b913bE',
  scanType: 'advanced'
});
console.log('Risk score:', scanResult.riskScore);

// Get user information
const user = await sdk.endpoints.getUserById('user-123');
console.log('User:', user.name, user.email);
```

## Available Endpoints

### Health Check
- `getHealth()` - Check service health status

### Wallet Security
- `postWalletGuardScan(request)` - Scan wallet for security threats
  - `walletAddress` (string, required) - Ethereum wallet address
  - `scanType` ('basic' | 'advanced' | 'deep', optional, default: 'basic')

### User Management
- `getUserById(userId)` - Get user details by ID

## Type Safety

All endpoints are fully typed with Zod schemas for runtime validation:

```typescript
import type { 
  WalletGuardScanRequest, 
  WalletGuardScanResponse,
  UserResponse 
} from '@scorpius/wallet-guard-service-sdk';
```

## Error Handling

The SDK automatically handles API errors and provides meaningful error messages:

```typescript
try {
  const result = await sdk.endpoints.getUserById('invalid-id');
} catch (error) {
  console.error('API Error:', error.message);
  // Example: "API Error: 404 - Not Found"
}
```

## Testing

```bash
npm test          # Run tests
npm run test:watch # Run tests in watch mode
npm run test:coverage # Run tests with coverage
```

## Development

```bash
npm run build     # Build the SDK
```

## License

MIT
