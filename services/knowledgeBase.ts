
export const PRIVACY_KNOWLEDGE_BASE: Record<string, { text: string, link: string }> = {
  'ADDRESS_REUSE': {
    text: "Address reuse is a fundamental privacy leak on Solana. Every transaction is public, allowing observers to link your DeFi swaps to your NFT purchases. Use a 'Burner' architecture or stealth addresses to decouple your on-chain identity.",
    link: "https://solana.com/docs/core/accounts#address-derivation"
  },
  'PLAINTEXT_MEMO': {
    text: "The SPL Memo program is a public bulletin board. Any string stored there is permanent and searchable. Always use ECIES (Elliptic Curve Integrated Encryption Scheme) to wrap your memo data before submission.",
    link: "https://spl.solana.com/memo"
  },
  'INTENT_LEAK': {
    text: "MEV bots scan the mempool for instruction patterns. If you swap then immediately stake, bots can front-run your transaction. Use Jito Bundles or private RPC endpoints to hide your transaction intent until it is finalized.",
    link: "https://www.jito.network/docs/bundle-overview/"
  },
  'FINGERPRINT_CU': {
    text: "Requesting a hyper-specific amount of Compute Units (e.g. 192,341) acts as a unique digital fingerprint. Standardize your CU requests to rounded buckets like 200k or 400k to blend in with common network traffic.",
    link: "https://solana.com/docs/core/fees#compute-budget"
  },
  'METADATA_RPC': {
    text: "RPC providers see your IP address and user-agent for every call. If your dApp polls every 500ms, your session is easily fingerprinted. Implement jittered polling and use privacy-preserving proxies like Tor or specialized RPC gateways.",
    link: "https://solana.com/docs/rpc"
  }
};
