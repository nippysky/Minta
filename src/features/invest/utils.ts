import type {
  AllocationSlice,
  InvestAsset,
  InvestPlatform,
  InvestPlatformKey,
} from "@/src/features/invest/types";

export function formatCurrencyNgn(value: number) {
  return `₦${Math.round(value).toLocaleString("en-NG")}`;
}

export function formatCurrencyUsd(value: number) {
  return `$${Number(value).toLocaleString("en-US", {
    maximumFractionDigits: 2,
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
  })}`;
}

export function formatHiddenMoney() {
  return "• • • • • •";
}

export function maskCurrencyNgn(visible: boolean, value: number) {
  return visible ? formatCurrencyNgn(value) : formatHiddenMoney();
}

export function maskCurrencyUsd(visible: boolean, value: number) {
  return visible ? formatCurrencyUsd(value) : formatHiddenMoney();
}

export function percentText(value: number) {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(value % 1 === 0 ? 1 : 2)}%`;
}

export function getFilteredAssets(
  assets: InvestAsset[],
  filter: InvestPlatformKey
) {
  if (filter === "all") return assets;
  return assets.filter((asset) => asset.platform === filter);
}

export function getPlatformByKey(
  platforms: InvestPlatform[],
  key: Exclude<InvestPlatformKey, "all">
) {
  return platforms.find((platform) => platform.key === key) ?? null;
}

export function allocationTotal(items: AllocationSlice[]) {
  return items.reduce((sum, item) => sum + item.value, 0);
}

export function allocationPercent(value: number, total: number) {
  if (total <= 0) return 0;
  return (value / total) * 100;
}

export function amountInputToNumber(value: string) {
  const digits = value.replace(/[^\d.]/g, "");
  if (!digits) return 0;
  return Number(digits);
}

export function formatAmountInput(value: string) {
  const digits = value.replace(/[^\d]/g, "");
  if (!digits) return "";
  return Number(digits).toLocaleString("en-NG");
}

export function formatQuantityInput(value: string) {
  const sanitized = value.replace(/[^\d.]/g, "");
  const parts = sanitized.split(".");
  if (parts.length <= 1) return sanitized;
  return `${parts[0]}.${parts.slice(1).join("").slice(0, 6)}`;
}

export function estimateCryptoQuantity(amountNgn: number, priceNgn: number) {
  if (!amountNgn || !priceNgn) return 0;
  return amountNgn / priceNgn;
}

export function buildReference(prefix = "TXN") {
  const tail = Math.random().toString(36).toUpperCase().slice(2, 12);
  return `${prefix}${Date.now()}${tail}`;
}