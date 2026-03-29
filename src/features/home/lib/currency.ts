export function formatNaira(value: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatUsd(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatCompactAmount(value: number) {
  const absolute = Math.abs(value);

  if (absolute >= 1000000) {
    return `${value < 0 ? "-" : ""}₦${(absolute / 1000000).toFixed(1)}M`;
  }

  return `${value < 0 ? "-" : "+"}₦${absolute.toLocaleString("en-NG")}`;
}