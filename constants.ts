
import { LintRule, Severity } from './types';

export const PRIVACY_RULES: LintRule[] = [
  {
    id: 'ADDRESS_REUSE',
    name: 'Address Reuse Detected',
    description: 'The same wallet address is used across multiple disparate dApp interactions.',
    severity: Severity.HIGH,
    impact: 'Enables deterministic clustering of user activities and identity linking.',
    fix: 'Implement stealth addresses or address rotation using a privacy SDK like Solana Shield.'
  },
  {
    id: 'INTENT_LEAK',
    name: 'Public Intent Leakage',
    description: 'Transaction instruction sequences reveal specific user intentions before finality.',
    severity: Severity.MEDIUM,
    impact: 'Allows MEV searchers and observers to front-run or predict user moves.',
    fix: 'Use instruction obfuscation or bundle instructions via a JITO-like relay.'
  },
  {
    id: 'PLAINTEXT_MEMO',
    name: 'Unencrypted Memo Program Usage',
    description: 'Sensitive metadata is stored in plaintext via the Solana Memo Program.',
    severity: Severity.CRITICAL,
    impact: 'Permanent, public, and searchable exposure of private transaction notes.',
    fix: 'Always encrypt memo data using ECIES or similar schemes before on-chain submission.'
  },
  {
    id: 'FINGERPRINT_CU',
    name: 'Compute Unit Fingerprinting',
    description: 'Unique, high-precision compute unit requests consistently used across sessions.',
    severity: Severity.LOW,
    impact: 'Creates a unique behavioral signature for your dApp interactions.',
    fix: 'Normalize compute unit requests to standard buckets (e.g., 200k, 400k).'
  },
  {
    id: 'METADATA_RPC',
    name: 'Excessive RPC Metadata Polling',
    description: ' dApp polls RPC frequently with predictable headers or patterns.',
    severity: Severity.MEDIUM,
    impact: 'RPC providers can fingerprint users by IP and polling frequency.',
    fix: 'Use a privacy-preserving RPC proxy or implement jittered polling intervals.'
  }
];

export const MOCK_DAPP_ADDRESS = "EPjFW36vS7oxD2fGW92xm388tit57AQwt7WGi1dX3GRn"; // USDC common target
