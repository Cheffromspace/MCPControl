import { AutomationProvider } from '../interfaces/provider.js';
import { KeysenderProvider } from './keysender/index.js';

// Conditionally import NutJSProvider
// This allows builds without NutJS dependency
interface NutJSProviderConstructor {
  new(): AutomationProvider;
}

let NutJSProvider: NutJSProviderConstructor | null = null;

// Initialize NutJS provider with an IIFE
(function initNutJSProvider() {
  import('./nutjs/index.js')
    .then(nutjsModule => {
      NutJSProvider = nutjsModule.NutJSProvider;
    })
    .catch(_ => {
      // NutJS provider not available - this is expected in some environments
      console.log('NutJS provider not available');
    });
})();

// Cache to store provider instances
const providerCache: Record<string, AutomationProvider> = {};

/**
 * Determine the best provider to use
 * @returns Provider type string ('nutjs' if available, otherwise 'keysender')
 */
function getDefaultProvider(): string {
  // Use NutJS if available, regardless of platform
  if (NutJSProvider) {
    return 'nutjs';
  }
  
  // Fall back to keysender if NutJS is not available
  return 'keysender';
}

/**
 * Create an automation provider instance based on the specified type
 * Uses a caching mechanism to avoid creating multiple instances of the same provider
 */
export function createAutomationProvider(type?: string): AutomationProvider {
  // If no type specified, use default provider
  const providerType = (type || getDefaultProvider()).toLowerCase();
  
  // Return cached instance if available
  if (providerCache[providerType]) {
    console.log(`Using cached provider instance: ${providerType}`);
    return providerCache[providerType];
  }
  
  console.log(`Creating new provider instance: ${providerType}`);
  
  let provider: AutomationProvider;
  switch (providerType) {
    case 'nutjs':
      if (!NutJSProvider) {
        throw new Error('NutJS provider is not available in this build');
      }
      provider = new NutJSProvider();
      break;
    case 'keysender':
      provider = new KeysenderProvider();
      break;
    default:
      throw new Error(`Unknown provider type: ${providerType}`);
  }
  
  // Cache the instance
  providerCache[providerType] = provider;
  return provider;
}