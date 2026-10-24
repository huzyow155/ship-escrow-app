export interface ContractDeployment {
  name: string;
  address: `0x${string}`;
  deployTxHash: string;
  sourceSha256: string;
  explorerUrl: string;
}

export interface NetworkConfig {
  name: string;
  chainId: number;
  chainIdHex: string;
  rpcUrl: string;
  explorerBaseUrl: string;
  currency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

export const NETWORK_CONFIG: NetworkConfig = {
  name: 'GenLayer Studionet',
  chainId: 61999,
  chainIdHex: '0xf22f',
  rpcUrl: 'https://studio.genlayer.com/api',
  explorerBaseUrl: 'https://explorer-studio.genlayer.com',
  currency: {
    name: 'GEN',
    symbol: 'GEN',
    decimals: 18,
  },
};

export const SHIP_ESCROW: ContractDeployment = {
  name: 'ShipEscrowV2',
  address: '0x8a9c079a7E1F756e07e8FbE392a5E93106DE28bF',
  deployTxHash: '0xa47ecee0c8108c12baf8a71acfb87ce3aff22ee2aa85d73bfa0e26a67d67d733',
  sourceSha256: 'c00b1366e960882367bf1f3e3c99b975691c28cb29750b7e16a0646e5e353048',
  explorerUrl: 'https://explorer-studio.genlayer.com/address/0x8a9c079a7E1F756e07e8FbE392a5E93106DE28bF',
};

export const SHIP_REPUTATION: ContractDeployment = {
  name: 'ShipReputationV2',
  address: '0x8e6D0356F4Bf987E95eB3cC6e7DF84ce2f708C81',
  deployTxHash: '0x5046e6d602dac897980c852b651aa9ab44fea2a0a7762a7dd34523742f5a3b5c',
  sourceSha256: '12e4c5e9cf8f480823ff778181b6a0d50ae7d37ec7c3a5b079cf6275779d1ed7',
  explorerUrl: 'https://explorer-studio.genlayer.com/address/0x8e6D0356F4Bf987E95eB3cC6e7DF84ce2f708C81',
};
