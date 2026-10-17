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
  name: 'ShipEscrow',
  address: '0x8DC94110Ed3E111Fb74Dce849CdBA8f567E6024F',
  deployTxHash: '0x0dcfc833e0379f1259cfcdad6ca1a77c0783ba8a2eeb461e32c314a7086c16c3',
  sourceSha256: '2de0496eea2d940dd1985dcfa8e766abf0fbb56d36220297ddc6683b5f118b54',
  explorerUrl: 'https://explorer-studio.genlayer.com/address/0x8DC94110Ed3E111Fb74Dce849CdBA8f567E6024F',
};

export const SHIP_REPUTATION: ContractDeployment = {
  name: 'ShipReputation',
  address: '0x55c56f0dfFb8227345814A37c68394b05c26E901',
  deployTxHash: '0xca13e68ba0743939041b61985062b39fa95ef54c9134c5d47c65441dc03b1602',
  sourceSha256: '6dc14ae2714d93cae2fe152112ca0f9ff69fa58284f25b77ea02fa9db647381e',
  explorerUrl: 'https://explorer-studio.genlayer.com/address/0x55c56f0dfFb8227345814A37c68394b05c26E901',
};
