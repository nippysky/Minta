export type InvestPlatformKey =
  | "all"
  | "bamboo"
  | "risevest"
  | "chaka"
  | "binance"
  | "cowrywise"
  | "piggyvest";

export type PlatformConnectionStatus = "linked" | "available" | "unlinked";

export type InvestPlatform = {
  key: Exclude<InvestPlatformKey, "all">;
  name: string;
  subtitle: string;
  emoji: string;
  gradientFrom: string;
  gradientTo: string;
  instructions: string[];
  apiLabel: string;
  status: PlatformConnectionStatus;
};

export type InvestAsset = {
  id: string;
  symbol: string;
  name: string;
  emoji: string;
  platform: Exclude<InvestPlatformKey, "all">;
  category: "crypto" | "stocks" | "funds";
  currentPriceUsd: number;
  currentPriceNgn: number;
  changePercent: number;
  quantity: number;
  averagePriceUsd: number;
  totalValueNgn: number;
  totalValueUsd: number;
  profitLossNgn: number;
  activity: {
    id: string;
    type: "buy" | "sell";
    label: string;
    date: string;
    amountNgn: number;
  }[];
};

export type AllocationSlice = {
  label: string;
  value: number;
  color: string;
};

export type PerformancePeriod = "1W" | "1M" | "3M" | "1Y" | "All";

export type PerformancePoint = {
  x: string;
  y: number;
};

export type PortfolioStats = {
  totalValueNgn: number;
  totalValueUsd: number;
  totalReturnsNgn: number;
  totalReturnsPercent: number;
  diversificationScore: number;
};

export type TradeMode = "buy" | "sell";