# Ship Escrow DApp

Web app (Preview): https://ship-escrow-app.vercel.app  
Contract repository: https://github.com/hypercybers99/ship-escrow-genlayer  
Fixtures repository: https://github.com/hypercybers99/ship-escrow-fixtures  

![Ship Escrow Customs Manifest Preview](docs/design/after/landing_1440px_light.png)

Web app for GitHub PR bounties on GenLayer Studionet (Preview). Credits are tracked in a contract ledger; no tokens are locked.

Contracts deployed on **GenLayer Studionet Preview**:
- **ShipEscrowV2**: [`0x8a9c079a7E1F756e07e8FbE392a5E93106DE28bF`](https://explorer-studio.genlayer.com/address/0x8a9c079a7E1F756e07e8FbE392a5E93106DE28bF)
- **ShipReputationV2**: [`0x8e6D0356F4Bf987E95eB3cC6e7DF84ce2f708C81`](https://explorer-studio.genlayer.com/address/0x8e6D0356F4Bf987E95eB3cC6e7DF84ce2f708C81)
- **Contract Repository (Tag se-v2-4)**: [hypercybers99/ship-escrow-genlayer](https://github.com/hypercybers99/ship-escrow-genlayer/tree/se-v2-4)
- **Fixtures Repository**: [hypercybers99/ship-escrow-fixtures](https://github.com/hypercybers99/ship-escrow-fixtures)

---

## Architecture & Visual Identity

Ship Escrow uses a "bounty manifest" and invoice docket visual aesthetic:
- Distinct maritime manifest layout with high-contrast stamps for verdicts (`RELEASE_100`, `RELEASE_75`, `RELEASE_50`, `RELEASE_25`, `REVIEW`, `REFUND`).
- Full dark and light theme support.
- Zero-wallet read support with zero console errors.
- axe: 0 serious or critical violations on 7 routes (automated check only).
- Compact word budget: Landing page at most 160 words, each application view at most 40 words.

---

## Getting Started

### Prerequisites
- Node.js >= 18
- npm

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

### Running Tests
```bash
npm test
```
The test suite validates:
1. Exact SHA-256 integrity of reference contracts against deployed source hashes.
2. Complete catalog mapping of all UserError raises in Python contracts.
3. Pure TypeScript criteria hash computation against on-chain view output.
4. 5,000-case fuzz verification of the `decide()` scoring function against an independent oracle.

### End-to-end script
Run the automated end-to-end flow using throwaway accounts on Studionet:
```bash
node scripts/e2e.mjs
```

### Manual Verification
Follow the 8-step manual testing guide in [MANUAL_METAMASK_TEST.md](MANUAL_METAMASK_TEST.md).

---

## License

MIT License - Copyright (c) 2026 Hyper (hypercybers99).
